# Changelog

All notable changes to Nonprofit Control Tower are documented here.

---

## [0.2.0] — 2026-05-24

### Added — Tier 2: Real Supabase Backend for 4 Operational Modules

**Database (4 migration files, 11 tables)**

| Table | Purpose |
|-------|---------|
| `nonprofit_members` | Member directory — tier (General/Professional/Board/Honorary), status, renewal dates |
| `nonprofit_volunteers` | Volunteer roster — skills[], availability[], total_hours, donor crossover |
| `nonprofit_volunteer_shifts` | Per-volunteer shift log — event_name, date, hours, status |
| `nonprofit_events` | Event lifecycle — status, capacity, fund_raised |
| `nonprofit_event_ticket_types` | Ticket tiers per event — price, capacity, sold |
| `nonprofit_event_speakers` | Speaker roster per event |
| `nonprofit_event_agenda_items` | Agenda items per event |
| `nonprofit_event_registrants` | Registrants per event — check-in toggle |
| `nonprofit_campaigns` | Fundraising campaigns — goal, raised, fund_designation, is_active |
| `nonprofit_donations` | Individual donation records — amount, frequency, fund_designation |

All tables: RLS enabled (all-authenticated policy), `updated_at` triggers, `IF NOT EXISTS` safe.

**TypeScript Types**
- 11 new table types added to `src/integrations/supabase/types.ts` (Row / Insert / Update / Relationships)

**Cache Keys (`src/lib/cache.ts`)**
- Added `queryKeys.nonprofit.{members,volunteers,events,campaigns,donations}` key factories
- Added `invalidateKeys.nonprofitMembers/Volunteers/Events/Campaigns/Donations` helpers

**Hooks (5 new files)**

| File | Exports |
|------|---------|
| `src/hooks/useMembers.ts` | `useMembers`, `useMemberById`, `useCreateMember`, `useUpdateMember`, `useDeleteMember` |
| `src/hooks/useVolunteers.ts` | `useVolunteers`, `useVolunteerById`, `useCreateVolunteer`, `useUpdateVolunteer`, `useVolunteerShifts`, `useAllShifts`, `useCreateShift` |
| `src/hooks/useNonprofitEvents.ts` | `useNonprofitEvents`, `useNonprofitEventById`, `useCreateNonprofitEvent`, `useUpdateNonprofitEvent`, `useEventRegistrants`, `useCreateRegistrant`, `useToggleCheckin` |
| `src/hooks/useCampaigns.ts` | `useCampaigns`, `useCampaignById`, `useCreateCampaign`, `useUpdateCampaign` |
| `src/hooks/useDonations.ts` | `useDonations`, `useDonationsByCampaign`, `useDonationStats`, `useCreateDonation` |

**Pages Updated (4 files)**

| Page | Changes |
|------|---------|
| `MembershipPage.tsx` | Live members from DB, computed KPI stats, Add Member form persists, `isLoading` spinner |
| `VolunteersPage.tsx` | Live volunteers + all shifts (JOIN), economic value computed from real hours, Add Volunteer form persists |
| `EventManagementPage.tsx` | Live events, Registrations Sheet from DB, check-in toggle persists, Create Event Dialog persists |
| `DonationCenterPage.tsx` | Live campaigns + donations, fund breakdown from DB, New Donation form persists, stats from DB |

### Added — Playwright smoke-test script
- `verify-pages.mjs` — authenticates and visits all 7 nonprofit pages, probes UI interactions, saves failure screenshots

### Changed
- `package.json` — version bumped `0.1.0` → `0.2.0`
- `CLAUDE.md` — Nonprofit-Specific Pages section annotated with live DB tables; Core Tables section extended; Key Files reference updated with 5 new hook files
- `docs/02-modules/10-nonprofit-operations.md` — Demo Data section rewritten to distinguish live DB vs demo; individual module entries updated with backend notes
- `FEATURES.md` — Nonprofit Operations Modules table updated with Backend column; Demo Mode section updated; version header updated

---

