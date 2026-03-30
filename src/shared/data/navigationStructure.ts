/**
 * Navigation Structure
 *
 * Single source of truth for all navigation items across the application.
 * Both AppSidebar and AdminSidebar read from this file.
 *
 * Items are filtered at runtime based on:
 * - Module access (useModuleAccess)
 * - Feature flags (useFeatureFlags)
 * - User role
 */

import type { ModuleId } from "@/shared/config/modules";

/**
 * Organization roles that can see a nav item or group.
 * When omitted the item is visible to all roles.
 */
export type AgencyRole =
  | "executive_director"
  | "development_director"
  | "finance_manager"
  | "operations_manager"
  | "admin";

export interface NavItem {
  title: string;
  href: string;
  icon: string; // lucide icon name — resolved in the sidebar component
  module?: ModuleId; // Module that must be enabled for this item to appear
  featureFlag?: string; // Legacy feature flag check
  adminOnly?: boolean;
  badge?: string;
  isAI?: boolean; // Shows AI indicator animation
  children?: NavItem[]; // Nested sub-items (e.g., Streams under Tasks)
  /** When true, parent is rendered as a section header only (collapsible), not a link; children are the links */
  headerOnly?: boolean;
  /** When set, only these organization roles see the item. Admins always see everything. */
  agencyRoles?: AgencyRole[];
}

export interface NavGroup {
  id: string;
  title: string;
  icon: string;
  isAI?: boolean; // Shows AI indicator animation
  module?: ModuleId;
  featureFlag?: string;
  items: NavItem[];
  /** When set, only these organization roles see the group. Admins always see everything. */
  agencyRoles?: AgencyRole[];
  /** When true, group is only visible to admin users */
  adminOnly?: boolean;
}

/**
 * Dashboard - Always visible at top level
 */
export const dashboardItem: NavItem = {
  title: "Dashboard",
  href: "/dashboard",
  icon: "LayoutDashboard",
};

/**
 * Main application navigation - Grouped structure
 */
