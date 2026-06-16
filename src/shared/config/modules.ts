/**
 * Module Registry
 *
 * Defines the available modules, their metadata, and provides runtime checks.
 *
 * Resolution order:
 * 1. Build-time: VITE_MODULE_* env vars determine if module code is included
 * 2. Runtime: `app_modules` DB table determines if module is active (admin toggle)
 * 3. Per-user: `user_module_permissions` table determines per-user access
 *
 * This file handles layer 1 (build-time). Layers 2 & 3 are handled by
 * the useModuleAccess() hook.
 *
 * Feature-flag policy: Some modules (meetings, knowledge, actions, business-dev)
 * also use requiresFeatureFlag for runtime toggling via app_config. Projects
 * are module-only (no feature flag); enable/disable via module registry.
 */

import { env } from "./env";

/** Platform / legacy Control Tower module IDs */
export type PlatformModuleId =
  | "platform"
  | "meetings"
  | "projects"
  | "actions"
  | "business-dev"
  | "lead-followup"
  | "knowledge"
  | "admin";

/** Nonprofit Control Tower page module IDs */
export type NonprofitModuleId =
  | "dashboard"
  | "ai-agents"
  | "board-reports"
  | "grants"
  | "donor-pipeline"
  | "data-health"
  | "reconciliation"
  | "events"
  | "voice-notes"
  | "integration-center"
  | "donor-retention"
  | "programs"
  | "membership"
  | "volunteers"
  | "donations"
  | "communications"
  | "grant-writer"
  | "impact-dashboard"
  | "public-presence"
  | "engagement-scoring";

export type ModuleId = PlatformModuleId | NonprofitModuleId;

export type ModuleCategory =
  | "core"
  | "business"
  | "intelligence"
  | "operations"
  | "nonprofit";

export type PricingTierId = "starter" | "growth" | "enterprise";

export interface ModuleDefinition {
  id: ModuleId;
  name: string;
  description: string;
  icon: string; // lucide icon name
  category: ModuleCategory;
  isCore: boolean; // Core modules cannot be disabled
  dependencies: ModuleId[];
  defaultEnabled: boolean;
  featureFlags: string[]; // Legacy app_config feature flags this module covers
  pageRoute?: string;
  pricingTier?: PricingTierId;
}

/** All nonprofit module IDs (for presets and migrations). */
export const NONPROFIT_MODULE_IDS: NonprofitModuleId[] = [
  "dashboard",
  "ai-agents",
  "board-reports",
  "grants",
  "donor-pipeline",
  "data-health",
  "reconciliation",
  "events",
  "voice-notes",
  "integration-center",
  "donor-retention",
  "programs",
  "membership",
  "volunteers",
  "donations",
  "communications",
  "grant-writer",
  "impact-dashboard",
  "public-presence",
  "engagement-scoring",
];

function nonprofitModule(
  def: Omit<ModuleDefinition, "dependencies" | "featureFlags"> & {
    dependencies?: ModuleId[];
    featureFlags?: string[];
  }
): ModuleDefinition {
  return {
    dependencies: ["platform"],
    featureFlags: [],
    ...def,
  };
}

/**
 * Master module registry.
 * This is the single source of truth for all module definitions.
 */
