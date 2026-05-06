import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck, CalendarClock, FileText, TrendingUp, Sparkles, X } from "lucide-react";
import AITeamsDashboardCard from "@/components/dashboards/AITeamsDashboardCard";
import AIActivityWidget from "@/components/dashboard/AIActivityWidget";
import OrgHealthScore from "@/components/dashboard/OrgHealthScore";
import SinceYouWereAway from "@/components/dashboard/SinceYouWereAway";
import QuickStatsRow from "@/components/dashboard/QuickStatsRow";
import {
  DEMO_DATA_HEALTH,
  DEMO_GRANTS,
  DEMO_BOARD_REPORT,
  DEMO_AI_RECOMMENDATIONS,
  type AIRecommendation,
} from "@/shared/data/nonprofitDemoData";

const SEVERITY_STYLES: Record<AIRecommendation["severity"], string> = {
  info: "border-blue-200 bg-blue-50",
  warning: "border-amber-200 bg-amber-50",
  critical: "border-red-200 bg-red-50",
  success: "border-green-200 bg-green-50",
};

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-36 w-full rounded-xl" />
      <Skeleton className="h-28 w-full rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function ExecutiveDirectorDashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [dismissedRecs, setDismissedRecs] = useState<string[]>([]);

  useEffect(() => {
    document.title = "Dashboard | Brightside Foundation";
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <DashboardSkeleton />;

  const visibleRecs = DEMO_AI_RECOMMENDATIONS.filter(
    (r) => !dismissedRecs.includes(r.id)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Here's your organization at a glance
        </h1>
        <p className="text-muted-foreground mt-1">Executive Director Dashboard</p>
      </div>

      {/* Org Health Score */}
      <OrgHealthScore
        score={74}
        scoreColor="amber"
        breakdown={[
          { label: "Data Quality", value: "82%", percent: 82, color: "green" },
          { label: "Grant Health", value: "61%", percent: 61, color: "amber" },
          { label: "Reconciliation", value: "90%", percent: 90, color: "green" },
          { label: "Agent Activity", value: "5/5 active", percent: 100, color: "green" },
        ]}
        insight="Grant health is below target — 2 reports due within 14 days. Review recommended."
      />

      {/* Since You Were Away */}
      <SinceYouWereAway
        lastLoginAgo="2 days ago"
        summary="Your AI agents ran 14 times while you were away. The CRM Data Integrity Agent flagged 3 new potential duplicate records. The Grant Compliance Agent is tracking the Kresge Foundation report, due in 8 days with 61% fund utilization. One Stripe transaction from Apr 6 ($2,340) remains unmatched in Salesforce."
        actions={[
          { label: "Review 3 duplicates →", href: "/agents/crm-data-integrity" },
          { label: "Open grant report →", href: "/agents/grant-compliance" },
          { label: "Review transaction →", href: "/agents/reconciliation-fund-accounting" },
        ]}
      />

      {/* Quick Stats */}
      <QuickStatsRow
        stats={[
          { label: "Active Donors", value: "1,847", change: "↑ 23 this month", positive: true },
          { label: "Grants Active", value: "4", change: "$497K total" },
          { label: "Data Health", value: "82%", change: "↑ 3% vs last month", positive: true },
          { label: "Tasks Pending", value: "7" },
        ]}
      />

      {/* AI Recommendations Feed */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">AI Recommendations</CardTitle>
          </div>
          <CardDescription>Actionable insights from your AI agents</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {visibleRecs.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <Sparkles className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">All caught up — no new recommendations</p>
            </div>
          ) : (
            visibleRecs.map((rec) => (
              <div
                key={rec.id}
                className={`rounded-lg border p-4 ${SEVERITY_STYLES[rec.severity]}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{rec.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {rec.source} &middot; {rec.timestamp}
                    </p>
                  </div>
                </div>
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

      <AIActivityWidget />

      <AITeamsDashboardCard />
    </div>
  );
}
