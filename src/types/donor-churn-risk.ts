export type DonorRiskLevel = "high" | "medium" | "low";

export interface AtRiskDonorFinding {
  id: string;
  name: string;
  risk_score: number;
  risk_level: DonorRiskLevel;
  days_since_last_gift: number;
  last_gift_amount: number;
  total_giving: number;
  segment: string;
  signals: string[];
  recommended_outreach: string;
}

export interface DonorChurnRiskResult {
  summary: string;
  at_risk_donors: AtRiskDonorFinding[];
  total_scanned: number;
  high_risk_count: number;
  medium_risk_count: number;
  revenue_at_risk: number;
  time_saved_minutes: number;
  recommended_action: string;
}

export interface DonorChurnRiskResponse {
  run_id: string;
  result: DonorChurnRiskResult;
  time_saved_minutes: number;
  recommended_action: string;
  model: string;
  provider: string;
  latency_ms: number;
}
