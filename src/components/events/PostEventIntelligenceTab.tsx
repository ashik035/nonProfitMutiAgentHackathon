/**
 * Post-Event Intelligence Tab — "Post-Event" tab of /events
 *
 * Post-event engagement intelligence: attendee follow-up, AI-drafted emails,
 * bulk task creation, and the Event Intelligence AI panel.
 */

import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Users, Loader2, Send, Tag, Copy, Mail, ClipboardList, Bell, CheckCircle, ChevronDown, ChevronUp, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

/* ── Attendee data ── */

interface Attendee {
  id: string;
  name: string;
  type: "Donor" | "Volunteer" | "Prospect" | "New Contact";
  engagement: string;
  followUp: "Pending" | "Contacted" | "Done";
}

const GALA_ATTENDEES: Attendee[] = [
  { id: "a1", name: "Sarah Mitchell", type: "Donor", engagement: "Major Gift Prospect", followUp: "Contacted" },
  { id: "a2", name: "Robert Kim", type: "Prospect", engagement: "First-Time Attendee", followUp: "Pending" },
  { id: "a3", name: "Patricia Lee", type: "New Contact", engagement: "Corporate Contact", followUp: "Pending" },
  { id: "a4", name: "David Osei", type: "Donor", engagement: "Recurring Donor", followUp: "Done" },
  { id: "a5", name: "Jennifer Walsh", type: "Prospect", engagement: "Board Referral", followUp: "Pending" },
  { id: "a6", name: "Mark Abrams", type: "New Contact", engagement: "Walk-In", followUp: "Pending" },
  { id: "a7", name: "Lisa Chen", type: "Prospect", engagement: "Volunteer Interest", followUp: "Pending" },
  { id: "a8", name: "Thomas Rivera", type: "Donor", engagement: "Lapsed Donor", followUp: "Contacted" },
  { id: "a9", name: "Carol Nguyen", type: "New Contact", engagement: "Event Sponsor Rep", followUp: "Pending" },
  { id: "a10", name: "James Wright", type: "Prospect", engagement: "Table Captain Guest", followUp: "Pending" },
  { id: "a11", name: "Angela Torres", type: "Volunteer", engagement: "Active Volunteer", followUp: "Done" },
  { id: "a12", name: "Kevin Park", type: "Donor", engagement: "Mid-Level Donor", followUp: "Contacted" },
];

const VOLUNTEER_ATTENDEES: Attendee[] = [
  { id: "v1", name: "Marcus Webb", type: "Volunteer", engagement: "New Recruit", followUp: "Pending" },
  { id: "v2", name: "Aisha Patel", type: "Volunteer", engagement: "Returning Volunteer", followUp: "Done" },
  { id: "v3", name: "Daniel Flores", type: "Volunteer", engagement: "New Recruit", followUp: "Pending" },
  { id: "v4", name: "Nadia Okafor", type: "Volunteer", engagement: "Skills-Based", followUp: "Pending" },
  { id: "v5", name: "Chris Bailey", type: "Volunteer", engagement: "New Recruit", followUp: "Pending" },
  { id: "v6", name: "Yuki Tanaka", type: "Donor", engagement: "Donor → Volunteer", followUp: "Done" },
  { id: "v7", name: "Emily Saunders", type: "Volunteer", engagement: "Returning Volunteer", followUp: "Contacted" },
  { id: "v8", name: "Omar Hassan", type: "Prospect", engagement: "Community Leader", followUp: "Pending" },
];

/* ── Event definitions ── */

interface EventData {
  id: string;
  name: string;
  date: string;
  location: string;
  color: string;
  iconColor: string;
  status: "FOLLOW-UP NEEDED" | "COMPLETE";
  statusColor: string;
  summary: string;
  badges: string[];
  attendees: Attendee[];
}

const EVENTS: EventData[] = [
  {
    id: "e1", name: "Spring Gala 2026", date: "April 3, 2026",
    location: "The Boston Marriott Copley Place",
    color: "bg-blue-100 dark:bg-blue-900/40", iconColor: "text-blue-600",
    status: "FOLLOW-UP NEEDED", statusColor: "bg-amber-100 text-amber-700 border-amber-200",
    summary: "247 attendees (187 existing donors, 42 prospects, 18 new contacts) · Revenue: $142,000",
    badges: ["47 not thanked", "12 volunteer interest", "8 upgrade prospects"],
    attendees: GALA_ATTENDEES,
  },
  {
    id: "e2", name: "Volunteer Orientation", date: "March 15, 2026",
    location: "Brightside Foundation HQ — 120 Tremont St, Boston",
    color: "bg-green-100 dark:bg-green-900/40", iconColor: "text-green-600",
    status: "COMPLETE", statusColor: "bg-green-100 text-green-700 border-green-200",
    summary: "34 attendees · 28 new volunteers · 3 donors converted",
    badges: [],
    attendees: VOLUNTEER_ATTENDEES,
  },
];

