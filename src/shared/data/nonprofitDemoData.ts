// S4 Agency Audit — items reviewed and addressed:
// - Business Dev: repurposed (see Step 3)
// - Lead Follow-Up: language updated to nonprofit terminology
// - Projects: terminology updated to nonprofit context
// - Admin: agency-specific settings removed

/**
 * Nonprofit Demo Data
 *
 * Static demo data for the nonprofit-specific pages.
 * No Supabase queries — these constants are used for UI rendering only.
 */

export const DEMO_DATA_HEALTH = {
  score: 82,
  duplicates: 12,
  incompleteProfiles: 34,
  householdInconsistencies: 7,
  softCreditAlerts: 3,
};

export const DEMO_RECONCILIATION = {
  unmatchedTransactions: 5,
  feeVarianceAlerts: 2,
  restrictedFundMismatches: 1,
  transactionsRequiringReview: 3,
};

export const DEMO_EVENTS = {
  recentEventName: "Annual Gala 2026",
  attendance: 120,
  untaggedAttendees: 15,
  volunteerInterestFlags: 8,
};

export const DEMO_GRANTS = {
  activeGrants: 6,
  upcomingDeadlines: 2,
  deadlineDaysThreshold: 14,
  grants: [
    {
      name: "Community Impact Fund",
      funder: "Ford Foundation",
      amount: 50000,
      utilized: 72,
      daysUntilDeadline: 8,
    },
    {
      name: "Youth Education Grant",
      funder: "Gates Foundation",
      amount: 25000,
      utilized: 45,
      daysUntilDeadline: 12,
    },
    {
      name: "Health Equity Initiative",
      funder: "Robert Wood Johnson",
      amount: 75000,
      utilized: 91,
      daysUntilDeadline: 34,
    },
  ],
};

export const DEMO_BOARD_REPORT = {
  status: "Draft Ready",
  totalDonors: 1240,
  donorGrowth: 8,
  totalRevenue: 284000,
  revenueVsGoal: 94,
  volunteerHours: 3200,
  programsActive: 7,
};

export interface DemoAgentFinding {
  text: string;
  severity: "amber" | "red" | "green" | "blue";
  time: string;
}

export interface DemoAgentAction {
  text: string;
}

export interface DemoAgent {
  id: string;
  name: string;
  status: "Active" | "Inactive";
  lastRun: string;
  alertCount: number;
  description: string;
  integrations: string[];
  findings: DemoAgentFinding[];
  actions: DemoAgentAction[];
}

export const DEMO_AGENTS: DemoAgent[] = [
  {
    id: "crm-data-integrity",
    name: "CRM Data Integrity Agent",
    status: "Active",
    lastRun: "2 hours ago",
    alertCount: 12,
    description:
      "Continuously scans your CRM for duplicate records, missing required fields, and stale donor profiles. Surfaces merge suggestions and data quality issues for review.",
    integrations: ["Salesforce", "Bloomerang"],
    findings: [
      { text: "12 duplicate donor records detected", severity: "amber", time: "2 hours ago" },
      { text: "34 profiles missing phone or email", severity: "amber", time: "2 hours ago" },
      { text: "7 household records with inconsistent addresses", severity: "blue", time: "3 hours ago" },
    ],
    actions: [
      { text: "Review and approve 12 merge suggestions" },
      { text: "Export incomplete profiles for data entry team" },
    ],
  },
  {
    id: "reconciliation-fund-accounting",
    name: "Reconciliation & Fund Accounting Agent",
    status: "Active",
    lastRun: "4 hours ago",
    alertCount: 3,
    description:
      "Matches incoming transactions from payment processors against your finance system. Flags unmatched payments, fee variances, and restricted fund mismatches.",
    integrations: ["Stripe", "PayPal", "QuickBooks Online"],
    findings: [
      { text: "5 Stripe transactions unmatched in QuickBooks", severity: "amber", time: "4 hours ago" },
      { text: "2 fee variance alerts exceeding threshold", severity: "amber", time: "4 hours ago" },
      { text: "1 restricted fund deposit miscategorized", severity: "red", time: "5 hours ago" },
    ],
    actions: [
      { text: "Review 5 unmatched transactions" },
      { text: "Resolve restricted fund miscategorization" },
    ],
  },
  {
    id: "event-intelligence",
    name: "Event Intelligence Agent",
    status: "Active",
    lastRun: "1 hour ago",
    alertCount: 15,
    description:
      "Analyzes post-event attendance data and suggests engagement tags, volunteer interest flags, and follow-up tasks for attendees not yet connected to your donor pipeline.",
    integrations: ["Eventbrite", "Salesforce"],
    findings: [
      { text: "15 Annual Gala attendees not tagged in CRM", severity: "amber", time: "1 hour ago" },
      { text: "8 attendees flagged potential volunteer interest", severity: "blue", time: "1 hour ago" },
      { text: "3 attendees match existing major donor profiles", severity: "green", time: "1 hour ago" },
    ],
    actions: [
      { text: "Create follow-up tasks for 15 untagged attendees" },
      { text: "Route 8 volunteer prospects to Operations Manager" },
    ],
  },
  {
    id: "board-reporting",
    name: "Board Reporting Agent",
    status: "Active",
    lastRun: "Today 9am",
    alertCount: 0,
    description:
      "Aggregates KPIs, financial snapshots, and engagement metrics from connected systems to generate draft board reports on a scheduled basis.",
    integrations: ["Salesforce", "QuickBooks Online"],
    findings: [
      { text: "Q1 2026 board report draft generated", severity: "green", time: "Today 9am" },
      { text: "All KPI data sources synced successfully", severity: "green", time: "Today 9am" },
      { text: "Financial snapshot reconciled with QuickBooks", severity: "green", time: "Today 9am" },
    ],
    actions: [{ text: "Review and approve Q1 2026 board report draft" }],
  },
  {
    id: "grant-compliance",
    name: "Grant Compliance Agent",
    status: "Active",
    lastRun: "3 hours ago",
    alertCount: 2,
    description:
      "Tracks active grant deadlines, monitors fund utilization against approved budgets, and flags spending anomalies or upcoming reporting requirements.",
    integrations: ["Salesforce", "QuickBooks Online"],
    findings: [
      { text: "Community Impact Fund deadline in 8 days", severity: "red", time: "3 hours ago" },
      { text: "Health Equity Initiative 91% utilized", severity: "amber", time: "3 hours ago" },
      { text: "Youth Education Grant reporting due in 12 days", severity: "amber", time: "3 hours ago" },
    ],
    actions: [
      { text: "Generate compliance summary for Community Impact Fund" },
      { text: "Review Health Equity Initiative spending pace" },
    ],
  },
];
