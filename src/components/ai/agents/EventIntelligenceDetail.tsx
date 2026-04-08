import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, X, UserPlus, Tag, Clock, Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format, subDays, subHours } from "date-fns";

const NOW = new Date();

interface UntaggedAttendee {
  id: string;
  name: string;
  detail: string;
}

const INITIAL_ATTENDEES: UntaggedAttendee[] = [
  { id: "a1", name: "Maya Patel", detail: "Attended Spring Gala, no Salesforce record" },
  { id: "a2", name: "James Okafor", detail: "In Salesforce but not tagged as attendee, indicated volunteer interest" },
  { id: "a3", name: "Diana Reyes", detail: "Attended Spring Gala, no Salesforce record" },
  { id: "a4", name: "Kevin Wu", detail: "In Salesforce, not tagged — past donor ($180/yr)" },
  { id: "a5", name: "Priya Sharma", detail: "New contact, indicated interest in monthly giving" },
];

const REMAINING_COUNT = 42;

const ACTIVITY_LOG = [
  { time: format(subHours(NOW, 6), "h:mm a"), text: "Scanned 120 Spring Gala attendees against Salesforce" },
  { time: format(subHours(NOW, 6), "h:mm a"), text: "47 attendees not tagged — 12 indicated volunteer interest" },
  { time: format(subDays(NOW, 1), "MMM d"), text: "Run complete — Community Open House: 8 untagged attendees" },
  { time: format(subDays(NOW, 3), "MMM d"), text: "Run complete — no new events to process" },
  { time: format(subDays(NOW, 5), "MMM d"), text: "Run complete — Board Dinner: all attendees tagged" },
];

export default function EventIntelligenceDetail() {
  const [attendees, setAttendees] = useState(INITIAL_ATTENDEES);
  const [bulkTagged, setBulkTagged] = useState(false);
  const [bulkTagging, setBulkTagging] = useState(false);

  const handleCreate = (id: string, name: string) => {
    setAttendees((prev) => prev.filter((a) => a.id !== id));
    toast.success(`Donor record created for ${name}`);
  };

  const handleTag = (id: string, name: string) => {
    setAttendees((prev) => prev.filter((a) => a.id !== id));
    toast.success(`${name} tagged as attendee + flagged as volunteer`);
  };

  const handleDismiss = (id: string) => {
    setAttendees((prev) => prev.filter((a) => a.id !== id));
    toast("Dismissed", { icon: "✓" });
  };

  const handleTagAll = () => {
    setBulkTagging(true);
    setTimeout(() => {
      setBulkTagging(false);
      setBulkTagged(true);
      setAttendees([]);
      toast.success("47 attendees tagged in Salesforce");
    }, 2000);
  };

  const totalRemaining = attendees.length + (bulkTagged ? 0 : REMAINING_COUNT);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold">{totalRemaining}</p>
          <p className="text-xs text-muted-foreground">Attendees to review</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-green-600">73</p>
          <p className="text-xs text-muted-foreground">Auto-tagged this run</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-primary">4 hrs</p>
          <p className="text-xs text-muted-foreground">Est. time saved</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" /> Untagged Attendees — Spring Gala
          </CardTitle>
          <CardDescription>
            {totalRemaining} of 120 attendees need CRM tagging
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {attendees.length === 0 && bulkTagged ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <CheckCircle className="h-10 w-10 text-green-500" />
              <p className="font-semibold text-foreground">All clear</p>
              <p className="text-sm text-muted-foreground">All 47 attendees have been tagged</p>
            </div>
          ) : attendees.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <CheckCircle className="h-10 w-10 text-green-500" />
              <p className="font-semibold text-foreground">All clear</p>
              <p className="text-sm text-muted-foreground">No items need review</p>
            </div>
          ) : (
            <>
              {attendees.map((a) => (
                <div key={a.id} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-foreground">{a.name}</p>
                      <p className="text-sm text-muted-foreground">{a.detail}</p>
                    </div>
                    <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 text-xs">
                      Untagged
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {a.detail.includes("no Salesforce") || a.detail.includes("New contact") ? (
                      <Button size="sm" className="gap-1.5" onClick={() => handleCreate(a.id, a.name)}>
                        <UserPlus className="h-3.5 w-3.5" /> Create Donor Record
                      </Button>
                    ) : (
                      <Button size="sm" className="gap-1.5" onClick={() => handleTag(a.id, a.name)}>
                        <Tag className="h-3.5 w-3.5" /> Tag Attendee + Flag Volunteer
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => handleDismiss(a.id)}>
                      <X className="h-3.5 w-3.5" /> Dismiss
                    </Button>
                  </div>
                </div>
              ))}

              {/* Collapsed remaining section */}
              {!bulkTagged && (
                <div className="rounded-lg border border-dashed p-4 text-center space-y-3">
                  <p className="text-sm text-muted-foreground">
                    + {REMAINING_COUNT} more attendees need tagging
                  </p>
                  <Button
                    className="gap-1.5"
                    onClick={handleTagAll}
                    disabled={bulkTagging}
                  >
                    {bulkTagging ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Tagging all attendees...
                      </>
                    ) : (
                      <>
                        <Tag className="h-4 w-4" /> Tag All 47 Attendees
                      </>
                    )}
                  </Button>
                  {bulkTagging && (
                    <div className="h-2 rounded-full bg-muted overflow-hidden mt-2">
                      <div className="h-full rounded-full bg-primary animate-pulse" style={{ width: "60%" }} />
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4" /> Activity Log</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {ACTIVITY_LOG.map((a, i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              <span className="text-muted-foreground font-mono text-xs mt-0.5 shrink-0 w-20">{a.time}</span>
              <span className="text-foreground">{a.text}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
