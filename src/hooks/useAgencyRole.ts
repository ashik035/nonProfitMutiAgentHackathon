import { useAuth } from "@/contexts/AuthContext";

export type AgencyRole =
  | "executive_director"
  | "development_director"
  | "finance_manager"
  | "operations_manager"
  | "admin";

export const ROLE_DISPLAY_NAMES: Record<AgencyRole, string> = {
  executive_director: "Executive Director",
  development_director: "Development Director",
  finance_manager: "Finance Manager",
  operations_manager: "Operations Manager",
  admin: "Administrator",
};

/** Maps legacy role values (owner/pm/ic) to the new nonprofit roles. */
const LEGACY_ROLE_MAP: Record<string, AgencyRole> = {
  owner: "executive_director",
  pm: "development_director",
  ic: "operations_manager",
};

const DEMO_ROLE_KEY = "demo-role-override";

function getDemoRoleOverride(): AgencyRole | null {
  try {
    const stored = localStorage.getItem(DEMO_ROLE_KEY);
    if (stored && ["executive_director", "development_director", "finance_manager", "operations_manager"].includes(stored)) {
      return stored as AgencyRole;
    }
  } catch {}
  return null;
}

/**
 * Returns the current user's agency role.
 *
 * Checks localStorage for a demo role override first (set by the DemoRoleSwitcher).
 * Falls back to the profile's agencyRole.
 */
export function useAgencyRole() {
  const { profile } = useAuth();

  const demoOverride = getDemoRoleOverride();
  const raw = profile?.agencyRole ?? null;
  // Demo override takes priority, then resolve legacy values
  const agencyRole: AgencyRole | null = demoOverride
    ?? (raw ? (LEGACY_ROLE_MAP[raw] ?? (raw as AgencyRole)) : null);

  const isAdmin = profile?.role === "admin" || profile?.role === "moderator";

  return {
    agencyRole,
    isAdmin,
    isExecutiveDirector: agencyRole === "executive_director",
    isDevelopmentDirector: agencyRole === "development_director",
    isFinanceManager: agencyRole === "finance_manager",
    isOperationsManager: agencyRole === "operations_manager",
    isAdminRole: agencyRole === "admin",
    // Legacy compat helpers (kept so sidebar filtering continues to work)
    isOwner: agencyRole === "executive_director",
    isPM: agencyRole === "development_director",
    isIC: agencyRole === "operations_manager" || agencyRole === null,
  };
}
