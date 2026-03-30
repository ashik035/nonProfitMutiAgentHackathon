/**
 * Nonprofit Demo Data
 *
 * Static demo data for the nonprofit-specific pages.
 * No Supabase queries — these constants are used for UI rendering only.
 * Single source of truth for all demo content across the app.
 */

// ─── Data Health ────────────────────────────────────────────────

export interface MergeSuggestion {
  pair: [string, string];
  confidence: number;
}

export const DEMO_DATA_HEALTH = {
  score: 82,
  duplicates: 12,
  incompleteProfiles: 34,
  householdInconsistencies: 7,
  softCreditAlerts: 3,
  mergeSuggestions: [
    { pair: ["John Smith (ID: 1042)", "John D. Smith (ID: 2318)"] as [string, string], confidence: 94 },
    { pair: ["ABC Foundation (ID: 503)", "A.B.C. Foundation (ID: 891)"] as [string, string], confidence: 87 },
    { pair: ["Mary Johnson (ID: 1205)", "Mary A. Johnson (ID: 3102)"] as [string, string], confidence: 82 },
    { pair: ["Robert Williams (ID: 2201)", "Bob Williams (ID: 3405)"] as [string, string], confidence: 79 },
  ] satisfies MergeSuggestion[],
};

// ─── Mid-Donor Upgrade Opportunities ────────────────────────────

export interface UpgradeDonor {
  name: string;
  avgGiving: number;
  years: number;
  eventsAttended: number;
  score: number;
  readiness: "High Readiness" | "Ready" | "Needs Engagement";
}

export const DEMO_MID_DONOR_UPGRADES = {
  upgradeReady: 47,
  highReadiness: 12,
  newThisMonth: 8,
  donors: [
    { name: "Margaret Chen", avgGiving: 420, years: 4, eventsAttended: 3, score: 94, readiness: "High Readiness" as const },
    { name: "Robert Okafor", avgGiving: 310, years: 5, eventsAttended: 1, score: 78, readiness: "Ready" as const },
    { name: "Susan Park", avgGiving: 275, years: 3, eventsAttended: 2, score: 71, readiness: "Ready" as const },
    { name: "David Kim", avgGiving: 480, years: 6, eventsAttended: 0, score: 55, readiness: "Needs Engagement" as const },
    { name: "Linda Torres", avgGiving: 390, years: 4, eventsAttended: 4, score: 89, readiness: "High Readiness" as const },
  ] satisfies UpgradeDonor[],
};

// ─── Reconciliation ─────────────────────────────────────────────

export interface ReconciliationTransaction {
  id: string;
  description: string;
  amount: number;
  source: string;
  date: string;
  status: "unmatched" | "fee_variance" | "fund_mismatch";
  issue: string;
}

export const DEMO_RECONCILIATION = {
  unmatchedTransactions: 5,
  feeVarianceAlerts: 2,
  restrictedFundMismatches: 1,
  transactionsRequiringReview: 5,
  matchedCount: 142,
  totalCount: 147,
  matchPercentage: 96.6,
  month: "February 2026",
  transactions: [
    {
      id: "TXN-4821",
      description: "Online donation",
      amount: 250.0,
      source: "Stripe",
      date: "Feb 28, 2026",
      status: "unmatched" as const,
      issue: "No matching entry in QuickBooks",
    },
    {
      id: "TXN-4835",
      description: "Event ticket sale",
      amount: 150.0,
      source: "Stripe",
      date: "Mar 1, 2026",
      status: "fee_variance" as const,
      issue: "Fee variance of $3.50 detected",
    },
    {
      id: "TXN-4842",
      description: "Grant disbursement",
      amount: 10000.0,
      source: "QuickBooks",
      date: "Mar 2, 2026",
      status: "fund_mismatch" as const,
      issue: "Restricted fund code mismatch",
    },
    {
      id: "TXN-4856",
      description: "Monthly recurring gift",
      amount: 75.0,
      source: "Stripe",
      date: "Mar 3, 2026",
      status: "unmatched" as const,
      issue: "Donor record not linked in CRM",
    },
    {
      id: "TXN-4861",
      description: "Corporate sponsorship",
      amount: 5000.0,
      source: "PayPal",
      date: "Mar 4, 2026",
      status: "fee_variance" as const,
      issue: "Fee variance of $12.80 detected",
    },
  ] satisfies ReconciliationTransaction[],
};

// ─── Events ─────────────────────────────────────────────────────

export interface FollowUpSuggestion {
  attendee: string;
  suggestion: string;
  priority: "high" | "medium" | "low";
}

