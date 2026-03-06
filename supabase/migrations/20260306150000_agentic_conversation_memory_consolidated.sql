-- =============================================
-- Agentic Framework: Conversation + Memory Tables (Consolidated)
-- Creates: update_updated_at_column, agent_conversations, agent_messages,
--          user_agent_personalizations, agent_memories, user_preferences,
--          agent_learning_events, helper functions, triggers, views.
-- Requires: ai_agents table, auth.users, pgvector extension.
-- =============================================

-- 1. Trigger function for updated_at (prerequisite for all timestamp triggers)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 2. ai_agents: add conversation columns if missing
ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS avatar VARCHAR(255);
ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS welcome_message TEXT;
ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS conversation_starters JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false;
ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0;

-- 3. agent_conversations
CREATE TABLE IF NOT EXISTS public.agent_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  summary TEXT,
  is_archived BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  message_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_conversations_agent_user ON public.agent_conversations(agent_id, user_id);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_user ON public.agent_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_created_at ON public.agent_conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_last_message ON public.agent_conversations(last_message_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_archived ON public.agent_conversations(user_id, is_archived) WHERE is_archived = false;

ALTER TABLE public.agent_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations" ON public.agent_conversations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create conversations" ON public.agent_conversations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own conversations" ON public.agent_conversations FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own conversations" ON public.agent_conversations FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all conversations" ON public.agent_conversations FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 4. agent_messages
CREATE TABLE IF NOT EXISTS public.agent_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.agent_conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
  content TEXT NOT NULL,
  model_used VARCHAR(100),
  provider_used VARCHAR(50),
  tokens_input INTEGER,
  tokens_output INTEGER,
  latency_ms INTEGER,
  tool_calls JSONB,
  tool_results JSONB,
  citations JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_messages ADD COLUMN IF NOT EXISTS is_streaming BOOLEAN DEFAULT false;
ALTER TABLE public.agent_messages ADD COLUMN IF NOT EXISTS stream_completed_at TIMESTAMPTZ;
ALTER TABLE public.agent_messages ADD COLUMN IF NOT EXISTS tool_call_status VARCHAR(20);

CREATE INDEX IF NOT EXISTS idx_agent_messages_conversation ON public.agent_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_agent_messages_created_at ON public.agent_messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_agent_messages_role ON public.agent_messages(conversation_id, role);

ALTER TABLE public.agent_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their conversations" ON public.agent_messages FOR SELECT TO authenticated
  USING (conversation_id IN (SELECT id FROM public.agent_conversations WHERE user_id = auth.uid()));
CREATE POLICY "Users can create messages in their conversations" ON public.agent_messages FOR INSERT TO authenticated
  WITH CHECK (conversation_id IN (SELECT id FROM public.agent_conversations WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete messages in their conversations" ON public.agent_messages FOR DELETE TO authenticated
  USING (conversation_id IN (SELECT id FROM public.agent_conversations WHERE user_id = auth.uid()));
CREATE POLICY "Admins can view all messages" ON public.agent_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 5. user_agent_personalizations
CREATE TABLE IF NOT EXISTS public.user_agent_personalizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT true,
  additional_prompt TEXT,
  attached_knowledge_files UUID[],
  use_all_knowledge BOOLEAN DEFAULT false,
  max_context_files INTEGER DEFAULT 5,
  relevance_threshold NUMERIC DEFAULT 0.7,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, agent_id)
);

CREATE INDEX IF NOT EXISTS idx_user_agent_personalizations_user ON public.user_agent_personalizations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_agent_personalizations_agent ON public.user_agent_personalizations(agent_id);
CREATE INDEX IF NOT EXISTS idx_user_agent_personalizations_enabled ON public.user_agent_personalizations(is_enabled);

ALTER TABLE public.user_agent_personalizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own personalizations" ON public.user_agent_personalizations FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own personalizations" ON public.user_agent_personalizations FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own personalizations" ON public.user_agent_personalizations FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete their own personalizations" ON public.user_agent_personalizations FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all personalizations" ON public.user_agent_personalizations FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 6. agent_memories (user_id -> auth.users for RLS)
CREATE TABLE IF NOT EXISTS public.agent_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  memory_type TEXT NOT NULL,
  memory_category TEXT,
  content TEXT NOT NULL,
  summary TEXT,
  embedding vector(1536),
  source_type TEXT,
  source_id UUID,
  importance_score FLOAT DEFAULT 0.5,
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  consolidated BOOLEAN DEFAULT FALSE,
  superseded_by UUID REFERENCES public.agent_memories(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_memories_agent_id ON public.agent_memories(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_memories_user_id ON public.agent_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_memories_type ON public.agent_memories(memory_type);
CREATE INDEX IF NOT EXISTS idx_agent_memories_category ON public.agent_memories(memory_category);
CREATE INDEX IF NOT EXISTS idx_agent_memories_importance ON public.agent_memories(importance_score DESC);
CREATE INDEX IF NOT EXISTS idx_agent_memories_active ON public.agent_memories(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_agent_memories_created_at ON public.agent_memories(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_agent_memories_embedding ON public.agent_memories USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

ALTER TABLE public.agent_memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their agent memories" ON public.agent_memories FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can view all agent memories" ON public.agent_memories FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));
CREATE POLICY "System can manage agent memories" ON public.agent_memories FOR ALL USING (user_id = auth.uid());

-- 7. user_preferences (user_id -> auth.users)
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.ai_agents(id) ON DELETE SET NULL,
  preference_key TEXT NOT NULL,
  preference_value JSONB NOT NULL,
  learned_from TEXT,
  confidence_score FLOAT DEFAULT 0.5,
  evidence_count INTEGER DEFAULT 1,
  times_used INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, agent_id, preference_key)
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_agent_id ON public.user_preferences(agent_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_key ON public.user_preferences(preference_key);
CREATE INDEX IF NOT EXISTS idx_user_preferences_active ON public.user_preferences(is_active) WHERE is_active = TRUE;

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their preferences" ON public.user_preferences FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can view all preferences" ON public.user_preferences FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));
CREATE POLICY "System can manage preferences" ON public.user_preferences FOR ALL USING (user_id = auth.uid());

-- 8. agent_learning_events (user_id -> auth.users)
CREATE TABLE IF NOT EXISTS public.agent_learning_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_description TEXT NOT NULL,
  related_memory_id UUID REFERENCES public.agent_memories(id),
  related_conversation_id UUID,
  related_message_id UUID,
  feedback_type TEXT,
  feedback_text TEXT,
  agent_action_taken TEXT,
  behavior_change JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_learning_events_agent_id ON public.agent_learning_events(agent_id);
CREATE INDEX IF NOT EXISTS idx_learning_events_user_id ON public.agent_learning_events(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_events_type ON public.agent_learning_events(event_type);
CREATE INDEX IF NOT EXISTS idx_learning_events_created_at ON public.agent_learning_events(created_at DESC);

ALTER TABLE public.agent_learning_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their learning events" ON public.agent_learning_events FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can view all learning events" ON public.agent_learning_events FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));
CREATE POLICY "System can create learning events" ON public.agent_learning_events FOR INSERT WITH CHECK (user_id = auth.uid());

