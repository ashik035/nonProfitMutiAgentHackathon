# CLAUDE.md — Nonprofit Control Tower

## Project Overview

**Nonprofit Control Tower** — an operational intelligence layer for modern nonprofits. Sits on top of existing CRM systems (not a CRM replacement). Provides role-specific dashboards, grants management, events, board reports, data health, reconciliation, AI agent teams, knowledge base, and meeting management.

- **Brand**: NonprofitAI.software
- **Stack**: React 18 + TypeScript + Vite + Supabase + shadcn/ui
- **Backend**: Supabase Edge Functions (Deno-based serverless), PostgreSQL with RLS
- **Dev server**: port 8080 (configured in `vite.config.ts`)

## Quick Commands

```bash
npm run dev                    # Start dev server on port 8080
npm run build                  # Production build
npm run build:dev              # Development build
npm run lint                   # ESLint (typescript-eslint + react-hooks + react-refresh)
npm run preview                # Preview production build
npm run migrations:run         # Apply pending database migrations
npm run migrations:repair      # Fix migration history
npm run migrations:mark-applied # Mark migrations as already applied
npm run migrations:hook        # Setup migration hook
```

**No test runner is configured.** There are no test files, no Jest/Vitest, and no test scripts.

## Project Structure

```
/
├── src/
│   ├── App.tsx                    # Root component — all route definitions
│   ├── main.tsx                   # Entry point
│   ├── components/
│   │   ├── admin/                 # Admin panel components
│   │   ├── agent/                 # AI agent UI
│   │   ├── ai/                    # AI chat, agent team config, banners, presence indicators
│   │   ├── auth/                  # ProtectedRoute, AdminRoute
│   │   ├── common/                # Shared components
│   │   ├── dashboard/             # Role-specific dashboards (ED, DD, FM, OM)
│   │   ├── dashboards/            # Dashboard cards (AITeamsDashboardCard)
│   │   ├── followup/              # Lead follow-up components
│   │   ├── integrations/          # OAuth, Teams, Google Drive UI
│   │   ├── knowledge/             # Knowledge base UI
│   │   ├── landing/               # Public landing page components
│   │   ├── layout/                # DashboardLayout, AdminLayout, AppSidebar, TopNav
│   │   ├── meetings/              # Meeting management UI
│   │   ├── projects/              # Project management UI
│   │   ├── routing/               # ModuleRoute and routing utilities
│   │   ├── settings/              # User settings
│   │   ├── tasks/                 # Task/action management UI
│   │   ├── ui/                    # 49 shadcn/ui components
│   │   └── user-knowledge/        # Personal knowledge management
│   ├── contexts/                  # AuthContext, BrandingContext
│   ├── hooks/                     # Custom React hooks
│   ├── integrations/              # Supabase client setup (client.ts, types.ts)
│   ├── lib/                       # Utility files (validation, cache, auth, integrations)
│   ├── modules/
│   │   ├── platform/              # Core: auth, dashboard, profile, settings
│   │   ├── admin/                 # Admin panel
│   │   ├── actions/               # Task management
│   │   ├── business-dev/          # CRM, deals, contacts, lead follow-up
│   │   ├── knowledge/             # Knowledge base
│   │   ├── meetings/              # Meeting management
│   │   └── projects/              # Project lifecycle, milestones
│   ├── pages/                     # Route page components
│   │   ├── *.tsx                  # Root pages (Login, Dashboard, AgentsBrowse, AgentDetail, etc.)
│   │   ├── admin/                 # Admin pages
│   │   │   ├── ai/                # AI admin pages
│   │   │   ├── integrations/      # Integration admin pages
│   │   │   └── memory/            # Memory/analytics admin pages
│   │   └── projects/              # Project detail pages
│   ├── shared/
│   │   ├── config/                # env.ts, modules.ts, api.ts
│   │   └── data/                  # navigationStructure.ts, nonprofitDemoData.ts
│   └── types/                     # TypeScript type definitions
│
├── supabase/
│   ├── functions/                 # 120+ Edge Functions (Deno runtime) + _shared/
│   ├── migrations/                # Database migrations
│   ├── seed/                      # Database seeding scripts
│   ├── auth-middleware.ts         # Edge function auth utilities
│   ├── cors.ts                    # CORS headers
│   └── config.toml                # Function-level JWT verification config
│
├── docs/                          # Documentation
│   ├── 00-getting-started/        # Setup guides
│   ├── 01-architecture/           # System design and data flow
│   ├── 02-modules/                # Per-module documentation (incl. nonprofit ops, AI agent browse)
│   ├── 03-development/            # Developer guides
│   ├── 04-deployment/             # Deployment guides
│   ├── 05-integrations/           # External service integrations
│   ├── 06-ai-features/            # AI capabilities documentation
│   ├── 07-admin/                  # Admin panel and feature flags
│   ├── 08-edge-functions/         # Edge function catalog
│   └── nonprofit-control-tower-roadmap.md  # Living roadmap
│
├── .claude/                       # Claude Code configuration
│   ├── agents.md                  # Agent delegation rules
│   ├── agents/                    # 11 specialized agent definitions
│   ├── skills/                    # Skill definitions
│
├── .cursor/
│   └── skills/                    # gstack skills for Cursor (53 skills)
│   ├── hooks/                     # Session hooks
│   └── settings.json              # Hook configuration
│
├── scripts/                       # Shell scripts for migrations and setup
└── public/                        # Static assets
```

