# Application Modules

Nonprofit Control Tower includes several configurable modules. Enable or disable them via [Feature Flags](../07-admin/feature-flags.md).

---

## Module Overview

| Module | Description | Default | Feature Flag |
|--------|-------------|---------|--------------|
| Dashboard | Role-specific analytics (ED, DD, FM, OM) | Always on | - |
| [Nonprofit Operations](./10-nonprofit-operations.md) | Grants, Events, Board Reports, Data Health, Reconciliation | On | - |
| Donor Pipeline | Donor upgrade Kanban + AI Acknowledgment Letter Generator | On | - |
| [AI Agent Browse](./11-ai-agent-browse.md) | Discover 16 AI agents across 4 teams | On | `enableAIAgents` |
| [Knowledge Base](./07-knowledge-base.md) | Shared knowledge library + semantic search | On | `enableKnowledgeBase` |
| [AI Chat](./ai-chat.md) | AI assistant interface | On | `enableAIChat` |
| [AI Agents](./ai-agents.md) | Custom AI agents (operational) | On | `enableAIAgents` |
| [Meetings](./03-meetings.md) | Meeting management + Zoom sync | Off | `enableMeetings` |
| [Tasks](./05-actions.md) | Task tracking | On | `enableTasks` |
| Integrations | CRM, Finance, Payment, Event connections | On | - |
| Settings | User preferences and system configuration | On | - |

---

## Module Dependencies

```
┌─────────────┐
│  Dashboard  │ ◄── Displays data from all modules
└─────────────┘
       ▲
       │
┌──────┴──────┬─────────────┬─────────────┐
│  Nonprofit  │  Meetings   │    Tasks    │
│  Operations │             │             │
└─────────────┴──────┬──────┴─────────────┘
                     │
                     ▼
              ┌─────────────┐
              │ Knowledge   │ ◄── AI Chat queries this
              │    Base     │
              └─────────────┘
                     ▲
                     │
              ┌──────┴──────┐
              │   AI Chat   │
              │  AI Agents  │
              │ Agent Browse│
              └─────────────┘
```

---

## Files in This Section

| File | Description |
|------|-------------|
| [dashboard.md](./dashboard.md) | Dashboard widgets and analytics |
| [10-nonprofit-operations.md](./10-nonprofit-operations.md) | Grants, Events, Board Reports, Data Health, Reconciliation |
| [11-ai-agent-browse.md](./11-ai-agent-browse.md) | AI Agent Browse system |
| [clients.md](./clients.md) | Client management features |
| [meetings.md](./meetings.md) | Meetings and Zoom integration |
| [tasks.md](./tasks.md) | Task management |
| [knowledge-base.md](./knowledge-base.md) | Knowledge base articles |
| [personal-knowledge.md](./personal-knowledge.md) | User documents |
| [ai-chat.md](./ai-chat.md) | AI chat interface |
| [ai-agents.md](./ai-agents.md) | Custom AI agents (operational) |
| [notifications.md](./notifications.md) | Notification system |

---

## Enabling/Disabling Modules

### Via Admin UI (Recommended)
1. Go to **Admin → System Settings → Features**
2. Toggle modules on/off
3. Changes take effect immediately

### Via Database
```sql
UPDATE app_config 
SET value = 'false'::jsonb 
WHERE key = 'enableAIChat';
```

---

## Module Architecture

Each module follows a consistent pattern:

```
src/
├── pages/
│   └── ModuleName.tsx      # Main page component
├── components/
│   └── module-name/        # Module-specific components
├── hooks/
│   └── useModuleName.ts    # Data fetching hooks
└── lib/
    └── module-utils.ts     # Utility functions
```

---

## Adding New Modules

See [Development Guide](../03-development/) for:
- Creating new pages
- Adding feature flags
- Database migrations
- Edge functions
