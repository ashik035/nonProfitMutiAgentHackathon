-- Executive Daily Briefer + Donor Churn Risk (Lovable schema: model + metadata)
INSERT INTO public.ai_agents (
  name, slug, category, description, system_prompt, model, metadata,
  is_enabled, is_active, memory_enabled, avatar, welcome_message, conversation_starters
)
SELECT
  'Executive Daily Briefer',
  'executive-daily-briefer',
  'executive',
  'Morning briefing for the Executive Director — what needs attention today.',
  'You aggregate grants, board actions, donor risk, and operations into a concise ED morning briefing.',
  'gpt-4o',
  '{"provider": "openai", "temperature": 0.3, "max_tokens": 2000}'::jsonb,
  true, true, false, '☀️',
  'I prepare your morning briefing — grants, donors, board actions, and priorities.',
  '["What needs my attention today?", "Morning briefing", "Top 3 priorities for the ED"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.ai_agents WHERE slug = 'executive-daily-briefer');

INSERT INTO public.ai_agents (
  name, slug, category, description, system_prompt, model, metadata,
  is_enabled, is_active, memory_enabled, avatar, welcome_message, conversation_starters
)
SELECT
  'Donor Churn Risk Detector',
  'donor-churn-risk',
  'fundraising',
  'Flags at-risk donors from giving history with risk scores and outreach recommendations.',
  'You analyze donor giving patterns and flag churn risk with actionable outreach recommendations.',
  'claude-sonnet-4-20250514',
  '{"provider": "anthropic", "temperature": 0.2, "max_tokens": 3000}'::jsonb,
  true, true, false, '💝',
  'I detect donors at risk of lapsing and recommend outreach.',
  '["Who is at risk of churning?", "High-risk major donors", "Revenue at risk"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.ai_agents WHERE slug = 'donor-churn-risk');
