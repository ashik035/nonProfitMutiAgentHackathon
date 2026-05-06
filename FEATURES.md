# Nonprofit Control Tower — Complete Feature List

> **Version:** May 2026  
> **Product:** Operational Intelligence Layer (OIL) for modern nonprofits  
> **Demo Organization:** Brightside Foundation  
> **Stack:** React 18 · TypeScript · Vite · Supabase · shadcn/ui · Tailwind CSS

---

## Table of Contents

1. [Product Overview](#product-overview)
2. [Authentication & Access](#authentication--access)
3. [Role-Based Dashboards](#role-based-dashboards)
4. [Nonprofit Operations Modules](#nonprofit-operations-modules)
5. [AI Agent System](#ai-agent-system)
6. [AI Features](#ai-features)
7. [Knowledge Base](#knowledge-base)
8. [Integration Center](#integration-center)
9. [Admin Panel](#admin-panel)
10. [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
11. [Backend & Edge Functions](#backend--edge-functions)
12. [Demo Mode](#demo-mode)
13. [Remixing This Project](#remixing-this-project)

---

## Product Overview

Nonprofit Control Tower is an **operational intelligence layer** that sits on top of existing CRM systems (Salesforce, HubSpot, etc.). It is **not** a CRM replacement — it aggregates data from connected systems to provide:

- Role-specific dashboards with KPIs
- AI-powered agents that scan, flag, and draft across operations
- Grant compliance tracking and board report generation
- Donor pipeline management and retention analytics
- Event intelligence and post-event follow-up automation
- Financial reconciliation across payment processors
- Centralized knowledge base with semantic search

---

## Authentication & Access

| Feature | Details |
|---------|---------|
| Email/password login | Standard signup + login with email verification |
| Google OAuth | One-click Google sign-in |
| Microsoft Azure AD | Enterprise SSO via MSAL |
| Protected routes | All app routes behind authentication |
| Admin routes | Separate admin layout with role check |
| Session management | Persistent sessions with auto-refresh tokens |
| Profile auto-creation | User profile created on first login |

**Demo Logins:**

| Role | Email | Password |
|------|-------|----------|
| Executive Director | `executive_director@nonprofitai.software` | `Demo@123` |
| Development Director | `development_director@nonprofitai.software` | `Demo@123` |
| Finance Manager | `finance_manager@nonprofitai.software` | `Demo@123` |
| Operations Manager | `operations_manager@nonprofitai.software` | `Demo@123` |
| Admin | `admin@nonprofitct.com` | `Demo@123` |

---

## Role-Based Dashboards

Each nonprofit role gets a dedicated dashboard with role-specific KPIs and widgets:

### Executive Director Dashboard
- Organization health score
- Board readiness indicators
- Grant portfolio overview
- Data health summary
- AI activity digest widget (last 5 agent runs)
- Personalized greeting with role context

### Development Director Dashboard
- Donor engagement metrics
- Event pipeline and attendance tracking
- Lead pipeline summary
- Fundraising goal progress
- Recent donor activity

### Finance Manager Dashboard
- Reconciliation status overview
- Fund accounting summary
- Grant spending vs. budget
- Unmatched transaction alerts
- Monthly financial snapshots

### Operations Manager Dashboard
- Data health score and trends
- Integration health status
- AI agent run status
- System uptime indicators
- AI activity digest widget

---

## Nonprofit Operations Modules

### 1. Data Health (`/data-health`)
- CRM data quality scoring
- Duplicate record detection with merge suggestions
- Missing field analysis
- Stale profile identification (12+ months inactive)
- Data quality trend tracking

### 2. Grants Management (`/grants`)
- Active grant tracking with deadlines
- Fund utilization monitoring (budget vs. actual)
- Compliance alert system
- Funder communication tools
- Grant reporting workflow
- Budget threshold alerts (75% and 90%)

### 3. Events (`/events`)
- Event listing with status indicators
- Post-event attendance analysis
- Attendee CRM tagging automation
- Volunteer interest flag detection
- Follow-up task generation
- **Event Intelligence AI Panel** — embedded collapsible panel with quick insight chips and conversational AI

### 4. Board Reports (`/board-reports`)
- Document-style preview layout
- Auto-aggregated KPIs from connected systems
- Financial snapshots
- Engagement metrics compilation
- PDF export simulation
- ED approval workflow for KPI sections

### 5. Reconciliation (`/reconciliation`)
- Transaction matching (Stripe, PayPal → QuickBooks)
- Unmatched payment flagging
- Fee variance detection
- Restricted fund mismatch alerts
- Monthly reconciliation summaries

### 6. Donor Pipeline (`/donor-pipeline`)
- Donor lifecycle stage tracking
- Pipeline visualization
- Engagement scoring
- Gift history and trends
- Prospect research integration

### 7. Donor Retention (`/donor-retention`)
- Retention rate KPIs and trend analysis
- LYBUNT (Last Year But Unfortunately Not This) donor tracking
- At-risk donor identification
- AI-powered re-engagement email composer
- Retention cohort analysis

### 8. Programs (`/programs`)
- Program metrics dashboard (beneficiaries, budget utilization)
- AI-generated impact narratives
- Program outcome tracking
- Budget-to-actual comparison
- Beneficiary demographics

### 9. Communications (`/communications`)
- Bulk email composer with AI assist
- Sent message log and analytics
- Thank-you letter queue
- Template management
- Donor acknowledgment letter generation

---

## AI Agent System

### Core Operations Team — 8 AI Agents

| # | Agent | What It Does | Where to Find |
|---|-------|-------------|---------------|
| 1 | **CRM Data Integrity Agent** | Scans CRM for duplicates, missing fields, stale profiles. Surfaces merge suggestions. | `/data-health` |
| 2 | **Reconciliation & Fund Accounting Agent** | Matches transactions across payment processors vs. finance system. Flags variances. | `/reconciliation` |
| 3 | **Grant Compliance Agent** | Tracks grant deadlines, monitors fund utilization, flags spending anomalies. | `/grants` |
| 4 | **Event Intelligence Agent** | Analyzes post-event attendance, suggests engagement tags, generates follow-up tasks. | `/events` |
| 5 | **Board Reporting Agent** | Aggregates KPIs and financial snapshots to generate draft board reports. | `/board-reports` |
| 6 | **Grant Budget Watcher** | Alerts at 75%/90% budget utilization. Auto-drafts variance explanations. | `/grants` |
| 7 | **Integration Health Monitor** | Flags sync failures, stale connections, and broken webhooks. | `/integrations` |
| 8 | **Onboarding Checklist AI** | Generates staff onboarding task lists from Knowledge Base documents. | `/agents` |

### Agent Discovery & Browsing
- **Browse page** (`/agents`) — Visual cards for all agent teams with gradient accents
- **Detail pages** (`/agents/:slug`) — Individual agent capabilities, how-to-use guides, and operational metadata
- **Agent Activity Feed** (`/agents/activity`) — Real-time log of all agent runs with status (success/running/failed), 30-second auto-refresh
- **Dashboard widgets** — Last 5 agent runs shown on ED and OM dashboards
- **Presence indicators** — Visual status showing agent activity across the app

---

## AI Features

| Feature | Details |
|---------|---------|
| **AI Chat** (`/ai-chat`) | Conversational AI interface powered by Lovable AI Gateway. System prompts tailored to nonprofit context. |
| **Event Intelligence Panel** | Embedded collapsible panel on Events page. Quick insight chips + free-form questions. Uses GPT-4o-mini via edge function. |
| **Donor Acknowledgment Generator** | AI-powered letter generation using Gemini 3.5 Flash. Produces personalized thank-you letters. |
| **Re-engagement Email Composer** | AI-assisted email drafting for at-risk and lapsed donors on Donor Retention page. |
| **Impact Narrative Generator** | AI-generated program impact narratives on Programs page. |
| **Communication AI Assist** | AI-powered content suggestions in the Communications bulk email composer. |
| **Voice Notes** (`/voice-notes`) | Voice note capture and processing. |
| **Agent Memory Framework** | Extraction and retrieval functions for agent conversational continuity across sessions. |
| **AI Usage Tracking** | Logging of AI model usage, tokens, and cost tracking across all AI features. |

---

## Knowledge Base

| Feature | Route | Details |
|---------|-------|---------|
| Knowledge articles | `/knowledge` | Categorized articles with rich content |
| Semantic search | Built-in | Vector-based search using pgvector embeddings |
| Personal knowledge | `/personal-knowledge` | User-specific knowledge items |
| Auto-embedding | Background | New entries automatically embedded for search |
| File attachments | Built-in | Document uploads with processing |
| Category management | Admin | Organize knowledge by topic |

---

## Integration Center

**Route:** `/integrations`

Provider-agnostic integration management supporting:
- Connectivity status display for all integrations
- Simulated setup request workflows
- Health monitoring across active connections
- Support for CRM (Salesforce, HubSpot), payment processors (Stripe, PayPal), accounting (QuickBooks), collaboration (Zoom, Microsoft Teams, Google Meet), and cloud storage (Google Drive)

---

## Admin Panel

Accessible to admin users at `/admin` with dedicated sidebar:

### People & Performance
- Admin dashboard with system overview
- Employee management
- Task stream configuration
- POD management and team organization
- Skill management
- Resource planning (RP) settings and employee projection

### Knowledge & AI
- **AI Hub** — Dashboard, agent management, agent analytics, agent categories, prompt templates, email drafting config, deal coaching
- **Semantic Search Admin** — Search interface and embeddings management
- **User Memory** — Memory dashboard, user stats, search analytics, team learning patterns
- **Knowledge Base Admin** — Common knowledge management, category administration

### System
- Organization settings
- Role management
- Integration analytics
- Activity logs
- Support tickets
- Environment validator
- Project modules configuration
- Dashboard widget management

---

## Role-Based Access Control (RBAC)

| Component | Details |
|-----------|---------|
| **Permission table** | `nonprofit_role_permissions` in database |
| **Feature flag** | `ROLE_GATING_ENABLED` (currently `true`) |
| **RoleGate component** | Wraps UI elements to show/hide based on role permissions |
| **Navigation filtering** | Sidebar items gated by `requiredPermission` key |
| **Agent filtering** | Agent visibility gated by `permissionKey` |
| **Role switching** | Real-time role reactivity via `useSyncExternalStore` — no page refresh needed |

### Permission Matrix

| Module | Executive Director | Development Director | Finance Manager | Operations Manager |
|--------|:-:|:-:|:-:|:-:|
| Data Health | ✅ | ❌ | ❌ | ✅ |
| Grants | ✅ | ✅ | ✅ | ❌ |
| Events | ✅ | ✅ | ❌ | ❌ |
| Board Reports | ✅ | ❌ | ✅ | ❌ |
| Reconciliation | ✅ | ❌ | ✅ | ❌ |
| Donor Pipeline | ✅ | ✅ | ❌ | ❌ |
| Donor Retention | ✅ | ✅ | ❌ | ❌ |
| Programs | ✅ | ✅ | ❌ | ✅ |
| Communications | ✅ | ✅ | ❌ | ❌ |
| Agent Activity | ✅ | ❌ | ❌ | ✅ |

*Admin role has full access to everything.*

---

## Backend & Edge Functions

- **Database:** PostgreSQL via Supabase with Row Level Security (RLS) on all tables
- **Vector search:** pgvector extension for embedding-based semantic search
- **Edge Functions:** 117 serverless functions (Deno runtime) handling AI, integrations, auth, webhooks, and data processing
- **Auth middleware:** JWT verification per function via `supabase/config.toml`
- **CORS:** Centralized CORS configuration for all edge functions

### Key Edge Function Categories
- AI chat and agent conversation
- Semantic search and auto-embedding
- Meeting management (Zoom, Teams, Google Meet)
- CRM and client APIs
- Grant and compliance processing
- Webhook handlers
- Authentication flows (Azure AD, OAuth)
- Email and notification services

---

## Demo Mode

The app ships with a fully populated demo experience:

- **Demo organization:** Brightside Foundation
- **Centralized demo data:** Single source of truth in `src/shared/data/nonprofitDemoData.ts`
- **Dynamic timestamps:** Computed at runtime using `date-fns` (e.g., "2 hours ago", "3 days ago")
- **Local state interactions:** Toasts, modals, and local state for all demo interactions — no backend persistence required
- **Pre-seeded accounts:** 4 nonprofit role accounts + 1 admin account
- **Populated dashboards:** All pages show realistic data on first load

---

## Remixing This Project

To create your own version of Nonprofit Control Tower:

1. **Fork/remix** the project
2. **Update branding:**
   - Replace "Brightside Foundation" in `nonprofitDemoData.ts`
   - Update logo and colors in `BrandingContext.tsx` and `tailwind.config.ts`
   - Modify the landing page in `src/pages/Index.tsx`
3. **Configure backend:**
   - Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in `.env`
   - Run database migrations from `supabase/migrations/`
   - Deploy edge functions from `supabase/functions/`
4. **Customize modules:**
   - Toggle modules in `src/shared/config/modules.ts`
   - Adjust navigation in `src/shared/data/navigationStructure.ts`
   - Modify RBAC permissions in the `nonprofit_role_permissions` table
5. **Connect integrations:**
   - Configure CRM, payment, and collaboration tool credentials
   - Set up OAuth apps for Google and Microsoft sign-in
6. **Replace demo data** with your organization's real data

---

*Generated from the Nonprofit Control Tower codebase — May 2026*
