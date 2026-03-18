import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeftRight, AlertTriangle, BarChart3, Sparkles, X } from "lucide-react";
import AITeamsDashboardCard from "@/components/dashboards/AITeamsDashboardCard";
import {
  DEMO_RECONCILIATION,
  DEMO_GRANTS,
  DEMO_AI_RECOMMENDATIONS,
  type AIRecommendation,
} from "@/shared/data/nonprofitDemoData";

const overUtilizedGrants = DEMO_GRANTS.grants.filter((g) => g.utilized > 90).length;

const cards = [
  {
    title: "Unmatched Transactions",
    value: `${DEMO_RECONCILIATION.unmatchedTransactions}`,
    icon: ArrowLeftRight,
    color: "text-amber-600",
    bg: "bg-amber-500/10",
    href: "/reconciliation",
  },
  {
    title: "Restricted Fund Alerts",
    value: `${DEMO_RECONCILIATION.restrictedFundMismatches}`,
    icon: AlertTriangle,
    color: "text-red-600",
    bg: "bg-red-500/10",
    href: "/reconciliation",
  },
  {
    title: "Grant Utilization Alerts",
    value: `${overUtilizedGrants} over 90%`,
    icon: BarChart3,
    color: "text-blue-600",
    bg: "bg-blue-500/10",
    href: "/grants",
  },
];

const SEVERITY_STYLES: Record<AIRecommendation["severity"], string> = {
  info: "border-blue-200 bg-blue-50",
  warning: "border-amber-200 bg-amber-50",
  critical: "border-red-200 bg-red-50",
  success: "border-green-200 bg-green-50",
};

const FINANCE_RECS = DEMO_AI_RECOMMENDATIONS.filter((r) =>
  ["rec-002", "rec-005", "rec-006"].includes(r.id)
);

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
}

export default function FinanceManagerDashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [dismissedRecs, setDismissedRecs] = useState<string[]>([]);

  useEffect(() => {
    document.title = "Dashboard | Nonprofit AI";
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <DashboardSkeleton />;

  const visibleRecs = FINANCE_RECS.filter((r) => !dismissedRecs.includes(r.id));

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
          <Card
            key={card.title}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(card.href)}
          >
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

      {/* AI Recommendations */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">AI Recommendations</CardTitle>
          </div>
          <CardDescription>Financial insights from your AI agents</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {visibleRecs.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <Sparkles className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">All caught up</p>
            </div>
          ) : (
            visibleRecs.map((rec) => (
              <div key={rec.id} className={`rounded-lg border p-4 ${SEVERITY_STYLES[rec.severity]}`}>
                <p className="text-sm font-medium text-foreground">{rec.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" onClick={() => navigate(rec.action1.href)}>
                    {rec.action1.label}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground gap-1"
                    onClick={() => setDismissedRecs((prev) => [...prev, rec.id])}
                  >
                    <X className="h-3.5 w-3.5" />
                    {rec.action2.label}
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
