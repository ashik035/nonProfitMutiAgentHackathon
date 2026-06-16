/**
 * Navigation Structure
 *
 * Single source of truth for all navigation items across the application.
 * Both AppSidebar and AdminSidebar read from this file.
 */

import type { ModuleId } from "@/shared/config/modules";

export type AgencyRole =
  | "executive_director"
  | "development_director"
  | "finance_manager"
  | "operations_manager"
  | "admin";

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  module?: ModuleId;
  featureFlag?: string;
  adminOnly?: boolean;
  badge?: string;
  isAI?: boolean;
  children?: NavItem[];
  headerOnly?: boolean;
  agencyRoles?: AgencyRole[];
  /** Optional permission key for role-based gating (checked when ROLE_GATING_ENABLED=true) */
  requiredPermission?: { type: "module" | "agent"; key: string };
}

export interface NavGroup {
  id: string;
  title: string;
  icon: string;
  isAI?: boolean;
  module?: ModuleId;
  featureFlag?: string;
  items: NavItem[];
  agencyRoles?: AgencyRole[];
  adminOnly?: boolean;
  position?: "bottom";
}

/**
 * Dashboard - Always visible at top level (no group label)
 */
export const dashboardItem: NavItem = {
  title: "Dashboard",
  href: "/dashboard",
  icon: "LayoutDashboard",
  module: "dashboard",
};

/**
 * Main application navigation
 */
