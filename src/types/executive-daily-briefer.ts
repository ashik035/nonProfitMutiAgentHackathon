export type BriefingSeverity = "critical" | "warning" | "info" | "success";
export type BriefingCategory = "grants" | "donors" | "operations" | "board" | "finance" | "events";

export interface BriefingPriorityItem {
  title: string;
  category: BriefingCategory;
  severity: BriefingSeverity;
  detail: string;
  href?: string;
}

export interface BriefingMetricsSnapshot {
  overdue_actions: number;
  grants_due_soon: number;
  at_risk_donors: number;
  open_tasks: number;
}

export interface ExecutiveDailyBriefing {
  greeting: string;
  briefing_date: string;
  executive_summary: string;
  priority_items: BriefingPriorityItem[];
  metrics_snapshot: BriefingMetricsSnapshot;
  time_saved_minutes: number;
  recommended_action: string;
}

export interface ExecutiveDailyBrieferResponse {
  run_id: string;
  briefing: ExecutiveDailyBriefing;
  time_saved_minutes: number;
  recommended_action: string;
  model: string;
  provider: string;
  latency_ms: number;
}
