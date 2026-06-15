/**
 * Meeting Summarizer — prompts, parsing, and Claude Sonnet via Lovable gateway (client dev key).
 */

import type { MeetingSummary } from "@/types/meeting-summary";

export const MEETING_SUMMARIZER_MODEL = "claude-sonnet-4-20250514";
export const LOVABLE_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const MAX_TRANSCRIPT_CHARS = 12000;

export const MEETING_SUMMARIZER_SYSTEM_PROMPT = `You are an expert meeting minutes writer for Brightside Foundation, a nonprofit organization in Boston.

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

function clipTranscript(transcript: string): string {
  return transcript.length > MAX_TRANSCRIPT_CHARS
    ? transcript.slice(0, MAX_TRANSCRIPT_CHARS)
    : transcript;
}

export function buildMeetingSummarizerUserMessage(transcript: string): string {
  return `Analyze this meeting transcript and produce structured minutes:\n\n${clipTranscript(transcript)}`;
}

/** Legacy Gemini path — cram instructions into event-intelligence question field. */
export function buildMeetingSummarizerQuestion(transcript: string): string {
  return `${MEETING_SUMMARIZER_SYSTEM_PROMPT}\n\n${buildMeetingSummarizerUserMessage(transcript)}`;
}

export function parseMeetingSummaryResponse(content: string): MeetingSummary {
  const cleaned = content.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned) as MeetingSummary;
  } catch {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as MeetingSummary;
    }
    throw new Error("AI response was not valid JSON — try again with a shorter transcript.");
  }
}

async function callLovableGateway(
  apiKey: string,
  transcript: string
): Promise<string> {
  const response = await fetch(LOVABLE_GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MEETING_SUMMARIZER_MODEL,
      max_completion_tokens: 3000,
      temperature: 0.2,
      messages: [
        { role: "system", content: MEETING_SUMMARIZER_SYSTEM_PROMPT },
        { role: "user", content: buildMeetingSummarizerUserMessage(transcript) },
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
    const text = await response.text();
    throw new Error(`Lovable AI error (${response.status}): ${text.slice(0, 120)}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? "";
  if (!content) {
    throw new Error("Empty response from AI service");
  }
  return content;
}

/**
 * Claude Sonnet via Lovable gateway from the browser.
 * Requires VITE_LOVABLE_API_KEY in .env (copy from Lovable Cloud secrets — local dev only).
 */
export async function summarizeMeetingWithClaudeSonnet(transcript: string): Promise<MeetingSummary> {
  const apiKey = import.meta.env.VITE_LOVABLE_API_KEY as string | undefined;
  if (!apiKey?.trim()) {
    throw new Error("VITE_LOVABLE_API_KEY not configured");
  }
  const content = await callLovableGateway(apiKey.trim(), transcript.trim());
  return parseMeetingSummaryResponse(content);
}
