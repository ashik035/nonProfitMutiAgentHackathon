
-- Core tables for SJ Control Tower codebase
-- Part 1: Foundation tables

CREATE TABLE IF NOT EXISTS public.app_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB DEFAULT 'null'::jsonb,
  category TEXT DEFAULT 'general',
  description TEXT,
  is_sensitive BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read app_config" ON public.app_config FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage app_config" ON public.app_config FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.app_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  page_route TEXT,
  icon TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_core BOOLEAN DEFAULT false,
  requires_feature_flag TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.app_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read app_modules" ON public.app_modules FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage app_modules" ON public.app_modules FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.user_module_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  module_id UUID REFERENCES public.app_modules(id) ON DELETE CASCADE NOT NULL,
  has_access BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, module_id)
);
ALTER TABLE public.user_module_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user read own perms" ON public.user_module_permissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "admin manage perms" ON public.user_module_permissions FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read depts" ON public.departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage depts" ON public.departments FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.employee_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  title TEXT,
  employment_type TEXT DEFAULT 'full_time',
  is_active BOOLEAN DEFAULT true,
  hire_date DATE,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.employee_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read emps" ON public.employee_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage emps" ON public.employee_profiles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  company TEXT,
  phone TEXT,
  status TEXT DEFAULT 'active',
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  data_source TEXT,
  external_id TEXT,
  external_url TEXT,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read clients" ON public.clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth insert clients" ON public.clients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth update clients" ON public.clients FOR UPDATE TO authenticated USING (true);
CREATE POLICY "admin delete clients" ON public.clients FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  title TEXT,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage contacts" ON public.contacts FOR ALL TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  value NUMERIC(12,2),
  stage TEXT DEFAULT 'lead',
  probability INT DEFAULT 0,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  expected_close_date DATE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage deals" ON public.deals FOR ALL TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  link TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user manage own notifs" ON public.notifications FOR ALL USING (auth.uid() = user_id);
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

