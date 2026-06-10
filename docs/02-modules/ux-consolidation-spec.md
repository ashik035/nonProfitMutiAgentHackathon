# Feature: UX Consolidation — PM Review Remediation

> Resolves the 10 findings from the Product Manager review (Jun 2026): page overlaps, sidebar overload, missing donor profile, and naming/placement issues.

**Status**: Complete
**Module**: platform
**Author**: Engineering (from PM review)
**Date**: 2026-06-10

## Overview

The v0.2.0 nonprofit feature set was built module-by-module, producing UX fragmentation: two event pages with no handoff, two impact views with identical descriptions, two retention surfaces describing the same problem, a 17-item flat sidebar group, and donor data scattered across six pages with no unified profile.

This spec consolidates those surfaces into a coherent user journey. It is almost entirely **frontend work** — no new tables, no new Edge Functions, no RLS changes. The two P0 items (Events merge, Donor profile) are UI composition over existing data sources.

All findings were verified against the codebase before this spec was written. Verified facts that constrain the design:

| Page | Route | Data source |
|---|---|---|
| `EventsPage.tsx` (551 ln) | `/events` | Inline demo data + AI follow-up via `supabase.functions.invoke` |
| `EventManagementPage.tsx` (494 ln) | `/event-management` | Live DB — `useNonprofitEvents`, `useEventRegistrants`, `useToggleCheckin`; contains `EventDetailSheet` |
| `DonorRetentionPage.tsx` | `/donor-retention` | `DEMO_DONOR_RETENTION` (at-risk table, LYBUNT, re-engage dialog) |
| `AIEngagementScoringPage.tsx` (506 ln) | `/engagement-scoring` | Inline `SCORED_MEMBERS` + AI next-best-action via `supabase.functions.invoke` |
| `DonorPipelinePage.tsx` | `/donor-pipeline` | Inline `INITIAL_DONORS` kanban |
| `DonationCenterPage.tsx` | `/donations` | Live DB — `useDonations`, `useDonationStats`, `useCampaigns` |
| `CommunicationsPage.tsx` | `/communications` | `DEMO_COMMUNICATIONS` |
| `MembershipPage.tsx` | `/membership` | Live DB — `useMembers` |
| `ProgramsPage.tsx` | `/programs` | `DEMO_PROGRAMS`, `DEMO_GRANTS` |
| `ImpactDashboardPage.tsx` | `/impact-dashboard` | Demo + AI annual report via `supabase.functions.invoke` |
| `Help.tsx` (60 ln) | — | **Dead code** — imported nowhere; `/help` routes to `HelpPage.tsx` |

## User Stories

- As a **Development Director**, I want one page per domain (Events, Impact, Retention) so I never wonder which of two similar pages to open.
- As a **Development Director**, I want a single donor profile that aggregates pipeline stage, giving history, membership, engagement score, and outreach history so I can prepare for any donor conversation from one place.
- As an **Executive Director**, I want a sidebar organized by job-to-be-done (Fundraising, Grants, People, Events, Reporting) so I can find any feature in one scan.
- As a **grant writer**, I want to jump from a grant in the pipeline directly into the Grant Writer tool with that grant pre-selected.

---

## Workstream 1 — Sidebar Restructure + Naming/Placement Fixes (P1–P3, small)

### Changes (all in `src/shared/data/navigationStructure.ts` unless noted)

1. **Split the 17-item `nonprofit-ops` group into 5 groups** (the `NavGroup[]` structure already supports this — pure data change, `AppSidebar` needs no logic changes):

| Group id | Title | Items |
|---|---|---|
| `fundraising` | Fundraising | Donor Pipeline, Donor Retention, Donation Center |
| `grants` | Grants | Grants Management (`/grants`), Grant Writer |
| `people` | People | Membership, Volunteers, Communications |
| `events` | Events | Events (merged page, see Workstream 2) |
| `reporting` | Reporting | Board Reports, Programs, Impact Dashboard, Data Health, Financial Reconciliation |

2. **Rename** sidebar title `Reconciliation` → `Financial Reconciliation` (route `/reconciliation` unchanged). Also update the `<h1>` in `ReconciliationPage.tsx`.
3. **Rename** sidebar title `Grants` → `Grants Management` to disambiguate from the group title.
4. **Move `Public Presence`** into the bottom `settings-group` (above Integrations). Route unchanged.
5. **Remove `Event Management`** entry (absorbed by merged Events page, Workstream 2).
6. **Remove `Engagement Scoring`** entry (absorbed into Donor Retention, Workstream 4). Route kept as redirect.
7. **Voice Notes**: keep under AI group but change title to `Voice Notes → AI` is rejected as awkward; instead add a one-line description on `VoiceNotesPage.tsx` header: "Your voice notes are transcribed and processed by AI agents." (justifies placement, zero nav churn).
8. **Delete `src/pages/Help.tsx`** (dead code; `/help` → `HelpPage.tsx` is untouched).

