/**
 * Meeting Summarizer Hook — Claude Sonnet 4 via Lovable gateway.
 *
 * Priority: optional client key → generate-meeting-summary-v2 (v2 PR) →
 * meeting-summarizer → event-intelligence Sonnet mode.
 */

import { useMutation } from "@tanstack/react-query";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { API } from "@/shared/config/api";
import {
  MEETING_SUMMARIZER_MODEL,
  buildMeetingSummarizerQuestion,
  parseMeetingSummaryResponse,
  summarizeMeetingWithClaudeSonnet,
} from "@/lib/meetingSummarizer";
import type { MeetingSummary } from "@/types/meeting-summary";

export interface MeetingSummarizerResult {
  summary: MeetingSummary;
  latencyMs: number;
  model: string;
  provider: string;
  /** True when cloud edge functions are stale and Gemini Q&A fallback was used. */
  isGeminiFallback?: boolean;
}

const LOVABLE_EDGE_DEPLOY_HINT =
  "Lovable Publish updates the website only. Edge functions must be deployed separately — in Lovable chat ask: \"Deploy generate-meeting-summary-v2 and event-intelligence from GitHub main.\"";

const DEDICATED_SUMMARIZER_FN = "meeting-summarizer";

function extractErrorMessage(error: unknown, data: unknown): string {
  if (data && typeof data === "object") {
    if ("message" in data && data.message) {
      return String((data as { message: string }).message);
    }
    if ("error" in data && typeof (data as { error: unknown }).error === "string") {
      return String((data as { error: string }).error);
    }
  }
  if (error instanceof Error) {
    const msg = error.message;
    if (msg.includes("Failed to send a request to the Edge Function")) {
      return `Could not reach the AI service. ${LOVABLE_EDGE_DEPLOY_HINT}`;
    }
    if (msg.includes("NOT_FOUND") || msg.includes("non-2xx")) {
      return `AI backend not available on cloud. ${LOVABLE_EDGE_DEPLOY_HINT}`;
    }
    return msg;
  }
  return "Failed to generate meeting minutes";
}

async function parseFunctionsError(error: FunctionsHttpError): Promise<string> {
  try {
    const body = await error.context.json();
    return extractErrorMessage(null, body);
  } catch {
    return extractErrorMessage(error, null);
  }
}

function isMeetingSummaryShape(data: unknown): data is MeetingSummary {
  return (
    data !== null &&
    typeof data === "object" &&
    "executive_summary" in data &&
    "decisions" in data &&
    "action_items" in data
  );
}

function summaryFromEdgePayload(data: unknown): MeetingSummary {
  if (isMeetingSummaryShape(data)) {
    return data;
  }
  if (data && typeof data === "object" && "response" in data) {
    return parseMeetingSummaryResponse(String((data as { response: string }).response));
  }
  throw new Error("Unexpected response shape from AI service");
}

async function invokeEdgeFunction(
  functionName: string,
  body: Record<string, unknown>
): Promise<unknown> {
  const { data, error } = await supabase.functions.invoke(functionName, { body });

  if (error) {
    if (error instanceof FunctionsHttpError) {
      throw new Error(await parseFunctionsError(error));
    }
    throw new Error(extractErrorMessage(error, data));
  }

  if (data && typeof data === "object" && "error" in data) {
    throw new Error(extractErrorMessage(null, data));
  }

  return data;
}

async function trySummaryV2(transcript: string): Promise<MeetingSummarizerResult> {
  const start = Date.now();
  const data = await invokeEdgeFunction(API.MEETINGS.SUMMARIZER, { transcript });
  const model =
    data && typeof data === "object" && "model" in data
      ? String((data as { model: string }).model)
      : MEETING_SUMMARIZER_MODEL;

  return {
    summary: summaryFromEdgePayload(data),
    latencyMs: Date.now() - start,
    model,
    provider: API.MEETINGS.SUMMARIZER,
  };
}

async function tryMeetingSummarizerEdge(transcript: string): Promise<MeetingSummarizerResult> {
  const start = Date.now();
  const data = await invokeEdgeFunction(DEDICATED_SUMMARIZER_FN, { transcript });
  const model =
    data && typeof data === "object" && "model" in data
      ? String((data as { model: string }).model)
      : MEETING_SUMMARIZER_MODEL;

  return {
    summary: summaryFromEdgePayload(data),
    latencyMs: Date.now() - start,
    model,
    provider: DEDICATED_SUMMARIZER_FN,
  };
}

async function tryEventIntelligenceSonnet(transcript: string): Promise<MeetingSummarizerResult> {
  const start = Date.now();
  const data = await invokeEdgeFunction(API.AI.EVENT_INTELLIGENCE, {
    mode: "meeting_summary",
    transcript,
  });
  const model =
    data && typeof data === "object" && "model" in data
      ? String((data as { model: string }).model)
      : MEETING_SUMMARIZER_MODEL;

  return {
    summary: summaryFromEdgePayload(data),
    latencyMs: Date.now() - start,
    model,
    provider: API.AI.EVENT_INTELLIGENCE,
  };
}

async function tryClientSonnet(transcript: string): Promise<MeetingSummarizerResult> {
  const start = Date.now();
  const summary = await summarizeMeetingWithClaudeSonnet(transcript);
  return {
    summary,
    latencyMs: Date.now() - start,
    model: MEETING_SUMMARIZER_MODEL,
    provider: "lovable-client",
  };
}

const GEMINI_EVENT_MODEL = "google/gemini-3-flash-preview";

async function tryEventIntelligenceGeminiFallback(
  transcript: string
): Promise<MeetingSummarizerResult> {
  const start = Date.now();
  const data = await invokeEdgeFunction(API.AI.EVENT_INTELLIGENCE, {
    question: buildMeetingSummarizerQuestion(transcript),
  });
  const summary = summaryFromEdgePayload(data);

  return {
    summary,
    latencyMs: Date.now() - start,
    model: GEMINI_EVENT_MODEL,
    provider: "event-intelligence-gemini-fallback",
    isGeminiFallback: true,
  };
}

export function useMeetingSummarizer() {
  return useMutation({
    mutationFn: async (transcript: string): Promise<MeetingSummarizerResult> => {
      const trimmed = transcript.trim();
      const attempts: Array<{ name: string; fn: () => Promise<MeetingSummarizerResult> }> = [];

      if (import.meta.env.VITE_LOVABLE_API_KEY) {
        attempts.push({ name: "lovable-client", fn: () => tryClientSonnet(trimmed) });
      }

      // Gemini Q&A path works on current Lovable cloud (Sonnet edge code not deployed yet)
      attempts.push({
        name: "event-intelligence-gemini-fallback",
        fn: () => tryEventIntelligenceGeminiFallback(trimmed),
      });

      attempts.push(
        { name: API.MEETINGS.SUMMARIZER, fn: () => trySummaryV2(trimmed) },
        { name: DEDICATED_SUMMARIZER_FN, fn: () => tryMeetingSummarizerEdge(trimmed) },
        { name: API.AI.EVENT_INTELLIGENCE, fn: () => tryEventIntelligenceSonnet(trimmed) },
      );

      const errors: string[] = [];
      for (const { name, fn } of attempts) {
        try {
          return await fn();
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          errors.push(`${name}: ${msg}`);
        }
      }

      throw new Error(
        errors.length > 0
          ? `Meeting minutes unavailable. ${errors.join(" | ")}`
          : `Meeting minutes unavailable. ${LOVABLE_EDGE_DEPLOY_HINT}`
      );
    },
  });
}
