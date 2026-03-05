import type { CrmProviderSlug, CrmContact, CrmIntegrationConfig, SyncResult } from "./types.ts";
import { fetchHubSpotContacts, pushHubSpotContact } from "./adapters/hubspot.ts";

const CRM_SLUGS: CrmProviderSlug[] = [
  "salesforce-npsp",
  "blackbaud-raiser-edge",
  "bloomerang",
  "neon-crm",
  "virtuous",
  "donorperfect",
  "hubspot-nonprofit",
  "kindful",
  "hubspot",
  "salesforce",
];

export type { CrmContact, CrmIntegrationConfig, SyncResult, CrmProviderSlug };

export function isCrmProviderSlug(slug: string): slug is CrmProviderSlug {
  return (CRM_SLUGS as string[]).includes(slug);
}

export async function fetchCrmContacts(
  slug: CrmProviderSlug,
  config: CrmIntegrationConfig,
  since?: number
): Promise<CrmContact[]> {
  if (slug === "hubspot-nonprofit" || slug === "hubspot") {
    return fetchHubSpotContacts(config, since);
  }
  return [];
}

export async function pushCrmContact(
  slug: CrmProviderSlug,
  config: CrmIntegrationConfig,
  contact: CrmContact
): Promise<SyncResult> {
  if (slug === "hubspot-nonprofit" || slug === "hubspot") {
    return pushHubSpotContact(config, contact);
  }
  return { success: false, processed: 0, message: `No adapter for ${slug}` };
}
