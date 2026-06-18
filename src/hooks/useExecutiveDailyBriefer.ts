import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { invalidateKeys } from "@/lib/cache";
import type { ExecutiveDailyBrieferResponse } from "@/types/executive-daily-briefer";

const FN_NAME = "executive-daily-briefer";
const MODEL = "gpt-4o";

export interface ExecutiveDailyBrieferRunResult {
  runId: string;
  briefing: ExecutiveDailyBrieferResponse["briefing"];
  timeSavedMinutes: number;
  recommendedAction: string;
  model: string;
  provider: string;
  latencyMs: number;
}

function isAgentResponse(data: unknown): data is ExecutiveDailyBrieferResponse {
  return (
    data !== null &&
    typeof data === "object" &&
    "run_id" in data &&
    "briefing" in data
  );
}

async function parseFunctionsError(error: FunctionsHttpError): Promise<string> {
  try {
    const body = await error.context.json();
    if (body && typeof body === "object" && "message" in body) {
      return String((body as { message: string }).message);
    }
  } catch {
    // ignore
  }
  return error.message || "Executive Daily Briefer failed";
}

export function useExecutiveDailyBriefer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (options?: { useSample?: boolean }): Promise<ExecutiveDailyBrieferRunResult> => {
      const { data, error } = await supabase.functions.invoke(FN_NAME, {
        body: { log_run: true, use_sample: options?.useSample ?? true },
      });

      if (error) {
        if (error instanceof FunctionsHttpError) {
          throw new Error(await parseFunctionsError(error));
        }
        throw new Error(error.message || "Executive Daily Briefer failed");
      }

      if (data && typeof data === "object" && "error" in data) {
        throw new Error(
          "message" in data ? String((data as { message: string }).message) : "Briefer failed"
        );
      }

      if (!isAgentResponse(data)) {
        throw new Error("Unexpected response from Executive Daily Briefer");
      }

      return {
        runId: data.run_id,
        briefing: data.briefing,
        timeSavedMinutes: data.time_saved_minutes,
        recommendedAction: data.recommended_action,
        model: data.model || MODEL,
        provider: data.provider || FN_NAME,
        latencyMs: data.latency_ms,
      };
    },
    onSuccess: () => invalidateKeys.ai(queryClient),
  });
}