## Architecture & Key Patterns

### Module System

Modules are the primary organizational unit. Defined in `src/shared/config/modules.ts`:

| Module | Category | Core? | Dependencies | Feature Flags | Directory |
|--------|----------|-------|--------------|---------------|-----------|
| platform | core | yes | — | — | `src/modules/platform/` |
| admin | core | yes | platform | — | `src/modules/admin/` |
| actions | operations | no | platform | enableTasks | `src/modules/actions/` |
| meetings | operations | no | platform | enableMeetings | `src/modules/meetings/` |
| knowledge | intelligence | no | platform | enableKnowledgeBase, enablePersonalKnowledge, enableSemanticSearch | `src/modules/knowledge/` |
| projects | business | no | platform | — | `src/modules/projects/` |
| business-dev | business | no | platform | enableClients | `src/modules/business-dev/` |
| lead-followup | business | no | platform, business-dev | — | *(embedded in business-dev)* |

**Three-layer resolution:**
1. **Build-time**: `VITE_MODULE_*` env vars control code bundling
2. **Runtime**: `app_modules` DB table toggles modules (admin UI)
3. **Per-user**: `user_module_permissions` table controls access

### Nonprofit-Specific Pages (Static, no module gating)

Pages marked **[live DB]** query real Supabase tables. The rest use demo data from `src/shared/data/nonprofitDemoData.ts`.
- `/grants` — Grants Management (links into Grant Writer via `?grant=` deep link)
- `/events` — Events Hub: tabbed Manage (full lifecycle **[live DB → `nonprofit_events`, `nonprofit_event_registrants`]**) + Post-Event Intelligence; `/event-management` redirects to `/events?tab=manage`
- `/board-reports` — Board Reports
- `/data-health` — Data Health
- `/reconciliation` — Financial Reconciliation
- `/membership` — Membership Management **[live DB → `nonprofit_members`]**
- `/volunteers` — Volunteer Management **[live DB → `nonprofit_volunteers`, `nonprofit_volunteer_shifts`]**
- `/donations` — Donation Center **[live DB → `nonprofit_campaigns`, `nonprofit_donations`]**
- `/public-presence` — Public Presence / Website Layer (sidebar: Settings group)
- `/impact-dashboard` — Impact Dashboard (read-only executive view; AI annual report via `ai-chat-assistant`)
- `/engagement-scoring` — Member Engagement (members only; AI next best action via `ai-chat-assistant`; linked from Membership)

