import type { CrmContact, CrmIntegrationConfig, SyncResult } from "../types.ts";

const HUBSPOT_API = "https://api.hubapi.com";

async function getAccessToken(config: CrmIntegrationConfig): Promise<string> {
  const token = config.access_token;
  if (!token) throw new Error("HubSpot access_token missing");
  return token;
}

export async function fetchHubSpotContacts(
  config: CrmIntegrationConfig,
  since?: number
): Promise<CrmContact[]> {
  const token = await getAccessToken(config);
  const contacts: CrmContact[] = [];
  let after: string | undefined;

  do {
    const url = new URL(`${HUBSPOT_API}/crm/v3/objects/contacts`);
    url.searchParams.set("limit", "100");
    if (after) url.searchParams.set("after", after);
    if (since) url.searchParams.set("lastmodifieddate", String(since));

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HubSpot API error ${res.status}: ${text}`);
    }
    const data = (await res.json()) as {
      results?: Array<{
        id: string;
        properties?: Record<string, string>;
      }>;
      paging?: { next?: { after?: string } };
    };
    const results = data.results ?? [];
    for (const r of results) {
      const p = r.properties ?? {};
      contacts.push({
        external_id: r.id,
        first_name: p.firstname ?? "",
        last_name: p.lastname ?? null,
        email: p.email ?? null,
        phone: p.phone ?? null,
        company: p.company ?? null,
        external_url: `https://app.hubspot.com/contacts/contacts/${r.id}`,
      });
    }
    after = data.paging?.next?.after;
  } while (after);

  return contacts;
}

export async function pushHubSpotContact(
  config: CrmIntegrationConfig,
  contact: CrmContact
): Promise<SyncResult> {
  const token = await getAccessToken(config);
  const body: Record<string, string> = {
    firstname: contact.first_name,
    lastname: contact.last_name ?? "",
    email: contact.email ?? "",
    phone: contact.phone ?? "",
    company: contact.company ?? "",
  };
  const url = contact.external_id
    ? `${HUBSPOT_API}/crm/v3/objects/contacts/${contact.external_id}`
    : `${HUBSPOT_API}/crm/v3/objects/contacts`;
  const method = contact.external_id ? "PATCH" : "POST";
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ properties: body }),
  });
  if (!res.ok) {
    const text = await res.text();
    return { success: false, processed: 0, message: `HubSpot ${res.status}: ${text}` };
  }
  return { success: true, processed: 1 };
}