CREATE TABLE IF NOT EXISTS public.meeting_series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  recurrence_rule TEXT,
  organizer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.meeting_series ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage series" ON public.meeting_series FOR ALL TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT,
  scheduled_at TIMESTAMPTZ,
  duration_minutes INT,
  status TEXT DEFAULT 'scheduled',
  meeting_type TEXT,
  provider TEXT,
  location TEXT,
  join_url TEXT,
  host_url TEXT,
  external_id TEXT,
  external_meeting_id TEXT,
  external_uuid TEXT,
  zoom_meeting_id TEXT,
  zoom_join_url TEXT,
  zoom_start_url TEXT,
  zoom_uuid TEXT,
  zoom_id TEXT,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  organizer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  project_id UUID,
  series_id UUID REFERENCES public.meeting_series(id) ON DELETE SET NULL,
  is_recurring BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage meetings" ON public.meetings FOR ALL TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.meeting_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE NOT NULL,
  content TEXT,
  summary TEXT,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.meeting_transcripts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage transcripts" ON public.meeting_transcripts FOR ALL TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.meeting_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  role TEXT DEFAULT 'attendee',
  rsvp_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.meeting_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage participants" ON public.meeting_participants FOR ALL TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.meeting_takeaways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'action_item',
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.meeting_takeaways ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage takeaways" ON public.meeting_takeaways FOR ALL TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.zoom_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE,
  file_url TEXT,
  file_type TEXT,
  file_size BIGINT,
  download_url TEXT,
  recording_type TEXT,
  status TEXT DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.zoom_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read zoom" ON public.zoom_files FOR SELECT TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.project_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#6B7280',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.project_statuses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read statuses" ON public.project_statuses FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage statuses" ON public.project_statuses FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT,
  description TEXT,
  status_id UUID REFERENCES public.project_statuses(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  source_deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  start_date DATE,
  end_date DATE,
  budget NUMERIC(12,2),
  currency TEXT DEFAULT 'USD',
  is_archived BOOLEAN DEFAULT false,
  external_id TEXT,
  external_provider TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage projects" ON public.projects FOR ALL TO authenticated USING (true);

ALTER TABLE public.meetings ADD CONSTRAINT meetings_project_fk FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo',
  priority TEXT DEFAULT 'medium',
  due_date DATE,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage tasks" ON public.tasks FOR ALL TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.task_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT,
  file_size BIGINT,
  file_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage attachments" ON public.task_attachments FOR ALL TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  status TEXT DEFAULT 'pending',
  completed_at TIMESTAMPTZ,
  sort_order INT DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage milestones" ON public.project_milestones FOR ALL TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, user_id)
);
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage proj members" ON public.project_members FOR ALL TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.project_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.project_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage proj comments" ON public.project_comments FOR ALL TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  storage_path TEXT,
  source TEXT DEFAULT 'upload',
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage proj files" ON public.project_files FOR ALL TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.project_billing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  billing_type TEXT DEFAULT 'fixed',
  rate NUMERIC(10,2),
  total_budget NUMERIC(12,2),
  invoiced_amount NUMERIC(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  payment_terms TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.project_billing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage proj billing" ON public.project_billing FOR ALL TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.project_risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  mitigation TEXT,
  reported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.project_risks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage proj risks" ON public.project_risks FOR ALL TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.project_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  invoice_number TEXT,
  amount NUMERIC(12,2) DEFAULT 0,
  status TEXT DEFAULT 'draft',
  due_date DATE,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.project_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage proj invoices" ON public.project_invoices FOR ALL TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.ai_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  api_base_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.ai_providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read ai_providers" ON public.ai_providers FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage ai_providers" ON public.ai_providers FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.ai_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  model_id TEXT NOT NULL,
  provider_id UUID REFERENCES public.ai_providers(id) ON DELETE CASCADE,
  category TEXT DEFAULT 'chat',
  enabled BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  input_cost_per_1k NUMERIC(10,6) DEFAULT 0,
  output_cost_per_1k NUMERIC(10,6) DEFAULT 0,
  features JSONB DEFAULT '{}',
  max_tokens INT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.ai_models ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read ai_models" ON public.ai_models FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage ai_models" ON public.ai_models FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.ai_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  system_prompt TEXT,
  model TEXT,
  tools JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read ai_agents" ON public.ai_agents FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage ai_agents" ON public.ai_agents FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.ai_agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.ai_agents(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'running',
  input JSONB DEFAULT '{}',
  output JSONB DEFAULT '{}',
  error TEXT,
  tokens_used INT DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.ai_agent_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user read own runs" ON public.ai_agent_runs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user create own runs" ON public.ai_agent_runs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admin read all runs" ON public.ai_agent_runs FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.ai_chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES public.ai_agents(id) ON DELETE SET NULL,
  session_id TEXT,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  model TEXT,
  tokens_used INT DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.ai_chat_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user manage own chat" ON public.ai_chat_history FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.integration_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.integration_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read int_cats" ON public.integration_categories FOR SELECT TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.integration_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  category_id UUID REFERENCES public.integration_categories(id) ON DELETE SET NULL,
  auth_type TEXT DEFAULT 'oauth2',
  config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.integration_providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read int_provs" ON public.integration_providers FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage int_provs" ON public.integration_providers FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.organization_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES public.integration_providers(id) ON DELETE CASCADE NOT NULL,
  connection_status TEXT DEFAULT 'disconnected',
  config JSONB DEFAULT '{}',
  credentials JSONB DEFAULT '{}',
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, provider_id)
);
ALTER TABLE public.organization_integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user manage own ints" ON public.organization_integrations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "admin view all ints" ON public.organization_integrations FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.pods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.pods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read pods" ON public.pods FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage pods" ON public.pods FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.pod_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pod_id UUID REFERENCES public.pods(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(pod_id, user_id)
);
ALTER TABLE public.pod_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read pod_members" ON public.pod_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage pod_members" ON public.pod_members FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.pod_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pod_id UUID REFERENCES public.pods(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES public.employee_profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  has_login BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  synced_from_hr BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.pod_employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read pod_emps" ON public.pod_employees FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage pod_emps" ON public.pod_employees FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.pod_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pod_id UUID REFERENCES public.pods(id) ON DELETE CASCADE NOT NULL,
  module_id UUID REFERENCES public.app_modules(id) ON DELETE CASCADE NOT NULL,
  has_access BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(pod_id, module_id)
);
ALTER TABLE public.pod_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read pod_perms" ON public.pod_permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage pod_perms" ON public.pod_permissions FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.employee_pods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pod_id UUID REFERENCES public.pods(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES public.employee_profiles(id) ON DELETE CASCADE NOT NULL,
  synced_from_hr BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(pod_id, employee_id)
);
ALTER TABLE public.employee_pods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read emp_pods" ON public.employee_pods FOR SELECT TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin read logs" ON public.activity_logs FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "auth insert logs" ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type TEXT DEFAULT 'general',
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user manage own feedback" ON public.feedback FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "admin view all feedback" ON public.feedback FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.knowledge_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  parent_id UUID,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.knowledge_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read kb_cats" ON public.knowledge_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage kb_cats" ON public.knowledge_categories FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.knowledge_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  category_id UUID REFERENCES public.knowledge_categories(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'draft',
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.knowledge_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read kb_entries" ON public.knowledge_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "user manage own kb" ON public.knowledge_entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "admin manage all kb" ON public.knowledge_entries FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.knowledge_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID REFERENCES public.knowledge_entries(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  storage_path TEXT,
  processing_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.knowledge_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage kb_files" ON public.knowledge_files FOR ALL TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.knowledge_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  source_type TEXT NOT NULL,
  config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.knowledge_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read kb_sources" ON public.knowledge_sources FOR SELECT TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.user_knowledge_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  storage_path TEXT,
  processing_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.user_knowledge_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user manage own ukf" ON public.user_knowledge_files FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.user_knowledge_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  source_type TEXT NOT NULL,
  config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.user_knowledge_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user manage own uks" ON public.user_knowledge_sources FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.unified_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  content TEXT,
  owner_type TEXT NOT NULL,
  owner_id UUID NOT NULL,
  source_type TEXT,
  source_id UUID,
  file_name TEXT,
  file_type TEXT,
  file_size BIGINT,
  storage_path TEXT,
  processing_status TEXT DEFAULT 'pending',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.unified_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user manage own udocs" ON public.unified_documents FOR ALL USING (owner_type = 'user' AND owner_id = auth.uid());
