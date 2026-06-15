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

### Expected values by role

| Role | Quick Login label | Hours | Est. value | Agent runs | Agents |
|------|-------------------|-------|------------|------------|--------|
| Executive Director | Executive Director | 16 | $560 | 7 | 5 |
| Development Director | Development Director | 7 | $245 | 3 | 2 |
| Finance Manager | Finance Manager | 4.5 | $157.50 | 2 | 2 |
| Operations Manager | Operations Manager | 2.5 | $87.50 | 2 | 1 |

### What to check on the card

- Headline: *"Your AI agents saved **X hours** this month"*
- Gradient styling on the hours number (`ai-gradient-text`)
- Sparkles icon in `ai-gradient` square (top-left of card)
- **Est. value** box: dollar amount at `$35/hr staff rate`
- **Agent runs** box: count with *"this month"*
- Subline: *"Across N role-relevant agent(s)…"*
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
[ ] ED: 16 hrs | $560 | 7 runs | 5 agents
[ ] DD: 7 hrs | $245 | 3 runs | 2 agents
[ ] FM: 4.5 hrs | $157.50 | 2 runs | 2 agents
[ ] OM: 2.5 hrs | $87.50 | 2 runs | 1 agent
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
