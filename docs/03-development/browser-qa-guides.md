# Browser QA Guides

Step-by-step browser verification guides for Nonprofit Control Tower features.  
When you ask *"how can I check this in the browser?"*, the agent should follow `.cursor/rules/browser-qa-guide.mdc` and use the relevant section below.

**Defaults**

| Item | Value |
|------|--------|
| Dev server | `npm run dev` → `http://localhost:8080` |
| Login | `/login` |
| Quick Login password | `Demo@123` |
| Main dashboard | `/dashboard` |

**Quick Login test accounts** (`src/pages/Login.tsx`)

| Role | Email |
|------|--------|
| Executive Director | `director@nonprofitai.software` |
| Development Director | `development@nonprofitai.software` |
| Finance Manager | `finance@nonprofitai.software` |
| Operations Manager | `operations@nonprofitai.software` |

**Role routing** (`src/pages/Dashboard.tsx`): non-admin users with an `agencyRole` see a role-specific dashboard. System admins (`profile.role === "admin"`) see the **generic** dashboard — role-only UI will not appear.

---

## AI ROI Hero Card (role dashboards)

**Files:** `AgentROIHeroCard.tsx`, `agentRoi.ts`, four `*Dashboard.tsx` components  
**Route:** `/dashboard` (per role)

### Route map

| Route | Purpose |
|-------|---------|
| `/login` | Quick Login test accounts |
| `/dashboard` | Role dashboard with ROI hero card |
| `/agents` | Per-agent time saved (wording: "this week") |
| `/agents/activity` | Demo agent run feed (source for run counts) |

### Step-by-step: Executive Director

1. Open **http://localhost:8080/login**
2. Click **Executive Director** on the Quick Login card (`director@nonprofitai.software`)
   - Signs in and navigates to `/dashboard`
3. Wait ~600ms for skeleton → full dashboard
4. Scroll if needed. Card order:
   - Org Health Score
   - Since You Were Away
   - **AI ROI hero card** ← target
   - Quick Stats row

### Expected values by role (weekly, from `DEMO_AGENT_ACTIVITY`)

| Role | Quick Login label | Hours | Est. value | Agent runs | Agents |
|------|-------------------|-------|------------|------------|--------|
| Executive Director | Executive Director | 17.5 | $612.50 | 9 | 5 |
| Development Director | Development Director | 6 | $210 | 4 | 2 |
| Finance Manager | Finance Manager | 6 | $210 | 4 | 2 |
| Operations Manager | Operations Manager | 3.5 | $122.50 | 2 | 1 |

### What to check on the card

- Headline: *"Your AI agents saved **X hours** this week"*
- Gradient styling on the hours number (`ai-gradient-text`)
- Sparkles icon in `ai-gradient` square (top-left of card)
- **Est. value** box: dollar amount at `$35/hr staff rate`
- **Agent runs** box: successful runs in the last 7 days
- Subline: run count across role-relevant agents
- Card sits **above** Quick Stats, **below** Since You Were Away
- Card uses `ai-card` top strip + subtle gradient background

### Switch roles

1. Top-right avatar → **Sign out**, or go to `/login`
2. Click another Quick Login tile
3. Confirm dashboard subtitle matches role (e.g. *"Finance Manager Dashboard"*)

### Optional cross-checks

- `/agents` — core agents show individual `timeSavedHrs` (labeled "this week")
- `/agents/activity` — filter runs by role-relevant agent slugs

### Troubleshooting

| Problem | Cause | Fix |
|---------|--------|-----|
| No ROI card | Logged in as system admin | Use Quick Login role accounts |
| Role setup modal | No `agency_role` on profile | Pick a role and save |
| Quick Login missing | Production host | Use `localhost`; hidden on `spark-start-kit-86.lovable.app` |
| Quick Login fails | Demo users not in Supabase | Seed auth users or use manual login |

### QA checklist

```
[ ] /login → Quick Login → Executive Director → /dashboard
[ ] ROI card between Since You Were Away and Quick Stats
[ ] ED: 17.5 hrs | $612.50 | 9 runs | 5 agents
[ ] DD: 6 hrs | $210 | 4 runs | 2 agents
[ ] FM: 6 hrs | $210 | 4 runs | 2 agents
[ ] OM: 3.5 hrs | $122.50 | 2 runs | 1 agent
[ ] Headline says "this week" (not "this month")
[ ] AI gradient styling visible
[ ] Admin login does NOT show ROI card (expected)
```

---

## Nonprofit live data pages (Membership, Volunteers, Donations, Events)

**Prerequisite:** Seed data applied to the database (see below).  
**Source:** [`nonprofitDemoData.ts`](../../src/shared/data/nonprofitDemoData.ts) via [`scripts/generate-nonprofit-seed.ts`](../../scripts/generate-nonprofit-seed.ts)

### Apply seed — pick your environment

