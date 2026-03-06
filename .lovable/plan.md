

# Fix: Quick Login Demo Accounts

## Problem
The quick login buttons use `@demo.example.com` emails (e.g. `ceo@demo.example.com`) but the actual demo accounts in the database use `@collabai.software` emails (e.g. `ceo@collabai.software`). This causes "Invalid login credentials" errors.

## Fix
Update `src/pages/Login.tsx` lines 11-15 to use the correct emails:

```typescript
const TEST_ACCOUNTS = [
  { label: "CEO / Owner", email: "ceo@collabai.software", role: "owner", icon: Crown, color: "border-amber-500/30 hover:bg-amber-500/10" },
  { label: "Project Manager", email: "demo@collabai.software", role: "pm", icon: Briefcase, color: "border-blue-500/30 hover:bg-blue-500/10" },
  { label: "IC", email: "ic@collabai.software", role: "ic", icon: Code, color: "border-emerald-500/30 hover:bg-emerald-500/10" },
] as const;
```

Also update `supabase/functions/seed-demo-accounts/index.ts` to match the same `@collabai.software` emails for consistency.

Single file change, no database or schema modifications needed.

