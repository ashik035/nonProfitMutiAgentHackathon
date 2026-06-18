import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckSquare,
  ClipboardList,
  FileText,
  Info,
  Loader2,
  Sparkles,
  Users,
  Gavel,
  MessageSquare,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { useMeetingSummarizer, type MeetingSummarizerResult } from "@/hooks/useMeetingSummarizer";
import { useLiveAgentDetailBootstrap } from "@/hooks/useLiveAgentDetailBootstrap";
import { MEETING_SUMMARIZER_MODEL } from "@/lib/meetingSummarizer";
import {
  probeMeetingSummarizerBackends,
  type SummarizerBackendProbe,
} from "@/lib/meetingSummarizerBackendCheck";
import {
  BRIGHTSIDE_BOARD_MEETING_SAMPLE,
  BRIGHTSIDE_BOARD_MEETING_TITLE,
} from "@/shared/data/brightsideBoardMeetingSample";
import type { MeetingSummary } from "@/types/meeting-summary";

function formatLatency(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function SummaryOutput({
  summary,
  latencyMs,
  model,
  provider,
  isGeminiFallback,
  timeSavedMinutes,
  recommendedAction,
  runId,
}: {
  summary: MeetingSummary;
  latencyMs: number;
  model: string;
  provider: string;
  isGeminiFallback?: boolean;
  timeSavedMinutes?: number;
  recommendedAction?: string;
  runId?: string;
}) {
  const navigate = useNavigate();
  const displayTimeSaved =
    timeSavedMinutes ?? summary.time_saved_minutes ?? null;
  const displayAction =
    recommendedAction ?? summary.recommended_action ?? null;

  return (
    <div className="space-y-6">
      {isGeminiFallback && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Using Gemini fallback (not Claude Sonnet)</AlertTitle>
          <AlertDescription className="text-sm">
            Cloud edge functions are still on an old version. Minutes were generated via event Q&A
            mode. Ask Lovable chat to deploy <code className="text-xs">generate-meeting-summary-v2</code>{" "}
            and <code className="text-xs">event-intelligence</code> from GitHub main for Claude Sonnet.
          </AlertDescription>
        </Alert>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="gap-1">
          <Sparkles className="h-3 w-3" />
          Generated in {formatLatency(latencyMs)}
        </Badge>
        <Badge variant="outline" className="font-mono text-xs">
          {model}
        </Badge>
        <Badge variant="outline" className="text-xs">
          via {provider}
        </Badge>
        <Badge variant="outline">
          {summary.action_items.length} action item{summary.action_items.length !== 1 ? "s" : ""}
        </Badge>
        <Badge variant="outline">
          {summary.decisions.length} decision{summary.decisions.length !== 1 ? "s" : ""}
        </Badge>
        {displayTimeSaved != null && displayTimeSaved > 0 && (
          <Badge className="gap-1 bg-green-600 hover:bg-green-600 text-white border-0">
            <Clock className="h-3 w-3" />
            ~{displayTimeSaved} min saved
          </Badge>
        )}
        {runId && (
          <Badge variant="outline" className="font-mono text-[10px]">
            run logged
          </Badge>
        )}
      </div>

      {displayAction && (
        <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-green-700 dark:text-green-400" />
              Recommended next step
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-foreground">{displayAction}</p>
            {summary.action_items.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                className="shrink-0"
                onClick={() => navigate("/actions")}
              >
                Open action items
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-primary" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-foreground">{summary.executive_summary}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-primary" />
            Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {summary.attendance.length > 0 ? (
            <ul className="space-y-1.5 text-sm">
              {summary.attendance.map((entry, i) => (
                <li key={i} className="text-foreground">{entry}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No attendance recorded.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Gavel className="h-4 w-4 text-primary" />
            Decisions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {summary.decisions.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {summary.decisions.map((decision, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-muted-foreground shrink-0">{i + 1}.</span>
                  <span className="text-foreground">{decision}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No formal decisions recorded.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckSquare className="h-4 w-4 text-primary" />
            Action Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          {summary.action_items.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Deadline</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.action_items.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{item.task}</TableCell>
                    <TableCell>{item.owner ?? "—"}</TableCell>
                    <TableCell>{item.deadline ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">No action items extracted.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-4 w-4 text-primary" />
            Key Discussion Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          {summary.key_discussion_points.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {summary.key_discussion_points.map((point, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-muted-foreground shrink-0">•</span>
                  <span className="text-foreground">{point}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No discussion points recorded.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function MeetingIntelligenceDetail() {
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState<{
    summary: MeetingSummary;
    latencyMs: number;
    model: string;
    provider: string;
    isGeminiFallback?: boolean;
    runId?: string;
    timeSavedMinutes?: number;
    recommendedAction?: string;
  } | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [backendProbes, setBackendProbes] = useState<SummarizerBackendProbe[] | null>(null);
  const [probingBackends, setProbingBackends] = useState(false);
  const isDev = import.meta.env.DEV;

  const summarizer = useMeetingSummarizer();
  const isLoading = summarizer.isPending;

  useEffect(() => {
    if (!isLoading) {
      setElapsedSec(0);
      return;
    }
    const interval = window.setInterval(() => setElapsedSec((s) => s + 1), 1000);
    return () => window.clearInterval(interval);
  }, [isLoading]);

  const handleLoadRecentMeeting = () => {
    setTranscript(BRIGHTSIDE_BOARD_MEETING_SAMPLE);
    setResult(null);
  };

  const applyRunResult = useCallback((data: MeetingSummarizerResult) => {
    setResult(data);
  }, []);

  const handleGenerate = async () => {
    if (!transcript.trim()) return;
    setResult(null);
    try {
      const data = await summarizer.mutateAsync(transcript.trim());
      applyRunResult(data);
    } catch {
      // Hook resolves with heuristic fallback — no error UI.
    }
  };

  useLiveAgentDetailBootstrap({
    run: async () => {
      const text = transcript.trim() || BRIGHTSIDE_BOARD_MEETING_SAMPLE;
      if (!transcript.trim()) {
        setTranscript(BRIGHTSIDE_BOARD_MEETING_SAMPLE);
      }
      return summarizer.mutateAsync(text);
    },
    apply: applyRunResult,
  });

  const handleProbeBackends = async () => {
    setProbingBackends(true);
    try {
      setBackendProbes(await probeMeetingSummarizerBackends());
    } finally {
      setProbingBackends(false);
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>AI model</AlertTitle>
        <AlertDescription className="space-y-3">
          <p className="text-sm">
            Structured minutes powered by{" "}
            <strong className="font-mono text-xs">{MEETING_SUMMARIZER_MODEL}</strong>.
          </p>
          {isDev && (
            <>
              <p className="text-xs text-muted-foreground">
                Developer mode: backend probe available for cloud connectivity checks.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleProbeBackends}
                  disabled={probingBackends}
                >
                  {probingBackends ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Checking…
                    </>
                  ) : (
                    "Check cloud backends"
                  )}
                </Button>
              </div>
              {backendProbes && (
                <ul className="text-xs space-y-1.5">
                  {backendProbes.map((p) => (
                    <li key={p.name} className="flex flex-wrap items-start gap-2">
                      <Badge
                        variant={
                          p.status === "active"
                            ? "default"
                            : p.status === "stale"
                              ? "outline"
                              : p.status === "missing"
                                ? "secondary"
                                : "destructive"
                        }
                        className={p.status === "stale" ? "border-amber-500 text-amber-700" : ""}
                      >
                        {p.status}
                      </Badge>
                      <span>
                        <strong>{p.name}</strong>: {p.detail}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </AlertDescription>
      </Alert>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Meeting Transcript
          </CardTitle>
          <CardDescription>
            Paste a board meeting transcript or load your recent Q2 board meeting to generate
            structured minutes — decisions, action items, attendance, and discussion highlights.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste your meeting transcript here…"
            className="min-h-[280px] font-mono text-sm leading-relaxed"
            disabled={isLoading}
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {transcript.length.toLocaleString()} characters
              {transcript.length > 0 && transcript.length < 100 && " — add more detail for better results"}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={handleLoadRecentMeeting} disabled={isLoading}>
                Load Q2 Board Meeting
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={!transcript.trim() || isLoading}
                className="gap-1.5"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing transcript… {elapsedSec > 0 ? `(${elapsedSec}s)` : ""}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Minutes
                  </>
                )}
              </Button>
            </div>
          </div>
          {transcript === BRIGHTSIDE_BOARD_MEETING_SAMPLE && (
            <p className="text-xs text-muted-foreground">
              Transcript loaded: {BRIGHTSIDE_BOARD_MEETING_TITLE}
            </p>
          )}
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardContent className="flex items-center gap-3 py-8 justify-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm">
              Extracting decisions, action items, and attendance…
              {elapsedSec > 0 ? ` (${elapsedSec}s)` : ""}
            </span>
          </CardContent>
        </Card>
      )}

      {!isLoading && result && (
        <>
          <Separator />
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Structured Minutes</h2>
            <SummaryOutput
              summary={result.summary}
              latencyMs={result.latencyMs}
              model={result.model}
              provider={result.provider}
              isGeminiFallback={result.isGeminiFallback}
              timeSavedMinutes={result.timeSavedMinutes}
              recommendedAction={result.recommendedAction}
              runId={result.runId}
            />
          </div>
        </>
      )}

      {!isLoading && !result && !transcript.trim() && (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Paste a board meeting transcript or click <strong>Load Q2 Board Meeting</strong> to
            generate structured minutes.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
