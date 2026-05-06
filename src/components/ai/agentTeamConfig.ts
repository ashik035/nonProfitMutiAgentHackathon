/**
 * Agent Team Configuration
 *
 * Static source of truth for all AI agent teams and their members.
 * Used by the Browse page, Detail page, Dashboard card, and contextual banners.
 */

import { hoursAgo } from "@/shared/data/nonprofitDemoData";

export interface AgentOperationalMeta {
  lastFinding: string;
  itemsToReview: number;
  timeSavedHrs: number;
}

export interface AgentTeamAgent {
  name: string;
  slug: string;
  description: string;
  icon: string;
  capabilities?: string[];
  howToUse?: string[];
  whereToFind?: { label: string; path: string };
  /** Operational metadata for the 5 core nonprofit agents */
  operational?: AgentOperationalMeta;
  /** Optional permission key for role-based gating. Agents without this always show. */
  permissionKey?: string;
}

export interface AgentTeamDef {
  id: string;
  name: string;
  tagline: string;
  accentColor: string;
  gradientFrom: string;
  gradientTo: string;
  agents: AgentTeamAgent[];
}

export const agentTeams: Record<string, AgentTeamDef> = {
  "nonprofit-ops": {
    id: "nonprofit-ops",
    name: "Core Operations Team",
    tagline: "AI agents that power day-to-day nonprofit operations",
    accentColor: "border-b-cyan-500",
    gradientFrom: "199 89% 48%",
    gradientTo: "187 100% 42%",
    agents: [
      {
        name: "CRM Data Integrity Agent",
        slug: "crm-data-integrity",
        description: "Continuously scans your CRM for duplicate records, missing required fields, and stale donor profiles. Surfaces merge suggestions and data quality issues for review.",
        icon: "Database",
        operational: {
          lastFinding: "Found 3 potential duplicate records — Sarah Chen (donor #1847 and #2103) and Michael Torres (donor #892 and #1654)",
          itemsToReview: 3,
          timeSavedHrs: 2.5,
        },
        capabilities: [
          "Scan CRM for duplicate and incomplete records",
          "Surface merge suggestions with confidence scores",
          "Flag stale profiles with no activity in 12+ months",
          "Track data quality score over time",
        ],
        howToUse: [
          "Navigate to the Data Health page",
          "Review flagged duplicates and merge suggestions",
          "Approve or dismiss each suggestion",
          "Export incomplete profiles for data entry",
        ],
        whereToFind: { label: "Data Health", path: "/data-health" },
      },
      {
        name: "Reconciliation & Fund Accounting Agent",
        slug: "reconciliation-fund-accounting",
        description: "Matches incoming transactions from payment processors against your finance system. Flags unmatched payments, fee variances, and restricted fund mismatches.",
        icon: "DollarSign",
        operational: {
          lastFinding: "1 unmatched Stripe transaction — $2,340 donation on Apr 6 has no matching record in Salesforce",
          itemsToReview: 1,
          timeSavedHrs: 1.5,
        },
        capabilities: [
          "Match Stripe and PayPal transactions to QuickBooks entries",
          "Flag fee variances exceeding thresholds",
          "Detect restricted fund miscategorizations",
          "Generate monthly reconciliation summaries",
        ],
        howToUse: [
          "Navigate to the Reconciliation page",
          "Review unmatched transactions",
          "Match or flag each item",
          "Export reconciliation report",
        ],
        whereToFind: { label: "Reconciliation", path: "/reconciliation" },
      },
      {
        name: "Grant Compliance Agent",
        slug: "grant-compliance",
        description: "Tracks active grant deadlines, monitors fund utilization against approved budgets, and flags spending anomalies or upcoming reporting requirements.",
        icon: "FileText",
        operational: {
          lastFinding: "Kresge Foundation report due in 8 days — utilization at 61%, narrative draft not started",
          itemsToReview: 2,
          timeSavedHrs: 3,
        },
        capabilities: [
          "Track grant deadlines and reporting requirements",
          "Monitor fund utilization vs approved budgets",
          "Flag spending anomalies and pace issues",
          "Generate compliance summary documents",
        ],
        howToUse: [
          "Navigate to the Grants page",
          "Review deadline alerts and utilization charts",
          "Generate compliance summaries for upcoming reports",
          "Export grant status for funder communication",
        ],
        whereToFind: { label: "Grants", path: "/grants" },
      },
      {
        name: "Event Intelligence Agent",
        slug: "event-intelligence",
        description: "Analyzes post-event attendance data and suggests engagement tags, volunteer interest flags, and follow-up tasks for attendees not yet connected to your donor pipeline.",
        icon: "Calendar",
        operational: {
          lastFinding: "47 attendees from Apr 3 Spring Gala not yet tagged in Salesforce — 12 indicated volunteer interest",
          itemsToReview: 47,
          timeSavedHrs: 4,
        },
        capabilities: [
          "Analyze event attendance against CRM records",
          "Flag untagged attendees for CRM updates",
          "Identify volunteer interest signals",
          "Generate post-event follow-up task lists",
        ],
        howToUse: [
          "Navigate to the Events page after an event",
          "Review untagged attendees and interest flags",
          "Create follow-up tasks for your team",
          "Track engagement conversion from events",
        ],
        whereToFind: { label: "Events", path: "/events" },
      },
      {
        name: "Board Reporting Agent",
        slug: "board-reporting",
        description: "Aggregates KPIs, financial snapshots, and engagement metrics from connected systems to generate draft board reports on a scheduled basis.",
        icon: "BarChart3",
        operational: {
          lastFinding: "Q1 Board Report draft ready — pulled from Salesforce, Stripe, and grant tracker. 3 KPIs need ED approval before export.",
          itemsToReview: 3,
          timeSavedHrs: 5,
        },
        capabilities: [
          "Aggregate KPIs from all connected systems",
          "Generate financial snapshots from QuickBooks data",
          "Compile engagement metrics from Salesforce",
          "Produce board-ready PDF reports",
        ],
        howToUse: [
          "Navigate to Board Reports",
          "Review the auto-generated draft",
          "Approve or edit KPI sections",
          "Export to PDF for board distribution",
        ],
        whereToFind: { label: "Board Reports", path: "/board-reports" },
      },
    ],
  },
};

export const allTeams: AgentTeamDef[] = Object.values(agentTeams);

/** Find which team an agent belongs to */
export function findTeamForAgent(slug: string): AgentTeamDef | undefined {
  return allTeams.find((t) => t.agents.some((a) => a.slug === slug));
}

/** Find an agent + its team by slug */
export function findAgentBySlug(
  slug: string
): { agent: AgentTeamAgent; team: AgentTeamDef } | undefined {
  for (const team of allTeams) {
    const agent = team.agents.find((a) => a.slug === slug);
    if (agent) return { agent, team };
  }
  return undefined;
}

/** Icon slug → Lucide icon name mapping */
export const AGENT_ICON_MAP: Record<string, string> = {
  "crm-data-integrity": "Database",
  "reconciliation-fund-accounting": "DollarSign",
  "grant-compliance": "FileText",
  "event-intelligence": "Calendar",
  "board-reporting": "BarChart3",
};

/** Category color map keyed by team id */
export const CATEGORY_COLORS: Record<string, { from: string; to: string; badge: string }> = {
  "nonprofit-ops": {
    from: "199 89% 48%",
    to: "187 100% 42%",
    badge: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
  },
  general: {
    from: "199 89% 48%",
    to: "187 100% 42%",
    badge: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
  },
};
