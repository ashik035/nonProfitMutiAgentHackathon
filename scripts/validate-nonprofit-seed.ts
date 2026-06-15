/**
 * Validates nonprofit seed generator output and demo data integrity.
 * Run: npm run seed:nonprofit:validate
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  DEMO_MEMBERS,
  DEMO_VOLUNTEERS,
  DEMO_CAMPAIGNS,
  DEMO_DONATIONS_RECENT,
  DEMO_MANAGED_EVENTS,
  DEMO_PROGRAMS,
} from "../src/shared/data/nonprofitDemoData.ts";
import { seedUuid } from "./generate-nonprofit-seed.ts";

const SEED_DIR = join(import.meta.dirname, "../supabase/seed");

function countInsertRows(sql: string, table: string): number {
  const re = new RegExp(`INSERT INTO public\\.${table}[\\s\\S]*?\\) VALUES`, "i");
  const match = sql.match(re);
  if (!match || match.index === undefined) return 0;
  const start = match.index + match[0].length;
  const chunk = sql.slice(start);
  const end = chunk.search(/\nON CONFLICT|\nINSERT INTO|\nDELETE FROM|\n--/);
  const valuesBlock = end === -1 ? chunk : chunk.slice(0, end);
  return (valuesBlock.match(/\),\s*\n/g) ?? []).length + (valuesBlock.trim().startsWith("(") ? 1 : 0);
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const shiftCount = DEMO_VOLUNTEERS.reduce((sum, v) => sum + v.shifts.length, 0);
const registrantCount = DEMO_MANAGED_EVENTS.reduce((sum, e) => sum + e.registrants.length, 0);
const ticketCount = DEMO_MANAGED_EVENTS.reduce((sum, e) => sum + e.ticketTypes.length, 0);
const speakerCount = DEMO_MANAGED_EVENTS.reduce((sum, e) => sum + e.speakers.length, 0);
const agendaCount = DEMO_MANAGED_EVENTS.reduce((sum, e) => sum + e.agenda.length, 0);

const membersSql = readFileSync(join(SEED_DIR, "10-nonprofit-members.sql"), "utf8");
const volunteersSql = readFileSync(join(SEED_DIR, "11-nonprofit-volunteers.sql"), "utf8");
const donationsSql = readFileSync(join(SEED_DIR, "12-nonprofit-donations.sql"), "utf8");
const eventsSql = readFileSync(join(SEED_DIR, "13-nonprofit-events.sql"), "utf8");
const programsSql = readFileSync(join(SEED_DIR, "14-nonprofit-programs.sql"), "utf8");

assert(countInsertRows(membersSql, "nonprofit_members") === DEMO_MEMBERS.length, "Member row count mismatch");
assert(countInsertRows(volunteersSql, "nonprofit_volunteers") === DEMO_VOLUNTEERS.length, "Volunteer row count mismatch");
assert(countInsertRows(volunteersSql, "nonprofit_volunteer_shifts") === shiftCount, "Shift row count mismatch");
assert(countInsertRows(donationsSql, "nonprofit_campaigns") === DEMO_CAMPAIGNS.length, "Campaign row count mismatch");
assert(countInsertRows(donationsSql, "nonprofit_donations") === DEMO_DONATIONS_RECENT.length, "Donation row count mismatch");
assert(countInsertRows(eventsSql, "nonprofit_events") === DEMO_MANAGED_EVENTS.length, "Event row count mismatch");
assert(countInsertRows(eventsSql, "nonprofit_event_registrants") === registrantCount, "Registrant row count mismatch");
assert(countInsertRows(eventsSql, "nonprofit_event_ticket_types") === ticketCount, "Ticket type row count mismatch");
assert(countInsertRows(eventsSql, "nonprofit_event_speakers") === speakerCount, "Speaker row count mismatch");
assert(countInsertRows(eventsSql, "nonprofit_event_agenda_items") === agendaCount, "Agenda row count mismatch");
assert(countInsertRows(programsSql, "nonprofit_programs") === DEMO_PROGRAMS.length, "Program row count mismatch");

for (const d of DEMO_DONATIONS_RECENT) {
  assert(donationsSql.includes(`'${seedUuid(d.campaignId)}'`), `Missing campaign FK for donation ${d.id}`);
}

console.log("OK — seed SQL matches nonprofitDemoData.ts:");
console.log(`  members: ${DEMO_MEMBERS.length}`);
console.log(`  volunteers: ${DEMO_VOLUNTEERS.length}, shifts: ${shiftCount}`);
console.log(`  campaigns: ${DEMO_CAMPAIGNS.length}, donations: ${DEMO_DONATIONS_RECENT.length}`);
console.log(`  events: ${DEMO_MANAGED_EVENTS.length}, registrants: ${registrantCount}`);
console.log(`  programs: ${DEMO_PROGRAMS.length}`);
