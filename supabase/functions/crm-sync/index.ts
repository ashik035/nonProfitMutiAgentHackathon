/**
 * CRM Sync Edge Function
 * Bidirectional sync of contacts (and optionally leads/deals) with connected CRMs.
 * Run on schedule (e.g. every 5 min) or on-demand from admin.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  isCrmProviderSlug,
  fetchCrmContacts,
  pushCrmContact,
  type CrmContact,
  type CrmIntegrationConfig,
} from "../_shared/crm/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CRM_SLUGS = [
  "salesforce-npsp",
  "blackbaud-raiser-edge",
  "bloomerang",
  "neon-crm",
  "virtuous",
  "donorperfect",
  "hubspot-nonprofit",
  "kindful",
  "hubspot",
  "salesforce",
];

function slugToDataSource(slug: string): string {
  const map: Record<string, string> = {
    "hubspot-nonprofit": "hubspot",
    hubspot: "hubspot",
    "salesforce-npsp": "salesforce",
    salesforce: "salesforce",
    "zoho-crm": "zoho",
    pipedrive: "pipedrive",
    "blackbaud-raiser-edge": "blackbaud",
    bloomerang: "bloomerang",
    "neon-crm": "neon",
    virtuous: "virtuous",
    donorperfect: "donorperfect",
    kindful: "kindful",
  };
  return map[slug] ?? slug;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const { data: providerIds, error: provError } = await supabase
      .from("integration_providers")
      .select("id, slug")
      .in("slug", CRM_SLUGS);

    if (provError || !providerIds?.length) {
      return new Response(
        JSON.stringify({ success: true, results: [], message: "No CRM providers or no connected integrations" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const ids = providerIds.map((p: { id: string }) => p.id);
    const { data: integrations, error: listError } = await supabase
      .from("organization_integrations")
      .select("id, provider_id, config, oauth_tokens, connection_status, last_sync_at, enabled, is_primary")
      .eq("connection_status", "connected")
      .in("provider_id", ids);

    if (listError) {
      console.error("[crm-sync] list integrations error:", listError);
      return new Response(
        JSON.stringify({ success: false, error: listError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const slugById = Object.fromEntries(providerIds.map((p: { id: string; slug: string }) => [p.id, p.slug]));

    type IntRow = {
      id: string;
      provider_id: string;
      config: Record<string, unknown>;
      oauth_tokens: Record<string, unknown> | null;
      connection_status: string;
      last_sync_at: string | null;
      enabled: boolean | null;
      is_primary: boolean | null;
    };
    let rows = ((integrations ?? []) as IntRow[])
      .filter((r) => r.enabled !== false);
    const withPrimary = rows.filter((r) => r.is_primary === true);
    if (withPrimary.length > 0) {
      rows = withPrimary;
    }

    const results: { integration_id: string; slug: string; inbound: number; outbound: number; errors: string[] }[] = [];

    for (const row of rows) {
      const slug = slugById[row.provider_id];
      if (!slug || !isCrmProviderSlug(slug)) continue;

      const config: CrmIntegrationConfig = {
        ...(row.config as Record<string, unknown>),
        ...(row.oauth_tokens as Record<string, unknown> ?? {}),
      };
      const dataSource = slugToDataSource(slug);
      const errors: string[] = [];
      let inboundProcessed = 0;
      let outboundProcessed = 0;

      try {
        const since = row.last_sync_at
          ? Math.floor(new Date(row.last_sync_at).getTime() / 1000) - 60
          : undefined;

        const crmContacts = await fetchCrmContacts(slug, config, since);

        for (const c of crmContacts) {
          const { data: existing } = await supabase
            .from("contacts")
            .select("id")
            .eq("external_id", c.external_id)
            .eq("data_source", dataSource)
            .maybeSingle();

          const row = {
            first_name: c.first_name,
            last_name: c.last_name,
            email: c.email,
            phone: c.phone,
            company: c.company,
            external_id: c.external_id,
            external_url: c.external_url ?? null,
            data_source: dataSource,
            last_synced_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          if (existing?.id) {
            const { error: updateErr } = await supabase.from("contacts").update(row).eq("id", existing.id);
            if (updateErr) errors.push(updateErr.message);
            else inboundProcessed += 1;
          } else {
            const { error: insertErr } = await supabase.from("contacts").insert(row);
            if (insertErr) errors.push(insertErr.message);
            else inboundProcessed += 1;
          }
        }

        const { data: localContacts } = await supabase
          .from("contacts")
          .select("id, first_name, last_name, email, phone, company, external_id, external_url, updated_at, last_synced_at")
          .or(`data_source.eq.${dataSource},data_source.eq.manual`)
          .limit(50);

        const toPush = (localContacts ?? []) as Array<{
          id: string;
          first_name: string;
          last_name: string | null;
          email: string | null;
          phone: string | null;
          company: string | null;
          external_id: string | null;
          external_url: string | null;
          updated_at: string;
          last_synced_at: string | null;
        }>;

        for (const loc of toPush) {
          const needPush =
            !loc.last_synced_at ||
            new Date(loc.updated_at) > new Date(loc.last_synced_at ?? 0);
          if (!needPush) continue;
          const contact: CrmContact = {
            external_id: loc.external_id ?? "",
            first_name: loc.first_name,
            last_name: loc.last_name,
            email: loc.email,
            phone: loc.phone,
            company: loc.company,
            external_url: loc.external_url,
          };
          const result = await pushCrmContact(slug, config, contact);
          if (result.success) {
            outboundProcessed += result.processed;
            await supabase
              .from("contacts")
              .update({
                last_synced_at: new Date().toISOString(),
                external_id: loc.external_id ?? undefined,
                updated_at: new Date().toISOString(),
              })
              .eq("id", loc.id);
          } else if (result.message) {
            errors.push(result.message);
          }
        }

        await supabase.from("organization_integrations").update({
          last_sync_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }).eq("id", row.id);

        await supabase.from("crm_sync_logs").insert({
          organization_integration_id: row.id,
          direction: "inbound",
          entity_type: "contacts",
          status: errors.length > 0 ? "partial" : "success",
          message: errors.length > 0 ? errors.slice(0, 3).join("; ") : null,
          records_processed: inboundProcessed,
        });
        await supabase.from("crm_sync_logs").insert({
          organization_integration_id: row.id,
          direction: "outbound",
          entity_type: "contacts",
          status: errors.length > 0 ? "partial" : "success",
          message: errors.length > 0 ? errors.slice(0, 3).join("; ") : null,
          records_processed: outboundProcessed,
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        errors.push(msg);
        await supabase.from("crm_sync_logs").insert({
          organization_integration_id: row.id,
          direction: "inbound",
          entity_type: "contacts",
          status: "error",
          message: msg,
          records_processed: 0,
        });
      }

      results.push({
        integration_id: row.id,
        slug,
        inbound: inboundProcessed,
        outbound: outboundProcessed,
        errors,
      });
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[crm-sync]", msg);
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  }
});
