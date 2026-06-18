-- Strategic Insights Generator (Lovable schema: model + metadata)
INSERT INTO public.ai_agents (
  name, slug, category, description, system_prompt, model, metadata,
  is_enabled, is_active, memory_enabled, avatar, welcome_message, conversation_starters
)
SELECT
  'Strategic Insights Generator',
  'strategic-insights',
  'executive',
  'RAG-powered grant intelligence and donor insights from the org knowledge base.',
  'You synthesize grant and donor strategic insights from retrieved knowledge base context with citations.',
  'claude-sonnet-4-20250514',
  '{"provider": "anthropic", "temperature": 0.25, "max_tokens": 3000}'::jsonb,
  true, true, true, '🧠',
  'I search your knowledge base and surface grant + donor intelligence.',
  '["Grant intelligence from our KB", "Donor insights with citations", "What should Development prioritize?"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.ai_agents WHERE slug = 'strategic-insights');
