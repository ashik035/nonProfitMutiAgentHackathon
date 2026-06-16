# Copy 3 cron jobs verbatim from SJ Control Tower

## What gets created

### 1. `auto-status-transition` (every 2 hours)
- New file: `supabase/functions/auto-status-transition/index.ts` — verbatim copy from source.
- New file: `supabase/functions/_shared/cors.ts` — copy source's shared CORS helper (the function imports `getCorsHeaders`, `handleCorsPreflight` from `../_shared/cors.ts`).
- `supabase/config.toml` entry: `verify_jwt = true` (matches source).
- Cron schedule via `pg_cron` + `pg_net`: every 2 hours, POSTs to `/functions/v1/auto-status-transition`.

### 2. `deal-daily-classifier` (daily 12:00 UTC)
- Copy `supabase/functions/deal-classify-cron/index.ts` verbatim from source (this is the function the cron actually calls — `deal-daily-classifier` is just the schedule name).
- `supabase/config.toml` entry for `deal-classify-cron`.
- Cron schedule: `0 12 * * *`, POSTs to `/functions/v1/deal-classify-cron`.

### 3. `client-kb-weekly-sync` (Monday 06:00 UTC)
- Migration: create `public.sync_client_kb_reports()` plpgsql function — verbatim copy of source migration `20260325212101`.
- Cron schedule: `0 6 * * 1`, runs `SELECT sync_client_kb_reports();` directly in-DB (no HTTP).

## Bug fixes applied during copy

The source tickets (#287, #288, #291) called out two real bugs. Per "verbatim copy" I will preserve source behavior, but flag that two specific lines will fail in Nonprofit CT regardless of source-project state:

- **`app.settings.supabase_url` / `app.settings.service_role_key`** (tickets #288, #291): Lovable Cloud's Postgres does not have these GUCs set. The cron-call SQL will be rewritten to hardcode the project URL + use `vault.decrypted_secrets` lookup for the service role key the same way Lovable Cloud's standard cron pattern does. This is the only deviation from verbatim — without it the cron statement itself errors before the function is even invoked.
- **`projects.project_type` missing** (ticket #287): Will be copied verbatim. Will error at runtime as expected — `projects` table doesn't exist here at all.

## File list

```
supabase/functions/_shared/cors.ts                       (new, copied)
supabase/functions/auto-status-transition/index.ts       (new, copied)
supabase/functions/deal-classify-cron/index.ts           (new, copied)
supabase/config.toml                                     (edit — 2 function blocks)
supabase/migrations/<ts>_copy_3_crons.sql                (new)
  - CREATE FUNCTION sync_client_kb_reports()
  - cron.schedule('auto-status-transition-2h', '0 */2 * * *', net.http_post(...))
  - cron.schedule('deal-daily-classifier',     '0 12 * * *',  net.http_post(...))
  - cron.schedule('client-kb-weekly-sync',     '0 6 * * 1',   SELECT sync_client_kb_reports())
  - ensures pg_cron + pg_net extensions
```

## Expected runtime behavior

| Cron | Will it run? | Will it succeed? |
|------|--------------|------------------|
| auto-status-transition-2h | yes | no — references `activecollab_time_records`, `projects` |
| deal-daily-classifier | yes | no — `deal-classify-cron` references `deals` table |
| client-kb-weekly-sync | yes | no — references `projects.project_type`, `project_milestones`, etc. |

This matches your "copy verbatim" instruction. After approval I'll deploy and report the actual error each one throws on first run so you have ground truth.
