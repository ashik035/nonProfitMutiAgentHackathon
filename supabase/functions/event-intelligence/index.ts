import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EVENT_SYSTEM_PROMPT = `You are the Event Intelligence Assistant for Brightside Foundation, a nonprofit organization. You have knowledge of the following events and data:

**Spring Gala 2026** (April 3, 2026 — The Boston Marriott Copley Place)
- 247 attendees: 187 existing donors, 42 prospects, 18 new contacts
- Revenue raised: $142,000
- 47 attendees not yet thanked
- 12 expressed volunteer interest
- 8 identified as mid-level upgrade prospects
- Program Officer contacts: Maria Santos, Kevin Park, Lisa Chen

**Volunteer Orientation** (March 15, 2026 — Brightside Foundation HQ)
- 34 attendees, 28 new volunteers, 3 donors converted
- Volunteer retention rate: 78%

**Key Metrics (YTD)**
- Total attendees: 281
- Events this quarter: 2
- Donors acquired from events: 21
- Follow-ups pending: 47

Provide concise, actionable recommendations for nonprofit event management. Focus on donor engagement, follow-up prioritization, and volunteer retention. Keep responses under 200 words.`;

/** Lovable gateway model id (deployed on Lovable Cloud). */
const MEETING_SUMMARIZER_MODEL = "anthropic/claude-sonnet-4-20250514";
const EVENT_QA_MODEL = "google/gemini-3-flash-preview";
const MAX_TRANSCRIPT_CHARS = 12000;
const LOVABLE_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const MEETING_SUMMARIZER_SYSTEM_PROMPT = `You are an expert meeting minutes writer for Brightside Foundation, a nonprofit organization in Boston.

Given a board or staff meeting transcript, produce structured minutes as valid JSON only — no markdown fences, no commentary outside the JSON object.

Your response must match this exact structure:
{
  "executive_summary": "Exactly three complete sentences summarizing the meeting outcomes.",
  "decisions": ["Decision 1", "Decision 2"],
  "action_items": [
    { "task": "Description of the action", "owner": "Person name or null", "deadline": "Date or timeframe or null" }
  ],
  "attendance": ["Name (Role) — present", "Name (Role) — absent"],
  "key_discussion_points": ["Topic discussed without a formal decision"]
}

Rules:
- executive_summary must be exactly three sentences.
- decisions: only formal decisions approved or agreed by the board.
- action_items: extract every assigned task with owner and deadline when stated; use null when unknown.
- attendance: infer from roll call, introductions, or speaker presence; note absent members if mentioned.
- key_discussion_points: substantive discussion that did not result in a recorded decision.
- Be factual; use names from the transcript; flag unclear items with [UNCLEAR] in the relevant field.
- Return only the JSON object.`;

interface LovableGatewayError extends Error {
  status?: number;
}

function parseSummaryContent(content: string): Record<string, unknown> {
  const cleaned = content.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned) as Record<string, unknown>;
  } catch {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as Record<string, unknown>;
    }
    throw new Error("Failed to parse AI response as JSON");
  }
}

async function callLovableGateway(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userContent: string,
  maxTokens: number
): Promise<string> {
  const response = await fetch(LOVABLE_GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      max_completion_tokens: maxTokens,
      temperature: model.includes("claude") || model.includes("anthropic") ? 0.2 : 0.7,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("AI gateway error:", response.status, text);
    const err: LovableGatewayError = new Error(`AI gateway error: ${response.status}`);
    err.status = response.status;
    throw err;
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const mode: string = body.mode ?? "event_question";

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    if (mode === "meeting_summary") {
      const transcript: string = body.transcript ?? "";
      if (!transcript.trim()) {
        return new Response(JSON.stringify({ error: "transcript is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const clipped =
        transcript.length > MAX_TRANSCRIPT_CHARS
          ? transcript.slice(0, MAX_TRANSCRIPT_CHARS)
          : transcript;

      const content = await callLovableGateway(
        LOVABLE_API_KEY,
        MEETING_SUMMARIZER_MODEL,
        MEETING_SUMMARIZER_SYSTEM_PROMPT,
        `Analyze this meeting transcript and produce structured minutes:\n\n${clipped}`,
        3000
      );

      if (!content) {
        throw new Error("Empty response from AI service");
      }

      const summary = parseSummaryContent(content);
      return new Response(
        JSON.stringify({
          ...summary,
          model: MEETING_SUMMARIZER_MODEL,
          provider: "lovable",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const question: string = body.question ?? "";
    if (!question) {
      return new Response(JSON.stringify({ error: "question is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const content = await callLovableGateway(
      LOVABLE_API_KEY,
      EVENT_QA_MODEL,
      EVENT_SYSTEM_PROMPT,
      question,
      800
    );

    return new Response(
      JSON.stringify({
        response: content || "No response generated.",
        model: EVENT_QA_MODEL,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: unknown) {
    console.error("event-intelligence error:", e);
    const gatewayErr = e as LovableGatewayError;
    const status = gatewayErr.status === 429 || gatewayErr.status === 402 ? gatewayErr.status : 500;
    const message =
      status === 429
        ? "Rate limit exceeded — please try again shortly."
        : status === 402
          ? "AI credits exhausted — please add funds."
          : e instanceof Error
            ? e.message
            : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
