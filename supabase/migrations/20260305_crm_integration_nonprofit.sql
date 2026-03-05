-- ============================================================================
-- CRM Integration: Nonprofit CRM providers, data_source enum, crm_sync_logs
-- ============================================================================

-- ================================
-- 1. Create or extend data_source_type enum
-- If 20260225_data_source_tracking was not run, the type may not exist.
-- Create it with all values; otherwise add only the new nonprofit CRM values.
-- ================================
DO $$
BEGIN
  CREATE TYPE public.data_source_type AS ENUM (
    'manual',
    'hubspot',
    'salesforce',
    'zoho',
    'pipedrive',
    'blackbaud',
    'bloomerang',
    'neon',
    'virtuous',
    'donorperfect',
    'kindful'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TYPE public.data_source_type ADD VALUE 'blackbaud';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
  ALTER TYPE public.data_source_type ADD VALUE 'bloomerang';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
  ALTER TYPE public.data_source_type ADD VALUE 'neon';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
  ALTER TYPE public.data_source_type ADD VALUE 'virtuous';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
  ALTER TYPE public.data_source_type ADD VALUE 'donorperfect';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
  ALTER TYPE public.data_source_type ADD VALUE 'kindful';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ================================
-- 2. Add external_lead_id to lead_followup_contacts (if table exists)
-- ================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'lead_followup_contacts'
  ) THEN
    ALTER TABLE public.lead_followup_contacts
      ADD COLUMN IF NOT EXISTS external_lead_id TEXT,
      ADD COLUMN IF NOT EXISTS external_url TEXT,
      ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ;
    CREATE INDEX IF NOT EXISTS idx_lead_followup_contacts_external_lead_id
      ON public.lead_followup_contacts(external_lead_id) WHERE external_lead_id IS NOT NULL;
  END IF;
END $$;

-- ================================
-- 2b. Ensure integration_categories has enabled, display_order (for /admin/integrations)
-- ================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'integration_categories'
  ) THEN
    ALTER TABLE public.integration_categories
      ADD COLUMN IF NOT EXISTS enabled BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
    UPDATE public.integration_categories SET enabled = true WHERE enabled IS NULL;
  END IF;
END $$;

-- ================================
-- 3. crm_sync_logs table
-- ================================
CREATE TABLE IF NOT EXISTS public.crm_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_integration_id UUID NOT NULL REFERENCES public.organization_integrations(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('contacts', 'leads', 'deals', 'activities')),
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'partial')),
  message TEXT,
  records_processed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_sync_logs_org_integration ON public.crm_sync_logs(organization_integration_id);
CREATE INDEX IF NOT EXISTS idx_crm_sync_logs_created_at ON public.crm_sync_logs(created_at DESC);

ALTER TABLE public.crm_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view crm_sync_logs"
  ON public.crm_sync_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service can insert crm_sync_logs"
  ON public.crm_sync_logs FOR INSERT TO authenticated
  WITH CHECK (true);

-- ================================
-- 4. Ensure integration_providers has columns used by seed (if table exists)
-- ================================
ALTER TABLE public.integration_providers
  ADD COLUMN IF NOT EXISTS oauth_config JSONB,
  ADD COLUMN IF NOT EXISTS docs_url TEXT,
  ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_coming_soon BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- ================================
-- 5. Seed nonprofit CRM providers (CRM Systems category)
-- ================================
INSERT INTO public.integration_providers (
  category_id, name, slug, description, auth_type, oauth_config, docs_url, is_available, is_coming_soon, display_order
)
SELECT
  (SELECT id FROM public.integration_categories WHERE slug = 'crm-systems' LIMIT 1),
  'Salesforce Nonprofit Cloud (NPSP)',
  'salesforce-npsp',
  'Nonprofit Success Pack for donor and program management',
  'oauth2',
  '{"authorize_url": "https://login.salesforce.com/services/oauth2/authorize", "token_url": "https://login.salesforce.com/services/oauth2/token", "scopes": ["api", "refresh_token", "offline_access"]}'::jsonb,
  'https://developer.salesforce.com/docs/atlas.en-us.npsp.meta/npsp',
  true,
  false,
  15
WHERE NOT EXISTS (SELECT 1 FROM public.integration_providers WHERE slug = 'salesforce-npsp');

INSERT INTO public.integration_providers (
  category_id, name, slug, description, auth_type, docs_url, is_available, is_coming_soon, display_order
)
SELECT
  (SELECT id FROM public.integration_categories WHERE slug = 'crm-systems' LIMIT 1),
  'Blackbaud Raiser''s Edge NXT',
  'blackbaud-raiser-edge',
  'Fundraising and donor management for nonprofits',
  'oauth2',
  'https://developer.blackbaud.com/apis/raiser-s-edge-nxt',
  true,
  false,
  25
