/**
 * Action Item Tracker — board pending actions, overdue & blocked flags.
 * Model pick for Shahed review: GPT-4o — fast status/flagging logic.
 *
 * Input:  { log_run?: boolean, use_sample?: boolean }
 * Output: ActionItemTrackerAgentResponse when log_run !== false
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { chatCompletion } from "../_shared/ai-provider-routing.ts";
import {
  completeAgentRun,
  failAgentRun,
  logAgentActivity,
  resolveAgentId,
  safeStartAgentRun,
  ephemeralRunId,
} from "../_shared/agent-run-lifecycle.ts";

const AGENT_SLUG = "action-item-tracker";
const MODEL = "gpt-4o";

const SAMPLE_BOARD_ACTIONS = [
  {
    id: "sample-1",
    title: "Finalize FY27 operating budget draft for board vote",
    owner: "Patricia Okonkwo (ED)",
    due_date: "2026-04-10",
    status: "open",
    source: "sample",
  },
  {
    id: "sample-2",
    title: "Submit Kresge Foundation Q2 narrative report",
    owner: "James Liu (Development)",
    due_date: "2026-06-20",
    status: "in_progress",
    source: "sample",
  },
  {
    id: "sample-3",
    title: "Recruit two at-large board members — diversity committee shortlist",
    owner: "Maria Santos (Board Chair)",
    due_date: "2026-05-15",
    status: "blocked",
    blocker_reason: "Waiting on governance committee revised charter approval",
    source: "sample",
  },
  {
    id: "sample-4",
    title: "Approve updated conflict-of-interest policy language",
    owner: "Legal subcommittee",
    due_date: "2026-07-01",
    status: "open",
    source: "sample",
  },
  {
    id: "sample-5",
    title: "Review ED compensation benchmark study",
    owner: "Executive Committee",
    due_date: "2026-04-30",
    status: "open",
    source: "sample",
  },
  {
    id: "sample-6",
    title: "Sign off on Spring Gala reconciliation package",
    owner: "David Kim (Treasurer)",
    due_date: "2026-06-25",
    status: "open",
    source: "sample",
  },
];

const SYSTEM_PROMPT = `You are an operations analyst for Brightside Foundation, a nonprofit in Boston.
You track board and executive action items. Given a list of pending items with pre-computed flags, produce a concise status report as valid JSON only.

Response structure:
{
  "summary": "Two sentences summarizing board action health — call out overdue and blocked items by name.",
  "total_pending": 0,
  "overdue": [],
  "blocked": [],
  "due_soon": [],
  "on_track_count": 0,
  "time_saved_minutes": 15,
  "recommended_action": "One specific next step for the Executive Director or board secretary"
}

Each item in overdue/blocked/due_soon arrays:
{ "id": "string", "title": "string", "owner": "string|null", "due_date": "YYYY-MM-DD|null", "status": "string", "flag": "overdue|blocked|due_soon", "days_overdue": number|null, "days_until_due": number|null, "blocker_reason": "string|null", "source": "task|meeting_takeaway|sample" }

Rules:
- Preserve all overdue and blocked items from the input — do not drop them.
- due_soon: items due within 14 days that are not overdue.
- on_track_count: items flagged on_track in input.
- time_saved_minutes: realistic estimate (10–30) for manual board action review.
- recommended_action: name the highest-priority person and action.
- Return only JSON.`;

interface RawActionRow {
  id: string;
  title: string;
  owner: string | null;
  due_date: string | null;
  status: string;
  blocker_reason?: string | null;
  source: "task" | "meeting_takeaway" | "sample";
}

interface TrackerResult {
  summary: string;
  total_pending: number;
  overdue: RawActionRow[];
  blocked: RawActionRow[];
  due_soon: RawActionRow[];
  on_track_count: number;
  time_saved_minutes: number;
  recommended_action: string;
}

function getCorsHeaders(origin: string | null): Record<string, string> {
  const isAllowed =
    origin &&
    (origin.endsWith(".lovableproject.com") ||
      origin.endsWith(".lovable.app") ||
      origin.startsWith("http://localhost:") ||
      origin.startsWith("http://127.0.0.1:"));
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : "http://localhost:8080",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-api-key",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Max-Age": "3600",
    "Access-Control-Allow-Credentials": "true",
  };
}

function jsonResponse(
  body: unknown,
  status: number,
  corsHeaders: Record<string, string>
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function validateRequestAuth(
  req: Request,
  supabase: ReturnType<typeof createClient>
): Promise<string> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Authorization header required");
  }
  const token = authHeader.replace("Bearer ", "");
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user) {
    throw new Error(error?.message || "Invalid or expired token");
  }
  return user.id;
}

function parseJsonContent(content: string): TrackerResult {
  const cleaned = content.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned) as TrackerResult;
  } catch {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as TrackerResult;
    }
    throw new Error("Failed to parse AI response as JSON");
  }
}

function daysBetween(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

function classifyItems(items: RawActionRow[]): {
  overdue: RawActionRow[];
  blocked: RawActionRow[];
  due_soon: RawActionRow[];
  on_track: RawActionRow[];
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdue: RawActionRow[] = [];
  const blocked: RawActionRow[] = [];
  const due_soon: RawActionRow[] = [];
  const on_track: RawActionRow[] = [];

  for (const item of items) {
    const statusLower = (item.status || "").toLowerCase();
    const isBlocked =
      statusLower === "blocked" ||
      Boolean(item.blocker_reason) ||
      (item.title || "").toLowerCase().includes("[blocked]");

    if (isBlocked) {
      blocked.push({ ...item, status: "blocked" });
      continue;
    }

    if (item.due_date) {
      const due = new Date(item.due_date);
      due.setHours(0, 0, 0, 0);
      const diff = daysBetween(due, today);
      if (diff > 0) {
        overdue.push({ ...item, days_overdue: diff } as RawActionRow & { days_overdue: number });
        continue;
      }
      const until = daysBetween(today, due);
      if (until <= 14) {
        due_soon.push({ ...item, days_until_due: until } as RawActionRow & { days_until_due: number });
        continue;
      }
    }

    on_track.push(item);
  }

  return { overdue, blocked, due_soon, on_track };
}

async function gatherActionItems(
  supabase: ReturnType<typeof createClient>,
  useSample: boolean
): Promise<RawActionRow[]> {
  if (useSample) {
    return SAMPLE_BOARD_ACTIONS.map((row) => ({
      id: row.id,
      title: row.title,
      owner: row.owner,
      due_date: row.due_date,
      status: row.status,
      blocker_reason: row.blocker_reason ?? null,
      source: "sample" as const,
    }));
  }

  const rows: RawActionRow[] = [];

  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, title, status, due_date, assigned_to, metadata, description")
    .order("due_date", { ascending: true, nullsFirst: false })
    .limit(50);

  const openTasks = (tasks ?? []).filter((task) => {
    const s = (task.status ?? "").toLowerCase();
    return s !== "completed" && s !== "done" && s !== "cancelled";
  });

  for (const task of openTasks) {
    const meta = task.metadata as Record<string, unknown> | null;
    rows.push({
      id: task.id,
      title: task.title,
      owner: typeof meta?.owner_name === "string" ? meta.owner_name : null,
      due_date: task.due_date,
      status: task.status ?? "open",
      blocker_reason:
        typeof meta?.blocker_reason === "string"
          ? meta.blocker_reason
          : task.status === "blocked"
            ? task.description
            : null,
      source: "task",
    });
  }

  const { data: takeaways } = await supabase
    .from("meeting_takeaways")
    .select("id, content, assigned_to, due_date, status, priority, takeaway_type")
    .eq("takeaway_type", "action_item")
    .limit(30);

  const openTakeaways = (takeaways ?? []).filter((t) => {
    const s = (t.status ?? "").toLowerCase();
    return s !== "completed" && s !== "done" && s !== "closed";
  });

  for (const t of openTakeaways) {
    rows.push({
      id: t.id,
      title: t.content,
      owner: t.assigned_to,
      due_date: t.due_date,
      status: t.status ?? "open",
      source: "meeting_takeaway",
    });
  }

  if (rows.length === 0) {
    return gatherActionItems(supabase, true);
  }

  return rows;
}

function buildFallbackResult(classified: ReturnType<typeof classifyItems>, items: RawActionRow[]): TrackerResult {
  const overdue = classified.overdue.map((i) => ({ ...i, flag: "overdue" as const }));
  const blocked = classified.blocked.map((i) => ({ ...i, flag: "blocked" as const }));
  const due_soon = classified.due_soon.map((i) => ({ ...i, flag: "due_soon" as const }));

  const topOverdue = overdue[0]?.title ?? blocked[0]?.title ?? "board actions";
  return {
    summary: `${items.length} pending board actions tracked. ${overdue.length} overdue and ${blocked.length} blocked require immediate attention.`,
    total_pending: items.length,
    overdue,
    blocked,
    due_soon,
    on_track_count: classified.on_track.length,
    time_saved_minutes: Math.min(30, 10 + overdue.length * 3 + blocked.length * 4),
    recommended_action:
      overdue.length > 0
        ? `Escalate overdue item to the owner: "${topOverdue}" — schedule a 15-minute check-in this week.`
        : blocked.length > 0
          ? `Unblock "${blocked[0].title}" — confirm dependency status with ${blocked[0].owner ?? "the owner"}.`
          : "Review due-soon items in the task board and confirm owners before Friday.",
  };
}

async function analyzeWithModel(
  supabase: ReturnType<typeof createClient>,
  items: RawActionRow[],
  classified: ReturnType<typeof classifyItems>
): Promise<{ result: TrackerResult; inputTokens: number; outputTokens: number; provider: string }> {
  const prepped = {
    items,
    classified_counts: {
      overdue: classified.overdue.length,
      blocked: classified.blocked.length,
      due_soon: classified.due_soon.length,
      on_track: classified.on_track.length,
    },
    today: new Date().toISOString().slice(0, 10),
  };

  const { data: modelRow } = await supabase
    .from("ai_models")
    .select("id")
    .eq("model_id", MODEL)
    .eq("enabled", true)
    .maybeSingle();

  try {
    const completion = await chatCompletion(
      supabase,
      {
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Analyze these board action items and produce the JSON report:\n\n${JSON.stringify(prepped, null, 2)}`,
          },
        ],
        temperature: 0.2,
        max_tokens: 2500,
        model: MODEL,
      },
      modelRow?.id
    );

    const parsed = parseJsonContent(completion.content);
    return {
      result: {
        ...parsed,
        total_pending: parsed.total_pending ?? items.length,
        on_track_count: parsed.on_track_count ?? classified.on_track.length,
        time_saved_minutes:
          typeof parsed.time_saved_minutes === "number" && parsed.time_saved_minutes > 0
            ? Math.round(parsed.time_saved_minutes)
            : buildFallbackResult(classified, items).time_saved_minutes,
        recommended_action:
          parsed.recommended_action?.trim() || buildFallbackResult(classified, items).recommended_action,
      },
      inputTokens: completion.input_tokens,
      outputTokens: completion.output_tokens,
      provider: "chat-routing",
    };
  } catch (err) {
    console.warn("[action-item-tracker] AI failed, using rule-based fallback:", err);
    return {
      result: buildFallbackResult(classified, items),
      inputTokens: 0,
      outputTokens: 0,
      provider: "rules-fallback",
    };
  }
}

serve(async (req) => {
  const origin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method === "GET") {
    return jsonResponse({ ok: true, function: AGENT_SLUG }, 200, corsHeaders);
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405, corsHeaders);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  let authUserId: string | null = null;
  try {
    authUserId = await validateRequestAuth(req, supabase);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    return jsonResponse({ error: "unauthorized", message }, 401, corsHeaders);
  }

  const startTime = Date.now();
  let runId: string | null = null;
  let logRun = true;

  try {
    let body: { log_run?: boolean; use_sample?: boolean; ping?: boolean } = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    if (body.ping === true) {
      return jsonResponse({ ok: true, message: `${AGENT_SLUG} is ready` }, 200, corsHeaders);
    }

    logRun = body.log_run !== false;
    const useSample = body.use_sample === true;

    const agentId = logRun && authUserId ? await resolveAgentId(supabase, AGENT_SLUG) : null;

    if (logRun && authUserId && agentId) {
      runId = await safeStartAgentRun(supabase, {
        agentId,
        userId: authUserId,
        input: { use_sample: useSample },
        context: { agent_slug: AGENT_SLUG },
      });
    }

    const items = await gatherActionItems(supabase, useSample);
    const classified = classifyItems(items);
    const { result, inputTokens, outputTokens, provider } = await analyzeWithModel(
      supabase,
      items,
      classified
    );

    const latencyMs = Date.now() - startTime;
    const findingsCount =
      result.overdue.length + result.blocked.length + result.due_soon.length;

    if (runId && authUserId && agentId) {
      await completeAgentRun(supabase, {
        runId,
        output: result as unknown as Record<string, unknown>,
        metadata: {
          agent_slug: AGENT_SLUG,
          time_saved_minutes: result.time_saved_minutes,
          recommended_action: result.recommended_action,
          findings_count: findingsCount,
          total_pending: result.total_pending,
          overdue_count: result.overdue.length,
          blocked_count: result.blocked.length,
        },
        modelUsed: MODEL,
        providerUsed: provider,
        latencyMs,
        tokenMetrics: { prompt_tokens: inputTokens, completion_tokens: outputTokens },
      });

      await logAgentActivity(supabase, authUserId, {
        agent_slug: AGENT_SLUG,
        agent_run_id: runId,
        time_saved_minutes: result.time_saved_minutes,
        recommended_action: result.recommended_action,
        findings_count: findingsCount,
        model: MODEL,
        provider,
      });
    }

    if (logRun) {
      return jsonResponse(
        {
          run_id: runId ?? ephemeralRunId(AGENT_SLUG),
          result,
          time_saved_minutes: result.time_saved_minutes,
          recommended_action: result.recommended_action,
          model: MODEL,
          provider,
          latency_ms: latencyMs,
        },
        200,
        corsHeaders
      );
    }

    return jsonResponse(result, 200, corsHeaders);
  } catch (error) {
    if (runId) {
      await failAgentRun(supabase, {
        runId,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        latencyMs: Date.now() - startTime,
      });
    }
    console.error("[action-item-tracker] Error:", error);
    const items = await gatherActionItems(supabase, true);
    const classified = classifyItems(items);
    const result = buildFallbackResult(classified, items);
    if (logRun) {
      return jsonResponse(
        {
          run_id: ephemeralRunId(AGENT_SLUG),
          result,
          time_saved_minutes: result.time_saved_minutes,
          recommended_action: result.recommended_action,
          model: MODEL,
          provider: "rules-fallback",
          latency_ms: Date.now() - startTime,
        },
        200,
        corsHeaders
      );
    }
    return jsonResponse(result, 200, corsHeaders);
  }
});
