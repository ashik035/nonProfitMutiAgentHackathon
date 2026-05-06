
-- Create nonprofit_role_permissions table
CREATE TABLE public.nonprofit_role_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_key TEXT NOT NULL,
  granted BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (role, resource_type, resource_key)
);

-- Enable RLS
ALTER TABLE public.nonprofit_role_permissions ENABLE ROW LEVEL SECURITY;

-- Everyone can read permissions (needed for client-side gating)
CREATE POLICY "Anyone can read permissions"
  ON public.nonprofit_role_permissions FOR SELECT
  USING (true);

-- Only admins can modify
CREATE POLICY "Admins can manage permissions"
  ON public.nonprofit_role_permissions FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed: Executive Director (full access)
INSERT INTO public.nonprofit_role_permissions (role, resource_type, resource_key) VALUES
  ('executive_director', 'module', 'data-health'),
  ('executive_director', 'module', 'grants'),
  ('executive_director', 'module', 'events'),
  ('executive_director', 'module', 'board-reports'),
  ('executive_director', 'module', 'reconciliation'),
  ('executive_director', 'module', 'donor-pipeline'),
  ('executive_director', 'module', 'business-dev'),
  ('executive_director', 'module', 'meetings'),
  ('executive_director', 'module', 'knowledge'),
  ('executive_director', 'module', 'actions'),
  ('executive_director', 'module', 'projects'),
  ('executive_director', 'module', 'ai-agents'),
  ('executive_director', 'module', 'ai-chat'),
  ('executive_director', 'module', 'voice-notes'),
  ('executive_director', 'agent', 'crm-data-integrity'),
  ('executive_director', 'agent', 'reconciliation-fund-accounting'),
  ('executive_director', 'agent', 'grant-compliance'),
  ('executive_director', 'agent', 'event-intelligence'),
  ('executive_director', 'agent', 'board-reporting'),
  ('executive_director', 'agent', 'quick-email'),
  ('executive_director', 'agent', 'deal-ai-chat'),
  ('executive_director', 'agent', 'upgrade-spotter'),
  ('executive_director', 'agent', 'event-converter'),
  ('executive_director', 'agent', 'meeting-summarizer'),
  ('executive_director', 'agent', 'action-extractor'),
  ('executive_director', 'agent', 'client-call-analyzer'),
  ('executive_director', 'agent', 'efficiency-analyzer'),
  ('executive_director', 'agent', 'pod-health'),
  ('executive_director', 'agent', 'project-analyst'),
  ('executive_director', 'agent', 'bug-feature-planner'),
  ('executive_director', 'agent', 'technical-planner'),
  ('executive_director', 'agent', 'grant-budget-watcher'),
  ('executive_director', 'agent', 'integration-health-monitor'),
  ('executive_director', 'agent', 'onboarding-checklist-ai'),

  ('development_director', 'module', 'business-dev'),
  ('development_director', 'module', 'meetings'),
  ('development_director', 'module', 'knowledge'),
  ('development_director', 'module', 'actions'),
  ('development_director', 'module', 'ai-agents'),
  ('development_director', 'module', 'ai-chat'),
  ('development_director', 'module', 'events'),
  ('development_director', 'module', 'grants'),
  ('development_director', 'module', 'donor-pipeline'),
  ('development_director', 'agent', 'quick-email'),
  ('development_director', 'agent', 'deal-ai-chat'),
  ('development_director', 'agent', 'upgrade-spotter'),
  ('development_director', 'agent', 'event-converter'),
  ('development_director', 'agent', 'meeting-summarizer'),
  ('development_director', 'agent', 'action-extractor'),
  ('development_director', 'agent', 'client-call-analyzer'),
  ('development_director', 'agent', 'event-intelligence'),
  ('development_director', 'agent', 'grant-compliance'),

  ('finance_manager', 'module', 'reconciliation'),
  ('finance_manager', 'module', 'meetings'),
  ('finance_manager', 'module', 'knowledge'),
  ('finance_manager', 'module', 'actions'),
  ('finance_manager', 'module', 'ai-agents'),
  ('finance_manager', 'module', 'ai-chat'),
  ('finance_manager', 'module', 'grants'),
  ('finance_manager', 'agent', 'reconciliation-fund-accounting'),
  ('finance_manager', 'agent', 'meeting-summarizer'),
  ('finance_manager', 'agent', 'action-extractor'),
  ('finance_manager', 'agent', 'grant-budget-watcher'),
  ('finance_manager', 'agent', 'grant-compliance'),

  ('operations_manager', 'module', 'data-health'),
  ('operations_manager', 'module', 'projects'),
  ('operations_manager', 'module', 'meetings'),
  ('operations_manager', 'module', 'knowledge'),
  ('operations_manager', 'module', 'actions'),
  ('operations_manager', 'module', 'ai-agents'),
  ('operations_manager', 'module', 'ai-chat'),
  ('operations_manager', 'agent', 'crm-data-integrity'),
  ('operations_manager', 'agent', 'project-analyst'),
  ('operations_manager', 'agent', 'bug-feature-planner'),
  ('operations_manager', 'agent', 'technical-planner'),
  ('operations_manager', 'agent', 'meeting-summarizer'),
  ('operations_manager', 'agent', 'action-extractor'),
  ('operations_manager', 'agent', 'efficiency-analyzer'),
  ('operations_manager', 'agent', 'pod-health'),
  ('operations_manager', 'agent', 'integration-health-monitor'),
  ('operations_manager', 'agent', 'onboarding-checklist-ai');
