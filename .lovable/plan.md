

# Plan: Create Nonprofit Control Tower Roadmap Document

## Objective
Create a comprehensive `docs/nonprofit-control-tower-roadmap.md` file that serves as the execution guide for transforming the SJ Control Tower into the Nonprofit Control Tower. No code changes -- document only.

## What the Document Will Cover

The roadmap MD will be structured as sequential, testable steps so that Claude Code (or you) can execute them one at a time:

### Document Structure

**Section 1 -- Project Overview**
- Product name, tagline, selling point (agentic layer on top of existing CRM)
- Tech stack (unchanged: React 18 + TypeScript + Vite + Supabase + shadcn/ui)

**Section 2 -- Module Decisions (Final)**

| Module | Action | Notes |
|--------|--------|-------|
| EOS | DELETE entirely | Remove `src/modules/eos/` (17 pages, components, hooks, types), all EOS nav groups, admin EOS section, routes from `App.tsx`, registry entry |
| Productivity | DELETE entirely | Remove `src/modules/productivity/` (4 pages, hooks, types), nav items, admin "Productivity Import", registry entry |
| Client Portal | DELETE | Remove `src/pages/client/` (2 files), routes from `App.tsx` |
| Meetings | KEEP, hidden by default | Set `defaultEnabled: false` in `MODULE_REGISTRY`; no other changes |
| Projects | KEEP, toggleable | Keep as-is, admin can enable/disable |
| Business Dev | KEEP, toggleable | Keep as-is, admin can enable/disable |
| Lead Follow-Up | KEEP, enabled | Stays active, users will use it |
| Actions/Tasks | KEEP, toggleable | Already gated by feature flag |
| Knowledge | KEEP | No changes |
| Admin | KEEP | Simplify nav (remove EOS/Productivity sections) |
| Platform | KEEP | Core, always enabled |

**Section 3 -- Step-by-Step Execution Plan**

Each step is a single, testable unit:

- **Step 1**: Remove EOS module
  - Files to delete: `src/modules/eos/` (entire directory)
  - Files to edit: `App.tsx` (remove `eosRoutes` import and usage), `modules.ts` (remove `eos` from `ModuleId` union and `MODULE_REGISTRY`), `navigationStructure.ts` (remove "Strategy (EOS)" group, remove admin "EOS" group, remove `eosOnly` properties), `AppSidebar.tsx` (remove `isEosUser` logic), `env.ts` (remove `eos` from env map)
  - Test: Build succeeds, app loads, no EOS nav items visible

- **Step 2**: Remove Productivity module
  - Files to delete: `src/modules/productivity/` (entire directory)
  - Files to edit: `App.tsx` (remove `productivityRoutes`), `modules.ts` (remove from type and registry), `navigationStructure.ts` (remove Productivity/Processes from "Operations" group, remove "Productivity Import" from admin nav), `env.ts`
  - Test: Build succeeds, no productivity nav items

- **Step 3**: Remove Client Portal
  - Files to delete: `src/pages/client/ClientPortalDashboard.tsx`, `src/pages/client/ProjectDashboard.tsx`
  - Files to edit: `App.tsx` (remove both client portal routes and imports)
  - Test: Build succeeds, `/client/*` routes gone

- **Step 4**: Set Meetings to hidden by default
  - File to edit: `modules.ts` -- change meetings `defaultEnabled` from `true` to `false`
  - Test: Meetings nav hidden unless admin enables it

- **Step 5**: Rebrand to Nonprofit Control Tower
  - Update sidebar branding, landing page title/tagline
  - Update `BrandingContext` defaults if hardcoded

- **Step 6**: Clean up admin navigation
  - Remove EOS admin group, productivity import, any orphaned references
  - Keep: Users & Access, Knowledge & AI, System, AI & Automation, Content & Feedback

- **Step 7+**: New nonprofit modules (future phases)
  - Data Health, Reconciliation, Events, Grants, Board Reports
  - AI Agent Center (5 nonprofit operational agents)
  - Integration Center (CRM/Finance/Payment/Email tiles)
  - New user roles (Executive Director, Development Director, Finance Manager, Operations Manager)

**Section 4 -- New Nonprofit Modules Spec** (brief descriptions for future build)

**Section 5 -- Design Guidelines**
- Calm, trust-oriented color palette
- "Operations Intelligence" language
- Never show CRM-like record tables
- Always reinforce "Connected to [CRM]" messaging

**Section 6 -- Demo Data Requirements**

## File to Create
- `docs/nonprofit-control-tower-roadmap.md` -- single comprehensive file

## What Will NOT Change
- Zero code files modified or deleted
- No module removals yet
- No navigation changes yet