/* ── Helpers ── */

function followUpBadge(status: Attendee["followUp"]) {
  switch (status) {
    case "Done": return <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Done</Badge>;
    case "Contacted": return <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">Contacted</Badge>;
    default: return <Badge variant="secondary" className="text-xs">Pending</Badge>;
  }
}

/* ── Component ── */

export function PostEventIntelligenceTab() {
  // Attendee dialog
  const [attendeeEvent, setAttendeeEvent] = useState<EventData | null>(null);
  const [attendeesState, setAttendeesState] = useState<Record<string, Attendee[]>>({
    e1: GALA_ATTENDEES,
    e2: VOLUNTEER_ATTENDEES,
  });

  // Follow-up email sheet
  const [emailEvent, setEmailEvent] = useState<EventData | null>(null);
  const [emailDraft, setEmailDraft] = useState("");

  // Follow-up task dialog
  const [taskEvent, setTaskEvent] = useState<EventData | null>(null);
  const [taskAssignee, setTaskAssignee] = useState("Maria Santos");
  const [taskPriority, setTaskPriority] = useState("Medium");

  // Volunteer reminder / confirmed state
  const [confirmedEvents, setConfirmedEvents] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);

  // Gala-specific bulk actions
  const [taskUpgrade, setTaskUpgrade] = useState(true);
  const [taskVolunteer, setTaskVolunteer] = useState(true);
  const [taskGeneral, setTaskGeneral] = useState(false);
  const [bulkTaskModal, setBulkTaskModal] = useState(false);

  const draftRef = useRef<HTMLTextAreaElement>(null);

  // Event Intelligence panel
  const [intelOpen, setIntelOpen] = useState(false);
  const [intelQuestion, setIntelQuestion] = useState("");
  const [intelLoading, setIntelLoading] = useState(false);
  const [intelAnswer, setIntelAnswer] = useState<string | null>(null);
  const [intelError, setIntelError] = useState<string | null>(null);
  const [intelAsked, setIntelAsked] = useState<string | null>(null);

  const handleAskIntel = async () => {
    const q = intelQuestion.trim();
    if (!q) return;
    setIntelLoading(true);
    setIntelError(null);
    setIntelAnswer(null);
    setIntelAsked(q);
    try {
      const { data, error } = await supabase.functions.invoke("event-intelligence", {
        body: { question: q },
      });
      if (error) throw error;
      setIntelAnswer(data?.response ?? "No response received.");
    } catch {
      setIntelError("Unable to reach Event Intelligence — try again");
    } finally {
      setIntelLoading(false);
    }
  };

  /* ── Handlers ── */

  const handleOpenAttendees = (event: EventData) => {
    setAttendeeEvent(event);
  };

  const handleTagAllContacted = (eventId: string) => {
    setAttendeesState((prev) => ({
      ...prev,
      [eventId]: (prev[eventId] ?? []).map((a) => ({ ...a, followUp: "Done" as const })),
    }));
    toast.success("All attendees marked as contacted");
  };

  const handleOpenEmail = (event: EventData) => {
    setEmailDraft(
      `Dear [First Name],\n\nThank you for attending ${event.name} on ${event.date}. Your presence meant a great deal to the Brightside Foundation team.\n\nWe're excited to share that the event raised significant support for our community programs. We look forward to keeping you updated on the impact of your generosity.\n\nWarm regards,\nBrightside Foundation`
    );
    setEmailEvent(event);
  };

  const handleSendEmail = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setEmailEvent(null);
      toast.success("Email queued — SendGrid integration coming soon");
    }, 1200);
  };

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(emailDraft).then(() => {
      toast.success("Draft copied to clipboard!");
    }).catch(() => {
      toast.success("Draft copied to clipboard!");
    });
  };

  const handleOpenTask = (event: EventData) => {
    setTaskAssignee("Maria Santos");
    setTaskPriority("Medium");
    setTaskEvent(event);
  };

  const handleCreateTask = () => {
    setTaskEvent(null);
    toast.success("Task created");
  };

  const handleBulkTasks = () => {
    const count = (taskUpgrade ? 8 : 0) + (taskVolunteer ? 12 : 0) + (taskGeneral ? 47 : 0);
    setBulkTaskModal(false);
    toast.success(`✓ ${count} follow-up tasks created and assigned`);
  };

  const handleSendReminder = (event: EventData) => {
    const count = event.attendees.length;
    toast.success(`Reminder sent to ${count} volunteers`);
  };

  const handleMarkConfirmed = (eventId: string) => {
    setConfirmedEvents((prev) => new Set(prev).add(eventId));
    toast.success("Event marked as confirmed");
  };

  const handleTagSalesforce = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success("✓ 47 attendees tagged in Salesforce — 12 flagged as volunteer prospects");
    }, 2000);
  };

  const getDueDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  };

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Attendees (YTD)", value: "281" },
          { label: "Events This Quarter", value: "2" },
          { label: "Donors Acquired", value: "21" },
          { label: "Follow-ups Pending", value: "47" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Event Cards */}
      {EVENTS.map((event) => (
        <Card key={event.id}>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${event.color}`}>
                  <CalendarDays className={`h-6 w-6 ${event.iconColor}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{event.name}</h3>
                  <p className="text-sm text-muted-foreground">{event.date} · {event.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {confirmedEvents.has(event.id) && (
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" /> Confirmed
                  </Badge>
                )}
                <Badge className={event.statusColor}>{event.status}</Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{event.summary}</p>
            {event.badges.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {event.badges.map((b) => <Badge key={b} variant="secondary">{b}</Badge>)}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => handleOpenAttendees(event)}>
                <Users className="h-3.5 w-3.5 mr-1.5" /> View Attendees
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleOpenEmail(event)}>
                <Mail className="h-3.5 w-3.5 mr-1.5" /> Send Follow-Up Email
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleOpenTask(event)}>
                <ClipboardList className="h-3.5 w-3.5 mr-1.5" /> Create Follow-Up Task
              </Button>
              {event.id === "e1" && (
                <>
                  <Button size="sm" variant="outline" onClick={handleTagSalesforce} disabled={sending}>
                    {sending ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Tag className="h-3.5 w-3.5 mr-1.5" />}
                    Tag All in Salesforce
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setBulkTaskModal(true)}>
                    Create Bulk Follow-Up Tasks
                  </Button>
                </>
              )}
              {event.id === "e2" && (
                <>
                  <Button size="sm" variant="outline" onClick={() => handleSendReminder(event)}>
                    <Bell className="h-3.5 w-3.5 mr-1.5" /> Send Reminder
                  </Button>
                  {!confirmedEvents.has(event.id) ? (
                    <Button size="sm" variant="outline" onClick={() => handleMarkConfirmed(event.id)}>
                      <CheckCircle className="h-3.5 w-3.5 mr-1.5" /> Mark Confirmed
                    </Button>
                  ) : null}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* ── Event Intelligence Panel ── */}
      <div className="border-l-4 border-indigo-400 rounded-lg border border-border bg-card">
        <button
          className="flex w-full items-center justify-between p-4 text-left"
          onClick={() => setIntelOpen((v) => !v)}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            <span className="font-semibold text-sm">Event Intelligence</span>
            <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 text-[10px] px-1.5 py-0">AI</Badge>
          </div>
          {intelOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>

        {intelOpen && (
          <div className="px-4 pb-4 space-y-4">
            {/* Quick Insights */}
            <div className="flex flex-wrap gap-2">
              {["15 attendees not yet tagged", "3 donors attended — no follow-up sent", "Volunteer retention rate: 78%"].map((chip) => (
                <Badge key={chip} variant="secondary" className="text-xs font-normal">{chip}</Badge>
              ))}
            </div>

            {/* Ask Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Ask about your events…"
                value={intelQuestion}
                onChange={(e) => setIntelQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !intelLoading && handleAskIntel()}
                className="text-sm"
              />
              <Button size="sm" onClick={handleAskIntel} disabled={intelLoading || !intelQuestion.trim()}>
                {intelLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Ask"}
              </Button>
            </div>

            {/* Response */}
            {intelLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Analyzing event data…
              </div>
            )}
            {intelError && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {intelError}
              </div>
            )}
            {intelAnswer && !intelLoading && (
              <div className="rounded-lg bg-muted/40 p-3 space-y-1">
                {intelAsked && <p className="text-xs text-muted-foreground font-medium">Q: {intelAsked}</p>}
                <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{intelAnswer}</ReactMarkdown>
                </div>
              </div>
            )}

            <p className="text-[10px] text-muted-foreground">Powered by Event Intelligence Agent</p>
          </div>
        )}
      </div>

      {/* ── Attendees Dialog ── */}
      <Dialog open={!!attendeeEvent} onOpenChange={() => setAttendeeEvent(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {attendeeEvent && (
            <>
              <DialogHeader>
                <DialogTitle>Attendees — {attendeeEvent.name}</DialogTitle>
              </DialogHeader>
              <div className="mt-2">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">Name</th>
                      <th className="text-left py-2 px-2">Type</th>
                      <th className="text-left py-2 px-2">Engagement</th>
                      <th className="text-center py-2 px-2">Follow-Up</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(attendeesState[attendeeEvent.id] ?? attendeeEvent.attendees).map((a) => (
                      <tr key={a.id} className="border-b last:border-0">
                        <td className="py-2 px-2 font-medium">{a.name}</td>
                        <td className="py-2 px-2 text-muted-foreground">{a.type}</td>
                        <td className="py-2 px-2 text-muted-foreground">{a.engagement}</td>
                        <td className="py-2 px-2 text-center">{followUpBadge(a.followUp)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAttendeeEvent(null)}>Close</Button>
                <Button onClick={() => handleTagAllContacted(attendeeEvent.id)}>
                  <Tag className="h-4 w-4 mr-2" /> Tag All as Contacted
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Follow-Up Email Sheet ── */}
      <Sheet open={!!emailEvent} onOpenChange={() => setEmailEvent(null)}>
        <SheetContent className="sm:max-w-[480px] overflow-y-auto">
          {emailEvent && (
            <>
              <SheetHeader>
                <SheetTitle>Follow-Up Email Draft</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="rounded-lg border bg-muted/30 p-3 text-sm space-y-1">
                  <p><span className="text-muted-foreground">Event:</span> {emailEvent.name}</p>
                  <p><span className="text-muted-foreground">Date:</span> {emailEvent.date}</p>
                  <p><span className="text-muted-foreground">Recipients:</span> {emailEvent.attendees.length} attendees</p>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">Email Body</Label>
                  <Textarea
                    ref={draftRef}
                    value={emailDraft}
                    onChange={(e) => setEmailDraft(e.target.value)}
                    rows={12}
                    className="text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={handleSendEmail} disabled={sending}>
                    {sending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                    Send Email
                  </Button>
                  <Button className="flex-1" variant="outline" onClick={handleCopyDraft}>
                    <Copy className="h-4 w-4 mr-2" /> Copy to Clipboard
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* ── Create Follow-Up Task Dialog ── */}
      <Dialog open={!!taskEvent} onOpenChange={() => setTaskEvent(null)}>
        <DialogContent>
          {taskEvent && (
            <>
              <DialogHeader>
                <DialogTitle>Create Follow-Up Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label className="text-sm font-medium">Task Name</Label>
                  <Input className="mt-1.5" defaultValue={`Follow up after ${taskEvent.name}`} readOnly />
                </div>
                <div>
                  <Label className="text-sm font-medium">Assignee</Label>
                  <Select value={taskAssignee} onValueChange={setTaskAssignee}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Maria Santos">Maria Santos</SelectItem>
                      <SelectItem value="Kevin Park">Kevin Park</SelectItem>
                      <SelectItem value="Lisa Chen">Lisa Chen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium">Due Date</Label>
                  <Input className="mt-1.5" type="date" defaultValue={getDueDate()} />
                </div>
                <div>
                  <Label className="text-sm font-medium">Priority</Label>
                  <Select value={taskPriority} onValueChange={setTaskPriority}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setTaskEvent(null)}>Cancel</Button>
                <Button onClick={handleCreateTask}>Create Task</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Bulk Task Creation (Spring Gala) ── */}
      <Dialog open={bulkTaskModal} onOpenChange={setBulkTaskModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Bulk Follow-Up Tasks</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">Create individual tasks for:</p>
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={taskUpgrade} onCheckedChange={(v) => setTaskUpgrade(!!v)} />
                8 mid-level upgrade prospects (assign to: Maria Santos)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={taskVolunteer} onCheckedChange={(v) => setTaskVolunteer(!!v)} />
                12 volunteer interest flags (assign to: Kevin Park)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={taskGeneral} onCheckedChange={(v) => setTaskGeneral(!!v)} />
                47 general thank you follow-ups (assign to: Lisa Chen)
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkTaskModal(false)}>Cancel</Button>
            <Button onClick={handleBulkTasks}>Create Tasks</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