Unified donor profile: `DonorProfileSheet` (`src/components/donors/`) aggregates pipeline stage, gifts, membership, engagement score, and outreach per donor (matched by name via `DEMO_DONOR_PROFILES`). Opens from Donor Pipeline, Donor Retention, Donation Center, and Communications.

Sidebar groups (see `navigationStructure.ts`): Fundraising, Grants, People, Events, Reporting + AI, Intelligence, Settings (bottom).

### AI Agent Browse System

Discovery experience for 16 agents across 4 teams, defined in `src/components/ai/agentTeamConfig.ts`:
- `/agents` — Browse all agent teams
- `/agents/:slug` — Individual agent detail

Components: `AITeamsDashboardCard`, `AIAgentPresenceIndicator`, `AgentTeamBanner`

### Routing (src/App.tsx)

```
Public routes          → Login, Signup, AuthCallback (no auth)
Protected routes       → ProtectedRoute → DashboardLayout → module routes
Admin routes           → ProtectedRoute → AdminRoute → AdminLayout → admin routes
```

Each module exports its routes from `src/modules/<name>/routes.tsx` using `<ModuleRoute>` for runtime access checks.

### Data Fetching

All data fetching uses **TanStack React Query** with centralized cache keys in `src/lib/cache.ts`:

```typescript
queryKeys.clients.list(filters)
queryKeys.meetings.detail(id)
queryKeys.knowledge.semanticSearch(query, opts)
```

Custom hooks encapsulate all business logic. Never fetch data directly in components — use or create a hook.

### Authentication

- **AuthContext** manages user state
- **ProtectedRoute** checks authentication
- **AdminRoute** checks admin role
- Supports: Email/password, Google OAuth, Microsoft Azure AD
- Profiles auto-created on first login
- Roles stored in `user_roles` table (admin, moderator, user)

### Role-Based Dashboards

Four nonprofit roles with dedicated dashboards:
- **Executive Director** — KPIs, board readiness, grants, data health
- **Development Director** — Donor engagement, events, lead pipeline
- **Finance Manager** — Reconciliation, fund accounting, grant spending
- **Operations Manager** — Data health, integrations, AI agent status

### Forms

All forms use **React Hook Form + Zod**:
```typescript
const form = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: { ... }
});
```

### Edge Functions

120+ Deno-based serverless functions in `supabase/functions/`. JWT verification configured per-function in `supabase/config.toml`.

## Naming Conventions

| Context | Convention | Examples |
|---------|-----------|----------|
| React components | PascalCase files and exports | `Dashboard.tsx`, `AgentsBrowse.tsx` |
| Custom hooks | `use` prefix, camelCase | `useClients.ts`, `useMeetings.ts` |
| Utility files | camelCase | `validation.ts`, `cache.ts` |
| Database tables | snake_case | `user_roles`, `knowledge_entries` |
| Edge functions | kebab-case directories | `ai-chat-assistant/`, `semantic-search/` |
| Env vars (client) | `VITE_` prefix | `VITE_SUPABASE_URL` |

## Path Aliases

`@` maps to `./src` (configured in `vite.config.ts` and `tsconfig.json`):
```typescript
import { supabase } from "@/integrations/supabase/client";
import { useClients } from "@/hooks/useClients";
```

## Database

- **PostgreSQL** via Supabase with **Row Level Security (RLS)** on all tables
- **No ORM** — direct Supabase client queries
- Types auto-generated in `src/integrations/supabase/types.ts`
- Vector extension enabled for embedding-based semantic search

### Core Tables
- `profiles`, `user_roles`, `roles` — Auth & access
- `clients` — CRM/contacts
- `meetings`, `meeting_transcripts` — Meeting management
- `knowledge_entries`, `knowledge_files`, `knowledge_categories` — Knowledge base
- `embeddings` — Vector embeddings for semantic search
- `ai_agents`, `ai_agent_runs`, `ai_chat_history` — AI features
- `tasks`, `projects`, `project_milestones` — Project/task management
- `app_config`, `app_modules`, `user_module_permissions` — Configuration
- `notifications`, `feedback`, `activity_logs` — Operations

