-- ============================================================================
-- Migration: Nonprofit Control Tower app_modules
-- Seeds all nonprofit page modules with defaults and page_route
-- Compatible with Lovable Cloud schema (no dependencies column)
-- ============================================================================

-- Widen category check to include 'nonprofit' (if constraint exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'app_modules_category_check'
      AND conrelid = 'public.app_modules'::regclass
  ) THEN
    ALTER TABLE public.app_modules DROP CONSTRAINT app_modules_category_check;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'app_modules_category_check'
      AND conrelid = 'public.app_modules'::regclass
  ) THEN
    ALTER TABLE public.app_modules
      ADD CONSTRAINT app_modules_category_check
      CHECK (category IN ('core', 'business', 'intelligence', 'operations', 'nonprofit'));
  END IF;
END $$;

-- Ensure optional columns exist (safe on all environments)
ALTER TABLE public.app_modules ADD COLUMN IF NOT EXISTS page_route TEXT;
ALTER TABLE public.app_modules ADD COLUMN IF NOT EXISTS category TEXT;

INSERT INTO public.app_modules (
  name, slug, description, icon, category, is_core, is_active, sort_order, page_route
) VALUES
  ('Dashboard', 'dashboard', 'Role-based executive and operations dashboards', 'LayoutDashboard', 'nonprofit', true, true, 100, '/dashboard'),
  ('AI Agents', 'ai-agents', 'Browse and run AI agent teams across fundraising, grants, and operations', 'Bot', 'nonprofit', true, true, 101, '/agents'),
  ('Board Reports', 'board-reports', 'Board-ready reporting and executive summaries', 'BarChart2', 'nonprofit', false, true, 102, '/board-reports'),
  ('Grants', 'grants', 'Grants pipeline, deadlines, and compliance tracking', 'FileText', 'nonprofit', false, true, 103, '/grants'),
  ('Donor Pipeline', 'donor-pipeline', 'Major gift pipeline and prospect management', 'Users', 'nonprofit', false, true, 104, '/donor-pipeline'),
  ('Data Health', 'data-health', 'CRM data quality monitoring and integrity checks', 'ShieldCheck', 'nonprofit', false, true, 105, '/data-health'),
  ('Reconciliation', 'reconciliation', 'Financial reconciliation and fund accounting', 'ArrowLeftRight', 'nonprofit', false, true, 106, '/reconciliation'),
  ('Events', 'events', 'Event lifecycle management, ticketing, and post-event intelligence', 'Calendar', 'nonprofit', false, true, 107, '/events'),
  ('Voice Notes', 'voice-notes', 'Capture and transcribe voice notes with AI action extraction', 'Mic', 'nonprofit', false, true, 108, '/voice-notes'),
  ('Integration Center', 'integration-center', 'Connect CRM, email, calendar, and accounting integrations', 'Plug', 'nonprofit', false, true, 109, '/integrations'),
  ('Donor Retention', 'donor-retention', 'Lapsed donor re-engagement and retention campaigns', 'Heart', 'nonprofit', false, false, 110, '/donor-retention'),
  ('Programs', 'programs', 'Program outcomes tracking and impact reporting', 'Target', 'nonprofit', false, false, 111, '/programs'),
  ('Membership', 'membership', 'Member directory, tiers, renewals, and onboarding', 'CreditCard', 'nonprofit', false, false, 112, '/membership'),
  ('Volunteers', 'volunteers', 'Volunteer roster, shift scheduling, and hour tracking', 'HandHeart', 'nonprofit', false, false, 113, '/volunteers'),
  ('Donations', 'donations', 'Donation center, campaigns, and gift tracking', 'BadgeDollarSign', 'nonprofit', false, false, 114, '/donations'),
  ('Communications', 'communications', 'Email campaigns, templates, and donor outreach', 'Mail', 'nonprofit', false, false, 115, '/communications'),
  ('Grant Writer', 'grant-writer', 'AI-assisted grant proposal drafting and review', 'PenTool', 'nonprofit', false, false, 116, '/grant-writer'),
  ('Impact Dashboard', 'impact-dashboard', 'Executive impact metrics and annual report generation', 'BarChart3', 'nonprofit', false, false, 117, '/impact-dashboard'),
  ('Public Presence', 'public-presence', 'Website layer, public pages, and brand presence settings', 'Globe', 'nonprofit', false, false, 118, '/public-presence'),
  ('Engagement Scoring', 'engagement-scoring', 'Member engagement scores and AI next-best-action recommendations', 'Sparkles', 'nonprofit', false, false, 119, '/engagement-scoring')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  category = EXCLUDED.category,
  is_core = EXCLUDED.is_core,
  is_active = EXCLUDED.is_active,
  page_route = EXCLUDED.page_route,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();