| Environment | How to apply |
|-------------|----------------|
| **Lovable Cloud (no Supabase login)** | **[Lovable database ops guide](./lovable-database-operations.md)** — paste SQL in Lovable SQL Editor |
| Local dev + service role in `.env` | `npm run seed:nonprofit` |
| Supabase dashboard access | SQL Editor or `DATABASE_URL` + `npm run seed:nonprofit` |

#### Lovable SQL Editor (most common for this project)

1. Sign up / Quick Login on app Preview first (`auth.users` must exist)
2. Lovable → **Database** → **SQL Editor**
3. Paste and run **in order** (copy from repo in Cursor):
   - `supabase/seed/10-nonprofit-members.sql`
   - `supabase/seed/11-nonprofit-volunteers.sql`
   - `supabase/seed/12-nonprofit-donations.sql`
   - `supabase/seed/13-nonprofit-events.sql`
   - `supabase/seed/14-nonprofit-programs.sql`
4. Verify counts in Table view or with verification SQL in [lovable-database-operations.md](./lovable-database-operations.md)

**First time only:** run migration `supabase/migrations/20260615120000_nonprofit_programs.sql` before file 14 if the table is missing.

#### Terminal (optional — requires secrets in local `.env`)

```bash
npm run seed:nonprofit          # generate + validate + apply if credentials exist
npm run seed:nonprofit:generate # regenerate SQL after demo data edits
npm run seed:nonprofit:validate # check row counts match demo data
```

Requires `SUPABASE_SERVICE_ROLE_KEY` or `DATABASE_URL` in `.env` — usually **not** available without Supabase dashboard access.

### Route map

| Route | Sidebar | Live tables |
|-------|---------|-------------|
| `/membership` | People → Membership | `nonprofit_members` |
| `/volunteers` | People → Volunteers | `nonprofit_volunteers`, `nonprofit_volunteer_shifts` |
| `/donations` | Fundraising → Donation Center | `nonprofit_campaigns`, `nonprofit_donations` |
| `/events?tab=manage` | Events → Events (Manage tab) | `nonprofit_events` + ticket/speaker/agenda/registrant tables |

### Step-by-step (all pages)

1. Run seed (see above) if tables are empty
2. Open **http://localhost:8080/login**
3. Click any **Quick Login** role (must be authenticated)
4. Navigate via sidebar or direct URL for each page below

### `/membership` — what to check

| Element | Expected |
|---------|----------|
| KPI Total Members | **20** |
| KPI Active | **13** |
| KPI Expiring Soon | **4** |
| KPI Lapsed | **3** |
| Directory rows | Angela Torres, Sarah Mitchell, Mayor Gloria Chen visible |
| Tier filter | General (9), Professional (6), Board (3), Honorary (2) |
| Empty state | **Must NOT** appear after seed |

**Clicks:** Tier dropdown → filter "Board" → 3 rows; click a member row → detail sheet opens.

### `/volunteers` — what to check

| Element | Expected |
|---------|----------|
| Volunteer count | **15** in roster |
| Shifts tab | **30** shift rows total |
| Sample volunteer | Angela Torres — 2 shifts (Spring Gala Setup, Youth Mentorship) |
| Donor badge | 6 volunteers marked as also donors |

**Clicks:** Shifts tab → verify event names; click volunteer → shift history in sheet.

### `/donations` — what to check

| Element | Expected |
|---------|----------|
| Active campaigns | **3**: Spring Annual Fund, Technology Access Initiative, Youth Mentorship Endowment |
| Recent donations table | **20** rows |
| Anonymous gifts | Rows with donor "Anonymous" and anonymous flag |
| Sample donors | Sarah Mitchell ($2,500), Patricia Lee ($5,000), Lisa Chen ($10,000) |

**Clicks:** Campaign card → filtered donations; search "Mitchell" → 1 result.

### `/events?tab=manage` — what to check

| Element | Expected |
|---------|----------|
| Event list | **5** events (2 Upcoming, 1 Active, 2 Past) |
| Summer Leadership Summit | Status Upcoming; open detail → speakers, agenda, tickets, registrants |
| Community Health Fair | Status Active; registrants with check-in toggles |
| Annual Spring Gala | Status Past; fund raised **$42,000** |
| Registrants per event | 3–5 sample registrants (not empty) |

**Clicks:** Click event card → View Registrations sheet; toggle check-in on Active event registrant.

### Troubleshooting

| Problem | Cause | Fix |
|---------|--------|-----|
| Empty tables / empty states | Seed not applied | Lovable: paste seed SQL in Lovable SQL Editor (see [lovable-database-operations.md](./lovable-database-operations.md)) |
| Seed aborts on auth.users | No signed-up users | Create account via `/login` first |
| `npm run seed:nonprofit` skips DB | No `DATABASE_URL` in `.env` | Add connection string from Supabase Database settings |
| Stats differ from demo constants | Pages compute from DB rows | Expected — e.g. donation KPIs from 20 seeded gifts |

### QA checklist