### Nonprofit Operational Tables (v0.2.0)
- `nonprofit_members` — Member directory (tier, status, renewals)
- `nonprofit_volunteers`, `nonprofit_volunteer_shifts` — Volunteer roster + shift log
- `nonprofit_events`, `nonprofit_event_ticket_types`, `nonprofit_event_speakers`, `nonprofit_event_agenda_items`, `nonprofit_event_registrants` — Event lifecycle
- `nonprofit_campaigns`, `nonprofit_donations` — Fundraising campaigns + individual donations

All nonprofit tables: RLS enabled (all-authenticated policy), `updated_at` triggers.

## Environment Variables

Required:
```
VITE_SUPABASE_URL              # Supabase project URL
VITE_SUPABASE_PUBLISHABLE_KEY  # Supabase anon key
```

Module toggles (build-time):
```
VITE_MODULE_MEETINGS=true
VITE_MODULE_PROJECTS=true
VITE_MODULE_ACTIONS=true
VITE_MODULE_BUSINESS_DEV=true
VITE_MODULE_KNOWLEDGE=true
```

## Security Practices

1. **RLS on all tables** — never bypass Row Level Security
2. **Input validation** — Zod schemas for all forms
3. **XSS protection** — DOMPurify for user-generated content
4. **Activity logging** — `logCrud()`, `logLogin()`, `logLogout()`
5. **Auth middleware** — `supabase/auth-middleware.ts` for edge functions
6. **No secrets in client code** — all sensitive keys are edge function secrets

## Key Files Reference

| File | Purpose |
|------|--------|
| `src/App.tsx` | Root component with all route definitions |
| `src/contexts/AuthContext.tsx` | Authentication state management |
| `src/shared/config/modules.ts` | Module registry |
| `src/shared/data/navigationStructure.ts` | Sidebar navigation config |
| `src/shared/data/nonprofitDemoData.ts` | Demo data for nonprofit modules |
| `src/components/ai/agentTeamConfig.ts` | AI agent team definitions (16 agents, 4 teams) |
| `src/lib/cache.ts` | React Query key factories (includes `queryKeys.nonprofit.*`) |
| `src/lib/validation.ts` | Zod validation schemas |
| `src/hooks/useMembers.ts` | Members CRUD — `useMembers`, `useCreateMember`, `useUpdateMember`, `useDeleteMember` |
| `src/hooks/useVolunteers.ts` | Volunteers CRUD + shifts — `useVolunteers`, `useAllShifts`, `useCreateVolunteer`, `useCreateShift` |
| `src/hooks/useNonprofitEvents.ts` | Event lifecycle — `useNonprofitEvents`, `useEventRegistrants`, `useToggleCheckin` |
| `src/hooks/useCampaigns.ts` | Campaigns CRUD — `useCampaigns`, `useCreateCampaign`, `useUpdateCampaign` |
| `src/hooks/useDonations.ts` | Donations + stats — `useDonations`, `useDonationStats`, `useCreateDonation` |
| `src/integrations/supabase/client.ts` | Supabase client instance |
| `src/integrations/supabase/types.ts` | Auto-generated database types |
| `supabase/config.toml` | Edge function JWT verification config |
| `vite.config.ts` | Build config (port 8080, `@` alias) |
| `tailwind.config.ts` | Tailwind with dark mode, custom colors, AI palette |
| `docs/nonprofit-control-tower-roadmap.md` | Living transformation roadmap |

## Specialized Subagents (11 Agents)

Available in `.claude/agents/` for delegating complex tasks:

