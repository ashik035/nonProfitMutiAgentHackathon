/**
 * Donor Churn Risk Detector — flags at-risk donors from giving history.
 * Model pick for Shahed review: Claude Sonnet — pattern reasoning over donor history.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { chatCompletion } from "../_shared/ai-provider-routing.ts";
import {
  completeAgentRun,
  failAgentRun,
  logAgentActivity,
  resolveAgentId,
  startAgentRun,
} from "../_shared/agent-run-lifecycle.ts";
import {
  createServiceClient,
  getCorsHeaders,
  jsonResponse,
  parseJsonContent,
  validateRequestAuth,
} from "../_shared/agent-http.ts";

const AGENT_SLUG = "donor-churn-risk";
const MODEL = "claude-sonnet-4-20250514";

const SAMPLE_DONORS = [
  { id: "d-001", name: "James Wilson", last_gift_date: "2025-08-01", last_gift_amount: 250, total_giving: 1800, segment: "Mid-Level", days_since_last_gift: 320 },
  { id: "d-003", name: "Patricia Osei", last_gift_date: "2025-08-31", last_gift_amount: 1000, total_giving: 5400, segment: "Major Donor", days_since_last_gift: 290 },
  { id: "d-004", name: "Robert Kim", last_gift_date: "2025-09-15", last_gift_amount: 150, total_giving: 900, segment: "Regular", days_since_last_gift: 275 },
  { id: "d-005", name: "Nancy Thompson", last_gift_date: "2025-05-13", last_gift_amount: 75, total_giving: 450, segment: "Regular", days_since_last_gift: 400 },
  { id: "d-006", name: "William Davis", last_gift_date: "2025-07-02", last_gift_amount: 2000, total_giving: 8500, segment: "Major Donor", days_since_last_gift: 350 },
];

const SYSTEM_PROMPT = `You are a donor retention analyst for Brightside Foundation, a Boston nonprofit.
Analyze donor giving patterns and churn risk. Return valid JSON only:

{
  "summary": "Two sentences on portfolio churn risk and revenue exposure.",
  "at_risk_donors": [
    {
      "id": "string",
      "name": "string",
      "risk_score": 85,
      "risk_level": "high|medium|low",
      "days_since_last_gift": 290,
      "last_gift_amount": 1000,
      "total_giving": 5400,
      "segment": "Major Donor",
      "signals": ["290 days since last gift", "Declining frequency"],
      "recommended_outreach": "Specific outreach action"
    }
  ],
  "total_scanned": 5,
  "high_risk_count": 2,
  "medium_risk_count": 1,
  "revenue_at_risk": 13900,
  "time_saved_minutes": 25,
  "recommended_action": "Single team action for Development Director"
}

Rules:
- Include ALL donors from input with days_since_last_gift >= 180 in at_risk_donors.
- risk_score: 0–100 (high >= 70, medium 40–69, low < 40).
- revenue_at_risk: sum of total_giving for high-risk donors.
- signals: 2–4 concrete risk signals per donor.
- Order at_risk_donors by risk_score descending.
- Return only JSON.`;

interface DonorRow {
  id: string;
  name: string;
  last_gift_date?: string;
  last_gift_amount: number;
  total_giving: number;
  segment: string;
  days_since_last_gift: number;
}

interface ChurnResult {
  summary: string;
  at_risk_donors: Array<{
    id: string;
    name: string;
    risk_score: number;
    risk_level: string;
    days_since_last_gift: number;
    last_gift_amount: number;
    total_giving: number;
    segment: string;
    signals: string[];
    recommended_outreach: string;
  }>;
  total_scanned: number;
  high_risk_count: number;
  medium_risk_count: number;
  revenue_at_risk: number;
  time_saved_minutes: number;
  recommended_action: string;
}

function computeRiskScore(donor: DonorRow): number {
  let score = 0;
  const days = donor.days_since_last_gift;
  if (days >= 365) score += 45;
  else if (days >= 270) score += 35;
  else if (days >= 180) score += 20;

  if (donor.total_giving >= 5000) score += 25;
  else if (donor.total_giving >= 1000) score += 15;
  else score += 5;

  if (donor.segment.toLowerCase().includes("major")) score += 15;
  return Math.min(100, score);
}

function riskLevel(score: number): string {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

function ruleBasedResult(donors: DonorRow[]): ChurnResult {
  const atRisk = donors
    .filter((d) => d.days_since_last_gift >= 180)
    .map((d) => {
      const risk_score = computeRiskScore(d);
      const level = riskLevel(risk_score);
      const signals = [
        `${d.days_since_last_gift} days since last gift`,
        `Lifetime giving: $${d.total_giving.toLocaleString()}`,
        `${d.segment} segment`,
      ];
      if (d.days_since_last_gift >= 300) signals.push("Approaching lapsed donor threshold");
      return {
        id: d.id,
        name: d.name,
        risk_score,
        risk_level: level,
        days_since_last_gift: d.days_since_last_gift,
        last_gift_amount: d.last_gift_amount,
        total_giving: d.total_giving,
        segment: d.segment,
        signals,
        recommended_outreach:
          level === "high"
            ? `Priority personal call from ED or major-gifts officer — last gift $${d.last_gift_amount}.`
            : `Send personalized re-engagement email highlighting program impact.`,
      };
    })
    .sort((a, b) => b.risk_score - a.risk_score);

  const high = atRisk.filter((d) => d.risk_level === "high");
  const medium = atRisk.filter((d) => d.risk_level === "medium");
  const revenueAtRisk = high.reduce((s, d) => s + d.total_giving, 0);

  return {
    summary: `${atRisk.length} donors show elevated churn risk; ${high.length} are high priority with $${revenueAtRisk.toLocaleString()} lifetime giving at stake.`,
    at_risk_donors: atRisk,
    total_scanned: donors.length,
    high_risk_count: high.length,
    medium_risk_count: medium.length,
    revenue_at_risk: revenueAtRisk,
    time_saved_minutes: Math.min(35, 12 + atRisk.length * 3),
    recommended_action:
      high.length > 0
        ? `Schedule outreach to ${high[0].name} this week — highest risk major donor (${high[0].days_since_last_gift} days lapsed).`
        : "Review medium-risk donors in Donor Retention and queue re-engagement emails.",
  };
}

async function gatherDonors(
  supabase: ReturnType<typeof createServiceClient>,
  useSample: boolean
): Promise<DonorRow[]> {
  if (useSample) return SAMPLE_DONORS;

  const { data: donations } = await supabase
    .from("nonprofit_donations")
    .select("id, donor_name, amount, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  if (!donations?.length) return SAMPLE_DONORS;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const map = new Map<string, { id: string; last: Date; lastAmount: number; total: number }>();

  for (const row of donations) {
    const name = row.donor_name;
    const created = new Date(row.created_at ?? "");
    const amount = Number(row.amount) || 0;
    const existing = map.get(name);
    if (!existing) {
      map.set(name, { id: row.id, last: created, lastAmount: amount, total: amount });
    } else {
      existing.total += amount;
      if (created > existing.last) {
        existing.last = created;
        existing.lastAmount = amount;
      }
    }
  }

  return Array.from(map.entries()).map(([name, info]) => {
    const days = Math.floor((today.getTime() - info.last.getTime()) / 86400000);
    const segment =
      info.total >= 5000 ? "Major Donor" : info.total >= 1000 ? "Mid-Level" : "Regular";
    return {
      id: info.id,
      name,
      last_gift_date: info.last.toISOString().slice(0, 10),
      last_gift_amount: info.lastAmount,
      total_giving: info.total,
      segment,
      days_since_last_gift: days,
    };
  });
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get("Origin"));

  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method === "GET") {
    return jsonResponse({ ok: true, function: AGENT_SLUG }, 200, corsHeaders);
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405, corsHeaders);
  }

  const supabase = createServiceClient();
  let authUserId: string;
  try {
    authUserId = await validateRequestAuth(req, supabase);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    return jsonResponse({ error: "unauthorized", message }, 401, corsHeaders);
  }

  const startTime = Date.now();
  let runId: string | null = null;

  try {
    let body: { log_run?: boolean; use_sample?: boolean; ping?: boolean } = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    if (body.ping === true) {
      return jsonResponse({ ok: true, message: `${AGENT_SLUG} is ready` }, 200, corsHeaders);
    }

    const logRun = body.log_run !== false;
    const useSample = body.use_sample === true;
    const agentId = logRun ? await resolveAgentId(supabase, AGENT_SLUG) : null;

    if (logRun && agentId) {
      runId = await startAgentRun(supabase, {
        agentId,
        userId: authUserId,
        input: { use_sample: useSample },
        context: { agent_slug: AGENT_SLUG },
      });
    }

    const donors = await gatherDonors(supabase, useSample);
    const preScored = ruleBasedResult(donors);

    let result = preScored;
    let inputTokens = 0;
    let outputTokens = 0;
    let provider = "rules-fallback";

    try {
      const { data: modelRow } = await supabase
        .from("ai_models")
        .select("id")
        .eq("model_id", MODEL)
        .eq("enabled", true)
        .maybeSingle();

      const completion = await chatCompletion(
        supabase,
        {
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: `Analyze churn risk for these donors (pre-scored baseline included):\n\n${JSON.stringify({ donors, baseline: preScored }, null, 2)}`,
            },
          ],
          temperature: 0.2,
          max_tokens: 3000,
          model: MODEL,
        },
        modelRow?.id
      );

      const parsed = parseJsonContent<ChurnResult>(completion.content);
      result = {
        ...parsed,
        total_scanned: parsed.total_scanned ?? donors.length,
        high_risk_count:
          parsed.high_risk_count ??
          parsed.at_risk_donors.filter((d) => d.risk_level === "high").length,
        medium_risk_count:
          parsed.medium_risk_count ??
          parsed.at_risk_donors.filter((d) => d.risk_level === "medium").length,
        time_saved_minutes:
          typeof parsed.time_saved_minutes === "number" && parsed.time_saved_minutes > 0
            ? Math.round(parsed.time_saved_minutes)
            : preScored.time_saved_minutes,
        recommended_action: parsed.recommended_action?.trim() || preScored.recommended_action,
      };
      inputTokens = completion.input_tokens;
      outputTokens = completion.output_tokens;
      provider = "chat-routing";
    } catch (aiError) {
      console.warn("[donor-churn-risk] AI enrichment failed, using rules:", aiError);
    }

    const latencyMs = Date.now() - startTime;
    const findingsCount = result.at_risk_donors.length;

    if (runId && agentId) {
      await completeAgentRun(supabase, {
        runId,
        output: result as unknown as Record<string, unknown>,
        metadata: {
          agent_slug: AGENT_SLUG,
          time_saved_minutes: result.time_saved_minutes,
          recommended_action: result.recommended_action,
          findings_count: findingsCount,
          high_risk_count: result.high_risk_count,
          revenue_at_risk: result.revenue_at_risk,
        },
        modelUsed: MODEL,
        providerUsed: provider,
        latencyMs,
        tokenMetrics: { prompt_tokens: inputTokens, completion_tokens: outputTokens },
      });

      await logAgentActivity(supabase, authUserId, {
        agent_slug: AGENT_SLUG,
        agent_run_id: runId,
        time_saved_minutes: result.time_saved_minutes,
        recommended_action: result.recommended_action,
        findings_count: findingsCount,
        model: MODEL,
        provider,
      });
    }

    if (logRun && runId) {
      return jsonResponse(
        {
          run_id: runId,
          result,
          time_saved_minutes: result.time_saved_minutes,
          recommended_action: result.recommended_action,
          model: MODEL,
          provider,
          latency_ms: latencyMs,
        },
        200,
        corsHeaders
      );
    }

    return jsonResponse(result, 200, corsHeaders);
  } catch (error) {
    if (runId) {
      await failAgentRun(supabase, {
        runId,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        latencyMs: Date.now() - startTime,
      });
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonResponse({ error: "churn_risk_failed", message }, 500, corsHeaders);
  }
});