WHERE NOT EXISTS (SELECT 1 FROM public.integration_providers WHERE slug = 'blackbaud-raiser-edge');

INSERT INTO public.integration_providers (
  category_id, name, slug, description, auth_type, docs_url, is_available, is_coming_soon, display_order
)
SELECT
  (SELECT id FROM public.integration_categories WHERE slug = 'crm-systems' LIMIT 1),
  'Bloomerang',
  'bloomerang',
  'Donor retention and engagement platform',
  'api_key',
  'https://bloomerang.co/product/integrations/',
  true,
  false,
  35
WHERE NOT EXISTS (SELECT 1 FROM public.integration_providers WHERE slug = 'bloomerang');

INSERT INTO public.integration_providers (
  category_id, name, slug, description, auth_type, docs_url, is_available, is_coming_soon, display_order
)
SELECT
  (SELECT id FROM public.integration_categories WHERE slug = 'crm-systems' LIMIT 1),
  'Neon CRM',
  'neon-crm',
  'Nonprofit CRM for membership and fundraising',
  'api_key',
  'https://help.z2systems.com/neon-crm-api/',
  true,
  false,
  45
WHERE NOT EXISTS (SELECT 1 FROM public.integration_providers WHERE slug = 'neon-crm');

INSERT INTO public.integration_providers (
  category_id, name, slug, description, auth_type, docs_url, is_available, is_coming_soon, display_order
)
SELECT
  (SELECT id FROM public.integration_categories WHERE slug = 'crm-systems' LIMIT 1),
  'Virtuous',
  'virtuous',
  'Generous giving platform for nonprofits',
  'api_key',
  'https://developers.virtuous.io/',
  true,
  false,
  55
WHERE NOT EXISTS (SELECT 1 FROM public.integration_providers WHERE slug = 'virtuous');

INSERT INTO public.integration_providers (
  category_id, name, slug, description, auth_type, docs_url, is_available, is_coming_soon, display_order
)
SELECT
  (SELECT id FROM public.integration_categories WHERE slug = 'crm-systems' LIMIT 1),
  'DonorPerfect',
  'donorperfect',
  'Fundraising and donor management software',
  'api_key',
  'https://www.donorperfect.com/product/integrations/',
  true,
  false,
  65
WHERE NOT EXISTS (SELECT 1 FROM public.integration_providers WHERE slug = 'donorperfect');

INSERT INTO public.integration_providers (
  category_id, name, slug, description, auth_type, oauth_config, docs_url, is_available, is_coming_soon, display_order
)
SELECT
  (SELECT id FROM public.integration_categories WHERE slug = 'crm-systems' LIMIT 1),
  'HubSpot (Nonprofit)',
  'hubspot-nonprofit',
  'Marketing and CRM for nonprofits',
  'oauth2',
  '{"authorize_url": "https://app.hubspot.com/oauth/authorize", "token_url": "https://api.hubapi.com/oauth/v1/token", "scopes": ["crm.objects.contacts.read", "crm.objects.contacts.write", "crm.objects.deals.read", "crm.objects.deals.write"]}'::jsonb,
  'https://developers.hubspot.com/docs/api/overview',
  true,
  false,
  75
WHERE NOT EXISTS (SELECT 1 FROM public.integration_providers WHERE slug = 'hubspot-nonprofit');

INSERT INTO public.integration_providers (
  category_id, name, slug, description, auth_type, docs_url, is_available, is_coming_soon, display_order
)
SELECT
  (SELECT id FROM public.integration_categories WHERE slug = 'crm-systems' LIMIT 1),
  'Kindful (Bloomerang)',
  'kindful',
  'Donor management, now part of Bloomerang ecosystem',
  'api_key',
  'https://developers.bloomerang.co/',
  true,
  false,
  85
WHERE NOT EXISTS (SELECT 1 FROM public.integration_providers WHERE slug = 'kindful');

-- ================================
-- 6. Integration fields for API-key CRM providers (if table exists)
-- ================================
DO $$
DECLARE
  rec RECORD;
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'integration_fields'
  ) THEN
    FOR rec IN SELECT id FROM public.integration_providers WHERE slug IN ('bloomerang', 'neon-crm', 'virtuous', 'donorperfect', 'kindful')
    LOOP
      INSERT INTO public.integration_fields (provider_id, field_key, label, field_type, placeholder, is_required, is_sensitive, help_text, display_order)
      SELECT rec.id, 'api_key', 'API Key', 'password', 'Your API key', true, true, 'Store in organization integration config', 10
      WHERE NOT EXISTS (SELECT 1 FROM public.integration_fields WHERE provider_id = rec.id AND field_key = 'api_key');
    END LOOP;
  END IF;
END $$;

COMMENT ON TABLE public.crm_sync_logs IS 'Logs for CRM sync runs; used for troubleshooting and sync status UI';
