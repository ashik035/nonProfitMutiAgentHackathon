import {
  CalendarDays,
  Users,
  Heart,
  Sparkles,
  Tag,
  ListPlus,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DEMO_EVENTS } from "@/shared/data/nonprofitDemoData";

const FOLLOW_UP_SUGGESTIONS = [
  {
    attendee: "Sarah Chen",
    suggestion: "Send thank-you email — first-time major donor prospect",
    priority: "high",
  },
  {
    attendee: "Michael Torres",
    suggestion: "Schedule volunteer onboarding — expressed interest in mentorship program",
    priority: "medium",
  },
  {
    attendee: "Lisa Patel",
    suggestion: "Add to board prospect list — corporate partnership opportunity",
    priority: "high",
  },
];

export default function EventsPage() {
  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Events</h1>
        <p className="text-sm text-muted-foreground">
          Post-event engagement intelligence from your connected platforms
        </p>
        <Badge variant="secondary" className="mt-2">
          Connected to Eventbrite &middot; Last synced 1 hour ago
        </Badge>
      </div>

      {/* Recent Event Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 ring-1 ring-blue-200 border-0">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <CalendarDays className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{DEMO_EVENTS.recentEventName}</h3>
              <p className="text-sm text-muted-foreground">
                {DEMO_EVENTS.attendance} attendees &middot; March 1, 2026
              </p>
            </div>
          </div>
          <Badge className="w-fit bg-green-100 text-green-700 hover:bg-green-100">
            Completed
          </Badge>
        </CardContent>
      </Card>

      {/* Insight Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Untagged Attendees */}
        <Card className="ring-1 ring-amber-200 border-0 bg-amber-50">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <Tag className="mt-0.5 h-5 w-5 text-amber-600" />
              <p className="text-sm font-medium text-foreground">
                {DEMO_EVENTS.untaggedAttendees} attendees not yet tagged
              </p>
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline" className="gap-1.5">
                View Details
              </Button>
              <Button size="sm" className="gap-1.5">
                <ListPlus className="h-3.5 w-3.5" />
                Create Follow-Up Task
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Volunteer Interest */}
        <Card className="ring-1 ring-blue-200 border-0 bg-blue-50">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <Heart className="mt-0.5 h-5 w-5 text-blue-600" />
              <p className="text-sm font-medium text-foreground">
                {DEMO_EVENTS.volunteerInterestFlags} volunteer interest flags
              </p>
            </div>
            <div className="mt-4">
              <Button size="sm" variant="outline" className="gap-1.5">
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI Suggestions */}
        <Card className="ring-1 ring-green-200 border-0 bg-green-50">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 text-green-600" />
              <p className="text-sm font-medium text-foreground">
                AI follow-up suggestions ready
              </p>
            </div>
            <div className="mt-4">
              <Button size="sm" className="gap-1.5 bg-green-600 hover:bg-green-700">
                View Suggestions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Follow-Up Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle>Follow-Up Suggestions</CardTitle>
          <CardDescription>
            AI-generated engagement recommendations based on event attendance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {FOLLOW_UP_SUGGESTIONS.map((item) => (
            <div
              key={item.attendee}
              className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{item.attendee}</p>
                  <Badge
                    variant={item.priority === "high" ? "destructive" : "secondary"}
                    className="text-xs"
                  >
                    {item.priority}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.suggestion}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="gap-1.5">
                  <ListPlus className="h-3.5 w-3.5" />
                  Create Task
                </Button>
                <Button size="sm" variant="ghost" className="gap-1.5 text-muted-foreground">
                  <X className="h-3.5 w-3.5" />
                  Dismiss
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
