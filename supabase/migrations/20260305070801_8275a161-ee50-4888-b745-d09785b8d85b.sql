
-- Add remaining missing columns and tables

ALTER TABLE public.ai_agent_categories ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;
ALTER TABLE public.ai_agent_categories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now() NOT NULL;

ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS is_enabled BOOLEAN DEFAULT true;

ALTER TABLE public.ai_agent_runs ADD COLUMN IF NOT EXISTS provider_used TEXT;
ALTER TABLE public.ai_agent_runs ADD COLUMN IF NOT EXISTS model_used TEXT;
ALTER TABLE public.ai_agent_runs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now() NOT NULL;

ALTER TABLE public.meeting_action_items ADD COLUMN IF NOT EXISTS text TEXT;
ALTER TABLE public.meeting_action_items ADD COLUMN IF NOT EXISTS assignee_email TEXT;
ALTER TABLE public.meeting_action_items ADD COLUMN IF NOT EXISTS task_id UUID;
ALTER TABLE public.meeting_action_items ADD COLUMN IF NOT EXISTS extraction_confidence NUMERIC(5,4);
ALTER TABLE public.meeting_action_items ADD COLUMN IF NOT EXISTS extracted_from_transcript BOOLEAN DEFAULT false;

ALTER TABLE public.pods ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.project_client_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  access_level TEXT DEFAULT 'view',
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(project_id, client_id)
);
ALTER TABLE public.project_client_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage client_access" ON public.project_client_access FOR ALL TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.meeting_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  attended BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.meeting_attendees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage attendees" ON public.meeting_attendees FOR ALL TO authenticated USING (true);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
