import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, CalendarClock, FileText, TrendingUp } from "lucide-react";
import {
  DEMO_DATA_HEALTH,
  DEMO_GRANTS,
  DEMO_BOARD_REPORT,
} from "@/shared/data/nonprofitDemoData";

const cards = [
  {
    title: "Data Health Score",
    value: `${DEMO_DATA_HEALTH.score}%`,
    icon: ShieldCheck,
    color: "text-blue-600",
    bg: "bg-blue-500/10",
  },
  {
    title: "Grant Deadlines",
    value: `${DEMO_GRANTS.upcomingDeadlines} upcoming`,
    icon: CalendarClock,
    color: "text-amber-600",
    bg: "bg-amber-500/10",
  },
  {
    title: "Board Report",
    value: DEMO_BOARD_REPORT.status,
    icon: FileText,
    color: "text-green-600",
    bg: "bg-green-500/10",
  },
  {
    title: "Donor Growth",
    value: `↑${DEMO_BOARD_REPORT.donorGrowth}%`,
    icon: TrendingUp,
    color: "text-purple-600",
    bg: "bg-purple-500/10",
  },
];

export default function ExecutiveDirectorDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Here's your organization at a glance
        </h1>
        <p className="text-muted-foreground mt-1">Executive Director Dashboard</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
