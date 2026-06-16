// Shared deal classifier — used by deal-daily-briefing and deal-classify-cron.
// Pure deterministic logic — no AI calls.

export type DealStatusCode =
  | "BLOCKED_CLIENT_PAUSE"
  | "BLOCKED_WAITING_THIRD_PARTY"
  | "INTERNAL_BLOCKED"
  | "BLOCKED_NO_CONTACT"
  | "STRATEGIC_ZERO_VALUE"
  | "ACTIONABLE";

export interface DealFlags {
  status: DealStatusCode;
  blocking_reason: string | null;
  unblock_date: string | null;
  internal_blocker_name: string | null;
  internal_blocker_action: string | null;
  asset_urls: string[];
}

const CLIENT_PAUSE_PATTERNS: Array<{ re: RegExp; label: string }> = [
  { re: /\bon vacation\b/i, label: "client on vacation" },
  { re: /\bout of office\b|\bOOO\b/i, label: "client OOO" },
  { re: /\bon leave\b/i, label: "client on leave" },
  { re: /\btraveling\b|\btravelling\b/i, label: "client traveling" },
  { re: /\bnot now\b/i, label: "client said not now" },
  { re: /\bnot moving forward\b/i, label: "not moving forward" },
  { re: /\bnot interested\b/i, label: "not interested" },
  { re: /\bre-?engage in\b/i, label: "re-engage later" },
  { re: /\bcircle back in\b/i, label: "circle back later" },
  { re: /\bfollow ?up in\b/i, label: "follow up later" },
  { re: /\brevisit in\b/i, label: "revisit later" },
  { re: /\bno action until\b/i, label: "no action until" },
  { re: /\bwait until\b/i, label: "wait until" },
  { re: /\bon hold\b/i, label: "on hold" },
];

const THIRD_PARTY_PATTERNS: Array<{ re: RegExp; label: string }> = [
  { re: /\bwaiting on legal\b/i, label: "waiting on legal" },
  { re: /\bwaiting on (the )?MSA\b/i, label: "waiting on MSA" },
  { re: /\bwaiting on (an )?attorney\b/i, label: "waiting on attorney" },
  { re: /\bwaiting on client to initiate\b/i, label: "waiting on client to initiate" },
  { re: /\bwaiting on approval\b/i, label: "waiting on approval" },
];

const SJ_TEAM_NAMES = [
  "Vishwanathan", "George", "Sayeed", "Zaman", "Paresh",
  "Biplob", "Ketan", "Nurul", "Rehan", "Mithun", "Faysal",
];

const INTERNAL_VERBS = [
  "waiting on", "waiting for", "to send", "to deliver", "to review",
  "to update", "to complete", "to confirm",
];

const STRATEGIC_KEYWORDS = [
  "partnership", "white-label", "whitelabel", "white label",
  "reseller", "referral", "revenue share",
];