## [0.1.0] — 2026-05-24

### Added — 7 new pages (Market Demand = High)

All pages use demo data from `nonprofitDemoData.ts` — no Supabase queries. Routes are additive; zero existing pages modified.

**Membership Management** (`/membership`)
- Member directory with search and tier filter (General / Professional / Board / Honorary)
- Status badges: Active, Expiring, Lapsed, Pending
- Renewals tab with Send Reminder and Re-Engage actions
- Add Member form (React Hook Form + Zod)
- Member detail Sheet with contact info, interests, action buttons

**Volunteer Management** (`/volunteers`)
- Card grid with skills badges, availability, and donor crossover indicator
- Economic value reporting ($31.80/hr × total hours)
- Shift history table across all volunteers
- Add Volunteer form with skills and availability checkboxes
- Volunteer detail Sheet with hours gauge and donor crossover callout

**Full Event Management** (`/event-management`)
- Separate from `/events` (post-event intelligence page — untouched)
- Status filters: All / Upcoming / Active / Past
- Capacity progress bars (green → amber → red at 90%)
- Event detail Sheet: speakers, agenda, ticket types with revenue
- Registrations Sheet with check-in status
- Create Event dialog

**Donation Center** (`/donations`)
- Campaign cards with goal progress bars
- Donation history with frequency filter (One-Time / Monthly / Quarterly / Annual)
- Fund breakdown visualization with plain-div progress bars
- Record Donation form (RHF + Zod)

**Public Presence** (`/public-presence`)
- 6-item visibility control Switches with instant feedback
- Mock previews: Event Feed, Donation Widget, Impact Stats
- Embed code snippets with async clipboard copy (`navigator.clipboard.writeText().then().catch()`)
- Social sharing: Facebook, Twitter/X, LinkedIn, Instagram

**Impact Dashboard** (`/impact-dashboard`)
- 6 KPI cards (Beneficiaries, Volunteer Hours, Funds Raised, Programs, Events, New Donors)
- 6 expandable program outcome cards with beneficiary progress bars
- 8 milestone items with category badges
- AI-drafted annual report via `ai-chat-assistant` edge function with graceful plain-text fallback

**AI Engagement Scoring** (`/engagement-scoring`)
- 12 demo members scored 0–100 (Active ≥70 / At Risk 40–69 / Lapsed <40)
- At-risk banner with bulk Re-Engage All action
- Tabbed table filtered by tier with score bar column
- Member detail Sheet: score gauge, engagement signals breakdown, AI Next Best Action via `ai-chat-assistant`

### Changed

- `package.json` — version bumped `0.0.0` → `0.1.0` (minor: 7 new feature modules)
- `src/modules/platform/routes.tsx` — 7 routes appended; dead `Help` import removed
- `src/shared/data/navigationStructure.ts` — 7 nav items appended to `nonprofit-ops` group
- `src/shared/data/nonprofitDemoData.ts` — 5 new data sections appended (Membership, Volunteers, Events, Donations, Public Presence)

### Fixed (code review findings applied before merge)

- `PublicPresencePage` — `navigator.clipboard.writeText()` now async with `.catch()` error toast
- `PublicPresencePage` — `window.open()` hardened with `noopener,noreferrer` (×2)
- `EventManagementPage` — Array-index React keys replaced with stable string keys (`speaker.name`, `item.time`)
- `EventManagementPage` — Emoji `💰` replaced with `DollarSign` lucide icon
- `DonationCenterPage` — `form.watch()` destructured once to prevent excessive re-renders
- `MembershipPage` — `form.watch()` destructured once to prevent excessive re-renders
- `routes.tsx` — Dead `import Help from "@/pages/Help"` removed

---

## [0.0.0] — Pre-release

Initial build: Dashboard, Grants, Events, Board Reports, Data Health, Reconciliation, Donor Pipeline, Donor Retention, Programs, Communications, Grant Writer, AI Agent Browse, Knowledge Base, Admin Panel, Supabase Auth (email + Google + Microsoft SSO).
