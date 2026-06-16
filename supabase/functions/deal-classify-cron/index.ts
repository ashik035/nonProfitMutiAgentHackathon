// Deal Classifier Cron — runs daily at 7 AM ET (12:00 UTC).
// Re-runs the deterministic pre-classifier (classifyDeal + extractAssetUrls)
// on every active deal and upserts the result to deal_ai_insights with
// agent_type = 'deal_classifier'. Does NOT call any LLM.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import {
  gatherContext,
  classifyDeal,
  extractAssetUrls,
} from "../_shared/deal-classifier.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CLOSED_STAGES = ["won", "lost", "accepted", "closedwon", "closedlost", "Closed Won", "Closed Lost"];

const BATCH_CONCURRENCY = 5;

async function processInBatches<T>(
  items: T[],
  size: number,
  worker: (item: T) => Promise<void>,
) {
  for (let i = 0; i < items.length; i += size) {
    await Promise.all(items.slice(i, i + size).map(worker));
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const startedAt = Date.now();
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const allDeals: Array<{ id: string }> = [];
    const pageSize = 1000;
    let from = 0;
    while (true) {
      const { data, error } = await supabase
        .from("deals")
        .select("id")
        .is("deleted_at", null)
        .not("stage", "in", `(${CLOSED_STAGES.map((s) => `"${s}"`).join(",")})`)
        .range(from, from + pageSize - 1);
      if (error) throw error;
      if (!data || data.length === 0) break;
      allDeals.push(...data);
      if (data.length < pageSize) break;
      from += pageSize;
    }

    console.log(`[deal-classify-cron] Processing ${allDeals.length} active deals`);

    let succeeded = 0;
    let failed = 0;
    const errors: Array<{ deal_id: string; error: string }> = [];

    await processInBatches(allDeals, BATCH_CONCURRENCY, async (deal) => {
      try {
        const ctx = await gatherContext(supabase, deal.id);
        if (!ctx.deal) {
          failed++;
          errors.push({ deal_id: deal.id, error: "deal not found in gatherContext" });
          return;
        }
        const flags = classifyDeal(ctx);
        const assetUrls = extractAssetUrls(ctx);

        const { error: upsertError } = await supabase
          .from("deal_ai_insights")
          .upsert(
            {
              deal_id: deal.id,
              agent_type: "deal_classifier",
              output: {
                deal_status: flags.status,
                blocking_reason: flags.blocking_reason,
                unblock_date: flags.unblock_date,
                internal_blocker_name: flags.internal_blocker_name,
                internal_blocker_action: flags.internal_blocker_action,
                asset_urls: assetUrls,
              },
              generated_at: new Date().toISOString(),
            },
            { onConflict: "deal_id,agent_type" },
          );

        if (upsertError) {
          failed++;
          errors.push({ deal_id: deal.id, error: upsertError.message });
        } else {
          succeeded++;
        }
      } catch (err) {
        failed++;
        errors.push({
          deal_id: deal.id,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    });

    const durationMs = Date.now() - startedAt;
    console.log(
      `[deal-classify-cron] Done in ${durationMs}ms — ${succeeded} ok, ${failed} failed`,
    );

    return new Response(
      JSON.stringify({
        ok: true,
        total: allDeals.length,
        succeeded,
        failed,
        duration_ms: durationMs,
        errors: errors.slice(0, 20),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[deal-classify-cron] Fatal:", err);
    return new Response(
      JSON.stringify({ ok: false, error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