export const navigationGroups: NavGroup[] = [
  {
    id: "nonprofit-ops",
    title: "Nonprofit Operations",
    icon: "ShieldCheck",
    items: [
      { title: "Data Health", href: "/data-health", icon: "ShieldCheck", agencyRoles: ["executive_director", "finance_manager", "operations_manager"] },
      { title: "Reconciliation", href: "/reconciliation", icon: "ArrowLeftRight", agencyRoles: ["finance_manager", "operations_manager"] },
      { title: "Events", href: "/events", icon: "CalendarDays", agencyRoles: ["executive_director", "development_director"] },
      { title: "Grants", href: "/grants", icon: "BookOpen", agencyRoles: ["executive_director", "development_director", "finance_manager"] },
      { title: "Board Reports", href: "/board-reports", icon: "FileText", agencyRoles: ["executive_director"] },
      { title: "Browse Agents", href: "/agents", icon: "Sparkles", isAI: true },
    ],
  },
  {
    id: "business-dev",
    title: "Donor & Grants Pipeline",
    icon: "Heart",
    adminOnly: true,
    module: "business-dev",
    items: [
      {
        title: "Organizations",
        href: "/clients",
        icon: "Building2",
        module: "business-dev",
        featureFlag: "enableClients",
      },
      {
        title: "Contacts",
        href: "/contacts",
        icon: "Contact",
        module: "business-dev",
        featureFlag: "enableClients",
      },
      {
        title: "Cultivation Pipeline",
        href: "/deals",
        icon: "Handshake",
        module: "business-dev",
        featureFlag: "enableClients",
        headerOnly: true,
        children: [
          { title: "Pipeline Dashboard", href: "/deals?tab=overview", icon: "LayoutDashboard", module: "business-dev", featureFlag: "enableClients" },
          { title: "All Prospects", href: "/deals", icon: "LayoutDashboard", module: "business-dev", featureFlag: "enableClients" },
          { title: "Identify", href: "/deals?tab=all&stage=lead", icon: "Users", module: "business-dev", featureFlag: "enableClients" },
          { title: "Qualify", href: "/deals?tab=all&stage=discovery", icon: "Search", module: "business-dev", featureFlag: "enableClients" },
          { title: "Cultivate", href: "/deals?tab=all&stage=estimation", icon: "Calculator", module: "business-dev", featureFlag: "enableClients" },
          { title: "Propose", href: "/deals?tab=all&stage=proposal", icon: "FileText", module: "business-dev", featureFlag: "enableClients" },
        ],
      },
      {
        title: "Donor Follow-Up",
        href: "/lead-followup",
        icon: "Target",
        module: "lead-followup",
      },
    ],
  },
  {
    id: "work-management",
    title: "Work Management",
    icon: "ListTodo",
    adminOnly: true,
    items: [
      {
        title: "Tasks",
        href: "/tasks",
        icon: "CheckSquare",
        module: "actions",
        featureFlag: "enableTasks",
      },
      {
        title: "Projects",
        href: "/projects",
        icon: "FolderKanban",
        module: "projects",
      },
    ],
  },
  {
    id: "meetings",
    title: "Meetings",
    icon: "Calendar",
    module: "meetings",
    adminOnly: true,
      {
        title: "All Meetings",
        href: "/meetings/schedule",
        icon: "Calendar",
        module: "meetings",
        featureFlag: "enableMeetings",
      },
      {
        title: "Transcripts",
        href: "/meetings/transcripts",
        icon: "ScrollText",
        module: "meetings",
        featureFlag: "enableMeetings",
      },
      {
        title: "Series",
        href: "/meetings/series",
        icon: "Repeat",
        module: "meetings",
        featureFlag: "enableMeetings",
      },
      {
        title: "Pending Assignments",
        href: "/meetings/pending-assignments",
        icon: "ClipboardCheck",
        module: "meetings",
        featureFlag: "enableMeetings",
      },
      {
        title: "AI Match",
        href: "/meetings/transcripts/ai-match",
        icon: "Sparkles",
        module: "meetings",
        featureFlag: "enableMeetings",
      },
    ],
  },
  {
    id: "knowledge",
    title: "Knowledge",
    icon: "BookOpen",
    module: "knowledge",
    items: [
      {
        title: "Knowledge Base",
        href: "/knowledge",
        icon: "BookOpen",
        module: "knowledge",
        featureFlag: "enableKnowledgeBase",
      },
      {
        title: "Semantic Search",
        href: "/knowledge/search",
        icon: "Sparkles",
        module: "knowledge",
        featureFlag: "enableKnowledgeBase",
      },
      {
        title: "Personal Library",
        href: "/personal-knowledge",
        icon: "BookMarked",
        module: "knowledge",
        featureFlag: "enablePersonalKnowledge",
      },
    ],
  },
  {
    id: "ai",
    title: "AI",
    icon: "Bot",
    adminOnly: true,
    items: [
      {
        title: "AI Agents",
        href: "/ai-agents",
        icon: "Bot",
        featureFlag: "enableAIAgents",
      },
    ],
  },
  {
    id: "operations",
    title: "Operations",
    icon: "Settings2",
    adminOnly: true,
    agencyRoles: ["executive_director", "development_director"], // Only leadership roles see operations
    items: [
      {
        title: "Feedback",
        href: "/feedback",
        icon: "MessageCircle",
        featureFlag: "enableFeedback",
      },
    ],
  },
  {
    id: "system-tools",
    title: "System & Tools",
    icon: "Wrench",
    adminOnly: true,
    items: [
      {
        title: "Sessions",
        href: "/sessions",
        icon: "Monitor",
      },
      {
        title: "Feedback",
        href: "/feedback",
        icon: "MessageCircle",
        featureFlag: "enableFeedback",
      },
      {
        title: "Help & Guides",
        href: "/help",
        icon: "HelpCircle",
      },
    ],
  },
];

/**
 * Legacy flat navigation - maintained for backward compatibility
 * @deprecated Use navigationGroups instead
 */
export const mainNavigation: NavItem[] = [
  dashboardItem,
  ...navigationGroups.flatMap((group) =>
    group.items.flatMap((item) => [item, ...(item.children || [])])
  ),
];

/**
 * Admin panel navigation (admin sidebar)
 */
