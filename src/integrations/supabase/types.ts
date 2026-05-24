export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      agent_conversations: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          is_archived: boolean | null
          is_pinned: boolean | null
          last_message_at: string | null
          message_count: number | null
          metadata: Json | null
          summary: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          is_archived?: boolean | null
          is_pinned?: boolean | null
          last_message_at?: string | null
          message_count?: number | null
          metadata?: Json | null
          summary?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          is_archived?: boolean | null
          is_pinned?: boolean | null
          last_message_at?: string | null
          message_count?: number | null
          metadata?: Json | null
          summary?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_conversations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_learning_events: {
        Row: {
          agent_action_taken: string | null
          agent_id: string
          behavior_change: Json | null
          created_at: string | null
          event_description: string
          event_type: string
          feedback_text: string | null
          feedback_type: string | null
          id: string
          related_conversation_id: string | null
          related_memory_id: string | null
          related_message_id: string | null
          user_id: string
        }
        Insert: {
          agent_action_taken?: string | null
          agent_id: string
          behavior_change?: Json | null
          created_at?: string | null
          event_description: string
          event_type: string
          feedback_text?: string | null
          feedback_type?: string | null
          id?: string
          related_conversation_id?: string | null
          related_memory_id?: string | null
          related_message_id?: string | null
          user_id: string
        }
        Update: {
          agent_action_taken?: string | null
          agent_id?: string
          behavior_change?: Json | null
          created_at?: string | null
          event_description?: string
          event_type?: string
          feedback_text?: string | null
          feedback_type?: string | null
          id?: string
          related_conversation_id?: string | null
          related_memory_id?: string | null
          related_message_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_learning_events_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_learning_events_related_memory_id_fkey"
            columns: ["related_memory_id"]
            isOneToOne: false
            referencedRelation: "agent_memories"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_memories: {
        Row: {
          access_count: number | null
          agent_id: string
          consolidated: boolean | null
          content: string
          created_at: string | null
          embedding: string | null
          id: string
          importance_score: number | null
          is_active: boolean | null
          last_accessed_at: string | null
          memory_category: string | null
          memory_type: string
          metadata: Json | null
          source_id: string | null
          source_type: string | null
          summary: string | null
          superseded_by: string | null
          updated_at: string | null
          user_id: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          access_count?: number | null
          agent_id: string
          consolidated?: boolean | null
          content: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          importance_score?: number | null
          is_active?: boolean | null
          last_accessed_at?: string | null
          memory_category?: string | null
          memory_type: string
          metadata?: Json | null
          source_id?: string | null
          source_type?: string | null
          summary?: string | null
          superseded_by?: string | null
          updated_at?: string | null
          user_id: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          access_count?: number | null
          agent_id?: string
          consolidated?: boolean | null
          content?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          importance_score?: number | null
          is_active?: boolean | null
          last_accessed_at?: string | null
          memory_category?: string | null
          memory_type?: string
          metadata?: Json | null
          source_id?: string | null
          source_type?: string | null
          summary?: string | null
          superseded_by?: string | null
          updated_at?: string | null
          user_id?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_memories_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_memories_superseded_by_fkey"
            columns: ["superseded_by"]
            isOneToOne: false
            referencedRelation: "agent_memories"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_messages: {
        Row: {
          citations: Json | null
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_streaming: boolean | null
          latency_ms: number | null
          metadata: Json | null
          model_used: string | null
          provider_used: string | null
          role: string
          stream_completed_at: string | null
          tokens_input: number | null
          tokens_output: number | null
          tool_call_status: string | null
          tool_calls: Json | null
          tool_results: Json | null
        }
        Insert: {
          citations?: Json | null
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_streaming?: boolean | null
          latency_ms?: number | null
          metadata?: Json | null
          model_used?: string | null
          provider_used?: string | null
          role: string
          stream_completed_at?: string | null
          tokens_input?: number | null
          tokens_output?: number | null
          tool_call_status?: string | null
          tool_calls?: Json | null
          tool_results?: Json | null
        }
        Update: {
          citations?: Json | null
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_streaming?: boolean | null
          latency_ms?: number | null
          metadata?: Json | null
          model_used?: string | null
          provider_used?: string | null
          role?: string
          stream_completed_at?: string | null
          tokens_input?: number | null
          tokens_output?: number | null
          tool_call_status?: string | null
          tool_calls?: Json | null
          tool_results?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "agent_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agent_categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string | null
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      ai_agent_runs: {
        Row: {
          agent_id: string
          completed_at: string | null
          context: Json | null
          created_at: string
          error: string | null
          error_message: string | null
          id: string
          input: Json | null
          latency_ms: number | null
          metadata: Json | null
          model: string | null
          model_used: string | null
          output: Json | null
          output_text: string | null
          provider_used: string | null
          run_type: string | null
          started_at: string | null
          status: string | null
          token_metrics: Json | null
          tokens_used: number | null
          trigger_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id: string
          completed_at?: string | null
          context?: Json | null
          created_at?: string
          error?: string | null
          error_message?: string | null
          id?: string
          input?: Json | null
          latency_ms?: number | null
          metadata?: Json | null
          model?: string | null
          model_used?: string | null
          output?: Json | null
          output_text?: string | null
          provider_used?: string | null
          run_type?: string | null
          started_at?: string | null
          status?: string | null
          token_metrics?: Json | null
          tokens_used?: number | null
          trigger_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          completed_at?: string | null
          context?: Json | null
          created_at?: string
          error?: string | null
          error_message?: string | null
          id?: string
          input?: Json | null
          latency_ms?: number | null
          metadata?: Json | null
          model?: string | null
          model_used?: string | null
          output?: Json | null
          output_text?: string | null
          provider_used?: string | null
          run_type?: string | null
          started_at?: string | null
          status?: string | null
          token_metrics?: Json | null
          tokens_used?: number | null
          trigger_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_agent_runs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agents: {
        Row: {
          avatar: string | null
          category: string | null
          category_id: string | null
          conversation_starters: Json | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          is_enabled: boolean | null
          mcp_server_ids: string[] | null
          memory_enabled: boolean | null
          metadata: Json | null
          model: string | null
          name: string
          slug: string | null
          system_prompt: string | null
          tool_code_interpreter: boolean | null
          tool_file_search: boolean | null
          tool_image_generation: boolean | null
          tool_mcp: boolean | null
          tool_web_search: boolean | null
          tools: Json | null
          tools_config: Json | null
          updated_at: string
          usage_count: number | null
          welcome_message: string | null
        }
        Insert: {
          avatar?: string | null
          category?: string | null
          category_id?: string | null
          conversation_starters?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          is_enabled?: boolean | null
          mcp_server_ids?: string[] | null
          memory_enabled?: boolean | null
          metadata?: Json | null
          model?: string | null
          name: string
          slug?: string | null
          system_prompt?: string | null
          tool_code_interpreter?: boolean | null
          tool_file_search?: boolean | null
          tool_image_generation?: boolean | null
          tool_mcp?: boolean | null
          tool_web_search?: boolean | null
          tools?: Json | null
          tools_config?: Json | null
          updated_at?: string
          usage_count?: number | null
          welcome_message?: string | null
        }
        Update: {
          avatar?: string | null
          category?: string | null
          category_id?: string | null
          conversation_starters?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          is_enabled?: boolean | null
          mcp_server_ids?: string[] | null
          memory_enabled?: boolean | null
          metadata?: Json | null
          model?: string | null
          name?: string
          slug?: string | null
          system_prompt?: string | null
          tool_code_interpreter?: boolean | null
          tool_file_search?: boolean | null
          tool_image_generation?: boolean | null
          tool_mcp?: boolean | null
          tool_web_search?: boolean | null
          tools?: Json | null
          tools_config?: Json | null
          updated_at?: string
          usage_count?: number | null
          welcome_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_agents_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "ai_agent_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_chat_history: {
        Row: {
          agent_id: string | null
          content: string
          created_at: string
          feedback: string | null
          id: string
          metadata: Json | null
          model: string | null
          rating: number | null
          role: string
          session_id: string | null
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          content: string
          created_at?: string
          feedback?: string | null
          id?: string
          metadata?: Json | null
          model?: string | null
          rating?: number | null
          role: string
          session_id?: string | null
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          agent_id?: string | null
          content?: string
          created_at?: string
          feedback?: string | null
          id?: string
          metadata?: Json | null
          model?: string | null
          rating?: number | null
          role?: string
          session_id?: string | null
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_history_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_models: {
        Row: {
          category: string | null
          context_window: number | null
          created_at: string
          embedding_cost_per_1k: number | null
          enabled: boolean | null
          features: Json | null
          id: string
          input_cost_per_1k: number | null
          is_default: boolean | null
          max_tokens: number | null
          model_id: string
          name: string
          output_cost_per_1k: number | null
          provider_id: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          context_window?: number | null
          created_at?: string
          embedding_cost_per_1k?: number | null
          enabled?: boolean | null
          features?: Json | null
          id?: string
          input_cost_per_1k?: number | null
          is_default?: boolean | null
          max_tokens?: number | null
          model_id: string
          name: string
          output_cost_per_1k?: number | null
          provider_id?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          context_window?: number | null
          created_at?: string
          embedding_cost_per_1k?: number | null
          enabled?: boolean | null
          features?: Json | null
          id?: string
          input_cost_per_1k?: number | null
          is_default?: boolean | null
          max_tokens?: number | null
          model_id?: string
          name?: string
          output_cost_per_1k?: number | null
          provider_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_models_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "ai_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_providers: {
        Row: {
          api_base_url: string | null
          api_key_secret_name: string | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          slug: string | null
        }
        Insert: {
          api_base_url?: string | null
          api_key_secret_name?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          slug?: string | null
        }
        Update: {
          api_base_url?: string | null
          api_key_secret_name?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string | null
        }
        Relationships: []
      }
      ai_usage_logs: {
        Row: {
          created_at: string
          embedding_tokens: number | null
          estimated_cost: number | null
          function_name: string
          id: string
          input_tokens: number | null
          model_id: string | null
          output_tokens: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          embedding_tokens?: number | null
          estimated_cost?: number | null
          function_name: string
          id?: string
          input_tokens?: number | null
          model_id?: string | null
          output_tokens?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          embedding_tokens?: number | null
          estimated_cost?: number | null
          function_name?: string
          id?: string
          input_tokens?: number | null
          model_id?: string | null
          output_tokens?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_logs_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "ai_models"
            referencedColumns: ["id"]
          },
        ]
      }
      app_config: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_sensitive: boolean | null
          key: string
          updated_at: string
          value: Json | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_sensitive?: boolean | null
          key: string
          updated_at?: string
          value?: Json | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_sensitive?: boolean | null
          key?: string
          updated_at?: string
          value?: Json | null
        }
        Relationships: []
      }
      app_modules: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_core: boolean | null
          name: string
          page_route: string | null
          requires_feature_flag: string | null
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_core?: boolean | null
          name: string
          page_route?: string | null
          requires_feature_flag?: string | null
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_core?: boolean | null
          name?: string
          page_route?: string | null
          requires_feature_flag?: string | null
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          company: string | null
          created_at: string
          created_by: string | null
          data_source: string | null
          email: string | null
          external_id: string | null
          external_url: string | null
          id: string
          last_synced_at: string | null
          metadata: Json | null
          name: string
          phone: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          created_by?: string | null
          data_source?: string | null
          email?: string | null
          external_id?: string | null
          external_url?: string | null
          id?: string
          last_synced_at?: string | null
          metadata?: Json | null
          name: string
          phone?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          created_by?: string | null
          data_source?: string | null
          email?: string | null
          external_id?: string | null
          external_url?: string | null
          id?: string
          last_synced_at?: string | null
          metadata?: Json | null
          name?: string
          phone?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          client_id: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_sync_logs: {
        Row: {
          created_at: string
          direction: string
          entity_type: string
          id: string
          message: string | null
          organization_integration_id: string
          records_processed: number | null
          status: string
        }
        Insert: {
          created_at?: string
          direction: string
          entity_type: string
          id?: string
          message?: string | null
          organization_integration_id: string
          records_processed?: number | null
          status: string
        }
        Update: {
          created_at?: string
          direction?: string
          entity_type?: string
          id?: string
          message?: string | null
          organization_integration_id?: string
          records_processed?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_sync_logs_organization_integration_id_fkey"
            columns: ["organization_integration_id"]
            isOneToOne: false
            referencedRelation: "organization_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          client_id: string | null
          closed_at: string | null
          contact_id: string | null
          created_at: string
          expected_close_date: string | null
          follow_up_status: string | null
          id: string
          last_contacted_at: string | null
          metadata: Json | null
          notes: string | null
          owner_id: string | null
          probability: number | null
          source: string | null
          stage: string | null
          title: string
          updated_at: string
          value: number | null
        }
        Insert: {
          client_id?: string | null
          closed_at?: string | null
          contact_id?: string | null
          created_at?: string
          expected_close_date?: string | null
          follow_up_status?: string | null
          id?: string
          last_contacted_at?: string | null
          metadata?: Json | null
          notes?: string | null
          owner_id?: string | null
          probability?: number | null
          source?: string | null
          stage?: string | null
          title: string
          updated_at?: string
          value?: number | null
        }
        Update: {
          client_id?: string | null
          closed_at?: string | null
          contact_id?: string | null
          created_at?: string
          expected_close_date?: string | null
          follow_up_status?: string | null
          id?: string
          last_contacted_at?: string | null
          metadata?: Json | null
          notes?: string | null
          owner_id?: string | null
          probability?: number | null
          source?: string | null
          stage?: string | null
          title?: string
          updated_at?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      embeddings: {
        Row: {
          content: string | null
          created_at: string
          embedding: string | null
          id: string
          metadata: Json | null
          source_id: string | null
          source_type: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
          source_id?: string | null
          source_type?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
          source_id?: string | null
          source_type?: string | null
        }
        Relationships: []
      }
      employee_pods: {
        Row: {
          created_at: string
          employee_id: string
          id: string
          pod_id: string
          synced_from_hr: boolean | null
        }
        Insert: {
          created_at?: string
          employee_id: string
          id?: string
          pod_id: string
          synced_from_hr?: boolean | null
        }
        Update: {
          created_at?: string
          employee_id?: string
          id?: string
          pod_id?: string
          synced_from_hr?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_pods_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_pods_pod_id_fkey"
            columns: ["pod_id"]
            isOneToOne: false
            referencedRelation: "pods"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_profiles: {
        Row: {
          created_at: string
          department_id: string | null
          email: string | null
          employment_type: string | null
          full_name: string | null
          hire_date: string | null
          id: string
          is_active: boolean | null
          location: string | null
          title: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          email?: string | null
          employment_type?: string | null
          full_name?: string | null
          hire_date?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          department_id?: string | null
          email?: string | null
          employment_type?: string | null
          full_name?: string | null
          hire_date?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          created_at: string
          id: string
          message: string
          metadata: Json | null
          status: string | null
          subject: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          status?: string | null
          subject?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          status?: string | null
          subject?: string | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      follow_up_leads: {
        Row: {
          assigned_to: string | null
          contact_id: string | null
          created_at: string
          created_by: string | null
          deal_id: string | null
          id: string
          metadata: Json | null
          next_action: string | null
          next_action_date: string | null
          notes: string | null
          priority: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          deal_id?: string | null
          id?: string
          metadata?: Json | null
          next_action?: string | null
          next_action_date?: string | null
          notes?: string | null
          priority?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          deal_id?: string | null
          id?: string
          metadata?: Json | null
          next_action?: string | null
          next_action_date?: string | null
          notes?: string | null
          priority?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "follow_up_leads_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_up_leads_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          enabled: boolean | null
          icon: string | null
          id: string
          name: string
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          enabled?: boolean | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          enabled?: boolean | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      integration_fields: {
        Row: {
          created_at: string
          default_value: string | null
          display_order: number | null
          field_key: string
          field_type: string
          help_text: string | null
          id: string
          is_required: boolean | null
          is_sensitive: boolean | null
          label: string
          placeholder: string | null
          provider_id: string
          select_options: Json | null
          validation_regex: string | null
        }
        Insert: {
          created_at?: string
          default_value?: string | null
          display_order?: number | null
          field_key: string
          field_type: string
          help_text?: string | null
          id?: string
          is_required?: boolean | null
          is_sensitive?: boolean | null
          label: string
          placeholder?: string | null
          provider_id: string
          select_options?: Json | null
          validation_regex?: string | null
        }
        Update: {
          created_at?: string
          default_value?: string | null
          display_order?: number | null
          field_key?: string
          field_type?: string
          help_text?: string | null
          id?: string
          is_required?: boolean | null
          is_sensitive?: boolean | null
          label?: string
          placeholder?: string | null
          provider_id?: string
          select_options?: Json | null
          validation_regex?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_fields_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "integration_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_providers: {
        Row: {
          auth_type: string | null
          category_id: string | null
          config: Json | null
          created_at: string
          description: string | null
          display_order: number | null
          docs_url: string | null
          id: string
          is_active: boolean | null
          is_available: boolean | null
          is_beta: boolean | null
          is_coming_soon: boolean | null
          logo_url: string | null
          name: string
          oauth_config: Json | null
          slug: string
          updated_at: string
        }
        Insert: {
          auth_type?: string | null
          category_id?: string | null
          config?: Json | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          docs_url?: string | null
          id?: string
          is_active?: boolean | null
          is_available?: boolean | null
          is_beta?: boolean | null
          is_coming_soon?: boolean | null
          logo_url?: string | null
          name: string
          oauth_config?: Json | null
          slug: string
          updated_at?: string
        }
        Update: {
          auth_type?: string | null
          category_id?: string | null
          config?: Json | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          docs_url?: string | null
          id?: string
          is_active?: boolean | null
          is_available?: boolean | null
          is_beta?: boolean | null
          is_coming_soon?: boolean | null
          logo_url?: string | null
          name?: string
          oauth_config?: Json | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_providers_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "integration_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_services: {
        Row: {
          cost_model: Json | null
          created_at: string
          description: string | null
          display_order: number | null
          enabled: boolean | null
          features: Json | null
          has_cost: boolean | null
          id: string
          is_default: boolean | null
          name: string
          provider_id: string
          requires_config: boolean | null
          service_key: string
          updated_at: string
        }
        Insert: {
          cost_model?: Json | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          enabled?: boolean | null
          features?: Json | null
          has_cost?: boolean | null
          id?: string
          is_default?: boolean | null
          name: string
          provider_id: string
          requires_config?: boolean | null
          service_key: string
          updated_at?: string
        }
        Update: {
          cost_model?: Json | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          enabled?: boolean | null
          features?: Json | null
          has_cost?: boolean | null
          id?: string
          is_default?: boolean | null
          name?: string
          provider_id?: string
          requires_config?: boolean | null
          service_key?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_services_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "integration_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_usage_logs: {
        Row: {
          action: string
          created_at: string
          error_message: string | null
          estimated_cost: number | null
          id: string
          organization_id: string | null
          provider_id: string | null
          request_metadata: Json | null
          response_metadata: Json | null
          service_id: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          error_message?: string | null
          estimated_cost?: number | null
          id?: string
          organization_id?: string | null
          provider_id?: string | null
          request_metadata?: Json | null
          response_metadata?: Json | null
          service_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          error_message?: string | null
          estimated_cost?: number | null
          id?: string
          organization_id?: string | null
          provider_id?: string | null
          request_metadata?: Json | null
          response_metadata?: Json | null
          service_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_usage_logs_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "integration_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_usage_logs_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "integration_services"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          parent_id: string | null
          slug: string | null
          sort_order: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          parent_id?: string | null
          slug?: string | null
          sort_order?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          slug?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      knowledge_entries: {
        Row: {
          category_id: string | null
          content: string | null
          created_at: string
          id: string
          metadata: Json | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_entries_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "knowledge_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_files: {
        Row: {
          category_id: string | null
          chunk_count: number | null
          created_at: string
          entry_id: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          id: string
          processed_at: string | null
          processing_error: string | null
          processing_status: string | null
          storage_path: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          chunk_count?: number | null
          created_at?: string
          entry_id?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          processed_at?: string | null
          processing_error?: string | null
          processing_status?: string | null
          storage_path?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          chunk_count?: number | null
          created_at?: string
          entry_id?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          processed_at?: string | null
          processing_error?: string | null
          processing_status?: string | null
          storage_path?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_files_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "knowledge_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_sources: {
        Row: {
          config: Json | null
          created_at: string
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          name: string
          source_type: string
          updated_at: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          name: string
          source_type: string
          updated_at?: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          name?: string
          source_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      mcp_servers: {
        Row: {
          api_key: string | null
          config: Json | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
          url: string
        }
        Insert: {
          api_key?: string | null
          config?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
          url: string
        }
        Update: {
          api_key?: string | null
          config?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      meeting_action_items: {
        Row: {
          assignee_email: string | null
          assignee_id: string | null
          created_at: string
          description: string | null
          due_date: string | null
          extracted_from_transcript: boolean | null
          extraction_confidence: number | null
          id: string
          meeting_id: string
          priority: string | null
          status: string | null
          task_id: string | null
          text: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assignee_email?: string | null
          assignee_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          extracted_from_transcript?: boolean | null
          extraction_confidence?: number | null
          id?: string
          meeting_id: string
          priority?: string | null
          status?: string | null
          task_id?: string | null
          text?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assignee_email?: string | null
          assignee_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          extracted_from_transcript?: boolean | null
          extraction_confidence?: number | null
          id?: string
          meeting_id?: string
          priority?: string | null
          status?: string | null
          task_id?: string | null
          text?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_action_items_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_agenda_items: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          meeting_id: string
          presenter_id: string | null
          sort_order: number | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          meeting_id: string
          presenter_id?: string | null
          sort_order?: number | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          meeting_id?: string
          presenter_id?: string | null
          sort_order?: number | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_agenda_items_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_attendees: {
        Row: {
          attended: boolean | null
          created_at: string
          email: string | null
          id: string
          meeting_id: string
          name: string | null
          user_id: string | null
        }
        Insert: {
          attended?: boolean | null
          created_at?: string
          email?: string | null
          id?: string
          meeting_id: string
          name?: string | null
          user_id?: string | null
        }
        Update: {
          attended?: boolean | null
          created_at?: string
          email?: string | null
          id?: string
          meeting_id?: string
          name?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_attendees_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_files: {
        Row: {
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string | null
          id: string
          meeting_id: string
          source: string | null
          storage_path: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          meeting_id: string
          source?: string | null
          storage_path?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          meeting_id?: string
          source?: string | null
          storage_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_files_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_issues: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string | null
          id: string
          meeting_id: string
          severity: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          id?: string
          meeting_id: string
          severity?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          id?: string
          meeting_id?: string
          severity?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_issues_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_participants: {
        Row: {
          attendance_status: string | null
          created_at: string
          email: string | null
          id: string
          meeting_id: string
          name: string | null
          role: string | null
          rsvp_status: string | null
          user_id: string | null
        }
        Insert: {
          attendance_status?: string | null
          created_at?: string
          email?: string | null
          id?: string
          meeting_id: string
          name?: string | null
          role?: string | null
          rsvp_status?: string | null
          user_id?: string | null
        }
        Update: {
          attendance_status?: string | null
          created_at?: string
          email?: string | null
          id?: string
          meeting_id?: string
          name?: string | null
          role?: string | null
          rsvp_status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_participants_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_rules: {
        Row: {
          actions: Json | null
          conditions: Json | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          rule_type: string | null
          updated_at: string
        }
        Insert: {
          actions?: Json | null
          conditions?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          rule_type?: string | null
          updated_at?: string
        }
        Update: {
          actions?: Json | null
          conditions?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          rule_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      meeting_series: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          organizer_id: string | null
          recurrence_rule: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          organizer_id?: string | null
          recurrence_rule?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          organizer_id?: string | null
          recurrence_rule?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      meeting_summary_notes: {
        Row: {
          content: string | null
          created_at: string
          created_by: string | null
          id: string
          meeting_id: string
          note_type: string | null
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          meeting_id: string
          note_type?: string | null
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          meeting_id?: string
          note_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_summary_notes_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_takeaways: {
        Row: {
          assignee_id: string | null
          content: string
          created_at: string
          id: string
          meeting_id: string
          status: string | null
          type: string | null
        }
        Insert: {
          assignee_id?: string | null
          content: string
          created_at?: string
          id?: string
          meeting_id: string
          status?: string | null
          type?: string | null
        }
        Update: {
          assignee_id?: string | null
          content?: string
          created_at?: string
          id?: string
          meeting_id?: string
          status?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_takeaways_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_templates: {
        Row: {
          agenda_template: Json | null
          created_at: string
          created_by: string | null
          default_duration: number | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          agenda_template?: Json | null
          created_at?: string
          created_by?: string | null
          default_duration?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          agenda_template?: Json | null
          created_at?: string
          created_by?: string | null
          default_duration?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      meeting_transcripts: {
        Row: {
          content: string | null
          created_at: string
          id: string
          meeting_id: string
          source: string | null
          summary: string | null
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          meeting_id: string
          source?: string | null
          summary?: string | null
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          meeting_id?: string
          source?: string | null
          summary?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_transcripts_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          category: string | null
          client_id: string | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          energy_level: string | null
          external_id: string | null
          external_meeting_id: string | null
          external_uuid: string | null
          host_url: string | null
          id: string
          is_recurring: boolean | null
          join_url: string | null
          location: string | null
          meeting_type: string | null
          metadata: Json | null
          organizer_id: string
          project_id: string | null
          project_name: string | null
          provider: string | null
          scheduled_at: string | null
          sentiment_score: number | null
          series_id: string | null
          slug: string | null
          status: string | null
          tags: string[] | null
          title: string
          transcript_error: string | null
          transcript_status: string | null
          updated_at: string
          zoom_id: string | null
          zoom_join_url: string | null
          zoom_meeting_id: string | null
          zoom_start_url: string | null
          zoom_uuid: string | null
        }
        Insert: {
          category?: string | null
          client_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          energy_level?: string | null
          external_id?: string | null
          external_meeting_id?: string | null
          external_uuid?: string | null
          host_url?: string | null
          id?: string
          is_recurring?: boolean | null
          join_url?: string | null
          location?: string | null
          meeting_type?: string | null
          metadata?: Json | null
          organizer_id: string
          project_id?: string | null
          project_name?: string | null
          provider?: string | null
          scheduled_at?: string | null
          sentiment_score?: number | null
          series_id?: string | null
          slug?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          transcript_error?: string | null
          transcript_status?: string | null
          updated_at?: string
          zoom_id?: string | null
          zoom_join_url?: string | null
          zoom_meeting_id?: string | null
          zoom_start_url?: string | null
          zoom_uuid?: string | null
        }
        Update: {
          category?: string | null
          client_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          energy_level?: string | null
          external_id?: string | null
          external_meeting_id?: string | null
          external_uuid?: string | null
          host_url?: string | null
          id?: string
          is_recurring?: boolean | null
          join_url?: string | null
          location?: string | null
          meeting_type?: string | null
          metadata?: Json | null
          organizer_id?: string
          project_id?: string | null
          project_name?: string | null
          provider?: string | null
          scheduled_at?: string | null
          sentiment_score?: number | null
          series_id?: string | null
          slug?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          transcript_error?: string | null
          transcript_status?: string | null
          updated_at?: string
          zoom_id?: string | null
          zoom_join_url?: string | null
          zoom_meeting_id?: string | null
          zoom_start_url?: string | null
          zoom_uuid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meetings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_project_fk"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "meeting_series"
            referencedColumns: ["id"]
          },
        ]
      }
      nonprofit_campaigns: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          donor_count: number
          end_date: string | null
          fund_designation: string
          goal: number
          id: string
          is_active: boolean | null
          name: string
          raised: number
          start_date: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          donor_count?: number
          end_date?: string | null
          fund_designation?: string
          goal?: number
          id?: string
          is_active?: boolean | null
          name: string
          raised?: number
          start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          donor_count?: number
          end_date?: string | null
          fund_designation?: string
          goal?: number
          id?: string
          is_active?: boolean | null
          name?: string
          raised?: number
          start_date?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      nonprofit_donations: {
        Row: {
          amount: number
          campaign_id: string | null
          created_at: string | null
          donor_email: string | null
          donor_name: string
          frequency: string
          fund_designation: string | null
          id: string
          is_anonymous: boolean | null
          notes: string | null
          payment_method: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          campaign_id?: string | null
          created_at?: string | null
          donor_email?: string | null
          donor_name: string
          frequency: string
          fund_designation?: string | null
          id?: string
          is_anonymous?: boolean | null
          notes?: string | null
          payment_method?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          campaign_id?: string | null
          created_at?: string | null
          donor_email?: string | null
          donor_name?: string
          frequency?: string
          fund_designation?: string | null
          id?: string
          is_anonymous?: boolean | null
          notes?: string | null
          payment_method?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nonprofit_donations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "nonprofit_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      nonprofit_event_agenda_items: {
        Row: {
          created_at: string | null
          display_order: number | null
          event_id: string
          id: string
          speaker_name: string | null
          time: string
          title: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          event_id: string
          id?: string
          speaker_name?: string | null
          time: string
          title: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          event_id?: string
          id?: string
          speaker_name?: string | null
          time?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "nonprofit_event_agenda_items_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "nonprofit_events"
            referencedColumns: ["id"]
          },
        ]
      }
      nonprofit_event_registrants: {
        Row: {
          checked_in: boolean | null
          created_at: string | null
          email: string
          event_id: string
          id: string
          name: string
          registered_at: string | null
          ticket_tier: string | null
        }
        Insert: {
          checked_in?: boolean | null
          created_at?: string | null
          email: string
          event_id: string
          id?: string
          name: string
          registered_at?: string | null
          ticket_tier?: string | null
        }
        Update: {
          checked_in?: boolean | null
          created_at?: string | null
          email?: string
          event_id?: string
          id?: string
          name?: string
          registered_at?: string | null
          ticket_tier?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nonprofit_event_registrants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "nonprofit_events"
            referencedColumns: ["id"]
          },
        ]
      }
      nonprofit_event_speakers: {
        Row: {
          bio: string | null
          created_at: string | null
          display_order: number | null
          event_id: string
          id: string
          name: string
          title: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          display_order?: number | null
          event_id: string
          id?: string
          name: string
          title?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          display_order?: number | null
          event_id?: string
          id?: string
          name?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nonprofit_event_speakers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "nonprofit_events"
            referencedColumns: ["id"]
          },
        ]
      }
      nonprofit_event_ticket_types: {
        Row: {
          capacity: number
          created_at: string | null
          event_id: string
          id: string
          price: number
          sold: number
          tier: string
        }
        Insert: {
          capacity?: number
          created_at?: string | null
          event_id: string
          id?: string
          price?: number
          sold?: number
          tier: string
        }
        Update: {
          capacity?: number
          created_at?: string | null
          event_id?: string
          id?: string
          price?: number
          sold?: number
          tier?: string
        }
        Relationships: [
          {
            foreignKeyName: "nonprofit_event_ticket_types_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "nonprofit_events"
            referencedColumns: ["id"]
          },
        ]
      }
      nonprofit_events: {
        Row: {
          capacity: number
          created_at: string | null
          created_by: string | null
          date: string
          description: string | null
          fund_raised: number | null
          id: string
          location: string | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          capacity?: number
          created_at?: string | null
          created_by?: string | null
          date: string
          description?: string | null
          fund_raised?: number | null
          id?: string
          location?: string | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          capacity?: number
          created_at?: string | null
          created_by?: string | null
          date?: string
          description?: string | null
          fund_raised?: number | null
          id?: string
          location?: string | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      nonprofit_members: {
        Row: {
          created_at: string | null
          created_by: string | null
          email: string
          employer: string | null
          id: string
          interests: string[] | null
          join_date: string | null
          name: string
          phone: string | null
          renewal_date: string | null
          status: string
          tier: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email: string
          employer?: string | null
          id?: string
          interests?: string[] | null
          join_date?: string | null
          name: string
          phone?: string | null
          renewal_date?: string | null
          status?: string
          tier?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email?: string
          employer?: string | null
          id?: string
          interests?: string[] | null
          join_date?: string | null
          name?: string
          phone?: string | null
          renewal_date?: string | null
          status?: string
          tier?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      nonprofit_role_permissions: {
        Row: {
          created_at: string
          granted: boolean
          id: string
          resource_key: string
          resource_type: string
          role: string
        }
        Insert: {
          created_at?: string
          granted?: boolean
          id?: string
          resource_key: string
          resource_type: string
          role: string
        }
        Update: {
          created_at?: string
          granted?: boolean
          id?: string
          resource_key?: string
          resource_type?: string
          role?: string
        }
        Relationships: []
      }
      nonprofit_volunteer_shifts: {
        Row: {
          created_at: string | null
          date: string
          event_name: string
          hours: number
          id: string
          status: string
          updated_at: string | null
          volunteer_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          event_name: string
          hours?: number
          id?: string
          status?: string
          updated_at?: string | null
          volunteer_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          event_name?: string
          hours?: number
          id?: string
          status?: string
          updated_at?: string | null
          volunteer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nonprofit_volunteer_shifts_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "nonprofit_volunteers"
            referencedColumns: ["id"]
          },
        ]
      }
      nonprofit_volunteers: {
        Row: {
          availability: string[] | null
          created_at: string | null
          created_by: string | null
          donor_total_giving: number | null
          email: string
          id: string
          is_also_donor: boolean | null
          joined_date: string | null
          name: string
          phone: string | null
          skills: string[] | null
          total_hours: number
          updated_at: string | null
        }
        Insert: {
          availability?: string[] | null
          created_at?: string | null
          created_by?: string | null
          donor_total_giving?: number | null
          email: string
          id?: string
          is_also_donor?: boolean | null
          joined_date?: string | null
          name: string
          phone?: string | null
          skills?: string[] | null
          total_hours?: number
          updated_at?: string | null
        }
        Update: {
          availability?: string[] | null
          created_at?: string | null
          created_by?: string | null
          donor_total_giving?: number | null
          email?: string
          id?: string
          is_also_donor?: boolean | null
          joined_date?: string | null
          name?: string
          phone?: string | null
          skills?: string[] | null
          total_hours?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          link: string | null
          message: string | null
          metadata: Json | null
          read_at: string | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          metadata?: Json | null
          read_at?: string | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          metadata?: Json | null
          read_at?: string | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      organization_integrations: {
        Row: {
          config: Json | null
          connection_message: string | null
          connection_status: string | null
          created_at: string
          credentials: Json | null
          enabled: boolean | null
          id: string
          is_primary: boolean | null
          last_sync_at: string | null
          last_tested_at: string | null
          oauth_tokens: Json | null
          provider_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          config?: Json | null
          connection_message?: string | null
          connection_status?: string | null
          created_at?: string
          credentials?: Json | null
          enabled?: boolean | null
          id?: string
          is_primary?: boolean | null
          last_sync_at?: string | null
          last_tested_at?: string | null
          oauth_tokens?: Json | null
          provider_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          config?: Json | null
          connection_message?: string | null
          connection_status?: string | null
          created_at?: string
          credentials?: Json | null
          enabled?: boolean | null
          id?: string
          is_primary?: boolean | null
          last_sync_at?: string | null
          last_tested_at?: string | null
          oauth_tokens?: Json | null
          provider_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_integrations_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "integration_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      pod_employees: {
        Row: {
          created_at: string
          employee_id: string | null
          has_login: boolean | null
          id: string
          is_active: boolean | null
          pod_id: string
          synced_from_hr: boolean | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          employee_id?: string | null
          has_login?: boolean | null
          id?: string
          is_active?: boolean | null
          pod_id: string
          synced_from_hr?: boolean | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          employee_id?: string | null
          has_login?: boolean | null
          id?: string
          is_active?: boolean | null
          pod_id?: string
          synced_from_hr?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pod_employees_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pod_employees_pod_id_fkey"
            columns: ["pod_id"]
            isOneToOne: false
            referencedRelation: "pods"
            referencedColumns: ["id"]
          },
        ]
      }
      pod_members: {
        Row: {
          created_at: string
          id: string
          pod_id: string
          role: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          pod_id: string
          role?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          pod_id?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pod_members_pod_id_fkey"
            columns: ["pod_id"]
            isOneToOne: false
            referencedRelation: "pods"
            referencedColumns: ["id"]
          },
        ]
      }
      pod_permissions: {
        Row: {
          created_at: string
          has_access: boolean | null
          id: string
          module_id: string
          pod_id: string
        }
        Insert: {
          created_at?: string
          has_access?: boolean | null
          id?: string
          module_id: string
          pod_id: string
        }
        Update: {
          created_at?: string
          has_access?: boolean | null
          id?: string
          module_id?: string
          pod_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pod_permissions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "app_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pod_permissions_pod_id_fkey"
            columns: ["pod_id"]
            isOneToOne: false
            referencedRelation: "pods"
            referencedColumns: ["id"]
          },
        ]
      }
      pods: {
        Row: {
          color: string | null
          created_at: string
          created_by: string | null
          department_id: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          show_in_resource_projection: boolean | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          show_in_resource_projection?: boolean | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          show_in_resource_projection?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pods_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      processing_queue_history: {
        Row: {
          completed_at: string | null
          created_at: string
          error: string | null
          id: string
          input: Json | null
          output: Json | null
          queue_type: string | null
          started_at: string | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error?: string | null
          id?: string
          input?: Json | null
          output?: Json | null
          queue_type?: string | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error?: string | null
          id?: string
          input?: Json | null
          output?: Json | null
          queue_type?: string | null
          started_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          metadata: Json | null
          role: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          metadata?: Json | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          metadata?: Json | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      project_backups: {
        Row: {
          backup_data: Json | null
          created_at: string
          created_by: string | null
          id: string
          project_id: string | null
        }
        Insert: {
          backup_data?: Json | null
          created_at?: string
          created_by?: string | null
          id?: string
          project_id?: string | null
        }
        Update: {
          backup_data?: Json | null
          created_at?: string
          created_by?: string | null
          id?: string
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_backups_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_billing: {
        Row: {
          billing_type: string | null
          created_at: string
          currency: string | null
          id: string
          invoiced_amount: number | null
          payment_terms: string | null
          project_id: string
          rate: number | null
          total_budget: number | null
          updated_at: string
        }
        Insert: {
          billing_type?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          invoiced_amount?: number | null
          payment_terms?: string | null
          project_id: string
          rate?: number | null
          total_budget?: number | null
          updated_at?: string
        }
        Update: {
          billing_type?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          invoiced_amount?: number | null
          payment_terms?: string | null
          project_id?: string
          rate?: number | null
          total_budget?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_billing_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_checklists: {
        Row: {
          created_at: string
          id: string
          is_completed: boolean | null
          project_id: string
          sort_order: number | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_completed?: boolean | null
          project_id: string
          sort_order?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_completed?: boolean | null
          project_id?: string
          sort_order?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_checklists_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_client_access: {
        Row: {
          access_level: string | null
          access_token: string | null
          can_approve: boolean | null
          can_comment: boolean | null
          can_upload: boolean | null
          client_email: string | null
          client_id: string
          client_name: string | null
          created_at: string
          expires_at: string | null
          granted_by: string | null
          id: string
          is_active: boolean | null
          last_accessed_at: string | null
          portal_sections: Json | null
          project_id: string
          updated_at: string | null
        }
        Insert: {
          access_level?: string | null
          access_token?: string | null
          can_approve?: boolean | null
          can_comment?: boolean | null
          can_upload?: boolean | null
          client_email?: string | null
          client_id: string
          client_name?: string | null
          created_at?: string
          expires_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          last_accessed_at?: string | null
          portal_sections?: Json | null
          project_id: string
          updated_at?: string | null
        }
        Update: {
          access_level?: string | null
          access_token?: string | null
          can_approve?: boolean | null
          can_comment?: boolean | null
          can_upload?: boolean | null
          client_email?: string | null
          client_id?: string
          client_name?: string | null
          created_at?: string
          expires_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          last_accessed_at?: string | null
          portal_sections?: Json | null
          project_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_client_access_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_client_access_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          parent_id: string | null
          project_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          parent_id?: string | null
          project_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          project_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_comments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_concerns: {
        Row: {
          created_at: string
          description: string | null
          id: string
          project_id: string
          raised_by: string | null
          severity: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          project_id: string
          raised_by?: string | null
          severity?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          project_id?: string
          raised_by?: string | null
          severity?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_concerns_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_files: {
        Row: {
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string | null
          id: string
          project_id: string
          source: string | null
          storage_path: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          project_id: string
          source?: string | null
          storage_path?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          project_id?: string
          source?: string | null
          storage_path?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_invoices: {
        Row: {
          amount: number | null
          created_at: string
          created_by: string | null
          due_date: string | null
          id: string
          invoice_number: string | null
          notes: string | null
          paid_at: string | null
          project_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          notes?: string | null
          paid_at?: string | null
          project_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          notes?: string | null
          paid_at?: string | null
          project_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          id: string
          joined_at: string | null
          project_id: string
          role: string | null
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          project_id: string
          role?: string | null
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          project_id?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_milestones: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          project_id: string
          sort_order: number | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          project_id: string
          sort_order?: number | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          project_id?: string
          sort_order?: number | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_risks: {
        Row: {
          created_at: string
          description: string | null
          id: string
          mitigation: string | null
          project_id: string
          reported_by: string | null
          severity: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          mitigation?: string | null
          project_id: string
          reported_by?: string | null
          severity?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          mitigation?: string | null
          project_id?: string
          reported_by?: string | null
          severity?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_risks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_statuses: {
        Row: {
          color: string | null
          created_at: string
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          budget: number | null
          client_id: string | null
          created_at: string
          created_by: string | null
          currency: string | null
          description: string | null
          end_date: string | null
          external_id: string | null
          external_provider: string | null
          id: string
          is_archived: boolean | null
          metadata: Json | null
          name: string
          owner_id: string | null
          slug: string | null
          source_deal_id: string | null
          start_date: string | null
          status_id: string | null
          updated_at: string
        }
        Insert: {
          budget?: number | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          description?: string | null
          end_date?: string | null
          external_id?: string | null
          external_provider?: string | null
          id?: string
          is_archived?: boolean | null
          metadata?: Json | null
          name: string
          owner_id?: string | null
          slug?: string | null
          source_deal_id?: string | null
          start_date?: string | null
          status_id?: string | null
          updated_at?: string
        }
        Update: {
          budget?: number | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          description?: string | null
          end_date?: string | null
          external_id?: string | null
          external_provider?: string | null
          id?: string
          is_archived?: boolean | null
          metadata?: Json | null
          name?: string
          owner_id?: string | null
          slug?: string | null
          source_deal_id?: string | null
          start_date?: string | null
          status_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_source_deal_id_fkey"
            columns: ["source_deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "project_statuses"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          admin_notes: string | null
          category: string
          created_at: string
          description: string
          id: string
          status: string
          subject: string
          updated_at: string
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          category: string
          created_at?: string
          description: string
          id?: string
          status?: string
          subject: string
          updated_at?: string
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          category?: string
          created_at?: string
          description?: string
          id?: string
          status?: string
          subject?: string
          updated_at?: string
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: Json | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value?: Json | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: Json | null
        }
        Relationships: []
      }
      task_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_path: string | null
          file_size: number | null
          file_type: string | null
          id: string
          task_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          task_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          task_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_attachments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          client_id: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          meeting_id: string | null
          metadata: Json | null
          priority: string | null
          project_id: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          client_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          meeting_id?: string | null
          metadata?: Json | null
          priority?: string | null
          project_id?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          meeting_id?: string | null
          metadata?: Json | null
          priority?: string | null
          project_id?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      unified_documents: {
        Row: {
          content: string | null
          created_at: string
          file_name: string | null
          file_size: number | null
          file_type: string | null
          id: string
          metadata: Json | null
          owner_id: string
          owner_type: string
          processing_status: string | null
          source_id: string | null
          source_type: string | null
          storage_path: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          metadata?: Json | null
          owner_id: string
          owner_type: string
          processing_status?: string | null
          source_id?: string | null
          source_type?: string | null
          storage_path?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          metadata?: Json | null
          owner_id?: string
          owner_type?: string
          processing_status?: string | null
          source_id?: string | null
          source_type?: string | null
          storage_path?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_agent_personalizations: {
        Row: {
          additional_prompt: string | null
          agent_id: string
          attached_knowledge_files: string[] | null
          created_at: string
          id: string
          is_enabled: boolean | null
          max_context_files: number | null
          relevance_threshold: number | null
          updated_at: string
          use_all_knowledge: boolean | null
          user_id: string
        }
        Insert: {
          additional_prompt?: string | null
          agent_id: string
          attached_knowledge_files?: string[] | null
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          max_context_files?: number | null
          relevance_threshold?: number | null
          updated_at?: string
          use_all_knowledge?: boolean | null
          user_id: string
        }
        Update: {
          additional_prompt?: string | null
          agent_id?: string
          attached_knowledge_files?: string[] | null
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          max_context_files?: number | null
          relevance_threshold?: number | null
          updated_at?: string
          use_all_knowledge?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_agent_personalizations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      user_knowledge_files: {
        Row: {
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string | null
          id: string
          processing_status: string | null
          storage_path: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          processing_status?: string | null
          storage_path?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          processing_status?: string | null
          storage_path?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_knowledge_sources: {
        Row: {
          config: Json | null
          created_at: string
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          name: string
          source_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          name: string
          source_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          name?: string
          source_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_microsoft_teams: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          team_id: string
          team_name: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          team_id: string
          team_name?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          team_id?: string
          team_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_microsoft_teams_channels: {
        Row: {
          channel_id: string
          channel_name: string | null
          created_at: string
          id: string
          is_active: boolean | null
          team_id: string
          user_id: string
        }
        Insert: {
          channel_id: string
          channel_name?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          team_id: string
          user_id: string
        }
        Update: {
          channel_id?: string
          channel_name?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          team_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_module_permissions: {
        Row: {
          created_at: string
          has_access: boolean | null
          id: string
          module_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          has_access?: boolean | null
          id?: string
          module_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          has_access?: boolean | null
          id?: string
          module_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_module_permissions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "app_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          agent_id: string | null
          confidence_score: number | null
          created_at: string | null
          evidence_count: number | null
          id: string
          is_active: boolean | null
          last_used_at: string | null
          learned_from: string | null
          preference_key: string
          preference_value: Json
          times_used: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          evidence_count?: number | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          learned_from?: string | null
          preference_key: string
          preference_value: Json
          times_used?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          agent_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          evidence_count?: number | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          learned_from?: string | null
          preference_key?: string
          preference_value?: Json
          times_used?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      user_role_preferences: {
        Row: {
          agency_role: string | null
          created_at: string
          id: string
          is_eos_user: boolean | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agency_role?: string | null
          created_at?: string
          id?: string
          is_eos_user?: boolean | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agency_role?: string | null
          created_at?: string
          id?: string
          is_eos_user?: boolean | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vector_search_logs: {
        Row: {
          created_at: string
          id: string
          latency_ms: number | null
          metadata: Json | null
          query: string | null
          results_count: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          latency_ms?: number | null
          metadata?: Json | null
          query?: string | null
          results_count?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          latency_ms?: number | null
          metadata?: Json | null
          query?: string | null
          results_count?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      zoom_files: {
        Row: {
          created_at: string
          download_url: string | null
          file_name: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          has_embeddings: boolean | null
          id: string
          meeting_id: string | null
          processing_status: string | null
          recording_type: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          download_url?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          has_embeddings?: boolean | null
          id?: string
          meeting_id?: string | null
          processing_status?: string | null
          recording_type?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          download_url?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          has_embeddings?: boolean | null
          id?: string
          meeting_id?: string | null
          processing_status?: string | null
          recording_type?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "zoom_files_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      agent_learning_summary: {
        Row: {
          agent_id: string | null
          correction_count: number | null
          feedback_count: number | null
          negative_feedback: number | null
          positive_feedback: number | null
          reinforcement_count: number | null
          total_events: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_learning_events_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_memory_stats: {
        Row: {
          agent_id: string | null
          avg_importance: number | null
          episodic_count: number | null
          last_memory_access: string | null
          long_term_count: number | null
          semantic_count: number | null
          short_term_count: number | null
          total_accesses: number | null
          total_memories: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_memories_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preference_coverage: {
        Row: {
          avg_confidence: number | null
          explicit_count: number | null
          inferred_count: number | null
          observed_count: number | null
          total_preferences: number | null
          total_usage: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      consolidate_short_term_memories: {
        Args: { p_agent_id: string; p_days_old?: number; p_user_id: string }
        Returns: number
      }
      get_or_create_conversation: {
        Args: {
          p_agent_id: string
          p_conversation_id?: string
          p_user_id: string
        }
        Returns: string
      }
      get_relevant_memories: {
        Args: {
          p_agent_id: string
          p_limit?: number
          p_memory_types?: string[]
          p_query_embedding: string
          p_similarity_threshold?: number
          p_user_id: string
        }
        Returns: {
          content: string
          created_at: string
          importance_score: number
          memory_id: string
          memory_type: string
          similarity: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_memory_access: {
        Args: { memory_ids: string[] }
        Returns: undefined
      }
      prune_short_term_memories: {
        Args: {
          p_agent_id: string
          p_days_old?: number
          p_importance_threshold?: number
          p_user_id: string
        }
        Returns: number
      }
      refresh_conversation_stats: {
        Args: { p_conversation_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      data_source_type:
        | "manual"
        | "hubspot"
        | "salesforce"
        | "zoho"
        | "pipedrive"
        | "blackbaud"
        | "bloomerang"
        | "neon"
        | "virtuous"
        | "donorperfect"
        | "kindful"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      data_source_type: [
        "manual",
        "hubspot",
        "salesforce",
        "zoho",
        "pipedrive",
        "blackbaud",
        "bloomerang",
        "neon",
        "virtuous",
        "donorperfect",
        "kindful",
      ],
    },
  },
} as const