export const navigationGroups: NavGroup[] = [
  {
    id: "fundraising",
    title: "Fundraising",
    icon: "BadgeDollarSign",
    items: [
      { title: "Donor Pipeline", href: "/donor-pipeline", icon: "Users", module: "donor-pipeline", requiredPermission: { type: "module", key: "donor-pipeline" } },
      { title: "Donor Retention", href: "/donor-retention", icon: "Heart", module: "donor-retention", requiredPermission: { type: "module", key: "donor-retention" } },
      { title: "Donation Center", href: "/donations", icon: "BadgeDollarSign", module: "donations", requiredPermission: { type: "module", key: "donations" } },
    ],
  },
  {
    id: "grants",
    title: "Grants",
    icon: "FileText",
    items: [
      { title: "Grants Management", href: "/grants", icon: "FileText", module: "grants", requiredPermission: { type: "module", key: "grants" } },
      { title: "Grant Writer", href: "/grant-writer", icon: "PenTool", module: "grant-writer", requiredPermission: { type: "module", key: "grant-writer" } },
    ],
  },
  {
    id: "people",
    title: "People",
    icon: "Users",
    items: [
      { title: "Membership", href: "/membership", icon: "CreditCard", module: "membership", requiredPermission: { type: "module", key: "membership" } },
      { title: "Volunteers", href: "/volunteers", icon: "HandHeart", module: "volunteers", requiredPermission: { type: "module", key: "volunteers" } },
      { title: "Communications", href: "/communications", icon: "Mail", module: "communications", requiredPermission: { type: "module", key: "communications" } },
      { title: "Engagement Scoring", href: "/engagement-scoring", icon: "Sparkles", module: "engagement-scoring", requiredPermission: { type: "module", key: "engagement-scoring" } },
    ],
  },
  {
    id: "events",
    title: "Events",
    icon: "Calendar",
    items: [
      { title: "Events", href: "/events", icon: "Calendar", module: "events", requiredPermission: { type: "module", key: "events" } },
    ],
  },
  {
    id: "reporting",
    title: "Reporting",
    icon: "BarChart2",
    items: [
      { title: "Board Reports", href: "/board-reports", icon: "BarChart2", module: "board-reports", requiredPermission: { type: "module", key: "board-reports" } },
      { title: "Programs", href: "/programs", icon: "Target", module: "programs", requiredPermission: { type: "module", key: "programs" } },
      { title: "Impact Dashboard", href: "/impact-dashboard", icon: "BarChart3", module: "impact-dashboard", requiredPermission: { type: "module", key: "impact-dashboard" } },
      { title: "Data Health", href: "/data-health", icon: "ShieldCheck", module: "data-health", requiredPermission: { type: "module", key: "data-health" } },
      { title: "Financial Reconciliation", href: "/reconciliation", icon: "ArrowLeftRight", module: "reconciliation", requiredPermission: { type: "module", key: "reconciliation" } },
    ],
  },
  {
    id: "ai",
    title: "AI",
    icon: "Bot",
    isAI: true,
    items: [
      { title: "AI Agents", href: "/agents", icon: "Bot", isAI: true, module: "ai-agents" },
      { title: "Agent Activity", href: "/agents/activity", icon: "Activity", isAI: true, module: "ai-agents", requiredPermission: { type: "module", key: "agent-activity" } },
      { title: "AI Chat", href: "/ai-chat", icon: "MessageSquare", isAI: true },
      { title: "Voice Notes", href: "/voice-notes", icon: "Mic", isAI: true, module: "voice-notes" },
    ],
  },
  {
    id: "intelligence",
    title: "Intelligence",
    icon: "BookOpen",
    items: [
      { title: "Knowledge Base", href: "/knowledge", icon: "BookOpen" },
    ],
  },
  {
    id: "settings-group",
    title: "Settings",
    icon: "Settings",
    position: "bottom",
    items: [
      { title: "Public Presence", href: "/public-presence", icon: "Globe", module: "public-presence", requiredPermission: { type: "module", key: "public-presence" } },
      { title: "Integrations", href: "/integrations", icon: "Plug", module: "integration-center" },
      { title: "Help & Support", href: "/help", icon: "HelpCircle" },
      { title: "Settings", href: "/settings", icon: "Settings" },
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
      { title: "Admin Dashboard", href: "/admin", icon: "LayoutDashboard" },
      { title: "Employee Management", href: "/admin/team/employees", icon: "Users" },
      {
        title: "Task Configuration",
        href: "/admin/tasks/streams",
        icon: "Settings",
        headerOnly: true,
        children: [
          { title: "Task Streams", href: "/admin/tasks/streams", icon: "GitBranch" },
        ],
      },
      {
        title: "Teams & PODs",
        href: "/admin/team/pods",
        icon: "Layers",
        headerOnly: true,
        children: [
          { title: "POD Management", href: "/admin/team/pods", icon: "Users" },
          { title: "Skill Management", href: "/admin/skillmanagement", icon: "Zap" },
          { title: "RP Settings", href: "/admin/team/employee_projection", icon: "Settings" },
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
        headerOnly: true,
        children: [
          { title: "People & Invites", href: "/admin/users", icon: "Users" },
          { title: "Roles & Permissions", href: "/admin/users/roles", icon: "Shield" },
        ],
      },
      { title: "Activity Logs", href: "/admin/logs", icon: "Activity" },
    ],
  },
  {
    id: "team-resources",
    title: "TEAM & RESOURCES",
    icon: "Building2",
    items: [
      { title: "Departments", href: "/admin/team/departments", icon: "Building2" },
    ],
  },
  {
    id: "content-feedback",
    title: "CONTENT & FEEDBACK",
    icon: "MessageSquare",
    items: [
      { title: "Feedback Management", href: "/admin/feedback", icon: "MessageSquare" },
      { title: "Support Tickets", href: "/admin/support-tickets", icon: "Ticket" },
    ],
  },
  {
    id: "ai-automation",
    title: "AI & AUTOMATION",
    icon: "Brain",
    items: [
      { title: "AI Models", href: "/admin/ai-models", icon: "Brain" },
      { title: "AI Usage Analytics", href: "/admin/ai-usage", icon: "BarChart" },
      { title: "MCP Servers", href: "/admin/mcp-servers", icon: "Plug" },
    ],
  },
  {
    id: "system",
    title: "SYSTEM",
    icon: "Settings",
    items: [
      { title: "Module Management", href: "/admin/modules", icon: "Layers" },
      { title: "System Settings", href: "/admin/settings", icon: "Settings" },
      { title: "Organization Settings", href: "/admin/organization-settings", icon: "Building2" },
      { title: "Integrations", href: "/admin/integrations", icon: "Zap" },
      { title: "Vision & Roadmap", href: "/admin/roadmap", icon: "Rocket" },
      { title: "Seed Data Runner", href: "/admin/roadmap/seed", icon: "Database" },
      { title: "Deployment Status", href: "/admin/deployment", icon: "Database" },
      { title: "Environment Check", href: "/admin/environment", icon: "CheckCircle2" },
    ],
  },
];
