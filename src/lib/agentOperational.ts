/**
 * Maps nonprofit agent UI slugs (agentTeamConfig) to ai_agents DB slugs.
 */
export const AGENT_UI_TO_DB_SLUG: Record<string, string> = {
  "meeting-intelligence": "meeting-summarizer",
  "action-item-tracker": "action-item-tracker",
  "executive-daily-briefer": "executive-daily-briefer",
  "donor-churn-risk": "donor-churn-risk",
  "strategic-insights": "strategic-insights",
};

export function resolveDbAgentSlug(uiSlug: string): string {
  return AGENT_UI_TO_DB_SLUG[uiSlug] ?? uiSlug;
}

export interface AgentOperationalStats {
  agentId: string | null;
  lastFinding: string | null;
  itemsToReview: number;
  timeSavedHrs: number;
  lastRunAt: string | null;
  lastRunLabel: string | null;
  recommendedAction: string | null;
  isLoading: boolean;
}
