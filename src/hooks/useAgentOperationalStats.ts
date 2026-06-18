import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "@/lib/cache";
import { resolveDbAgentSlug, type AgentOperationalStats } from "@/lib/agentOperational";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function extractTimeSavedMinutes(metadata: unknown, output: unknown): number {
  if (metadata && typeof metadata === "object" && "time_saved_minutes" in metadata) {
    const val = (metadata as { time_saved_minutes: unknown }).time_saved_minutes;
    if (typeof val === "number" && val > 0) return val;
  }
  if (output && typeof output === "object" && output !== null && "time_saved_minutes" in output) {
    const val = (output as { time_saved_minutes: unknown }).time_saved_minutes;
    if (typeof val === "number" && val > 0) return val;
  }
  return 0;
}

function extractLastFinding(metadata: unknown, output: unknown): string | null {
  if (metadata && typeof metadata === "object" && "recommended_action" in metadata) {
    const action = (metadata as { recommended_action: unknown }).recommended_action;
    if (typeof action === "string" && action.trim()) return action.trim();
  }
  if (output && typeof output === "object" && output !== null) {
    const out = output as Record<string, unknown>;
    if (typeof out.recommended_action === "string" && out.recommended_action.trim()) {
      return out.recommended_action.trim();
    }
    if (typeof out.summary === "string" && out.summary.trim()) {
      const s = out.summary.trim();
      return s.length > 140 ? `${s.slice(0, 137)}…` : s;
    }
    if (typeof out.executive_summary === "string" && out.executive_summary.trim()) {
      const s = out.executive_summary.trim();
      return s.length > 140 ? `${s.slice(0, 137)}…` : s;
    }
  }
  return null;
}

function extractItemsToReview(metadata: unknown, output: unknown): number {
  if (metadata && typeof metadata === "object") {
    const m = metadata as Record<string, unknown>;
    if (typeof m.findings_count === "number") return m.findings_count;
    const overdue = typeof m.overdue_count === "number" ? m.overdue_count : 0;
    const blocked = typeof m.blocked_count === "number" ? m.blocked_count : 0;
    if (overdue + blocked > 0) return overdue + blocked;
  }
  if (output && typeof output === "object" && output !== null) {
    const out = output as Record<string, unknown>;
    const actions = Array.isArray(out.action_items) ? out.action_items.length : 0;
    const decisions = Array.isArray(out.decisions) ? out.decisions.length : 0;
    const overdue = Array.isArray(out.overdue) ? out.overdue.length : 0;
    const blocked = Array.isArray(out.blocked) ? out.blocked.length : 0;
    const grantInsights = Array.isArray(out.grant_insights) ? out.grant_insights.length : 0;
    const donorInsights = Array.isArray(out.donor_insights) ? out.donor_insights.length : 0;
    if (grantInsights + donorInsights > 0) return grantInsights + donorInsights;
    const atRisk = Array.isArray(out.at_risk_donors) ? out.at_risk_donors.length : 0;
    if (atRisk > 0) return atRisk;
    const priorityItems = Array.isArray(out.priority_items) ? out.priority_items.length : 0;
    if (priorityItems > 0) return priorityItems;
    if (overdue + blocked > 0) return overdue + blocked;
    return actions + decisions;
  }
  return 0;
}

function formatRelativeRun(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

/**
 * Live operational stats for a nonprofit agent card from ai_agent_runs.
 */
export function useAgentOperationalStats(uiSlug: string): AgentOperationalStats {
  const { user } = useAuth();
  const dbSlug = resolveDbAgentSlug(uiSlug);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.ai.operational(uiSlug),
    queryFn: async () => {
      const { data: agent, error: agentError } = await supabase
        .from("ai_agents")
        .select("id")
        .eq("slug", dbSlug)
        .maybeSingle();

      if (agentError) throw agentError;
      if (!agent?.id) {
        return {
          agentId: null,
          lastFinding: null,
          itemsToReview: 0,
          timeSavedHrs: 0,
          lastRunAt: null,
          lastRunLabel: null,
          recommendedAction: null,
        };
      }

      const weekAgo = new Date(Date.now() - WEEK_MS).toISOString();
      const { data: runs, error: runsError } = await supabase
        .from("ai_agent_runs")
        .select("id, status, output, metadata, created_at, completed_at")
        .eq("agent_id", agent.id)
        .eq("status", "completed")
        .gte("created_at", weekAgo)
        .order("created_at", { ascending: false })
        .limit(50);

      if (runsError) throw runsError;

      const completed = runs ?? [];
      const latest = completed[0];
      const totalMinutes = completed.reduce(
        (sum, run) => sum + extractTimeSavedMinutes(run.metadata, run.output),
        0
      );

      const lastRunAt = latest?.completed_at ?? latest?.created_at ?? null;
      const recommendedAction =
        latest?.metadata &&
        typeof latest.metadata === "object" &&
        "recommended_action" in latest.metadata &&
        typeof (latest.metadata as { recommended_action: unknown }).recommended_action === "string"
          ? String((latest.metadata as { recommended_action: string }).recommended_action)
          : null;

      return {
        agentId: agent.id,
        lastFinding: latest ? extractLastFinding(latest.metadata, latest.output) : null,
        itemsToReview: latest ? extractItemsToReview(latest.metadata, latest.output) : 0,
        timeSavedHrs: Math.round((totalMinutes / 60) * 10) / 10,
        lastRunAt,
        lastRunLabel: lastRunAt ? formatRelativeRun(lastRunAt) : null,
        recommendedAction,
      };
    },
    enabled: !!user,
    staleTime: 30_000,
  });

  return {
    agentId: data?.agentId ?? null,
    lastFinding: data?.lastFinding ?? null,
    itemsToReview: data?.itemsToReview ?? 0,
    timeSavedHrs: data?.timeSavedHrs ?? 0,
    lastRunAt: data?.lastRunAt ?? null,
    lastRunLabel: data?.lastRunLabel ?? null,
    recommendedAction: data?.recommendedAction ?? null,
    isLoading,
  };
}
