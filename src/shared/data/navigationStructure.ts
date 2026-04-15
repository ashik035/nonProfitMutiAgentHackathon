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
};

/**
 * Main application navigation
 */
export const navigationGroups: NavGroup[] = [
  {
    id: "nonprofit-ops",
    title: "Nonprofit Operations",
    icon: "ShieldCheck",
    items: [
      { title: "Data Health", href: "/data-health", icon: "ShieldCheck" },
      { title: "Grants", href: "/grants", icon: "FileText" },
      { title: "Events", href: "/events", icon: "Calendar" },
      { title: "Board Reports", href: "/board-reports", icon: "BarChart2" },
      { title: "Reconciliation", href: "/reconciliation", icon: "ArrowLeftRight" },
      { title: "Donor Pipeline", href: "/donor-pipeline", icon: "Users" },
    ],
  },
  {
    id: "ai",
    title: "AI",
    icon: "Bot",
    isAI: true,
    items: [
      { title: "AI Agents", href: "/agents", icon: "Bot", isAI: true },
      { title: "AI Chat", href: "/ai-chat", icon: "MessageSquare", isAI: true },
      { title: "Voice Notes", href: "/voice-notes", icon: "Mic", isAI: true },
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
      { title: "Integrations", href: "/integrations", icon: "Plug" },
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
      { title: "User Management", href: "/admin/users", icon: "Users" },
      { title: "Role Management", href: "/admin/roles", icon: "Shield" },
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
