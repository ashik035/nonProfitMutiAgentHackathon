-- Migration: Phase 2 — Remove remaining SJ-internal tables
-- Drops deal pipeline comments, project budget tracking, automation/sync tables,
-- and misc SJ-internal tables that nonprofits don't need.

-- ============================================================================
-- Group 1: Deal Pipeline (HubSpot-tied comment/checklist tables)
-- Note: The "deals" and "deal_activities" tables are KEPT for CRM pipeline.
-- ============================================================================

DROP TABLE IF EXISTS public.deal_comments CASCADE;
DROP TABLE IF EXISTS public.deal_checklist CASCADE;
DROP TABLE IF EXISTS public.checklist_templates CASCADE;

-- ============================================================================
-- Group 2: Project Budget (SJ-specific tracking, PascalCase tables)
-- Note: The "projects" and "project_milestones" tables are KEPT.
-- ============================================================================

DROP TABLE IF EXISTS public."ProjectBudget" CASCADE;
DROP TABLE IF EXISTS public."ProjectBudgetReport" CASCADE;
DROP TABLE IF EXISTS public."ProjectCount" CASCADE;
DROP TABLE IF EXISTS public.projections CASCADE;

-- ============================================================================
-- Group 3: Automation & Sync (n8n/HubSpot/ActiveCollab)
-- ============================================================================

DROP TABLE IF EXISTS public.automation_mappings CASCADE;
DROP TABLE IF EXISTS public.automation_logs CASCADE;
DROP TABLE IF EXISTS public.resource_sync_status CASCADE;
DROP TABLE IF EXISTS public.hubspot_sync_status CASCADE;
DROP TABLE IF EXISTS public.project_sync_status CASCADE;

-- ============================================================================
-- Group 4: Misc SJ-Internal
-- ============================================================================

DROP TABLE IF EXISTS public.changelog CASCADE;
DROP TABLE IF EXISTS public.permission_conflicts CASCADE;
