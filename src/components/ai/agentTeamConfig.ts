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

export const TEAM_DISPLAY_ORDER = [
  "meetings",
  "executive",
  "fundraising",
  "finance-grants",
  "data-ops",
  "reporting",
] as const;

/** Short badge label on agent cards */
export const TEAM_BADGE_LABELS: Record<string, string> = {
  meetings: "Meetings",
  executive: "Executive",
  fundraising: "Fundraising",
  "finance-grants": "Finance",
  "data-ops": "Operations",
  reporting: "Reporting",
};

export const agentTeams: Record<string, AgentTeamDef> = {
  meetings: {
    id: "meetings",
    name: "Meeting AI Team",
    tagline: "AI agents that turn meeting transcripts into actionable intelligence",
    accentColor: "border-b-violet-500",
    gradientFrom: "262 83% 58%",
    gradientTo: "239 84% 67%",
    agents: [
      {
        name: "Meeting Summarizer",
        slug: "meeting-intelligence",
        description:
          "Paste a board meeting transcript and get structured minutes — decisions, action items with owners and deadlines, attendance, and key discussion points — in under 30 seconds.",
        icon: "FileText",
        operational: {
          lastFinding:
            "Q2 board meeting minutes available — load the June board transcript or paste your own",
          itemsToReview: 0,
          timeSavedHrs: 1.5,
        },
        capabilities: [
          "Extract formal board decisions from raw transcripts",
          "Identify action items with owner names and deadlines",
          "Record attendance from roll call and speaker presence",
          "Summarize key discussion points without decisions",
          "Produce a three-sentence executive summary for the ED",
        ],
        howToUse: [
          "Open Meeting Summarizer on the AI Agents page",
          "Paste a board transcript or load your recent Q2 board meeting",
          "Click Generate Minutes and review structured output",
          "Copy sections into your board packet or CRM notes",
        ],
        whereToFind: { label: "Meeting Summarizer", path: "/agents/meeting-intelligence" },
      },
      {
        name: "Action Item Tracker",
        slug: "action-item-tracker",
        description:
          "Tracks board pending actions from your task board and meeting takeaways — flags overdue and blocked items with owners, due dates, and a clear next step for staff.",
        icon: "ListChecks",
        operational: {
          lastFinding:
            "2 board actions overdue — FY27 budget draft and ED compensation review need escalation",
          itemsToReview: 4,
          timeSavedHrs: 1,
        },
        capabilities: [
          "Scan open board and executive action items",
          "Flag overdue items with days past due",
          "Surface blocked items with blocker reasons",
          "Highlight items due within 14 days",
          "Recommend a single next step for the ED or board secretary",
        ],
        howToUse: [
          "Open Action Item Tracker on the AI Agents page",
          "Run Action Scan against your open board and executive tasks",
          "Review overdue and blocked tables",
          "Follow the recommended next step or open the task board",
        ],
        whereToFind: { label: "Action Item Tracker", path: "/agents/action-item-tracker" },
      },
    ],
  },
  executive: {
    id: "executive",
    name: "Executive Intelligence",
    tagline: "Morning briefings and cross-functional insights for leadership",
    accentColor: "border-b-amber-500",
    gradientFrom: "30 90% 50%",
    gradientTo: "45 95% 55%",
    agents: [
      {
        name: "Executive Daily Briefer",
        slug: "executive-daily-briefer",
        description:
          "Morning briefing for the Executive Director — aggregates grants, board actions, donor risk, and operations into what needs attention today.",
        icon: "Sun",
        operational: {
          lastFinding:
            "Kresge report due in 8 days, 2 board actions overdue, 3 major donors at churn risk",
          itemsToReview: 5,
          timeSavedHrs: 2,
        },
        capabilities: [
          "Aggregate grants, tasks, donors, and board actions into one briefing",
          "Prioritize critical vs warning items for the ED",
          "Surface metrics snapshot for morning standup",
          "Recommend a single highest-priority action",
        ],
        howToUse: [
          "Open Executive Daily Briefer on the AI Agents page",
          "Generate Morning Briefing from your grants, donors, and tasks",
          "Review priority items and metrics",
          "Take the recommended next step before 10am",
        ],
        whereToFind: { label: "Executive Daily Briefer", path: "/agents/executive-daily-briefer" },
      },
      {
        name: "Strategic Insights Generator",
        slug: "strategic-insights",
        description:
          "RAG-powered grant intelligence and donor insights — searches your org knowledge base and synthesizes cited findings with recommended actions.",
        icon: "BookOpen",
        operational: {
          lastFinding:
            "Kresge report urgent + Patricia Osei at churn risk — cross-link grant narrative with major-donor outreach",
          itemsToReview: 4,
          timeSavedHrs: 2.5,
        },
        capabilities: [
          "Semantic search across knowledge base and embeddings",
          "Grant deadline and utilization intelligence",
          "Donor retention signals from giving history + KB",
          "Cited insights with confidence scores",
          "Cross-functional recommended action",
        ],
        howToUse: [
          "Open Strategic Insights on the AI Agents page",
          "Choose focus: Grants, Donors, or both",
          "Generate Insights from your knowledge base and giving data",
          "Review cited grant and donor findings",
        ],
        whereToFind: { label: "Strategic Insights", path: "/agents/strategic-insights" },
      },
    ],
  },
  fundraising: {
    id: "fundraising",
    name: "Fundraising & Donors",
    tagline: "Donor retention, churn risk, and post-event engagement intelligence",
    accentColor: "border-b-rose-500",
    gradientFrom: "330 80% 55%",
    gradientTo: "350 75% 50%",
    agents: [
      {
        name: "Donor Churn Risk Detector",
        slug: "donor-churn-risk",
        description:
          "Flags at-risk donors from giving history — risk scores, revenue at risk, and personalized outreach recommendations.",
        icon: "Heart",
        operational: {
          lastFinding:
            "5 donors at elevated risk — Patricia Osei and William Davis are high priority major gifts",
          itemsToReview: 5,
          timeSavedHrs: 1.5,
        },
        capabilities: [
          "Score donors by days since last gift and lifetime value",
          "Classify high, medium, and low churn risk",
          "Estimate revenue at risk across the portfolio",
          "Recommend specific outreach per donor",
        ],
        howToUse: [
          "Open Donor Churn Risk Detector on AI Agents",
          "Run Churn Scan on your donation history",
          "Review at-risk table sorted by risk score",
          "Open Donor Retention to re-engage flagged donors",
        ],
        whereToFind: { label: "Donor Churn Risk", path: "/agents/donor-churn-risk" },
      },
      {
        name: "Event Intelligence Agent",
        slug: "event-intelligence",
        description:
          "Analyzes post-event attendance data and suggests engagement tags, volunteer interest flags, and follow-up tasks for attendees not yet connected to your donor pipeline.",
        icon: "Calendar",
        operational: {
          lastFinding:
            "47 attendees from Apr 3 Spring Gala not yet tagged in Salesforce — 12 indicated volunteer interest",
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
    ],
  },
  "finance-grants": {
    id: "finance-grants",
    name: "Finance & Grants",
    tagline: "Reconciliation, grant compliance, and budget monitoring",
    accentColor: "border-b-emerald-500",
    gradientFrom: "150 70% 40%",
    gradientTo: "170 75% 50%",
    agents: [
      {
        name: "Reconciliation & Fund Accounting Agent",
        slug: "reconciliation-fund-accounting",
        description:
          "Matches incoming transactions from payment processors against your finance system. Flags unmatched payments, fee variances, and restricted fund mismatches.",
        icon: "DollarSign",
        operational: {
          lastFinding:
            "1 unmatched Stripe transaction — $2,340 donation on Apr 6 has no matching record in Salesforce",
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
        whereToFind: { label: "Financial Reconciliation", path: "/reconciliation" },
      },
      {
        name: "Grant Compliance Agent",
        slug: "grant-compliance",
        description:
          "Tracks active grant deadlines, monitors fund utilization against approved budgets, and flags spending anomalies or upcoming reporting requirements.",
        icon: "FileText",
        operational: {
          lastFinding:
            "Kresge Foundation report due in 8 days — utilization at 61%, narrative draft not started",
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
        name: "Grant Budget Watcher",
        slug: "grant-budget-watcher",
        description:
          "Alerts when grant spending hits 75% or 90% of budget. Auto-drafts a variance explanation.",
        icon: "AlertTriangle",
        permissionKey: "grant-budget-watcher",
        capabilities: [
          "Monitor grant spending against approved budgets in real-time",
          "Trigger alerts at 75% and 90% utilization thresholds",
          "Auto-draft variance explanation narratives",
          "Generate budget-to-actual comparison reports",
        ],
        howToUse: [
          "Navigate to Grants page",
          "Review budget alerts on active grants",
          "Approve or edit auto-drafted variance explanations",
          "Export variance reports for funder communication",
        ],
        whereToFind: { label: "Grants", path: "/grants" },
      },
    ],
  },
  "data-ops": {
    id: "data-ops",
    name: "Data & Operations",
    tagline: "CRM integrity, integrations health, and staff onboarding",
    accentColor: "border-b-blue-500",
    gradientFrom: "215 70% 45%",
    gradientTo: "220 80% 55%",
    agents: [
      {
        name: "CRM Data Integrity Agent",
        slug: "crm-data-integrity",
        description:
          "Continuously scans your CRM for duplicate records, missing required fields, and stale donor profiles. Surfaces merge suggestions and data quality issues for review.",
        icon: "Database",
        operational: {
          lastFinding:
            "Found 3 potential duplicate records — Sarah Chen (donor #1847 and #2103) and Michael Torres (donor #892 and #1654)",
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
        name: "Integration Health Monitor",
        slug: "integration-health-monitor",
        description:
          "Flags sync failures, stale connections, and broken webhooks across integrations.",
        icon: "Plug",
        permissionKey: "integration-health-monitor",
        capabilities: [
          "Monitor all active integration connections",
          "Detect sync failures and data discrepancies",
          "Flag stale or expired API credentials",
          "Track webhook delivery success rates",
        ],
        howToUse: [
          "Navigate to Integration Center",
          "Review health status for each integration",
          "Acknowledge or resolve flagged issues",
          "Set up alert thresholds per connection",
        ],
        whereToFind: { label: "Integrations", path: "/integrations" },
      },
      {
        name: "Onboarding Checklist AI",
        slug: "onboarding-checklist-ai",
        description: "Generates staff onboarding task lists from Knowledge Base documents.",
        icon: "ClipboardList",
        permissionKey: "onboarding-checklist-ai",
        capabilities: [
          "Parse Knowledge Base documents for onboarding procedures",
          "Generate role-specific task checklists",
          "Track onboarding completion progress",
          "Suggest process improvements from completion data",
        ],
        howToUse: [
          "Navigate to AI Agents and select Onboarding Checklist AI",
          "Choose the role or department for onboarding",
          "Review and customize the generated checklist",
          "Assign tasks to new staff members",
        ],
        whereToFind: { label: "AI Agents", path: "/agents" },
      },
    ],
  },
  reporting: {
    id: "reporting",
    name: "Board & Reporting",
    tagline: "Automated board reports and executive KPI aggregation",
    accentColor: "border-b-indigo-500",
    gradientFrom: "240 70% 50%",
    gradientTo: "260 75% 55%",
    agents: [
      {
        name: "Board Reporting Agent",
        slug: "board-reporting",
        description:
          "Aggregates KPIs, financial snapshots, and engagement metrics from connected systems to generate draft board reports on a scheduled basis.",
        icon: "BarChart3",
        operational: {
          lastFinding:
            "Q1 Board Report draft ready — pulled from Salesforce, Stripe, and grant tracker. 3 KPIs need ED approval before export.",
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

export const allTeams: AgentTeamDef[] = TEAM_DISPLAY_ORDER.map(
  (id) => agentTeams[id]
).filter((t): t is AgentTeamDef => t != null);

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
  "executive-daily-briefer": "Sun",
  "donor-churn-risk": "Heart",
  "strategic-insights": "BookOpen",
  "event-intelligence": "Calendar",
  "board-reporting": "BarChart3",
  "grant-budget-watcher": "AlertTriangle",
  "integration-health-monitor": "Plug",
  "onboarding-checklist-ai": "ClipboardList",
  "meeting-intelligence": "FileText",
  "action-item-tracker": "ListChecks",
};

/** Category color map keyed by team id */
export const CATEGORY_COLORS: Record<string, { from: string; to: string; badge: string }> = {
  meetings: {
    from: "262 83% 58%",
    to: "239 84% 67%",
    badge: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
  },
  executive: {
    from: "30 90% 50%",
    to: "45 95% 55%",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  },
  fundraising: {
    from: "330 80% 55%",
    to: "350 75% 50%",
    badge: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
  },
  "finance-grants": {
    from: "150 70% 40%",
    to: "170 75% 50%",
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  "data-ops": {
    from: "215 70% 45%",
    to: "220 80% 55%",
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  },
  reporting: {
    from: "240 70% 50%",
    to: "260 75% 55%",
    badge: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  },
  general: {
    from: "199 89% 48%",
    to: "187 100% 42%",
    badge: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
  },
};
