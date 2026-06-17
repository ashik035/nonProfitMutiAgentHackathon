/**
 * ROI stats derived from demo agent activity logs (weekly window).
 */

import type { AgencyRole } from "@/hooks/useAgencyRole";
import {
  DEMO_AGENT_ACTIVITY,
  getWeeklyAgentRunsForSlugs,
} from "@/shared/data/nonprofitDemoData";

export const NONPROFIT_STAFF_HOURLY_RATE = 35;

type NonprofitDashboardRole = Exclude<AgencyRole, "admin">;

/** Nonprofit ops agent slugs per role — mirrors nonprofit_role_permissions seed. */
const ROLE_AGENT_SLUGS: Record<NonprofitDashboardRole, string[]> = {
  executive_director: [
    "crm-data-integrity",
    "reconciliation-fund-accounting",
    "grant-compliance",
    "event-intelligence",
    "board-reporting",
  ],
  development_director: ["event-intelligence", "grant-compliance"],
  finance_manager: ["reconciliation-fund-accounting", "grant-compliance"],
  operations_manager: ["crm-data-integrity"],
};

export interface AgentROIStats {
  hoursSaved: number;
  dollarValue: number;
  agentRunCount: number;
  agentCount: number;
}

export function getAgentROIStats(role: NonprofitDashboardRole): AgentROIStats {
  const slugs = ROLE_AGENT_SLUGS[role];
  const slugSet = new Set(slugs);
  const weeklyRuns = getWeeklyAgentRunsForSlugs(slugs);

  const hoursSaved = weeklyRuns.reduce((sum, run) => sum + run.hoursSaved, 0);
  const agentRunCount = weeklyRuns.length;
  const agentCount = slugSet.size;

  return {
    hoursSaved,
    dollarValue: hoursSaved * NONPROFIT_STAFF_HOURLY_RATE,
    agentRunCount,
    agentCount,
  };
}

export function getRecentAgentActivityForRole(
  role: NonprofitDashboardRole,
  limit = 5
) {
  const slugs = ROLE_AGENT_SLUGS[role];
  const slugSet = new Set(slugs);
  return [...DEMO_AGENT_ACTIVITY]
    .filter((run) => slugSet.has(run.agentSlug))
    .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())
    .slice(0, limit);
}

export function formatHoursSaved(hours: number): string {
  return Number.isInteger(hours) ? String(hours) : hours.toFixed(1);
}

export function formatDollarValue(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}