CREATE POLICY "admin manage all udocs" ON public.unified_documents FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE IF NOT EXISTS public.embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT,
  embedding vector(1536),
  source_type TEXT,
  source_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.embeddings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage embeddings" ON public.embeddings FOR ALL TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.mcp_servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  api_key TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.mcp_servers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read mcp" ON public.mcp_servers FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage mcp" ON public.mcp_servers FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.user_role_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'user',
  agency_role TEXT,
  is_eos_user BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_role_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user view own prefs" ON public.user_role_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user manage own prefs" ON public.user_role_preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "admin manage all prefs" ON public.user_role_preferences FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.user_microsoft_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  team_id TEXT NOT NULL,
  team_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, team_id)
);
ALTER TABLE public.user_microsoft_teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user manage own teams" ON public.user_microsoft_teams FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.user_microsoft_teams_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  team_id TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  channel_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, team_id, channel_id)
);
ALTER TABLE public.user_microsoft_teams_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user manage own channels" ON public.user_microsoft_teams_channels FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.processing_queue_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_type TEXT,
  status TEXT DEFAULT 'pending',
  input JSONB DEFAULT '{}',
  output JSONB DEFAULT '{}',
  error TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.processing_queue_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin read queue" ON public.processing_queue_history FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.vector_search_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  query TEXT,
  results_count INT DEFAULT 0,
  latency_ms INT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.vector_search_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin read search_logs" ON public.vector_search_logs FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.project_statuses (name, slug, color, sort_order, is_default) VALUES
  ('Planning', 'planning', '#6B7280', 1, true),
  ('In Progress', 'in-progress', '#3B82F6', 2, false),
  ('On Hold', 'on-hold', '#F59E0B', 3, false),
  ('Completed', 'completed', '#10B981', 4, false),
  ('Cancelled', 'cancelled', '#EF4444', 5, false);
