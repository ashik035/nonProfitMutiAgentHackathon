# AI Features

Nonprofit Control Tower includes powerful AI capabilities for chat, summarization, semantic search, custom agents, and a team-based agent discovery system.

---

## AI Providers

| Provider | Setup Required | Best For |
|----------|----------------|----------|
| [Lovable AI](./lovable-ai.md) | None (included) | Quick setup, Lovable users |
| [OpenAI](./provider-routing.md) | API key | GPT-4, advanced features |
| [Anthropic](./provider-routing.md) | API key | Claude, long context |
| [Google AI](./provider-routing.md) | API key | Gemini, multimodal |

---

## Features Overview

### AI Agent Teams
Discover and explore 16 specialized AI agents organized into 4 teams.

- **Donor Intelligence Team** — Deal Coach, Daily Briefing, Quick Email, Deal AI Chat
- **Meeting AI Team** — Meeting Summarizer, Action Extractor, Efficiency Analyzer, Client Call Analyzer
- **Strategy AI Team** — EOS Coach, Pattern Detective, Pod Health, Quarterly Digest
- **Project AI Team** — Project Analyst, Bug & Feature Planner, Technical Planner, Code Reviewer
- [Learn more →](../02-modules/11-ai-agent-browse.md)

### Donor Acknowledgment Letter Generator (New)
AI-powered personalized thank-you letters generated from donor profiles.

- Reads donor name, gift history, fund designation, contact notes, volunteer history
- Generates letters in the Executive Director's voice
- Action buttons: Copy · Download · Attach to Record · Edit
- Powered by edge function `generate-donor-letter` via Lovable AI Gateway
- [Learn more →](../02-modules/10-nonprofit-operations.md)

### AI Chat Assistant
Interactive chat interface for asking questions about your data.

- Query knowledge base articles
- Summarize meeting transcripts
- Get insights from client data
- [Learn more →](./ai-chat.md)

### AI Agents (Operational)
Configurable AI agents for specific tasks.

- Meeting summarizer
- Document analyzer
- Task extractor
- Custom agents
- [Learn more →](./ai-agents.md)

### Semantic Search
Find information using natural language, not just keywords.

- Search across all knowledge base
- Include meeting transcripts
- Personal knowledge files
- [Learn more →](./semantic-search.md)

### Embeddings & RAG
Retrieval-Augmented Generation for accurate AI responses.

- Automatic embedding generation
- Vector similarity search
- Context-aware responses
- [Learn more →](./embeddings.md)

---

## Quick Start

### Using Lovable AI (Recommended)
If you're using Lovable Cloud, AI features work automatically:

1. Enable AI Chat in Admin → Features
2. Start chatting!

No API key needed.

### Using Your Own API Key
For self-hosted or custom models:

1. Add API key to edge function secrets
2. Configure provider in Admin → AI Settings
3. Select your preferred model

---

## Files in This Section

| File | Description |
|------|-------------|
| [lovable-ai.md](./lovable-ai.md) | Using Lovable's built-in AI |
| [provider-routing.md](./provider-routing.md) | Configuring AI providers |
| [ai-chat.md](./ai-chat.md) | AI Chat feature guide |
| [ai-agents.md](./ai-agents.md) | Custom AI agents (operational) |
| [semantic-search.md](./semantic-search.md) | Natural language search |
| [embeddings.md](./embeddings.md) | How embeddings work |

---

## Feature Flags

AI features can be toggled in Admin → System Settings:

| Flag | Default | Description |
|------|---------|-------------|
| `enableAIChat` | On | AI Chat interface |
| `enableAIAgents` | On | Custom AI agents + Agent Browse |
| `enableSemanticSearch` | On | Vector search |
| `enableMeetingSummary` | On | Auto-summarize meetings |
