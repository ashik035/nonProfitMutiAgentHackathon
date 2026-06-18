import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { invalidateKeys } from "@/lib/cache";
import type { InsightFocus, StrategicInsightsResponse } from "@/types/strategic-insights";

const FN_NAME = "strategic-insights";
const MODEL = "claude-sonnet-4-20250514";

export interface StrategicInsightsRunResult {
  runId: string;
  result: StrategicInsightsResponse["result"];
  timeSavedMinutes: number;
  recommendedAction: string;
  model: string;
  provider: string;
  latencyMs: number;
}

function isAgentResponse(data: unknown): data is StrategicInsightsResponse {
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
  return error.message || "Strategic Insights failed";
}

export function useStrategicInsights() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (options?: {
      useSample?: boolean;
      focus?: InsightFocus;
    }): Promise<StrategicInsightsRunResult> => {
      const { data, error } = await supabase.functions.invoke(FN_NAME, {
        body: {
          log_run: true,
          use_sample: options?.useSample ?? true,
          focus: options?.focus ?? "all",
        },
      });

      if (error) {
        if (error instanceof FunctionsHttpError) {
          throw new Error(await parseFunctionsError(error));
        }
        throw new Error(error.message || "Strategic Insights failed");
      }

      if (data && typeof data === "object" && "error" in data) {
        throw new Error(
          "message" in data ? String((data as { message: string }).message) : "Insights failed"
        );
      }

      if (!isAgentResponse(data)) {
        throw new Error("Unexpected response from Strategic Insights");
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
