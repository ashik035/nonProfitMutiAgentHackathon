import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, CheckSquare } from "lucide-react";
import { DEMO_EVENTS } from "@/shared/data/nonprofitDemoData";

const cards = [
  {
    title: "Untagged Event Attendees",
    value: `${DEMO_EVENTS.untaggedAttendees}`,
    icon: Users,
    color: "text-amber-600",
    bg: "bg-amber-500/10",
  },
  {
    title: "Pipeline Prospects",
    value: "6 active",
    icon: Target,
    color: "text-green-600",
    bg: "bg-green-500/10",
  },
  {
    title: "Follow-Up Tasks Due",
    value: "3",
    icon: CheckSquare,
    color: "text-blue-600",
    bg: "bg-blue-500/10",
  },
];

export default function DevelopmentDirectorDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Your donor and engagement activity
        </h1>
        <p className="text-muted-foreground mt-1">Development Director Dashboard</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bg}`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-semibold">{card.value}</p>
                <p className="text-sm text-muted-foreground">{card.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
