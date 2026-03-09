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

/**
 * Returns the current user's agency role.
 *
 * Agency roles are separate from the DB auth roles (admin / moderator / user)
 * and are stored in user_role_preferences.
 *
 * - agencyRole: null means no preference row exists → shows role-selection modal
 * - isAdmin: true for admin/moderator DB roles (existing behaviour)
 */
export function useAgencyRole() {
  const { profile } = useAuth();

  const raw = profile?.agencyRole ?? null;
  // Resolve legacy values to the new nonprofit roles
  const agencyRole: AgencyRole | null = raw
    ? (LEGACY_ROLE_MAP[raw] ?? (raw as AgencyRole))
    : null;

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
