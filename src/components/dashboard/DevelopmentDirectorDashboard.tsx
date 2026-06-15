import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Target, CheckSquare, Sparkles, X } from "lucide-react";
import AITeamsDashboardCard from "@/components/dashboards/AITeamsDashboardCard";
import OrgHealthScore from "@/components/dashboard/OrgHealthScore";
import SinceYouWereAway from "@/components/dashboard/SinceYouWereAway";
import AgentROIHeroCard from "@/components/dashboard/AgentROIHeroCard";
import QuickStatsRow from "@/components/dashboard/QuickStatsRow";
import {
  DEMO_EVENTS,
  DEMO_AI_RECOMMENDATIONS,
  type AIRecommendation,
} from "@/shared/data/nonprofitDemoData";

const SEVERITY_STYLES: Record<AIRecommendation["severity"], string> = {
  info: "border-blue-200 bg-blue-50",
  warning: "border-amber-200 bg-amber-50",
  critical: "border-red-200 bg-red-50",
  success: "border-green-200 bg-green-50",
};

const DEV_RECS = DEMO_AI_RECOMMENDATIONS.filter((r) =>
  ["rec-001", "rec-003", "rec-004"].includes(r.id)
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

export default function DevelopmentDirectorDashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [dismissedRecs, setDismissedRecs] = useState<string[]>([]);

  useEffect(() => {
    document.title = "Dashboard | Brightside Foundation";
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <DashboardSkeleton />;

  const visibleRecs = DEV_RECS.filter((r) => !dismissedRecs.includes(r.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Your donor and engagement activity
        </h1>
        <p className="text-muted-foreground mt-1">Development Director Dashboard</p>
      </div>

      {/* Org Health Score — donor-focused */}
      <OrgHealthScore
        score={76}
        scoreColor="amber"
        breakdown={[
          { label: "Data Quality", value: "82%", percent: 82, color: "green" },
          { label: "Donor Engagement", value: "78%", percent: 78, color: "amber" },
          { label: "Reconciliation", value: "90%", percent: 90, color: "green" },
          { label: "Agent Activity", value: "5/5 active", percent: 100, color: "green" },
        ]}
        insight="Donor engagement below target — 47 upgrade-ready donors identified. Pipeline review recommended."
      />

      {/* Since You Were Away — donor-focused */}
      <SinceYouWereAway
        lastLoginAgo="2 days ago"
        summary="Your AI agents ran 14 times while you were away. The Mid-Donor Upgrade Agent identified 47 donors giving $250–$999/yr who are ready for upgrade conversations. 12 have been scored as high-readiness. The Event Intelligence Agent flagged 47 Spring Gala attendees not yet tagged in Salesforce."
        actions={[
          { label: "Review upgrade pipeline →", href: "/donor-pipeline" },
          { label: "Tag event attendees →", href: "/agents/event-intelligence" },
          { label: "View all agents →", href: "/agents" },
        ]}
      />

      <AgentROIHeroCard role="development_director" />

      {/* Quick Stats */}
      <QuickStatsRow
        stats={[
          { label: "Active Donors", value: "1,847", change: "↑ 23 this month", positive: true },
          { label: "Upgrade Candidates", value: "47", change: "12 high-readiness" },
          { label: "Events This Quarter", value: "3", change: "Spring Gala latest" },
          { label: "Follow-Up Tasks", value: "3" },
        ]}
      />

      {/* AI Recommendations */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">AI Recommendations</CardTitle>
          </div>
          <CardDescription>Insights relevant to donor engagement</CardDescription>
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