```
[ ] Seed applied (10→13 SQL or npm run seed:nonprofit)
[ ] /membership — 20 members, KPIs 13/4/3, no empty state
[ ] /volunteers — 15 volunteers, 30 shifts
[ ] /donations — 3 campaigns, 20 donations
[ ] /events?tab=manage — 5 events, detail views populated
```

---

## Meeting Summarizer (flagship AI agent)

**Files:** `MeetingIntelligenceDetail.tsx`, `useMeetingSummarizer.ts`, `supabase/functions/generate-meeting-summary-v2/`
**Route:** `/agents/meeting-intelligence`

### Lovable Cloud only (no Supabase dashboard)

The Meeting Summarizer calls **`generate-meeting-summary-v2`** — an edge function **already on Lovable Cloud** (same stack as Grant Writer and Event Intelligence). You do **not** need Supabase login or CLI.

After code changes land in `main`:

1. Open the project in **Lovable**.
2. Click **Publish** (top right) and wait for the build to finish.
3. Test on the Lovable preview URL **or** localhost (`npm run dev` still talks to Lovable Cloud backend).

`LOVABLE_API_KEY` is managed by Lovable automatically.

### Route map

| Route | Purpose |
|-------|---------|
| `/agents` | Meeting Summarizer card under **Meeting AI Team** |
| `/agents/meeting-intelligence` | Paste transcript + Generate Minutes |

### Step-by-step

1. Lovable **Publish** after merge (see above)
2. `npm run dev` → http://localhost:8080/login (Quick Login `Demo@123`)
3. `/agents` → **Meeting AI Team** → **Meeting Summarizer** → **Summarize**
4. **Load Sample Transcript** → **Generate Minutes**
5. Confirm: Executive Summary, Attendance, Decisions, Action Items, Key Discussion Points

### Troubleshooting

| Problem | Fix |
|---------|-----|
| Failed to send request to Edge Function | Click **Publish** in Lovable again |
| `meeting_id is required` | Old function still live — Publish latest `main` |
| AI credits exhausted | Lovable billing / credits |
| 401 | Re-login at `/login` |

---

## Core nonprofit demo pages (Brightside Foundation seed)

**Source:** [`nonprofitDemoData.ts`](../../src/shared/data/nonprofitDemoData.ts) — single source of truth for dashboard, pipeline, grants, board reports, events post-event tab, data health, reconciliation, and voice notes.

### Route map

| Route | Expected on load |
|-------|------------------|
| `/dashboard` (ED Quick Login) | Org health **74**, weekly Time Saved > 0, ≥3 AI recommendations, AI activity widget |
| `/donor-pipeline` | **9** donors across 5 columns; Carol Nguyen upgraded **+$1,300/yr** |
| `/grants` | **4** grants: Kresge, RWJ, Gates, Local Community Foundation |
| `/board-reports` | **Q2 2026**, badge *Draft — Pending ED Approval*, PDF export works |
| `/events?tab=post-event` | Spring Gala **247** attendees, **47 not tagged in Salesforce** |
| `/events?tab=manage` | Spring Gala ~**247** registrations (after seed file 13) |
| `/data-health` | Score **74**, **3** duplicate pairs, **1** Stripe integration alert |
| `/reconciliation` | **1** flagged txn **$2,340**, partial-match ledger |
| `/voice-notes` | **5** debriefs with AI signal cards |

### Step-by-step (smoke pass)

1. `npm run dev` → **http://localhost:8080/login**
2. Quick Login → **Executive Director** → confirm `/dashboard` org health ring shows **74**
3. Sidebar → each route above; confirm no empty-state placeholders on first load
4. `/board-reports` → **Approve & Export PDF** → file downloads
5. `/events` → **Post-Event** tab → Spring Gala summary shows 247 / 47 untagged

### Events Manage tab (live DB)

Re-run seed after demo data changes:

- **Lovable:** SQL Editor → paste `supabase/seed/13-nonprofit-events.sql`
- **Local:** `npm run seed:nonprofit` (requires `DATABASE_URL` in `.env`)

Spring Gala row: capacity **300**, fund raised **$142,000**, ticket sold totals **247**.

### QA checklist

```
[ ] Dashboard ED: org health 74, Time Saved "this week", ≥3 AI alerts
[ ] Donor Pipeline: 9 cards, Carol Nguyen in Upgraded column
[ ] Grants: 4 funders match spec, utilization bars visible
[ ] Board Reports: Q2 2026, Pending ED Approval badge
[ ] Events post: 247 attendees, 47 not tagged in Salesforce
[ ] Data Health: 74 score, 3 duplicates, Stripe alert card
[ ] Reconciliation: $2,340 flagged txn, matched ledger rows
[ ] Voice Notes: 5 notes with signal cards (capacity, timing, sensitivities)
```

---

## Template for new features

Copy this block when adding a guide for a new feature:

```markdown
## [Feature name]

**Files:** …
**Route:** …

### Route map
(table)

### Step-by-step
1. …

### What to check
(table)

### Troubleshooting
(table)

### QA checklist
- [ ] …
```
