
-- Final batch of missing columns and tables

-- project_client_access missing columns
ALTER TABLE public.project_client_access ADD COLUMN IF NOT EXISTS client_email TEXT;
ALTER TABLE public.project_client_access ADD COLUMN IF NOT EXISTS client_name TEXT;
ALTER TABLE public.project_client_access ADD COLUMN IF NOT EXISTS access_token TEXT;
ALTER TABLE public.project_client_access ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.project_client_access ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE public.project_client_access ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMPTZ;
ALTER TABLE public.project_client_access ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.project_client_access ADD COLUMN IF NOT EXISTS portal_sections JSONB DEFAULT '[]';
ALTER TABLE public.project_client_access ADD COLUMN IF NOT EXISTS can_comment BOOLEAN DEFAULT false;
ALTER TABLE public.project_client_access ADD COLUMN IF NOT EXISTS can_upload BOOLEAN DEFAULT false;
ALTER TABLE public.project_client_access ADD COLUMN IF NOT EXISTS can_approve BOOLEAN DEFAULT false;

-- ai_agents missing columns
ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS memory_enabled BOOLEAN DEFAULT false;

-- deals missing columns
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;

-- zoom_files missing columns
ALTER TABLE public.zoom_files ADD COLUMN IF NOT EXISTS has_embeddings BOOLEAN DEFAULT false;
ALTER TABLE public.zoom_files ADD COLUMN IF NOT EXISTS processing_status TEXT DEFAULT 'pending';
ALTER TABLE public.zoom_files ADD COLUMN IF NOT EXISTS file_name TEXT;
ALTER TABLE public.zoom_files ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- knowledge_files missing columns
ALTER TABLE public.knowledge_files ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.knowledge_files ADD COLUMN IF NOT EXISTS category_id UUID;
ALTER TABLE public.knowledge_files ADD COLUMN IF NOT EXISTS processing_error TEXT;
ALTER TABLE public.knowledge_files ADD COLUMN IF NOT EXISTS chunk_count INT DEFAULT 0;
ALTER TABLE public.knowledge_files ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ;
ALTER TABLE public.knowledge_files ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- system_settings table
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read sys_settings" ON public.system_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage sys_settings" ON public.system_settings FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- meetings missing columns
ALTER TABLE public.meetings ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.meetings ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE public.meetings ADD COLUMN IF NOT EXISTS sentiment_score NUMERIC(3,2);
ALTER TABLE public.meetings ADD COLUMN IF NOT EXISTS energy_level TEXT;
ALTER TABLE public.meetings ADD COLUMN IF NOT EXISTS project_name TEXT;

-- meeting_participants missing columns  
ALTER TABLE public.meeting_participants ADD COLUMN IF NOT EXISTS attendance_status TEXT;

-- deal follow-up columns
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ;
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS follow_up_status TEXT;
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS source TEXT;

-- ai_chat_history missing columns
ALTER TABLE public.ai_chat_history ADD COLUMN IF NOT EXISTS feedback TEXT;
ALTER TABLE public.ai_chat_history ADD COLUMN IF NOT EXISTS rating INT;