| # | Agent | Specialization |
|---|-------|---------------|
| 1 | **react-frontend-dev** | Pages, components, hooks, routing, UI |
| 2 | **supabase-backend-dev** | Edge Functions, migrations, RLS, auth, DB schema |
| 3 | **code-reviewer** | Code quality, convention enforcement |
| 4 | **debugger** | Bug investigation, error analysis |
| 5 | **documentation-engineer** | Specs, API docs, module guides |
| 6 | **performance-engineer** | Performance optimization, bundle analysis |
| 7 | **refactoring-specialist** | Safe code restructuring, tech debt |
| 8 | **security-auditor** | Security scanning, RLS audit |
| 9 | **typescript-pro** | Type safety, generics |
| 10 | **test-automator** | Unit tests, integration tests |
| 11 | **edge-function-doctor** | Edge Function audit, CORS fixes |

## Skill Registry

| # | Skill | Purpose |
|---|-------|---------|
| 1 | **brainstorming** | Design exploration before implementation |
| 2 | **sj-code-standards** | Coding standards for all code changes |
| 3 | **sj-bug-fix-workflow** | 8-step bug fix process |
| 4 | **supabase-patterns** | Database and backend patterns |
| 5 | **project-architecture** | Full architecture reference |
| 6 | **specs-first-workflow** | Specs before code workflow |
| 7 | **ai-agents-domain** | AI agents domain knowledge |
| 8 | **edge-function-patterns** | Edge Function best practices |
| 9 | **type-safety-patterns** | TypeScript type safety patterns |
| 10 | **plan-ceo-review** | CEO-level adversarial plan review (run in Claude.ai) |
| 11 | **plan-eng-review** | Engineering manager spec + architecture review |
| 12 | **design-consultation** | Full design system creation for new projects |
| 13 | **ship** | Pre-production push checklist |
| 14 | **document-release** | Post-deploy documentation sync |
| 15 | **retro** | Weekly engineering retrospective |

## Session Rules

- Use **brainstorming** before ANY creative work
- Follow **sj-code-standards** for ALL code changes
- Follow **sj-bug-fix-workflow** for ALL bug fixes
- Follow **specs-first-workflow** before ANY new feature
- Follow **supabase-patterns** for ALL database work
- Follow **type-safety-patterns** for ALL TypeScript type definitions
- Run **code-reviewer** before suggesting any PR or merge
- Run **security-auditor** before deploying sensitive features
- Run **edge-function-doctor** for ALL Edge Function work
- Create/update docs for any feature work
- Never skip specs

## Pre-Commit Checklist

Before committing any code changes:
- Run: `npm run lint`
- Run: `npm run build:dev`
- Read: `.claude/PRE_COMMIT_CHECKLIST.md`
- Verify all type safety checks pass

## Documentation

Comprehensive docs in `/docs/` organized by topic:
- `00-getting-started/` — Setup and quickstart
- `01-architecture/` — System design, data flow, security
- `02-modules/` — Per-module feature documentation (incl. nonprofit ops, AI agent browse)
- `03-development/` — Developer guides
- `04-deployment/` — Deployment guides
- `05-integrations/` — External service integrations
- `06-ai-features/` — AI capabilities
- `07-admin/` — Admin panel and feature flags
- `08-edge-functions/` — Edge function catalog
- `nonprofit-control-tower-roadmap.md` — Living roadmap

---

## gstack
Use /browse from gstack for all web browsing. Never use mcp__claude-in-chrome__* tools.
Available skills: /office-hours, /plan-ceo-review, /plan-eng-review, /plan-design-review,
/design-consultation, /design-shotgun, /design-html, /review, /ship, /land-and-deploy,
/canary, /benchmark, /browse, /open-gstack-browser, /qa, /qa-only, /design-review,
/setup-browser-cookies, /setup-deploy, /setup-gbrain, /sync-gbrain, /retro, /investigate,
/document-release, /document-generate, /codex, /cso, /autoplan, /pair-agent, /careful, /freeze,
/guard, /unfreeze, /gstack-upgrade, /learn.
