export type InsightSeverity = "critical" | "warning" | "info";
export type InsightFocus = "all" | "grants" | "donors";

export interface StrategicInsightItem {
  title: string;
  detail: string;
  source_citation: string;
  confidence: number;
  severity?: InsightSeverity;
  segment?: string;
}

export interface StrategicInsightsResult {
  summary: string;
  grant_insights: StrategicInsightItem[];
  donor_insights: StrategicInsightItem[];
  knowledge_sources_used: number;
  time_saved_minutes: number;
  recommended_action: string;
}

export interface StrategicInsightsResponse {
  run_id: string;
  result: StrategicInsightsResult;
  time_saved_minutes: number;
  recommended_action: string;
  model: string;
  provider: string;
  latency_ms: number;
}
