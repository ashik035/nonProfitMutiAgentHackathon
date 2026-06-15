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

const MEETING_SUMMARY_SYSTEM_PROMPT = `You are a meeting analyst for a nonprofit organization. Given a raw meeting transcript, produce structured board-ready minutes.

Respond ONLY with valid JSON matching this exact shape:
{
  "executive_summary": "2-4 sentence overview",
  "decisions": ["decision 1", "decision 2"],
  "action_items": [{"task": "...", "owner": "name or null", "deadline": "ISO date or null"}],
  "attendance": ["name 1", "name 2"],
  "key_discussion_points": ["point 1", "point 2"]
}

Be concise, accurate, and extract every decision and action item. Do not include any prose outside the JSON.`;

const MODEL_ID = "anthropic/claude-sonnet-4-20250514";

async function callLovableAI(systemPrompt: string, userContent: string, maxTokens: number) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL_ID,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      max_completion_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("AI gateway error:", response.status, text);
    const err: any = new Error(`AI gateway error: ${response.status}`);
    err.status = response.status;
    err.body = text;
    throw err;
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "";
}

function parseJsonLoose(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Model did not return valid JSON");
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const mode: string = body.mode ?? "event_question";

    if (mode === "meeting_summary") {
      const transcript: string = body.transcript ?? "";
      if (!transcript || transcript.trim().length === 0) {
        return new Response(JSON.stringify({ error: "transcript is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const content = await callLovableAI(
        MEETING_SUMMARY_SYSTEM_PROMPT,
        `Summarize the following meeting transcript as JSON minutes:\n\n${transcript.slice(0, 60000)}`,
        2000,
      );

      const summary = parseJsonLoose(content);
      return new Response(JSON.stringify(summary), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Default: event_question mode
    const question: string = body.question ?? "";
    if (!question) {
      return new Response(JSON.stringify({ error: "question is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const content = await callLovableAI(EVENT_SYSTEM_PROMPT, question, 800);
    return new Response(JSON.stringify({ response: content || "No response generated." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("event-intelligence error:", e);
    const status = e?.status === 429 || e?.status === 402 ? e.status : 500;
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
