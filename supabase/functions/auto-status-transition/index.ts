import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0';
import { getCorsHeaders, handleCorsPreflight } from '../_shared/cors.ts';

/**
 * Promotes projects from project-queue / on-hold → active when ActiveCollab has
 * logged hours in the previous ISO week OR the current ISO week.
 * Demotes active → on-hold when no logged hours exist in either week.
 *
 * Live AC fallback is REQUIRED — the synced `activecollab_time_records` table
 * often lags or misses rows for projects whose AC sync failed. So for every
 * candidate `project-queue` / `on-hold` project we ask the live AC proxy
 * (`ac-project-hours`) for hours in the window.
 *
 * The live call uses a direct `fetch` with the project's anon key + the
 * function's service-role bearer (the function is configured with
 * `verify_jwt = true`). The previous implementation used
 * `supabase.functions.invoke()` from a service-role client, which the gateway
 * was rejecting → "Failed to send a request to the Edge Function" /
 * "non-2xx status code" for every project.
 */
Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') return handleCorsPreflight(origin);

  // Capture inbound auth before kicking work to background (req becomes unusable after response).
  const inboundAuthHeader = req.headers.get('Authorization') || '';

  const run = async () => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!supabaseUrl || !supabaseKey || !supabaseAnonKey) {
      return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    // Inbound caller token (cron or manual). The new SUPABASE_ANON_KEY env var
    // may be the non-JWT publishable key which the gateway rejects, so prefer
    // the inbound JWT bearer when it's present.
    const inboundBearer = inboundAuthHeader.replace(/^Bearer\s+/i, '').trim();
    const isJwt = (t: string) => /^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(t);
    const callerJwt = isJwt(inboundBearer) ? inboundBearer
      : (isJwt(supabaseAnonKey) ? supabaseAnonKey : '');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // ── Date windows ──────────────────────────────────────────────────────
    // Business rule: logged hours in previous ISO week OR current ISO week
    // count as "in progress".
    //
    // For the DB read we use a half-open [prevMonday, nextMonday) range.
    // For the live AC call we use the INCLUSIVE [prevMonday, sunday] range
    // (AC's `end_date` is inclusive — using nextMonday silently misses the
    // last day of the current week).
    const now = new Date();
    const monday = new Date(now);
    const dow = monday.getUTCDay() || 7; // Sun=0 → 7
    monday.setUTCDate(monday.getUTCDate() - (dow - 1));
    monday.setUTCHours(0, 0, 0, 0);
    const prevMonday = new Date(monday);
    prevMonday.setUTCDate(prevMonday.getUTCDate() - 7);
    const sunday = new Date(monday);
    sunday.setUTCDate(sunday.getUTCDate() + 6);
    const nextMonday = new Date(monday);
    nextMonday.setUTCDate(nextMonday.getUTCDate() + 7);

    const windowStart = prevMonday.toISOString().slice(0, 10);
    const windowEnd = nextMonday.toISOString().slice(0, 10);      // exclusive (DB)
    const acWindowEnd = sunday.toISOString().slice(0, 10);        // inclusive (AC)

    console.log(`[auto-status-transition] Window DB[${windowStart},${windowEnd}) AC[${windowStart},${acWindowEnd}]`);

    // ── Step A: synced DB hits ────────────────────────────────────────────
    const loggedSet = new Set<string>();
    const pageSize = 1000;
    let from = 0;
    while (true) {
      const { data, error } = await supabase
        .from('activecollab_time_records')
        .select('project_id')
        .gte('record_date', windowStart)
        .lt('record_date', windowEnd)
        .gt('hours', 0)
        .not('project_id', 'is', null)
        .range(from, from + pageSize - 1);
      if (error) {
        console.error('[auto-status-transition] time_records query error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      (data || []).forEach((r: { project_id: string | null }) => {
        if (r.project_id) loggedSet.add(r.project_id);
      });
      if (!data || data.length < pageSize) break;
      from += pageSize;
    }
    const dbHitCount = loggedSet.size;
    console.log(`[auto-status-transition] Synced DB hits: ${dbHitCount}`);

    // ── Step B: live AC fallback for AC-mapped on-hold / project-queue / completed ────
    const { data: pqOhProjects } = await supabase
      .from('projects')
      .select('id, name, status, activecollab_project_id, updated_at')
      .in('status', ['project-queue', 'on-hold'])
      .not('activecollab_project_id', 'is', null)
      .is('deleted_at', null);

    const { data: completedProjects } = await supabase
      .from('projects')
      .select('id, name, status, activecollab_project_id, updated_at')
      .eq('status', 'completed')
      .not('activecollab_project_id', 'is', null)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false })
      .limit(50);

    const candidateProjects = [
      ...((pqOhProjects || []) as Array<{ id: string; name: string; status: string; activecollab_project_id: string | number; updated_at: string }>),
      ...((completedProjects || []) as Array<{ id: string; name: string; status: string; activecollab_project_id: string | number; updated_at: string }>),
    ];

    const candidatesSkippedNoAc = ((await supabase
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .in('status', ['project-queue', 'on-hold'])
      .is('activecollab_project_id', null)
      .is('deleted_at', null)).count) ?? 0;

    const liveCandidates = candidateProjects.filter(p => !loggedSet.has(p.id));

    const liveSet = new Set<string>();
    const liveFailures: Array<{ id: string; name: string; ac: string | number; error: string }> = [];

    const callLiveAc = async (acProjectId: string | number): Promise<number> => {
      if (!callerJwt) throw new Error('No valid JWT available for ac-project-hours');
      const resp = await fetch(`${supabaseUrl}/functions/v1/ac-project-hours`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${callerJwt}`,
          'apikey': callerJwt,
        },
        body: JSON.stringify({
          project_id: acProjectId,
          start_date: windowStart,
          end_date: acWindowEnd,
        }),
        signal: AbortSignal.timeout(45_000),
      });
      if (!resp.ok) {
        const text = await resp.text().catch(() => '');
        throw new Error(`HTTP ${resp.status} ${text.slice(0, 200)}`);
      }
      const json = await resp.json();
      const logged = Number(json?.totals?.logged ?? 0);
      return Number.isFinite(logged) ? logged : 0;
    };

    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
    const callWithRetry = async (acProjectId: string | number): Promise<number> => {
      let lastErr: unknown;
      for (let attempt = 0; attempt < 3; attempt++) {
        try { return await callLiveAc(acProjectId); }
        catch (e) {
          lastErr = e;
          const msg = e instanceof Error ? e.message : String(e);
          const m = msg.match(/Retry after (\d+)ms/);
          if (m) {
            const wait = Math.min(Number(m[1]) || 1000, 60_000);
            await sleep(wait + 500);
            continue;
          }
          if (/HTTP 429|rate.?limit/i.test(msg)) {
            await sleep(5_000 * (attempt + 1));
            continue;
          }
          throw e;
        }
      }
      throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
    };

    const LIVE_CONCURRENCY = 2;
    for (let i = 0; i < liveCandidates.length; i += LIVE_CONCURRENCY) {
      const batch = liveCandidates.slice(i, i + LIVE_CONCURRENCY);
      await Promise.all(batch.map(async (p) => {
        try {
          const logged = await callWithRetry(p.activecollab_project_id);
          if (logged > 0) { liveSet.add(p.id); loggedSet.add(p.id); }
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          liveFailures.push({ id: p.id, name: p.name, ac: p.activecollab_project_id, error: msg });
        }
      }));
      await sleep(400);
    }

    console.log(`[auto-status-transition] Total with hours: DB=${dbHitCount} +liveOnly=${liveSet.size} = ${loggedSet.size}; liveCandidates=${liveCandidates.length}; liveFailures=${liveFailures.length}; skippedNoAc=${candidatesSkippedNoAc}`);
    if (liveFailures.length > 0) {
      console.warn(`[auto-status-transition] Sample live failures:`,
        liveFailures.slice(0, 5).map(f => `${f.ac}:${f.error}`).join(' | '));
    }

    // ── Step 1: Promote project-queue / on-hold / completed → active ──────
    const allLogged = Array.from(loggedSet);
    let movedToActive: Array<{ id: string; name: string; status: string }> = [];
    if (allLogged.length > 0) {
      const { data: promoted, error: promoteErr } = await supabase
        .from('projects')
        .update({ status: 'active' })
        .in('id', allLogged)
        .in('status', ['project-queue', 'on-hold', 'completed'])
        .is('deleted_at', null)
        .select('id, name, status');
      if (promoteErr) console.error('[auto-status-transition] Promote error:', promoteErr);
      else movedToActive = (promoted || []) as typeof movedToActive;
    }

    // ── Step 2: Demote active → on-hold when no hours in window ───────────
    const safetyStart = new Date(prevMonday);
    safetyStart.setUTCDate(safetyStart.getUTCDate() - 7);
    const safetyStartStr = safetyStart.toISOString().slice(0, 10);
    const recentLogged = new Set<string>(loggedSet);
    {
      let sfrom = 0;
      while (true) {
        const { data } = await supabase
          .from('activecollab_time_records')
          .select('project_id')
          .gte('record_date', safetyStartStr)
          .lt('record_date', windowEnd)
          .gt('hours', 0)
          .not('project_id', 'is', null)
          .range(sfrom, sfrom + pageSize - 1);
        (data || []).forEach((r: { project_id: string | null }) => {
          if (r.project_id) recentLogged.add(r.project_id);
        });
        if (!data || data.length < pageSize) break;
        sfrom += pageSize;
      }
    }

    const { data: activeProjects, error: activeErr } = await supabase
      .from('projects')
      .select('id, name, activecollab_project_id')
      .eq('status', 'active')
      .is('deleted_at', null);
    if (activeErr) {
      console.error('[auto-status-transition] Active query error:', activeErr);
      return new Response(JSON.stringify({ error: activeErr.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const preDemote = (activeProjects || []).filter(
      (p: { id: string }) => !recentLogged.has(p.id)
    ) as Array<{ id: string; name: string; activecollab_project_id: string | number | null }>;

    const verifiedDemote: string[] = [];
    let demoteLiveSaves = 0;
    for (let i = 0; i < preDemote.length; i += LIVE_CONCURRENCY) {
      const batch = preDemote.slice(i, i + LIVE_CONCURRENCY);
      await Promise.all(batch.map(async (p) => {
        if (!p.activecollab_project_id) { verifiedDemote.push(p.id); return; }
        try {
          const logged = await callWithRetry(p.activecollab_project_id);
          if (logged > 0) { demoteLiveSaves++; return; }
          verifiedDemote.push(p.id);
        } catch {
          // On AC failure, do NOT demote — safer to leave active.
        }
      }));
      await sleep(400);
    }

    let movedToOnHold: Array<{ id: string; name: string; status: string }> = [];
    if (verifiedDemote.length > 0) {
      const { data: demoted, error: demoteErr } = await supabase
        .from('projects')
        .update({ status: 'on-hold' })
        .in('id', verifiedDemote)
        .select('id, name, status');
      if (demoteErr) console.error('[auto-status-transition] Demote error:', demoteErr);
      else movedToOnHold = (demoted || []) as typeof movedToOnHold;
    }
    console.log(`[auto-status-transition] demote saved by live AC: ${demoteLiveSaves}`);

    console.log(`[auto-status-transition] → active: ${movedToActive.length}, → on-hold: ${movedToOnHold.length}`);

    console.log('[auto-status-transition] DONE', {
      dbHits: dbHitCount,
      liveOnlyHits: liveSet.size,
      totalWithHours: loggedSet.size,
      liveCandidates: liveCandidates.length,
      liveFailures: liveFailures.length,
      candidatesSkippedNoAc,
      movedToActive: movedToActive.length,
      movedToOnHold: movedToOnHold.length,
    });
  } catch (error) {
    console.error('[auto-status-transition] Unhandled:', error);
  }
  };

  // @ts-ignore EdgeRuntime is provided by Supabase edge runtime
  if (typeof EdgeRuntime !== 'undefined' && EdgeRuntime?.waitUntil) {
    // @ts-ignore
    EdgeRuntime.waitUntil(run());
  } else {
    run().catch((e) => console.error('[auto-status-transition] background error:', e));
  }

  return new Response(JSON.stringify({ success: true, status: 'started' }), {
    status: 202,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
