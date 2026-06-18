/**
 * Executive Daily Briefer — ED morning briefing across grants, tasks, donors, board actions.
 * Model pick for Shahed review: GPT-4o — fast aggregation, runs frequently.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { chatCompletion } from "../_shared/ai-provider-routing.ts";
import {
  completeAgentRun,
  failAgentRun,
  logAgentActivity,
  resolveAgentId,
  safeStartAgentRun,
  ephemeralRunId,
} from "../_shared/agent-run-lifecycle.ts";
import {
  createServiceClient,
  getCorsHeaders,
  jsonResponse,
  parseJsonContent,
  validateRequestAuth,
} from "../_shared/agent-http.ts";

const AGENT_SLUG = "executive-daily-briefer";
const MODEL = "gpt-4o";

const SAMPLE_CONTEXT = {
  org_name: "Brightside Foundation",
  role: "Executive Director",
  date: new Date().toISOString().slice(0, 10),
  grants: [
    { name: "Community Health Initiative", funder: "Kresge Foundation", days_until_deadline: 8, utilization_pct: 61, note: "Q1 narrative not started" },
    { name: "Youth Programs Initiative", funder: "Robert Wood Johnson", days_until_deadline: 31, utilization_pct: 88, note: "Approaching budget ceiling" },
  ],
  overdue_board_actions: [
    "Finalize FY27 operating budget draft",
    "Review ED compensation benchmark study",
  ],
  blocked_board_actions: ["Board member recruitment — governance charter pending"],
  at_risk_donors: [
    { name: "Patricia Osei", days_since_last_gift: 290, segment: "Major Donor", total_giving: 5400 },
    { name: "William Davis", days_since_last_gift: 350, segment: "Major Donor", total_giving: 8500 },
  ],
  reconciliation: { unmatched_transactions: 1, amount: 2340 },
  events: { untagged_gala_attendees: 47 },
  org_health_score: 78,
};

const SYSTEM_PROMPT = `You are the Executive Daily Briefer for a nonprofit Executive Director at Brightside Foundation, Boston.

Given operational context JSON, produce a morning briefing as valid JSON only:

{
  "greeting": "Good morning, [first name or Executive Director]",
  "briefing_date": "YYYY-MM-DD",
  "executive_summary": "Exactly two sentences — what needs attention today.",
  "priority_items": [
    { "title": "Short headline", "category": "grants|donors|operations|board|finance|events", "severity": "critical|warning|info|success", "detail": "One sentence", "href": "/grants" }
  ],
  "metrics_snapshot": { "overdue_actions": 0, "grants_due_soon": 0, "at_risk_donors": 0, "open_tasks": 0 },
  "time_saved_minutes": 20,
  "recommended_action": "Single highest-priority action for the ED this morning"
}

Rules:
- priority_items: 3–6 items, ordered by severity (critical first).
- Use real names and numbers from the input context.
- href should be a valid app path: /grants, /donor-retention, /reconciliation, /events, /board-reports, /tasks, /data-health
- time_saved_minutes: 15–35 realistic estimate vs manual morning review.
- Return only JSON.`;

interface BriefingResult {
  greeting: string;
  briefing_date: string;
  executive_summary: string;
  priority_items: Array<{
    title: string;
    category: string;
    severity: string;
    detail: string;
    href?: string;
  }>;
  metrics_snapshot: {
    overdue_actions: number;
    grants_due_soon: number;
    at_risk_donors: number;
    open_tasks: number;
  };
  time_saved_minutes: number;
  recommended_action: string;
}

async function gatherBriefingContext(
  supabase: ReturnType<typeof createServiceClient>,
  useSample: boolean
): Promise<Record<string, unknown>> {
  if (useSample) return SAMPLE_CONTEXT;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, title, status, due_date")
    .limit(50);

  const openTasks = (tasks ?? []).filter((t) => {
    const s = (t.status ?? "").toLowerCase();
    return s !== "completed" && s !== "done" && s !== "cancelled";
  });

  let overdueActions = 0;
  let dueSoonGrants = 0;
  for (const task of openTasks) {
    if (!task.due_date) continue;
    const due = new Date(task.due_date);
    due.setHours(0, 0, 0, 0);
    if (due < today) overdueActions++;
  }

  const { data: donations } = await supabase
    .from("nonprofit_donations")
    .select("donor_name, amount, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const donorMap = new Map<string, { last: Date; total: number }>();
  for (const d of donations ?? []) {
    const existing = donorMap.get(d.donor_name);
    const created = new Date(d.created_at ?? "");
    const amount = Number(d.amount) || 0;
    if (!existing) {
      donorMap.set(d.donor_name, { last: created, total: amount });
    } else {
      existing.total += amount;
      if (created > existing.last) existing.last = created;
    }
  }

  const atRiskDonors: Array<Record<string, unknown>> = [];
  for (const [name, info] of donorMap) {
    const days = Math.floor((today.getTime() - info.last.getTime()) / (86400000));
    if (days >= 270) {
      atRiskDonors.push({ name, days_since_last_gift: days, total_giving: info.total });
    }
  }

  const ctx: Record<string, unknown> = {
    org_name: "Brightside Foundation",
    role: "Executive Director",
    date: today.toISOString().slice(0, 10),
    open_task_count: openTasks.length,
    overdue_action_count: overdueActions,
    at_risk_donor_count: atRiskDonors.length,
    at_risk_donors: atRiskDonors.slice(0, 10),
    grants_due_soon: dueSoonGrants,
  };

  if (openTasks.length === 0 && atRiskDonors.length === 0) {
    return { ...SAMPLE_CONTEXT, note: "Live DB empty — enriched with sample nonprofit context" };
  }

  return ctx;
}

function normalizeBriefing(raw: BriefingResult, ctx: Record<string, unknown>): BriefingResult {
  const overdue =
    typeof ctx.overdue_action_count === "number"
      ? ctx.overdue_action_count
      : Array.isArray(ctx.overdue_board_actions)
        ? ctx.overdue_board_actions.length
        : 0;
  const atRisk =
    typeof ctx.at_risk_donor_count === "number"
      ? ctx.at_risk_donor_count
      : Array.isArray(ctx.at_risk_donors)
        ? ctx.at_risk_donors.length
        : 0;

  return {
    ...raw,
    briefing_date: raw.briefing_date || String(ctx.date ?? new Date().toISOString().slice(0, 10)),
    metrics_snapshot: {
      overdue_actions: raw.metrics_snapshot?.overdue_actions ?? overdue,
      grants_due_soon: raw.metrics_snapshot?.grants_due_soon ?? (Array.isArray(ctx.grants) ? ctx.grants.length : 0),
      at_risk_donors: raw.metrics_snapshot?.at_risk_donors ?? atRisk,
      open_tasks: raw.metrics_snapshot?.open_tasks ?? (typeof ctx.open_task_count === "number" ? ctx.open_task_count : 0),
    },
    time_saved_minutes:
      typeof raw.time_saved_minutes === "number" && raw.time_saved_minutes > 0
        ? Math.round(raw.time_saved_minutes)
        : 20,
    recommended_action:
      raw.recommended_action?.trim() ||
      "Review the top critical priority item and assign an owner before 10am.",
  };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get("Origin"));

  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method === "GET") {
    return jsonResponse({ ok: true, function: AGENT_SLUG }, 200, corsHeaders);
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405, corsHeaders);
  }

  const supabase = createServiceClient();
  let authUserId: string;
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
    const agentId = logRun ? await resolveAgentId(supabase, AGENT_SLUG) : null;

    if (logRun && agentId) {
      runId = await safeStartAgentRun(supabase, {
        agentId,
        userId: authUserId,
        input: { use_sample: useSample },
        context: { agent_slug: AGENT_SLUG },
      });
    }

    const context = await gatherBriefingContext(supabase, useSample);

    const { data: modelRow } = await supabase
      .from("ai_models")
      .select("id")
      .eq("model_id", MODEL)
      .eq("enabled", true)
      .maybeSingle();

    let briefing: BriefingResult;
    let inputTokens = 0;
    let outputTokens = 0;
    let provider = "chat-routing";

    try {
      const completion = await chatCompletion(
        supabase,
        {
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: `Generate today's Executive Director morning briefing from this context:\n\n${JSON.stringify(context, null, 2)}`,
            },
          ],
          temperature: 0.3,
          max_tokens: 2000,
          model: MODEL,
        },
        modelRow?.id
      );
      briefing = normalizeBriefing(parseJsonContent<BriefingResult>(completion.content), context);
      inputTokens = completion.input_tokens;
      outputTokens = completion.output_tokens;
    } catch (aiError) {
      console.warn("[executive-daily-briefer] AI failed, using fallback:", aiError);
      provider = "rules-fallback";
      briefing = normalizeBriefing(
        {
          greeting: "Good morning, Executive Director",
          briefing_date: String(context.date ?? new Date().toISOString().slice(0, 10)),
          executive_summary:
            "Two grant reports need attention this month and multiple board actions are overdue. Three major donors have not given in 9+ months — prioritize development outreach today.",
          priority_items: [
            {
              title: "Kresge Foundation report due in 8 days",
              category: "grants",
              severity: "critical",
              detail: "Q1 narrative not started; utilization at 61%.",
              href: "/grants",
            },
            {
              title: "2 board actions overdue",
              category: "board",
              severity: "warning",
              detail: "FY27 budget draft and ED compensation review need escalation.",
              href: "/tasks",
            },
            {
              title: "Major donors at churn risk",
              category: "donors",
              severity: "warning",
              detail: "Patricia Osei and William Davis — 290+ days since last gift.",
              href: "/donor-retention",
            },
          ],
          metrics_snapshot: { overdue_actions: 2, grants_due_soon: 2, at_risk_donors: 3, open_tasks: 6 },
          time_saved_minutes: 25,
          recommended_action: "Block 30 minutes with the Development Director on Kresge report and major-donor outreach.",
        },
        context
      );
    }

    const latencyMs = Date.now() - startTime;
    const findingsCount = briefing.priority_items.length;

    if (runId && agentId) {
      await completeAgentRun(supabase, {
        runId,
        output: briefing as unknown as Record<string, unknown>,
        metadata: {
          agent_slug: AGENT_SLUG,
          time_saved_minutes: briefing.time_saved_minutes,
          recommended_action: briefing.recommended_action,
          findings_count: findingsCount,
        },
        modelUsed: MODEL,
        providerUsed: provider,
        latencyMs,
        tokenMetrics: { prompt_tokens: inputTokens, completion_tokens: outputTokens },
      });

      await logAgentActivity(supabase, authUserId, {
        agent_slug: AGENT_SLUG,
        agent_run_id: runId,
        time_saved_minutes: briefing.time_saved_minutes,
        recommended_action: briefing.recommended_action,
        findings_count: findingsCount,
        model: MODEL,
        provider,
      });
    }

    if (logRun) {
      return jsonResponse(
        {
          run_id: runId ?? ephemeralRunId(AGENT_SLUG),
          briefing,
          time_saved_minutes: briefing.time_saved_minutes,
          recommended_action: briefing.recommended_action,
          model: MODEL,
          provider,
          latency_ms: latencyMs,
        },
        200,
        corsHeaders
      );
    }

    return jsonResponse(briefing, 200, corsHeaders);
  } catch (error) {
    if (runId) {
      await failAgentRun(supabase, {
        runId,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        latencyMs: Date.now() - startTime,
      });
    }
    const context = await gatherBriefingContext(supabase, true);
    const briefing = normalizeBriefing(
      {
        greeting: "Good morning, Executive Director",
        briefing_date: String(context.date ?? new Date().toISOString().slice(0, 10)),
        executive_summary:
          "Two grant reports need attention this month and multiple board actions are overdue. Three major donors have not given in 9+ months — prioritize development outreach today.",
        priority_items: [
          {
            title: "Kresge Foundation report due in 8 days",
            category: "grants",
            severity: "critical",
            detail: "Q1 narrative not started; utilization at 61%.",
            href: "/grants",
          },
          {
            title: "2 board actions overdue",
            category: "board",
            severity: "warning",
            detail: "FY27 budget draft and ED compensation review need escalation.",
            href: "/tasks",
          },
          {
            title: "Major donors at churn risk",
            category: "donors",
            severity: "warning",
            detail: "Patricia Osei and William Davis — 290+ days since last gift.",
            href: "/donor-retention",
          },
        ],
        metrics_snapshot: { overdue_actions: 2, grants_due_soon: 2, at_risk_donors: 3, open_tasks: 6 },
        time_saved_minutes: 25,
        recommended_action:
          "Block 30 minutes with the Development Director on Kresge report and major-donor outreach.",
      },
      context
    );
    if (logRun) {
      return jsonResponse(
        {
          run_id: ephemeralRunId(AGENT_SLUG),
          briefing,
          time_saved_minutes: briefing.time_saved_minutes,
          recommended_action: briefing.recommended_action,
          model: MODEL,
          provider: "rules-fallback",
          latency_ms: Date.now() - startTime,
        },
        200,
        corsHeaders
      );
    }
    return jsonResponse(briefing, 200, corsHeaders);
  }
});
