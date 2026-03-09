

# Fix: Quick Login + Build Errors

## Issue 1: Quick Login Not Working

The `TEST_ACCOUNTS` in `src/pages/Login.tsx` uses `@nonprofitct.com` emails (e.g., `demo@nonprofitct.com`) but the actual demo accounts in the database are `@collabai.software` (`ceo@collabai.software`, `demo@collabai.software`, `ic@collabai.software`). This causes "Invalid login credentials" on every quick login attempt.

**Fix**: Update `TEST_ACCOUNTS` to use the correct `@collabai.software` emails matching the seeded accounts.

## Issue 2: Build Errors (AgencyRole type mismatch)

The `AgencyRole` type was updated to nonprofit roles (`executive_director`, `development_director`, `finance_manager`, `operations_manager`, `admin`) but three dashboard files still pass legacy strings:

| File | Line | Passes | Should Be |
|------|------|--------|-----------|
| `ICDashboard.tsx` | 312 | `"ic"` | `"operations_manager"` |
| `OwnerDashboard.tsx` | 43-44 | `"owner"` | `"executive_director"` |
| `PMDashboard.tsx` | 111 | `"pm"` | `"development_director"` |

**Fix**: Replace legacy role strings with the corresponding `AgencyRole` values in all three dashboard files. The mapping already exists in `useAgencyRole.ts` (`LEGACY_ROLE_MAP`).

## Files to Change

1. **`src/pages/Login.tsx`** -- Update `TEST_ACCOUNTS` emails to `@collabai.software`
2. **`src/pages/dashboards/ICDashboard.tsx`** -- Change `"ic"` to `"operations_manager"`
3. **`src/pages/dashboards/OwnerDashboard.tsx`** -- Change `"owner"` to `"executive_director"`
4. **`src/pages/dashboards/PMDashboard.tsx`** -- Change `"pm"` to `"development_director"`

