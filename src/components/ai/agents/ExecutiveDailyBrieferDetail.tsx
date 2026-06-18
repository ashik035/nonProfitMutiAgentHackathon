import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Clock,
  Loader2,
  Sparkles,
  Sun,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useExecutiveDailyBriefer, type ExecutiveDailyBrieferRunResult } from "@/hooks/useExecutiveDailyBriefer";
import { useLiveAgentDetailBootstrap } from "@/hooks/useLiveAgentDetailBootstrap";
import type { BriefingPriorityItem, ExecutiveDailyBriefing } from "@/types/executive-daily-briefer";
import { cn } from "@/lib/utils";

const SEVERITY_STYLES: Record<string, string> = {
  critical: "border-red-200 bg-red-50 dark:bg-red-950/20",
  warning: "border-amber-200 bg-amber-50 dark:bg-amber-950/20",
  info: "border-blue-200 bg-blue-50 dark:bg-blue-950/20",
  success: "border-green-200 bg-green-50 dark:bg-green-950/20",
};

function PriorityCard({ item }: { item: BriefingPriorityItem }) {
  const navigate = useNavigate();
  return (
    <div
      className={cn(
        "rounded-lg border p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3",
        SEVERITY_STYLES[item.severity] ?? SEVERITY_STYLES.info
      )}
    >
      <div className="space-y-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-[10px] capitalize">
            {item.category}
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] capitalize",
              item.severity === "critical" && "border-red-300 text-red-700"
            )}
          >
            {item.severity}
          </Badge>
        </div>
        <p className="font-medium text-sm">{item.title}</p>
        <p className="text-sm text-muted-foreground">{item.detail}</p>
      </div>
      {item.href && (
        <Button size="sm" variant="outline" className="shrink-0" onClick={() => navigate(item.href!)}>
          Open
        </Button>
      )}
    </div>
  );
}

function BriefingOutput({
  briefing,
  latencyMs,
  model,
  provider,
  runId,
}: {
  briefing: ExecutiveDailyBriefing;
  latencyMs: number;
  model: string;
  provider: string;
  runId?: string;
}) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="gap-1">
          <Sparkles className="h-3 w-3" />
          Generated in {(latencyMs / 1000).toFixed(1)}s
        </Badge>
        <Badge variant="outline" className="font-mono text-xs">
          {model}
        </Badge>
        {briefing.time_saved_minutes > 0 && (
          <Badge className="gap-1 bg-green-600 hover:bg-green-600 text-white border-0">
            <Clock className="h-3 w-3" />~{briefing.time_saved_minutes} min saved
          </Badge>
        )}
        {runId && (
          <Badge variant="outline" className="font-mono text-[10px]">
            run logged
          </Badge>
        )}
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-amber-50/50 to-background dark:from-amber-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sun className="h-5 w-5 text-amber-500" />
            {briefing.greeting}
          </CardTitle>
          <CardDescription>{briefing.briefing_date}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{briefing.executive_summary}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{briefing.metrics_snapshot.overdue_actions}</p>
            <p className="text-xs text-muted-foreground">Overdue actions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{briefing.metrics_snapshot.grants_due_soon}</p>
            <p className="text-xs text-muted-foreground">Grants due soon</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{briefing.metrics_snapshot.at_risk_donors}</p>
            <p className="text-xs text-muted-foreground">At-risk donors</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{briefing.metrics_snapshot.open_tasks}</p>
            <p className="text-xs text-muted-foreground">Open tasks</p>
          </CardContent>
        </Card>
      </div>

      {briefing.recommended_action && (
        <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-green-700" />
              Recommended next step
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm">{briefing.recommended_action}</p>
            <Button size="sm" variant="outline" onClick={() => navigate("/dashboard")}>
              Open dashboard
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Today&apos;s priorities ({briefing.priority_items.length})
        </h3>
        {briefing.priority_items.map((item, i) => (
          <PriorityCard key={`${item.title}-${i}`} item={item} />
        ))}
      </div>
    </div>
  );
}

export default function ExecutiveDailyBrieferDetail() {
  const briefer = useExecutiveDailyBriefer();
  const [result, setResult] = useState<{
    briefing: ExecutiveDailyBriefing;
    latencyMs: number;
    model: string;
    provider: string;
    runId?: string;
  } | null>(null);

  const applyRunResult = useCallback((data: ExecutiveDailyBrieferRunResult) => {
    setResult({
      briefing: data.briefing,
      latencyMs: data.latencyMs,
      model: data.model,
      provider: data.provider,
      runId: data.runId,
    });
  }, []);

  const handleGenerate = async () => {
    setResult(null);
    try {
      const data = await briefer.mutateAsync();
      applyRunResult(data);
    } catch {
      // Hook resolves with client fallback.
    }
  };

  useLiveAgentDetailBootstrap({
    run: () => briefer.mutateAsync(),
    apply: applyRunResult,
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-amber-500" />
            Morning Briefing
          </CardTitle>
          <CardDescription>
            Aggregates grants, board actions, donor risk, and operations into a single Executive
            Director morning briefing — what needs attention today.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Pulls grants, board actions, donor signals, and open tasks into one prioritized
            briefing for the Executive Director.
          </p>
          <Button onClick={handleGenerate} disabled={briefer.isPending} className="gap-1.5">
            {briefer.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Building briefing…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Morning Briefing
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <BriefingOutput
          briefing={result.briefing}
          latencyMs={result.latencyMs}
          model={result.model}
          provider={result.provider}
          runId={result.runId}
        />
      )}
    </div>
  );
}
