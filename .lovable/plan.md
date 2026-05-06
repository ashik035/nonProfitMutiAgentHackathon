
# Plan: Generate FEATURES.md

Create a new `FEATURES.md` file at the project root documenting every feature currently in the app. This is a single-file addition with no code changes.

## What the file will cover

1. **Product Overview** -- Nonprofit Control Tower as an OIL layer over CRM
2. **Role-Based Dashboards** -- 4 nonprofit roles + admin, each with dedicated dashboard
3. **Nonprofit Operations Modules** (9 modules):
   - Data Health, Grants, Events, Board Reports, Reconciliation, Donor Pipeline, Donor Retention, Programs, Communications
4. **AI Agent System** -- 8 agents across Core Operations Team, with capabilities and where-to-find links
5. **AI Features** -- AI Chat (Lovable AI Gateway), Event Intelligence panel, Donor Acknowledgment Letter Generator, Voice Notes
6. **Agent Activity Feed** -- Real-time log of agent runs
7. **Role-Based Access Control (RBAC)** -- Permission-gated navigation and agent visibility
8. **Integration Center** -- Provider-agnostic connectivity display
9. **Knowledge Base** -- Semantic search, personal knowledge, categories
10. **Admin Panel** -- Employee management, AI hub, memory analytics, agent analytics, skill management, etc.
11. **Authentication** -- Email/password, Google OAuth, Microsoft Azure AD
12. **117 Edge Functions** -- Serverless backend capabilities
13. **Demo Mode** -- Pre-seeded demo data with Brightside Foundation org

## Technical details

- Single new file: `FEATURES.md` at project root
- No existing files modified
- Content derived from `navigationStructure.ts`, `agentTeamConfig.ts`, `nonprofitDemoData.ts`, routes, and edge functions
