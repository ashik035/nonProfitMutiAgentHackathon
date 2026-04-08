import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck, Bot, Zap, Clock, Sparkles, X } from "lucide-react";
import AITeamsDashboardCard from "@/components/dashboards/AITeamsDashboardCard";
import OrgHealthScore from "@/components/dashboard/OrgHealthScore";
import SinceYouWereAway from "@/components/dashboard/SinceYouWereAway";
import QuickStatsRow from "@/components/dashboard/QuickStatsRow";
import {
  DEMO_DATA_HEALTH,
  DEMO_AGENTS,
  DEMO_INTEGRATIONS,
  DEMO_AI_RECOMMENDATIONS,
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
        score={80}
        scoreColor="amber"
        breakdown={[
          { label: "Data Quality", value: "82%", percent: 82, color: "green" },
          { label: "Agent Activity", value: "5/5 active", percent: 100, color: "green" },
          { label: "Integration Health", value: `${connectedIntegrations} connected`, percent: 85, color: "green" },
          { label: "Grant Health", value: "61%", percent: 61, color: "amber" },
        ]}
        insight="All 5 AI agents active. CRM Data Integrity Agent flagged 3 duplicate records requiring merge review."
      />

      {/* Since You Were Away — ops-focused */}
      <SinceYouWereAway
        lastLoginAgo="2 days ago"
        summary="Your AI agents ran 14 times while you were away. The CRM Data Integrity Agent found 3 potential duplicate records — Sarah Chen and Michael Torres flagged for merge review. All 5 agents remain active with no errors. Salesforce and Stripe integrations synced successfully."
        actions={[
          { label: "Review 3 duplicates →", href: "/agents/crm-data-integrity" },
          { label: "View agent status →", href: "/agents" },
          { label: "Check data health →", href: "/data-health" },
        ]}
      />

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

      <AITeamsDashboardCard />
    </div>
  );
}
