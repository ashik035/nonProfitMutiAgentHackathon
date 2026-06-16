import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { invokeEdgeFunction } from "@/lib/edge-functions";

export interface UserInvite {
  id: string;
  email: string;
  role: string;
  agency_role: string;
  org_id: string | null;
  invited_by: string | null;
  token: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}

export interface CreateInviteParams {
  email: string;
  role: string;
}

// Fetch all pending invites
export function useUserInvites() {
  return useQuery({
    queryKey: ["user_invites"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("user_invites")
        .select("*")
        .is("used_at", null)
        .gte("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as UserInvite[];
    },
    staleTime: 1000 * 60 * 5,
  });
}

// Create a new invite
export function useCreateUserInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateInviteParams) => {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) throw new Error("Not authenticated");

      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", params.email)
        .maybeSingle();

      if (existingProfile) {
        throw new Error("User with this email already exists");
      }

      const { data: existingInvite } = await (supabase as any)
        .from("user_invites")
        .select("id")
        .eq("email", params.email)
        .is("used_at", null)
        .gte("expires_at", new Date().toISOString())
        .maybeSingle();

      if (existingInvite) {
        throw new Error("An active invitation for this email already exists");
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", currentUser.user.id)
        .maybeSingle();

      const inviterName = profileData?.full_name ?? "A teammate";
      const orgName = "Nonprofit Control Tower";

      const { data: insertedRow, error } = await (supabase as any)
        .from("user_invites")
        .insert([
          {
            email: params.email,
            role: params.role,
            agency_role: params.role,
            invited_by: currentUser.user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Best-effort email send
      try {
        const appUrl = window.location.origin;
        const inviteUrl = `${appUrl}/invite/accept?token=${(insertedRow as UserInvite).token}`;

        await invokeEdgeFunction("send-email", {
          to: params.email,
          subject: `You've been invited to join ${orgName}`,
          html: `
            <h2>You've been invited!</h2>
            <p>${inviterName} has invited you to join <strong>${orgName}</strong>.</p>
            <p><a href="${inviteUrl}" style="background:#0ea5e9;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">Accept Invitation</a></p>
            <p>This invitation expires in 7 days.</p>
            <p>Or copy this link: ${inviteUrl}</p>
          `,
        });
      } catch (emailErr) {
        console.warn("send-email failed (invite row was still created):", emailErr);
      }

      return insertedRow as UserInvite;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user_invites"] });
      toast.success(`Invitation sent to ${data.email}`);
    },
    onError: (error: any) => {
      console.error("Error creating invite:", error);
      toast.error(error.message || "Failed to send invitation");
    },
  });
}

export function useDeleteUserInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inviteId: string) => {
      const { error } = await (supabase as any)
        .from("user_invites")
        .delete()
        .eq("id", inviteId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_invites"] });
      toast.success("Invitation revoked");
    },
    onError: (error: any) => {
      console.error("Error deleting invite:", error);
      toast.error("Failed to revoke invitation");
    },
  });
}

export function useResendUserInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inviteId: string) => {
      const { data: invite, error: fetchError } = await (supabase as any)
        .from("user_invites")
        .select("*")
        .eq("id", inviteId)
        .single();
      if (fetchError) throw fetchError;

      const { error: updateError } = await (supabase as any)
        .from("user_invites")
        .update({
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          token: crypto.randomUUID(),
        })
        .eq("id", inviteId);
      if (updateError) throw updateError;

      return invite;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_invites"] });
      toast.success("Invitation resent");
    },
    onError: (error: any) => {
      console.error("Error resending invite:", error);
      toast.error("Failed to resend invitation");
    },
  });
}
