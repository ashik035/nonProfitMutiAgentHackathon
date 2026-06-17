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
import AgentROIHeroCard from "@/components/dashboard/AgentROIHeroCard";
import QuickStatsRow from "@/components/dashboard/QuickStatsRow";
import {
  DEMO_AI_RECOMMENDATIONS,
  DEMO_ORG_HEALTH,
  getSinceYouWereAwayDigest,
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
      <Skeleton className="h-32 w-full rounded-xl" />
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
  const awayDigest = getSinceYouWereAwayDigest("executive_director");

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
        score={DEMO_ORG_HEALTH.score}
        scoreColor={DEMO_ORG_HEALTH.scoreColor}
        breakdown={DEMO_ORG_HEALTH.breakdown}
        insight={DEMO_ORG_HEALTH.insight}
      />

      <SinceYouWereAway
        lastLoginAgo={awayDigest.lastLoginAgo}
        summary={awayDigest.summary}
        actions={awayDigest.actions}
      />

      <AgentROIHeroCard role="executive_director" />

      {/* Quick Stats */}
      <QuickStatsRow
        stats={[
          { label: "Active Donors", value: "1,847", change: "↑ 23 this month", positive: true },
          { label: "Grants Active", value: "4", change: "$497K total" },
          { label: "Data Health", value: `${DEMO_ORG_HEALTH.score}%`, change: "↑ 3% vs last month", positive: true },
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

      <AIActivityWidget role="executive_director" />

      <AITeamsDashboardCard />
    </div>
  );
}
