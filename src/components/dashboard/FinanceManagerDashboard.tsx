import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeftRight, AlertTriangle, BarChart3 } from "lucide-react";
import { DEMO_RECONCILIATION, DEMO_GRANTS } from "@/shared/data/nonprofitDemoData";

const overUtilizedGrants = DEMO_GRANTS.grants.filter((g) => g.utilized > 90).length;

const cards = [
  {
    title: "Unmatched Transactions",
    value: `${DEMO_RECONCILIATION.unmatchedTransactions}`,
    icon: ArrowLeftRight,
    color: "text-amber-600",
    bg: "bg-amber-500/10",
  },
  {
    title: "Restricted Fund Alerts",
    value: `${DEMO_RECONCILIATION.restrictedFundMismatches}`,
    icon: AlertTriangle,
    color: "text-red-600",
    bg: "bg-red-500/10",
  },
  {
    title: "Grant Utilization Alerts",
    value: `${overUtilizedGrants} over 90%`,
    icon: BarChart3,
    color: "text-blue-600",
    bg: "bg-blue-500/10",
  },
];

export default function FinanceManagerDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Financial operations overview
        </h1>
        <p className="text-muted-foreground mt-1">Finance Manager Dashboard</p>
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
