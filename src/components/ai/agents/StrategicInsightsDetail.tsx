import { useState, type ComponentType } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Clock,
  FileText,
  Heart,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStrategicInsights } from "@/hooks/useStrategicInsights";
import type { InsightFocus, StrategicInsightsResult, StrategicInsightItem } from "@/types/strategic-insights";
import { cn } from "@/lib/utils";

function severityClass(severity?: string): string {
  if (severity === "critical") return "border-red-200 bg-red-50 dark:bg-red-950/20";
  if (severity === "warning") return "border-amber-200 bg-amber-50 dark:bg-amber-950/20";
  return "border-border bg-card";
}

function InsightList({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: ComponentType<{ className?: string }>;
  items: StrategicInsightItem[];
}) {
  if (items.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          {title}
          <Badge variant="secondary">{items.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item, i) => (
          <div
            key={`${item.title}-${i}`}
            className={cn("rounded-lg border p-4 space-y-2", severityClass(item.severity))}
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium text-sm">{item.title}</p>
              {item.severity && (
                <Badge variant="outline" className="text-[10px] capitalize">
                  {item.severity}
                </Badge>
              )}
              {item.segment && (
                <Badge variant="outline" className="text-[10px]">
                  {item.segment}
                </Badge>
              )}
              <Badge variant="outline" className="text-[10px] font-mono ml-auto">
                {Math.round(item.confidence * 100)}% conf.
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{item.detail}</p>
            <p className="text-xs text-muted-foreground italic">Source: {item.source_citation}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function InsightsOutput({
  data,
  latencyMs,
  model,
  provider,
  runId,
}: {
  data: StrategicInsightsResult;
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
        <Badge variant="outline" className="text-xs">
          {data.knowledge_sources_used} KB sources
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

      <Card className="border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Strategic summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{data.summary}</p>
        </CardContent>
      </Card>

      {data.recommended_action && (
        <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-green-700" />
              Recommended next step
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm">{data.recommended_action}</p>
            <div className="flex gap-2 shrink-0">
              <Button size="sm" variant="outline" onClick={() => navigate("/grants")}>
                Grants
              </Button>
              <Button size="sm" variant="outline" onClick={() => navigate("/donor-retention")}>
                Donors
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <InsightList title="Grant intelligence" icon={FileText} items={data.grant_insights} />
      <InsightList title="Donor insights" icon={Heart} items={data.donor_insights} />
    </div>
  );
}

export default function StrategicInsightsDetail() {
  const insights = useStrategicInsights();
  const [result, setResult] = useState<{
    data: StrategicInsightsResult;
    latencyMs: number;
    model: string;
    provider: string;
    runId?: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [useSample, setUseSample] = useState(true);
  const [focus, setFocus] = useState<InsightFocus>("all");

  const handleGenerate = async () => {
    setErrorMessage(null);
    setResult(null);
    try {
      const data = await insights.mutateAsync({ useSample, focus });
      setResult({
        data: data.result,
        latencyMs: data.latencyMs,
        model: data.model,
        provider: data.provider,
        runId: data.runId,
      });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Generation failed");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Strategic Insights (RAG)
          </CardTitle>
          <CardDescription>
            Retrieves grant and donor intelligence from your org knowledge base via semantic search,
            then synthesizes actionable insights with citations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>RAG data sources</AlertTitle>
            <AlertDescription className="text-sm">
              {useSample
                ? "Using Brightside Foundation sample knowledge chunks (demo). Uncheck to query live knowledge_entries + semantic search."
                : "Queries knowledge_entries and semantic-search embeddings. Falls back to sample KB if empty."}
            </AlertDescription>
          </Alert>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">Focus area</p>
              <Select value={focus} onValueChange={(v) => setFocus(v as InsightFocus)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Grants + Donors</SelectItem>
                  <SelectItem value="grants">Grants only</SelectItem>
                  <SelectItem value="donors">Donors only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer pb-2">
              <input
                type="checkbox"
                checked={useSample}
                onChange={(e) => setUseSample(e.target.checked)}
                disabled={insights.isPending}
                className="rounded border-border"
              />
              Use sample knowledge base
            </label>
            <Button onClick={handleGenerate} disabled={insights.isPending} className="gap-1.5">
              {insights.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching &amp; synthesizing…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Insights
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Generation failed</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {result && (
        <InsightsOutput
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
