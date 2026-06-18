import type { ActionItemTrackerResult } from "@/types/action-item-tracker";
import type { DonorChurnRiskResult } from "@/types/donor-churn-risk";
import type { ExecutiveDailyBriefing } from "@/types/executive-daily-briefer";
import type { StrategicInsightsResult } from "@/types/strategic-insights";

/** Client-side fallbacks when the edge function is unreachable */
export const CLIENT_AGENT_FALLBACKS = {
  "action-item-tracker": {
    summary:
      "6 pending board actions tracked. 2 overdue and 1 blocked require immediate attention.",
    total_pending: 6,
    overdue: [
      {
        id: "fb-1",
        title: "Finalize FY27 operating budget draft for board vote",
        owner: "Patricia Okonkwo (ED)",
        due_date: "2026-04-10",
        status: "open",
        flag: "overdue" as const,
        days_overdue: 68,
        blocker_reason: null,
        source: "task" as const,
      },
    ],
    blocked: [
      {
        id: "fb-2",
        title: "Recruit two at-large board members — diversity committee shortlist",
        owner: "Maria Santos (Board Chair)",
        due_date: "2026-05-15",
        status: "blocked",
        flag: "blocked" as const,
        days_overdue: null,
        blocker_reason: "Waiting on governance committee revised charter approval",
        source: "task" as const,
      },
    ],
    due_soon: [
      {
        id: "fb-3",
        title: "Submit Kresge Foundation Q2 narrative report",
        owner: "James Liu (Development)",
        due_date: "2026-06-20",
        status: "in_progress",
        flag: "due_soon" as const,
        days_until_due: 8,
        blocker_reason: null,
        source: "task" as const,
      },
    ],
    on_track_count: 3,
    time_saved_minutes: 18,
    recommended_action:
      "Escalate overdue FY27 budget draft to the Executive Committee — schedule a 15-minute check-in this week.",
  } satisfies ActionItemTrackerResult,

  "executive-daily-briefer": {
    greeting: "Good morning, Executive Director",
    briefing_date: new Date().toISOString().slice(0, 10),
    executive_summary:
      "Kresge Q1 report is due within 8 days with narrative not started. Two board actions are overdue and three major donors show elevated lapse risk.",
    priority_items: [
      {
        title: "Kresge Foundation report due in 8 days",
        category: "grants",
        severity: "critical",
        detail: "Utilization at 61% — Q1 narrative draft not started.",
        href: "/grants",
      },
      {
        title: "2 board actions overdue",
        category: "board",
        severity: "warning",
        detail: "FY27 budget draft and ED compensation review need escalation.",
        href: "/tasks",
      },
      {
        title: "Major donors at churn risk",
        category: "donors",
        severity: "warning",
        detail: "Patricia Osei and William Davis — 290+ days since last gift.",
        href: "/donor-retention",
      },
    ],
    metrics_snapshot: { overdue_actions: 2, grants_due_soon: 2, at_risk_donors: 3, open_tasks: 6 },
    time_saved_minutes: 25,
    recommended_action:
      "Block 30 minutes with the Development Director on Kresge report and major-donor outreach.",
  } satisfies ExecutiveDailyBriefing,

  "donor-churn-risk": {
    summary:
      "5 donors scanned — 2 high-risk major donors represent $13,900 in revenue at risk. Personal outreach recommended within 7 days.",
    at_risk_donors: [
      {
        id: "d-003",
        name: "Patricia Osei",
        risk_score: 88,
        risk_level: "high",
        days_since_last_gift: 290,
        last_gift_amount: 1000,
        total_giving: 5400,
        segment: "Major Donor",
        signals: ["290 days since last gift", "Major donor stewardship gap"],
        recommended_outreach: "ED personal call — reference Community Health Initiative impact",
      },
      {
        id: "d-006",
        name: "William Davis",
        risk_score: 92,
        risk_level: "high",
        days_since_last_gift: 350,
        last_gift_amount: 2000,
        total_giving: 8500,
        segment: "Major Donor",
        signals: ["350 days lapsed", "Highest lifetime value at risk"],
        recommended_outreach: "Schedule in-person lunch — share Spring Gala outcomes",
      },
    ],
    total_scanned: 5,
    high_risk_count: 2,
    medium_risk_count: 2,
    revenue_at_risk: 13900,
    time_saved_minutes: 25,
    recommended_action:
      "Prioritize calls to Patricia Osei and William Davis before Friday's development standup.",
  } satisfies DonorChurnRiskResult,

  "strategic-insights": {
    summary:
      "Kresge Q1 report is the most urgent grant deliverable while two major donors show elevated lapse risk. Cross-link grant narrative work with major-donor outreach this week.",
    grant_insights: [
      {
        title: "Kresge Q1 report due in 8 days",
        detail: "Utilization at 61% with narrative not started — budget variance explanation required.",
        source_citation: "Kresge Foundation — Q1 Reporting Requirements",
        confidence: 0.92,
        severity: "critical",
      },
    ],
    donor_insights: [
      {
        title: "Patricia Osei — major donor at risk",
        detail: "290 days since last $1,000 gift; $5,400 lifetime — needs ED touchpoint.",
        source_citation: "Major Donor Stewardship Playbook",
        confidence: 0.88,
        segment: "Major Donor",
        severity: "critical",
      },
    ],
    knowledge_sources_used: 5,
    time_saved_minutes: 30,
    recommended_action:
      "Hold a 30-minute ED + Development huddle: assign Kresge narrative owner and schedule major-donor calls.",
  } satisfies StrategicInsightsResult,
} as const;
