export type CrmProviderSlug =
  | "salesforce-npsp"
  | "blackbaud-raiser-edge"
  | "bloomerang"
  | "neon-crm"
  | "virtuous"
  | "donorperfect"
  | "hubspot-nonprofit"
  | "kindful"
  | "hubspot"
  | "salesforce";

export interface CrmContact {
  external_id: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  external_url?: string | null;
}

export interface CrmIntegrationConfig {
  access_token?: string;
  refresh_token?: string;
  expires_at?: string;
  api_key?: string;
  [key: string]: unknown;
}

export interface SyncResult {
  success: boolean;
  processed: number;
  message?: string;
}
