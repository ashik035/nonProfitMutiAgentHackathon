/**
 * Meeting Summarizer Hook
 *
 * Invokes the meeting-summarizer edge function with a raw transcript
 * and returns structured board minutes.
 */

import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { API } from "@/shared/config/api";
import type { MeetingSummary } from "@/types/meeting-summary";

export interface MeetingSummarizerResult {
  summary: MeetingSummary;
  latencyMs: number;
}

function extractErrorMessage(error: unknown, data: unknown): string {
  if (data && typeof data === "object" && "message" in data) {
    return String((data as { message: string }).message);
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Failed to generate meeting minutes";
}

export function useMeetingSummarizer() {
  return useMutation({
    mutationFn: async (transcript: string): Promise<MeetingSummarizerResult> => {
      const start = Date.now();
      const { data, error } = await supabase.functions.invoke(API.MEETINGS.SUMMARIZER, {
        body: { transcript },
      });

      if (error) {
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