-- 9. Helper functions
CREATE OR REPLACE FUNCTION public.update_conversation_stats()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.agent_conversations SET message_count = message_count + 1, last_message_at = NEW.created_at, updated_at = now() WHERE id = NEW.conversation_id;
  UPDATE public.ai_agents SET usage_count = usage_count + 1 WHERE id = (SELECT agent_id FROM public.agent_conversations WHERE id = NEW.conversation_id) AND NEW.role = 'user';
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_conversation_stats_on_message ON public.agent_messages;
CREATE TRIGGER update_conversation_stats_on_message
  AFTER INSERT ON public.agent_messages FOR EACH ROW EXECUTE FUNCTION public.update_conversation_stats();

CREATE OR REPLACE FUNCTION public.generate_conversation_title()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.role = 'user' THEN
    UPDATE public.agent_conversations SET title = CASE WHEN title IS NULL OR title = '' THEN LEFT(NEW.content, 100) || CASE WHEN LENGTH(NEW.content) > 100 THEN '...' ELSE '' END ELSE title END WHERE id = NEW.conversation_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS auto_generate_conversation_title ON public.agent_messages;
CREATE TRIGGER auto_generate_conversation_title
  AFTER INSERT ON public.agent_messages FOR EACH ROW EXECUTE FUNCTION public.generate_conversation_title();

