/**
 * useCampaigns — Fundraising campaign hooks.
 * Replaces DEMO_CAMPAIGNS in DonationCenterPage.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys, invalidateKeys } from "@/lib/cache";
import { useToast } from "@/hooks/use-toast";
import { logCrud } from "@/lib/activity-logger";
import type { Database } from "@/integrations/supabase/types";

export type Campaign = Database["public"]["Tables"]["nonprofit_campaigns"]["Row"];
export type CampaignInsert = Database["public"]["Tables"]["nonprofit_campaigns"]["Insert"];
export type CampaignUpdate = Database["public"]["Tables"]["nonprofit_campaigns"]["Update"];

export type FundDesignation =
  | "General Operating"
  | "Youth Programs"
  | "Health Initiative"
  | "Technology Fund"
  | "Emergency Relief";

export interface CampaignFilters {
  search?: string;
  isActive?: boolean;
}

export function useCampaigns(filters?: CampaignFilters) {
  return useQuery({
    queryKey: queryKeys.nonprofit.campaigns.list(filters),
    queryFn: async (): Promise<Campaign[]> => {
      let q = supabase
        .from("nonprofit_campaigns")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.search) {
        q = q.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters?.isActive !== undefined) {
        q = q.eq("is_active", filters.isActive);
      }

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Campaign[];
    },
  });
}

export function useCampaignById(id: string) {
  return useQuery({
    queryKey: queryKeys.nonprofit.campaigns.detail(id),
    queryFn: async (): Promise<Campaign> => {
      const { data, error } = await supabase
        .from("nonprofit_campaigns")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Campaign;
    },
    enabled: !!id,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: CampaignInsert): Promise<Campaign> => {
      const { data, error } = await supabase
        .from("nonprofit_campaigns")
        .insert([input])
        .select()
        .single();
      if (error) throw error;
      return data as Campaign;
    },
    onSuccess: (campaign) => {
      invalidateKeys.nonprofitCampaigns(queryClient);
      logCrud("create", "nonprofit_campaign", campaign.id, { name: campaign.name });
      toast({ title: "Campaign created", description: `${campaign.name} is now active.` });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to create campaign", variant: "destructive" });
    },
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CampaignUpdate }): Promise<Campaign> => {
      const { data: updated, error } = await supabase
        .from("nonprofit_campaigns")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return updated as Campaign;
    },
    onSuccess: (campaign) => {
      invalidateKeys.nonprofitCampaigns(queryClient);
      queryClient.invalidateQueries({ queryKey: queryKeys.nonprofit.campaigns.detail(campaign.id) });
      logCrud("update", "nonprofit_campaign", campaign.id, { name: campaign.name });
      toast({ title: "Campaign updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to update campaign", variant: "destructive" });
    },
  });
}
