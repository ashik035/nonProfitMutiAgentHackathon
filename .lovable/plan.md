## Problem

The Grant Writer page fails with "Unable to generate draft" because the `generate-grant-draft` edge function returns a 404 — it exists in code but is not deployed, and it's missing from `supabase/config.toml`.

## Fix

1. **Add config entry** to `supabase/config.toml` for `generate-grant-draft` with `verify_jwt = false` (matching the existing pattern for public AI functions like `generate-donor-letter`).

2. **Deploy the edge function** so it becomes available at the expected endpoint.

No code changes to the page or edge function logic are needed — the function code is correct.
