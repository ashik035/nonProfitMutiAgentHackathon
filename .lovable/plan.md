

# Documentation Cleanup & Update Plan

## Problem

The project has been rebranded from "CollabAi / SJ Control Tower" to **Nonprofit Control Tower (NonprofitAI.software)**, with modules removed (EOS, Productivity, Client Portal) and new nonprofit features added (Grants, Events, Board Reports, Data Health, Reconciliation, AI Agent Browse). But the documentation still references the old branding, old modules, and contains many stale one-off reports.

---

## Files to DELETE (root)

These are legacy implementation guides and status docs from the old "SJ Control Tower / CollabAi" era — no longer relevant:

| File | Reason |
|------|--------|
| `LEAD_FOLLOWUP_IMPLEMENTATION_GUIDE.md` | Old implementation tracker, lead-followup is embedded in business-dev |
| `POD_MANAGEMENT_IMPLEMENTATION_STATUS.md` | Pod management status doc, stale |
| `QUICK_REAL_DATA_INTEGRATION.md` | Old wiring guide for lead-followup pages |
| `.pr-body.md` | One-off PR description, not project docs |
| `deploy-edge-functions.sh` | References "CollabAI", outdated function list (24 V1 functions — now 120+) |
| `verify-deployment.sh` | References "CollabAI", outdated verification script |

## Files to DELETE (docs/)

| File | Reason |
|------|--------|
| `docs/AGENTIC_EVOLUTION_ROADMAP.md` | Strategic planning doc for "SJ Control Tower" — superseded by nonprofit roadmap |
| `docs/AGENTIC_FEATURES_GUIDE.md` | Old agentic features guide, pre-nonprofit |
| `docs/AGENTIC_QUICK_REFERENCE.md` | Quick ref for old agentic system |
| `docs/AUDIT_REPORT_20260306.md` | One-time cleanup audit report — historical, not ongoing reference |
| `docs/CODE_REVIEW_REPORT_5_COMMITS.md` | One-time code review snapshot |
| `docs/IMPLEMENTATION_PLAN.md` | Old "Control Tower Framework" implementation plan |
| `docs/PHASE_2_QUICK_REFERENCE.md` | Phase 2 multi-agent/HITL reference — not implemented in nonprofit version |
| `docs/QA_REPORT_PROJECTS_PRODUCTIVITY_KNOWLEDGE.md` | Old QA report, Productivity module removed |
| `docs/GUARDRAILS_GUIDE.md` | AI guardrails setup from old framework |
| `docs/HITL_SETUP_GUIDE.md` | Human-in-the-loop config from old framework |
| `docs/MULTI_AGENT_TUTORIAL.md` | Multi-agent tutorial from old framework |
| `docs/02-modules/02-eos.md` | EOS module removed |
| `docs/02-modules/08-productivity.md` | Productivity module removed |
| `docs/02-modules/PRODUCTIVITY_MODULE_REPLICATION_PLAN.md` | Productivity removed |
| `docs/02-modules/projects-gap-analysis.md` | Old gap analysis |
| `docs/02-modules/eos/` | EOS subdirectory — module removed |

## Files to UPDATE

### 1. `README.md` (root)
- Rebrand from "CollabAi Framework" to "Nonprofit Control Tower"
- Update features list: Dashboard, Grants Management, Events, Board Reports, Data Health, Reconciliation, AI Agents, Knowledge Base
- Update tagline to "Operational Intelligence Layer for Modern Nonprofits"

### 2. `CLAUDE.md` (root)
- Update project overview from "SJ Control Tower / SJ Innovation Framework" to "Nonprofit Control Tower"
- Remove references to removed modules (EOS, Productivity, Client Portal)
- Add new nonprofit modules (Grants, Events, Board Reports, Data Health, Reconciliation)
- Update module table and project structure
- Update demo accounts to `@nonprofitai.software` domain
- Add AI Agent Browse system to component/route references

### 3. `docs/README.md`
- Rebrand from "CollabAi" to "Nonprofit Control Tower"
- Remove links to deleted files
- Update quick links

### 4. `docs/nonprofit-control-tower-roadmap.md`
- Keep as primary roadmap — mark completed steps as done (module removal, rebranding, demo data, AI agents browse)

### 5. `docs/00-getting-started/README.md` + child files
- Update branding references from CollabAi to Nonprofit Control Tower

### 6. `docs/02-modules/README.md`
- Remove entries for EOS (02) and Productivity (08)
- Add entries for new nonprofit modules: Grants, Events, Board Reports, Data Health, Reconciliation, AI Agent Browse

### 7. `docs/03-development/README.md`
- Update project name and structure references

### 8. `docs/06-ai-features/README.md`
- Add documentation for AI Agent Browse system (teams, detail pages, presence indicators)

---

## New Files to CREATE

### 1. `docs/02-modules/10-nonprofit-operations.md`
- Document the nonprofit-specific modules: Grants, Events, Board Reports, Data Health, Reconciliation
- Cover demo data architecture (`nonprofitDemoData.ts`)
- Document role-based dashboards (Executive Director, Development Director, Finance Manager, Operations Manager)

### 2. `docs/02-modules/11-ai-agent-browse.md`
- Document the AI Agent Browse system: team config, browse page, detail page, dashboard card, presence indicators, contextual banners
- Reference `agentTeamConfig.ts` as single source of truth

---

## Summary

- **Delete 22 files** (6 root + 16 docs) — all stale/legacy
- **Update 7 files** — rebrand + remove old module references
- **Create 2 files** — document new nonprofit features and AI agent system
- **Keep** `docs/nonprofit-control-tower-roadmap.md` as the living roadmap

This gives you a clean, current doc set you can load into Claude for project management and decision-making.

