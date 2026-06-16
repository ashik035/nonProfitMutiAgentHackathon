/**
 * system_settings helpers (Lovable Cloud schema: key UNIQUE, no category column).
 */

import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export async function getSystemSettingValue(key: string): Promise<Json | null> {
  const { data, error } = await supabase
    .from("system_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();

  if (error) throw error;
  return data?.value ?? null;
}

export async function upsertSystemSetting(
  key: string,
  value: Json,
  description?: string
): Promise<void> {
  const { error } = await supabase.from("system_settings").upsert(
    {
      key,
      value,
      description: description ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" }
  );

  if (error) throw error;
}
