# Hallmark Audit Findings — Nonprofit Control Tower

Living punch list: **what** to fix and **where**. Updated 2026-06-10.

---

## Global (whole app)

| Priority | What | Where | Fix |
|----------|------|-------|-----|
| P0 | No locked design system | Project root — no `design.md` | Run `lock the system` after first redesign; migrate tokens in `src/index.css` |
| P0 | Lovable provenance | `index.html` L20–24 OG image; `package.json` L91 `lovable-tagger`, name `vite_react_shadcn_ts` | Own OG asset; remove tagger; rename package |
| P0 | AI gradient cosmetics | `src/index.css` `.ai-gradient`, `.ai-gradient-text`, `.btn-primary-bold`, `.bg-ai-mesh` | Replace with semantic domain tokens (grant, donor, board, data-health) |
| P0 | Landing = AI template | `src/pages/Index.tsx` + `src/components/landing/*` | `hallmark redesign /` — new macrostructure, nav, footer |
| P1 | No font pairing | `index.html` — no font imports | Add display + body via `@fontsource` in `src/main.tsx` or `index.css` |
| P1 | Pure white cards | `src/index.css` L19 `--card: 0 0% 100%` | Tint toward anchor hue (OKLCH) |
| P1 | Invented metrics / testimonials | `HeroSection.tsx`, `SocialProof.tsx` | Real demo data or labelled placeholders |
| P1 | Wrong product copy | `ValueProps.tsx` L42, `FeatureGrid.tsx` L31 | Nonprofit voice, not “professional services / legal” |
| P2 | Sparkles + ping dots everywhere | 50+ files; `src/components/ui/ai-indicator.tsx` | One semantic AI marker; static status chips |

---

## `/agents` route (browse + detail + activity)

See dedicated section below — primary implementation target after landing.

### Files in scope

- `src/pages/AgentsBrowse.tsx` — `/agents`
- `src/pages/AgentDetail.tsx` — `/agents/:slug`
- `src/pages/AgentActivityFeed.tsx` — `/agents/activity`
- `src/components/ai/agentTeamConfig.ts` — source of truth
- `src/components/ai/agents/*Detail.tsx` — per-agent findings UI
- `src/modules/platform/routes.tsx` L117–119 — route defs

---

## `/agents` — detailed fix list

### P0 — Functional / data integrity

| What | Where | Fix |
|------|-------|-----|
| Orphan detail pages | `AgentDetail.tsx` L146–149 has `mid-donor-upgrade`, `donor-lapse-detection`; **not** in `agentTeamConfig.ts` | Add agents to config OR remove dead detail components |
| Wrong default activity log | `AgentDetail.tsx` L243–248 — hardcoded “donor upgrade” log for **all** agents without custom detail | Drive from `agent.slug` + demo data; hide block when empty |
| `Run Now` is fake | `AgentsBrowse.tsx` L143–154 — `setTimeout` only | Wire to real edge fn or rename to “Simulate run” in demo mode |
| Docs vs code: 16 agents / 4 teams | `CLAUDE.md` vs `agentTeamConfig.ts` — only **1 team, 8 agents** | Expand `agentTeams` or update docs |
| Permission-gated agents vanish silently | `AgentsBrowse.tsx` L266–268 — no empty state when filtered | Show “N agents hidden by role” + who to contact |

### P1 — UX / information architecture

| What | Where | Fix |
|------|-------|-----|
| No link to activity feed | `AgentsBrowse.tsx` — nav has `/agents/activity` but page doesn’t | Header action: “View activity log” → `/agents/activity` |
| Cards not clickable | `AgentBrowseCard` — only buttons navigate | `onClick` on card → `/agents/:slug`; buttons `stopPropagation` |
| No triage sort | Browse is flat grid | Default sort: `itemsToReview` desc; filter: “Has findings” |
| Hardcoded “Core Ops” badge | `AgentsBrowse.tsx` L171 | Use `team.name` or remove badge |
| 3 agents lack `operational` meta | `agentTeamConfig.ts` — grant-budget-watcher, integration-health-monitor, onboarding-checklist-ai | Add `operational` block like other 5 agents |
| Activity banner covers 3/8 agents | `AgentsBrowse.tsx` L26–30 | Generate from `agent.operational.lastFinding` for visible agents |
| Artificial 500ms skeleton | `AgentsBrowse.tsx` L257–260 | Remove fake delay; skeleton only while permissions query loads |
| `allTeams[0]` only | `AgentsBrowse.tsx` L263 | Loop `allTeams` with team section headers when multi-team ships |

### P1 — Visual / Hallmark (agents-specific)

| What | Where | Fix |
|------|-------|-----|
| Gradient profile cards | `AgentsBrowse.tsx` L157–176; `AgentDetail.tsx` L64–90 | Operational inbox rows or document-style brief — no gradient header + overlapping avatar |
| `animate-ping` on every agent | `AgentsBrowse.tsx` L73–75, L89–99 | Static “Active” chip; ping only when `running === true` |
| Italic finding quotes | `AgentsBrowse.tsx` L196 | Roman text + left hairline rule |
| Gradient CTAs on detail | `AgentDetail.tsx` L109–126 | Solid `bg-primary` button |
| Floating orbs on detail hero | `AgentDetail.tsx` L71–78 | Remove decorative circles |
| Identical page rhythm | Icon + h1 + subtitle + 4-col grid | Workbench: summary strip + dense findings table |

### P2 — Detail page polish

| What | Where | Fix |
|------|-------|-----|
| Duplicate “Go to” CTAs | `AgentDetail.tsx` — hero button + accordion + sidebar | One primary path to `whereToFind` |
| Accordion for operational agents | Custom `*Detail.tsx` components are rich; accordion path is fallback | Custom detail for remaining 3 agents or unified findings layout |
| Siblings list useless with 1 team | `AgentDetail.tsx` L294–325 | “Related agents” by domain (grants, CRM, finance) not team only |
| Title brand inconsistency | Browse: “Brightside Foundation”; Detail: “Nonprofit AI” | Use `useBranding()` everywhere |

### P2 — `/agents/activity`

| What | Where | Fix |
|------|-------|-----|
| Isolated from browse | `AgentActivityFeed.tsx` — no cross-link back to agent detail | Row click → `/agents/:slug`; breadcrumb from browse |
| Demo refresh theatre | L37–39 copies same array | OK for demo; label as “Demo data” badge |

---

## Recommended `/agents` implementation order

1. **Data** — fix `agentTeamConfig` (orphans, operational meta, team count truth)
2. **Browse UX** — sort by findings, link activity, clickable cards, real empty states
3. **Visual** — replace card template with operational inbox layout
4. **Detail** — slug-specific activity logs; custom detail for last 3 agents
5. **Polish** — branding, permissions messaging, remove fake loading

---

## Hallmark scores (reference)

- **Full project:** 12 critical · 10 major · 6 minor
- **`/agents` alone:** 4 critical · 8 major · 5 minor (functional + visual combined)
