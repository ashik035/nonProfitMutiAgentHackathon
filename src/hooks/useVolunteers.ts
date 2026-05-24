/**
 * useVolunteers — Nonprofit volunteer roster & shift tracking hooks.
 * Replaces DEMO_VOLUNTEERS in VolunteersPage.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys, invalidateKeys } from "@/lib/cache";
import { useToast } from "@/hooks/use-toast";
import { logCrud } from "@/lib/activity-logger";
import type { Database } from "@/integrations/supabase/types";

export type Volunteer = Database["public"]["Tables"]["nonprofit_volunteers"]["Row"];
export type VolunteerInsert = Database["public"]["Tables"]["nonprofit_volunteers"]["Insert"];
export type VolunteerUpdate = Database["public"]["Tables"]["nonprofit_volunteers"]["Update"];
export type VolunteerShift = Database["public"]["Tables"]["nonprofit_volunteer_shifts"]["Row"];
export type VolunteerShiftInsert = Database["public"]["Tables"]["nonprofit_volunteer_shifts"]["Insert"];
export type VolunteerShiftUpdate = Database["public"]["Tables"]["nonprofit_volunteer_shifts"]["Update"];

export type ShiftStatus = "Upcoming" | "Completed" | "Cancelled";

/** Shift with the volunteer name joined in, for the all-shifts view. */
export interface ShiftWithVolunteer extends VolunteerShift {
  volunteerName: string;
}

export interface VolunteerFilters {
  search?: string;
}

export function useVolunteers(filters?: VolunteerFilters) {
  return useQuery({
    queryKey: queryKeys.nonprofit.volunteers.list(filters),
    queryFn: async (): Promise<Volunteer[]> => {
      let q = supabase
        .from("nonprofit_volunteers")
        .select("*")
        .order("name", { ascending: true });

      if (filters?.search) {
        q = q.or(
          `name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Volunteer[];
    },
  });
}

export function useVolunteerById(id: string) {
  return useQuery({
    queryKey: queryKeys.nonprofit.volunteers.detail(id),
    queryFn: async (): Promise<Volunteer> => {
      const { data, error } = await supabase
        .from("nonprofit_volunteers")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Volunteer;
    },
    enabled: !!id,
  });
}

/** All shifts for one volunteer. */
export function useVolunteerShifts(volunteerId: string) {
  return useQuery({
    queryKey: queryKeys.nonprofit.volunteers.shifts(volunteerId),
    queryFn: async (): Promise<VolunteerShift[]> => {
      const { data, error } = await supabase
        .from("nonprofit_volunteer_shifts")
        .select("*")
        .eq("volunteer_id", volunteerId)
        .order("date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as VolunteerShift[];
    },
    enabled: !!volunteerId,
  });
}

/** All shifts across all volunteers, with volunteer name joined for the shifts tab. */
export function useAllShifts() {
  return useQuery({
    queryKey: queryKeys.nonprofit.volunteers.allShifts(),
    queryFn: async (): Promise<ShiftWithVolunteer[]> => {
      const { data, error } = await supabase
        .from("nonprofit_volunteer_shifts")
        .select("*, nonprofit_volunteers(name)")
        .order("date", { ascending: true });
      if (error) throw error;

      return ((data ?? []) as (VolunteerShift & { nonprofit_volunteers: { name: string } | null })[]).map((s) => ({
        ...s,
        volunteerName: s.nonprofit_volunteers?.name ?? "Unknown",
      }));
    },
  });
}

export function useCreateVolunteer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: VolunteerInsert): Promise<Volunteer> => {
      const { data, error } = await supabase
        .from("nonprofit_volunteers")
        .insert([input])
        .select()
        .single();
      if (error) throw error;
      return data as Volunteer;
    },
    onSuccess: (volunteer) => {
      invalidateKeys.nonprofitVolunteers(queryClient);
      logCrud("create", "nonprofit_volunteer", volunteer.id, { name: volunteer.name });
      toast({ title: "Volunteer added", description: `${volunteer.name} has been added.` });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to add volunteer", variant: "destructive" });
    },
  });
}

export function useUpdateVolunteer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: VolunteerUpdate }): Promise<Volunteer> => {
      const { data: updated, error } = await supabase
        .from("nonprofit_volunteers")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return updated as Volunteer;
    },
    onSuccess: (volunteer) => {
      invalidateKeys.nonprofitVolunteers(queryClient);
      logCrud("update", "nonprofit_volunteer", volunteer.id, { name: volunteer.name });
      toast({ title: "Volunteer updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to update volunteer", variant: "destructive" });
    },
  });
}

export function useCreateShift() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: VolunteerShiftInsert): Promise<VolunteerShift> => {
      const { data, error } = await supabase
        .from("nonprofit_volunteer_shifts")
        .insert([input])
        .select()
        .single();
      if (error) throw error;
      return data as VolunteerShift;
    },
    onSuccess: (shift) => {
      invalidateKeys.nonprofitVolunteers(queryClient);
      queryClient.invalidateQueries({ queryKey: queryKeys.nonprofit.volunteers.shifts(shift.volunteer_id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.nonprofit.volunteers.allShifts() });
      logCrud("create", "nonprofit_volunteer_shift", shift.id);
      toast({ title: "Shift logged" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to log shift", variant: "destructive" });
    },
  });
}
