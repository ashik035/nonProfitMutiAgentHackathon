
-- Additional missing tables and columns

-- meeting_action_items
CREATE TABLE IF NOT EXISTS public.meeting_action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'open',
  due_date DATE,
  priority TEXT DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.meeting_action_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage action_items" ON public.meeting_action_items FOR ALL TO authenticated USING (true);

-- project_backups
CREATE TABLE IF NOT EXISTS public.project_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  backup_data JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.project_backups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage backups" ON public.project_backups FOR ALL TO authenticated USING (true);

-- ai_agent_categories
CREATE TABLE IF NOT EXISTS public.ai_agent_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  icon TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.ai_agent_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read agent_cats" ON public.ai_agent_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage agent_cats" ON public.ai_agent_categories FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- meeting_files
CREATE TABLE IF NOT EXISTS public.meeting_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  storage_path TEXT,
  source TEXT DEFAULT 'upload',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.meeting_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage meeting_files" ON public.meeting_files FOR ALL TO authenticated USING (true);

-- Add missing columns to app_modules
ALTER TABLE public.app_modules ADD COLUMN IF NOT EXISTS category TEXT;

-- Add missing columns to ai_models
ALTER TABLE public.ai_models ADD COLUMN IF NOT EXISTS context_window INT;
ALTER TABLE public.ai_models ADD COLUMN IF NOT EXISTS embedding_cost_per_1k NUMERIC(10,6) DEFAULT 0;

-- Add missing columns to ai_agents
ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.ai_agent_categories(id) ON DELETE SET NULL;

-- Add missing columns to ai_agent_runs
ALTER TABLE public.ai_agent_runs ADD COLUMN IF NOT EXISTS error_message TEXT;
ALTER TABLE public.ai_agent_runs ADD COLUMN IF NOT EXISTS latency_ms INT;
ALTER TABLE public.ai_agent_runs ADD COLUMN IF NOT EXISTS context JSONB DEFAULT '{}';
ALTER TABLE public.ai_agent_runs ADD COLUMN IF NOT EXISTS token_metrics JSONB DEFAULT '{}';
ALTER TABLE public.ai_agent_runs ADD COLUMN IF NOT EXISTS model TEXT;
ALTER TABLE public.ai_agent_runs ADD COLUMN IF NOT EXISTS trigger_type TEXT;
ALTER TABLE public.ai_agent_runs ADD COLUMN IF NOT EXISTS run_type TEXT;
ALTER TABLE public.ai_agent_runs ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add missing columns to pods
ALTER TABLE public.pods ADD COLUMN IF NOT EXISTS show_in_resource_projection BOOLEAN DEFAULT true;

-- meeting_agenda_items
CREATE TABLE IF NOT EXISTS public.meeting_agenda_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INT,
  sort_order INT DEFAULT 0,
  presenter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.meeting_agenda_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage agenda" ON public.meeting_agenda_items FOR ALL TO authenticated USING (true);

-- meeting_summary_notes
CREATE TABLE IF NOT EXISTS public.meeting_summary_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE NOT NULL,
  content TEXT,
  note_type TEXT DEFAULT 'summary',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.meeting_summary_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage summary_notes" ON public.meeting_summary_notes FOR ALL TO authenticated USING (true);

-- meeting_templates
CREATE TABLE IF NOT EXISTS public.meeting_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  default_duration INT DEFAULT 60,
  agenda_template JSONB DEFAULT '[]',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.meeting_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage templates" ON public.meeting_templates FOR ALL TO authenticated USING (true);

-- meeting_rules
CREATE TABLE IF NOT EXISTS public.meeting_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  rule_type TEXT,
  conditions JSONB DEFAULT '{}',
  actions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.meeting_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage rules" ON public.meeting_rules FOR ALL TO authenticated USING (true);

-- lead follow-up tables
CREATE TABLE IF NOT EXISTS public.follow_up_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  next_action TEXT,
  next_action_date DATE,
  notes TEXT,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.follow_up_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage followups" ON public.follow_up_leads FOR ALL TO authenticated USING (true);

-- meeting_issues (for meeting issue extraction)
CREATE TABLE IF NOT EXISTS public.meeting_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.meeting_issues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage meeting_issues" ON public.meeting_issues FOR ALL TO authenticated USING (true);

-- project_checklists
CREATE TABLE IF NOT EXISTS public.project_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.project_checklists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage checklists" ON public.project_checklists FOR ALL TO authenticated USING (true);

-- project_concerns
CREATE TABLE IF NOT EXISTS public.project_concerns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  raised_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.project_concerns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage concerns" ON public.project_concerns FOR ALL TO authenticated USING (true);

-- Add created_at to zoom_files (if missing)
ALTER TABLE public.zoom_files ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now() NOT NULL;
