# Nonprofit Control Tower — Complete Feature List

> **Version:** v0.2.0 — May 2026
> **Product:** Operational Intelligence Layer (OIL) for modern nonprofits
> **Demo Organization:** Brightside Foundation
> **Stack:** React 18 · TypeScript · Vite · Tailwind CSS · shadcn/ui · Supabase (Auth, Postgres, pgvector, Edge Functions, Storage) · Lovable AI Gateway

---

## Table of Contents

1. [Product Overview](#product-overview)
2. [Authentication & Access](#authentication--access)
3. [Navigation Structure](#navigation-structure)
4. [Role-Based Dashboards](#role-based-dashboards)
5. [Nonprofit Operations Modules](#nonprofit-operations-modules)
6. [AI Agent System](#ai-agent-system)
7. [AI Features](#ai-features)
8. [Knowledge Base](#knowledge-base)
9. [Integration Center](#integration-center)
10. [Admin Panel](#admin-panel)
11. [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
12. [Backend & Edge Functions](#backend--edge-functions)
13. [Demo Mode](#demo-mode)
14. [Remixing This Project](#remixing-this-project)

---

## Product Overview

Nonprofit Control Tower is an **operational intelligence layer** that sits on top of existing CRM systems (Salesforce, HubSpot, Raiser's Edge, etc.). It is **not** a CRM replacement — it aggregates data from connected systems to provide:

- Role-specific dashboards with KPIs and AI activity digests
- AI-powered agents that scan, flag, and draft across operations
- Grant compliance tracking, grant writing assistance, and board report generation
- Donor pipeline management, retention analytics, and acknowledgment automation
- Event intelligence and post-event follow-up automation
- Financial reconciliation across payment processors and finance systems
- Program impact tracking and outcome reporting
- Communication center for donor and board outreach
- Centralized knowledge base with semantic search

---

## Authentication & Access

| Feature | Details |
|---------|---------|
| Email/password login | Standard signup + login with email verification |
| Google OAuth | One-click Google sign-in |
| Microsoft Azure AD | Enterprise SSO via MSAL |
| Protected routes | All app routes behind `ProtectedRoute` |
| Admin routes | Separate `AdminLayout` behind `AdminRoute` (role check) |
| Profile auto-creation | Profile row created on first login |
| Role switching | Reactive role updates via `useSyncExternalStore` (no refresh required) |

**Demo logins** (password `Demo@123` for all):
- `executive_director@nonprofitai.software`
- `development_director@nonprofitai.software`
- `finance_manager@nonprofitai.software`
- `operations_manager@nonprofitai.software`
- `admin@nonprofitct.com`

---

## Navigation Structure

Sidebar (`src/shared/data/navigationStructure.ts`) is organized in logical groupings:

- **Overview** — Dashboard, Notifications
- **Nonprofit Operations** — Data Health, Grants, Events, Board Reports, Reconciliation, Donor Pipeline, Donor Retention, Programs, Communications, Grant Writer, Membership, Volunteers, Event Management, Donation Center, Public Presence, Impact Dashboard, AI Engagement Scoring
- **AI** — AI Agents (Browse), Agent Activity Feed, AI Chat, Voice Notes
- **Intelligence** — Knowledge Base
- **Settings** — Integrations, Help & Support, Settings
- **Admin** (admin only) — full admin sub-navigation

Branded as **Brightside Foundation** in the sidebar header.

---

## Role-Based Dashboards

Four nonprofit personas, each with a tailored dashboard:

| Role | Dashboard Focus |
|------|-----------------|
| **Executive Director** | Org-wide KPIs, board readiness, grants pipeline, data health digest, **AI Activity Widget** |
| **Development Director** | Donor engagement, retention signals, event pipeline, lead follow-up |
| **Finance Manager** | Reconciliation status, fund accounting, grant spend, anomaly alerts |
| **Operations Manager** | Data health, integration status, agent run summary, **AI Activity Widget** |

Each dashboard includes:
- Personalized greeting with time-of-day awareness
- Core metric cards (calm blues/greens, amber alerts)
- AI activity digest of recent agent runs
- Quick-action shortcuts

---

## Nonprofit Operations Modules

Most pages use centralized demo data from `src/shared/data/nonprofitDemoData.ts`. Pages marked **[live DB]** query real Supabase tables (v0.2.0).

| Module | Route | Backend | Capabilities |
|--------|-------|---------|--------------|
| **Data Health** | `/data-health` | Demo | Duplicate detection, incomplete profiles, stale data flags, AI-suggested merges |
| **Grants Management** | `/grants` | Demo | Lifecycle tracking, deadlines, fund utilization, compliance status |
| **Grant Writer** | `/grant-writer` | Demo | AI-assisted draft generation via `generate-grant-draft` edge function (deployed) |
| **Events** | `/events` | Demo | Post-event engagement intelligence, follow-up automation, attendance tracking |
| **Board Reports** | `/board-reports` | Demo | Document-style preview, KPI summaries, financial snapshots, export simulation |
| **Reconciliation** | `/reconciliation` | Demo | Match transactions across Stripe/PayPal/CRM/finance systems |
| **Donor Pipeline** | `/donor-pipeline` | Demo | Major gift pipeline, stage tracking, AI next-best-action suggestions |
| **Donor Retention** | `/donor-retention` | Demo | Lapsed donor analytics, retention cohorts, re-engagement playbooks |
| **Program Impact** | `/programs` | Demo | Program outcomes, beneficiary counts, impact storytelling, KPI tracking |
| **Communication Center** | `/communications` | Demo | Donor and board outreach drafts, templates, AI-assisted copy |
| **Membership Management** | `/membership` | **[live DB]** | Member directory, tier/status management, renewals, onboarding form → `nonprofit_members` |
| **Volunteer Management** | `/volunteers` | **[live DB]** | Volunteer roster, shift tracking, skills, donor crossover, economic value → `nonprofit_volunteers`, `nonprofit_volunteer_shifts` |
| **Event Management** | `/event-management` | **[live DB]** | Full event lifecycle: create, capacity, registrations, check-in, plus `EventDetailSheet` deep-dive showing speakers, agenda timeline, and ticket-tier breakdown with revenue calc (`fund_raised + Σ ticket.price × sold`) → `nonprofit_events`, `nonprofit_event_registrants`, `nonprofit_event_speakers`, `nonprofit_event_agenda_items`, `nonprofit_event_ticket_types` |
| **Donation Center** | `/donations` | **[live DB]** | Campaign management, donation history, fund breakdown, record donation → `nonprofit_campaigns`, `nonprofit_donations` |
| **Public Presence** | `/public-presence` | Demo | Visibility toggles, embed codes, social sharing, website layer controls |
| **Impact Dashboard** | `/impact-dashboard` | Demo | Program outcomes, milestones, AI-drafted annual report |
| **AI Engagement Scoring** | `/engagement-scoring` | Demo | 0–100 member scores, At Risk detection, AI next-best-action per member |

---

## AI Agent System

### Core Operations Agents (8)

Specialized agents that scan, flag, and draft inside nonprofit operations. Each has an interactive finding page with evidence-of-value cards (gradients, pulse indicators).

1. Data Hygiene Agent
2. Grant Deadline Agent
3. Donor Retention Agent
4. Reconciliation Agent
5. Board Report Agent
6. Event Follow-up Agent
7. Communication Drafting Agent
8. Program Impact Agent

### Discovery Catalog (16 agents · 4 teams)

Browseable in `/agents` and configured in `src/components/ai/agentTeamConfig.ts`:
- Donor Team
- Meeting Team
- Strategy Team
- Project Team

### Agent Visibility Features

| Feature | Route / Location | Details |
|---------|------------------|---------|
| **Agent Activity Feed** | `/agents/activity` | Real-time log of all agent runs (agent name, team, action, outcome summary, timestamp, status: success/running/failed). Pulls from `ai_agent_runs`. |
| **AI Activity Widget** | ED & Ops dashboards | Compact digest of latest agent runs |
| **Presence Indicators** | Sidebar & agent cards | Pulse badges for active agents |
| **Agent Detail Pages** | `/agents/:slug` | Capabilities, recent runs, sample outputs |

---

## AI Features

- **Lovable AI Gateway** — Single managed gateway (Gemini, GPT-5 family) with usage tracking
- **Donor Acknowledgment Generator** — Gemini-powered letter generation (`generate-donor-letter`)
- **Grant Draft Generator** — Section-by-section grant drafting (`generate-grant-draft`, deployed)
- **AI Chat** — Conversational assistant with system prompts and chat history
- **Semantic Search** — pgvector-backed search across knowledge entries
- **Agentic Memory Framework** — Threaded conversations, long-term state extraction & retrieval
- **AI Usage Tracking** — Per-model token + cost logging
- **Provider Management** — Centralized provider config with dynamic routing

---

## Knowledge Base

- Knowledge entries with categories
- File uploads to Supabase Storage
- pgvector embeddings for semantic search
- Personal vs. organizational knowledge spaces
- Category browse, semantic search, and related-articles UI

---

## Integration Center

- Provider-agnostic catalog (`/integrations`)
- Connectivity status display
- Simulated setup-request workflows
- Test & Active toggles for each provider
- Shared logic pattern with generic adapter stubs (CRM, payment processor, email, finance, calendar)

---

## Admin Panel

Centralized admin routing under `/admin`:

- Role Management
- Employee / Department / Pod Management
- Dashboard Widgets configuration
- Project Modules toggles
- Integration Analytics
- Environment Validator
- Activity Logs
- AI Dashboard & Agent Analytics
- Memory Analytics & Team Learning Patterns
- Organization Settings
- Gemini RAG Config
- Support Tickets

---

## Role-Based Access Control (RBAC)

- **Roles**: `executive_director`, `development_director`, `finance_manager`, `operations_manager`, `admin`
- **Permissions table**: `nonprofit_role_permissions`
- **Gating component**: `<RoleGate permission="...">`
- **Feature flag**: `ROLE_GATING_ENABLED` (off by default during demo)
- **Permission keys**: `grants`, `donor_retention`, `board_reports`, `programs`, `communications`, plus core module keys
- Roles stored in dedicated table — **never** on the profiles/users table

---

## Backend & Edge Functions

- **Database**: PostgreSQL with RLS on all tables
- **Vector**: pgvector for embeddings & semantic search
- **Storage**: Supabase Storage for uploads
- **Edge Functions**: 117+ Deno functions in `supabase/functions/`

Key functions:
- `generate-donor-letter` — Donor acknowledgment generation
- `generate-grant-draft` — Grant section drafting (deployed)
- `ai-chat-assistant` — Conversational AI
- `semantic-search` — Embedding-based search
- Agentic framework: 14 functions for thread management, memory extraction, retrieval, summarization

All new functions include CORS headers (`supabase/cors.ts`) and JWT verification configured per-function in `supabase/config.toml`.

---

## Demo Mode

- **Demo organization**: Brightside Foundation (single source of truth)
- **Demo data file**: `src/shared/data/nonprofitDemoData.ts`
- **Timestamps**: Computed at runtime with date-fns so the data always looks fresh
- **Interaction pattern**: Local state, toasts, and modals — most demo features intentionally skip backend persistence
- **Live modules (v0.2.0)**: Membership, Volunteers, Event Management, Donation Center write to real Supabase tables — these pages show empty states until data is entered
- **Demo logins**: see [Authentication & Access](#authentication--access)

---

## Remixing This Project

Checklist to rebrand/repurpose:

1. Replace branding in `BrandingContext` and sidebar header
2. Update `nonprofitDemoData.ts` with your org's sample data
3. Adjust `navigationStructure.ts` for your modules
4. Update role names in the roles enum + permission keys
5. Swap demo logins in seed/auth config
6. Update `FEATURES.md` (this file) and `README.md`
7. Configure Lovable AI Gateway / model preferences
8. Connect real integrations via the Integration Center

---

## Recent Updates (post-v0.2.0)

- **Event sub-entities live**: speakers (`nonprofit_event_speakers`), agenda items (`nonprofit_event_agenda_items`), ticket types (`nonprofit_event_ticket_types`) — all RLS-enabled
- **New hooks** in `src/hooks/useNonprofitEvents.ts`: `useEventSpeakers`, `useEventAgendaItems`, `useEventTicketTypes`
- **New cache keys**: `queryKeys.nonprofit.events.speakers / agenda / ticketTypes`
- **EventDetailSheet** component on `/event-management` — slide-over with speakers list, agenda timeline (Clock icon), and ticket-tier revenue breakdown (Ticket icon)
- **Campaign ↔ donation sync**: `useCreateCampaign` and `useUpdateCampaign` now invalidate `nonprofitDonations` queries to keep counts consistent

---

_Last updated: June 10, 2026_
