INSERT INTO public.ai_agents (
  name, slug, category, description, system_prompt, provider_config,
  required_role, is_enabled, memory_enabled, avatar, welcome_message, conversation_starters
)
SELECT
  'Executive Daily Briefer',
  'executive-daily-briefer',
  'nonprofit-ops',
  'Morning briefing for the Executive Director — what needs attention today.',
  'You aggregate grants, board actions, donor risk, and operations into a concise ED morning briefing.',
  '{"provider": "openai", "model": "gpt-4o", "temperature": 0.3, "max_tokens": 2000}'::jsonb,
  'user', true, false, '☀️',
  'I prepare your morning briefing — grants, donors, board actions, and priorities.',
  '["What needs my attention today?", "Morning briefing", "Top 3 priorities for the ED"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.ai_agents WHERE slug = 'executive-daily-briefer');

INSERT INTO public.ai_agents (
  name, slug, category, description, system_prompt, provider_config,
  required_role, is_enabled, memory_enabled, avatar, welcome_message, conversation_starters
)
SELECT
  'Donor Churn Risk Detector',
  'donor-churn-risk',
  'nonprofit-ops',
  'Flags at-risk donors from giving history with risk scores and outreach recommendations.',
  'You analyze donor giving patterns and flag churn risk with actionable outreach recommendations.',
  '{"provider": "anthropic", "model": "claude-sonnet-4-20250514", "temperature": 0.2, "max_tokens": 3000}'::jsonb,
  'user', true, false, '💝',
  'I detect donors at risk of lapsing and recommend outreach.',
  '["Who is at risk of churning?", "High-risk major donors", "Revenue at risk"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.ai_agents WHERE slug = 'donor-churn-risk');
