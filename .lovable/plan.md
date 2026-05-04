## Plan: Demo Login Security & Admin Panel Restriction

### Change 1: Remove Admin One-Click Login Button

**File: `src/pages/Login.tsx`**
- Delete line 16 (the Admin entry from `TEST_ACCOUNTS` array)
- Remove the `ShieldCheck` import from lucide-react (line 9) since it's no longer used
- All other 4 quick-login buttons remain unchanged

### Change 2: Create Hidden Demo Account

**Database migration:** Create a new Supabase Auth user:
- Email: `demo@nonprofitai.software`
- Password: `NonprofitDemo2026!`
- Assign `executive_director` role equivalent (or a suitable nonprofit role)

**New file: `src/lib/demoConfig.ts`**
- Store the hidden demo credentials as a TypeScript constant
- This file is a developer reference only — never imported by any UI component

### What stays the same
- All 4 non-admin quick-login buttons (ED, DD, FM, OM)
- Login form, auth logic, AdminRoute guard, TopNav badge
- Production hide logic for quick-login section

### Technical note
The user mentioned creating the Supabase auth user manually, but since this project uses Lovable Cloud, I can provision the user via a database migration (same approach used previously for `admin@nonprofitai.software`).
