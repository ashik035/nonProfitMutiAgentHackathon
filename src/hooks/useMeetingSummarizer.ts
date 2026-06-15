/**
 * Meeting Summarizer Hook
 *
 * Invokes generate-meeting-summary-v2 with a raw transcript (paste mode).
 * Uses the function already deployed on Lovable Cloud — no separate meeting-summarizer deploy.
 */

import { useMutation } from "@tanstack/react-query";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { API } from "@/shared/config/api";
import type { MeetingSummary } from "@/types/meeting-summary";

export interface MeetingSummarizerResult {
  summary: MeetingSummary;
  latencyMs: number;
}

const LOVABLE_PUBLISH_HINT =
  "In Lovable, click Publish (top right) so the updated edge function is deployed to Lovable Cloud, then try again.";

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
    if (error.message.includes("Failed to send a request to the Edge Function")) {
      return `Could not reach the AI service. ${LOVABLE_PUBLISH_HINT}`;
    }
    return error.message;
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

export function useMeetingSummarizer() {
  return useMutation({
    mutationFn: async (transcript: string): Promise<MeetingSummarizerResult> => {
      const start = Date.now();
      const { data, error } = await supabase.functions.invoke(API.MEETINGS.SUMMARIZER, {
        body: { transcript },
      });

      if (error) {
        if (error instanceof FunctionsHttpError) {
          throw new Error(await parseFunctionsError(error));
        }
        throw new Error(extractErrorMessage(error, data));
      }

      if (data && typeof data === "object" && "error" in data) {
        throw new Error(extractErrorMessage(null, data));
      }

      return {
        summary: data as MeetingSummary,
        latencyMs: Date.now() - start,
      };
    },
  });
}
