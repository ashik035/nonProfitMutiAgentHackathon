/**
 * Applies nonprofit demo data via Supabase service role (bypasses RLS).
 * Requires SUPABASE_SERVICE_ROLE_KEY + SUPABASE_URL (or VITE_SUPABASE_URL).
 * Run: npm run seed:nonprofit:apply
 */

import { parse, format } from "date-fns";
import { createClient } from "@supabase/supabase-js";
import {
  DEMO_MEMBERS,
  DEMO_VOLUNTEERS,
  DEMO_CAMPAIGNS,
  DEMO_DONATIONS_RECENT,
  DEMO_MANAGED_EVENTS,
  DEMO_PROGRAMS,
} from "../src/shared/data/nonprofitDemoData.ts";
import { seedUuid } from "./generate-nonprofit-seed.ts";

const DATE_FMT = "MMM d, yyyy";

function parseDemoDate(raw: string, context: string): string {
  const parsed = parse(raw, DATE_FMT, new Date());
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Failed to parse date "${raw}" for ${context}`);
  }
  return format(parsed, "yyyy-MM-dd");
}

function parseDemoTimestamp(raw: string, context: string): string {
  return `${parseDemoDate(raw, context)}T12:00:00.000Z`;
}

function loadEnv(): { url: string; serviceKey: string } {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!url || !serviceKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY and SUPABASE_URL (or VITE_SUPABASE_URL). " +
        "Add them to .env from Supabase Dashboard → Settings → API."
    );
  }
  return { url, serviceKey };
}

async function getCreatedBy(supabase: ReturnType<typeof createClient>): Promise<string | null> {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
  if (error) {
    console.warn("Could not list auth users:", error.message);
    return null;
  }
  return data.users[0]?.id ?? null;
}

async function upsert<T extends Record<string, unknown>>(
  supabase: ReturnType<typeof createClient>,
  table: string,
  rows: T[]
): Promise<void> {
  if (rows.length === 0) return;
  const { error } = await supabase.from(table).upsert(rows, { onConflict: "id" });
  if (error) throw new Error(`${table}: ${error.message}`);
}

async function deleteByIds(
  supabase: ReturnType<typeof createClient>,
  table: string,
  ids: string[]
): Promise<void> {
  if (ids.length === 0) return;
  const { error } = await supabase.from(table).delete().in("id", ids);
  if (error) throw new Error(`delete ${table}: ${error.message}`);
}

async function main(): Promise<void> {
  const { url, serviceKey } = loadEnv();
  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const createdBy = await getCreatedBy(supabase);
  if (!createdBy) {
    console.warn("WARNING: No auth.users found — created_by will be null. Sign up via the app first.");
  }

  console.log("Deleting existing seed rows (fixed UUIDs only)...");
  const memberIds = DEMO_MEMBERS.map((m) => seedUuid(m.id));
  const volunteerIds = DEMO_VOLUNTEERS.map((v) => seedUuid(v.id));
  const shiftIds = DEMO_VOLUNTEERS.flatMap((v) => v.shifts.map((s) => seedUuid(s.id)));
  const campaignIds = DEMO_CAMPAIGNS.map((c) => seedUuid(c.id));
  const donationIds = DEMO_DONATIONS_RECENT.map((d) => seedUuid(d.id));
  const eventIds = DEMO_MANAGED_EVENTS.map((e) => seedUuid(e.id));
  const registrantIds = DEMO_MANAGED_EVENTS.flatMap((e) => e.registrants.map((r) => seedUuid(r.id)));
  const agendaIds = DEMO_MANAGED_EVENTS.flatMap((e) =>
    e.agenda.map((a, i) => seedUuid(`${e.id}:agenda:${i}:${a.time}`))
  );
  const speakerIds = DEMO_MANAGED_EVENTS.flatMap((e) =>
    e.speakers.map((s, i) => seedUuid(`${e.id}:speaker:${i}:${s.name}`))
  );
  const ticketIds = DEMO_MANAGED_EVENTS.flatMap((e) =>
    e.ticketTypes.map((t, i) => seedUuid(`${e.id}:ticket:${i}:${t.tier}`))
  );
  const programIds = DEMO_PROGRAMS.map((p) => seedUuid(p.id));

  await deleteByIds(supabase, "nonprofit_event_registrants", registrantIds);
  await deleteByIds(supabase, "nonprofit_event_agenda_items", agendaIds);
  await deleteByIds(supabase, "nonprofit_event_speakers", speakerIds);
  await deleteByIds(supabase, "nonprofit_event_ticket_types", ticketIds);
  await deleteByIds(supabase, "nonprofit_events", eventIds);
  await deleteByIds(supabase, "nonprofit_donations", donationIds);
  await deleteByIds(supabase, "nonprofit_campaigns", campaignIds);
  await deleteByIds(supabase, "nonprofit_volunteer_shifts", shiftIds);
  await deleteByIds(supabase, "nonprofit_volunteers", volunteerIds);
  await deleteByIds(supabase, "nonprofit_members", memberIds);
  await deleteByIds(supabase, "nonprofit_programs", programIds);

  console.log("Inserting members...");
  await upsert(
    supabase,
    "nonprofit_members",
    DEMO_MEMBERS.map((m) => ({
      id: seedUuid(m.id),
      created_by: createdBy,
      name: m.name,
      email: m.email,
      phone: m.phone ?? null,
      tier: m.tier,
      status: m.status,
      join_date: parseDemoDate(m.joinDate, m.id),
      renewal_date: parseDemoDate(m.renewalDate, m.id),
      employer: m.employer ?? null,
      interests: m.interests,
    }))
  );

  console.log("Inserting volunteers + shifts...");
  await upsert(
    supabase,
    "nonprofit_volunteers",
    DEMO_VOLUNTEERS.map((v) => ({
      id: seedUuid(v.id),
      created_by: createdBy,
      name: v.name,
      email: v.email,
      phone: null,
      skills: v.skills,
      availability: v.availability,
      total_hours: v.totalHours,
      joined_date: parseDemoDate(v.joinedDate, v.id),
      is_also_donor: v.isAlsoDonor,
      donor_total_giving: v.donorTotalGiving ?? null,
    }))
  );
  await upsert(
    supabase,
    "nonprofit_volunteer_shifts",
    DEMO_VOLUNTEERS.flatMap((v) =>
      v.shifts.map((s) => ({
        id: seedUuid(s.id),
        volunteer_id: seedUuid(v.id),
        event_name: s.eventName,
        date: parseDemoDate(s.date, s.id),
        hours: s.hours,
        status: s.status,
      }))
    )
  );

  console.log("Inserting campaigns + donations...");
  await upsert(
    supabase,
    "nonprofit_campaigns",
    DEMO_CAMPAIGNS.map((c) => ({
      id: seedUuid(c.id),
      created_by: createdBy,
      name: c.name,
      description: c.description,
      goal: c.goal,
      raised: c.raised,
      donor_count: c.donorCount,
      start_date: parseDemoDate(c.startDate, c.id),
      end_date: c.endDate ? parseDemoDate(c.endDate, c.id) : null,
      is_active: c.isActive,
      fund_designation: c.fundDesignation,
    }))
  );
  await upsert(
    supabase,
    "nonprofit_donations",
    DEMO_DONATIONS_RECENT.map((d) => ({
      id: seedUuid(d.id),
      campaign_id: seedUuid(d.campaignId),
      donor_name: d.donorName,
      donor_email: null,
      amount: d.amount,
      frequency: d.frequency,
      fund_designation: d.fundDesignation,
      is_anonymous: d.isAnonymous,
      payment_method: d.paymentMethod,
      created_at: parseDemoTimestamp(d.date, d.id),
    }))
  );

  console.log("Inserting events + related rows...");
  await upsert(
    supabase,
    "nonprofit_events",
    DEMO_MANAGED_EVENTS.map((e) => ({
      id: seedUuid(e.id),
      created_by: createdBy,
      title: e.title,
      status: e.status,
      date: parseDemoDate(e.date, e.id),
      location: e.location,
      description: e.description,
      capacity: e.capacity,
      fund_raised: e.fundRaised ?? null,
    }))
  );
  await upsert(
    supabase,
    "nonprofit_event_ticket_types",
    DEMO_MANAGED_EVENTS.flatMap((e) =>
      e.ticketTypes.map((t, i) => ({
        id: seedUuid(`${e.id}:ticket:${i}:${t.tier}`),
        event_id: seedUuid(e.id),
        tier: t.tier,
        price: t.price,
        capacity: t.capacity,
        sold: t.sold,
      }))
    )
  );
  await upsert(
    supabase,
    "nonprofit_event_speakers",
    DEMO_MANAGED_EVENTS.flatMap((e) =>
      e.speakers.map((s, i) => ({
        id: seedUuid(`${e.id}:speaker:${i}:${s.name}`),
        event_id: seedUuid(e.id),
        name: s.name,
        title: s.title,
        bio: s.organization,
        display_order: i,
      }))
    )
  );
  await upsert(
    supabase,
    "nonprofit_event_agenda_items",
    DEMO_MANAGED_EVENTS.flatMap((e) =>
      e.agenda.map((a, i) => ({
        id: seedUuid(`${e.id}:agenda:${i}:${a.time}`),
        event_id: seedUuid(e.id),
        time: a.time,
        title: a.title,
        speaker_name: a.speaker ?? null,
        display_order: i,
      }))
    )
  );
  await upsert(
    supabase,
    "nonprofit_event_registrants",
    DEMO_MANAGED_EVENTS.flatMap((e) =>
      e.registrants.map((r) => ({
        id: seedUuid(r.id),
        event_id: seedUuid(e.id),
        name: r.name,
        email: r.email,
        ticket_tier: r.ticketTier,
        checked_in: r.checkedIn,
        registered_at: parseDemoTimestamp(r.registeredDate, r.id),
      }))
    )
  );

  console.log("Inserting programs...");
  await upsert(
    supabase,
    "nonprofit_programs",
    DEMO_PROGRAMS.map((p) => ({
      id: seedUuid(p.id),
      created_by: createdBy,
      name: p.name,
      description: p.description,
      start_date: parseDemoDate(p.startDate, p.id),
      status: p.status,
      lead_staff: p.leadStaff,
      beneficiary_count: p.metrics.beneficiaryCount,
      volunteer_hours: p.metrics.volunteerHours,
      budget_used: p.metrics.budgetUsed,
      budget_total: p.metrics.budgetTotal,
      outcomes_achieved: p.metrics.outcomesAchieved,
      outcomes_target: p.metrics.outcomesTarget,
    }))
  );

  console.log("Nonprofit seed applied via service role.");
  console.log(`  members: ${DEMO_MEMBERS.length}`);
  console.log(`  volunteers: ${DEMO_VOLUNTEERS.length}`);
  console.log(`  campaigns: ${DEMO_CAMPAIGNS.length}, donations: ${DEMO_DONATIONS_RECENT.length}`);
  console.log(`  events: ${DEMO_MANAGED_EVENTS.length}`);
  console.log(`  programs: ${DEMO_PROGRAMS.length}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
