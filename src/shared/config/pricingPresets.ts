/**
 * Pricing tier presets for Nonprofit Control Tower module bundles.
 * Maps to public pricing page and /admin/modules preset application.
 */

import {
  NONPROFIT_MODULE_IDS,
  type ModuleId,
  type NonprofitModuleId,
  type PricingTierId,
  MODULE_REGISTRY,
} from "./modules";

export interface PricingPreset {
  id: PricingTierId;
  name: string;
  price: string;
  priceNote: string;
  description: string;
  /** Module slugs enabled by this preset (core modules always on). */
  modules: NonprofitModuleId[];
}

const STARTER_MODULES: NonprofitModuleId[] = [
  "dashboard",
  "ai-agents",
  "board-reports",
  "grants",
  "donor-pipeline",
];

const GROWTH_ADDITIONAL: NonprofitModuleId[] = [
  "data-health",
  "reconciliation",
  "events",
  "voice-notes",
  "integration-center",
  "donor-retention",
  "programs",
];

export const PRICING_PRESETS: Record<PricingTierId, PricingPreset> = {
  starter: {
    id: "starter",
    name: "Starter",
    price: "$299",
    priceNote: "/month",
    description:
      "Essential operational intelligence for smaller nonprofits getting started with AI-assisted workflows.",
    modules: STARTER_MODULES,
  },
  growth: {
    id: "growth",
    name: "Growth",
    price: "$599",
    priceNote: "/month",
    description:
      "Full fundraising and operations for mid-size nonprofits ready to scale donor engagement.",
    modules: [...STARTER_MODULES, ...GROWTH_ADDITIONAL],
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    priceNote: "pricing",
    description:
      "All nonprofit modules enabled with advanced features and dedicated support.",
    modules: [...NONPROFIT_MODULE_IDS],
  },
};

export const PRICING_PRESET_LIST: PricingPreset[] = Object.values(PRICING_PRESETS);

export const MODULE_PRICING_TIER_SETTING_KEY = "system.modulePricingTier";

/**
 * Compute is_active state for every nonprofit module given a preset.
 * Core modules are always true.
 */
export function getPresetModuleStates(
  presetId: PricingTierId
): Record<NonprofitModuleId, boolean> {
  const enabledSet = new Set(PRICING_PRESETS[presetId].modules);
  return NONPROFIT_MODULE_IDS.reduce(
    (acc, id) => {
      const mod = MODULE_REGISTRY[id];
      acc[id] = mod.isCore || enabledSet.has(id);
      return acc;
    },
    {} as Record<NonprofitModuleId, boolean>
  );
}

/** Human-readable module names for a preset (for pricing page bullets). */
export function getPresetModuleLabels(presetId: PricingTierId): string[] {
  return PRICING_PRESETS[presetId].modules.map((id) => MODULE_REGISTRY[id].name);
}

export interface PresetModuleChange {
  id: NonprofitModuleId;
  name: string;
  pageRoute?: string;
}

export interface PresetApplySummary {
  enabling: PresetModuleChange[];
  disabling: PresetModuleChange[];
  unchanged: number;
}

function toPresetModuleChange(id: NonprofitModuleId): PresetModuleChange {
  const mod = MODULE_REGISTRY[id];
  return {
    id,
    name: mod.name,
    pageRoute: mod.pageRoute,
  };
}

/** Count of nonprofit modules enabled by a preset (includes core). */
export function getPresetModuleCount(presetId: PricingTierId): number {
  return PRICING_PRESETS[presetId].modules.length;
}

/**
 * Diff current installation state vs target preset for confirmation modal.
 * Core modules are excluded from enable/disable lists.
 */
export function getPresetApplySummary(
  presetId: PricingTierId,
  currentEnabled: Record<NonprofitModuleId, boolean>
): PresetApplySummary {
  const targetStates = getPresetModuleStates(presetId);
  const enabling: PresetModuleChange[] = [];
  const disabling: PresetModuleChange[] = [];
  let unchanged = 0;

  for (const id of NONPROFIT_MODULE_IDS) {
    const mod = MODULE_REGISTRY[id];
    if (mod.isCore) continue;

    const currentlyOn = currentEnabled[id] ?? mod.defaultEnabled;
    const willBeOn = targetStates[id];

    if (willBeOn && !currentlyOn) {
      enabling.push(toPresetModuleChange(id));
    } else if (!willBeOn && currentlyOn) {
      disabling.push(toPresetModuleChange(id));
    } else {
      unchanged += 1;
    }
  }

  return { enabling, disabling, unchanged };
}

/** All preset IDs in display order. */
export const PRICING_TIER_ORDER: PricingTierId[] = ["starter", "growth", "enterprise"];
