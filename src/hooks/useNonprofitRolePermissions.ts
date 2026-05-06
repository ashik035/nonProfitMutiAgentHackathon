/**
 * useNonprofitRolePermissions
 *
 * Reads the current user's nonprofit role and their permissions
 * from the nonprofit_role_permissions table.
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAgencyRole, type AgencyRole } from "@/hooks/useAgencyRole";
import { ROLE_GATING_ENABLED } from "@/shared/config/roleGating";

interface RolePermission {
  role: string;
  resource_type: string;
  resource_key: string;
  granted: boolean;
}

export function useNonprofitRolePermissions() {
  const { agencyRole, isAdmin } = useAgencyRole();

  const { data: permissions = [], isLoading } = useQuery({
    queryKey: ["nonprofit-role-permissions", agencyRole],
    queryFn: async () => {
      if (!agencyRole) return [];
      const { data, error } = await supabase
        .from("nonprofit_role_permissions" as any)
        .select("role, resource_type, resource_key, granted")
        .eq("role", agencyRole)
        .eq("granted", true);
      if (error) {
        console.warn("Failed to load role permissions:", error.message);
        return [];
      }
      return (data ?? []) as unknown as RolePermission[];
    },
    enabled: ROLE_GATING_ENABLED && !!agencyRole && !isAdmin,
    staleTime: 5 * 60 * 1000,
  });

  /**
   * Check if the current user has access to a resource.
   * When gating is disabled or user is admin/ED, always returns true.
   */
  const hasPermission = (resourceType: "module" | "agent", resourceKey: string): boolean => {
    if (!ROLE_GATING_ENABLED) return true;
    if (isAdmin) return true;
    if (agencyRole === "executive_director") return true;
    if (!agencyRole) return true; // no role assigned = full access (legacy)
    return permissions.some(
      (p) => p.resource_type === resourceType && p.resource_key === resourceKey
    );
  };

  /**
   * Check module access by resource key (e.g. "data-health", "grants")
   */
  const hasModulePermission = (moduleKey: string): boolean => hasPermission("module", moduleKey);

  /**
   * Check agent access by slug (e.g. "crm-data-integrity")
   */
  const hasAgentPermission = (agentSlug: string): boolean => hasPermission("agent", agentSlug);

  return {
    agencyRole,
    isAdmin,
    permissions,
    isLoading,
    hasPermission,
    hasModulePermission,
    hasAgentPermission,
  };
}
