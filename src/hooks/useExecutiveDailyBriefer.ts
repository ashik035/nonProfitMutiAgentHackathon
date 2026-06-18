import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { invalidateKeys } from "@/lib/cache";
import { coalesceRunId } from "@/lib/agentResponseNormalize";
import { CLIENT_AGENT_FALLBACKS } from "@/lib/agentClientFallbacks";
import type { ExecutiveDailyBrieferResponse } from "@/types/executive-daily-briefer";

const FN_NAME = "executive-daily-briefer";
const MODEL = "gpt-4o";

function fallbackRunResult(): ExecutiveDailyBrieferRunResult {
  const fallback = CLIENT_AGENT_FALLBACKS["executive-daily-briefer"];
  return {
    runId: coalesceRunId(null, FN_NAME),
    briefing: fallback,
    timeSavedMinutes: fallback.time_saved_minutes,
    recommendedAction: fallback.recommended_action,
    model: MODEL,
    provider: "client-fallback",
    latencyMs: 0,
  };
}

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
        body: { log_run: true, use_sample: options?.useSample ?? false },
      });

      if (error) {
        const fallback = CLIENT_AGENT_FALLBACKS["executive-daily-briefer"];
        return {
          runId: coalesceRunId(null, FN_NAME),
          briefing: fallback,
          timeSavedMinutes: fallback.time_saved_minutes,
          recommendedAction: fallback.recommended_action,
          model: MODEL,
          provider: "client-fallback",
          latencyMs: 0,
        };
      }

      if (data && typeof data === "object" && "error" in data) {
        return fallbackRunResult();
      }

      if (!isAgentResponse(data)) {
        if (data && typeof data === "object" && "briefing" in data) {
          const loose = data as ExecutiveDailyBrieferResponse;
          return {
            runId: coalesceRunId(loose.run_id, FN_NAME),
            briefing: loose.briefing,
            timeSavedMinutes: loose.time_saved_minutes ?? loose.briefing.time_saved_minutes,
            recommendedAction: loose.recommended_action ?? loose.briefing.recommended_action,
            model: loose.model || MODEL,
            provider: loose.provider || FN_NAME,
            latencyMs: loose.latency_ms ?? 0,
          };
        }
        return fallbackRunResult();
      }

      return {
        runId: coalesceRunId(data.run_id, FN_NAME),
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
