-- Seed Action Item Tracker agent (Lovable schema: model + metadata, no provider_config)
INSERT INTO public.ai_agents (
  name,
  slug,
  category,
  description,
  system_prompt,
  model,
  metadata,
  is_enabled,
  is_active,
  memory_enabled,
  avatar,
  welcome_message,
  conversation_starters
)
SELECT
  'Action Item Tracker',
  'action-item-tracker',
  'meetings',
  'Tracks board pending actions, flags overdue and blocked items with recommended next steps.',
  'You are an operations analyst for a nonprofit board. Track pending action items, flag overdue and blocked work, and recommend the single highest-priority next step.',
  'gpt-4o',
  '{"provider": "openai", "temperature": 0.2, "max_tokens": 2500}'::jsonb,
  true,
  true,
  false,
  '📋',
  'I track board action items and flag what needs attention today.',
  '["What board actions are overdue?", "Show blocked items", "What should the ED do first?"]'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM public.ai_agents WHERE slug = 'action-item-tracker'
);

-- Meeting Summarizer (DB slug used by edge function meeting-summarizer)
INSERT INTO public.ai_agents (
  name,
  slug,
  category,
  description,
  system_prompt,
  model,
  metadata,
  is_enabled,
  is_active,
  memory_enabled,
  avatar,
  welcome_message,
  conversation_starters
)
SELECT
  'Meeting Summarizer',
  'meeting-summarizer',
  'meetings',
  'Generates structured board minutes from meeting transcripts — decisions, action items, attendance, and key discussion points.',
  'You are an expert meeting summarizer for a nonprofit board. Given a meeting transcript, produce structured minutes with decisions, action items, attendance, and key discussion points.',
  'claude-sonnet-4-20250514',
  '{"provider": "anthropic", "temperature": 0.2, "max_tokens": 3000}'::jsonb,
  true,
  true,
  false,
  '📝',
  'Paste a board transcript and I will generate structured minutes in seconds.',
  '["Summarize my board meeting", "Extract action items", "What were the key decisions?"]'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM public.ai_agents WHERE slug = 'meeting-summarizer'
);
