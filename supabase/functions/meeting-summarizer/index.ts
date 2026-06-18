/**
 * Meeting Summarizer Edge Function
 *
 * Accepts a raw meeting transcript and returns structured board minutes via Claude Sonnet.
 * Input:  { transcript?: string, meeting_id?: string, meetingId?: string, log_run?: boolean }
 * Output: MeetingSummarizerAgentResponse when log_run is true (default), else legacy MeetingSummary JSON
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { chatCompletion, logUsage } from "../_shared/ai-provider-routing.ts";
import {
  completeAgentRun,
  failAgentRun,
  logAgentActivity,
  resolveAgentId,
  safeStartAgentRun,
  ephemeralRunId,
} from "../_shared/agent-run-lifecycle.ts";
import { buildMeetingSummaryFallback } from "../_shared/meeting-summary-fallback.ts";

const AGENT_SLUG = "meeting-summarizer";

// Inline CORS (bundler cannot resolve imports outside functions/)
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

async function validateRequestAuth(
  req: Request,
  supabase: ReturnType<typeof createClient>
): Promise<string> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Authorization header required");
  }
  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    throw new Error(error?.message || "Invalid or expired token");
  }
  return user.id;
}

const MODEL = "claude-sonnet-4-20250514"; // Model pick for Shahed review: Claude Sonnet — best for long board transcripts
const MAX_INPUT_CHARS = 12000;
const MAX_TRANSCRIPT_CHARS = 50000;
const LOVABLE_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const SYSTEM_PROMPT = `You are an expert meeting minutes writer for Brightside Foundation, a nonprofit organization in Boston.

Given a board or staff meeting transcript, produce structured minutes as valid JSON only — no markdown fences, no commentary outside the JSON object.

Your response must match this exact structure:
{
  "executive_summary": "Exactly three complete sentences summarizing the meeting outcomes.",
  "decisions": ["Decision 1", "Decision 2"],
  "action_items": [
    { "task": "Description of the action", "owner": "Person name or null", "deadline": "Date or timeframe or null" }
  ],
  "attendance": ["Name (Role) — present", "Name (Role) — absent"],
  "key_discussion_points": ["Topic discussed without a formal decision"],
  "time_saved_minutes": 45,
  "recommended_action": "One clear sentence telling staff what to do next with these minutes"
}

Rules:
- executive_summary must be exactly three sentences.
- decisions: only formal decisions approved or agreed by the board.
- action_items: extract every assigned task with owner and deadline when stated; use null when unknown.
- attendance: infer from roll call, introductions, or speaker presence; note absent members if mentioned.
- key_discussion_points: substantive discussion that did not result in a recorded decision.
- time_saved_minutes: realistic estimate of staff time saved vs writing minutes manually (typically 30–90 for board meetings).
- recommended_action: one specific next step (e.g. assign action items, send summary to board, schedule follow-up).
- Be factual; use names from the transcript; flag unclear items with [UNCLEAR] in the relevant field.
- Return only the JSON object.`;

interface MeetingSummaryActionItem {
  task: string;
  owner: string | null;
  deadline: string | null;
}

interface MeetingSummary {
  executive_summary: string;
  decisions: string[];
  action_items: MeetingSummaryActionItem[];
  attendance: string[];
  key_discussion_points: string[];
  time_saved_minutes?: number;
  recommended_action?: string;
}

interface AiCallResult {
  content: string;
  inputTokens: number;
  outputTokens: number;
  provider: string;
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

function parseSummaryContent(content: string): MeetingSummary {
  const cleaned = content.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned) as MeetingSummary;
  } catch {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as MeetingSummary;
    }
    throw new Error("Failed to parse AI response as JSON");
  }
}

function buildUserMessage(transcript: string): string {
  return `Analyze this meeting transcript and produce structured minutes:\n\n${transcript}`;
}

async function callAnthropicDirect(
  apiKey: string,
  transcript: string
): Promise<AiCallResult> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 3000,
      temperature: 0.2,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserMessage(transcript) }],
    }),
  });

  if (response.status === 429) {
    throw new Error("Rate limit exceeded — please try again shortly.");
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[meeting-summarizer] Anthropic API error:", response.status, errorText);
    throw new Error("AI service error — please try again.");
  }

  const data = await response.json();
  const content =
    data.content?.[0]?.text ??
    data.content?.find((block: { type: string }) => block.type === "text")?.text ??
    "";

  if (!content) {
    throw new Error("Empty response from AI service");
  }

  return {
    content,
    inputTokens: data.usage?.input_tokens ?? 0,
    outputTokens: data.usage?.output_tokens ?? 0,
    provider: "anthropic",
  };
}

async function callLovableGateway(
  apiKey: string,
  transcript: string
): Promise<AiCallResult> {
  const response = await fetch(LOVABLE_GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_completion_tokens: 3000,
      temperature: 0.2,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserMessage(transcript) },
      ],
    }),
  });

  if (response.status === 429) {
    throw new Error("Rate limit exceeded — please try again shortly.");
  }
  if (response.status === 402) {
    throw new Error("AI credits exhausted — please add funds.");
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[meeting-summarizer] Lovable gateway error:", response.status, errorText);
    throw new Error("AI service error — please try again.");
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? "";

  if (!content) {
    throw new Error("Empty response from AI service");
  }

  return {
    content,
    inputTokens: data.usage?.prompt_tokens ?? 0,
    outputTokens: data.usage?.completion_tokens ?? 0,
    provider: "lovable",
  };
}

async function generateWithChatRouting(
  supabase: ReturnType<typeof createClient>,
  transcript: string
): Promise<AiCallResult> {
  const { data: sonnetModel } = await supabase
    .from("ai_models")
    .select("id")
    .eq("model_id", MODEL)
    .eq("enabled", true)
    .maybeSingle();

  const result = await chatCompletion(
    supabase,
    {
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserMessage(transcript) },
      ],
      temperature: 0.2,
      max_tokens: 3000,
      model: MODEL,
    },
    sonnetModel?.id
  );

  return {
    content: result.content,
    inputTokens: result.input_tokens,
    outputTokens: result.output_tokens,
    provider: "chat-routing",
  };
}

async function resolveAnthropicApiKey(
  supabase: ReturnType<typeof createClient>
): Promise<string | null> {
  const envKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (envKey) return envKey;

  const configKeys = ["integrations.anthropic_api_key", "integrations.anthropic.api_key"];
  for (const key of configKeys) {
    const { data } = await supabase.from("app_config").select("value").eq("key", key).maybeSingle();
    if (data?.value) {
      const value = data.value;
      if (typeof value === "string" && value.trim()) return value;
      if (typeof value === "object" && value !== null) {
        const record = value as Record<string, unknown>;
        if (typeof record.api_key === "string" && record.api_key.trim()) {
          return record.api_key;
        }
      }
    }
  }

  const { data: aiProvider } = await supabase
    .from("ai_providers")
    .select("integration_provider_id")
    .eq("slug", "anthropic")
    .maybeSingle();

  if (aiProvider?.integration_provider_id) {
    const { data: orgIntegration } = await supabase
      .from("organization_integrations")
      .select("config")
      .eq("provider_id", aiProvider.integration_provider_id)
      .maybeSingle();

    const orgApiKey = orgIntegration?.config?.api_key;
    if (typeof orgApiKey === "string" && orgApiKey.trim()) {
      return orgApiKey;
    }
  }

  return null;
}

async function summarizeTranscript(
  supabase: ReturnType<typeof createClient>,
  transcript: string
): Promise<AiCallResult> {
  const truncated = transcript.slice(0, MAX_INPUT_CHARS);
  const errors: string[] = [];

  // 1. Shared provider routing (env, app_config, organization_integrations)
  try {
    return await generateWithChatRouting(supabase, truncated);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn("[meeting-summarizer] chatCompletion failed:", message);
    errors.push(message);
  }

  // 2. Direct Anthropic API when a key is configured outside routing defaults
  const anthropicKey = await resolveAnthropicApiKey(supabase);
  if (anthropicKey) {
    try {
      return await callAnthropicDirect(anthropicKey, truncated);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn("[meeting-summarizer] Direct Anthropic failed:", message);
      errors.push(message);
    }
  }

  // 3. Lovable AI gateway — platform default on Lovable Cloud (Claude Sonnet 4)
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  if (lovableKey) {
    try {
      return await callLovableGateway(lovableKey, truncated);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn("[meeting-summarizer] Lovable gateway failed:", message);
      errors.push(message);
    }
  }

  console.error("[meeting-summarizer] All providers failed:", errors);
  return {
    content: JSON.stringify(buildMeetingSummaryFallback(transcript)),
    inputTokens: 0,
    outputTokens: 0,
    provider: "heuristic-fallback",
  };
}

async function fetchTranscriptForMeeting(
  supabase: ReturnType<typeof createClient>,
  meetingId: string
): Promise<{ transcript: string; meetingTitle: string | null }> {
  const { data: meeting } = await supabase
    .from("meetings")
    .select("id, title")
    .eq("id", meetingId)
    .maybeSingle();

  if (!meeting) {
    throw new Error("Meeting not found");
  }

  const { data: transcriptRow } = await supabase
    .from("meeting_transcripts")
    .select("content")
    .eq("meeting_id", meetingId)
    .maybeSingle();

  let transcriptContent = transcriptRow?.content?.trim() ?? "";

  if (!transcriptContent) {
    const { data: zoomFile } = await supabase
      .from("zoom_files")
      .select("transcript_text")
      .eq("meeting_id", meetingId)
      .not("transcript_text", "is", null)
      .limit(1)
      .maybeSingle();

    transcriptContent = zoomFile?.transcript_text?.trim() ?? "";
  }

  if (!transcriptContent) {
    throw new Error("No transcript found for this meeting");
  }

  return { transcript: transcriptContent, meetingTitle: meeting.title ?? null };
}

function normalizeSummary(summary: MeetingSummary): MeetingSummary {
  const actionCount = summary.action_items?.length ?? 0;
  const decisionCount = summary.decisions?.length ?? 0;
  const defaultTimeSaved = Math.min(90, Math.max(25, 20 + actionCount * 5 + decisionCount * 3));

  return {
    ...summary,
    time_saved_minutes:
      typeof summary.time_saved_minutes === "number" && summary.time_saved_minutes > 0
        ? Math.round(summary.time_saved_minutes)
        : defaultTimeSaved,
    recommended_action:
      summary.recommended_action?.trim() ||
      (actionCount > 0
        ? `Review and assign ${actionCount} extracted action item${actionCount === 1 ? "" : "s"} to owners.`
        : "Share the executive summary with the board and file minutes in the board packet."),
  };
}

serve(async (req) => {
  const origin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed", message: "POST required" }, 405, corsHeaders);
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

  try {
    let body: {
      transcript?: string;
      meeting_id?: string;
      meetingId?: string;
      log_run?: boolean;
    };
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: "invalid_json", message: "Invalid JSON body" }, 400, corsHeaders);
    }

    const logRun = body.log_run !== false;
    const meetingId =
      typeof body.meeting_id === "string"
        ? body.meeting_id.trim()
        : typeof body.meetingId === "string"
          ? body.meetingId.trim()
          : "";

    let transcript = typeof body.transcript === "string" ? body.transcript.trim() : "";
    let meetingTitle: string | null = null;

    if (!transcript && meetingId) {
      const fetched = await fetchTranscriptForMeeting(supabase, meetingId);
      transcript = fetched.transcript;
      meetingTitle = fetched.meetingTitle;
    }

    if (!transcript) {
      return jsonResponse(
        { error: "missing_transcript", message: "transcript or meeting_id is required" },
        400,
        corsHeaders
      );
    }

    if (transcript.length > MAX_TRANSCRIPT_CHARS) {
      return jsonResponse(
        {
          error: "transcript_too_long",
          message: `Transcript exceeds ${MAX_TRANSCRIPT_CHARS} characters`,
        },
        400,
        corsHeaders
      );
    }

    const startTime = Date.now();
    let runId: string | null = null;
    const agentId = logRun && authUserId ? await resolveAgentId(supabase, AGENT_SLUG) : null;

    if (logRun && authUserId && agentId) {
      runId = await safeStartAgentRun(supabase, {
        agentId,
        userId: authUserId,
        input: {
          meeting_id: meetingId || null,
          transcript_chars: transcript.length,
          meeting_title: meetingTitle,
        },
        context: { agent_slug: AGENT_SLUG, meeting_id: meetingId || null },
      });
    }

    try {
      const { content, inputTokens, outputTokens, provider } = await summarizeTranscript(
        supabase,
        transcript
      );
      const summary = normalizeSummary(parseSummaryContent(content));
      const latencyMs = Date.now() - startTime;

      console.log(`[meeting-summarizer] Success via ${provider}`);

      await logUsage(
        supabase,
        authUserId,
        null,
        AGENT_SLUG,
        inputTokens,
        outputTokens,
        0,
        0
      );

      if (runId && authUserId && agentId) {
        const findingsCount =
          summary.action_items.length + summary.decisions.length + summary.key_discussion_points.length;

        await completeAgentRun(supabase, {
          runId,
          output: summary as unknown as Record<string, unknown>,
          metadata: {
            agent_slug: AGENT_SLUG,
            time_saved_minutes: summary.time_saved_minutes,
            recommended_action: summary.recommended_action,
            findings_count: findingsCount,
            meeting_id: meetingId || null,
            meeting_title: meetingTitle,
          },
          modelUsed: MODEL,
          providerUsed: provider,
          latencyMs,
          tokenMetrics: { prompt_tokens: inputTokens, completion_tokens: outputTokens },
        });

        await logAgentActivity(supabase, authUserId, {
          agent_slug: AGENT_SLUG,
          agent_run_id: runId,
          time_saved_minutes: summary.time_saved_minutes ?? 0,
          recommended_action: summary.recommended_action ?? "",
          findings_count: findingsCount,
          meeting_id: meetingId || undefined,
          model: MODEL,
          provider,
        });
      }

      if (logRun) {
        return jsonResponse(
          {
            run_id: runId ?? ephemeralRunId(AGENT_SLUG),
            summary,
            time_saved_minutes: summary.time_saved_minutes,
            recommended_action: summary.recommended_action,
            model: MODEL,
            provider,
            latency_ms: latencyMs,
            meeting_id: meetingId || null,
          },
          200,
          corsHeaders
        );
      }

      // Legacy shape for health checks / DeploymentStatus probes
      return jsonResponse(summary, 200, corsHeaders);
    } catch (innerError) {
      console.warn("[meeting-summarizer] inner error, heuristic fallback:", innerError);
      const summary = normalizeSummary(
        buildMeetingSummaryFallback(transcript) as MeetingSummary
      );
      const latencyMs = Date.now() - startTime;
      const provider = "heuristic-fallback";

      if (runId && authUserId && agentId) {
        await completeAgentRun(supabase, {
          runId,
          output: summary as unknown as Record<string, unknown>,
          metadata: {
            agent_slug: AGENT_SLUG,
            time_saved_minutes: summary.time_saved_minutes,
            recommended_action: summary.recommended_action,
            findings_count:
              summary.action_items.length +
              summary.decisions.length +
              summary.key_discussion_points.length,
          },
          modelUsed: MODEL,
          providerUsed: provider,
          latencyMs,
        });
      }

      if (logRun) {
        return jsonResponse(
          {
            run_id: runId ?? ephemeralRunId(AGENT_SLUG),
            summary,
            time_saved_minutes: summary.time_saved_minutes,
            recommended_action: summary.recommended_action,
            model: MODEL,
            provider,
            latency_ms: latencyMs,
            meeting_id: meetingId || null,
          },
          200,
          corsHeaders
        );
      }

      return jsonResponse(summary, 200, corsHeaders);
    }
  } catch (error) {
    console.error("[meeting-summarizer] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.includes("transcript") || message.includes("meeting_id") || message.includes("required")) {
      return jsonResponse({ error: "missing_transcript", message }, 400, corsHeaders);
    }
    return jsonResponse({ error: "summarizer_failed", message }, 500, corsHeaders);
  }
});
