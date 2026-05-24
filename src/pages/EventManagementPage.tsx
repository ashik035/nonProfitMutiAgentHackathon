/**
 * Event Management — /event-management
 *
 * Full event lifecycle management: create events, manage registrations,
 * track capacity, view agendas and speakers.
 *
 * NOTE: This is separate from /events (post-event intelligence). Do not modify EventsPage.tsx.
 * Backed by Supabase nonprofit_events + nonprofit_event_registrants tables.
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  CalendarPlus, Calendar, MapPin, Users, Plus, Eye, ClipboardList, CheckCircle2, DollarSign, Loader2, Mic2, Clock, Ticket,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  useNonprofitEvents, useCreateNonprofitEvent, useEventRegistrants, useToggleCheckin,
  useEventSpeakers, useEventAgendaItems, useEventTicketTypes,
  type NonprofitEvent, type ManagedEventStatus,
} from "@/hooks/useNonprofitEvents";
import { useAuth } from "@/contexts/AuthContext";

// ── Helpers ──────────────────────────────────────────────────────

function statusColor(status: string): string {
  const map: Record<string, string> = {
    Upcoming: "bg-blue-100 text-blue-700 border-blue-200",
    Active: "bg-green-100 text-green-700 border-green-200",
    Past: "bg-gray-100 text-gray-600 border-gray-200",
  };
  return map[status] ?? "bg-gray-100 text-gray-600 border-gray-200";
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

// ── Form schema ───────────────────────────────────────────────────

const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  date: z.string().min(1, "Date is required"),
  location: z.string().min(3, "Location is required"),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
  description: z.string().optional(),
});
type EventForm = z.infer<typeof eventSchema>;

// ── Sub-component: Registrations Sheet ───────────────────────────

function RegistrationsSheet({
  event,
  onClose,
}: {
  event: NonprofitEvent | null;
  onClose: () => void;
}) {
  const { data: registrants = [], isLoading } = useEventRegistrants(event?.id ?? null);
  const toggleCheckin = useToggleCheckin();
  const checkedInCount = registrants.filter((r) => r.checked_in).length;

  return (
    <Sheet open={!!event} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        {event && (
          <>
            <SheetHeader>
              <SheetTitle>{event.title}</SheetTitle>
              <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {registrants.length} / {event.capacity}
                </span>
                {event.status === "Past" && (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                    {checkedInCount} checked in
                  </span>
                )}
              </div>
            </SheetHeader>

            <div className="mt-6">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : registrants.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No registrants yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Name</TableHead>
                      <TableHead className="text-xs">Ticket</TableHead>
                      <TableHead className="text-xs">Registered</TableHead>
                      <TableHead className="text-xs">Check-In</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrants.map((reg) => (
                      <TableRow key={reg.id}>
                        <TableCell>
                          <p className="text-xs font-medium">{reg.name}</p>
                          <p className="text-xs text-muted-foreground">{reg.email}</p>
                        </TableCell>
                        <TableCell className="text-xs">{reg.ticket_tier ?? "—"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(reg.registered_at)}
                        </TableCell>
                        <TableCell>
                          {reg.checked_in ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 text-xs px-2"
                              disabled={toggleCheckin.isPending}
                              onClick={() =>
                                toggleCheckin.mutate({
                                  id: reg.id,
                                  eventId: reg.event_id,
                                  checkedIn: true,
                                })
                              }
                            >
                              Check In
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Showing {registrants.length} registrant{registrants.length !== 1 ? "s" : ""}
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ── Sub-component: Event Detail Sheet ─────────────────────────────

function EventDetailSheet({
  event,
  onClose,
}: {
  event: NonprofitEvent | null;
  onClose: () => void;
}) {
  const { data: speakers = [] } = useEventSpeakers(event?.id ?? null);
  const { data: agendaItems = [] } = useEventAgendaItems(event?.id ?? null);
  const { data: ticketTypes = [] } = useEventTicketTypes(event?.id ?? null);
  const ticketRevenue = ticketTypes.reduce((sum, t) => sum + Number(t.price) * Number(t.sold), 0);

  return (
    <Sheet open={!!event} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        {event && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2 flex-wrap">
                <SheetTitle>{event.title}</SheetTitle>
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusColor(event.status)}`}>
                  {event.status}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> {formatDate(event.date)}
                </span>
                {event.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {event.location}
                  </span>
                )}
              </div>
            </SheetHeader>

            <div className="mt-6 space-y-5">
              {event.description && (
                <p className="text-sm text-muted-foreground">{event.description}</p>
              )}

              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-2xl font-bold">{event.capacity}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Capacity</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-2xl font-bold">{ticketTypes.reduce((s, t) => s + Number(t.sold), 0)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Tickets Sold</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                    ${(Number(event.fund_raised) + ticketRevenue).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Total Raised</p>
                </div>
              </div>

              {ticketTypes.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
                    <Ticket className="h-3.5 w-3.5 text-primary" /> Ticket Types
                  </h4>
                  <div className="space-y-2">
                    {ticketTypes.map((t) => (
                      <div key={t.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                        <span className="font-medium">{t.tier}</span>
                        <div className="flex gap-4 text-muted-foreground text-xs">
                          <span>${Number(t.price).toLocaleString()}</span>
                          <span>{t.sold} / {t.capacity} sold</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {speakers.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
                    <Mic2 className="h-3.5 w-3.5 text-primary" /> Speakers
                  </h4>
                  <div className="space-y-2">
                    {speakers.map((s) => (
                      <div key={s.id} className="rounded-lg border px-3 py-2 text-sm">
                        <p className="font-medium">{s.name}</p>
                        {s.title && <p className="text-xs text-muted-foreground">{s.title}</p>}
                        {s.bio && <p className="text-xs text-muted-foreground mt-1">{s.bio}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {agendaItems.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
                    <Clock className="h-3.5 w-3.5 text-primary" /> Agenda
                  </h4>
                  <div className="space-y-1">
                    {agendaItems.map((item) => (
                      <div key={item.id} className="flex gap-3 text-sm py-1.5 border-b last:border-0">
                        <span className="text-muted-foreground tabular-nums w-14 shrink-0">{item.time}</span>
                        <div>
                          <span className="font-medium">{item.title}</span>
                          {item.speaker_name && (
                            <span className="text-muted-foreground ml-1.5 text-xs">— {item.speaker_name}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ── Component ─────────────────────────────────────────────────────

export default function EventManagementPage() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<ManagedEventStatus | "All">("All");
  const [detailEvent, setDetailEvent] = useState<NonprofitEvent | null>(null);
  const [registrationsEvent, setRegistrationsEvent] = useState<NonprofitEvent | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const { data: allEvents = [], isLoading } = useNonprofitEvents();
  const createEvent = useCreateNonprofitEvent();

  const filteredEvents = statusFilter === "All"
    ? allEvents
    : allEvents.filter((e) => e.status === statusFilter);

  const form = useForm<EventForm>({
    resolver: zodResolver(eventSchema),
    defaultValues: { title: "", date: "", location: "", capacity: 100, description: "" },
  });

  const onCreateSubmit = async (data: EventForm) => {
    await createEvent.mutateAsync({
      title: data.title,
      date: data.date,
      location: data.location,
      capacity: data.capacity,
      description: data.description ?? null,
      status: "Upcoming",
      created_by: user?.id ?? null,
    });
    setCreateOpen(false);
    form.reset();
  };

  const statusFilters: Array<ManagedEventStatus | "All"> = ["All", "Upcoming", "Active", "Past"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CalendarPlus className="h-6 w-6 text-primary" />
            Event Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage your full event lifecycle
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> New Event
        </Button>
      </div>

      {/* Status filter pills */}
      <div className="flex gap-2 flex-wrap">
        {statusFilters.map((filter) => (
          <Button
            key={filter}
            size="sm"
            variant={statusFilter === filter ? "default" : "outline"}
            onClick={() => setStatusFilter(filter)}
          >
            {filter}
            {filter !== "All" && (
              <span className="ml-1.5 text-xs opacity-70">
                ({allEvents.filter((e) => e.status === filter).length})
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Event list */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {allEvents.length === 0 ? "No events yet — create the first one!" : "No events in this category"}
            </p>
          ) : (
            filteredEvents.map((event) => (
              <Card key={event.id}>
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{event.title}</h3>
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusColor(event.status)}`}>
                          {event.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" /> {formatDate(event.date)}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" /> {event.location}
                          </span>
                        )}
                      </div>

                      {/* Capacity display */}
                      <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        <span>Capacity: {event.capacity}</span>
                      </div>

                      {event.fund_raised !== undefined && Number(event.fund_raised) > 0 && (
                        <p className="text-sm text-green-700 dark:text-green-400 font-medium mt-2 flex items-center gap-1">
                          <DollarSign className="h-3.5 w-3.5" />
                          {Number(event.fund_raised).toLocaleString()} raised
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 sm:flex-col shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDetailEvent(event)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1.5" /> Details
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setRegistrationsEvent(event)}
                      >
                        <ClipboardList className="h-3.5 w-3.5 mr-1.5" /> Registrations
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Event Detail Sheet */}
      <EventDetailSheet event={detailEvent} onClose={() => setDetailEvent(null)} />

      {/* Registrations Sheet */}
      <RegistrationsSheet
        event={registrationsEvent}
        onClose={() => setRegistrationsEvent(null)}
      />

      {/* Create Event Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onCreateSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="ev-title">Event Title</Label>
              <Input id="ev-title" placeholder="Annual Fundraising Gala" {...form.register("title")} />
              {form.formState.errors.title && (
                <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ev-date">Date</Label>
              <Input id="ev-date" type="date" {...form.register("date")} />
              {form.formState.errors.date && (
                <p className="text-xs text-destructive">{form.formState.errors.date.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ev-location">Location</Label>
              <Input id="ev-location" placeholder="Venue name or address" {...form.register("location")} />
              {form.formState.errors.location && (
                <p className="text-xs text-destructive">{form.formState.errors.location.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ev-capacity">Capacity</Label>
              <Input id="ev-capacity" type="number" min={1} {...form.register("capacity")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ev-desc">Description (optional)</Label>
              <Textarea id="ev-desc" placeholder="Describe your event…" rows={3} {...form.register("description")} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createEvent.isPending}>
                {createEvent.isPending ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating…</>
                ) : (
                  <><CalendarPlus className="h-4 w-4 mr-2" /> Create Event</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
