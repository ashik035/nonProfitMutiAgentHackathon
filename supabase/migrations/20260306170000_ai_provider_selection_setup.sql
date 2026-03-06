-- ============================================================
-- AI Provider Selection Setup
-- Adds missing columns, creates ai_usage_logs, seeds Lovable AI
-- ============================================================

-- Add missing columns to ai_providers
ALTER TABLE public.ai_providers ADD COLUMN IF NOT EXISTS api_key_secret_name TEXT;

-- Add missing columns to ai_models (live schema was created without these)
ALTER TABLE public.ai_models ADD COLUMN IF NOT EXISTS context_window INTEGER DEFAULT 0;
ALTER TABLE public.ai_models ADD COLUMN IF NOT EXISTS embedding_cost_per_1k NUMERIC(10,6) DEFAULT 0;

-- Create ai_usage_logs if it doesn't exist
CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  model_id UUID REFERENCES public.ai_models(id) ON DELETE SET NULL,
  function_name TEXT NOT NULL,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  embedding_tokens INTEGER DEFAULT 0,
  estimated_cost NUMERIC(10,6) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own usage logs"
    ON public.ai_usage_logs FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "System can insert usage logs"
    ON public.ai_usage_logs FOR INSERT
    TO authenticated
    WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user ON public.ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_model ON public.ai_usage_logs(model_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_created_at ON public.ai_usage_logs(created_at);

-- ============================================================
-- Update api_key_secret_name for existing providers
-- ============================================================
UPDATE public.ai_providers SET api_key_secret_name = 'OPENAI_API_KEY'
  WHERE slug = 'openai' AND api_key_secret_name IS NULL;

UPDATE public.ai_providers SET api_key_secret_name = 'ANTHROPIC_API_KEY'
  WHERE slug = 'anthropic' AND api_key_secret_name IS NULL;

UPDATE public.ai_providers SET api_key_secret_name = 'GOOGLE_AI_API_KEY'
  WHERE slug = 'google' AND api_key_secret_name IS NULL;

UPDATE public.ai_providers SET api_key_secret_name = 'PERPLEXITY_API_KEY'
  WHERE slug = 'perplexity' AND api_key_secret_name IS NULL;

-- ============================================================
-- Seed Lovable AI as the default active provider
-- ============================================================
INSERT INTO public.ai_providers (name, slug, api_base_url, api_key_secret_name, is_active)
VALUES (
  'Lovable AI',
  'lovable',
  'https://ai.gateway.lovable.dev/v1',
  'LOVABLE_API_KEY',
  true
)
ON CONFLICT (slug) DO UPDATE SET
  api_base_url = EXCLUDED.api_base_url,
  api_key_secret_name = EXCLUDED.api_key_secret_name,
  is_active = true;

-- Deactivate all other providers (Lovable AI is the default)
UPDATE public.ai_providers SET is_active = false WHERE slug != 'lovable';

-- ============================================================
-- Seed Lovable AI models
-- ============================================================
DO $$
DECLARE
  lovable_id UUID;
BEGIN
  SELECT id INTO lovable_id FROM public.ai_providers WHERE slug = 'lovable';

  IF lovable_id IS NOT NULL THEN
    -- Clear existing default so we can set gemini-3-flash-preview as default
    UPDATE public.ai_models SET is_default = false WHERE category = 'chat';

    INSERT INTO public.ai_models (provider_id, name, model_id, category, context_window, input_cost_per_1k, output_cost_per_1k, enabled, is_default, features)
    SELECT lovable_id, 'Gemini Flash 3 Preview', 'google/gemini-3-flash-preview', 'chat', 128000, 0.0, 0.0, true, true,  '{"fast": true, "multimodal": true}'::jsonb
    WHERE NOT EXISTS (SELECT 1 FROM public.ai_models WHERE provider_id = lovable_id AND model_id = 'google/gemini-3-flash-preview');

    INSERT INTO public.ai_models (provider_id, name, model_id, category, context_window, input_cost_per_1k, output_cost_per_1k, enabled, is_default, features)
    SELECT lovable_id, 'Gemini 2.5 Flash', 'google/gemini-2.5-flash', 'chat', 200000, 0.0, 0.0, true, false, '{"fast": true, "multimodal": true, "vision": true}'::jsonb
    WHERE NOT EXISTS (SELECT 1 FROM public.ai_models WHERE provider_id = lovable_id AND model_id = 'google/gemini-2.5-flash');

    INSERT INTO public.ai_models (provider_id, name, model_id, category, context_window, input_cost_per_1k, output_cost_per_1k, enabled, is_default, features)
    SELECT lovable_id, 'GPT-5 mini', 'openai/gpt-5-mini', 'chat', 400000, 0.0, 0.0, true, false, '{"reasoning": true, "vision": true, "function_calling": true}'::jsonb
    WHERE NOT EXISTS (SELECT 1 FROM public.ai_models WHERE provider_id = lovable_id AND model_id = 'openai/gpt-5-mini');

    INSERT INTO public.ai_models (provider_id, name, model_id, category, context_window, input_cost_per_1k, output_cost_per_1k, enabled, is_default, features)
    SELECT lovable_id, 'Claude Haiku 4.5', 'anthropic/claude-haiku-4-5', 'chat', 200000, 0.0, 0.0, true, false, '{"fast": true, "vision": true}'::jsonb
    WHERE NOT EXISTS (SELECT 1 FROM public.ai_models WHERE provider_id = lovable_id AND model_id = 'anthropic/claude-haiku-4-5');
  END IF;
END $$;
