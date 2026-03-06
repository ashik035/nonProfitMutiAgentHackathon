-- Add missing columns to ai_agent_runs to match application expectations.
-- The live table was created with JSONB input/output; we add TEXT columns for
-- readable context/response and operational metadata.

ALTER TABLE public.ai_agent_runs ADD COLUMN IF NOT EXISTS context         TEXT;
ALTER TABLE public.ai_agent_runs ADD COLUMN IF NOT EXISTS output_text     TEXT;
ALTER TABLE public.ai_agent_runs ADD COLUMN IF NOT EXISTS error_message   TEXT;
ALTER TABLE public.ai_agent_runs ADD COLUMN IF NOT EXISTS latency_ms      INTEGER;
ALTER TABLE public.ai_agent_runs ADD COLUMN IF NOT EXISTS token_metrics   JSONB;
ALTER TABLE public.ai_agent_runs ADD COLUMN IF NOT EXISTS provider_used   TEXT;
ALTER TABLE public.ai_agent_runs ADD COLUMN IF NOT EXISTS model_used      TEXT;
ALTER TABLE public.ai_agent_runs ADD COLUMN IF NOT EXISTS updated_at      TIMESTAMPTZ DEFAULT now();

-- Allow admins to update runs (needed when completing a run started by edge function)
DO $$ BEGIN
  CREATE POLICY "admin manage all runs"
    ON public.ai_agent_runs FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Allow service role updates (for edge function callbacks)
DO $$ BEGIN
  CREATE POLICY "user update own runs"
    ON public.ai_agent_runs FOR UPDATE
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
