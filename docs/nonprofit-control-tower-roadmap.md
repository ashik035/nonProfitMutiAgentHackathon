# Nonprofit Control Tower — Transformation Roadmap

> **Product**: Nonprofit Control Tower
> **Brand**: NonprofitAI.software
> **Tagline**: Operational Intelligence Layer for Modern Nonprofits
> **Selling Point**: An agentic layer that sits on top of existing CRM systems — not a CRM replacement.
> **Tech Stack**: React 18 + TypeScript + Vite + Supabase + shadcn/ui (unchanged)

---

## Table of Contents

1. [Module Decisions (Final)](#1-module-decisions-final)
2. [Step-by-Step Execution Plan](#2-step-by-step-execution-plan)
3. [New Nonprofit Modules Spec](#3-new-nonprofit-modules-spec)
4. [New User Roles](#4-new-user-roles)
5. [Design Guidelines](#5-design-guidelines)
6. [Demo Data Requirements](#6-demo-data-requirements)
7. [Future Extensibility](#7-future-extensibility)

---

## 1. Module Decisions (Final)

| Module | Action | Notes |
|--------|--------|-------|
| **EOS** | DELETE entirely | Remove `src/modules/eos/` (17 pages, 5 component dirs, 12 hooks, types), all EOS nav groups, admin EOS section, routes from `App.tsx`, registry entry |
| **Productivity** | DELETE entirely | Remove `src/modules/productivity/` (4 pages, hooks, types), nav items, admin "Productivity Import", registry entry |
| **Client Portal** | DELETE | Remove `src/pages/client/` (2 files), routes from `App.tsx` |
| **Meetings** | KEEP, hidden by default | Set `defaultEnabled: false` in `MODULE_REGISTRY`; no other changes |
| **Projects** | KEEP, toggleable | Keep as-is, admin can enable/disable |
| **Business Dev** | KEEP, toggleable | Keep as-is, admin can enable/disable via module management |
| **Lead Follow-Up** | KEEP, enabled | Stays active, users will use it |
| **Actions/Tasks** | KEEP, toggleable | Already gated by `enableTasks` feature flag |
| **Knowledge** | KEEP | No changes |
| **Admin** | KEEP | Simplify nav (remove EOS/Productivity sections) |
| **Platform** | KEEP | Core, always enabled |

---

## 2. Step-by-Step Execution Plan

Each step is a single, testable unit. Execute one at a time and verify the build succeeds before proceeding.

---

### Step 1: Remove EOS Module

**Goal**: Completely remove the Entrepreneurial Operating System module.

**Files to DELETE** (entire directories):
- `src/modules/eos/` — contains:
  - `pages/`: `AccountabilityPage.tsx`, `EOSHubPage.tsx`, `EOSIssuesAIAnalyzePage.tsx`, `IssueDetailPage.tsx`, `IssuesAIPage.tsx`, `IssuesAllPage.tsx`, `IssuesAnonymousPage.tsx`, `IssuesArchivedPage.tsx`, `IssuesByPodPage.tsx`, `IssuesPage.tsx`, `IssuesPodOverviewPage.tsx`, `IssuesSolvedPage.tsx`, `MyAccountabilityPage.tsx`, `OKRDetailDialog.tsx`, `OKRsPage.tsx`, `ScorecardPage.tsx`, `VTOPage.tsx`
  - `components/`: `accountability/`, `issues/`, `okr/`, `scorecard/`, `vto/`
  - `hooks/`: `useAIIssueSuggestions.ts`, `useAccountability.ts`, `useEOSIssueInsights.ts`, `useEOSIssues.ts`, `useEOSIssuesByPod.ts`, `useEOSPods.ts`, `useExtractMeetingIssues.ts`, `useOKRs.ts`, `usePromoteIssueToEOS.ts`, `useSLATargets.ts`, `useScorecard.ts`, `useVTO.ts`
  - `types/`, `index.ts`, `routes.tsx`
- `src/pages/admin/eos/` — contains: `AdminEOS.tsx`, `AdminEOSAccountability.tsx`, `OKRsWorkspace.tsx`, `ScorecardWorkspace.tsx`, `VTOAdmin.tsx`

**Files to EDIT**:

1. **`src/App.tsx`** (lines ~21, ~71):
   - Remove: `import { eosRoutes } from "@/modules/eos";`
   - Remove: `{eosRoutes}` from the route tree

2. **`src/shared/config/modules.ts`**:
   - Remove `"eos"` from the `ModuleId` type union (line 24)
   - Remove the entire `eos` entry from `MODULE_REGISTRY` (lines 72–82)
   - Remove `eos: env.modules.eos` from the `envMap` in `isModuleBundled()` (line 172)

3. **`src/shared/config/env.ts`**:
   - Remove `eos: envBool("VITE_MODULE_EOS", true)` (line 30)

4. **`src/shared/data/navigationStructure.ts`**:
   - Remove the `eosOnly` property from the `NavItem` interface (line 35)
   - Remove the `eosOnly` property from the `NavGroup` interface (line 49)
   - Remove the entire "Strategy (EOS)" nav group (lines 201–246, id: `"strategy"`)
   - Remove the entire "EOS" admin nav group (lines 502–532, id: `"admin-eos"`)
   - Remove "OKR & Scorecards" from admin "PEOPLE & PERFORMANCE" group (lines 342–353)
   - Remove "Accountability" (with VTO Settings child) from admin "PEOPLE & PERFORMANCE" group (lines 355–371)

5. **`src/components/layout/AppSidebar.tsx`**:
   - Remove `isEosUser` from the `useAgencyRole()` destructure (line 117)
   - Remove `eosOnly` check from item filter (line 174): `if (item.eosOnly && !isEosUser && !isAdmin) return false;`
   - Remove `eosOnly` check from group filter (line 185): `if (group.eosOnly && !isEosUser && !isAdmin) return false;`

6. **Search for any remaining EOS imports/references** across:
   - `src/shared/data/implementationStatus.ts` — remove EOS references
   - `src/shared/data/urlAuditData.ts` — remove `/okrs` entry
   - Any hooks that reference EOS (e.g., `usePromoteIssueToEOS`, `useExtractMeetingIssues`)

**Test**: `npm run build` succeeds, app loads, no EOS nav items visible in sidebar or admin panel.

---

### Step 2: Remove Productivity Module

**Goal**: Completely remove the Productivity module.

**Files to DELETE**:
- `src/modules/productivity/` — contains:
  - `pages/`: `EmployeeDetailPage.tsx`, `ProcessFormPage.tsx`, `ProcessPage.tsx`, `ProductivityPage.tsx`
  - `hooks/`, `types/`, `index.ts`, `routes.tsx`

**Files to EDIT**:

1. **`src/App.tsx`** (lines ~23, ~73):
   - Remove: `import { productivityRoutes } from "@/modules/productivity";`
   - Remove: `{productivityRoutes}` from the route tree

2. **`src/shared/config/modules.ts`**:
   - Remove `"productivity"` from the `ModuleId` type union (line 30)
   - Remove the entire `productivity` entry from `MODULE_REGISTRY` (lines 138–148)
   - Remove `productivity: env.modules.productivity` from the `envMap` in `isModuleBundled()` (line 178)

3. **`src/shared/config/env.ts`**:
   - Remove `productivity: envBool("VITE_MODULE_PRODUCTIVITY", true)` (line 36)

4. **`src/shared/data/navigationStructure.ts`**:
   - Remove "Productivity" and "Processes" items from the "Operations" nav group (lines 253–264):
     ```
     { title: "Productivity", href: "/productivity", icon: "BarChart3", module: "productivity" }
     { title: "Processes", href: "/process", icon: "FileText", module: "productivity" }
     ```
   - Remove "Productivity Import" from admin "TEAM & RESOURCES" group (lines 490–493)

5. **Search for remaining references**:
   - `src/shared/data/implementationStatus.ts` — remove Productivity references

**Test**: `npm run build` succeeds, no Productivity/Processes nav items visible.

---

### Step 3: Remove Client Portal

**Goal**: Remove the client-facing portal pages.

**Files to DELETE**:
- `src/pages/client/ClientPortalDashboard.tsx`
- `src/pages/client/ProjectDashboard.tsx`

**Files to EDIT**:

1. **`src/App.tsx`** (lines ~27–28, ~49–58):
   - Remove: `import ClientPortalDashboard from "@/pages/client/ClientPortalDashboard";`
   - Remove: `import ProjectDashboard from "@/pages/client/ProjectDashboard";`
   - Remove both client portal routes:
     ```tsx
     <Route path="/projects/:slug/client-portal/:token" element={<ClientPortalDashboard />} />
     <Route path="/client/project/:token" element={<ProjectDashboard />} />
     ```

**Test**: `npm run build` succeeds, `/client/*` and `/projects/*/client-portal/*` routes are gone.

---

### Step 4: Set Meetings to Hidden by Default

**Goal**: Keep Meetings module code intact but disable it by default so admin must explicitly enable.

**Files to EDIT**:

1. **`src/shared/config/modules.ts`** (line 91):
   - Change `defaultEnabled: true` → `defaultEnabled: false` for the `meetings` entry

**Test**: `npm run build` succeeds. Meetings nav items not visible unless admin enables the meetings module in module management.

---

### Step 5: Rebrand to Nonprofit Control Tower

**Goal**: Update all user-facing branding from "SJ Control Tower" to "Nonprofit Control Tower".

**Files to EDIT**:

1. **`src/contexts/BrandingContext.tsx`** — update default org name if hardcoded
2. **`src/components/layout/AppSidebar.tsx`** — update sidebar header branding text
3. **`src/pages/Index.tsx`** (landing page) — update:
   - Title: "Nonprofit Control Tower"
   - Tagline: "Operational Intelligence Layer for Modern Nonprofits"
   - Messaging: emphasize CRM enhancement, not replacement
4. **`index.html`** — update `<title>` tag
5. **`public/` assets** — update favicon/logo if applicable

**Test**: App loads with "Nonprofit Control Tower" branding. Landing page shows correct tagline.

---

### Step 6: Clean Up Admin Navigation

**Goal**: Remove orphaned admin nav items referencing deleted modules.

**Files to EDIT**:

1. **`src/shared/data/navigationStructure.ts`** — in `adminNavigation`:
   - Remove: "EOS" group (id: `"admin-eos"`) — already done in Step 1
   - Remove: "Productivity Import" from "TEAM & RESOURCES" — already done in Step 2
   - Remove: "Meeting Analytics" from "TEAM & RESOURCES" (line 496) — meetings is hidden by default
   - Review "PEOPLE & PERFORMANCE" group for orphaned EOS items — already done in Step 1
   - Keep: Users & Access, Knowledge & AI, System, AI & Automation, Content & Feedback

2. **Verify admin routes in `src/App.tsx`**:
   - Remove routes to deleted admin EOS pages (`/admin/eos`, `/admin/eos/vto`, etc.)
   - Remove route to productivity import (`/admin/productivity-import`) if it exists

**Test**: Admin panel loads cleanly with no broken nav links or empty sections.

---

### Step 7+: New Nonprofit Modules (Future Phases)

These will be built AFTER the cleanup steps above are complete and tested.

#### Phase A: Core Nonprofit Pages
- Data Health page
- Reconciliation page
- Events page
- Grants page
- Board Reports page

#### Phase B: AI Agents & Integrations
- AI Agent Center (5 nonprofit operational agents)
- Integration Center (CRM/Finance/Payment/Email tiles)

#### Phase C: User Roles & Dashboard
- New nonprofit user roles (Executive Director, Development Director, Finance Manager, Operations Manager)
- Role-specific dashboard views

#### Phase D: Admin Enhancements
- Organization Settings (CRM Type, Reporting Template)
- AI Agent Configuration (frequency, threshold, human approval)
- Security Settings (data retention, no-retain AI mode)

---

## 3. New Nonprofit Modules Spec

### 3.1 Data Health Module

**Route**: `/data-health`
**Purpose**: Surface CRM data quality issues from connected systems.

**Features**:
- Duplicate probability list with confidence scores
- Incomplete profile list (missing fields)
- Household inconsistencies
- Soft credit alerts
- Merge suggestion preview with Approve Merge / Mark as Reviewed actions

**UI Pattern**: Insight cards with action buttons, NOT record tables.

---

### 3.2 Reconciliation Module

**Route**: `/reconciliation`
**Purpose**: Match transactions across payment processors and CRM/finance systems.

**Features**:
- Unmatched transactions list
- Fee variance alerts
- Restricted fund mismatches
- Monthly reconciliation summary
- Export Reconciliation Report
- Mark as Balanced action

---

### 3.3 Events Module

**Route**: `/events`
**Purpose**: Post-event engagement intelligence from connected event platforms.

**Features**:
- Recent events with attendance data
- Engagement tagging (attendee → donor, volunteer, etc.)
- Volunteer interest flags
- Follow-up suggestions from AI
- Create Follow-Up Task action

---

### 3.4 Grants Module

**Route**: `/grants`
**Purpose**: Track grant lifecycle, deadlines, and fund utilization.

**Features**:
- Active grants list
- Upcoming deadline alerts
- Fund utilization progress bars
- Spending alerts
- Generate Compliance Summary action

---

### 3.5 Board Reports Module

**Route**: `/board-reports`
**Purpose**: Generate board-ready reports from aggregated data.

**Features**:
- KPI Summary cards
- Financial Snapshot
- Engagement Metrics
- Download PDF button
- Generate New Draft button

---

### 3.6 AI Agent Center

**Route**: `/ai-agents` and `/ai-agents/:id`
**Purpose**: Display 5 nonprofit operational agents as modular processor cards.

**Agents**:
1. **CRM Data Integrity Agent** — finds duplicates, missing data, stale records
2. **Reconciliation & Fund Accounting Agent** — matches transactions, flags discrepancies
3. **Event Intelligence Agent** — tags attendees, suggests follow-ups
4. **Board Reporting Agent** — drafts KPI summaries, financial snapshots
5. **Grant Compliance Agent** — tracks deadlines, spending, reporting requirements

**Each agent card shows**: Name, Status (Active/Inactive), Last Run, Alert count, Configure button.
**Each agent detail page shows**: Description, Connected integrations, Recent findings, Suggested actions, Run Now button, Settings panel.

> **CRITICAL**: Agents are operational processors, NOT chatbots. No conversational UI.

---

### 3.7 Integration Center

**Route**: `/integrations`
**Purpose**: Connect existing nonprofit systems. Visually reinforce "Connect your existing systems."

**Integration tiles by category**:

| Category | Integrations |
|----------|-------------|
| **CRM** | Salesforce, Blackbaud RE NXT, Bloomerang, Neon, Virtuous |
| **Finance** | QuickBooks Online |
| **Payment** | Stripe, PayPal |
| **Events** | Eventbrite, Givebutter, OneCause |
| **Email** | Mailchimp, HubSpot |

**Each tile shows**: Connect button, Status indicator, Last Sync timestamp, API health indicator.

---

## 4. New User Roles

Replace existing agency roles (`owner`, `pm`, `ic`) with nonprofit-specific roles:

| Role | Dashboard Emphasis | Key Permissions |
|------|-------------------|-----------------|
| **Executive Director** | KPIs, board readiness, grant status, data health score | Full access, approve merges, generate reports |
| **Development Director** | Donor engagement, event follow-ups, lead pipeline | View data health, run agents, manage events |
| **Finance Manager** | Reconciliation, fund accounting, grant spending | Reconciliation actions, export reports, view transactions |
| **Operations Manager** | Data health, integrations, AI agent status | Run agents, manage integrations, approve merges |

**Implementation**:
- Update `AgencyRole` type in `src/shared/data/navigationStructure.ts`
- Create role-specific dashboard views (same pattern as existing role dashboards)
- Update `useAgencyRole()` hook
- Update admin Role Management UI

---

## 5. Design Guidelines

### Visual Tone
- **Clean, trustworthy, enterprise-nonprofit** — calm color palette
- Avoid flashy AI visuals or aggressive "AI automation" branding
- Use **"Operations Intelligence"** language throughout

### Color Palette
- Primary: Calm blues and greens (trust-oriented)
- Accents: Warm amber for alerts, soft green for health indicators
- Avoid: Bright purples, neon gradients, dark "hacker" themes

### UX Positioning Rules

**NEVER show**:
- Contacts list (this is CRM behavior)
- Donation entry forms
- Campaign creation

**ALWAYS reinforce**:
- "Connected to Salesforce" / "Connected to Bloomerang"
- "Last synced: [timestamp]"
- "Data sourced from your CRM"

### Component Patterns
- **Insight cards** with action buttons (View Details, Approve, Dismiss)
- **Health indicators** (percentage scores, status badges)
- **Alert feeds** (AI recommendations, deadline warnings)
- **Progress bars** (fund utilization, data completeness)
- Avoid: Dense record tables, spreadsheet-like layouts

---

## 6. Demo Data Requirements

Populate the prototype with realistic nonprofit data to make the dashboard feel alive:

| Data Point | Value |
|-----------|-------|
| Duplicate contacts detected | 12 |
| Unmatched Stripe transactions | 5 |
| Grant deadlines within 10 days | 2 |
| Event attendance (recent event) | 120 people |
| Data health score | 82% |
| Transactions requiring review | 3 |
| Event attendees not tagged | ~15 |
| Board report status | Draft ready |

### AI Recommendation Feed (Dashboard)
- "12 duplicate records detected" → View Details / Dismiss
- "3 transactions require review" → View Details / Approve
- "2 grant deadlines within 14 days" → View Details
- "Event attendees not tagged" → View Details / Create Follow-Up

---

## 7. Future Extensibility

Structure the system to support:
- Additional AI agents (pluggable agent framework)
- Advanced analytics dashboards
- Multi-organization management (white-label)
- Webhook-driven real-time sync with CRMs
- Custom reporting templates per organization
- Audit trail for all AI-suggested actions

---

## Execution Summary

| Phase | Steps | Scope | Status |
|-------|-------|-------|--------|
| **Phase 1** | Steps 1–4 | Remove EOS, Productivity, Client Portal; hide Meetings | ✅ Done |
| **Phase 2** | Steps 5–6 | Rebrand + clean up admin nav | ✅ Done |
| **Phase 3** | Step 7A | Build 5 nonprofit pages (Data Health, Reconciliation, Events, Grants, Board Reports) | ✅ Done |
| **Phase 4** | Step 7B | AI Agent Center + Integration Center | ✅ Done (AI Agent Browse with 4 teams, 16 agents) |
| **Phase 5** | Step 7C | New user roles + role-specific dashboards | ✅ Done (ED, DD, FM, OM dashboards) |
| **Phase 6** | Step 7D | Admin enhancements + demo data seeding | ✅ Done (nonprofitDemoData.ts) |

> **Rule**: Execute one step at a time. Build must succeed before moving to the next step.
