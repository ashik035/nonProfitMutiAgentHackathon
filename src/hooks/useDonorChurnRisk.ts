import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { invalidateKeys } from "@/lib/cache";
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
        body: { log_run: true, use_sample: options?.useSample ?? true },
      });

      if (error) {
        if (error instanceof FunctionsHttpError) {
          throw new Error(await parseFunctionsError(error));
        }
        throw new Error(error.message || "Donor Churn Risk Detector failed");
      }

      if (data && typeof data === "object" && "error" in data) {
        throw new Error(
          "message" in data ? String((data as { message: string }).message) : "Churn scan failed"
        );
      }

      if (!isAgentResponse(data)) {
        throw new Error("Unexpected response from Donor Churn Risk Detector");
      }

      return {
        runId: data.run_id,
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
