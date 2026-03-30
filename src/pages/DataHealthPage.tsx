import { useState, useEffect } from "react";

import {
  ShieldCheck,
  Users,
  Home,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Eye,
  X,
  FileWarning,
  TrendingUp,
  Sparkles,
  UserPlus,
  Send,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DEMO_DATA_HEALTH, DEMO_MID_DONOR_UPGRADES } from "@/shared/data/nonprofitDemoData";
import { toastSuccess } from "@/lib/toast-helpers";

function HealthScoreCard({ score }: { score: number }) {
  const color =
    score >= 80 ? "text-green-600" : score >= 60 ? "text-amber-500" : "text-red-500";
  const bg =
    score >= 80 ? "bg-green-50" : score >= 60 ? "bg-amber-50" : "bg-red-50";
  const ring =
    score >= 80 ? "ring-green-200" : score >= 60 ? "ring-amber-200" : "ring-red-200";

  return (
    <Card className={`${bg} ring-1 ${ring} border-0`}>
      <CardContent className="flex items-center gap-6 p-6">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
          <span className={`text-4xl font-bold ${color}`}>{score}%</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Overall Data Health Score</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Based on duplicate detection, profile completeness, and data consistency checks.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

interface InsightCardProps {
  icon: React.ReactNode;
  title: string;
  variant: "amber" | "red" | "green" | "blue";
}

function InsightCard({ icon, title, variant }: InsightCardProps) {
  const styles = {
    amber: "bg-amber-50 ring-amber-200 text-amber-700",
    red: "bg-red-50 ring-red-200 text-red-700",
    green: "bg-green-50 ring-green-200 text-green-700",
    blue: "bg-blue-50 ring-blue-200 text-blue-700",
  };

  return (
    <Card className={`ring-1 border-0 ${styles[variant].split(" ").slice(0, 2).join(" ")}`}>
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 ${styles[variant].split(" ")[2]}`}>{icon}</div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{title}</p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5">
            <Eye className="h-3.5 w-3.5" />
            View Details
          </Button>
          <Button size="sm" variant="ghost" className="gap-1.5 text-muted-foreground">
            <X className="h-3.5 w-3.5" />
            Dismiss
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-8 p-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
}

export default function DataHealthPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "Data Health | Nonprofit AI";
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <PageSkeleton />;

  const { mergeSuggestions } = DEMO_DATA_HEALTH;

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Data Health</h1>
        <p className="text-sm text-muted-foreground">
          CRM data quality insights from your connected systems
        </p>
        <Badge variant="secondary" className="mt-2">
          Data sourced from Salesforce &middot; Last synced 2 hours ago
        </Badge>
      </div>

      {/* Health Score */}
      <HealthScoreCard score={DEMO_DATA_HEALTH.score} />

      {/* Mid-Donor Upgrade Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Mid-Donor Upgrade Opportunities
          </CardTitle>
          <CardDescription>
            AI-identified donors with high potential for giving-level advancement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 3-column stat cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="bg-green-50 ring-1 ring-green-200 border-0">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-green-700"><TrendingUp className="h-5 w-5" /></div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-green-700">{DEMO_MID_DONOR_UPGRADES.upgradeReady}</p>
                    <p className="text-sm font-medium text-foreground">Upgrade-Ready Donors</p>
                    <p className="mt-1 text-xs text-muted-foreground">Giving $250–$499/year consistently for 3+ years</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="mt-4 gap-1.5">
                  <Eye className="h-3.5 w-3.5" /> View Upgrade Pipeline
                </Button>
              </CardContent>
            </Card>
            <Card className="bg-amber-50 ring-1 ring-amber-200 border-0">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-amber-700"><Sparkles className="h-5 w-5" /></div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-amber-700">{DEMO_MID_DONOR_UPGRADES.highReadiness}</p>
                    <p className="text-sm font-medium text-foreground">High-Readiness</p>
                    <p className="mt-1 text-xs text-muted-foreground">Attended 2+ events, engaged beyond the gift</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="mt-4 gap-1.5">
                  <Send className="h-3.5 w-3.5" /> Start Outreach
                </Button>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 ring-1 ring-blue-200 border-0">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-blue-700"><UserPlus className="h-5 w-5" /></div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-blue-700">{DEMO_MID_DONOR_UPGRADES.newThisMonth}</p>
                    <p className="text-sm font-medium text-foreground">New This Month</p>
                    <p className="mt-1 text-xs text-muted-foreground">Recently crossed the $250 threshold</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="mt-4 gap-1.5">
                  <Eye className="h-3.5 w-3.5" /> Review Profiles
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Donor signal list */}
          <div className="rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Donor</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Avg Giving</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Years</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Events</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Score</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Readiness</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {DEMO_MID_DONOR_UPGRADES.donors.map((donor) => (
                    <tr key={donor.name} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{donor.name}</td>
                      <td className="px-4 py-3">${donor.avgGiving}/yr</td>
                      <td className="px-4 py-3">{donor.years} years</td>
                      <td className="px-4 py-3">{donor.eventsAttended}</td>
                      <td className="px-4 py-3">
                        <span className={`font-semibold ${donor.score >= 80 ? "text-green-600" : donor.score >= 60 ? "text-amber-600" : "text-muted-foreground"}`}>
                          {donor.score}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={donor.readiness === "High Readiness" ? "default" : donor.readiness === "Ready" ? "secondary" : "outline"}>
                          {donor.readiness}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="gap-1.5"
                          onClick={() => toastSuccess(`Outreach task created for ${donor.name}`)}
                        >
                          <Send className="h-3.5 w-3.5" /> Create Outreach Task
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insight Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InsightCard
          icon={<Users className="h-5 w-5" />}
          title={`${DEMO_DATA_HEALTH.duplicates} duplicate records detected`}
          variant="amber"
        />
        <InsightCard
          icon={<AlertTriangle className="h-5 w-5" />}
          title={`${DEMO_DATA_HEALTH.incompleteProfiles} incomplete donor profiles`}
          variant="amber"
        />
        <InsightCard
          icon={<Home className="h-5 w-5" />}
          title={`${DEMO_DATA_HEALTH.householdInconsistencies} household inconsistencies`}
          variant="amber"
        />
        <InsightCard
          icon={<CreditCard className="h-5 w-5" />}
          title={`${DEMO_DATA_HEALTH.softCreditAlerts} soft credit alerts`}
          variant="amber"
        />
      </div>

      {/* Merge Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle>Merge Suggestions</CardTitle>
          <CardDescription>
            AI-detected potential duplicate records for your review
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {mergeSuggestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <FileWarning className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No merge suggestions at this time</p>
            </div>
          ) : (
            mergeSuggestions.map((suggestion) => (
              <div
                key={suggestion.pair[0]}
                className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {suggestion.pair[0]} &harr; {suggestion.pair[1]}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Match confidence: {suggestion.confidence}%
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Approve Merge
                  </Button>
                  <Button size="sm" variant="outline">
                    Mark as Reviewed
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