export const MODULE_REGISTRY: Record<ModuleId, ModuleDefinition> = {
  platform: {
    id: "platform",
    name: "Platform Core",
    description: "Authentication, layouts, navigation, UI components, and configuration",
    icon: "Layout",
    category: "core",
    isCore: true,
    dependencies: [],
    defaultEnabled: true,
    featureFlags: [],
  },
  actions: {
    id: "actions",
    name: "Actions",
    description: "Standalone task management with streams, comments, and subtasks",
    icon: "CheckSquare",
    category: "operations",
    isCore: false,
    dependencies: ["platform"],
    defaultEnabled: true,
    featureFlags: ["enableTasks"],
  },
  meetings: {
    id: "meetings",
    name: "Meetings",
    description: "Meeting lifecycle management with AI summaries and Zoom integration",
    icon: "Calendar",
    category: "operations",
    isCore: false,
    dependencies: ["platform"],
    defaultEnabled: false,
    featureFlags: ["enableMeetings"],
  },
  knowledge: {
    id: "knowledge",
    name: "Knowledge Base",
    description: "Knowledge management with vector embeddings and semantic search",
    icon: "BookOpen",
    category: "intelligence",
    isCore: false,
    dependencies: ["platform"],
    defaultEnabled: true,
    featureFlags: ["enableKnowledgeBase", "enablePersonalKnowledge", "enableSemanticSearch"],
  },
  projects: {
    id: "projects",
    name: "Projects",
    description: "Project lifecycle management with billing, milestones, and resource projection",
    icon: "FolderKanban",
    category: "business",
    isCore: false,
    dependencies: ["platform"],
    defaultEnabled: true,
    featureFlags: [],
  },
  "business-dev": {
    id: "business-dev",
    name: "Business Development",
    description: "Deal pipeline, client management, contacts, and CRM integration",
    icon: "TrendingUp",
    category: "business",
    isCore: false,
    dependencies: ["platform"],
    defaultEnabled: true,
    featureFlags: ["enableClients"],
  },
  "lead-followup": {
    id: "lead-followup",
    name: "Lead Follow-Up",
    description: "Contact management and engagement tracking with AI-powered sentiment analysis and email automation",
    icon: "Target",
    category: "business",
    isCore: false,
    dependencies: ["platform", "business-dev"],
    defaultEnabled: true,
    featureFlags: [],
  },
  admin: {
    id: "admin",
    name: "Admin",
    description: "Administrative control panel for platform configuration",
    icon: "Shield",
    category: "core",
    isCore: true,
    dependencies: ["platform"],
    defaultEnabled: true,
    featureFlags: [],
  },

  // ── Nonprofit Control Tower modules ──────────────────────────────────────
  dashboard: nonprofitModule({
    id: "dashboard",
    name: "Dashboard",
    description: "Role-based executive and operations dashboards",
    icon: "LayoutDashboard",
    category: "nonprofit",
    isCore: true,
    defaultEnabled: true,
    pageRoute: "/dashboard",
    pricingTier: "starter",
  }),
  "ai-agents": nonprofitModule({
    id: "ai-agents",
    name: "AI Agents",
    description: "Browse and run AI agent teams across fundraising, grants, and operations",
    icon: "Bot",
    category: "nonprofit",
    isCore: true,
    defaultEnabled: true,
    pageRoute: "/agents",
    pricingTier: "starter",
  }),
  "board-reports": nonprofitModule({
    id: "board-reports",
    name: "Board Reports",
    description: "Board-ready reporting and executive summaries",
    icon: "BarChart2",
    category: "nonprofit",
    isCore: false,
    defaultEnabled: true,
    pageRoute: "/board-reports",
    pricingTier: "starter",
  }),
  grants: nonprofitModule({
    id: "grants",
    name: "Grants",
    description: "Grants pipeline, deadlines, and compliance tracking",
    icon: "FileText",
    category: "nonprofit",
    isCore: false,
    defaultEnabled: true,
    pageRoute: "/grants",
    pricingTier: "starter",
  }),
  "donor-pipeline": nonprofitModule({
    id: "donor-pipeline",
    name: "Donor Pipeline",
    description: "Major gift pipeline and prospect management",
    icon: "Users",
    category: "nonprofit",
    isCore: false,
    defaultEnabled: true,
    pageRoute: "/donor-pipeline",
    pricingTier: "starter",
  }),
  "data-health": nonprofitModule({
    id: "data-health",
    name: "Data Health",
    description: "CRM data quality monitoring and integrity checks",
    icon: "ShieldCheck",
    category: "nonprofit",
    isCore: false,
    defaultEnabled: true,
    pageRoute: "/data-health",
    pricingTier: "growth",
  }),
  reconciliation: nonprofitModule({
    id: "reconciliation",
    name: "Reconciliation",
    description: "Financial reconciliation and fund accounting",
    icon: "ArrowLeftRight",
    category: "nonprofit",
    isCore: false,
    defaultEnabled: true,
    pageRoute: "/reconciliation",
    pricingTier: "growth",
  }),
  events: nonprofitModule({
    id: "events",
    name: "Events",
    description: "Event lifecycle management, ticketing, and post-event intelligence",
    icon: "Calendar",
    category: "nonprofit",
    isCore: false,
    defaultEnabled: true,
    pageRoute: "/events",
    pricingTier: "growth",
  }),
  "voice-notes": nonprofitModule({
    id: "voice-notes",
    name: "Voice Notes",
    description: "Capture and transcribe voice notes with AI action extraction",
    icon: "Mic",
    category: "nonprofit",
    isCore: false,
    defaultEnabled: true,
    pageRoute: "/voice-notes",
    pricingTier: "growth",
  }),
  "integration-center": nonprofitModule({
    id: "integration-center",
    name: "Integration Center",
    description: "Connect CRM, email, calendar, and accounting integrations",
    icon: "Plug",
    category: "nonprofit",
    isCore: false,
    defaultEnabled: true,
    pageRoute: "/integrations",
    pricingTier: "growth",
  }),
  "donor-retention": nonprofitModule({
    id: "donor-retention",
    name: "Donor Retention",
    description: "Lapsed donor re-engagement and retention campaigns",
    icon: "Heart",
    category: "nonprofit",
    isCore: false,
    defaultEnabled: false,
    pageRoute: "/donor-retention",
    pricingTier: "growth",
  }),
  programs: nonprofitModule({
    id: "programs",
    name: "Programs",
    description: "Program outcomes tracking and impact reporting",
    icon: "Target",
    category: "nonprofit",
    isCore: false,
    defaultEnabled: false,
    pageRoute: "/programs",
    pricingTier: "growth",
  }),
  membership: nonprofitModule({
    id: "membership",
    name: "Membership",
    description: "Member directory, tiers, renewals, and onboarding",
    icon: "CreditCard",
    category: "nonprofit",
    isCore: false,
    defaultEnabled: false,
    pageRoute: "/membership",
    pricingTier: "enterprise",
  }),
  volunteers: nonprofitModule({
    id: "volunteers",
    name: "Volunteers",
    description: "Volunteer roster, shift scheduling, and hour tracking",
    icon: "HandHeart",
    category: "nonprofit",
    isCore: false,
    defaultEnabled: false,
    pageRoute: "/volunteers",
    pricingTier: "enterprise",
  }),
  donations: nonprofitModule({
    id: "donations",
    name: "Donations",
    description: "Donation center, campaigns, and gift tracking",
    icon: "BadgeDollarSign",
    category: "nonprofit",
    isCore: false,
    defaultEnabled: false,
    pageRoute: "/donations",
    pricingTier: "enterprise",
  }),
  communications: nonprofitModule({
    id: "communications",
    name: "Communications",
    description: "Email campaigns, templates, and donor outreach",
    icon: "Mail",
    category: "nonprofit",
    isCore: false,
    defaultEnabled: false,
    pageRoute: "/communications",
    pricingTier: "enterprise",
  }),
  "grant-writer": nonprofitModule({
    id: "grant-writer",
    name: "Grant Writer",
    description: "AI-assisted grant proposal drafting and review",
    icon: "PenTool",
    category: "nonprofit",
    isCore: false,
    defaultEnabled: false,
    pageRoute: "/grant-writer",
    pricingTier: "enterprise",
  }),
  "impact-dashboard": nonprofitModule({
    id: "impact-dashboard",
    name: "Impact Dashboard",
    description: "Executive impact metrics and annual report generation",
    icon: "BarChart3",
    category: "nonprofit",
    isCore: false,
    defaultEnabled: false,
    pageRoute: "/impact-dashboard",
    pricingTier: "enterprise",
  }),
  "public-presence": nonprofitModule({
    id: "public-presence",
    name: "Public Presence",
    description: "Website layer, public pages, and brand presence settings",
    icon: "Globe",
    category: "nonprofit",
    isCore: false,
    defaultEnabled: false,
    pageRoute: "/public-presence",
    pricingTier: "enterprise",
  }),
  "engagement-scoring": nonprofitModule({
    id: "engagement-scoring",
    name: "Engagement Scoring",
    description: "Member engagement scores and AI next-best-action recommendations",
    icon: "Sparkles",
    category: "nonprofit",
    isCore: false,
    defaultEnabled: false,
    pageRoute: "/engagement-scoring",
    pricingTier: "enterprise",
  }),
};