const DATE_RE =
  /\b(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\s+\d{1,2}(?:,?\s*\d{4})?|\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\b/;

function parseUnblockDateISO(text: string): string | null {
  const m = text.match(DATE_RE);
  if (!m) return null;
  const d = new Date(m[0]);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

interface TextEntry { text: string; }

// deno-lint-ignore no-explicit-any
export async function gatherContext(supabase: any, dealId: string) {
  const { data: deal } = await supabase
    .from("deals")
    .select("*, clients:client_id (name, slug, industry, domain)")
    .eq("id", dealId)
    .maybeSingle();

  const [
    { data: contact },
    { data: engagements },
    { data: comments },
    meetingsResult,
    { data: checklist },
    moodResult,
    momentumResult,
    researchResult,
  ] = await Promise.all([
    deal?.contact_id
      ? supabase.from("contacts")
          .select("id, first_name, last_name, email, title, followup_status, last_contact_date")
          .eq("id", deal.contact_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from("deal_engagements")
      .select("engagement_type, subject, body, from_email, to_emails, engagement_date, owner_name, call_outcome, call_direction")
      .eq("deal_id", dealId)
      .order("engagement_date", { ascending: false })
      .limit(10),
    supabase.from("deal_comments")
      .select("comment, user_name, created_at")
      .eq("deal_id", dealId)
      .order("created_at", { ascending: false })
      .limit(10),
    deal?.client_id
      ? supabase.from("meetings_v2")
          .select("title, meeting_date, ai_summary, status, notes")
          .eq("client_id", deal.client_id)
          .order("meeting_date", { ascending: false })
          .limit(5)
      : Promise.resolve({ data: [] }),
    supabase.from("deal_checklist")
      .select("label, completed")
      .eq("deal_id", dealId)
      .order("sort_order"),
    deal?.contact_id
      ? supabase.from("lead_mood_analysis")
          .select("mood_score, mood_label, key_signals, analyzed_at")
          .eq("contact_id", deal.contact_id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    deal?.contact_id
      ? supabase.from("lead_intent_analysis")
          .select("momentum_score, intent_status, momentum_signals, analyzed_at")
          .eq("contact_id", deal.contact_id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    deal?.client_id
      ? supabase.from("client_research")
          .select("research_type, analysis_summary, key_findings, recommended_actions")
          .eq("client_id", deal.client_id)
          .order("created_at", { ascending: false })
          .limit(3)
      : Promise.resolve({ data: [] }),
  ]);

  const meetings = (meetingsResult?.data as Array<Record<string, unknown>>) || [];
  const moodAnalysis = moodResult?.data || null;
  const momentumAnalysis = momentumResult?.data || null;
  const research = researchResult?.data || null;

  const daysInStage = deal?.updated_at
    ? Math.floor((Date.now() - new Date(deal.updated_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const closeDate = deal?.expected_close_date || deal?.closedate;
  const daysUntilClose = closeDate
    ? Math.floor((new Date(closeDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;
  const lastActivity = engagements?.[0]?.engagement_date || comments?.[0]?.created_at || deal?.updated_at;
  const daysSinceActivity = lastActivity
    ? Math.floor((Date.now() - new Date(lastActivity as string).getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  const totalChecklist = checklist?.length || 0;
  const completedChecklist = checklist?.filter((c: { completed: boolean }) => c.completed).length || 0;

  return {
    deal: deal ? {
      id: deal.id, name: deal.deal_name, amount: deal.value, stage: deal.stage,
      type: deal.dealtype, category: deal.category, closeDate, details: deal.details,
      leadSource: deal.lead_source, pipeline: deal.pipeline, nextStep: deal.next_step,
      probability: deal.probability, createdAt: deal.created_date, updatedAt: deal.updated_at,
    } : null,
    client: deal?.clients || null,
    contact,
    engagements: engagements || [],
    comments: comments || [],
    meetings,
    checklist: { total: totalChecklist, completed: completedChecklist, items: checklist || [] },
    moodAnalysis,
    momentumAnalysis,
    research: research || [],
    metrics: {
      daysInStage, daysUntilClose, daysSinceActivity,
      isStuck: daysInStage > 14,
      isCloseDateAtRisk: daysUntilClose !== null && daysUntilClose < 7,
      isPastDue: daysUntilClose !== null && daysUntilClose < 0,
    },
  };
}

export type DealContext = Awaited<ReturnType<typeof gatherContext>>;

function collectSearchableText(ctx: DealContext): TextEntry[] {
  const out: TextEntry[] = [];
  for (const c of ctx.comments as Array<Record<string, unknown>>) {
    if (c.comment) out.push({ text: String(c.comment) });
  }
  for (const e of ctx.engagements as Array<Record<string, unknown>>) {
    const parts = [e.subject, e.body].filter(Boolean).map(String);
    if (parts.length) out.push({ text: parts.join(" — ") });
  }
  return out;
}

export function classifyDeal(ctx: DealContext): Omit<DealFlags, "asset_urls"> {
  const entries = collectSearchableText(ctx);
  const joined = entries.map((e) => e.text).join("\n");

  for (const { re, label } of CLIENT_PAUSE_PATTERNS) {
    const hit = entries.find((e) => re.test(e.text));
    if (hit) {
      return {
        status: "BLOCKED_CLIENT_PAUSE",
        blocking_reason: label,
        unblock_date: parseUnblockDateISO(hit.text),
        internal_blocker_name: null,
        internal_blocker_action: null,
      };
    }
  }

  for (const { re, label } of THIRD_PARTY_PATTERNS) {
    const hit = entries.find((e) => re.test(e.text));
    if (hit) {
      return {
        status: "BLOCKED_WAITING_THIRD_PARTY",
        blocking_reason: label,
        unblock_date: parseUnblockDateISO(hit.text),
        internal_blocker_name: null,
        internal_blocker_action: null,
      };
    }
  }

  for (const name of SJ_TEAM_NAMES) {
    const nameRe = new RegExp(`\\b${name}\\b`, "i");
    for (const entry of entries) {
      if (!nameRe.test(entry.text)) continue;
      for (const verb of INTERNAL_VERBS) {
        const combo = new RegExp(
          `(?:${verb})[^\\n]{0,80}\\b${name}\\b|\\b${name}\\b[^\\n]{0,80}(?:${verb})`,
          "i",
        );
        if (combo.test(entry.text)) {
          const idx = entry.text.search(nameRe);
          const action = entry.text
            .slice(Math.max(0, idx - 60), idx + 120)
            .replace(/\s+/g, " ")
            .trim();
          return {
            status: "INTERNAL_BLOCKED",
            blocking_reason: `${name}: ${verb}`,
            unblock_date: null,
            internal_blocker_name: name,
            internal_blocker_action: action,
          };
        }
      }
    }
  }

  const contactEmail = (ctx.contact?.email ?? "").toString().trim();
  const contactFirst = (ctx.contact?.first_name ?? "").toString().trim();
  const contactLast = (ctx.contact?.last_name ?? "").toString().trim();
  if (!contactEmail && !contactFirst && !contactLast) {
    return {
      status: "BLOCKED_NO_CONTACT",
      blocking_reason: "no contact info on deal",
      unblock_date: null,
      internal_blocker_name: null,
      internal_blocker_action: null,
    };
  }

  const amount = Number(ctx.deal?.amount ?? 0);
  const dealTypeStr = `${ctx.deal?.type ?? ""} ${ctx.deal?.category ?? ""}`.toLowerCase();
  const strategicInType = STRATEGIC_KEYWORDS.some((k) => dealTypeStr.includes(k));
  const strategicInText = STRATEGIC_KEYWORDS.some((k) => joined.toLowerCase().includes(k));
  if ((!amount || amount === 0) && (strategicInType || strategicInText)) {
    const matched = STRATEGIC_KEYWORDS.find(
      (k) => dealTypeStr.includes(k) || joined.toLowerCase().includes(k),
    );
    return {
      status: "STRATEGIC_ZERO_VALUE",
      blocking_reason: matched ? `strategic: ${matched}` : "strategic deal",
      unblock_date: null,
      internal_blocker_name: null,
      internal_blocker_action: null,
    };
  }

  return {
    status: "ACTIONABLE",
    blocking_reason: null,
    unblock_date: null,
    internal_blocker_name: null,
    internal_blocker_action: null,
  };
}

const URL_RE = /https?:\/\/[^\s)>\]"']+/gi;
const ASSET_HOST_RE =
  /(lovable\.app|lovable\.dev|drive\.google\.com|docs\.google\.com|pandadoc\.com|figma\.com|notion\.so|loom\.com|dropbox\.com|onedrive\.live\.com|sharepoint\.com)/i;

export function extractAssetUrls(ctx: DealContext): string[] {
  const found = new Set<string>();
  const blobs: string[] = [];
  for (const c of ctx.comments as Array<Record<string, unknown>>) {
    if (c.comment) blobs.push(String(c.comment));
  }
  for (const e of ctx.engagements as Array<Record<string, unknown>>) {
    if (e.body) blobs.push(String(e.body));
    if (e.subject) blobs.push(String(e.subject));
  }
  if (ctx.deal?.details) blobs.push(String(ctx.deal.details));
  for (const blob of blobs) {
    const matches = blob.match(URL_RE);
    if (!matches) continue;
    for (const raw of matches) {
      const url = raw.replace(/[.,;:!?]+$/, "");
      if (ASSET_HOST_RE.test(url)) found.add(url);
    }
  }
  return Array.from(found).slice(0, 10);
}
