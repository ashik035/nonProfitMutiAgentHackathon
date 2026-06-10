/**
 * useNonprofitEvents — Event lifecycle management hooks.
 * Replaces DEMO_MANAGED_EVENTS in the Events hub (EventLifecycleTab).
 * NOTE: Uses "nonprofit_events" table, separate from "events" table (post-event intelligence).
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys, invalidateKeys } from "@/lib/cache";
import { useToast } from "@/hooks/use-toast";
import { logCrud } from "@/lib/activity-logger";
import type { Database } from "@/integrations/supabase/types";

export type NonprofitEvent = Database["public"]["Tables"]["nonprofit_events"]["Row"];
export type NonprofitEventInsert = Database["public"]["Tables"]["nonprofit_events"]["Insert"];
export type NonprofitEventUpdate = Database["public"]["Tables"]["nonprofit_events"]["Update"];

export type EventRegistrant = Database["public"]["Tables"]["nonprofit_event_registrants"]["Row"];
export type EventRegistrantInsert = Database["public"]["Tables"]["nonprofit_event_registrants"]["Insert"];

export type EventTicketType = Database["public"]["Tables"]["nonprofit_event_ticket_types"]["Row"];
export type EventSpeaker = Database["public"]["Tables"]["nonprofit_event_speakers"]["Row"];
export type EventAgendaItem = Database["public"]["Tables"]["nonprofit_event_agenda_items"]["Row"];

export type ManagedEventStatus = "Upcoming" | "Active" | "Past";

export interface NonprofitEventFilters {
  search?: string;
  status?: ManagedEventStatus | "All";
}

export function useNonprofitEvents(filters?: NonprofitEventFilters) {
  return useQuery({
    queryKey: queryKeys.nonprofit.events.list(filters),
    queryFn: async (): Promise<NonprofitEvent[]> => {
      let q = supabase
        .from("nonprofit_events")
        .select("*")
        .order("date", { ascending: false });

      if (filters?.search) {
        q = q.or(`title.ilike.%${filters.search}%,location.ilike.%${filters.search}%`);
      }
      if (filters?.status && filters.status !== "All") {
        q = q.eq("status", filters.status);
      }

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as NonprofitEvent[];
    },
  });
}

export function useNonprofitEventById(id: string) {
  return useQuery({
    queryKey: queryKeys.nonprofit.events.detail(id),
    queryFn: async (): Promise<NonprofitEvent> => {
      const { data, error } = await supabase
        .from("nonprofit_events")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as NonprofitEvent;
    },
    enabled: !!id,
  });
}

export function useEventRegistrants(eventId: string | null) {
  return useQuery({
    queryKey: queryKeys.nonprofit.events.registrants(eventId ?? ""),
    queryFn: async (): Promise<EventRegistrant[]> => {
      const { data, error } = await supabase
        .from("nonprofit_event_registrants")
        .select("*")
        .eq("event_id", eventId!)
        .order("registered_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as EventRegistrant[];
    },
    enabled: !!eventId,
  });
}

export function useEventSpeakers(eventId: string | null) {
  return useQuery({
    queryKey: queryKeys.nonprofit.events.speakers(eventId ?? ""),
    queryFn: async (): Promise<EventSpeaker[]> => {
      const { data, error } = await supabase
        .from("nonprofit_event_speakers")
        .select("*")
        .eq("event_id", eventId!)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as EventSpeaker[];
    },
    enabled: !!eventId,
  });
}

export function useEventAgendaItems(eventId: string | null) {
  return useQuery({
    queryKey: queryKeys.nonprofit.events.agenda(eventId ?? ""),
    queryFn: async (): Promise<EventAgendaItem[]> => {
      const { data, error } = await supabase
        .from("nonprofit_event_agenda_items")
        .select("*")
        .eq("event_id", eventId!)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as EventAgendaItem[];
    },
    enabled: !!eventId,
  });
}

export function useEventTicketTypes(eventId: string | null) {
  return useQuery({
    queryKey: queryKeys.nonprofit.events.ticketTypes(eventId ?? ""),
    queryFn: async (): Promise<EventTicketType[]> => {
      const { data, error } = await supabase
        .from("nonprofit_event_ticket_types")
        .select("*")
        .eq("event_id", eventId!)
        .order("price", { ascending: true });
      if (error) throw error;
      return (data ?? []) as EventTicketType[];
    },
    enabled: !!eventId,
  });
}

export function useCreateNonprofitEvent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: NonprofitEventInsert): Promise<NonprofitEvent> => {
      const { data, error } = await supabase
        .from("nonprofit_events")
        .insert([input])
        .select()
        .single();
      if (error) throw error;
      return data as NonprofitEvent;
    },
    onSuccess: (event) => {
      invalidateKeys.nonprofitEvents(queryClient);
      logCrud("create", "nonprofit_event", event.id, { title: event.title });
      toast({ title: "Event created", description: `${event.title} has been created.` });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to create event", variant: "destructive" });
    },
  });
}

export function useUpdateNonprofitEvent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: NonprofitEventUpdate }): Promise<NonprofitEvent> => {
      const { data: updated, error } = await supabase
        .from("nonprofit_events")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return updated as NonprofitEvent;
    },
    onSuccess: (event) => {
      invalidateKeys.nonprofitEvents(queryClient);
      queryClient.invalidateQueries({ queryKey: queryKeys.nonprofit.events.detail(event.id) });
      logCrud("update", "nonprofit_event", event.id, { title: event.title });
      toast({ title: "Event updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to update event", variant: "destructive" });
    },
  });
}

export function useCreateRegistrant() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: EventRegistrantInsert): Promise<EventRegistrant> => {
      const { data, error } = await supabase
        .from("nonprofit_event_registrants")
        .insert([input])
        .select()
        .single();
      if (error) throw error;
      return data as EventRegistrant;
    },
    onSuccess: (registrant) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.nonprofit.events.registrants(registrant.event_id),
      });
      logCrud("create", "nonprofit_event_registrant", registrant.id);
      toast({ title: "Registrant added" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to add registrant", variant: "destructive" });
    },
  });
}

export function useToggleCheckin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, eventId, checkedIn }: { id: string; eventId: string; checkedIn: boolean }): Promise<EventRegistrant> => {
      const { data, error } = await supabase
        .from("nonprofit_event_registrants")
        .update({ checked_in: checkedIn })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as EventRegistrant;
    },
    onSuccess: (registrant) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.nonprofit.events.registrants(registrant.event_id),
      });
      toast({ title: registrant.checked_in ? "Checked in" : "Check-in reversed" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to update check-in", variant: "destructive" });
    },
  });
}
