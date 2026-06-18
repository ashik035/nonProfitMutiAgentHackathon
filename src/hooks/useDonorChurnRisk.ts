import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { invalidateKeys } from "@/lib/cache";
import { coalesceRunId } from "@/lib/agentResponseNormalize";
import { CLIENT_AGENT_FALLBACKS } from "@/lib/agentClientFallbacks";
import type { DonorChurnRiskResponse } from "@/types/donor-churn-risk";

const FN_NAME = "donor-churn-risk";
const MODEL = "claude-sonnet-4-20250514";

export interface DonorChurnRiskRunResult {
  runId: string;
  result: DonorChurnRiskResponse["result"];
  timeSavedMinutes: number;
  recommendedAction: string;
  model: string;
  provider: string;
  latencyMs: number;
}

function fallbackRunResult(): DonorChurnRiskRunResult {
  const fallback = CLIENT_AGENT_FALLBACKS["donor-churn-risk"];
  return {
    runId: coalesceRunId(null, FN_NAME),
    result: fallback,
    timeSavedMinutes: fallback.time_saved_minutes,
    recommendedAction: fallback.recommended_action,
    model: MODEL,
    provider: "client-fallback",
    latencyMs: 0,
  };
}

function isAgentResponse(data: unknown): data is DonorChurnRiskResponse {
  return (
    data !== null &&
    typeof data === "object" &&
    "run_id" in data &&
    "result" in data
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
  return error.message || "Donor Churn Risk Detector failed";
}

export function useDonorChurnRisk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (options?: { useSample?: boolean }): Promise<DonorChurnRiskRunResult> => {
      const { data, error } = await supabase.functions.invoke(FN_NAME, {
        body: { log_run: true, use_sample: options?.useSample ?? false },
      });

      if (error) {
        const fallback = CLIENT_AGENT_FALLBACKS["donor-churn-risk"];
        return {
          runId: coalesceRunId(null, FN_NAME),
          result: fallback,
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
        if (data && typeof data === "object" && "result" in data) {
          const loose = data as DonorChurnRiskResponse;
          return {
            runId: coalesceRunId(loose.run_id, FN_NAME),
            result: loose.result,
            timeSavedMinutes: loose.time_saved_minutes ?? loose.result.time_saved_minutes,
            recommendedAction: loose.recommended_action ?? loose.result.recommended_action,
            model: loose.model || MODEL,
            provider: loose.provider || FN_NAME,
            latencyMs: loose.latency_ms ?? 0,
          };
        }
        return fallbackRunResult();
      }

      return {
        runId: coalesceRunId(data.run_id, FN_NAME),
        result: data.result,
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
