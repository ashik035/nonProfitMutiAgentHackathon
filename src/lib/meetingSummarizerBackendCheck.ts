/**
 * Probe which meeting-summary backends are reachable on the linked Supabase project.
 * Read-only health checks — cannot deploy functions.
 */

import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { API } from "@/shared/config/api";

export type BackendProbeStatus = "active" | "missing" | "error" | "stale";

export interface SummarizerBackendProbe {
  name: string;
  status: BackendProbeStatus;
  detail: string;
}

const DEDICATED_SUMMARIZER_FN = "meeting-summarizer";

async function probeErrorDetail(
  error: unknown,
  data: unknown
): Promise<string> {
  if (data && typeof data === "object" && "error" in data) {
    return String((data as { error: string }).error);
  }
  if (error instanceof FunctionsHttpError) {
    try {
      const body = await error.context.json();
      if (body && typeof body === "object" && "error" in body) {
        return String((body as { error: string }).error);
      }
      if (body && typeof body === "object" && "message" in body) {
        return String((body as { message: string }).message);
      }
    } catch {
      // ignore
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown error";
}

async function probe(
  label: string,
  name: string,
  body: Record<string, unknown>,
  staleHints: string[] = []
): Promise<SummarizerBackendProbe> {
  const { data, error } = await supabase.functions.invoke(name, { body });

  const errMsg = error?.message ?? "";
  if (errMsg.includes("NOT_FOUND") || errMsg.includes("404")) {
    return { name: label, status: "missing", detail: "Not deployed on this project" };
  }

  if (error) {
    const detail = await probeErrorDetail(error, data);
    const isStale = staleHints.some((hint) => detail.includes(hint));
    if (isStale) {
      return {
        name: label,
        status: "stale",
        detail: `${detail} — cloud code is outdated (Publish does not update edge functions)`,
      };
    }
    if (errMsg.includes("non-2xx")) {
      return { name: label, status: "error", detail: detail };
    }
    return { name: label, status: "error", detail: detail };
  }

  if (data && typeof data === "object" && "error" in data) {
    const detail = String((data as { error: string }).error);
    const isStale = staleHints.some((hint) => detail.includes(hint));
    return {
      name: label,
      status: isStale ? "stale" : "error",
      detail: isStale
        ? `${detail} — cloud code is outdated (Publish does not update edge functions)`
        : detail,
    };
  }

  if (data && typeof data === "object" && "executive_summary" in data) {
    const model =
      "model" in data ? String((data as { model: string }).model) : "claude-sonnet-4-20250514";
    return { name: label, status: "active", detail: `Sonnet OK — ${model}` };
  }

  return { name: label, status: "active", detail: "Responding" };
}

/** Which edge endpoints exist on the linked cloud project (Lovable / Supabase). */
export async function probeMeetingSummarizerBackends(): Promise<SummarizerBackendProbe[]> {
  return [
    await probe(
      "generate-meeting-summary-v2 (transcript)",
      API.MEETINGS.SUMMARIZER,
      { transcript: "Board health check. Decision: approve budget." },
      ["meeting_id is required", "meeting_id or transcript"]
    ),
    await probe(
      "event-intelligence (Sonnet mode)",
      API.AI.EVENT_INTELLIGENCE,
      {
        mode: "meeting_summary",
        transcript: "Board meeting health check. Chair: Patricia. Decision: approve budget.",
      },
      ["question is required"]
    ),
    await probe("meeting-summarizer", DEDICATED_SUMMARIZER_FN, {
      transcript: "health check",
    }),
    await probe("event-intelligence (Gemini Q&A)", API.AI.EVENT_INTELLIGENCE, {
      question: "health check ping",
    }),
  ];
}
