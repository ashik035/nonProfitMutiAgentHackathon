/**
 * useMembers — Nonprofit member directory hooks.
 * Replaces DEMO_MEMBERS in MembershipPage.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys, invalidateKeys } from "@/lib/cache";
import { useToast } from "@/hooks/use-toast";
import { logCrud } from "@/lib/activity-logger";
import type { Database } from "@/integrations/supabase/types";

export type Member = Database["public"]["Tables"]["nonprofit_members"]["Row"];
export type MemberInsert = Database["public"]["Tables"]["nonprofit_members"]["Insert"];
export type MemberUpdate = Database["public"]["Tables"]["nonprofit_members"]["Update"];

export type MemberTier = "General" | "Professional" | "Board" | "Honorary";
export type MemberStatus = "Active" | "Expiring" | "Lapsed" | "Pending";

export interface MemberFilters {
  search?: string;
  tier?: MemberTier | "All";
  status?: MemberStatus | "All";
}

export function useMembers(filters?: MemberFilters) {
  return useQuery({
    queryKey: queryKeys.nonprofit.members.list(filters),
    queryFn: async (): Promise<Member[]> => {
      let q = supabase
        .from("nonprofit_members")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.search) {
        q = q.or(
          `name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,employer.ilike.%${filters.search}%`
        );
      }
      if (filters?.tier && filters.tier !== "All") {
        q = q.eq("tier", filters.tier);
      }
      if (filters?.status && filters.status !== "All") {
        q = q.eq("status", filters.status);
      }

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Member[];
    },
  });
}

export function useMemberById(id: string) {
  return useQuery({
    queryKey: queryKeys.nonprofit.members.detail(id),
    queryFn: async (): Promise<Member> => {
      const { data, error } = await supabase
        .from("nonprofit_members")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Member;
    },
    enabled: !!id,
  });
}

export function useCreateMember() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: MemberInsert): Promise<Member> => {
      const { data, error } = await supabase
        .from("nonprofit_members")
        .insert([input])
        .select()
        .single();
      if (error) throw error;
      return data as Member;
    },
    onSuccess: (member) => {
      invalidateKeys.nonprofitMembers(queryClient);
      logCrud("create", "nonprofit_member", member.id, { name: member.name });
      toast({ title: "Member added", description: `${member.name} has been added to the directory.` });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to add member", variant: "destructive" });
    },
  });
}

export function useUpdateMember() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: MemberUpdate }): Promise<Member> => {
      const { data: updated, error } = await supabase
        .from("nonprofit_members")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return updated as Member;
    },
    onSuccess: (member) => {
      invalidateKeys.nonprofitMembers(queryClient);
      queryClient.invalidateQueries({ queryKey: queryKeys.nonprofit.members.detail(member.id) });
      logCrud("update", "nonprofit_member", member.id, { name: member.name });
      toast({ title: "Member updated", description: `${member.name} has been updated.` });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to update member", variant: "destructive" });
    },
  });
}

export function useDeleteMember() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from("nonprofit_members")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, id) => {
      invalidateKeys.nonprofitMembers(queryClient);
      logCrud("delete", "nonprofit_member", id);
      toast({ title: "Member removed", description: "Member has been removed from the directory." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to remove member", variant: "destructive" });
    },
  });
}
