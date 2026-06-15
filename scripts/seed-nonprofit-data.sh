#!/usr/bin/env bash
# Apply Brightside Foundation nonprofit seed data to Supabase.
# 1) Regenerates SQL from nonprofitDemoData.ts
# 2) Applies via psql (DATABASE_URL) OR service role API (SUPABASE_SERVICE_ROLE_KEY)

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "=== Generating nonprofit seed SQL ==="
npm run seed:nonprofit:generate

echo "=== Validating generated SQL ==="
npm run seed:nonprofit:validate

SEED_FILES=(
  "supabase/seed/10-nonprofit-members.sql"
  "supabase/seed/11-nonprofit-volunteers.sql"
  "supabase/seed/12-nonprofit-donations.sql"
  "supabase/seed/13-nonprofit-events.sql"
)

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

DB_URL="${DATABASE_URL:-${SUPABASE_DB_URL:-}}"
SERVICE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-}"

if [[ -n "$DB_URL" ]] && command -v psql >/dev/null 2>&1; then
  echo ""
  echo "=== Applying seed via psql ==="
  for f in "${SEED_FILES[@]}"; do
    echo "Running $f ..."
    psql "$DB_URL" -v ON_ERROR_STOP=1 -f "$f"
  done
  echo ""
  echo "=== Nonprofit seed complete (psql) ==="
  exit 0
fi

if [[ -n "$SERVICE_KEY" ]]; then
  echo ""
  echo "=== Applying seed via Supabase service role ==="
  npm run seed:nonprofit:apply
  echo ""
  echo "=== Nonprofit seed complete (API) ==="
  exit 0
fi

echo ""
echo "=== Seed SQL generated but NOT applied to database ==="
echo ""
echo "Add ONE of these to .env, then re-run: npm run seed:nonprofit"
echo ""
echo "  Option A — PostgreSQL connection string (Dashboard → Database → Connection string):"
echo "    DATABASE_URL=postgresql://postgres.[ref]:[password]@..."
echo ""
echo "  Option B — Service role key (Dashboard → Settings → API):"
echo "    SUPABASE_SERVICE_ROLE_KEY=eyJ..."
echo "    (SUPABASE_URL or VITE_SUPABASE_URL is already in your .env)"
echo ""
echo "  Option C — Supabase SQL Editor: paste each file in order:"
for f in "${SEED_FILES[@]}"; do
  echo "    - $f"
done
echo ""
echo "Prerequisite: at least one user in auth.users (sign up via /login first)."
exit 0