CREATE OR REPLACE FUNCTION public.get_or_create_conversation(p_agent_id UUID, p_user_id UUID, p_conversation_id UUID DEFAULT NULL)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_conversation_id UUID;
BEGIN
  IF p_conversation_id IS NOT NULL THEN
    SELECT id INTO v_conversation_id FROM public.agent_conversations WHERE id = p_conversation_id AND user_id = p_user_id AND agent_id = p_agent_id;
    IF v_conversation_id IS NOT NULL THEN RETURN v_conversation_id; END IF;
  END IF;
  INSERT INTO public.agent_conversations (agent_id, user_id) VALUES (p_agent_id, p_user_id) RETURNING id INTO v_conversation_id;
  RETURN v_conversation_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.refresh_conversation_stats(p_conversation_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.agent_conversations SET message_count = (SELECT count(*)::integer FROM public.agent_messages WHERE conversation_id = p_conversation_id), last_message_at = (SELECT max(created_at) FROM public.agent_messages WHERE conversation_id = p_conversation_id), updated_at = now() WHERE id = p_conversation_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_relevant_memories(p_agent_id UUID, p_user_id UUID, p_query_embedding vector(1536), p_memory_types TEXT[] DEFAULT ARRAY['short_term', 'long_term', 'episodic'], p_limit INTEGER DEFAULT 10, p_similarity_threshold FLOAT DEFAULT 0.7)
RETURNS TABLE(memory_id UUID, content TEXT, memory_type TEXT, similarity FLOAT, importance_score FLOAT, created_at TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY SELECT m.id, m.content, m.memory_type, 1 - (m.embedding <=> p_query_embedding) AS similarity, m.importance_score, m.created_at FROM public.agent_memories m WHERE m.agent_id = p_agent_id AND m.user_id = p_user_id AND m.is_active = TRUE AND m.memory_type = ANY(p_memory_types) AND (1 - (m.embedding <=> p_query_embedding)) >= p_similarity_threshold ORDER BY (1 - (m.embedding <=> p_query_embedding)) DESC, m.importance_score DESC LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.increment_memory_access(memory_ids UUID[]) RETURNS VOID AS $$
BEGIN
  UPDATE public.agent_memories SET access_count = access_count + 1, last_accessed_at = NOW() WHERE id = ANY(memory_ids);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.consolidate_short_term_memories(p_agent_id UUID, p_user_id UUID, p_days_old INTEGER DEFAULT 7) RETURNS INTEGER AS $$
DECLARE consolidated_count INTEGER := 0;
BEGIN
  UPDATE public.agent_memories SET memory_type = 'long_term', consolidated = TRUE, updated_at = NOW() WHERE agent_id = p_agent_id AND user_id = p_user_id AND memory_type = 'short_term' AND is_active = TRUE AND created_at < NOW() - (p_days_old || ' days')::INTERVAL AND importance_score >= 0.3 AND access_count > 0;
  GET DIAGNOSTICS consolidated_count = ROW_COUNT;
  RETURN consolidated_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.prune_short_term_memories(p_agent_id UUID, p_user_id UUID, p_days_old INTEGER DEFAULT 30, p_importance_threshold FLOAT DEFAULT 0.2) RETURNS INTEGER AS $$
DECLARE pruned_count INTEGER := 0;
BEGIN
  UPDATE public.agent_memories SET is_active = FALSE, updated_at = NOW() WHERE agent_id = p_agent_id AND user_id = p_user_id AND memory_type = 'short_term' AND is_active = TRUE AND created_at < NOW() - (p_days_old || ' days')::INTERVAL AND importance_score < p_importance_threshold AND access_count < 2;
  GET DIAGNOSTICS pruned_count = ROW_COUNT;
  RETURN pruned_count;
END;
$$ LANGUAGE plpgsql;

-- 10. updated_at triggers
DROP TRIGGER IF EXISTS update_agent_conversations_updated_at ON public.agent_conversations;
CREATE TRIGGER update_agent_conversations_updated_at BEFORE UPDATE ON public.agent_conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_user_agent_personalizations_updated_at ON public.user_agent_personalizations;
CREATE TRIGGER update_user_agent_personalizations_updated_at BEFORE UPDATE ON public.user_agent_personalizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_agent_memories_updated_at ON public.agent_memories;
CREATE TRIGGER update_agent_memories_updated_at BEFORE UPDATE ON public.agent_memories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 11. Grants
GRANT EXECUTE ON FUNCTION public.get_or_create_conversation(UUID, UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_conversation_stats(UUID) TO authenticated;

-- 12. Views
CREATE OR REPLACE VIEW public.agent_memory_stats AS
SELECT agent_id, COUNT(*) AS total_memories, COUNT(*) FILTER (WHERE memory_type = 'short_term') AS short_term_count, COUNT(*) FILTER (WHERE memory_type = 'long_term') AS long_term_count, COUNT(*) FILTER (WHERE memory_type = 'episodic') AS episodic_count, COUNT(*) FILTER (WHERE memory_type = 'semantic') AS semantic_count, AVG(importance_score) AS avg_importance, SUM(access_count) AS total_accesses, MAX(last_accessed_at) AS last_memory_access FROM public.agent_memories WHERE is_active = TRUE GROUP BY agent_id;

CREATE OR REPLACE VIEW public.user_preference_coverage AS
SELECT user_id, COUNT(*) AS total_preferences, COUNT(*) FILTER (WHERE learned_from = 'explicit') AS explicit_count, COUNT(*) FILTER (WHERE learned_from = 'observed') AS observed_count, COUNT(*) FILTER (WHERE learned_from = 'inferred') AS inferred_count, AVG(confidence_score) AS avg_confidence, SUM(times_used) AS total_usage FROM public.user_preferences WHERE is_active = TRUE GROUP BY user_id;

CREATE OR REPLACE VIEW public.agent_learning_summary AS
SELECT agent_id, COUNT(*) AS total_events, COUNT(*) FILTER (WHERE event_type = 'user_feedback') AS feedback_count, COUNT(*) FILTER (WHERE event_type = 'correction') AS correction_count, COUNT(*) FILTER (WHERE event_type = 'reinforcement') AS reinforcement_count, COUNT(*) FILTER (WHERE feedback_type = 'positive') AS positive_feedback, COUNT(*) FILTER (WHERE feedback_type = 'negative') AS negative_feedback FROM public.agent_learning_events GROUP BY agent_id;
