-- ============================================================================
-- Fix build errors and CRM integration: missing columns and missing tables
-- Idempotent: safe to run on DBs that already have some of these.
-- ============================================================================

-- ================================
-- 1. Add missing columns to existing tables
-- ================================

-- organization_integrations (may exist with different columns)
ALTER TABLE public.organization_integrations
  ADD COLUMN IF NOT EXISTS enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS connection_message TEXT,
  ADD COLUMN IF NOT EXISTS last_tested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS oauth_tokens JSONB,
  ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false;

-- integration_categories
ALTER TABLE public.integration_categories
  ADD COLUMN IF NOT EXISTS icon TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- integration_providers
ALTER TABLE public.integration_providers
  ADD COLUMN IF NOT EXISTS is_beta BOOLEAN DEFAULT false;

-- meetings (transcript status for fetch-zoom-transcript)
ALTER TABLE public.meetings
  ADD COLUMN IF NOT EXISTS transcript_status TEXT,
  ADD COLUMN IF NOT EXISTS transcript_error TEXT;

-- ================================
-- 2. Create integration_fields if not exists
-- ================================
CREATE TABLE IF NOT EXISTS public.integration_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.integration_providers(id) ON DELETE CASCADE,
  field_key TEXT NOT NULL,
  label TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'password', 'url', 'email', 'select', 'textarea')),
  placeholder TEXT,
  default_value TEXT,
  is_required BOOLEAN DEFAULT false,
  is_sensitive BOOLEAN DEFAULT false,
  help_text TEXT,
  validation_regex TEXT,
  select_options JSONB,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(provider_id, field_key)
);

CREATE INDEX IF NOT EXISTS idx_integration_fields_provider ON public.integration_fields(provider_id);
CREATE INDEX IF NOT EXISTS idx_integration_fields_display_order ON public.integration_fields(display_order);
ALTER TABLE public.integration_fields ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Fields are viewable by authenticated users" ON public.integration_fields;
CREATE POLICY "Fields are viewable by authenticated users"
  ON public.integration_fields FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins can manage fields" ON public.integration_fields;
CREATE POLICY "Admins can manage fields"
  ON public.integration_fields FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ================================
-- 3. Create integration_services if not exists
-- ================================
CREATE TABLE IF NOT EXISTS public.integration_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.integration_providers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  service_key TEXT NOT NULL,
  description TEXT,
  features JSONB,
  has_cost BOOLEAN DEFAULT false,
  cost_model JSONB,
  enabled BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  requires_config BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(provider_id, service_key)
);

CREATE INDEX IF NOT EXISTS idx_integration_services_provider ON public.integration_services(provider_id);
ALTER TABLE public.integration_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Services are viewable by authenticated users" ON public.integration_services;
CREATE POLICY "Services are viewable by authenticated users"
  ON public.integration_services FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins can manage services" ON public.integration_services;
CREATE POLICY "Admins can manage services"
  ON public.integration_services FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ================================
-- 4. Create integration_usage_logs if not exists
-- ================================
CREATE TABLE IF NOT EXISTS public.integration_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  provider_id UUID REFERENCES public.integration_providers(id) ON DELETE SET NULL,
  service_id UUID REFERENCES public.integration_services(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  status TEXT CHECK (status IN ('success', 'error', 'partial')) DEFAULT 'success',
  request_metadata JSONB,
  response_metadata JSONB,
  error_message TEXT,
  estimated_cost DECIMAL(10, 8) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_integration_usage_logs_provider ON public.integration_usage_logs(provider_id);
CREATE INDEX IF NOT EXISTS idx_integration_usage_logs_service ON public.integration_usage_logs(service_id);
CREATE INDEX IF NOT EXISTS idx_integration_usage_logs_user ON public.integration_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_integration_usage_logs_created_at ON public.integration_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_integration_usage_logs_org ON public.integration_usage_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_integration_usage_logs_status ON public.integration_usage_logs(status);
CREATE INDEX IF NOT EXISTS idx_integration_usage_logs_action ON public.integration_usage_logs(action);
ALTER TABLE public.integration_usage_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all usage logs" ON public.integration_usage_logs;
CREATE POLICY "Admins can view all usage logs"
  ON public.integration_usage_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Users can view their own usage logs" ON public.integration_usage_logs;
CREATE POLICY "Users can view their own usage logs"
  ON public.integration_usage_logs FOR SELECT TO authenticated
  USING (user_id = auth.uid());
DROP POLICY IF EXISTS "System can insert usage logs" ON public.integration_usage_logs;
CREATE POLICY "System can insert usage logs"
  ON public.integration_usage_logs FOR INSERT TO authenticated
  WITH CHECK (true);

-- ================================
-- 5. Trigger for integration_services.updated_at
-- ================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'set_updated_at') THEN
    DROP TRIGGER IF EXISTS set_integration_services_updated_at ON public.integration_services;
    CREATE TRIGGER set_integration_services_updated_at
      BEFORE UPDATE ON public.integration_services
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;
