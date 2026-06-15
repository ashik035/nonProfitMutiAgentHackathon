import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeftRight, AlertTriangle, BarChart3, Sparkles, X } from "lucide-react";
import AITeamsDashboardCard from "@/components/dashboards/AITeamsDashboardCard";
import OrgHealthScore from "@/components/dashboard/OrgHealthScore";
import SinceYouWereAway from "@/components/dashboard/SinceYouWereAway";
import AgentROIHeroCard from "@/components/dashboard/AgentROIHeroCard";
import QuickStatsRow from "@/components/dashboard/QuickStatsRow";
import {
  DEMO_RECONCILIATION,
  DEMO_GRANTS,
  DEMO_AI_RECOMMENDATIONS,
  type AIRecommendation,
} from "@/shared/data/nonprofitDemoData";

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
      <Skeleton className="h-36 w-full rounded-xl" />
      <Skeleton className="h-28 w-full rounded-xl" />
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function FinanceManagerDashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [dismissedRecs, setDismissedRecs] = useState<string[]>([]);

  useEffect(() => {
    document.title = "Dashboard | Brightside Foundation";
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

      {/* Org Health Score — finance-focused */}
      <OrgHealthScore
        score={77}
        scoreColor="amber"
        breakdown={[
          { label: "Reconciliation", value: "90%", percent: 90, color: "green" },
          { label: "Grant Health", value: "61%", percent: 61, color: "amber" },
          { label: "Fund Accuracy", value: "95%", percent: 95, color: "green" },
          { label: "Agent Activity", value: "5/5 active", percent: 100, color: "green" },
        ]}
        insight="1 unmatched Stripe transaction ($2,340) needs review. Grant utilization at 61% for Kresge Foundation."
      />

      {/* Since You Were Away — finance-focused */}
      <SinceYouWereAway
        lastLoginAgo="2 days ago"
        summary="Your AI agents ran 14 times while you were away. One Stripe transaction from Apr 6 ($2,340, donor email m.chen@outlook.com) remains unmatched in Salesforce. The Grant Compliance Agent flagged the Kresge Foundation report due in 8 days — utilization at 61% with a $4,200 budget variance requiring explanation."
        actions={[
          { label: "Review transaction →", href: "/agents/reconciliation-fund-accounting" },
          { label: "Open grant report →", href: "/agents/grant-compliance" },
          { label: "View reconciliation →", href: "/reconciliation" },
        ]}
      />

      <AgentROIHeroCard role="finance_manager" />

      {/* Quick Stats */}
      <QuickStatsRow
        stats={[
          { label: "Unmatched Txns", value: `${DEMO_RECONCILIATION.unmatchedTransactions}`, change: "1 needs review" },
          { label: "Grants Active", value: "4", change: "$497K total" },
          { label: "Fund Accuracy", value: "95%", change: "↑ 2% vs last month", positive: true },
          { label: "Tasks Pending", value: "4" },
        ]}
      />

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

      <AITeamsDashboardCard />
    </div>
  );
}
