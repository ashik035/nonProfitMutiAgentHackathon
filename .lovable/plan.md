

# AI Agent Browse System — Implementation Plan

## Summary

Build a full agent discovery experience with a **Browse page** (`/agents`), **Agent Detail page** (`/agents/:slug`), a **Dashboard card**, and contextual **presence indicators**. All agent/team data lives in a single static config file. The existing `/ai-agents` operational pages remain untouched.

---

## New Files to Create

### 1. `src/components/ai/agentTeamConfig.ts` — Static Team & Agent Config
- Define `AgentTeamAgent` and `AgentTeamDef` interfaces
- Export `agentTeams` record with 4 nonprofit-relevant teams:
  - **Donor Intelligence Team** (`sales` → repurposed for nonprofit): Deal Coach → Donor Coach, etc.
  - **Meeting AI Team** (`meetings`): Meeting Summarizer, Action Extractor, Efficiency Analyzer, Client Call Analyzer
  - **Strategy AI Team** (`eos`): EOS Coach, Pattern Detective, Pod Health, Quarterly Digest
  - **Project AI Team** (`projects`): Project Analyst, Bug & Feature Planner, Technical Planner, Code Reviewer
- Each agent has: `name`, `slug`, `description`, `icon` (Lucide name), `capabilities[]`, `howToUse[]`, `whereToFind?`
- Each team has: `id`, `name`, `tagline`, `accentColor`, `gradientFrom`, `gradientTo`
- Export helpers: `allTeams`, `findAgentBySlug()`, `findTeamForAgent()`

### 2. `src/pages/AgentsBrowse.tsx` — Browse Page
- Page header with Sparkles icon + title "AI Agents"
- **Team Cards grid** (2-col): overlapping gradient icon circles, team name/tagline, "Explore Team" button that smooth-scrolls to detail section
- **Team Detail Sections**: each with `id="team-{id}"` + `scroll-mt-24`, 4-col grid of `AgentBrowseCard`
- **AgentBrowseCard** sub-component: gradient header strip → overlapping icon circle → name + "By Nonprofit AI" → category badge → description → "Learn More" button linking to `/agents/{slug}`
- Skeleton loader on mount

### 3. `src/pages/AgentDetail.tsx` — Agent Detail Page
- Resolve agent via `findAgentBySlug(slug)` from URL param; fallback to 404
- **Hero**: gradient banner with decorative circles → overlapping icon → name + team badge + description → "Go to [Section]" CTA
- **Main column** (2/3): Accordion with Capabilities, How to Use, Where to Find — all open by default
- **Sidebar** (1/3): Info card (built by, team, category) + Related Agents card (sibling agents with gradient icons)
- Mobile-responsive: single column on small screens

### 4. `src/components/dashboards/AITeamsDashboardCard.tsx` — Dashboard Card
- Horizontally scrollable row of mini team cards with gradient strips + overlapping icons
- "Browse All Agents →" link at bottom
- Subtle rainbow gradient overlay on outer card

### 5. `src/components/ai/AIAgentPresenceIndicator.tsx` — Presence Pill
- Small animated pill with pulsing dot + sparkles + agent name
- Clicking navigates to `/agents/{slug}`
- Uses team gradient for border tint

### 6. `src/components/ai/AgentTeamBanner.tsx` — Contextual Banner
- Collapsible banner accepting `teamId` prop
- Collapsed: overlapping icons + team name + chevron toggle
- Expanded: horizontal scroll of agent mini-cards

---

## Files to Modify

### 7. `src/modules/platform/routes.tsx`
- Add routes: `/agents` → `AgentsBrowse`, `/agents/:slug` → `AgentDetail`
- Keep existing `/ai-agents` routes unchanged

### 8. `src/shared/data/navigationStructure.ts`
- Add "AI Agents" item with href `/agents` to the `nonprofit-ops` nav group (or as a standalone item)
- Keep existing "AI Agent Center" (`/ai-agents`) for operational view

### 9. Dashboard files (all 4 role dashboards)
- Import and render `AITeamsDashboardCard` on each dashboard

---

## Technical Details

- **Icons**: Use `icons` object from `lucide-react` for dynamic icon lookup by string name, with `Bot` fallback
- **Gradients**: All stored as HSL value strings (`"280 70% 50%"`), applied via inline `style={{ background: linear-gradient(135deg, hsl(...), hsl(...)) }}`
- **Overlapping circles**: `flex` with negative margins, `ring-3 ring-background`, descending z-index
- **Category badges**: Color map keyed by team id → Tailwind classes with dark mode variants
- **Scroll**: Team card click → `document.getElementById("team-{id}")?.scrollIntoView({ behavior: "smooth" })`
- **No database changes** — purely static config + frontend components
- **No breaking changes** to existing `/ai-agents` operational pages

