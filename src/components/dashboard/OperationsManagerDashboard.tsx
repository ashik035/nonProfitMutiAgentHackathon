import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck, Bot, Zap, Clock, Sparkles, X } from "lucide-react";
import AITeamsDashboardCard from "@/components/dashboards/AITeamsDashboardCard";
import AIActivityWidget from "@/components/dashboard/AIActivityWidget";
import OrgHealthScore from "@/components/dashboard/OrgHealthScore";
import SinceYouWereAway from "@/components/dashboard/SinceYouWereAway";
import AgentROIHeroCard from "@/components/dashboard/AgentROIHeroCard";
import QuickStatsRow from "@/components/dashboard/QuickStatsRow";
import {
  DEMO_DATA_HEALTH,
  DEMO_AGENTS,
  DEMO_INTEGRATIONS,
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

const activeAgents = DEMO_AGENTS.filter((a) => a.status === "Active").length;
const connectedIntegrations = DEMO_INTEGRATIONS.filter((i) => i.connected).length;

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

export default function OperationsManagerDashboard() {
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
  const awayDigest = getSinceYouWereAwayDigest("operations_manager");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          System and data operations status
        </h1>
        <p className="text-muted-foreground mt-1">Operations Manager Dashboard</p>
      </div>

      {/* Org Health Score — ops-focused */}
      <OrgHealthScore
        score={DEMO_ORG_HEALTH.score}
        scoreColor={DEMO_ORG_HEALTH.scoreColor}
        breakdown={[
          { label: "Data Quality", value: "82%", percent: 82, color: "green" },
          { label: "Agent Activity", value: "5/5 active", percent: 100, color: "green" },
          { label: "Integration Health", value: `${connectedIntegrations} connected`, percent: 85, color: "green" },
          { label: "Grant Health", value: "61%", percent: 61, color: "amber" },
        ]}
        insight="All 5 AI agents active. CRM Data Integrity Agent flagged 3 duplicate records requiring merge review."
      />

      <SinceYouWereAway
        lastLoginAgo={awayDigest.lastLoginAgo}
        summary={awayDigest.summary}
        actions={awayDigest.actions}
      />

      <AgentROIHeroCard role="operations_manager" />

      {/* Quick Stats */}
      <QuickStatsRow
        stats={[
          { label: "Data Health", value: `${DEMO_DATA_HEALTH.score}%`, change: "↑ 3% vs last month", positive: true },
          { label: "Active Agents", value: `${activeAgents}`, change: "All running" },
          { label: "Integrations", value: `${connectedIntegrations}`, change: "Salesforce + Stripe" },
          { label: "Pending Actions", value: "5" },
        ]}
      />

      {/* AI Recommendations */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">AI Recommendations</CardTitle>
          </div>
          <CardDescription>All agent insights across the platform</CardDescription>
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

      <AIActivityWidget role="operations_manager" />

      <AITeamsDashboardCard />
    </div>
  );
}