export const DEMO_EVENTS = {
  recentEventName: "Annual Gala 2026",
  attendance: 120,
  untaggedAttendees: 15,
  volunteerInterestFlags: 8,
  eventDate: "March 1, 2026",
  followUpSuggestions: [
    {
      attendee: "Sarah Chen",
      suggestion: "Send thank-you email — first-time major donor prospect",
      priority: "high" as const,
    },
    {
      attendee: "Michael Torres",
      suggestion: "Schedule volunteer onboarding — expressed interest in mentorship program",
      priority: "medium" as const,
    },
    {
      attendee: "Lisa Patel",
      suggestion: "Add to board prospect list — corporate partnership opportunity",
      priority: "high" as const,
    },
    {
      attendee: "David Kim",
      suggestion: "Follow up on matching gift program — employer eligible",
      priority: "medium" as const,
    },
    {
      attendee: "Rachel Adams",
      suggestion: "Invite to upcoming volunteer orientation — expressed strong interest",
      priority: "low" as const,
    },
  ] satisfies FollowUpSuggestion[],
};

// ─── Grants ─────────────────────────────────────────────────────

export interface Grant {
  name: string;
  funder: string;
  amount: number;
  utilized: number;
  daysUntilDeadline: number;
  status: "active" | "pending" | "completed";
  nextMilestone?: string;
}

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
      status: "active" as const,
      nextMilestone: "Q1 progress report due",
    },
    {
      name: "Youth Education Grant",
      funder: "Gates Foundation",
      amount: 25000,
      utilized: 45,
      daysUntilDeadline: 12,
      status: "active" as const,
      nextMilestone: "Mid-term evaluation",
    },
    {
      name: "Health Equity Initiative",
      funder: "Robert Wood Johnson",
      amount: 75000,
      utilized: 91,
      daysUntilDeadline: 34,
      status: "active" as const,
      nextMilestone: "Final expenditure review",
    },
    {
      name: "Environmental Justice Program",
      funder: "Kresge Foundation",
      amount: 40000,
      utilized: 35,
      daysUntilDeadline: 60,
      status: "active" as const,
      nextMilestone: "Site visit scheduled",
    },
    {
      name: "Digital Literacy Initiative",
      funder: "Google.org",
      amount: 30000,
      utilized: 60,
      daysUntilDeadline: 45,
      status: "active" as const,
      nextMilestone: "Participant survey due",
    },
    {
      name: "Food Security Partnership",
      funder: "USDA",
      amount: 100000,
      utilized: 22,
      daysUntilDeadline: 90,
      status: "active" as const,
      nextMilestone: "Quarterly financial report",
    },
  ] satisfies Grant[],
};

// ─── Board Report ───────────────────────────────────────────────

export interface FinancialSnapshotItem {
  label: string;
  amount: number;
  change: number;
}

export const DEMO_BOARD_REPORT = {
  status: "Draft Ready",
  generatedDate: "March 9, 2026",
  quarter: "Q1 2026",
  totalDonors: 1240,
  donorGrowth: 8,
  totalRevenue: 284000,
  revenueGoal: 300000,
  revenueVsGoal: 94,
  volunteerHours: 3200,
  programsActive: 7,
  retentionRate: 72,
  newDonors: 156,
  financialSnapshot: [
    { label: "Contributions", amount: 198000, change: 12 },
    { label: "Grant Revenue", amount: 62000, change: -3 },
    { label: "Program Fees", amount: 24000, change: 8 },
    { label: "Operating Expenses", amount: 210000, change: 5 },
  ] satisfies FinancialSnapshotItem[],
};

// ─── AI Agents ──────────────────────────────────────────────────

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

// ─── AI Recommendations ────────────────────────────────────────

export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  source: string;
  severity: "info" | "warning" | "critical" | "success";
  action1: { label: string; href: string };
  action2: { label: string };
  timestamp: string;
}

