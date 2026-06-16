# Replicate `/membership` Page into Another Lovable Project

Copy-paste-ready brief for rebuilding the Membership Management page 1:1 in another Lovable project.

---

## What `/membership` actually is

A member directory backed by the `nonprofit_members` Supabase table.

- **KPI strip** — Total Members, Active, Expiring Soon, Lapsed
- **Directory tab** — searchable table (name / email / employer), tier filter chips (All / General / Professional / Board / Honorary), status badge per row, click row → side sheet with full profile
- **Add Member tab** — react-hook-form + zod (name, email, tier); creates row with status `Active`
- **Renewals callouts** — lists of expiring + lapsed members
- Tier and status colored badges; dates formatted `MMM d, yyyy`

## Database (1 table)

```text
nonprofit_members
  id uuid pk
  created_by uuid references auth.users
  name text not null
  email text not null
  phone text
  tier text check in ('General','Professional','Board','Honorary') default 'General'
  status text check in ('Active','Expiring','Lapsed','Pending') default 'Active'
  join_date date default current_date
  renewal_date date
  employer text
  interests text[]
  created_at, updated_at timestamptz
```

RLS on, `FOR ALL TO authenticated USING (true) WITH CHECK (true)`, GRANT to `authenticated` + `service_role`, `updated_at` trigger.

## File layout to create

```text
src/
  pages/MembershipPage.tsx
  hooks/useMembers.ts            # React Query CRUD hooks
supabase/migrations/<ts>_nonprofit_members.sql
```

Add route:
```tsx
<Route path="/membership" element={<MembershipPage />} />
```

## The prompt to paste into the other Lovable project

> Assumes the target project already has Lovable Cloud + shadcn/ui + React Query + React Router + React Hook Form + Zod. If not, prepend: "First enable Lovable Cloud."

```text
Build a Membership Management page at /membership that exactly matches this spec.

DATABASE (one migration, RLS on, GRANT to authenticated + service_role, updated_at trigger)
- nonprofit_members(
    id uuid pk default gen_random_uuid(),
    created_by uuid references auth.users,
    name text not null,
    email text not null,
    phone text,
    tier text not null default 'General' check (tier in ('General','Professional','Board','Honorary')),
    status text not null default 'Active' check (status in ('Active','Expiring','Lapsed','Pending')),
    join_date date default current_date,
    renewal_date date,
    employer text,
    interests text[] default '{}',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
  )
Policy: FOR ALL TO authenticated USING (true) WITH CHECK (true).

HOOKS  src/hooks/useMembers.ts  (React Query, typed off Database)
- type Member, MemberInsert, MemberUpdate
- type MemberTier = 'General'|'Professional'|'Board'|'Honorary'
- type MemberStatus = 'Active'|'Expiring'|'Lapsed'|'Pending'
- useMembers({ search?, tier?, status? })   // ilike on name/email/employer; eq on tier/status when not 'All'
- useMemberById(id)
- useCreateMember, useUpdateMember, useDeleteMember
All mutations invalidate the list and show a shadcn/sonner toast on success/error.

PAGE  src/pages/MembershipPage.tsx
- Header: Users icon + "Membership" + subtitle
- KPI cards row (4): Total Members, Active, Expiring Soon, Lapsed (icons: Users, UserCheck, Clock, UserX)
- Tabs: "Directory" | "Add Member" | "Renewals"
- Directory tab:
  * Search input (name / email / employer) + tier filter chips (All, General, Professional, Board, Honorary)
  * Table columns: Name, Email, Tier (badge), Status (badge), Renewal date, Employer
  * Row click → Sheet (right) with full member profile: name, email, phone, tier, status, join_date, renewal_date, employer, interests chips
- Add Member tab:
  * react-hook-form + zod schema { name: min(2), email: email(), tier: enum }
  * On submit: createMember.mutateAsync({ ..., status: 'Active', created_by: user.id }), reset form, switch back to Directory
- Renewals tab:
  * Two cards: "Expiring Soon" (status='Expiring') and "Lapsed" (status='Lapsed') with member rows + "Send renewal" button (toast only, no email yet)

BADGE COLORS
- Tier: General gray, Professional blue, Board purple, Honorary amber
- Status: Active green, Expiring amber, Lapsed red, Pending blue

CONVENTIONS
- shadcn components only (Card, Tabs, Table, Sheet, Badge, Button, Input, Label, Select, Form)
- Dates: toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })
- All colors via semantic tokens from index.css — no raw text-white/bg-black in components other than the badge maps above
- Toasts via sonner (or @/hooks/use-toast)
- No edge functions, no auth changes
```

## Steps to run it

1. Open the other Lovable project's chat.
2. Paste the prompt block above. Approve the migration when prompted.
3. After `src/integrations/supabase/types.ts` regenerates, Lovable builds the page + hook.
4. Smoke test:
   - Add a member → appears in directory with `Active` badge
   - Search by name / employer → filters correctly
   - Click row → side sheet opens with full profile
   - Switch to Renewals tab → empty until you flip a row's `status` to `Expiring` / `Lapsed` in the DB

## Optional follow-ups (second prompt)

- Edit / delete from the side sheet
- Bulk CSV import
- "Send renewal" actually emails (Resend edge function)
- Engagement score column (linked to events / donations)

## Out of scope

- Payments / dues collection
- Email sending
- Public member directory (no auth)
