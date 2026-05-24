/**
 * useDonations — Individual donation record hooks.
 * Replaces DEMO_DONATIONS_RECENT + DEMO_DONATION_STATS in DonationCenterPage.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys, invalidateKeys } from "@/lib/cache";
import { useToast } from "@/hooks/use-toast";
import { logCrud } from "@/lib/activity-logger";
import type { Database } from "@/integrations/supabase/types";

export type Donation = Database["public"]["Tables"]["nonprofit_donations"]["Row"];
export type DonationInsert = Database["public"]["Tables"]["nonprofit_donations"]["Insert"];

export type DonationFrequency = "One-Time" | "Monthly" | "Quarterly" | "Annual";

export interface DonationFilters {
  search?: string;
  campaignId?: string;
  frequency?: DonationFrequency | "All";
}

export interface DonationStats {
  totalRaisedThisYear: number;
  averageGift: number;
  recurringDonors: number;
  activeCampaigns: number;
  fundBreakdown: { label: string; amount: number; percentage: number }[];
}

export function useDonations(filters?: DonationFilters) {
  return useQuery({
    queryKey: queryKeys.nonprofit.donations.list(filters),
    queryFn: async (): Promise<Donation[]> => {
      let q = supabase
        .from("nonprofit_donations")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.search) {
        q = q.or(`donor_name.ilike.%${filters.search}%,donor_email.ilike.%${filters.search}%`);
      }
      if (filters?.campaignId) {
        q = q.eq("campaign_id", filters.campaignId);
      }
      if (filters?.frequency && filters.frequency !== "All") {
        q = q.eq("frequency", filters.frequency);
      }

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Donation[];
    },
  });
}

export function useDonationsByCampaign(campaignId: string) {
  return useQuery({
    queryKey: queryKeys.nonprofit.donations.byCampaign(campaignId),
    queryFn: async (): Promise<Donation[]> => {
      const { data, error } = await supabase
        .from("nonprofit_donations")
        .select("*")
        .eq("campaign_id", campaignId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Donation[];
    },
    enabled: !!campaignId,
  });
}

export function useDonationStats(activeCampaignCount?: number) {
  return useQuery({
    queryKey: queryKeys.nonprofit.donations.stats,
    queryFn: async (): Promise<DonationStats> => {
      const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString();

      const { data, error } = await supabase
        .from("nonprofit_donations")
        .select("amount, frequency, fund_designation")
        .gte("created_at", yearStart);

      if (error) throw error;
      const donations = (data ?? []) as Pick<Donation, "amount" | "frequency" | "fund_designation">[];

      const totalRaisedThisYear = donations.reduce((sum, d) => sum + Number(d.amount), 0);
      const averageGift = donations.length > 0 ? Math.round(totalRaisedThisYear / donations.length) : 0;
      const recurringDonors = donations.filter((d) => d.frequency !== "One-Time").length;

      // Fund breakdown
      const fundTotals: Record<string, number> = {};
      for (const d of donations) {
        const key = d.fund_designation ?? "General Operating";
        fundTotals[key] = (fundTotals[key] ?? 0) + Number(d.amount);
      }
      const fundBreakdown = Object.entries(fundTotals).map(([label, amount]) => ({
        label,
        amount,
        percentage: totalRaisedThisYear > 0 ? Math.round((amount / totalRaisedThisYear) * 100) : 0,
      }));

      return {
        totalRaisedThisYear: Math.round(totalRaisedThisYear),
        averageGift,
        recurringDonors,
        activeCampaigns: activeCampaignCount ?? 0,
        fundBreakdown,
      };
    },
  });
}

export function useCreateDonation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: DonationInsert): Promise<Donation> => {
      const { data, error } = await supabase
        .from("nonprofit_donations")
        .insert([input])
        .select()
        .single();
      if (error) throw error;
      return data as Donation;
    },
    onSuccess: (donation) => {
      invalidateKeys.nonprofitDonations(queryClient);
      // If donation is tied to a campaign, also re-fetch that campaign's donations
      if (donation.campaign_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.nonprofit.donations.byCampaign(donation.campaign_id),
        });
      }
      logCrud("create", "nonprofit_donation", donation.id, { donor: donation.donor_name, amount: donation.amount });
      toast({
        title: "Donation recorded",
        description: `$${Number(donation.amount).toLocaleString()} from ${donation.is_anonymous ? "Anonymous" : donation.donor_name} has been recorded.`,
      });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to record donation", variant: "destructive" });
    },
  });
}
