import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { queryKeys } from "@/lib/cache";
import {
  getAllModules,
  getNonprofitModules,
  MODULE_REGISTRY,
  type ModuleId,
  type ModuleDefinition,
} from "@/shared/config/modules";
import {
  getPresetModuleStates,
  MODULE_PRICING_TIER_SETTING_KEY,
  type PricingTierId,
} from "@/shared/config/pricingPresets";
import { getSystemSettingValue, upsertSystemSetting } from "@/lib/systemSettings";

export interface AppModuleRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  category: string | null;
  is_core: boolean | null;
  is_active: boolean | null;
  sort_order: number | null;
  page_route: string | null;
}

export interface AppModuleSetting extends ModuleDefinition {
  dbId?: string;
  enabled: boolean;
}

async function fetchAppModules(): Promise<AppModuleRow[]> {
  const { data, error } = await supabase
    .from("app_modules")
    .select("id, slug, name, description, icon, category, is_core, is_active, sort_order, page_route")
    .order("sort_order");

  if (error) throw error;
  return (data ?? []) as AppModuleRow[];
}

function mergeWithRegistry(rows: AppModuleRow[]): AppModuleSetting[] {
  const rowBySlug = new Map(rows.map((r) => [r.slug, r]));

  return getAllModules().map((def) => {
    const row = rowBySlug.get(def.id);
    return {
      ...def,
      dbId: row?.id,
      enabled: def.isCore ? true : (row?.is_active ?? def.defaultEnabled),
    };
  });
}

export function useAppModules() {
  return useQuery({
    queryKey: queryKeys.appModules.all,
    queryFn: async () => {
      const rows = await fetchAppModules();
      return mergeWithRegistry(rows);
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useNonprofitAppModules() {
  return useQuery({
    queryKey: [...queryKeys.appModules.all, "nonprofit"],
    queryFn: async () => {
      const rows = await fetchAppModules();
      const rowBySlug = new Map(rows.map((r) => [r.slug, r]));
      return getNonprofitModules().map((def) => {
        const row = rowBySlug.get(def.id);
        return {
          ...def,
          dbId: row?.id,
          enabled: def.isCore ? true : (row?.is_active ?? def.defaultEnabled),
        };
      });
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useActivePricingTier() {
  return useQuery({
    queryKey: queryKeys.appModules.pricingTier,
    queryFn: async (): Promise<PricingTierId | null> => {
      try {
        const value = await getSystemSettingValue(MODULE_PRICING_TIER_SETTING_KEY);
        if (value === "starter" || value === "growth" || value === "enterprise") {
          return value;
        }
        if (typeof value === "string") {
          if (value === "starter" || value === "growth" || value === "enterprise") {
            return value;
          }
        }
        return null;
      } catch (error) {
        console.debug("Could not load pricing tier setting:", error);
        return null;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useToggleAppModule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ slug, enabled }: { slug: ModuleId; enabled: boolean }) => {
      const mod = MODULE_REGISTRY[slug];
      if (!mod || mod.isCore) {
        throw new Error("Core modules cannot be disabled");
      }

      const { data, error } = await supabase
        .from("app_modules")
        .upsert(
          {
            name: mod.name,
            slug: mod.id,
            description: mod.description,
            icon: mod.icon,
            category: mod.category,
            is_core: mod.isCore,
            is_active: enabled,
            page_route: mod.pageRoute ?? null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "slug" }
        )
        .select("id");

      if (error) throw error;
      if (!data?.length) {
        throw new Error(`Could not save ${mod.name} — no row was written. Check admin permissions.`);
      }
    },
    onSuccess: (_, { slug, enabled }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appModules.all });
      const name = MODULE_REGISTRY[slug]?.name ?? slug;
      toast({
        title: enabled ? "Module enabled" : "Module disabled",
        description: enabled
          ? `${name} is now on and visible in navigation.`
          : `${name} is now off and hidden from navigation.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Module not updated",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useApplyPricingPreset() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (presetId: PricingTierId) => {
      const states = getPresetModuleStates(presetId);
      const updates = Object.entries(states) as [ModuleId, boolean][];

      await Promise.all(
        updates.map(async ([slug, enabled]) => {
          const mod = MODULE_REGISTRY[slug];
          if (!mod || mod.isCore) return;

          const { error } = await supabase
            .from("app_modules")
            .update({ is_active: enabled, updated_at: new Date().toISOString() })
            .eq("slug", slug);

          if (error) throw error;
        })
      );

      await upsertSystemSetting(
        MODULE_PRICING_TIER_SETTING_KEY,
        presetId,
        "Active nonprofit module pricing tier preset"
      );

      return presetId;
    },
    onSuccess: (presetId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appModules.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.appModules.pricingTier });
      toast({
        title: "Pricing preset applied",
        description: `${presetId.charAt(0).toUpperCase()}${presetId.slice(1)} tier modules configured.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to apply preset",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
