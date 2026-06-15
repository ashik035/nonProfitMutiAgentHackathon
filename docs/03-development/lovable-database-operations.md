# Lovable Cloud — Database & Seed Operations

Use this guide when the project runs on **Lovable Cloud** (integrated Supabase) and you **do not** have direct access to [supabase.com/dashboard](https://supabase.com/dashboard).

**This repo’s pattern:** PostgreSQL is managed by Lovable. You apply SQL through **Lovable’s Database / SQL Editor**, not by logging into Supabase directly.

---

## When to use which path

| Your situation | What to do |
|----------------|------------|
| Lovable project, no Supabase login | **Lovable SQL Editor** (primary — see below) |
| Local dev + copied service role from Lovable Secrets | `npm run seed:nonprofit` (optional) |
| Full Supabase dashboard access | Supabase SQL Editor or `DATABASE_URL` + psql |

**Do not** tell Lovable-only users to “add `DATABASE_URL` to `.env`” as the first step — that requires Supabase dashboard access they may not have.

---

## Lovable SQL Editor — step by step (nonprofit seed example)

### Before you start

1. **Someone must exist in `auth.users`** — the seed SQL checks this.
   - Open your Lovable **Preview** or published app (e.g. `*.lovable.app`)
   - Go to `/login` and sign up, or use **Quick Login** if on localhost
   - If seed fails with `SEED ABORTED: No users in auth.users`, do this first

2. **Migrations must already be applied** — tables like `nonprofit_members` must exist.
   - In Lovable → **Database** → **Tables**, confirm you see `nonprofit_members`, `nonprofit_volunteers`, etc.
   - If missing, apply migrations from `supabase/migrations/` via SQL Editor first (or ask dev to run `npm run migrations:run` on a machine with Supabase CLI access)

### Before seed files 10→14

Run the **migration** once in Lovable SQL Editor if `nonprofit_programs` does not exist yet:

- Copy all of `supabase/migrations/20260615120000_nonprofit_programs.sql` → Run

Then run seed files 10→14 in order (see table above).

### Run the seed (5 files, in order)

Open your project in **Cursor** (or GitHub) — the SQL files live in the repo:

| Order | File in repo | What it inserts |
|-------|----------------|-----------------|
| 1 | `supabase/seed/10-nonprofit-members.sql` | 20 members |
| 2 | `supabase/seed/11-nonprofit-volunteers.sql` | 15 volunteers + 30 shifts |
| 3 | `supabase/seed/12-nonprofit-donations.sql` | 3 campaigns + 20 donations |
| 4 | `supabase/seed/13-nonprofit-events.sql` | 5 events + tickets, speakers, agenda, registrants |
| 5 | `supabase/seed/14-nonprofit-programs.sql` | 5 programs with metrics |

**For each file:**

1. In **Lovable** → open **Cloud** / **Database** → **SQL Editor** (wording may vary: “SQL”, “Query”, “Database editor”)
2. Click **New query**
3. In Cursor, open the file from the table above → **Select all** → **Copy**
4. **Paste** into Lovable SQL Editor
5. Click **Run** / **Execute**
6. Confirm success (no red error; often “Success” or row counts)
7. Repeat for the next file **in order** — do not skip or reorder

### Verify in Lovable (SQL Editor)

Run this after all seed files (10→14):

```sql
SELECT 'nonprofit_members' AS tbl, COUNT(*) AS n FROM nonprofit_members
UNION ALL SELECT 'nonprofit_volunteers', COUNT(*) FROM nonprofit_volunteers
UNION ALL SELECT 'nonprofit_volunteer_shifts', COUNT(*) FROM nonprofit_volunteer_shifts
UNION ALL SELECT 'nonprofit_campaigns', COUNT(*) FROM nonprofit_campaigns
UNION ALL SELECT 'nonprofit_donations', COUNT(*) FROM nonprofit_donations
UNION ALL SELECT 'nonprofit_events', COUNT(*) FROM nonprofit_events
UNION ALL SELECT 'nonprofit_event_registrants', COUNT(*) FROM nonprofit_event_registrants
UNION ALL SELECT 'nonprofit_programs', COUNT(*) FROM nonprofit_programs;
```

**Expected counts (seed only — minimum):**

| Table | Seed rows |
|-------|----------:|
| nonprofit_members | 20 |
| nonprofit_volunteers | 15 |
| nonprofit_volunteer_shifts | 30 |
| nonprofit_campaigns | 3 |
| nonprofit_donations | 20 |
| nonprofit_events | 5 |
| nonprofit_event_registrants | 18 |
| nonprofit_programs | 5 |

**Totals may be higher** if Lovable already had rows in these tables before you ran the seed. The seed only upserts 20 fixed demo members (and likewise for other tables) — it does **not** wipe the whole table.

Or use Lovable **Table view** → open each table and confirm rows appear.

#### Counts higher than the table above?

That usually means **the seed worked** plus **leftover data** from earlier Lovable testing or manual inserts.

Confirm demo rows exist (run in SQL Editor):

```sql
SELECT name, email, tier FROM nonprofit_members
WHERE name IN ('Angela Torres', 'Marcus Webb', 'Priya Mehta')
ORDER BY name;
```

You should see 3 known demo members. If yes, you’re good — check the app next.

**Optional — demo-only reset** (deletes *all* nonprofit rows, then re-run seed files 10→13):

Lovable will show **“Confirm destructive operation”** for `TRUNCATE` — that is normal. Only proceed if you want to remove *every* row in these tables (including old test data). **You do not need this step** if demo names already appear and the app shows data.

```sql
TRUNCATE TABLE
  public.nonprofit_event_registrants,
  public.nonprofit_event_agenda_items,
  public.nonprofit_event_speakers,
  public.nonprofit_event_ticket_types,
  public.nonprofit_events,
  public.nonprofit_donations,
  public.nonprofit_campaigns,
  public.nonprofit_volunteer_shifts,
  public.nonprofit_volunteers,
  public.nonprofit_members
CASCADE;
```

Click **Confirm / Run anyway** in Lovable if you chose to reset. Then paste and run `10` → `11` → `12` → `13` again. Counts should match the seed-only table exactly.

### Verify in the app (browser)

1. Open Preview / published URL
2. Log in (Quick Login on localhost)
3. Check:
   - `/membership` — demo members visible (e.g. Angela Torres), not empty state
   - `/volunteers` — demo volunteers visible
   - `/donations` — campaigns + gifts visible
   - `/events?tab=manage` — demo events visible
   - `/programs` — 5 programs with metrics (Youth Mentorship Program, etc.)

   Row counts in the UI may exceed seed totals if the database had prior rows.

Full click-by-click QA: [browser-qa-guides.md](./browser-qa-guides.md) → **Nonprofit live data pages**.

---

## Troubleshooting (Lovable)

| Error / symptom | Cause | Fix |
|-----------------|--------|-----|
| `SEED ABORTED: No users in auth.users` | Nobody signed up yet | Log in via app Preview first |
| `relation "nonprofit_members" does not exist` | Migrations not applied | Run nonprofit migrations in SQL Editor |
| `duplicate key` / constraint errors | Partial prior seed | Re-run the same file (seed deletes fixed UUIDs first) or run all 4 in order again |
| SQL Editor not visible | Wrong Lovable panel | Look under Cloud, Backend, Database, or Integrations |
| Pages still empty after “success” | Wrong project / cache | Hard refresh; confirm Preview uses same Lovable project as SQL Editor |
| Counts higher than seed table (e.g. 30 members not 20) | Prior rows still in table | Seed succeeded; verify demo names or TRUNCATE + re-run 10→13 (see doc) |
| File too large for paste | Rare | Run one `INSERT` block at a time or use Lovable chat: “Run this SQL file from repo” |

---

## Optional: local terminal apply (only if you have secrets)

If Lovable → **Settings → Secrets** exposes `SUPABASE_SERVICE_ROLE_KEY`:

1. Copy `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_URL` (or use existing `VITE_SUPABASE_URL`) into local `.env`
2. From repo root: `npm run seed:nonprofit`

This is **optional**. Lovable SQL Editor alone is enough.

---

## Regenerating SQL after demo data changes

A developer with the repo locally runs:

```bash
npm run seed:nonprofit:generate
npm run seed:nonprofit:validate
```

Commit the updated files under `supabase/seed/10`–`13`. You then paste the **new** files in Lovable SQL Editor again.

---

## General rule for future database tasks

| Task type | Lovable user action |
|-----------|---------------------|
| Seed demo data | Paste `supabase/seed/*.sql` in Lovable SQL Editor |
| New migration | Paste `supabase/migrations/*.sql` in SQL Editor (or deploy via team with CLI) |
| Verify data | Lovable Table view or verification SQL above |
| Verify UI | Preview URL + routes in browser-qa-guides |
| One-off fix | SQL Editor → run query → verify in app |

**Agents:** Read this file first when the user mentions Lovable, no Supabase access, Cloud database, or seeding live tables.
