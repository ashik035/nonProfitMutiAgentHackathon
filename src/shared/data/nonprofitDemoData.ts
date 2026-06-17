/**
 * Nonprofit Demo Data — Brightside Foundation
 *
 * All dates are computed at runtime relative to `new Date()`.
 * No Supabase queries — these constants are used for UI rendering only.
 * Single source of truth for all demo content across the app.
 *
 * Org: Brightside Foundation
 * CRM: Salesforce (connected) | Payment: Stripe (connected)
 * Annual budget: $2.4M | Active donors: 1,847 | Staff: 23
 */

import { format, subHours, subDays, subMinutes, addDays } from "date-fns";

// ─── Date Helpers ───────────────────────────────────────────────

const NOW = new Date();

/** Random hours ago between min and max */
export function hoursAgo(min: number, max: number): string {
  const h = Math.floor(min + Math.random() * (max - min));
  if (h < 1) return "just now";
  if (h === 1) return "1 hour ago";
  return `${h} hours ago`;
}

/** Format a date relative to now */
function formatRelativeDate(date: Date): string {
  return format(date, "MMM d, yyyy");
}

function formatShortDate(date: Date): string {
  return format(date, "MMM d");
}

function formatTime(date: Date): string {
  return format(date, "h:mm a");
}

/** "Today 9:15 AM" style */
function todayAt(hours: number, minutes: number): string {
  const d = new Date(NOW);
  d.setHours(hours, minutes, 0, 0);
  return `Today ${formatTime(d)}`;
}

// Pre-compute some stable "ago" strings so they don't change on re-render
const LAST_SYNC_SALESFORCE = hoursAgo(1, 3);
const LAST_SYNC_QBO = hoursAgo(3, 5);
const LAST_SYNC_STRIPE = hoursAgo(1, 2);
const LAST_SYNC_EVENTBRITE = hoursAgo(1, 2);
const LAST_SYNC_SLACK = `${Math.floor(15 + Math.random() * 30)} minutes ago`;

const AGENT_RUN_CRM = hoursAgo(1, 3);
const AGENT_RUN_RECON = hoursAgo(3, 5);
const AGENT_RUN_EVENT = hoursAgo(1, 2);
const AGENT_RUN_BOARD = todayAt(9, 0);
const AGENT_RUN_GRANT = hoursAgo(2, 4);

// ─── Data Health ────────────────────────────────────────────────

export interface MergeSuggestion {
  pair: [string, string];
  confidence: number;
}

