import { useCallback, useState, type ComponentType } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Ban,
  CheckCircle2,
  Clock,
  ListChecks,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useActionItemTracker, type ActionItemTrackerRunResult } from "@/hooks/useActionItemTracker";
import { useLiveAgentDetailBootstrap } from "@/hooks/useLiveAgentDetailBootstrap";
import type { ActionItemTrackerResult, BoardActionItem } from "@/types/action-item-tracker";

function formatDue(item: BoardActionItem): string {
  if (!item.due_date) return "—";
  if (item.days_overdue && item.days_overdue > 0) {
    return `${item.due_date} (${item.days_overdue}d overdue)`;
  }
  if (item.days_until_due != null) {
    return `${item.due_date} (${item.days_until_due}d)`;
  }
  return item.due_date;
}

function ItemTable({
  title,
  items,
  icon: Icon,
  variant,
}: {
  title: string;
  items: BoardActionItem[];
  icon: ComponentType<{ className?: string }>;
  variant: "destructive" | "warning" | "default";
}) {
  if (items.length === 0) return null;

  const badgeClass =
    variant === "destructive"
      ? "bg-red-100 text-red-800 dark:bg-red-950/30"
      : variant === "warning"
        ? "bg-amber-100 text-amber-800 dark:bg-amber-950/30"
        : "";

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          {title}
          <Badge variant="secondary" className={badgeClass}>
            {items.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Due</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium text-sm max-w-md">
                  {item.title}
                  {item.blocker_reason && (
                    <p className="text-xs text-muted-foreground mt-1">{item.blocker_reason}</p>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{item.owner ?? "—"}</TableCell>
                <TableCell className="text-sm whitespace-nowrap">{formatDue(item)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function TrackerOutput({
  data,
  latencyMs,
  model,
  provider,
  runId,
}: {
  data: ActionItemTrackerResult;
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
          Scanned in {(latencyMs / 1000).toFixed(1)}s
        </Badge>
        <Badge variant="outline" className="font-mono text-xs">
          {model}
        </Badge>
        <Badge variant="outline" className="text-xs">
          via {provider}
        </Badge>
        {data.time_saved_minutes > 0 && (
          <Badge className="gap-1 bg-green-600 hover:bg-green-600 text-white border-0">
            <Clock className="h-3 w-3" />~{data.time_saved_minutes} min saved
          </Badge>
        )}
        {runId && (
          <Badge variant="outline" className="font-mono text-[10px]">
            run logged
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{data.total_pending}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{data.overdue.length}</p>
            <p className="text-xs text-muted-foreground">Overdue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{data.blocked.length}</p>
            <p className="text-xs text-muted-foreground">Blocked</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{data.on_track_count}</p>
            <p className="text-xs text-muted-foreground">On track</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{data.summary}</p>
        </CardContent>
      </Card>

      {data.recommended_action && (
        <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-green-700 dark:text-green-400" />
              Recommended next step
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm">{data.recommended_action}</p>
            <Button size="sm" variant="outline" className="shrink-0" onClick={() => navigate("/tasks")}>
              Open task board
            </Button>
          </CardContent>
        </Card>
      )}

      <ItemTable title="Overdue" items={data.overdue} icon={AlertCircle} variant="destructive" />
      <ItemTable title="Blocked" items={data.blocked} icon={Ban} variant="warning" />
      <ItemTable title="Due within 14 days" items={data.due_soon} icon={AlertTriangle} variant="default" />

      {data.overdue.length === 0 && data.blocked.length === 0 && data.due_soon.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-8 flex flex-col items-center gap-2 text-center text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
            <p className="text-sm">No urgent flags — {data.on_track_count} items on track.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function ActionItemTrackerDetail() {
  const tracker = useActionItemTracker();
  const [result, setResult] = useState<{
    data: ActionItemTrackerResult;
    latencyMs: number;
    model: string;
    provider: string;
    runId?: string;
  } | null>(null);

  const applyRunResult = useCallback((data: ActionItemTrackerRunResult) => {
    setResult({
      data: data.result,
      latencyMs: data.latencyMs,
      model: data.model,
      provider: data.provider,
      runId: data.runId,
    });
  }, []);

  const handleScan = async () => {
    setResult(null);
    try {
      const data = await tracker.mutateAsync();
      applyRunResult(data);
    } catch {
      // Hook resolves with client fallback.
    }
  };

  useLiveAgentDetailBootstrap({
    run: () => tracker.mutateAsync(),
    apply: applyRunResult,
  });

  const isLoading = tracker.isPending;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5" />
            Board Action Scan
          </CardTitle>
          <CardDescription>
            Scans pending board and executive action items from your task board and meeting
            takeaways. Flags overdue and blocked items with a recommended next step.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Pulls from open tasks and meeting action items across your workspace. Overdue and
            blocked items are ranked with a recommended next step for leadership.
          </p>
          <Button onClick={handleScan} disabled={isLoading} className="gap-1.5">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Scanning actions…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Run Action Scan
                </>
              )}
            </Button>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center gap-3 py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm">Reviewing overdue, blocked, and due-soon items…</span>
          </CardContent>
        </Card>
      )}

      {!isLoading && result && (
        <TrackerOutput
          data={result.data}
          latencyMs={result.latencyMs}
          model={result.model}
          provider={result.provider}
          runId={result.runId}
        />
      )}
    </div>
  );
}
