-- Phase 2: Remove remaining SJ-internal tables
DROP TABLE IF EXISTS public.deal_comments CASCADE;
DROP TABLE IF EXISTS public.deal_checklist CASCADE;
DROP TABLE IF EXISTS public.checklist_templates CASCADE;
DROP TABLE IF EXISTS public."ProjectBudget" CASCADE;
DROP TABLE IF EXISTS public."ProjectBudgetReport" CASCADE;
DROP TABLE IF EXISTS public."ProjectCount" CASCADE;
DROP TABLE IF EXISTS public.projections CASCADE;
DROP TABLE IF EXISTS public.automation_mappings CASCADE;
DROP TABLE IF EXISTS public.automation_logs CASCADE;
DROP TABLE IF EXISTS public.resource_sync_status CASCADE;
DROP TABLE IF EXISTS public.hubspot_sync_status CASCADE;
DROP TABLE IF EXISTS public.project_sync_status CASCADE;
DROP TABLE IF EXISTS public.changelog CASCADE;
DROP TABLE IF EXISTS public.permission_conflicts CASCADE;