export const adminNavigation: NavGroup[] = [
  {
    id: "admin-dashboard",
    title: "PEOPLE & PERFORMANCE",
    icon: "LayoutDashboard",
    items: [
      {
        title: "Admin Dashboard",
        href: "/admin",
        icon: "LayoutDashboard",
      },
      {
        title: "Employee Management",
        href: "/admin/team/employees",
        icon: "Users",
      },
      {
        title: "Task Configuration",
        href: "/admin/tasks/streams",
        icon: "Settings",
        headerOnly: true,
        children: [
          {
            title: "Task Streams",
            href: "/admin/tasks/streams",
            icon: "GitBranch",
          },
        ],
      },
      {
        title: "Teams & PODs",
        href: "/admin/team/pods",
        icon: "Layers",
        headerOnly: true,
        children: [
          {
            title: "POD Management",
            href: "/admin/team/pods",
            icon: "Users",
          },
          {
            title: "Skill Management",
            href: "/admin/skillmanagement",
            icon: "Zap",
          },
          {
            title: "RP Settings",
            href: "/admin/team/employee_projection",
            icon: "Settings",
          },
        ],
      },
    ],
  },
  {
    id: "knowledge-ai",
    title: "KNOWLEDGE & AI",
    icon: "Brain",
    items: [
      {
        title: "AI Hub",
        href: "/admin/ai-usage",
        icon: "Brain",
        headerOnly: true,
        children: [
          { title: "Dashboard", href: "/admin/ai", icon: "LayoutDashboard" },
          { title: "AI Agents", href: "/admin/ai/agents", icon: "Bot" },
          { title: "Agent Analytics", href: "/admin/ai/agent-analytics", icon: "BarChart3" },
          { title: "Agent Categories", href: "/admin/ai/agent-categories", icon: "FolderOpen" },
          { title: "Prompt Templates", href: "/admin/ai/prompt-templates", icon: "FileText" },
          { title: "Email Drafting", href: "/admin/ai/email-drafting", icon: "MessageSquare" },
          { title: "Deal Coaching", href: "/admin/ai/deal-coaching", icon: "Target" },
        ],
      },
      {
        title: "Semantic Search",
        href: "/admin/ai/semantic-search",
        icon: "Search",
        headerOnly: true,
        children: [
          { title: "Search", href: "/admin/ai/semantic-search", icon: "Search" },
          { title: "Embeddings", href: "/admin/ai/embeddings", icon: "Brain" },
        ],
      },
      {
        title: "User Memory",
        href: "/admin/memory/dashboard",
        icon: "Brain",
        headerOnly: true,
        children: [
          { title: "Memory Dashboard", href: "/admin/memory/dashboard", icon: "LayoutDashboard" },
          { title: "User Memory Stats", href: "/admin/memory/user-stats", icon: "BarChart3" },
          { title: "Search Analytics", href: "/admin/memory/search", icon: "BarChart3" },
          { title: "Team Learning Patterns", href: "/admin/memory/team-learning-patterns", icon: "Users" },
        ],
      },
      {
        title: "Knowledge Base",
        href: "/admin/knowledge/common",
        icon: "BookOpen",
        headerOnly: true,
        children: [
          { title: "Common Knowledge", href: "/admin/knowledge/common", icon: "Globe" },
          { title: "Processing Queue", href: "/admin/knowledge/analytics", icon: "ClipboardList" },
          { title: "Sources", href: "/admin/knowledge/sources", icon: "Database" },
          { title: "Categories", href: "/admin/knowledge/categories", icon: "FolderOpen" },
          { title: "Batch Upload", href: "/admin/knowledge/files", icon: "Upload" },
          { title: "Files", href: "/admin/knowledge/files", icon: "FileText" },
          { title: "Sync Status", href: "/admin/knowledge/sync-status", icon: "RefreshCw" },
          { title: "Gemini RAG", href: "/admin/knowledge/gemini", icon: "Sparkles" },
        ],
      },
    ],
  },
  {
    id: "users-access",
    title: "USERS & ACCESS",
    icon: "Users",
    items: [
      {
        title: "User Management",
        href: "/admin/users",
        icon: "Users",
      },
      {
        title: "Role Management",
        href: "/admin/roles",
        icon: "Shield",
      },
      {
        title: "Activity Logs",
        href: "/admin/logs",
        icon: "Activity",
      },
    ],
  },
  {
    id: "team-resources",
    title: "TEAM & RESOURCES",
    icon: "Building2",
    items: [
      {
        title: "Departments",
        href: "/admin/team/departments",
        icon: "Building2",
      },
    ],
  },
  {
    id: "content-feedback",
    title: "CONTENT & FEEDBACK",
    icon: "MessageSquare",
    items: [
      {
        title: "Feedback Management",
        href: "/admin/feedback",
        icon: "MessageSquare",
      },
    ],
  },
  {
    id: "ai-automation",
    title: "AI & AUTOMATION",
    icon: "Brain",
    items: [
      {
        title: "AI Models",
        href: "/admin/ai-models",
        icon: "Brain",
      },
      {
        title: "AI Usage Analytics",
        href: "/admin/ai-usage",
        icon: "BarChart",
      },
      {
        title: "MCP Servers",
        href: "/admin/mcp-servers",
        icon: "Plug",
      },
    ],
  },
  {
    id: "system",
    title: "SYSTEM",
    icon: "Settings",
    items: [
      {
        title: "System Settings",
        href: "/admin/settings",
        icon: "Settings",
      },
      {
        title: "Organization Settings",
        href: "/admin/organization-settings",
        icon: "Building2",
      },
      {
        title: "Integrations",
        href: "/admin/integrations",
        icon: "Zap",
      },
      {
        title: "Vision & Roadmap",
        href: "/admin/roadmap",
        icon: "Rocket",
      },
      {
        title: "Seed Data Runner",
        href: "/admin/roadmap/seed",
        icon: "Database",
      },
      {
        title: "Deployment Status",
        href: "/admin/deployment",
        icon: "Database",
      },
      {
        title: "Environment Check",
        href: "/admin/environment",
        icon: "CheckCircle2",
      },
    ],
  },
];
