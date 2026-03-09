import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Bot, Zap, Clock } from "lucide-react";
import { DEMO_DATA_HEALTH, DEMO_AGENTS } from "@/shared/data/nonprofitDemoData";

const activeAgents = DEMO_AGENTS.filter((a) => a.status === "Active").length;
const pendingActions = DEMO_AGENTS.reduce((sum, a) => sum + a.actions.length, 0);

const cards = [
  {
    title: "Data Health Score",
    value: `${DEMO_DATA_HEALTH.score}%`,
    icon: ShieldCheck,
    color: "text-blue-600",
    bg: "bg-blue-500/10",
  },
  {
    title: "Active AI Agents",
    value: `${activeAgents}`,
    icon: Bot,
    color: "text-purple-600",
    bg: "bg-purple-500/10",
  },
  {
    title: "Integrations Connected",
    value: "2",
    icon: Zap,
    color: "text-teal-600",
    bg: "bg-teal-500/10",
  },
  {
    title: "Pending AI Actions",
    value: `${pendingActions}`,
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-500/10",
  },
];

export default function OperationsManagerDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          System and data operations status
        </h1>
        <p className="text-muted-foreground mt-1">Operations Manager Dashboard</p>
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