export const DEMO_DATA_HEALTH = {
  score: 74,
  duplicates: 3,
  incompleteProfiles: 8,
  householdInconsistencies: 3,
  softCreditAlerts: 3,
  mergeSuggestions: [
    { pair: ["Sarah Chen (ID: 1847)", "Sarah Chen (ID: 2103)"] as [string, string], confidence: 94 },
    { pair: ["Michael Torres (ID: 892)", "Michael Torres (ID: 1654)"] as [string, string], confidence: 87 },
    { pair: ["Jennifer Walsh (ID: 3021)", "Jennifer Walsh (ID: 3089)"] as [string, string], confidence: 99 },
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
  unmatchedTransactions: 1,
  feeVarianceAlerts: 0,
  restrictedFundMismatches: 0,
  transactionsRequiringReview: 1,
  matchedCount: 146,
  totalCount: 147,
  matchPercentage: 99.3,
  month: format(NOW, "MMMM yyyy"),
  transactions: [
    {
      id: "TXN-4821",
      description: "Online donation — M. Chen",
      amount: 2340.0,
      source: "Stripe",
      date: "April 6, 2026",
      status: "unmatched" as const,
      issue: "No matching donor record in Salesforce",
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
  recentEventName: "Annual Spring Gala",
  attendance: 247,
  untaggedAttendees: 47,
  volunteerInterestFlags: 12,
  eventDate: formatRelativeDate(subDays(NOW, 5)),
  secondEvent: {
    name: "Community Open House",
    attendance: 85,
    date: formatRelativeDate(subDays(NOW, 12)),
  },
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
  deadlineDate: string;
  status: "active" | "pending" | "completed";
  nextMilestone?: string;
}

export const DEMO_GRANTS = {
  activeGrants: 4,
  upcomingDeadlines: 2,
  deadlineDaysThreshold: 14,
  grants: [
    {
      name: "Community Health Initiative",
      funder: "Kresge Foundation",
      amount: 185000,
      utilized: 61,
      daysUntilDeadline: 8,
      deadlineDate: formatRelativeDate(addDays(NOW, 8)),
      status: "active" as const,
      nextMilestone: "Q1 progress report due",
    },
    {
      name: "Youth Programs Initiative",
      funder: "Robert Wood Johnson Foundation",
      amount: 95000,
      utilized: 88,
      daysUntilDeadline: 31,
      deadlineDate: formatRelativeDate(addDays(NOW, 31)),
      status: "active" as const,
      nextMilestone: "Participant survey results",
    },
    {
      name: "Technology Access Fund",
      funder: "Gates Foundation",
      amount: 125000,
      utilized: 44,
      daysUntilDeadline: 83,
      deadlineDate: formatRelativeDate(addDays(NOW, 83)),
      status: "active" as const,
      nextMilestone: "Mid-year progress report",
    },
    {
      name: "Housing Support Initiative",
      funder: "Local Community Foundation",
      amount: 92000,
      utilized: 71,
      daysUntilDeadline: 52,
      deadlineDate: formatRelativeDate(addDays(NOW, 52)),
      status: "active" as const,
      nextMilestone: "Mid-program evaluation",
    },
  ] satisfies Grant[],
};

// ─── Board Report ───────────────────────────────────────────────

export interface FinancialSnapshotItem {
  label: string;
  amount: number;
  change: number;
}

const currentQuarter = `Q${Math.ceil((NOW.getMonth() + 1) / 3)} ${NOW.getFullYear()}`;

export const ORG_NAME = "Brightside Foundation";

export const DEMO_BOARD_REPORT = {
  status: "Pending ED Approval",
  generatedDate: formatRelativeDate(NOW),
  quarter: currentQuarter,
  totalDonors: 1847,
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

export interface BoardReportFinancialRow {
  metric: string;
  target: string;
  actual: string;
  variance: number;
}

export interface BoardReportDonorMetric {
  label: string;
  value: string;
  detail?: string;
}

export interface BoardReportGrantRow {
  grant: string;
  funder: string;
  amount: string;
  status: string;
  utilization: number;
}

export interface BoardReportDataHealthItem {
  label: string;
  value: string;
}

export const DEMO_BOARD_REPORT_SECTIONS = {
  executiveSummary: `${ORG_NAME} closed ${currentQuarter} with $487,000 in revenue against a $510,000 target (95%). Major gift activity increased 18% year-over-year. Two grant reports are due in the next 30 days.`,
  financialRows: [
    { metric: "Total Revenue", target: "$510,000", actual: "$487,000", variance: -4.5 },
    { metric: "Major Gifts", target: "$210,000", actual: "$248,000", variance: 18.1 },
    { metric: "Events Revenue", target: "$160,000", actual: "$142,000", variance: -11.3 },
    { metric: "Foundation Grants", target: "$140,000", actual: "$97,000", variance: -30.7 },
  ] satisfies BoardReportFinancialRow[],
  donorMetrics: [
    { label: "Active Donors", value: "1,847", detail: "↑ 23 vs prior quarter" },
    { label: "New Donors Acquired", value: "94" },
    { label: "Lapsed Donors Recovered", value: "12" },
    { label: "Mid-Level Upgrades in Pipeline", value: "8" },
  ] satisfies BoardReportDonorMetric[],
  grantRows: [
    { grant: "Community Health Initiative", funder: "Kresge Foundation", amount: "$185,000", status: "Report due Apr 16", utilization: 61 },
    { grant: "Youth Programs", funder: "Robert Wood Johnson", amount: "$95,000", status: "On track", utilization: 88 },
    { grant: "Technology Access", funder: "Gates Foundation", amount: "$125,000", status: "Active", utilization: 44 },
    { grant: "Housing Support", funder: "Local Community Foundation", amount: "$92,000", status: "Active", utilization: 71 },
  ] satisfies BoardReportGrantRow[],
  dataHealth: [
    { label: "Data Health Score", value: "74%" },
    { label: `Duplicates Resolved (${currentQuarter})`, value: "7" },
    { label: "Records Updated by AI", value: "143" },
  ] satisfies BoardReportDataHealthItem[],
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
    lastRun: AGENT_RUN_CRM,
    alertCount: 3,
    description:
      "Continuously scans your CRM for duplicate records, missing required fields, and stale donor profiles. Surfaces merge suggestions and data quality issues for review.",
    integrations: ["Salesforce", "Bloomerang"],
    findings: [
      { text: "3 duplicate donor records detected", severity: "amber", time: AGENT_RUN_CRM },
      { text: "8 profiles missing phone or email", severity: "amber", time: AGENT_RUN_CRM },
      { text: "3 household records with inconsistent addresses", severity: "blue", time: hoursAgo(2, 4) },
    ],
    actions: [
      { text: "Review and approve 3 merge suggestions" },
      { text: "Export incomplete profiles for data entry team" },
    ],
  },
  {
    id: "reconciliation-fund-accounting",
    name: "Reconciliation & Fund Accounting Agent",
    status: "Active",
    lastRun: AGENT_RUN_RECON,
    alertCount: 3,
    description:
      "Matches incoming transactions from payment processors against your finance system. Flags unmatched payments, fee variances, and restricted fund mismatches.",
    integrations: ["Stripe", "PayPal", "QuickBooks Online"],
    findings: [
      { text: "1 Stripe transaction unmatched in Salesforce", severity: "amber", time: AGENT_RUN_RECON },
      { text: "146 of 147 April transactions matched", severity: "green", time: AGENT_RUN_RECON },
    ],
    actions: [
      { text: "Review 1 unmatched transaction ($2,340)" },
      { text: "Resolve restricted fund miscategorization" },
    ],
  },
  {
    id: "event-intelligence",
    name: "Event Intelligence Agent",
    status: "Active",
    lastRun: AGENT_RUN_EVENT,
    alertCount: 15,
    description:
      "Analyzes post-event attendance data and suggests engagement tags, volunteer interest flags, and follow-up tasks for attendees not yet connected to your donor pipeline.",
    integrations: ["Eventbrite", "Salesforce"],
    findings: [
      { text: "15 Annual Gala attendees not tagged in CRM", severity: "amber", time: AGENT_RUN_EVENT },
      { text: "8 attendees flagged potential volunteer interest", severity: "blue", time: AGENT_RUN_EVENT },
      { text: "3 attendees match existing major donor profiles", severity: "green", time: AGENT_RUN_EVENT },
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
    lastRun: AGENT_RUN_BOARD,
    alertCount: 0,
    description:
      "Aggregates KPIs, financial snapshots, and engagement metrics from connected systems to generate draft board reports on a scheduled basis.",
    integrations: ["Salesforce", "QuickBooks Online"],
    findings: [
      { text: `${currentQuarter} board report draft generated`, severity: "green", time: AGENT_RUN_BOARD },
      { text: "All KPI data sources synced successfully", severity: "green", time: AGENT_RUN_BOARD },
      { text: "Financial snapshot reconciled with QuickBooks", severity: "green", time: AGENT_RUN_BOARD },
    ],
    actions: [{ text: `Review and approve ${currentQuarter} board report draft` }],
  },
  {
    id: "grant-compliance",
    name: "Grant Compliance Agent",
    status: "Active",
    lastRun: AGENT_RUN_GRANT,
    alertCount: 2,
    description:
      "Tracks active grant deadlines, monitors fund utilization against approved budgets, and flags spending anomalies or upcoming reporting requirements.",
    integrations: ["Salesforce", "QuickBooks Online"],
    findings: [
      { text: "Community Impact Fund deadline in 8 days", severity: "red", time: AGENT_RUN_GRANT },
      { text: "Health Equity Initiative 91% utilized", severity: "amber", time: AGENT_RUN_GRANT },
      { text: "Youth Education Grant reporting due in 12 days", severity: "amber", time: AGENT_RUN_GRANT },
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
    title: "3 duplicate donor records found",
    description: "The CRM Data Integrity Agent detected 3 potential duplicate records that may inflate your donor count. Review and merge to maintain accurate metrics.",
    source: "CRM Data Integrity Agent",
    severity: "warning",
    action1: { label: "Review Duplicates", href: "/data-health" },
    action2: { label: "Dismiss" },
    timestamp: AGENT_RUN_CRM,
  },
  {
    id: "rec-002",
    title: "Kresge Foundation report due in 8 days",
    description: `The Q1 progress report for the Kresge Foundation's Community Health Initiative is due ${formatShortDate(addDays(NOW, 8))}. Fund utilization is at 61%.`,
    source: "Grant Compliance Agent",
    severity: "critical",
    action1: { label: "View Grant Details", href: "/grants" },
    action2: { label: "Dismiss" },
    timestamp: AGENT_RUN_GRANT,
  },
  {
    id: "rec-003",
    title: "47 gala attendees need CRM tagging",
    description: "Spring Gala 2026 attendees have not been tagged in Salesforce. Creating follow-up tasks will help convert event interest into donor engagement.",
    source: "Event Intelligence Agent",
    severity: "warning",
    action1: { label: "View Attendees", href: "/events" },
    action2: { label: "Dismiss" },
    timestamp: AGENT_RUN_EVENT,
  },
  {
    id: "rec-004",
    title: `${currentQuarter} board report draft is ready`,
    description: `All KPI data sources have been synced and the ${currentQuarter} board report is pending ED approval. Review the draft before your next board meeting.`,
    source: "Board Reporting Agent",
    severity: "success",
    action1: { label: "Review Report", href: "/board-reports" },
    action2: { label: "Dismiss" },
    timestamp: AGENT_RUN_BOARD,
  },
  {
    id: "rec-005",
    title: "1 unmatched Stripe transaction",
    description: "Reconciliation detected 1 Stripe transaction ($2,340 from Apr 6) with no matching donor record in Salesforce. Review and match to keep your books balanced.",
    source: "Reconciliation Agent",
    severity: "warning",
    action1: { label: "Review Transactions", href: "/reconciliation" },
    action2: { label: "Dismiss" },
    timestamp: AGENT_RUN_RECON,
  },
  {
    id: "rec-006",
    title: "Youth Programs Initiative at 88% utilization",
    description: "Grant spending is approaching the approved budget ceiling. Review spending pace before the next reporting deadline.",
    source: "Grant Compliance Agent",
    severity: "critical",
    action1: { label: "View Grant", href: "/grants" },
    action2: { label: "Approve" },
    timestamp: AGENT_RUN_GRANT,
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
    lastSync: LAST_SYNC_SALESFORCE,
    status: "healthy",
    syncedRecords: 1847,
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
    lastSync: LAST_SYNC_QBO,
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
    lastSync: LAST_SYNC_STRIPE,
    status: "healthy",
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
    lastSync: LAST_SYNC_EVENTBRITE,
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
    lastSync: LAST_SYNC_SLACK,
    status: "healthy",
  },
];

// ─── Dashboard Activity Feed ────────────────────────────────────

export interface ActivityFeedItem {
  id: string;
  action: string;
  timestamp: string;
  icon: "agent" | "sync" | "user" | "alert";
}

export const DEMO_ACTIVITY_FEED: ActivityFeedItem[] = [
  { id: "af-1", action: "CRM Data Integrity Agent completed scan — 12 issues found", timestamp: AGENT_RUN_CRM, icon: "agent" },
  { id: "af-2", action: "Salesforce sync completed — 1,847 records updated", timestamp: LAST_SYNC_SALESFORCE, icon: "sync" },
  { id: "af-3", action: "Board Reporting Agent generated draft report", timestamp: AGENT_RUN_BOARD, icon: "agent" },
  { id: "af-4", action: "Grant Compliance Agent flagged 2 upcoming deadlines", timestamp: AGENT_RUN_GRANT, icon: "alert" },
  { id: "af-5", action: "Lisa Patel logged in", timestamp: `${Math.floor(1 + Math.random() * 2)} days ago`, icon: "user" },
  { id: "af-6", action: "Stripe sync completed — 312 transactions matched", timestamp: LAST_SYNC_STRIPE, icon: "sync" },
];

// ─── Org Constants ──────────────────────────────────────────────

export const DEMO_ORG = {
  name: "Brightside Foundation",
  crm: "Salesforce",
  paymentProcessor: "Stripe",
  annualBudget: 2400000,
  activeDonors: 1847,
  staff: 23,
  lastSyncLabel: `Data sourced from Salesforce — Last synced: ${todayAt(9, 15)}`,
};

// ─── Voice Notes ─────────────────────────────────────────────────

export interface DonorSignals {
  givingCapacity: string | null;
  askTiming: string | null;
  interests: string | null;
  avoid: string | null;
  decisionMakers: string | null;
  upgradePotential: {
    isCandidate: boolean;
    suggestedAmount: string | null;
  };
  summary: string;
}

export interface VoiceNote {
  id: string;
  donorName: string;
  recordedAt: Date;
  durationSeconds: number;
  transcript: string;
  signals: DonorSignals;
}

const _vnNow = new Date();
const _hoursAgo = (h: number) => new Date(_vnNow.getTime() - h * 60 * 60 * 1000);
const _daysAgo = (d: number) => new Date(_vnNow.getTime() - d * 24 * 60 * 60 * 1000);

export const demoVoiceNotes: VoiceNote[] = [
  {
    id: 'vn1',
    donorName: 'Margaret Liu',
    recordedAt: _hoursAgo(2),
    durationSeconds: 94,
    transcript:
      "Margaret is really interested in the naming opportunity for the youth room. Her husband David needs to be part of the conversation — he controls their finances. She mentioned her company is doing really well this year and her bonus is likely coming in Q3. Do not bring up the gala sponsorship — she felt a bit burned by last year's experience. I think she's a strong candidate for Generous1000 at the five thousand dollar level, maybe higher if David is on board.",
    signals: {
      givingCapacity: 'Company performing well, Q3 bonus expected',
      askTiming: 'Q3 or later, after bonus',
      interests: 'Youth room naming opportunity',
      avoid: 'Gala sponsorship — negative experience last year',
      decisionMakers: 'Husband David must be included in ask conversation',
      upgradePotential: { isCandidate: true, suggestedAmount: '$5,000' },
      summary:
        "Strong Generous1000 candidate at $5K — involve husband David, wait for Q3 bonus",
    },
  },
  {
    id: 'vn2',
    donorName: 'Susan Park',
    recordedAt: _daysAgo(1),
    durationSeconds: 67,
    transcript:
      "Susan had a great call today. She mentioned her company had a really strong Q4 and she's feeling generous this year. She asked specifically about the technology access program and seemed very excited about the digital literacy work. I think she's ready to be asked at the ten thousand dollar level, possibly higher. She said she wants to see the impact report before the ask.",
    signals: {
      givingCapacity: 'Company had strong Q4, feeling generous',
      askTiming: 'After receiving impact report',
      interests: 'Technology access program, digital literacy',
      avoid: null,
      decisionMakers: null,
      upgradePotential: { isCandidate: true, suggestedAmount: '$10,000' },
      summary:
        'Ready for $10K ask — send impact report first, emphasize digital literacy',
    },
  },
  {
    id: 'vn3',
    donorName: 'Mark Abrams',
    recordedAt: _daysAgo(2),
    durationSeconds: 81,
    transcript:
      "Mark wants to meet with the ED before making any commitment. He's scheduled for April 15th. He's interested in the youth programs but wants to understand the long-term impact metrics. He mentioned he typically makes his charitable decisions in November so the timing might need to shift. His wife is also a donor independently and we should be careful not to double ask.",
    signals: {
      givingCapacity: null,
      askTiming: 'November — makes charitable decisions then',
      interests: 'Youth programs, long-term impact metrics',
      avoid: 'Do not double-ask — wife is also an independent donor',
      decisionMakers: 'Wants ED meeting first (scheduled Apr 15)',
      upgradePotential: { isCandidate: true, suggestedAmount: '$7,500' },
      summary: "ED meeting Apr 15 — ask in November, coordinate with wife's giving",
    },
  },
  {
    id: 'vn4',
    donorName: 'Thomas Rivera',
    recordedAt: _daysAgo(3),
    durationSeconds: 45,
    transcript:
      'Thomas confirmed his pledge of five thousand dollars. He prefers to pay by check and asked us to send the pledge reminder in June. He wants the gift credited to the general operating fund. Very warm and committed — this is a done deal.',
    signals: {
      givingCapacity: null,
      askTiming: 'Send pledge reminder in June',
      interests: 'General operating fund',
      avoid: null,
      decisionMakers: null,
      upgradePotential: { isCandidate: false, suggestedAmount: null },
      summary:
        'Pledge confirmed at $5,000 — check payment, send reminder June, general operating fund',
    },
  },
  {
    id: 'vn5',
    donorName: 'Jennifer Walsh',
    recordedAt: _daysAgo(4),
    durationSeconds: 112,
    transcript:
      "Jennifer was incredibly warm on the call. She mentioned that her late mother was passionate about youth education and that supporting Brightside feels personal to her. She's very interested in the naming opportunity for the youth programs room — this could be a legacy gift situation. She said she wants to bring her daughter to a site visit before making a final decision. I think we could ask her at the twenty-five thousand dollar level for a naming gift.",
    signals: {
      givingCapacity: 'Emotionally motivated — memorial/legacy giving potential',
      askTiming: 'After daughter site visit',
      interests: 'Youth programs room naming — legacy/memorial gift for late mother',
      avoid: null,
      decisionMakers: 'Daughter should be included in site visit',
      upgradePotential: { isCandidate: true, suggestedAmount: '$25,000' },
      summary:
        "Major gift potential at $25K naming gift — schedule site visit with daughter first",
    },
  },
];

export const demoDonorNames = [
  'Margaret Liu',
  'Robert Kim',
  'Patricia Osei',
  'David Chen',
  'Susan Park',
  'Jennifer Walsh',
  'Mark Abrams',
  'Thomas Rivera',
  'Carol Nguyen',
  'Sarah Chen',
  'Michael Torres',
  'Sarah Mitchell',
];

// ─── Agent Activity Feed ────────────────────────────────────────

export interface AgentActivityRun {
  id: string;
  agentName: string;
  agentSlug: string;
  team: string;
  action: string;
  outcome: string;
  timestamp: string;
  status: "success" | "running" | "failed";
  completedAt: Date;
  hoursSaved: number;
}

export const DEMO_AGENT_ACTIVITY: AgentActivityRun[] = [
  { id: "run-001", agentName: "CRM Data Integrity Agent", agentSlug: "crm-data-integrity", team: "Core Operations", action: "Full CRM scan", outcome: "3 duplicate records flagged, 8 incomplete profiles identified", timestamp: AGENT_RUN_CRM, status: "success", completedAt: subDays(NOW, 2), hoursSaved: 2.5 },
  { id: "run-002", agentName: "Grant Compliance Agent", agentSlug: "grant-compliance", team: "Core Operations", action: "Deadline monitoring", outcome: "Kresge Foundation report due in 8 days, utilization at 61%", timestamp: AGENT_RUN_GRANT, status: "success", completedAt: subDays(NOW, 3), hoursSaved: 1.5 },
  { id: "run-003", agentName: "Board Reporting Agent", agentSlug: "board-reporting", team: "Core Operations", action: "Report generation", outcome: `${currentQuarter} board report draft generated — pending ED approval`, timestamp: AGENT_RUN_BOARD, status: "success", completedAt: subDays(NOW, 1), hoursSaved: 4 },
  { id: "run-004", agentName: "Event Intelligence Agent", agentSlug: "event-intelligence", team: "Core Operations", action: "Post-event analysis", outcome: "47 Spring Gala attendees not tagged in Salesforce, 12 volunteer prospects found", timestamp: AGENT_RUN_EVENT, status: "success", completedAt: subDays(NOW, 1), hoursSaved: 2 },
  { id: "run-005", agentName: "Reconciliation Agent", agentSlug: "reconciliation-fund-accounting", team: "Core Operations", action: "Transaction matching", outcome: "146/147 transactions matched, 1 requires manual review ($2,340)", timestamp: AGENT_RUN_RECON, status: "success", completedAt: subDays(NOW, 4), hoursSaved: 1.5 },
  { id: "run-006", agentName: "Grant Budget Watcher", agentSlug: "grant-budget-watcher", team: "Finance", action: "Budget utilization check", outcome: "Youth Programs Initiative at 88% — review recommended", timestamp: hoursAgo(2, 4), status: "success", completedAt: subDays(NOW, 2), hoursSaved: 1 },
  { id: "run-007", agentName: "Integration Health Monitor", agentSlug: "integration-health-monitor", team: "Operations", action: "System connectivity check", outcome: "All 4 integrations healthy, Salesforce API latency elevated", timestamp: hoursAgo(1, 3), status: "success", completedAt: subDays(NOW, 1), hoursSaved: 0.5 },
  { id: "run-008", agentName: "CRM Data Integrity Agent", agentSlug: "crm-data-integrity", team: "Core Operations", action: "Incremental scan", outcome: "Scan in progress — analyzing 200 records...", timestamp: "just now", status: "running", completedAt: NOW, hoursSaved: 0 },
  { id: "run-009", agentName: "Onboarding Checklist AI", agentSlug: "onboarding-checklist-ai", team: "Operations", action: "New hire checklist generation", outcome: "Failed to generate — knowledge base documents unavailable", timestamp: hoursAgo(5, 8), status: "failed", completedAt: subDays(NOW, 5), hoursSaved: 0 },
  { id: "run-010", agentName: "Event Intelligence Agent", agentSlug: "event-intelligence", team: "Core Operations", action: "Volunteer matching", outcome: "3 attendees matched to existing major donor profiles", timestamp: hoursAgo(6, 10), status: "success", completedAt: subDays(NOW, 5), hoursSaved: 1 },
  { id: "run-011", agentName: "Board Reporting Agent", agentSlug: "board-reporting", team: "Core Operations", action: "Financial snapshot sync", outcome: "Q2 revenue and grant utilization data refreshed", timestamp: hoursAgo(8, 12), status: "success", completedAt: subDays(NOW, 3), hoursSaved: 2 },
  { id: "run-012", agentName: "Reconciliation Agent", agentSlug: "reconciliation-fund-accounting", team: "Core Operations", action: "April ledger review", outcome: "10 matched transactions auto-posted to Salesforce", timestamp: hoursAgo(10, 14), status: "success", completedAt: subDays(NOW, 6), hoursSaved: 1.5 },
  { id: "run-013", agentName: "Grant Compliance Agent", agentSlug: "grant-compliance", team: "Core Operations", action: "Deliverable tracking", outcome: "4 active grants reviewed — 2 reports due within 30 days", timestamp: hoursAgo(12, 16), status: "success", completedAt: subDays(NOW, 4), hoursSaved: 1.5 },
  { id: "run-014", agentName: "CRM Data Integrity Agent", agentSlug: "crm-data-integrity", team: "Core Operations", action: "Stripe-Salesforce cross-check", outcome: "1 unmatched Stripe transaction flagged for review", timestamp: hoursAgo(4, 6), status: "success", completedAt: subDays(NOW, 1), hoursSaved: 1 },
];

// ─── Donor Retention ────────────────────────────────────────────

export interface AtRiskDonor {
  id: string;
  name: string;
  lastGiftDate: string;
  lastGiftAmount: number;
  daysSinceLastGift: number;
  totalGiving: number;
  segment: string;
}

export const DEMO_DONOR_RETENTION = {
  retentionRate: 72,
  lastYearRetentionRate: 68,
  lybuntCount: 47,
  atRiskCount: 23,
  retentionTrend: [
    { year: NOW.getFullYear() - 3, rate: 65 },
    { year: NOW.getFullYear() - 2, rate: 68 },
    { year: NOW.getFullYear() - 1, rate: 68 },
    { year: NOW.getFullYear(), rate: 72 },
  ],
  atRiskDonors: [
    { id: "d-001", name: "James Wilson", lastGiftDate: formatRelativeDate(subDays(NOW, 320)), lastGiftAmount: 250, daysSinceLastGift: 320, totalGiving: 1800, segment: "Mid-Level" },
    { id: "d-003", name: "Patricia Osei", lastGiftDate: formatRelativeDate(subDays(NOW, 290)), lastGiftAmount: 1000, daysSinceLastGift: 290, totalGiving: 5400, segment: "Major Donor" },
    { id: "d-004", name: "Robert Kim", lastGiftDate: formatRelativeDate(subDays(NOW, 275)), lastGiftAmount: 150, daysSinceLastGift: 275, totalGiving: 900, segment: "Regular" },
    { id: "d-005", name: "Nancy Thompson", lastGiftDate: formatRelativeDate(subDays(NOW, 400)), lastGiftAmount: 75, daysSinceLastGift: 400, totalGiving: 450, segment: "Regular" },
    { id: "d-006", name: "William Davis", lastGiftDate: formatRelativeDate(subDays(NOW, 350)), lastGiftAmount: 2000, daysSinceLastGift: 350, totalGiving: 8500, segment: "Major Donor" },
  ] satisfies AtRiskDonor[],
};

// ─── Programs / Impact Tracker ──────────────────────────────────

export interface ProgramMetrics {
  beneficiaryCount: number;
  volunteerHours: number;
  budgetUsed: number;
  budgetTotal: number;
  outcomesAchieved: number;
  outcomesTarget: number;
}

export interface DemoProgram {
  id: string;
  name: string;
  description: string;
  startDate: string;
  status: "active" | "completed" | "planning";
  leadStaff: string;
  metrics: ProgramMetrics;
}

export const DEMO_PROGRAMS: DemoProgram[] = [
  {
    id: "prog-001", name: "Youth Mentorship Program", description: "One-on-one mentorship pairing at-risk youth with community leaders for academic and career guidance.",
    startDate: formatRelativeDate(subDays(NOW, 180)), status: "active", leadStaff: "Maria Santos",
    metrics: { beneficiaryCount: 85, volunteerHours: 1200, budgetUsed: 42000, budgetTotal: 50000, outcomesAchieved: 62, outcomesTarget: 80 },
  },
  {
    id: "prog-002", name: "Community Health Initiative", description: "Free health screenings and wellness workshops in underserved neighborhoods.",
    startDate: formatRelativeDate(subDays(NOW, 365)), status: "active", leadStaff: "Dr. James Lee",
    metrics: { beneficiaryCount: 320, volunteerHours: 800, budgetUsed: 68000, budgetTotal: 75000, outcomesAchieved: 290, outcomesTarget: 300 },
  },
  {
    id: "prog-003", name: "Digital Literacy Workshop", description: "Teaching basic computer and internet skills to senior citizens and low-income families.",
    startDate: formatRelativeDate(subDays(NOW, 90)), status: "active", leadStaff: "Kevin Park",
    metrics: { beneficiaryCount: 45, volunteerHours: 380, budgetUsed: 12000, budgetTotal: 25000, outcomesAchieved: 30, outcomesTarget: 60 },
  },
  {
    id: "prog-004", name: "Food Security Network", description: "Weekly food distribution and nutrition education in partnership with local farms and grocers.",
    startDate: formatRelativeDate(subDays(NOW, 730)), status: "active", leadStaff: "Linda Chen",
    metrics: { beneficiaryCount: 500, volunteerHours: 2100, budgetUsed: 95000, budgetTotal: 100000, outcomesAchieved: 480, outcomesTarget: 500 },
  },
  {
    id: "prog-005", name: "Summer Arts Camp", description: "Two-week intensive arts and creativity camp for children ages 8-14.",
    startDate: formatRelativeDate(subDays(NOW, 400)), status: "completed", leadStaff: "Rachel Adams",
    metrics: { beneficiaryCount: 60, volunteerHours: 450, budgetUsed: 18000, budgetTotal: 18000, outcomesAchieved: 58, outcomesTarget: 60 },
  },
];

// ─── Communications ─────────────────────────────────────────────

export interface SentEmail {
  id: string;
  date: string;
  segment: string;
  subject: string;
  recipientCount: number;
  openRate: number;
  clickRate: number;
}

export interface ThankYouItem {
  id: string;
  donorName: string;
  donationAmount: number;
  donationDate: string;
  thankYouSent: boolean;
}

export const DEMO_COMMUNICATIONS = {
  segments: ["All Donors", "LYBUNT", "Major Donors ($500+)", "First-Time Donors", "Event Attendees"],
  sentEmails: [
    { id: "em-001", date: formatRelativeDate(subDays(NOW, 3)), segment: "All Donors", subject: "Spring Newsletter — Impact Update", recipientCount: 1847, openRate: 42, clickRate: 8 },
    { id: "em-002", date: formatRelativeDate(subDays(NOW, 10)), segment: "LYBUNT", subject: "We Miss You — Your Impact Matters", recipientCount: 47, openRate: 38, clickRate: 12 },
    { id: "em-003", date: formatRelativeDate(subDays(NOW, 18)), segment: "Major Donors ($500+)", subject: "Exclusive: Behind the Scenes at Brightside", recipientCount: 124, openRate: 56, clickRate: 22 },
    { id: "em-004", date: formatRelativeDate(subDays(NOW, 25)), segment: "Event Attendees", subject: "Thank You for Attending the Spring Gala!", recipientCount: 120, openRate: 61, clickRate: 15 },
    { id: "em-005", date: formatRelativeDate(subDays(NOW, 35)), segment: "First-Time Donors", subject: "Welcome to the Brightside Family", recipientCount: 56, openRate: 48, clickRate: 18 },
  ] satisfies SentEmail[],
  thankYouQueue: [
    { id: "ty-001", donorName: "Sarah Mitchell", donationAmount: 250, donationDate: formatRelativeDate(subDays(NOW, 1)), thankYouSent: false },
    { id: "ty-002", donorName: "David Chen", donationAmount: 500, donationDate: formatRelativeDate(subDays(NOW, 2)), thankYouSent: false },
    { id: "ty-003", donorName: "Emily Watson", donationAmount: 100, donationDate: formatRelativeDate(subDays(NOW, 2)), thankYouSent: false },
    { id: "ty-004", donorName: "Michael Torres", donationAmount: 1000, donationDate: formatRelativeDate(subDays(NOW, 3)), thankYouSent: false },
    { id: "ty-005", donorName: "Lisa Patel", donationAmount: 75, donationDate: formatRelativeDate(subDays(NOW, 4)), thankYouSent: false },
  ] satisfies ThankYouItem[],
};

// ─── Board Report History ───────────────────────────────────────

export interface BoardReportHistoryItem {
  id: string;
  title: string;
  generatedDate: string;
  generatedBy: string;
  quarter: string;
  status: "published" | "draft" | "archived";
}

const prevQuarter = `Q${Math.ceil((NOW.getMonth()) / 3) || 4} ${Math.ceil((NOW.getMonth()) / 3) === 0 ? NOW.getFullYear() - 1 : NOW.getFullYear()}`;

export const DEMO_BOARD_REPORT_HISTORY: BoardReportHistoryItem[] = [
  { id: "br-001", title: `${currentQuarter} Board Packet`, generatedDate: formatRelativeDate(NOW), generatedBy: "AI Assistant", quarter: currentQuarter, status: "draft" },
  { id: "br-002", title: `${prevQuarter} Board Packet`, generatedDate: formatRelativeDate(subDays(NOW, 90)), generatedBy: "Lisa Patel", quarter: prevQuarter, status: "published" },
  { id: "br-003", title: "Annual Summary Report", generatedDate: formatRelativeDate(subDays(NOW, 180)), generatedBy: "AI Assistant", quarter: `FY${NOW.getFullYear() - 1}`, status: "archived" },
];

// ─── Membership ──────────────────────────────────────────────────

export type MemberTier = "General" | "Professional" | "Board" | "Honorary";
export type MemberStatus = "Active" | "Expiring" | "Lapsed" | "Pending";

export interface DemoMember {
  id: string;
  name: string;
  email: string;
  tier: MemberTier;
  status: MemberStatus;
  joinDate: string;
  renewalDate: string;
  phone?: string;
  employer?: string;
  interests: string[];
}

export const DEMO_MEMBERS: DemoMember[] = [
  // General — 9 members
  { id: "m-01", name: "Angela Torres", email: "angela.torres@email.com", tier: "General", status: "Active", joinDate: formatRelativeDate(subDays(NOW, 730)), renewalDate: formatRelativeDate(addDays(NOW, 180)), phone: "(617) 555-0101", employer: "Boston Public Schools", interests: ["Youth Programs", "Education", "Mentorship"] },
  { id: "m-02", name: "Marcus Webb", email: "marcus.webb@email.com", tier: "General", status: "Active", joinDate: formatRelativeDate(subDays(NOW, 540)), renewalDate: formatRelativeDate(addDays(NOW, 210)), employer: "Webb Construction", interests: ["Community Development", "Workforce"] },
  { id: "m-03", name: "Sandra Osei", email: "sandra.osei@email.com", tier: "General", status: "Active", joinDate: formatRelativeDate(subDays(NOW, 400)), renewalDate: formatRelativeDate(addDays(NOW, 95)), phone: "(617) 555-0103", interests: ["Health", "Family Services"] },
  { id: "m-04", name: "Daniel Flores", email: "d.flores@email.com", tier: "General", status: "Active", joinDate: formatRelativeDate(subDays(NOW, 300)), renewalDate: formatRelativeDate(addDays(NOW, 65)), employer: "Flores Media", interests: ["Communications", "Fundraising"] },
  { id: "m-05", name: "Nadia Okafor", email: "nadia.okafor@email.com", tier: "General", status: "Expiring", joinDate: formatRelativeDate(subDays(NOW, 355)), renewalDate: formatRelativeDate(addDays(NOW, 10)), phone: "(617) 555-0105", interests: ["Digital Literacy", "Youth"] },
  { id: "m-06", name: "Chris Bailey", email: "c.bailey@email.com", tier: "General", status: "Expiring", joinDate: formatRelativeDate(subDays(NOW, 360)), renewalDate: formatRelativeDate(addDays(NOW, 5)), interests: ["Environment", "Community Garden"] },
  { id: "m-07", name: "Yuki Tanaka", email: "yuki.tanaka@email.com", tier: "General", status: "Lapsed", joinDate: formatRelativeDate(subDays(NOW, 400)), renewalDate: formatRelativeDate(subDays(NOW, 35)), employer: "Tanaka Design", interests: ["Arts", "Culture"] },
  { id: "m-08", name: "Omar Hassan", email: "omar.hassan@email.com", tier: "General", status: "Lapsed", joinDate: formatRelativeDate(subDays(NOW, 500)), renewalDate: formatRelativeDate(subDays(NOW, 60)), phone: "(617) 555-0108", interests: ["Advocacy", "Policy"] },
  { id: "m-09", name: "Emily Saunders", email: "emily.s@email.com", tier: "General", status: "Pending", joinDate: formatRelativeDate(subDays(NOW, 7)), renewalDate: formatRelativeDate(addDays(NOW, 358)), employer: "Saunders Consulting", interests: ["Nonprofit Strategy", "Governance"] },
  // Professional — 6 members
  { id: "m-10", name: "Dr. Alicia Ramos", email: "a.ramos@healthpartners.org", tier: "Professional", status: "Active", joinDate: formatRelativeDate(subDays(NOW, 720)), renewalDate: formatRelativeDate(addDays(NOW, 245)), phone: "(617) 555-0110", employer: "Health Partners Network", interests: ["Public Health", "Research", "Grants"] },
  { id: "m-11", name: "Kevin Park", email: "kevin.park@kpmg.com", tier: "Professional", status: "Active", joinDate: formatRelativeDate(subDays(NOW, 600)), renewalDate: formatRelativeDate(addDays(NOW, 120)), employer: "KPMG", interests: ["Finance", "Nonprofit Auditing"] },
  { id: "m-12", name: "Jennifer Walsh", email: "j.walsh@lawfirm.com", tier: "Professional", status: "Active", joinDate: formatRelativeDate(subDays(NOW, 450)), renewalDate: formatRelativeDate(addDays(NOW, 275)), phone: "(617) 555-0112", employer: "Walsh & Associates", interests: ["Legal Aid", "Pro Bono"] },
  { id: "m-13", name: "Thomas Rivera", email: "t.rivera@email.com", tier: "Professional", status: "Expiring", joinDate: formatRelativeDate(subDays(NOW, 362)), renewalDate: formatRelativeDate(addDays(NOW, 3)), employer: "Rivera Financial", interests: ["Wealth Management", "Philanthropy"] },
  { id: "m-14", name: "Priya Mehta", email: "priya.mehta@tech.com", tier: "Professional", status: "Expiring", joinDate: formatRelativeDate(subDays(NOW, 350)), renewalDate: formatRelativeDate(addDays(NOW, 15)), employer: "TechBridge Solutions", interests: ["Technology", "Digital Inclusion"] },
  { id: "m-15", name: "Carlos Diaz", email: "carlos.diaz@email.com", tier: "Professional", status: "Lapsed", joinDate: formatRelativeDate(subDays(NOW, 480)), renewalDate: formatRelativeDate(subDays(NOW, 45)), phone: "(617) 555-0115", interests: ["Real Estate", "Community Housing"] },
  // Board — 3 members
  { id: "m-16", name: "Patricia Lee", email: "p.lee@brightsideboard.org", tier: "Board", status: "Active", joinDate: formatRelativeDate(subDays(NOW, 1200)), renewalDate: formatRelativeDate(addDays(NOW, 365)), phone: "(617) 555-0116", employer: "Lee Foundation", interests: ["Governance", "Strategic Planning", "Major Gifts"] },
  { id: "m-17", name: "Robert Kim", email: "r.kim@brightsideboard.org", tier: "Board", status: "Active", joinDate: formatRelativeDate(subDays(NOW, 900)), renewalDate: formatRelativeDate(addDays(NOW, 300)), employer: "Kim Enterprises", interests: ["Finance", "Operations", "Audit"] },
  { id: "m-18", name: "Sarah Mitchell", email: "s.mitchell@brightsideboard.org", tier: "Board", status: "Active", joinDate: formatRelativeDate(subDays(NOW, 1500)), renewalDate: formatRelativeDate(addDays(NOW, 180)), phone: "(617) 555-0118", employer: "Mitchell Group", interests: ["Fundraising", "Communications", "Events"] },
  // Honorary — 2 members
  { id: "m-19", name: "Mayor Gloria Chen", email: "g.chen@boston.gov", tier: "Honorary", status: "Active", joinDate: formatRelativeDate(subDays(NOW, 800)), renewalDate: formatRelativeDate(addDays(NOW, 365)), employer: "City of Boston", interests: ["Community Development", "Policy"] },
  { id: "m-20", name: "Dr. James Wright", email: "j.wright@university.edu", tier: "Honorary", status: "Active", joinDate: formatRelativeDate(subDays(NOW, 1000)), renewalDate: formatRelativeDate(addDays(NOW, 365)), employer: "Northeastern University", interests: ["Research", "Education", "Youth"] },
];

export const DEMO_MEMBERSHIP_STATS = {
  totalMembers: 20,
  activeMembers: 13,
  expiringMembers: 4,
  lapsedMembers: 3,
  tierBreakdown: { General: 9, Professional: 6, Board: 3, Honorary: 2 },
};

// ─── Volunteers ──────────────────────────────────────────────────

export type AvailabilitySlot = "Weekday Mornings" | "Weekday Afternoons" | "Weekends" | "Evenings" | "Flexible";
export type ShiftStatus = "Upcoming" | "Completed" | "Cancelled";

export interface VolunteerShift {
  id: string;
  eventName: string;
  date: string;
  hours: number;
  status: ShiftStatus;
}

export interface DemoVolunteer {
  id: string;
  name: string;
  email: string;
  skills: string[];
  availability: AvailabilitySlot[];
  totalHours: number;
  joinedDate: string;
  isAlsoDonor: boolean;
  donorTotalGiving?: number;
  shifts: VolunteerShift[];
}

export const DEMO_VOLUNTEERS: DemoVolunteer[] = [
  { id: "v-01", name: "Angela Torres", email: "angela.torres@email.com", skills: ["Youth Mentoring", "Administrative"], availability: ["Weekday Afternoons", "Weekends"], totalHours: 312, joinedDate: formatRelativeDate(subDays(NOW, 720)), isAlsoDonor: true, donorTotalGiving: 4800,
    shifts: [
      { id: "vs-01a", eventName: "Spring Gala Setup", date: formatRelativeDate(subDays(NOW, 5)), hours: 4, status: "Completed" },
      { id: "vs-01b", eventName: "Youth Mentorship Session", date: formatRelativeDate(addDays(NOW, 7)), hours: 2, status: "Upcoming" },
    ]},
  { id: "v-02", name: "Marcus Webb", email: "marcus.webb@email.com", skills: ["Event Setup", "Fundraising", "Photography"], availability: ["Weekends", "Flexible"], totalHours: 185, joinedDate: formatRelativeDate(subDays(NOW, 540)), isAlsoDonor: false,
    shifts: [
      { id: "vs-02a", eventName: "Community Health Fair", date: formatRelativeDate(subDays(NOW, 21)), hours: 6, status: "Completed" },
      { id: "vs-02b", eventName: "Summer Leadership Summit", date: formatRelativeDate(addDays(NOW, 45)), hours: 8, status: "Upcoming" },
    ]},
  { id: "v-03", name: "Nadia Okafor", email: "nadia.okafor@email.com", skills: ["Digital Skills", "Translation"], availability: ["Evenings", "Weekends"], totalHours: 98, joinedDate: formatRelativeDate(subDays(NOW, 300)), isAlsoDonor: true, donorTotalGiving: 1200,
    shifts: [
      { id: "vs-03a", eventName: "Tech Training Workshop", date: formatRelativeDate(subDays(NOW, 14)), hours: 3, status: "Completed" },
      { id: "vs-03b", eventName: "Community Dinner", date: formatRelativeDate(addDays(NOW, 12)), hours: 4, status: "Upcoming" },
    ]},
  { id: "v-04", name: "Daniel Flores", email: "d.flores@email.com", skills: ["Photography", "Event Setup", "Fundraising"], availability: ["Weekends", "Flexible"], totalHours: 240, joinedDate: formatRelativeDate(subDays(NOW, 400)), isAlsoDonor: false,
    shifts: [
      { id: "vs-04a", eventName: "Spring Gala", date: formatRelativeDate(subDays(NOW, 5)), hours: 6, status: "Completed" },
      { id: "vs-04b", eventName: "Summer Leadership Summit", date: formatRelativeDate(addDays(NOW, 45)), hours: 8, status: "Upcoming" },
    ]},
  { id: "v-05", name: "Lisa Chen", email: "lisa.chen@email.com", skills: ["Health Screening", "Administrative"], availability: ["Weekday Mornings", "Weekday Afternoons"], totalHours: 420, joinedDate: formatRelativeDate(subDays(NOW, 900)), isAlsoDonor: true, donorTotalGiving: 8500,
    shifts: [
      { id: "vs-05a", eventName: "Community Health Fair", date: formatRelativeDate(subDays(NOW, 21)), hours: 8, status: "Completed" },
      { id: "vs-05b", eventName: "Health Screening Drive", date: formatRelativeDate(addDays(NOW, 30)), hours: 6, status: "Upcoming" },
    ]},
  { id: "v-06", name: "David Osei", email: "david.osei@email.com", skills: ["Food Distribution", "Event Setup"], availability: ["Weekends"], totalHours: 156, joinedDate: formatRelativeDate(subDays(NOW, 500)), isAlsoDonor: true, donorTotalGiving: 2400,
    shifts: [
      { id: "vs-06a", eventName: "Monthly Community Dinner", date: formatRelativeDate(subDays(NOW, 30)), hours: 3, status: "Completed" },
      { id: "vs-06b", eventName: "Monthly Community Dinner", date: formatRelativeDate(addDays(NOW, 12)), hours: 3, status: "Upcoming" },
    ]},
  { id: "v-07", name: "Carol Nguyen", email: "carol.nguyen@email.com", skills: ["Administrative", "Translation", "Digital Skills"], availability: ["Weekday Mornings", "Evenings"], totalHours: 287, joinedDate: formatRelativeDate(subDays(NOW, 650)), isAlsoDonor: false,
    shifts: [
      { id: "vs-07a", eventName: "Board Orientation Breakfast", date: formatRelativeDate(subDays(NOW, 21)), hours: 4, status: "Completed" },
      { id: "vs-07b", eventName: "Community Dinner", date: formatRelativeDate(addDays(NOW, 12)), hours: 3, status: "Upcoming" },
    ]},
  { id: "v-08", name: "James Wright Jr.", email: "j.wright.jr@email.com", skills: ["Legal", "Administrative"], availability: ["Flexible"], totalHours: 72, joinedDate: formatRelativeDate(subDays(NOW, 180)), isAlsoDonor: false,
    shifts: [
      { id: "vs-08a", eventName: "Volunteer Orientation", date: formatRelativeDate(subDays(NOW, 14)), hours: 2, status: "Completed" },
      { id: "vs-08b", eventName: "Summer Leadership Summit", date: formatRelativeDate(addDays(NOW, 45)), hours: 4, status: "Upcoming" },
    ]},
  { id: "v-09", name: "Aisha Patel", email: "aisha.patel@email.com", skills: ["Youth Mentoring", "Digital Skills", "Photography"], availability: ["Weekday Afternoons", "Weekends"], totalHours: 345, joinedDate: formatRelativeDate(subDays(NOW, 730)), isAlsoDonor: true, donorTotalGiving: 3600,
    shifts: [
      { id: "vs-09a", eventName: "Youth Mentorship Session", date: formatRelativeDate(subDays(NOW, 7)), hours: 2, status: "Completed" },
      { id: "vs-09b", eventName: "Youth Mentorship Session", date: formatRelativeDate(addDays(NOW, 7)), hours: 2, status: "Upcoming" },
    ]},
  { id: "v-10", name: "Robert Santos", email: "r.santos@email.com", skills: ["Food Distribution", "Event Setup", "Fundraising"], availability: ["Weekends", "Evenings"], totalHours: 201, joinedDate: formatRelativeDate(subDays(NOW, 420)), isAlsoDonor: false,
    shifts: [
      { id: "vs-10a", eventName: "Spring Gala", date: formatRelativeDate(subDays(NOW, 5)), hours: 8, status: "Completed" },
      { id: "vs-10b", eventName: "Community Dinner", date: formatRelativeDate(addDays(NOW, 12)), hours: 3, status: "Upcoming" },
    ]},
  { id: "v-11", name: "Michelle Kim", email: "michelle.kim@email.com", skills: ["Health Screening", "Translation"], availability: ["Weekday Mornings"], totalHours: 118, joinedDate: formatRelativeDate(subDays(NOW, 260)), isAlsoDonor: false,
    shifts: [
      { id: "vs-11a", eventName: "Community Health Fair", date: formatRelativeDate(subDays(NOW, 21)), hours: 6, status: "Completed" },
      { id: "vs-11b", eventName: "Health Screening Drive", date: formatRelativeDate(addDays(NOW, 30)), hours: 6, status: "Upcoming" },
    ]},
  { id: "v-12", name: "Steven Park", email: "s.park@email.com", skills: ["Administrative", "Fundraising"], availability: ["Evenings", "Weekends"], totalHours: 89, joinedDate: formatRelativeDate(subDays(NOW, 150)), isAlsoDonor: true, donorTotalGiving: 950,
    shifts: [
      { id: "vs-12a", eventName: "Phone Banking Session", date: formatRelativeDate(subDays(NOW, 10)), hours: 3, status: "Completed" },
      { id: "vs-12b", eventName: "Annual Fund Drive", date: formatRelativeDate(addDays(NOW, 20)), hours: 3, status: "Upcoming" },
    ]},
  { id: "v-13", name: "Fatima Hassan", email: "fatima.hassan@email.com", skills: ["Translation", "Food Distribution", "Youth Mentoring"], availability: ["Weekday Afternoons", "Weekends"], totalHours: 263, joinedDate: formatRelativeDate(subDays(NOW, 600)), isAlsoDonor: false,
    shifts: [
      { id: "vs-13a", eventName: "Community Dinner", date: formatRelativeDate(subDays(NOW, 30)), hours: 3, status: "Completed" },
      { id: "vs-13b", eventName: "Community Dinner", date: formatRelativeDate(addDays(NOW, 12)), hours: 3, status: "Upcoming" },
    ]},
  { id: "v-14", name: "Brian O'Connor", email: "b.oconnor@email.com", skills: ["Event Setup", "Photography"], availability: ["Weekends", "Flexible"], totalHours: 134, joinedDate: formatRelativeDate(subDays(NOW, 380)), isAlsoDonor: false,
    shifts: [
      { id: "vs-14a", eventName: "Spring Gala", date: formatRelativeDate(subDays(NOW, 5)), hours: 10, status: "Completed" },
      { id: "vs-14b", eventName: "Summer Leadership Summit", date: formatRelativeDate(addDays(NOW, 45)), hours: 8, status: "Upcoming" },
    ]},
  { id: "v-15", name: "Jasmine Rivera", email: "jasmine.rivera@email.com", skills: ["Youth Mentoring", "Administrative", "Digital Skills"], availability: ["Weekday Afternoons", "Evenings"], totalHours: 200, joinedDate: formatRelativeDate(subDays(NOW, 450)), isAlsoDonor: false,
    shifts: [
      { id: "vs-15a", eventName: "Youth Mentorship Session", date: formatRelativeDate(subDays(NOW, 7)), hours: 2, status: "Cancelled" },
      { id: "vs-15b", eventName: "Youth Mentorship Session", date: formatRelativeDate(addDays(NOW, 7)), hours: 2, status: "Upcoming" },
    ]},
];

export const DEMO_VOLUNTEER_STATS = {
  totalVolunteers: 15,
  activeThisMonth: 9,
  totalHoursAllTime: 4320,
  dollarValuePerHour: 31.80,
  volunteersWhoAreDonors: 6,
};

// ─── Event Management ────────────────────────────────────────────

export type ManagedEventStatus = "Upcoming" | "Active" | "Past";
export type TicketTier = "Free" | "General Admission" | "VIP" | "Member-Only";

export interface EventTicketType {
  tier: TicketTier;
  price: number;
  capacity: number;
  sold: number;
}

export interface EventSpeaker {
  name: string;
  title: string;
  organization: string;
}

export interface EventAgendaItem {
  time: string;
  title: string;
  speaker?: string;
}

export interface EventRegistrant {
  id: string;
  name: string;
  email: string;
  ticketTier: TicketTier;
  registeredDate: string;
  checkedIn: boolean;
}

export interface DemoManagedEvent {
  id: string;
  title: string;
  status: ManagedEventStatus;
  date: string;
  location: string;
  description: string;
  capacity: number;
  registrationCount: number;
  ticketTypes: EventTicketType[];
  speakers: EventSpeaker[];
  agenda: EventAgendaItem[];
  registrants: EventRegistrant[];
  fundRaised?: number;
}

export const DEMO_MANAGED_EVENTS: DemoManagedEvent[] = [
  {
    id: "me-01",
    title: "Summer Leadership Summit",
    status: "Upcoming",
    date: formatRelativeDate(addDays(NOW, 45)),
    location: "Boston Convention & Exhibition Center",
    description: "Our flagship annual summit bringing together nonprofit leaders, community advocates, and major donors for a full day of keynotes, workshops, and networking. This year's theme: 'Building Resilient Communities.'",
    capacity: 200,
    registrationCount: 112,
    ticketTypes: [
      { tier: "Free", price: 0, capacity: 20, sold: 18 },
      { tier: "General Admission", price: 75, capacity: 130, sold: 75 },
      { tier: "VIP", price: 250, capacity: 50, sold: 19 },
    ],
    speakers: [
      { name: "Dr. Alicia Ramos", title: "Director of Community Health", organization: "Health Partners Network" },
      { name: "Mayor Gloria Chen", title: "Mayor", organization: "City of Boston" },
      { name: "Robert Kim", title: "Board Chair", organization: "Brightside Foundation" },
    ],
    agenda: [
      { time: "8:30 AM", title: "Registration & Breakfast Networking" },
      { time: "9:15 AM", title: "Opening Keynote: The State of Community", speaker: "Mayor Gloria Chen" },
      { time: "10:30 AM", title: "Workshop Block A — Choose from 4 sessions" },
      { time: "12:00 PM", title: "Lunch & Sponsor Recognition" },
      { time: "1:30 PM", title: "Panel: Funding the Future", speaker: "Dr. Alicia Ramos" },
      { time: "3:00 PM", title: "Workshop Block B — Choose from 3 sessions" },
      { time: "4:30 PM", title: "Closing Remarks & Next Steps", speaker: "Robert Kim" },
      { time: "5:00 PM", title: "Networking Reception" },
    ],
    registrants: [
      { id: "r-01a", name: "Sarah Mitchell", email: "s.mitchell@email.com", ticketTier: "VIP", registeredDate: formatRelativeDate(subDays(NOW, 15)), checkedIn: false },
      { id: "r-01b", name: "Kevin Park", email: "kevin.park@kpmg.com", ticketTier: "General Admission", registeredDate: formatRelativeDate(subDays(NOW, 12)), checkedIn: false },
      { id: "r-01c", name: "Angela Torres", email: "angela.torres@email.com", ticketTier: "Free", registeredDate: formatRelativeDate(subDays(NOW, 10)), checkedIn: false },
      { id: "r-01d", name: "Dr. Marcus Webb", email: "mwebb@community.org", ticketTier: "General Admission", registeredDate: formatRelativeDate(subDays(NOW, 8)), checkedIn: false },
      { id: "r-01e", name: "Priya Mehta", email: "priya.mehta@tech.com", ticketTier: "VIP", registeredDate: formatRelativeDate(subDays(NOW, 6)), checkedIn: false },
    ],
  },
  {
    id: "me-02",
    title: "Monthly Community Dinner",
    status: "Upcoming",
    date: formatRelativeDate(addDays(NOW, 12)),
    location: "Brightside Community Center, 45 Harrison Ave",
    description: "Our monthly gathering for community members, volunteers, and supporters. A warm meal, meaningful connections, and program updates from our team. Open to all — no one turned away.",
    capacity: 80,
    registrationCount: 67,
    ticketTypes: [
      { tier: "Free", price: 0, capacity: 80, sold: 67 },
    ],
    speakers: [],
    agenda: [
      { time: "6:00 PM", title: "Doors Open & Social Time" },
      { time: "6:30 PM", title: "Welcome & Program Updates" },
      { time: "6:45 PM", title: "Community Dinner" },
      { time: "7:30 PM", title: "Open Mic — Community Stories" },
      { time: "8:00 PM", title: "Closing" },
    ],
    registrants: [
      { id: "r-02a", name: "David Osei", email: "david.osei@email.com", ticketTier: "Free", registeredDate: formatRelativeDate(subDays(NOW, 5)), checkedIn: false },
      { id: "r-02b", name: "Fatima Hassan", email: "fatima.hassan@email.com", ticketTier: "Free", registeredDate: formatRelativeDate(subDays(NOW, 4)), checkedIn: false },
      { id: "r-02c", name: "Carol Nguyen", email: "carol.nguyen@email.com", ticketTier: "Free", registeredDate: formatRelativeDate(subDays(NOW, 3)), checkedIn: false },
    ],
  },
  {
    id: "me-03",
    title: "Community Health Fair",
    status: "Active",
    date: formatRelativeDate(NOW),
    location: "Roxbury Community Park Pavilion",
    description: "Free health screenings, wellness resources, and community connections. Partnered with Health Partners Network to provide blood pressure checks, diabetes screening, mental health resources, and more.",
    capacity: 150,
    registrationCount: 98,
    ticketTypes: [
      { tier: "Free", price: 0, capacity: 100, sold: 80 },
      { tier: "General Admission", price: 0, capacity: 50, sold: 18 },
    ],
    speakers: [
      { name: "Dr. Alicia Ramos", title: "Director of Community Health", organization: "Health Partners Network" },
    ],
    agenda: [
      { time: "9:00 AM", title: "Setup & Volunteer Briefing" },
      { time: "10:00 AM", title: "Doors Open — Health Screenings Begin" },
      { time: "11:00 AM", title: "Wellness Workshop: Nutrition Basics", speaker: "Dr. Alicia Ramos" },
      { time: "1:00 PM", title: "Kids Health Activity Zone Opens" },
      { time: "3:00 PM", title: "Resource Fair & Community Partners" },
      { time: "5:00 PM", title: "Wrap-Up & Volunteer Thank You" },
    ],
    registrants: [
      { id: "r-03a", name: "Lisa Chen", email: "lisa.chen@email.com", ticketTier: "Free", registeredDate: formatRelativeDate(subDays(NOW, 10)), checkedIn: true },
      { id: "r-03b", name: "Michelle Kim", email: "michelle.kim@email.com", ticketTier: "Free", registeredDate: formatRelativeDate(subDays(NOW, 8)), checkedIn: true },
      { id: "r-03c", name: "Marcus Webb", email: "marcus.webb@email.com", ticketTier: "General Admission", registeredDate: formatRelativeDate(subDays(NOW, 7)), checkedIn: false },
    ],
  },
  {
    id: "me-04",
    title: "Annual Spring Gala",
    status: "Past",
    date: formatRelativeDate(subDays(NOW, 5)),
    location: "The Boston Marriott Copley Place",
    description: "Our premier annual fundraising gala celebrating the impact of our community. An evening of dinner, dancing, live auction, and recognition of our top donors and volunteers.",
    capacity: 300,
    registrationCount: 247,
    fundRaised: 142000,
    ticketTypes: [
      { tier: "General Admission", price: 150, capacity: 180, sold: 168 },
      { tier: "VIP", price: 350, capacity: 60, sold: 52 },
      { tier: "Member-Only", price: 100, capacity: 60, sold: 27 },
    ],
    speakers: [
      { name: "Patricia Lee", title: "Board Chair", organization: "Brightside Foundation" },
      { name: "Sarah Mitchell", title: "Executive Director", organization: "Brightside Foundation" },
    ],
    agenda: [
      { time: "6:00 PM", title: "VIP Reception & Silent Auction Opens" },
      { time: "7:00 PM", title: "Doors Open — Cocktail Hour" },
      { time: "7:30 PM", title: "Welcome & Mission Moment", speaker: "Patricia Lee" },
      { time: "8:00 PM", title: "Dinner Service" },
      { time: "8:45 PM", title: "Impact Video & Fund-a-Need" },
      { time: "9:15 PM", title: "Live Auction" },
      { time: "10:00 PM", title: "Dancing & Networking" },
    ],
    registrants: [
      { id: "r-04a", name: "Robert Kim", email: "robert.kim@email.com", ticketTier: "VIP", registeredDate: formatRelativeDate(subDays(NOW, 30)), checkedIn: true },
      { id: "r-04b", name: "Jennifer Walsh", email: "j.walsh@lawfirm.com", ticketTier: "General Admission", registeredDate: formatRelativeDate(subDays(NOW, 25)), checkedIn: true },
      { id: "r-04c", name: "Thomas Rivera", email: "t.rivera@email.com", ticketTier: "Member-Only", registeredDate: formatRelativeDate(subDays(NOW, 20)), checkedIn: false },
      { id: "r-04d", name: "Mayor Gloria Chen", email: "g.chen@boston.gov", ticketTier: "VIP", registeredDate: formatRelativeDate(subDays(NOW, 28)), checkedIn: true },
    ],
  },
  {
    id: "me-05",
    title: "Board Orientation Breakfast",
    status: "Past",
    date: formatRelativeDate(subDays(NOW, 21)),
    location: "Brightside Foundation HQ, Conference Room A",
    description: "Orientation and onboarding session for new board members and advisory committee additions. Covers governance responsibilities, committee assignments, and strategic priorities for the year.",
    capacity: 25,
    registrationCount: 22,
    ticketTypes: [
      { tier: "Member-Only", price: 0, capacity: 25, sold: 22 },
    ],
    speakers: [
      { name: "Patricia Lee", title: "Board Chair", organization: "Brightside Foundation" },
    ],
    agenda: [
      { time: "8:00 AM", title: "Breakfast & Introductions" },
      { time: "8:30 AM", title: "Governance Overview", speaker: "Patricia Lee" },
      { time: "9:30 AM", title: "Strategic Plan Review" },
      { time: "10:30 AM", title: "Committee Assignments & Q&A" },
      { time: "11:00 AM", title: "Adjourn" },
    ],
    registrants: [
      { id: "r-05a", name: "Emily Saunders", email: "emily.s@email.com", ticketTier: "Member-Only", registeredDate: formatRelativeDate(subDays(NOW, 28)), checkedIn: true },
      { id: "r-05b", name: "Kevin Park", email: "kevin.park@kpmg.com", ticketTier: "Member-Only", registeredDate: formatRelativeDate(subDays(NOW, 25)), checkedIn: true },
      { id: "r-05c", name: "Dr. Alicia Ramos", email: "a.ramos@healthpartners.org", ticketTier: "Member-Only", registeredDate: formatRelativeDate(subDays(NOW, 27)), checkedIn: true },
    ],
  },
];

// ─── Donation Center ──────────────────────────────────────────────

export type DonationFrequency = "One-Time" | "Monthly" | "Quarterly" | "Annual";
export type DonationFundDesignation = "General Operating" | "Youth Programs" | "Health Initiative" | "Technology Fund" | "Emergency Relief";

export interface DemoCampaign {
  id: string;
  name: string;
  description: string;
  goal: number;
  raised: number;
  donorCount: number;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  fundDesignation: DonationFundDesignation;
}

export interface DemoDonation {
  id: string;
  donorName: string;
  amount: number;
  frequency: DonationFrequency;
  campaignId: string;
  campaignName: string;
  date: string;
  fundDesignation: DonationFundDesignation;
  isAnonymous: boolean;
  paymentMethod: "Credit Card" | "ACH" | "Check" | "PayPal";
}

export const DEMO_CAMPAIGNS: DemoCampaign[] = [
  {
    id: "c-01", name: "Spring Annual Fund", description: "Our core operating fund that supports all Brightside programs, staff, and community services. Every dollar goes directly to our mission.",
    goal: 75000, raised: 48200, donorCount: 183, startDate: formatRelativeDate(subDays(NOW, 60)),
    endDate: formatRelativeDate(addDays(NOW, 30)), isActive: true, fundDesignation: "General Operating",
  },
  {
    id: "c-02", name: "Technology Access Initiative", description: "Bridging the digital divide for underserved youth and families. Funds laptops, internet access stipends, and digital literacy training.",
    goal: 25000, raised: 18400, donorCount: 67, startDate: formatRelativeDate(subDays(NOW, 45)),
    endDate: formatRelativeDate(addDays(NOW, 45)), isActive: true, fundDesignation: "Technology Fund",
  },
  {
    id: "c-03", name: "Youth Mentorship Endowment", description: "Building a permanent endowment to sustain our youth mentorship programs in perpetuity. A legacy gift that will serve Boston's youth for generations.",
    goal: 100000, raised: 31000, donorCount: 42, startDate: formatRelativeDate(subDays(NOW, 90)),
    isActive: true, fundDesignation: "Youth Programs",
  },
];

export const DEMO_DONATIONS_RECENT: DemoDonation[] = [
  { id: "d-01", donorName: "Sarah Mitchell", amount: 2500, frequency: "Annual", campaignId: "c-01", campaignName: "Spring Annual Fund", date: formatRelativeDate(subDays(NOW, 1)), fundDesignation: "General Operating", isAnonymous: false, paymentMethod: "Credit Card" },
  { id: "d-02", donorName: "Robert Kim", amount: 500, frequency: "Monthly", campaignId: "c-01", campaignName: "Spring Annual Fund", date: formatRelativeDate(subDays(NOW, 1)), fundDesignation: "General Operating", isAnonymous: false, paymentMethod: "ACH" },
  { id: "d-03", donorName: "Anonymous", amount: 1000, frequency: "One-Time", campaignId: "c-03", campaignName: "Youth Mentorship Endowment", date: formatRelativeDate(subDays(NOW, 2)), fundDesignation: "Youth Programs", isAnonymous: true, paymentMethod: "Credit Card" },
  { id: "d-04", donorName: "Patricia Lee", amount: 5000, frequency: "Annual", campaignId: "c-03", campaignName: "Youth Mentorship Endowment", date: formatRelativeDate(subDays(NOW, 3)), fundDesignation: "Youth Programs", isAnonymous: false, paymentMethod: "Check" },
  { id: "d-05", donorName: "Margaret Chen", amount: 150, frequency: "Monthly", campaignId: "c-01", campaignName: "Spring Annual Fund", date: formatRelativeDate(subDays(NOW, 4)), fundDesignation: "General Operating", isAnonymous: false, paymentMethod: "Credit Card" },
  { id: "d-06", donorName: "David Chen", amount: 750, frequency: "One-Time", campaignId: "c-02", campaignName: "Technology Access Initiative", date: formatRelativeDate(subDays(NOW, 5)), fundDesignation: "Technology Fund", isAnonymous: false, paymentMethod: "PayPal" },
  { id: "d-07", donorName: "Jennifer Walsh", amount: 250, frequency: "Quarterly", campaignId: "c-02", campaignName: "Technology Access Initiative", date: formatRelativeDate(subDays(NOW, 7)), fundDesignation: "Technology Fund", isAnonymous: false, paymentMethod: "ACH" },
  { id: "d-08", donorName: "Kevin Park", amount: 1000, frequency: "Annual", campaignId: "c-01", campaignName: "Spring Annual Fund", date: formatRelativeDate(subDays(NOW, 8)), fundDesignation: "General Operating", isAnonymous: false, paymentMethod: "Check" },
  { id: "d-09", donorName: "Anonymous", amount: 50, frequency: "Monthly", campaignId: "c-01", campaignName: "Spring Annual Fund", date: formatRelativeDate(subDays(NOW, 9)), fundDesignation: "General Operating", isAnonymous: true, paymentMethod: "Credit Card" },
  { id: "d-10", donorName: "Thomas Rivera", amount: 300, frequency: "One-Time", campaignId: "c-03", campaignName: "Youth Mentorship Endowment", date: formatRelativeDate(subDays(NOW, 10)), fundDesignation: "Youth Programs", isAnonymous: false, paymentMethod: "Credit Card" },
  { id: "d-11", donorName: "Dr. Alicia Ramos", amount: 200, frequency: "Monthly", campaignId: "c-02", campaignName: "Technology Access Initiative", date: formatRelativeDate(subDays(NOW, 12)), fundDesignation: "Technology Fund", isAnonymous: false, paymentMethod: "ACH" },
  { id: "d-12", donorName: "Lisa Chen", amount: 10000, frequency: "Annual", campaignId: "c-03", campaignName: "Youth Mentorship Endowment", date: formatRelativeDate(subDays(NOW, 14)), fundDesignation: "Youth Programs", isAnonymous: false, paymentMethod: "Check" },
  { id: "d-13", donorName: "Carol Nguyen", amount: 75, frequency: "Monthly", campaignId: "c-01", campaignName: "Spring Annual Fund", date: formatRelativeDate(subDays(NOW, 15)), fundDesignation: "General Operating", isAnonymous: false, paymentMethod: "Credit Card" },
  { id: "d-14", donorName: "Marcus Webb", amount: 500, frequency: "One-Time", campaignId: "c-01", campaignName: "Spring Annual Fund", date: formatRelativeDate(subDays(NOW, 17)), fundDesignation: "General Operating", isAnonymous: false, paymentMethod: "PayPal" },
  { id: "d-15", donorName: "Priya Mehta", amount: 1500, frequency: "Annual", campaignId: "c-02", campaignName: "Technology Access Initiative", date: formatRelativeDate(subDays(NOW, 20)), fundDesignation: "Technology Fund", isAnonymous: false, paymentMethod: "ACH" },
  { id: "d-16", donorName: "Anonymous", amount: 25, frequency: "Monthly", campaignId: "c-01", campaignName: "Spring Annual Fund", date: formatRelativeDate(subDays(NOW, 22)), fundDesignation: "General Operating", isAnonymous: true, paymentMethod: "Credit Card" },
  { id: "d-17", donorName: "Angela Torres", amount: 400, frequency: "Quarterly", campaignId: "c-03", campaignName: "Youth Mentorship Endowment", date: formatRelativeDate(subDays(NOW, 25)), fundDesignation: "Youth Programs", isAnonymous: false, paymentMethod: "Credit Card" },
  { id: "d-18", donorName: "James Wright", amount: 2000, frequency: "Annual", campaignId: "c-03", campaignName: "Youth Mentorship Endowment", date: formatRelativeDate(subDays(NOW, 30)), fundDesignation: "Youth Programs", isAnonymous: false, paymentMethod: "Check" },
  { id: "d-19", donorName: "Robert Okafor", amount: 100, frequency: "Monthly", campaignId: "c-01", campaignName: "Spring Annual Fund", date: formatRelativeDate(subDays(NOW, 35)), fundDesignation: "General Operating", isAnonymous: false, paymentMethod: "ACH" },
  { id: "d-20", donorName: "Susan Park", amount: 600, frequency: "One-Time", campaignId: "c-02", campaignName: "Technology Access Initiative", date: formatRelativeDate(subDays(NOW, 45)), fundDesignation: "Technology Fund", isAnonymous: false, paymentMethod: "Credit Card" },
];

export const DEMO_DONATION_STATS = {
  totalRaisedAllTime: 284000,
  totalRaisedThisYear: 198000,
  averageGift: 287,
  recurringDonors: 143,
  oneTimeDonors: 312,
  largestGift: 10000,
  activeCampaigns: 3,
  fundBreakdown: [
    { fund: "General Operating" as DonationFundDesignation, amount: 89000, pct: 45 },
    { fund: "Youth Programs" as DonationFundDesignation, amount: 55800, pct: 28 },
    { fund: "Health Initiative" as DonationFundDesignation, amount: 29700, pct: 15 },
    { fund: "Technology Fund" as DonationFundDesignation, amount: 13860, pct: 7 },
    { fund: "Emergency Relief" as DonationFundDesignation, amount: 9900, pct: 5 },
  ],
};

// ─── Unified Donor Profiles ──────────────────────────────────────
// Canonical donor registry that reconciles names appearing across the
// Donor Pipeline, Donor Retention, Donation Center, Membership, and
// Communications surfaces. Matched by donor name (interim contract until
// a real donor entity exists — see docs/02-modules/ux-consolidation-spec.md).

export type DonorSegment = "Major Gift" | "Mid-Level" | "Grassroots" | "Lapsed";

export interface DonorOutreachEntry {
  date: string;
  channel: "Email" | "Phone" | "Meeting" | "Event" | "Mail";
  summary: string;
}

export interface DemoDonorProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  segment: DonorSegment;
  engagementScore: number; // 0–100
  nextBestAction: string;
  pipelineStage?: string; // matches Donor Pipeline column titles
  isMember: boolean;
  memberTier?: MemberTier;
  totalGiving: number;
  lastGiftAmount: number;
  lastGiftDate: string;
  outreachHistory: DonorOutreachEntry[];
}

export const DEMO_DONOR_PROFILES: DemoDonorProfile[] = [
  {
    id: "dp-01", name: "Margaret Liu", email: "margaret.liu@email.com", phone: "(617) 555-0201",
    segment: "Mid-Level", engagementScore: 82, nextBestAction: "Invite to volunteer appreciation dinner — combines her coding mentorship with upgrade conversation",
    pipelineStage: "Identified", isMember: false, totalGiving: 8750, lastGiftAmount: 2500, lastGiftDate: "January 2026",
    outreachHistory: [
      { date: formatRelativeDate(subDays(NOW, 12)), channel: "Email", summary: "Spring newsletter — opened, clicked impact story" },
      { date: formatRelativeDate(subDays(NOW, 40)), channel: "Event", summary: "Attended Tech for Good gala" },
    ],
  },
  {
    id: "dp-02", name: "Robert Kim", email: "r.kim@email.com", segment: "Mid-Level",
    engagementScore: 44, nextBestAction: "Re-engage: no gift in 275 days — pair workforce development ask with board update",
    pipelineStage: "Identified", isMember: true, memberTier: "Board", totalGiving: 5400, lastGiftAmount: 500, lastGiftDate: "December 2025",
    outreachHistory: [
      { date: formatRelativeDate(subDays(NOW, 10)), channel: "Email", summary: "LYBUNT re-engagement campaign — not yet opened" },
      { date: formatRelativeDate(subDays(NOW, 90)), channel: "Meeting", summary: "Board finance committee meeting" },
    ],
  },
  {
    id: "dp-03", name: "Patricia Osei", email: "p.osei@email.com", phone: "(617) 555-0203",
    segment: "Major Gift", engagementScore: 38, nextBestAction: "Priority call from ED — major donor at risk, 290 days since last gift",
    pipelineStage: "Identified", isMember: false, totalGiving: 12800, lastGiftAmount: 1000, lastGiftDate: "February 2026",
    outreachHistory: [
      { date: formatRelativeDate(subDays(NOW, 8)), channel: "Phone", summary: "Left voicemail re: after-school tutoring expansion" },
      { date: formatRelativeDate(subDays(NOW, 120)), channel: "Event", summary: "Spring Gala host committee" },
    ],
  },
  {
    id: "dp-04", name: "David Chen", email: "david.chen@email.com", segment: "Mid-Level",
    engagementScore: 76, nextBestAction: "Send planned giving brochure — expressed interest at last event",
    pipelineStage: "Outreach Scheduled", isMember: false, totalGiving: 6300, lastGiftAmount: 750, lastGiftDate: formatRelativeDate(subDays(NOW, 5)),
    outreachHistory: [
      { date: formatRelativeDate(subDays(NOW, 2)), channel: "Email", summary: "Thank-you pending for $500 gift" },
      { date: formatRelativeDate(subDays(NOW, 30)), channel: "Event", summary: "Attended Fall Fundraiser" },
    ],
  },
  {
    id: "dp-05", name: "Susan Park", email: "susan.park@email.com", phone: "(617) 555-0205",
    segment: "Major Gift", engagementScore: 88, nextBestAction: "Present scholarship fund naming proposal at Apr 12 meeting",
    pipelineStage: "Outreach Scheduled", isMember: false, totalGiving: 18000, lastGiftAmount: 4500, lastGiftDate: "March 2026",
    outreachHistory: [
      { date: formatRelativeDate(subDays(NOW, 6)), channel: "Phone", summary: "Confirmed Apr 12 meeting — bring scholarship fund materials" },
      { date: formatRelativeDate(subDays(NOW, 45)), channel: "Event", summary: "Summer Camp sponsor site visit" },
    ],
  },
  {
    id: "dp-06", name: "Jennifer Walsh", email: "j.walsh@lawfirm.com", phone: "(617) 555-0112",
    segment: "Mid-Level", engagementScore: 91, nextBestAction: "Draft naming gift proposal for Eleanor Walsh Memorial youth room",
    pipelineStage: "In Conversation", isMember: true, memberTier: "Professional", totalGiving: 7350, lastGiftAmount: 250, lastGiftDate: formatRelativeDate(subDays(NOW, 7)),
    outreachHistory: [
      { date: formatRelativeDate(subDays(NOW, 5)), channel: "Meeting", summary: "Discussed naming opportunity for youth programs room" },
      { date: formatRelativeDate(subDays(NOW, 60)), channel: "Event", summary: "Attended Spring Gala" },
    ],
  },
  {
    id: "dp-07", name: "Mark Abrams", email: "mark.abrams@email.com", segment: "Major Gift",
    engagementScore: 85, nextBestAction: "Prepare capital campaign one-pager for Apr 15 ED meeting",
    pipelineStage: "In Conversation", isMember: false, totalGiving: 15200, lastGiftAmount: 3800, lastGiftDate: "January 2026",
    outreachHistory: [
      { date: formatRelativeDate(subDays(NOW, 7)), channel: "Phone", summary: "Confirmed Apr 15 meeting with ED re: community center wing" },
      { date: formatRelativeDate(subDays(NOW, 70)), channel: "Event", summary: "Hosted site tour for potential donors" },
    ],
  },
  {
    id: "dp-08", name: "Thomas Rivera", email: "t.rivera@email.com", segment: "Mid-Level",
    engagementScore: 79, nextBestAction: "Send pledge fulfillment reminder + grandchildren program update",
    pipelineStage: "Pledge Made", isMember: true, memberTier: "Professional", totalGiving: 12500, lastGiftAmount: 300, lastGiftDate: formatRelativeDate(subDays(NOW, 10)),
    outreachHistory: [
      { date: formatRelativeDate(subDays(NOW, 9)), channel: "Mail", summary: "$5,000 pledge confirmation letter sent" },
      { date: formatRelativeDate(subDays(NOW, 50)), channel: "Meeting", summary: "Reading tutor volunteer check-in" },
    ],
  },
  {
    id: "dp-09", name: "Carol Nguyen", email: "carol.nguyen@email.com", segment: "Lapsed",
    engagementScore: 35, nextBestAction: "Re-engage: 380 days lapsed despite recent upgrade record — verify CRM data conflict",
    pipelineStage: "Upgraded ✓", isMember: false, totalGiving: 4900, lastGiftAmount: 75, lastGiftDate: formatRelativeDate(subDays(NOW, 15)),
    outreachHistory: [
      { date: formatRelativeDate(subDays(NOW, 13)), channel: "Email", summary: "Monthly giving receipt" },
      { date: formatRelativeDate(subDays(NOW, 100)), channel: "Event", summary: "Tech Career Day speaker" },
    ],
  },
  {
    id: "dp-10", name: "Sarah Mitchell", email: "s.mitchell@brightsideboard.org", phone: "(617) 555-0118",
    segment: "Major Gift", engagementScore: 94, nextBestAction: "Thank-you pending for $2,500 gift — send within 48 hours",
    isMember: true, memberTier: "Board", totalGiving: 24500, lastGiftAmount: 2500, lastGiftDate: formatRelativeDate(subDays(NOW, 1)),
    outreachHistory: [
      { date: formatRelativeDate(subDays(NOW, 1)), channel: "Email", summary: "Gift receipt sent — thank-you letter queued" },
      { date: formatRelativeDate(subDays(NOW, 20)), channel: "Meeting", summary: "Board fundraising committee" },
    ],
  },
  {
    id: "dp-11", name: "Patricia Lee", email: "p.lee@brightsideboard.org", phone: "(617) 555-0116",
    segment: "Major Gift", engagementScore: 90, nextBestAction: "Schedule endowment legacy conversation — strong affinity for youth mentorship",
    isMember: true, memberTier: "Board", totalGiving: 31000, lastGiftAmount: 5000, lastGiftDate: formatRelativeDate(subDays(NOW, 3)),
    outreachHistory: [
      { date: formatRelativeDate(subDays(NOW, 3)), channel: "Mail", summary: "$5,000 endowment gift acknowledged" },
      { date: formatRelativeDate(subDays(NOW, 30)), channel: "Meeting", summary: "Strategic planning session" },
    ],
  },
  {
    id: "dp-12", name: "Kevin Park", email: "kevin.park@kpmg.com", segment: "Mid-Level",
    engagementScore: 72, nextBestAction: "Invite to finance committee — professional member with annual giving pattern",
    isMember: true, memberTier: "Professional", totalGiving: 4200, lastGiftAmount: 1000, lastGiftDate: formatRelativeDate(subDays(NOW, 8)),
    outreachHistory: [
      { date: formatRelativeDate(subDays(NOW, 8)), channel: "Email", summary: "Annual gift receipt + audit committee interest noted" },
    ],
  },
];

export function findDonorProfile(name: string | null | undefined): DemoDonorProfile | undefined {
  if (!name) return undefined;
  const normalized = name.trim().toLowerCase();
  return DEMO_DONOR_PROFILES.find((p) => p.name.toLowerCase() === normalized);
}

// ─── Public Presence ──────────────────────────────────────────────

export interface PublicVisibilityConfig {
  publicEventFeed: boolean;
  donationWidget: boolean;
  memberDirectoryPublic: boolean;
  programsPublicPage: boolean;
  teamPage: boolean;
  impactStats: boolean;
}

export interface SocialShareConfig {
  facebookUrl: string;
  twitterHandle: string;
  linkedinUrl: string;
  instagramHandle: string;
}

export const DEMO_PUBLIC_PRESENCE = {
  orgWebsiteUrl: "https://brightsidecommunity.org",
  visibility: {
    publicEventFeed: true,
    donationWidget: true,
    memberDirectoryPublic: false,
    programsPublicPage: true,
    teamPage: false,
    impactStats: true,
  } satisfies PublicVisibilityConfig,
  social: {
    facebookUrl: "https://facebook.com/brightsidecommunity",
    twitterHandle: "@BrightsideFdn",
    linkedinUrl: "https://linkedin.com/company/brightside-foundation",
    instagramHandle: "@brightsidecommunity",
  } satisfies SocialShareConfig,
  embedCodes: {
    donationWidget: `<iframe src="https://brightsidecommunity.org/donate-widget" width="400" height="600" frameborder="0" title="Donate to Brightside Foundation"></iframe>`,
    eventFeed: `<iframe src="https://brightsidecommunity.org/events-widget" width="600" height="400" frameborder="0" title="Upcoming Events — Brightside Foundation"></iframe>`,
  },
  lastPublishedAt: formatRelativeDate(subDays(NOW, 2)),
};

// ─── Org Health (Dashboard) ───────────────────────────────────────

export interface OrgHealthBreakdownItem {
  label: string;
  value: string;
  percent: number;
  color: "green" | "amber" | "red";
}

export const DEMO_ORG_HEALTH = {
  score: 74,
  scoreColor: "amber" as const,
  breakdown: [
    { label: "Data Quality", value: "82%", percent: 82, color: "green" as const },
    { label: "Grant Health", value: "61%", percent: 61, color: "amber" as const },
    { label: "Reconciliation", value: "90%", percent: 90, color: "green" as const },
    { label: "Agent Activity", value: "5/5 active", percent: 100, color: "green" as const },
  ] satisfies OrgHealthBreakdownItem[],
  insight: "Grant health is below target — 2 reports due within 14 days. Review recommended.",
};

// ─── Donor Pipeline Page ──────────────────────────────────────────

export interface PipelineDonor {
  id: string;
  name: string;
  currentGiving: string;
  targetGiving: string;
  assignedTo: string;
  note?: string;
  outreachDate?: string;
  lastContact?: string;
  pledgeAmount?: string;
  pledgeDate?: string;
  upgradeAmount?: string;
  completedDate?: string;
  email?: string;
  fundDesignation?: string;
  totalGiving?: string;
  lastGiftAmount?: string;
  lastGiftDate?: string;
  givingHistory?: string;
  contactNotes?: string;
  volunteerHistory?: string;
}

export const DEMO_DONOR_PIPELINE: Record<string, PipelineDonor[]> = {
  identified: [
    { id: "d1", name: "Margaret Liu", currentGiving: "$2,500/yr", targetGiving: "$5,000/yr", assignedTo: "Maria Santos",
      email: "margaret.liu@email.com", fundDesignation: "Technology Access", totalGiving: "$8,750",
      lastGiftAmount: "$2,500", lastGiftDate: "January 2026",
      givingHistory: "$2,500 (Jan 2026), $2,500 (Jan 2025), $2,000 (Jan 2024), $1,750 (Jan 2023)",
      contactNotes: "Retired software engineer. Passionate about digital literacy for underserved youth. Volunteers as a coding mentor every Saturday.",
      volunteerHistory: "Weekly coding mentor since 2023, attended Tech for Good gala 2025" },
    { id: "d2", name: "Robert Kim", currentGiving: "$1,800/yr", targetGiving: "$3,000/yr", assignedTo: "",
      email: "r.kim@email.com", fundDesignation: "General Operating", totalGiving: "$5,400",
      lastGiftAmount: "$1,800", lastGiftDate: "December 2025",
      givingHistory: "$1,800 (Dec 2025), $1,800 (Dec 2024), $1,800 (Dec 2023)",
      contactNotes: "Local business owner — Kim's Hardware. Interested in workforce development programs.",
      volunteerHistory: "Donated supplies for community center renovation 2024" },
    { id: "d3", name: "Patricia Osei", currentGiving: "$3,200/yr", targetGiving: "$7,500/yr", assignedTo: "Maria Santos",
      email: "p.osei@email.com", fundDesignation: "Youth Programs", totalGiving: "$12,800",
      lastGiftAmount: "$3,200", lastGiftDate: "February 2026",
      givingHistory: "$3,200 (Feb 2026), $3,200 (Feb 2025), $3,200 (Feb 2024), $3,200 (Feb 2023)",
      contactNotes: "School principal. Deeply invested in after-school tutoring program. Has referred three other donors.",
      volunteerHistory: "Board advisory committee member, Spring Gala host committee 2025" },
  ],
  outreach: [
    { id: "d4", name: "David Chen", currentGiving: "$2,100/yr", targetGiving: "$5,000/yr", assignedTo: "Maria Santos", outreachDate: "Apr 10, 2026",
      email: "david.chen@email.com", fundDesignation: "General Operating", totalGiving: "$6,300",
      lastGiftAmount: "$2,100", lastGiftDate: "November 2025",
      givingHistory: "$2,100 (Nov 2025), $2,100 (Nov 2024), $2,100 (Nov 2023)",
      contactNotes: "Financial advisor. Expressed interest in planned giving program at last event.",
      volunteerHistory: "Attended Fall Fundraiser 2024 and 2025" },
    { id: "d5", name: "Susan Park", currentGiving: "$4,500/yr", targetGiving: "$10,000/yr", assignedTo: "Kevin Park", outreachDate: "Apr 12, 2026",
      email: "susan.park@email.com", fundDesignation: "Youth Programs", totalGiving: "$18,000",
      lastGiftAmount: "$4,500", lastGiftDate: "March 2026",
      givingHistory: "$4,500 (Mar 2026), $4,500 (Mar 2025), $4,500 (Sep 2024), $4,500 (Mar 2024)",
      contactNotes: "Pediatrician. Her daughter participated in our summer camp. Interested in scholarship fund naming.",
      volunteerHistory: "Health screening volunteer 2024, Summer Camp sponsor 2025" },
  ],
  conversation: [
    { id: "d6", name: "Jennifer Walsh", currentGiving: "$1,950/yr", targetGiving: "$5,000/yr", assignedTo: "Maria Santos", lastContact: "Apr 5",
      note: "Very interested in naming opportunity for youth programs room",
      email: "jennifer.walsh@email.com", fundDesignation: "Youth Programs", totalGiving: "$7,350",
      lastGiftAmount: "$750", lastGiftDate: "March 2026",
      givingHistory: "$750 (Mar 2026), $500 (Dec 2025), $700 (Jun 2025), $500 (Dec 2024), $500 (Mar 2024)",
      contactNotes: "Attorney. Youth education meant a great deal to her late mother, Eleanor Walsh, who volunteered here for 15 years. Jennifer is considering a naming gift in her mother's honor.",
      volunteerHistory: "Attended Spring Gala 2025 and 2026, Eleanor Walsh Memorial donor since 2024" },
    { id: "d7", name: "Mark Abrams", currentGiving: "$3,800/yr", targetGiving: "$7,500/yr", assignedTo: "Kevin Park", lastContact: "Apr 3",
      note: "Meeting scheduled Apr 15 with ED",
      email: "mark.abrams@email.com", fundDesignation: "General Operating", totalGiving: "$15,200",
      lastGiftAmount: "$3,800", lastGiftDate: "January 2026",
      givingHistory: "$3,800 (Jan 2026), $3,800 (Jan 2025), $3,800 (Jan 2024), $3,800 (Jan 2023)",
      contactNotes: "Real estate developer. Long-time supporter since founding. Interested in capital campaign for new community center wing.",
      volunteerHistory: "Founding donor, attended every annual gala, site tour host for potential donors" },
  ],
  pledge: [
    { id: "d8", name: "Thomas Rivera", currentGiving: "$2,500/yr", targetGiving: "$5,000/yr", assignedTo: "Maria Santos", pledgeAmount: "$5,000", pledgeDate: "Apr 1, 2026",
      email: "thomas.rivera@email.com", fundDesignation: "General Operating", totalGiving: "$12,500",
      lastGiftAmount: "$5,000", lastGiftDate: "April 2026",
      givingHistory: "$5,000 pledge (Apr 2026), $2,500 (Jan 2026), $2,500 (Jan 2025), $2,500 (Jan 2024), $2,500 (Jan 2023), $2,500 (Jan 2022)",
      contactNotes: "Retired teacher. Believes strongly in educational equity. His grandchildren attend our after-school program.",
      volunteerHistory: "Reading tutor volunteer 2022-present, Mentor Match program participant" },
  ],
  upgraded: [
    { id: "d9", name: "Carol Nguyen", currentGiving: "$1,200/yr", targetGiving: "$2,500/yr", assignedTo: "Maria Santos", upgradeAmount: "+$1,300/yr", completedDate: "Mar 28, 2026",
      email: "carol.nguyen@email.com", fundDesignation: "Technology Access", totalGiving: "$4,900",
      lastGiftAmount: "$2,500", lastGiftDate: "March 2026",
      givingHistory: "$2,500 (Mar 2026 — upgraded!), $1,200 (Mar 2025), $1,200 (Mar 2024), $1,000 (Mar 2023)",
      contactNotes: "IT consultant. Upgraded after seeing demo of new computer lab. Very excited about STEM curriculum.",
      volunteerHistory: "Computer lab setup volunteer, Tech Career Day speaker 2025" },
  ],
};

export const DEMO_PIPELINE_STAFF = ["Maria Santos", "Kevin Park", "Lisa Chen"];

// ─── Grants Page ──────────────────────────────────────────────────

export interface GrantDeliverable {
  text: string;
  done: boolean;
}

export interface GrantsPageGrant {
  id: string;
  name: string;
  funder: string;
  amount: number;
  period: string;
  status: "AT RISK" | "ON TRACK";
  utilization: number;
  reportDueDays: number;
  programOfficer: string;
  deliverables: GrantDeliverable[];
  budgetBreakdown: { label: string; pct: number }[];
}

export const DEMO_GRANTS_PAGE: GrantsPageGrant[] = [
  {
    id: "g1", name: "Community Health Initiative", funder: "Kresge Foundation",
    amount: 185000, period: "Jan 1 – Dec 31, 2026", status: "AT RISK",
    utilization: 61, reportDueDays: 8, programOfficer: "Dr. Alicia Ramos",
    deliverables: [
      { text: "Q1 Progress Report submitted", done: true },
      { text: "Mid-year financial report submitted", done: true },
      { text: "Site visit scheduled (due May 15)", done: false },
      { text: "Final narrative report (due Dec 15)", done: false },
    ],
    budgetBreakdown: [{ label: "Personnel", pct: 45 }, { label: "Programs", pct: 35 }, { label: "Overhead", pct: 20 }],
  },
  {
    id: "g2", name: "Youth Programs Initiative", funder: "Robert Wood Johnson Foundation",
    amount: 95000, period: "Oct 1, 2025 – Sep 30, 2026", status: "ON TRACK",
    utilization: 88, reportDueDays: 31, programOfficer: "Marcus Webb",
    deliverables: [
      { text: "Program launch report", done: true },
      { text: "Quarterly financial update", done: true },
      { text: "Participant survey results", done: false },
      { text: "Year-end impact assessment", done: false },
    ],
    budgetBreakdown: [{ label: "Personnel", pct: 50 }, { label: "Programs", pct: 40 }, { label: "Overhead", pct: 10 }],
  },
  {
    id: "g3", name: "Technology Access Fund", funder: "Gates Foundation",
    amount: 125000, period: "Jul 1, 2025 – Jun 30, 2026", status: "ON TRACK",
    utilization: 44, reportDueDays: 83, programOfficer: "Sandra Liu",
    deliverables: [
      { text: "Equipment procurement report", done: true },
      { text: "Digital literacy curriculum plan", done: false },
      { text: "Mid-year progress report", done: false },
      { text: "Final impact report", done: false },
    ],
    budgetBreakdown: [{ label: "Equipment", pct: 55 }, { label: "Training", pct: 30 }, { label: "Admin", pct: 15 }],
  },
  {
    id: "g4", name: "Housing Support Initiative", funder: "Local Community Foundation",
    amount: 92000, period: "Jan 1 – Jun 30, 2026", status: "ON TRACK",
    utilization: 71, reportDueDays: 52, programOfficer: "James Okafor",
    deliverables: [
      { text: "Needs assessment completed", done: true },
      { text: "Partner agreements signed", done: true },
      { text: "Mid-program evaluation", done: false },
      { text: "Final report", done: false },
    ],
    budgetBreakdown: [{ label: "Direct Services", pct: 60 }, { label: "Staffing", pct: 30 }, { label: "Admin", pct: 10 }],
  },
];

// ─── Data Health Page ─────────────────────────────────────────────

export interface DataHealthDuplicateRecord {
  email: string;
  phone: string;
  lastGift: string;
  lastGiftDate: string;
  created: string;
}

export interface DataHealthDuplicatePair {
  id: string;
  name: string;
  idA: string;
  idB: string;
  confidence: number;
  recordA: DataHealthDuplicateRecord;
  recordB: DataHealthDuplicateRecord;
}

export interface DataHealthIncompleteProfile {
  id: string;
  name: string;
  missingFields: string[];
  lastUpdated: string;
}

export interface DataHealthStaleRecord {
  id: string;
  name: string;
  lastActivity: string;
  lastGift: string;
}

export interface DataHealthStripeAlert {
  amount: string;
  date: string;
  stripeId: string;
  email: string;
}

export const DEMO_DATA_HEALTH_PAGE = {
  score: 74,
  duplicates: [
    {
      id: "d1", name: "Sarah Chen", idA: "#1847", idB: "#2103", confidence: 94,
      recordA: { email: "sarah.chen@gmail.com", phone: "617-555-0142", lastGift: "$500", lastGiftDate: "Mar 2026", created: "Jan 2024" },
      recordB: { email: "sarah.chen@gmail.com", phone: "617-555-0198", lastGift: "$250", lastGiftDate: "Nov 2025", created: "Mar 2025" },
    },
    {
      id: "d2", name: "Michael Torres", idA: "#892", idB: "#1654", confidence: 87,
      recordA: { email: "mike.torres@outlook.com", phone: "781-555-0367", lastGift: "$1,200", lastGiftDate: "Feb 2026", created: "Aug 2022" },
      recordB: { email: "michael.torres@outlook.com", phone: "781-555-0367", lastGift: "$750", lastGiftDate: "Jan 2026", created: "May 2024" },
    },
    {
      id: "d3", name: "Jennifer Walsh", idA: "#3021", idB: "#3089", confidence: 99,
      recordA: { email: "jwalsh@comcast.net", phone: "508-555-0291", lastGift: "$2,500", lastGiftDate: "Apr 2026", created: "Apr 7, 2026 9:14am" },
      recordB: { email: "jwalsh@comcast.net", phone: "508-555-0291", lastGift: "$2,500", lastGiftDate: "Apr 2026", created: "Apr 7, 2026 9:16am" },
    },
  ] satisfies DataHealthDuplicatePair[],
  incomplete: [
    { id: "ip1", name: "Robert Kim", missingFields: ["Phone", "Address"], lastUpdated: "14 months ago" },
    { id: "ip2", name: "Patricia Osei", missingFields: ["Phone"], lastUpdated: "8 months ago" },
    { id: "ip3", name: "David Chen", missingFields: ["Address", "Birthdate"], lastUpdated: "2 years ago" },
    { id: "ip4", name: "Susan Park", missingFields: ["Employment"], lastUpdated: "6 months ago" },
    { id: "ip5", name: "Thomas Rivera", missingFields: ["Phone", "Address"], lastUpdated: "3 years ago" },
    { id: "ip6", name: "Angela Davis", missingFields: ["Email"], lastUpdated: "4 months ago" },
    { id: "ip7", name: "Mark Johnson", missingFields: ["Phone", "Birthdate"], lastUpdated: "11 months ago" },
    { id: "ip8", name: "Helen Brooks", missingFields: ["Address"], lastUpdated: "7 months ago" },
  ] satisfies DataHealthIncompleteProfile[],
  stale: [
    { id: "s1", name: "Margaret Liu", lastActivity: "22 months ago", lastGift: "$150" },
    { id: "s2", name: "William Park", lastActivity: "31 months ago", lastGift: "$75" },
    { id: "s3", name: "Helen Brooks", lastActivity: "19 months ago", lastGift: "$500" },
    { id: "s4", name: "James Okafor", lastActivity: "26 months ago", lastGift: "$200" },
  ] satisfies DataHealthStaleRecord[],
  stripeAlerts: [
    {
      amount: "$2,340.00",
      date: "April 6, 2026",
      stripeId: "ch_3OxK9L2eZvKYlo2C1mR4p7Qn",
      email: "m.chen@outlook.com",
    },
  ] satisfies DataHealthStripeAlert[],
};

// ─── Reconciliation Page ──────────────────────────────────────────

export type ReconciliationTxnStatus = "needs_action" | "under_review" | "resolved";

export interface ReconciliationFlaggedTxn {
  id: string;
  amount: string;
  date: string;
  stripeId: string;
  email: string;
  status: ReconciliationTxnStatus;
}

export interface ReconciliationMatchedTxn {
  date: string;
  name: string;
  amount: string;
  stripeId: string;
  sfId: string;
  status: string;
}

export const DEMO_RECONCILIATION_PAGE = {
  flaggedTxn: {
    id: "t1", amount: "$2,340.00", date: "April 6, 2026",
    stripeId: "ch_3OxK9L2eZvKYlo2C1mR4p7Qn",
    email: "m.chen@outlook.com", status: "needs_action" as const,
  } satisfies ReconciliationFlaggedTxn,
  pendingCount: 1,
  searchResults: [
    { name: "Sarah Chen", email: "sarah.chen@gmail.com", lastGift: "$500" },
    { name: "David Chen", email: "d.chen@work.com", lastGift: "$1,200" },
  ],
  matchedTxns: [
    { date: "Apr 7", name: "Jennifer Walsh", amount: "$2,500", stripeId: "ch_3Ox..7Qp", sfId: "DON-4821", status: "Matched ✓" },
    { date: "Apr 6", name: "Robert Kim", amount: "$150", stripeId: "ch_3Ox..8Rq", sfId: "DON-4819", status: "Matched ✓" },
    { date: "Apr 5", name: "Patricia Lee", amount: "$500", stripeId: "ch_3Ox..9Ss", sfId: "DON-4815", status: "Matched ✓" },
    { date: "Apr 4", name: "Mark Abrams", amount: "$1,000", stripeId: "ch_3Ox..0Tt", sfId: "DON-4812", status: "Matched ✓" },
    { date: "Apr 3", name: "Carol Nguyen", amount: "$250", stripeId: "ch_3Ox..1Uu", sfId: "DON-4810", status: "Matched ✓" },
    { date: "Apr 3", name: "Thomas Rivera", amount: "$5,000", stripeId: "ch_3Ox..2Vv", sfId: "DON-4809", status: "Matched ✓" },
    { date: "Apr 2", name: "Susan Park", amount: "$750", stripeId: "ch_3Ox..3Ww", sfId: "DON-4806", status: "Matched ✓" },
    { date: "Apr 1", name: "Lisa Chen", amount: "$300", stripeId: "ch_3Ox..4Xx", sfId: "DON-4802", status: "Matched ✓" },
    { date: "Apr 1", name: "James Wright", amount: "$1,200", stripeId: "ch_3Ox..5Yy", sfId: "DON-4801", status: "Matched ✓" },
    { date: "Apr 1", name: "Angela Davis", amount: "$400", stripeId: "ch_3Ox..6Zz", sfId: "DON-4800", status: "Matched ✓" },
  ] satisfies ReconciliationMatchedTxn[],
};

// ─── Post-Event Intelligence ──────────────────────────────────────

export interface PostEventAttendee {
  id: string;
  name: string;
  type: "Donor" | "Volunteer" | "Prospect" | "New Contact";
  engagement: string;
  followUp: "Pending" | "Contacted" | "Done";
}

export interface PostEventData {
  id: string;
  name: string;
  date: string;
  location: string;
  color: string;
  iconColor: string;
  status: "FOLLOW-UP NEEDED" | "COMPLETE";
  statusColor: string;
  summary: string;
  badges: string[];
  attendees: PostEventAttendee[];
}

const DEMO_GALA_ATTENDEES: PostEventAttendee[] = [
  { id: "a1", name: "Sarah Mitchell", type: "Donor", engagement: "Major Gift Prospect", followUp: "Contacted" },
  { id: "a2", name: "Robert Kim", type: "Prospect", engagement: "First-Time Attendee", followUp: "Pending" },
  { id: "a3", name: "Patricia Lee", type: "New Contact", engagement: "Corporate Contact", followUp: "Pending" },
  { id: "a4", name: "David Osei", type: "Donor", engagement: "Recurring Donor", followUp: "Done" },
  { id: "a5", name: "Jennifer Walsh", type: "Prospect", engagement: "Board Referral", followUp: "Pending" },
  { id: "a6", name: "Mark Abrams", type: "New Contact", engagement: "Walk-In", followUp: "Pending" },
  { id: "a7", name: "Lisa Chen", type: "Prospect", engagement: "Volunteer Interest", followUp: "Pending" },
  { id: "a8", name: "Thomas Rivera", type: "Donor", engagement: "Lapsed Donor", followUp: "Contacted" },
  { id: "a9", name: "Carol Nguyen", type: "New Contact", engagement: "Event Sponsor Rep", followUp: "Pending" },
  { id: "a10", name: "James Wright", type: "Prospect", engagement: "Table Captain Guest", followUp: "Pending" },
  { id: "a11", name: "Angela Torres", type: "Volunteer", engagement: "Active Volunteer", followUp: "Done" },
  { id: "a12", name: "Kevin Park", type: "Donor", engagement: "Mid-Level Donor", followUp: "Contacted" },
];

const DEMO_VOLUNTEER_ORIENTATION_ATTENDEES: PostEventAttendee[] = [
  { id: "v1", name: "Marcus Webb", type: "Volunteer", engagement: "New Recruit", followUp: "Pending" },
  { id: "v2", name: "Aisha Patel", type: "Volunteer", engagement: "Returning Volunteer", followUp: "Done" },
  { id: "v3", name: "Daniel Flores", type: "Volunteer", engagement: "New Recruit", followUp: "Pending" },
  { id: "v4", name: "Nadia Okafor", type: "Volunteer", engagement: "Skills-Based", followUp: "Pending" },
  { id: "v5", name: "Chris Bailey", type: "Volunteer", engagement: "New Recruit", followUp: "Pending" },
  { id: "v6", name: "Yuki Tanaka", type: "Donor", engagement: "Donor → Volunteer", followUp: "Done" },
  { id: "v7", name: "Emily Saunders", type: "Volunteer", engagement: "Returning Volunteer", followUp: "Contacted" },
  { id: "v8", name: "Omar Hassan", type: "Prospect", engagement: "Community Leader", followUp: "Pending" },
];

export const DEMO_POST_EVENT: PostEventData[] = [
  {
    id: "e1", name: "Spring Gala 2026", date: "April 3, 2026",
    location: "The Boston Marriott Copley Place",
    color: "bg-blue-100 dark:bg-blue-900/40", iconColor: "text-blue-600",
    status: "FOLLOW-UP NEEDED", statusColor: "bg-amber-100 text-amber-700 border-amber-200",
    summary: "247 attendees (187 existing donors, 42 prospects, 18 new contacts) · Revenue: $142,000",
    badges: ["47 not tagged in Salesforce", "12 volunteer interest", "8 upgrade prospects"],
    attendees: DEMO_GALA_ATTENDEES,
  },
  {
    id: "e2", name: "Volunteer Orientation", date: "March 15, 2026",
    location: "Brightside Foundation HQ — 120 Tremont St, Boston",
    color: "bg-green-100 dark:bg-green-900/40", iconColor: "text-green-600",
    status: "COMPLETE", statusColor: "bg-green-100 text-green-700 border-green-200",
    summary: "34 attendees · 28 new volunteers · 3 donors converted",
    badges: [],
    attendees: DEMO_VOLUNTEER_ORIENTATION_ATTENDEES,
  },
];

// ─── Dashboard digest helpers ─────────────────────────────────────

const ED_AGENT_SLUGS = [
  "crm-data-integrity",
  "reconciliation-fund-accounting",
  "grant-compliance",
  "event-intelligence",
  "board-reporting",
];

export function getWeeklyAgentRunsForSlugs(slugs: string[]): AgentActivityRun[] {
  const slugSet = new Set(slugs);
  const weekAgo = subDays(NOW, 7);
  return DEMO_AGENT_ACTIVITY.filter(
    (run) => run.status === "success" && slugSet.has(run.agentSlug) && run.completedAt >= weekAgo
  );
}

export interface SinceYouWereAwayDigest {
  lastLoginAgo: string;
  summary: string;
  actions: { label: string; href: string }[];
}

export function getSinceYouWereAwayDigest(role: "executive_director" | "development_director" | "finance_manager" | "operations_manager"): SinceYouWereAwayDigest {
  const slugMap: Record<typeof role, string[]> = {
    executive_director: ED_AGENT_SLUGS,
    development_director: ["event-intelligence", "grant-compliance"],
    finance_manager: ["reconciliation-fund-accounting", "grant-compliance"],
    operations_manager: ["crm-data-integrity"],
  };
  const weeklyRuns = getWeeklyAgentRunsForSlugs(slugMap[role]);
  const runCount = weeklyRuns.length;

  if (role === "executive_director") {
    return {
      lastLoginAgo: "2 days ago",
      summary: `Your AI agents ran ${runCount} times while you were away. The CRM Data Integrity Agent flagged 3 new potential duplicate records. The Grant Compliance Agent is tracking the Kresge Foundation report, due in 8 days with 61% fund utilization. One Stripe transaction from Apr 6 ($2,340) remains unmatched in Salesforce.`,
      actions: [
        { label: "Review 3 duplicates →", href: "/data-health" },
        { label: "Open grant report →", href: "/grants" },
        { label: "Review transaction →", href: "/reconciliation" },
      ],
    };
  }

  if (role === "development_director") {
    return {
      lastLoginAgo: "1 day ago",
      summary: `Your AI agents ran ${runCount} times this week. Event Intelligence flagged 47 Spring Gala attendees not yet tagged in Salesforce. Grant Compliance noted Youth Programs Initiative at 88% utilization.`,
      actions: [
        { label: "Tag gala attendees →", href: "/events?tab=post-event" },
        { label: "View donor pipeline →", href: "/donor-pipeline" },
      ],
    };
  }

  if (role === "finance_manager") {
    return {
      lastLoginAgo: "3 days ago",
      summary: `Your AI agents ran ${runCount} times this week. Reconciliation matched 146 of 147 April transactions. One Stripe payment ($2,340) still needs a donor match in Salesforce.`,
      actions: [
        { label: "Review transaction →", href: "/reconciliation" },
        { label: "View grants →", href: "/grants" },
      ],
    };
  }

  return {
    lastLoginAgo: "2 days ago",
    summary: `Your AI agents ran ${runCount} times this week. CRM Data Integrity found 3 duplicate pairs and 8 incomplete profiles requiring review.`,
    actions: [
      { label: "Review data health →", href: "/data-health" },
      { label: "View agent activity →", href: "/agents/activity" },
    ],
  };
}
