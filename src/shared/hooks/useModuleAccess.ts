import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  isModuleBundled,
  isNonprofitModule,
  type ModuleId,
  MODULE_REGISTRY,
} from "@/shared/config/modules";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import { queryKeys } from "@/lib/cache";

interface ModuleAccessResult {
  /** Check if a module is accessible to the current user */
  hasModule: (moduleId: ModuleId) => boolean;
  /** All module IDs accessible to the current user */
  enabledModules: ModuleId[];
  /** Loading state */
  isLoading: boolean;
}

/**
 * Hook to check module access for the current user.
 *
 * Resolution order:
 * 1. Build-time: Is the module bundled? (env vars)
 * 2. Runtime: Is the module active in app_modules? (admin toggle)
 * 3. Legacy: Are the corresponding feature flags enabled? (app_config)
 * 4. Per-user: Does the user have access? (user_module_permissions, future)
 *
 * Core modules (platform, admin, dashboard, ai-agents) are always accessible.
 */
export function useModuleAccess(): ModuleAccessResult {
  const { isFeatureEnabled, isLoading: flagsLoading } = useFeatureFlags();

  const { data: dbModules, isLoading: modulesLoading } = useQuery({
    queryKey: queryKeys.appModules.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_modules")
        .select("slug, is_active")
        .order("sort_order");

      if (error) {
        console.debug("app_modules table not available, using defaults:", error.message);
        return null;
      }

      return data as Array<{ slug: string; is_active: boolean }>;
    },
    staleTime: 1000 * 60 * 10,
    retry: false,
  });

  const hasModule = (moduleId: ModuleId): boolean => {
    const mod = MODULE_REGISTRY[moduleId];
    if (!mod) return false;

    if (mod.isCore) return true;

    if (!isModuleBundled(moduleId)) return false;

    if (dbModules !== null && dbModules !== undefined) {
      const dbEntry = dbModules.find((m) => m.slug === moduleId);
      if (dbEntry) return dbEntry.is_active ?? false;
      if (isNonprofitModule(moduleId)) return mod.defaultEnabled;
    }

    const primaryFlagMap: Partial<Record<ModuleId, string>> = {
      actions: "enableTasks",
      meetings: "enableMeetings",
      knowledge: "enableKnowledgeBase",
      "business-dev": "enableClients",
    };

    const primaryFlag = primaryFlagMap[moduleId];
    if (primaryFlag) {
      return isFeatureEnabled(primaryFlag as Parameters<typeof isFeatureEnabled>[0]);
    }

    if (isNonprofitModule(moduleId)) return mod.defaultEnabled;

    return true;
  };

  const enabledModules = (Object.keys(MODULE_REGISTRY) as ModuleId[]).filter((id) =>
    hasModule(id)
  );

  return {
    hasModule,
    enabledModules,
    isLoading: flagsLoading || modulesLoading,
  };
}