/** Returns true if the module is a nonprofit CT page module. */
export function isNonprofitModule(moduleId: ModuleId): moduleId is NonprofitModuleId {
  return NONPROFIT_MODULE_IDS.includes(moduleId as NonprofitModuleId);
}

/**
 * Check if a module is enabled at build time (via env vars).
 * Core modules and all nonprofit modules are always bundled.
 */
export function isModuleBundled(moduleId: ModuleId): boolean {
  const mod = MODULE_REGISTRY[moduleId];
  if (!mod) return false;
  if (mod.isCore) return true;
  if (isNonprofitModule(moduleId)) return true;

  const envMap: Record<string, boolean> = {
    meetings: env.modules.meetings,
    projects: env.modules.projects,
    actions: env.modules.actions,
    "business-dev": env.modules.businessDev,
    knowledge: env.modules.knowledge,
  };

  return envMap[moduleId] ?? mod.defaultEnabled;
}

/**
 * Get all bundled (build-time enabled) modules.
 */
export function getBundledModules(): ModuleDefinition[] {
  return Object.values(MODULE_REGISTRY).filter((mod) => isModuleBundled(mod.id));
}

/**
 * Get all module definitions.
 */
export function getAllModules(): ModuleDefinition[] {
  return Object.values(MODULE_REGISTRY);
}

/**
 * Get nonprofit module definitions only.
 */
export function getNonprofitModules(): ModuleDefinition[] {
  return NONPROFIT_MODULE_IDS.map((id) => MODULE_REGISTRY[id]);
}

/**
 * Get a module definition by ID.
 */
export function getModule(moduleId: ModuleId): ModuleDefinition | undefined {
  return MODULE_REGISTRY[moduleId];
}
