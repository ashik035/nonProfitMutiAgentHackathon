## Plan: Refresh FEATURES.md

`FEATURES.md` already exists at project root (353 lines, last generated earlier this session). I'll update it in place so it reflects the current state of the system, including everything added in recent loops.

### What I'll refresh

1. **Header/version** — bump to current date (May 2026), confirm demo org + stack.
2. **Auth & Access** — email/password, Google OAuth, Microsoft Azure AD, ProtectedRoute, AdminRoute.
3. **Role-Based Dashboards** — Executive Director, Development Director, Finance Manager, Operations Manager, including the new `AIActivityWidget` on ED + Ops dashboards.
4. **Nonprofit Operations Modules** — Data Health, Grants Management, Grant Writer (with deployed `generate-grant-draft` edge function), Events, Board Reports, Reconciliation, Donor Pipeline, Donor Retention (new), Program Impact (new), Communication Center (new).
5. **AI Agent System** — 8 core operations agents + 16 discovery agents across 4 teams, plus:
   - New `/agents/activity` Agent Activity Feed page
   - Agent presence indicators, pulse badges
   - Dashboard AI activity widget
6. **AI Features** — Lovable AI Gateway, donor letter generator, grant draft generator, AI chat, semantic search, agentic memory framework.
7. **Knowledge Base** — categories, semantic search, personal knowledge, file uploads, embeddings.
8. **Integration Center** — provider-agnostic catalog, simulated setup, active/test toggles.
9. **Admin Panel** — centralized routing, role management, dashboard widgets, environment validator, integration analytics, memory analytics, AI dashboard, agent analytics.
10. **RBAC** — `nonprofit_role_permissions` table, `RoleGate` component, `ROLE_GATING_ENABLED` flag, permission keys (incl. new: grants, donor_retention, board_reports, programs, communications).
11. **Backend & Edge Functions** — Supabase (Auth, DB, pgvector, Storage), ~117+ edge functions, key ones called out (generate-donor-letter, generate-grant-draft, ai-chat-assistant, semantic-search, agentic memory functions).
12. **Navigation** — sidebar structure with new groupings for the added pages.
13. **Demo Mode** — Brightside Foundation, centralized `nonprofitDemoData.ts`, runtime timestamps, demo logins.
14. **Remixing** — checklist for rebranding.

### Deliverable

A single updated `FEATURES.md` at project root. No code changes, no other files touched.
