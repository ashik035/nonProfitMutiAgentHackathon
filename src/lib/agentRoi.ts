/**
 * Static ROI stats derived from agentTeamConfig timeSavedHrs and demo activity data.
 */

import { allTeams, type AgentTeamAgent } from "@/components/ai/agentTeamConfig";
import type { AgencyRole } from "@/hooks/useAgencyRole";
import { DEMO_AGENT_ACTIVITY } from "@/shared/data/nonprofitDemoData";

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

function getAgentsForSlugs(slugs: string[]): AgentTeamAgent[] {
  const slugSet = new Set(slugs);
  return allTeams.flatMap((team) => team.agents).filter((agent) => slugSet.has(agent.slug));
}

export function getAgentROIStats(role: NonprofitDashboardRole): AgentROIStats {
  const slugs = ROLE_AGENT_SLUGS[role];
  const agents = getAgentsForSlugs(slugs);
  const slugSet = new Set(slugs);

  const hoursSaved = agents.reduce(
    (sum, agent) => sum + (agent.operational?.timeSavedHrs ?? 0),
    0
  );

  const agentRunCount = DEMO_AGENT_ACTIVITY.filter((run) => slugSet.has(run.agentSlug)).length;

  return {
    hoursSaved,
    dollarValue: hoursSaved * NONPROFIT_STAFF_HOURLY_RATE,
    agentRunCount,
    agentCount: agents.length,
  };
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
