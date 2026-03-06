-- Add tool and MCP columns to ai_agents so create/update agent works with the app.
-- Your CSV export showed these columns are missing; this migration adds them.

ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS tool_code_interpreter BOOLEAN DEFAULT false;
ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS tool_file_search BOOLEAN DEFAULT false;
ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS tool_web_search BOOLEAN DEFAULT false;
ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS tool_image_generation BOOLEAN DEFAULT false;
ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS tool_mcp BOOLEAN DEFAULT false;
ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS mcp_server_ids UUID[] DEFAULT '{}';
ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS tools_config JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.ai_agents.tool_code_interpreter IS 'Enable code execution capability';
COMMENT ON COLUMN public.ai_agents.tool_file_search IS 'Enable searching through knowledge base files';
COMMENT ON COLUMN public.ai_agents.tool_web_search IS 'Enable real-time web search';
COMMENT ON COLUMN public.ai_agents.tool_image_generation IS 'Enable image generation';
COMMENT ON COLUMN public.ai_agents.tool_mcp IS 'Enable Model Context Protocol servers';
COMMENT ON COLUMN public.ai_agents.mcp_server_ids IS 'Array of connected MCP server IDs';
COMMENT ON COLUMN public.ai_agents.tools_config IS 'Custom function/tool definitions for the agent';