export const DEMO_AI_RECOMMENDATIONS: AIRecommendation[] = [
  {
    id: "rec-001",
    title: "12 duplicate donor records found",
    description: "The CRM Data Integrity Agent detected 12 potential duplicate records that may inflate your donor count. Review and merge to maintain accurate metrics.",
    source: "CRM Data Integrity Agent",
    severity: "warning",
    action1: { label: "Review Duplicates", href: "/data-health" },
    action2: { label: "Dismiss" },
    timestamp: "2 hours ago",
  },
  {
    id: "rec-002",
    title: "Community Impact Fund deadline in 8 days",
    description: "The Q1 progress report for the Ford Foundation's Community Impact Fund is due March 17. Fund utilization is at 72%.",
    source: "Grant Compliance Agent",
    severity: "critical",
    action1: { label: "View Grant Details", href: "/grants" },
    action2: { label: "Dismiss" },
    timestamp: "3 hours ago",
  },
  {
    id: "rec-003",
    title: "15 gala attendees need CRM tagging",
    description: "Annual Gala 2026 attendees have not been tagged in your CRM. Creating follow-up tasks will help convert event interest into donor engagement.",
    source: "Event Intelligence Agent",
    severity: "warning",
    action1: { label: "View Attendees", href: "/events" },
    action2: { label: "Dismiss" },
    timestamp: "1 hour ago",
  },
  {
    id: "rec-004",
    title: "Q1 board report draft is ready",
    description: "All KPI data sources have been synced and the Q1 2026 board report has been generated. Review the draft before your next board meeting.",
    source: "Board Reporting Agent",
    severity: "success",
    action1: { label: "Review Report", href: "/board-reports" },
    action2: { label: "Dismiss" },
    timestamp: "Today 9am",
  },
  {
    id: "rec-005",
    title: "5 unmatched Stripe transactions",
    description: "Reconciliation detected 5 Stripe transactions with no matching entry in QuickBooks. Review and match to keep your books balanced.",
    source: "Reconciliation Agent",
    severity: "warning",
    action1: { label: "Review Transactions", href: "/reconciliation" },
    action2: { label: "Dismiss" },
    timestamp: "4 hours ago",
  },
  {
    id: "rec-006",
    title: "Health Equity Initiative at 91% utilization",
    description: "Grant spending is approaching the approved budget ceiling. Review spending pace to avoid over-utilization before the reporting deadline.",
    source: "Grant Compliance Agent",
    severity: "critical",
    action1: { label: "View Grant", href: "/grants" },
    action2: { label: "Approve" },
    timestamp: "3 hours ago",
  },
];

// ─── Integrations ───────────────────────────────────────────────

export interface DemoIntegration {
  id: string;
  name: string;
  category: "CRM" | "Finance" | "Payments" | "Events" | "Email" | "Communication";
  description: string;
  logo: string;
  connected: boolean;
  lastSync?: string;
  status?: "healthy" | "warning" | "error";
  syncedRecords?: number;
}

export const DEMO_INTEGRATIONS: DemoIntegration[] = [
  {
    id: "salesforce",
    name: "Salesforce",
    category: "CRM",
    description: "Sync donor records, contacts, and engagement data from your Salesforce NPSP instance.",
    logo: "☁️",
    connected: true,
    lastSync: "2 hours ago",
    status: "healthy",
    syncedRecords: 1240,
  },
  {
    id: "bloomerang",
    name: "Bloomerang",
    category: "CRM",
    description: "Import donor profiles and giving history from Bloomerang for unified data health analysis.",
    logo: "🌸",
    connected: false,
  },
  {
    id: "quickbooks",
    name: "QuickBooks Online",
    category: "Finance",
    description: "Reconcile transactions, track fund accounting, and generate financial snapshots for board reports.",
    logo: "📗",
    connected: true,
    lastSync: "4 hours ago",
    status: "healthy",
    syncedRecords: 847,
  },
  {
    id: "stripe",
    name: "Stripe",
    category: "Payments",
    description: "Process online donations and event payments. Auto-match transactions against your finance system.",
    logo: "💳",
    connected: true,
    lastSync: "1 hour ago",
    status: "warning",
    syncedRecords: 312,
  },
  {
    id: "paypal",
    name: "PayPal",
    category: "Payments",
    description: "Accept donations via PayPal. Transactions are reconciled automatically with QuickBooks.",
    logo: "🅿️",
    connected: false,
  },
  {
    id: "eventbrite",
    name: "Eventbrite",
    category: "Events",
    description: "Import event attendance data, track engagement tags, and surface volunteer interest flags.",
    logo: "🎫",
    connected: true,
    lastSync: "1 hour ago",
    status: "healthy",
    syncedRecords: 120,
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    category: "Email",
    description: "Sync donor segments for targeted email campaigns. Track open rates and engagement metrics.",
    logo: "📧",
    connected: false,
  },
  {
    id: "constant-contact",
    name: "Constant Contact",
    category: "Email",
    description: "Send newsletters and campaign updates to your donor base with engagement tracking.",
    logo: "✉️",
    connected: false,
  },
  {
    id: "slack",
    name: "Slack",
    category: "Communication",
    description: "Receive AI agent alerts and action notifications directly in your Slack workspace.",
    logo: "💬",
    connected: true,
    lastSync: "30 minutes ago",
    status: "healthy",
  },
];