### Acceptance criteria
- Sidebar shows Dashboard + 5 operational groups + AI + Intelligence + Settings(bottom).
- No group has more than 5 items.
- All previous routes still resolve (no 404s); removed sidebar entries' routes redirect (see Workstreams 2 and 4).
- `requiredPermission` keys preserved on every moved item.

---

## Workstream 2 — Events Merge (P0, medium)

### Design

`/events` becomes the single tabbed events surface. **No data merge** — the two pages keep their own data sources; the merge is composition.

| Route | Component | Description |
|---|---|---|
| `/events` | `EventsHubPage.tsx` (new) | Tabbed shell: header + `Tabs` |
| `/events?tab=manage` (default) | `EventLifecycleTab` | Current `EventManagementPage` body — live DB CRUD, capacity, registrants, check-in, `EventDetailSheet` |
| `/events?tab=post-event` | `PostEventIntelligenceTab` | Current `EventsPage` body — follow-up automation, AI drafts |
| `/event-management` | `<Navigate to="/events?tab=manage" replace />` | Backward-compat redirect |

### Components

- `src/components/events/EventLifecycleTab.tsx` — extracted from `EventManagementPage.tsx` body (move, don't rewrite; keep `EventDetailSheet`, form schema, hooks).
- `src/components/events/PostEventIntelligenceTab.tsx` — extracted from `EventsPage.tsx` body (move, don't rewrite).
- `src/pages/EventsHubPage.tsx` — shadcn `Tabs` controlled by `useSearchParams` (`tab` param) so tabs are deep-linkable.
- Delete `src/pages/EventsPage.tsx` and `src/pages/EventManagementPage.tsx` after extraction.

### Routing (`src/modules/platform/routes.tsx`)

```tsx
<Route path="/events" element={<EventsHubPage />} />
<Route path="/event-management" element={<Navigate to="/events?tab=manage" replace />} />
```

### Cross-tab handoff
- In `EventLifecycleTab`, events with status `Past` get a "View follow-up intelligence →" link that switches to the post-event tab.

### Acceptance criteria
- `/events` defaults to the Manage tab; `?tab=post-event` opens the intelligence tab.
- `/event-management` redirects with no broken deep links.
- All existing functionality preserved in both tabs (create event, registrant check-in, AI follow-up drafts).
- `permission key `event-management` removed from nav; `events` key retained.

---

## Workstream 3 — Donor Profile Aggregation (P0, medium, highest ROI)

### Design

A `DonorProfileSheet` slide-over (replicating the praised `EventDetailSheet` pattern) that aggregates everything known about one donor. **Pure UI aggregation — no backend changes.** Donor identity is matched by **name string** (the only shared key across current sources; acceptable for demo-stage).

### New demo data (`src/shared/data/nonprofitDemoData.ts`)

```typescript
export interface DemoDonorProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  segment: "Major Gift" | "Mid-Level" | "Grassroots" | "Lapsed";
  engagementScore: number;       // 0–100, consistent with engagement scoring
  nextBestAction: string;
  pipelineStage?: string;        // matches Donor Pipeline columns
  isMember: boolean;
  memberTier?: MemberTier;
  outreachHistory: { date: string; channel: string; summary: string }[];
}
export const DEMO_DONOR_PROFILES: DemoDonorProfile[] = [ /* ≥12 donors whose names match existing DEMO_DONOR_RETENTION.atRiskDonors, INITIAL_DONORS (pipeline), and DEMO_DONATIONS_RECENT names */ ];
```

Reconcile existing inline datasets so the same donor names appear across pipeline, retention, donations, and communications — this is what makes the profile feel like a system.

### Component

`src/components/donors/DonorProfileSheet.tsx`
- Props: `{ donorName: string | null; onOpenChange }`
- Sections: header (name, segment badge, engagement score ring, next-best-action), Giving History (live `useDonations` filtered by `donor_name`, plus demo fallback), Pipeline (stage card if in pipeline), Membership (tier/status if `isMember` or matched in `useMembers` by name), Outreach History, footer actions ("Draft re-engagement email" reusing the existing dialog pattern, "Log contact" toast).
- States: loading (skeleton), not-found (empty state with icon).

### Entry points (row/card click → opens sheet)
- `DonorPipelinePage` — kanban card click
- `DonorRetentionPage` — at-risk table row click
- `DonationCenterPage` — donations table donor name click
- `CommunicationsPage` — thank-you list name click

### Acceptance criteria
- Clicking the same donor's name anywhere in the app opens an identical profile.
- Profile shows data from ≥4 sources for the seeded demo donors.
- No new tables, hooks reuse `queryKeys.nonprofit.*` cache keys.

---

## Workstream 4 — Retention/Engagement Consolidation (P1, small)

### Changes
1. Add an **Engagement Score column** to the at-risk table in `DonorRetentionPage.tsx` (score badge: green ≥70, amber 40–69, red <40) sourced from `DEMO_DONOR_PROFILES`.
2. Add an "AI Insights" panel on Donor Retention surfacing next-best-action for top 3 at-risk donors (reuses the AI invoke pattern from `AIEngagementScoringPage`).
3. **Rescope** `/engagement-scoring` to members only: rename page title to **"Member Engagement"**, keep route, link to it from `MembershipPage` header. Audience split (donors → Retention, members → Member Engagement) becomes the differentiator.
4. Remove the standalone sidebar entry (Workstream 1); discoverable via Membership.

### Acceptance criteria
- Donor Retention shows scores inline; no donor-scoped content remains on Member Engagement.
- `/engagement-scoring` still resolves (linked from Membership).

---

## Workstream 5 — Programs vs Impact Dashboard Differentiation (P1, small)

### Changes
1. `ProgramsPage.tsx` → subtitle "Operational program management — add programs, log beneficiaries, track KPIs". Add an `Edit`-forward treatment (existing CRUD stays).
2. `ImpactDashboardPage.tsx` → subtitle "Executive presentation layer — read-only impact summary and AI annual report". Add a top banner: "Read-only executive view · Manage programs in **Programs** →" (link), and a "Present"-style visual treatment (larger stat typography, no edit affordances).
3. Cross-links both ways: Programs header gets "View Impact Dashboard →".
4. Sidebar: both stay under Reporting (Workstream 1), adjacent, with the distinction carried by titles + page treatments.

### Acceptance criteria
- Neither page's description could be mistaken for the other.
- Impact Dashboard contains zero edit affordances.

---

## Workstream 6 — Grant Writer ↔ Grants Link (P2, small)

### Changes
1. `GrantsPage.tsx`: each grant card/row gets an "Open in Grant Writer" action → navigates to `/grant-writer?grant=<grantId>`.
2. `GrantWriterPage.tsx`: read `grant` search param on mount; if it matches a `DEMO_GRANTS` id, pre-select that grant in the existing grant selector.
3. `GrantWriterPage` header gets a "← Back to Grants Management" breadcrumb when arriving with a `grant` param.

### Acceptance criteria
- Round trip Grants → Grant Writer (pre-selected) → back works without manual re-selection.

---

## Database Design

**No new tables. No schema changes. No RLS changes.**

## API Design

**No new Edge Functions.** Existing `supabase.functions.invoke` calls (AI follow-up, next-best-action, annual report) move with their extracted components unchanged.

## Validation

No new forms. Existing Zod schemas (event creation in `EventManagementPage`) move unchanged with extraction.

## Feature Flags

None required — all affected pages are static nonprofit pages without module gating. `requiredPermission` keys in nav are preserved per Workstream 1.

## Testing Plan (manual QA — no test runner configured)

- [ ] `npm run lint` and `npm run build:dev` pass after each workstream
- [ ] Every pre-existing route resolves (spot-check: `/events`, `/event-management`, `/engagement-scoring`, `/help`, `/reconciliation`, `/public-presence`)
- [ ] Sidebar: 5 operational groups render, permission gating intact, active-state highlight works for tabbed `/events`
- [ ] Events: create event, check in registrant, generate AI follow-up — all work post-merge
- [ ] Donor profile opens from all 4 entry points with consistent data
- [ ] Grant Writer pre-selection round trip
- [ ] Role dashboards (ED/DD/FM/OM) — verify any links into merged/moved pages still work

## Migration Plan

Ship as 3 PRs in order (each independently shippable):
1. **PR 1**: Workstream 1 (sidebar + naming + dead code) — trivial risk
2. **PR 2**: Workstream 2 (Events merge) + Workstream 6 (Grant Writer link)
3. **PR 3**: Workstream 3 (Donor profile) + Workstreams 4–5 (retention/impact differentiation)

After each PR: run `/document-release` to sync CLAUDE.md route tables and `docs/02-modules/`.

## Dependencies

- Depends on: existing hooks (`useDonations`, `useMembers`, `useNonprofitEvents`), `nonprofitDemoData.ts`
- Blocks: any future real donor-entity backend (this spec's name-matching is the interim contract)

## Open Questions

- [ ] Donor matching by name string is demo-acceptable — confirm we don't need a `nonprofit_donors` table now (recommend: defer to v0.3.0).
- [ ] Should the merged Events page get a third "Analytics" tab now, or wait? (Recommend: wait — nothing exists to populate it.)
- [ ] Sheet vs full page for the donor profile? (Recommend: Sheet now, matches `EventDetailSheet`; promote to `/donors/:id` page when a real donor entity exists.)
- [ ] PM suggested "Publishing/Website" section for Public Presence — Settings group chosen instead to avoid a 6th group for one item. Confirm.
