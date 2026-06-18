import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { invalidateKeys } from "@/lib/cache";
import { coalesceRunId } from "@/lib/agentResponseNormalize";
import { CLIENT_AGENT_FALLBACKS } from "@/lib/agentClientFallbacks";
import type { InsightFocus, StrategicInsightsResponse } from "@/types/strategic-insights";

const FN_NAME = "strategic-insights";
const MODEL = "claude-sonnet-4-20250514";

function fallbackRunResult(): StrategicInsightsRunResult {
  const fallback = CLIENT_AGENT_FALLBACKS["strategic-insights"];
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
          use_sample: options?.useSample ?? false,
          focus: options?.focus ?? "all",
        },
      });

      if (error) {
        const fallback = CLIENT_AGENT_FALLBACKS["strategic-insights"];
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
          const loose = data as StrategicInsightsResponse;
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
