import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { ApplyPresetDialog } from "@/components/admin/ApplyPresetDialog";
import {
  useAppModules,
  useActivePricingTier,
  useToggleAppModule,
  useApplyPricingPreset,
  type AppModuleSetting,
} from "@/hooks/useAppModules";
import {
  PRICING_PRESET_LIST,
  PRICING_PRESETS,
  getPresetApplySummary,
  getPresetModuleCount,
} from "@/shared/config/pricingPresets";
import {
  MODULE_REGISTRY,
  NONPROFIT_MODULE_IDS,
  type ModuleCategory,
  type ModuleId,
  type NonprofitModuleId,
  type PricingTierId,
} from "@/shared/config/modules";

const CATEGORY_LABELS: Record<ModuleCategory, string> = {
  core: "Core",
  nonprofit: "Nonprofit",
  business: "Business",
  intelligence: "Intelligence",
  operations: "Operations",
};

const CATEGORY_ORDER: ModuleCategory[] = [
  "core",
  "nonprofit",
  "operations",
  "business",
  "intelligence",
];

function groupModulesByCategory(modules: AppModuleSetting[]) {
  const groups = new Map<ModuleCategory, AppModuleSetting[]>();
  for (const mod of modules) {
    const list = groups.get(mod.category) ?? [];
    list.push(mod);
    groups.set(mod.category, list);
  }
  return CATEGORY_ORDER.filter((c) => groups.has(c)).map((category) => ({
    category,
    label: CATEGORY_LABELS[category],
    modules: groups.get(category) ?? [],
  }));
}

function buildCurrentNonprofitEnabled(modules: AppModuleSetting[]): Record<NonprofitModuleId, boolean> {
  return NONPROFIT_MODULE_IDS.reduce(
    (acc, id) => {
      const mod = modules.find((m) => m.id === id);
      acc[id] = mod?.enabled ?? MODULE_REGISTRY[id].defaultEnabled;
      return acc;
    },
    {} as Record<NonprofitModuleId, boolean>
  );
}

export default function ModuleManagement() {
  const { data: modules, isLoading } = useAppModules();
  const { data: activeTier } = useActivePricingTier();
  const toggleMutation = useToggleAppModule();
  const applyPresetMutation = useApplyPricingPreset();
  const [pendingPreset, setPendingPreset] = useState<PricingTierId | null>(null);

  const grouped = useMemo(
    () => groupModulesByCategory(modules ?? []),
    [modules]
  );

  const currentNonprofitEnabled = useMemo(
    () => buildCurrentNonprofitEnabled(modules ?? []),
    [modules]
  );

  const pendingSummary = useMemo(() => {
    if (!pendingPreset) return null;
    return getPresetApplySummary(pendingPreset, currentNonprofitEnabled);
  }, [pendingPreset, currentNonprofitEnabled]);

  const pendingPresetMeta = pendingPreset ? PRICING_PRESETS[pendingPreset] : null;

  const enabledCount = modules?.filter((m) => m.enabled).length ?? 0;

  const handleConfirmApply = () => {
    if (!pendingPreset) return;
    applyPresetMutation.mutate(pendingPreset, {
      onSuccess: () => setPendingPreset(null),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Module Management</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configure which modules are active for this installation. Changes save immediately to{" "}
          <code className="text-xs">app_modules</code>.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pricing Tier Presets</CardTitle>
          <CardDescription>
            Apply a preset bundle, then override individual modules below.
            {activeTier && (
              <span className="block mt-1">
                Active preset:{" "}
                <Badge variant="secondary">{PRICING_PRESETS[activeTier].name}</Badge>
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {PRICING_PRESET_LIST.map((preset) => {
              const isActive = activeTier === preset.id;
              const moduleCount = getPresetModuleCount(preset.id);
              const diff = getPresetApplySummary(preset.id, currentNonprofitEnabled);
              const newCount = diff.enabling.length;

              return (
                <div
                  key={preset.id}
                  className={cn(
                    "rounded-lg border p-4 flex flex-col min-h-[200px]",
                    isActive && "border-primary ring-1 ring-primary/30",
                    preset.id === "growth" && !isActive && "border-muted-foreground/20"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold">{preset.name}</h3>
                    {preset.id === "growth" && (
                      <Badge variant="outline" className="text-xs shrink-0">
                        Popular
                      </Badge>
                    )}
                  </div>
                  <p className="text-2xl font-bold mt-2">
                    {preset.price}
                    <span className="text-sm font-normal text-muted-foreground">
                      {preset.priceNote}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2 flex-1">
                    {preset.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <Badge variant="secondary" className="text-xs">
                      {moduleCount} modules
                    </Badge>
                    {!isActive && newCount > 0 && (
                      <Badge variant="outline" className="text-xs">
                        +{newCount} new
                      </Badge>
                    )}
                  </div>
                  <Button
                    className="mt-4 w-full"
                    variant={isActive ? "secondary" : "default"}
                    disabled={applyPresetMutation.isPending || isActive}
                    onClick={() => setPendingPreset(preset.id)}
                  >
                    {isActive ? "Active preset" : "Apply preset"}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <ApplyPresetDialog
        open={pendingPreset !== null}
        onOpenChange={(open) => {
          if (!open && !applyPresetMutation.isPending) {
            setPendingPreset(null);
          }
        }}
        preset={pendingPresetMeta}
        summary={pendingSummary}
        isPending={applyPresetMutation.isPending}
        onConfirm={handleConfirmApply}
      />

      <Card>
        <CardHeader>
          <CardTitle>All Modules</CardTitle>
          <CardDescription>
            {enabledCount} of {modules?.length ?? 0} modules enabled. Core modules cannot be
            disabled.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {grouped.map(({ category, label, modules: categoryModules }) => (
            <div key={category}>
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                {label}
              </h3>
              <div className="space-y-2">
                {categoryModules.map((mod) => (
                  <div
                    key={mod.id}
                    className="flex items-center justify-between rounded-md border px-4 py-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{mod.name}</span>
                        <Badge variant="outline" className="text-xs font-mono">
                          {mod.id}
                        </Badge>
                        {mod.isCore && (
                          <Badge variant="secondary" className="text-xs gap-1">
                            <Lock className="h-3 w-3" />
                            Core
                          </Badge>
                        )}
                        {mod.pageRoute && (
                          <Badge variant="outline" className="text-xs">
                            {mod.pageRoute}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{mod.description}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4 shrink-0">
                      <Label htmlFor={mod.id} className="text-xs">
                        {mod.enabled ? "On" : "Off"}
                      </Label>
                      <Switch
                        id={mod.id}
                        checked={mod.enabled}
                        disabled={mod.isCore || toggleMutation.isPending}
                        onCheckedChange={(enabled) =>
                          toggleMutation.mutate({
                            slug: mod.id as ModuleId,
                            enabled: Boolean(enabled),
                          })
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
