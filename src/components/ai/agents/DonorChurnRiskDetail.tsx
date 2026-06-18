import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Clock,
  Heart,
  Loader2,
  Sparkles,
  TrendingDown,
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
import { useDonorChurnRisk } from "@/hooks/useDonorChurnRisk";
import type { DonorChurnRiskResult } from "@/types/donor-churn-risk";
import { cn } from "@/lib/utils";

function riskBadgeClass(level: string): string {
  if (level === "high") return "bg-red-100 text-red-800 dark:bg-red-950/30";
  if (level === "medium") return "bg-amber-100 text-amber-800 dark:bg-amber-950/30";
  return "bg-slate-100 text-slate-700";
}

function ChurnOutput({
  data,
  latencyMs,
  model,
  provider,
  runId,
}: {
  data: DonorChurnRiskResult;
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
            <p className="text-2xl font-bold">{data.total_scanned}</p>
            <p className="text-xs text-muted-foreground">Donors scanned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{data.high_risk_count}</p>
            <p className="text-xs text-muted-foreground">High risk</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{data.medium_risk_count}</p>
            <p className="text-xs text-muted-foreground">Medium risk</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">
              ${data.revenue_at_risk.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Revenue at risk</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            Portfolio summary
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
            <Button size="sm" variant="outline" onClick={() => navigate("/donor-retention")}>
              Open donor retention
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-500" />
            At-risk donors
          </CardTitle>
          <CardDescription>Sorted by churn risk score — highest first</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Donor</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Days lapsed</TableHead>
                <TableHead>Lifetime</TableHead>
                <TableHead>Outreach</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.at_risk_donors.map((donor) => (
                <TableRow key={donor.id}>
                  <TableCell>
                    <p className="font-medium text-sm">{donor.name}</p>
                    <p className="text-xs text-muted-foreground">{donor.segment}</p>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("capitalize", riskBadgeClass(donor.risk_level))}>
                      {donor.risk_level} ({donor.risk_score})
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{donor.days_since_last_gift}</TableCell>
                  <TableCell className="text-sm">${donor.total_giving.toLocaleString()}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-xs">
                    {donor.recommended_outreach}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DonorChurnRiskDetail() {
  const churn = useDonorChurnRisk();
  const [result, setResult] = useState<{
    data: DonorChurnRiskResult;
    latencyMs: number;
    model: string;
    provider: string;
    runId?: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [useSample, setUseSample] = useState(true);

  const handleScan = async () => {
    setErrorMessage(null);
    setResult(null);
    try {
      const data = await churn.mutateAsync({ useSample });
      setResult({
        data: data.result,
        latencyMs: data.latencyMs,
        model: data.model,
        provider: data.provider,
        runId: data.runId,
      });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Scan failed");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-500" />
            Churn Risk Scan
          </CardTitle>
          <CardDescription>
            Analyzes donor giving history to flag at-risk relationships, estimate revenue exposure,
            and recommend outreach — adapted from client risk detection patterns.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={useSample}
              onChange={(e) => setUseSample(e.target.checked)}
              disabled={churn.isPending}
              className="rounded border-border"
            />
            Use sample donor portfolio (demo)
          </label>
          <Button onClick={handleScan} disabled={churn.isPending} className="gap-1.5">
            {churn.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing donors…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Run Churn Scan
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Scan failed</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {result && (
        <ChurnOutput
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
