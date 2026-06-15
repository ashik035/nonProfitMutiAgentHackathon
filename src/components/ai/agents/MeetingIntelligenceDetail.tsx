import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckSquare,
  ClipboardList,
  FileText,
  Loader2,
  Sparkles,
  Users,
  Gavel,
  MessageSquare,
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
import { useMeetingSummarizer } from "@/hooks/useMeetingSummarizer";
import {
  BRIGHTSIDE_BOARD_MEETING_SAMPLE,
  BRIGHTSIDE_BOARD_MEETING_TITLE,
} from "@/shared/data/brightsideBoardMeetingSample";
import type { MeetingSummary } from "@/types/meeting-summary";

function formatLatency(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function SummaryOutput({ summary, latencyMs }: { summary: MeetingSummary; latencyMs: number }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="gap-1">
          <Sparkles className="h-3 w-3" />
          Generated in {formatLatency(latencyMs)}
        </Badge>
        <Badge variant="outline">
          {summary.action_items.length} action item{summary.action_items.length !== 1 ? "s" : ""}
        </Badge>
        <Badge variant="outline">
          {summary.decisions.length} decision{summary.decisions.length !== 1 ? "s" : ""}
        </Badge>
      </div>

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
  const [result, setResult] = useState<{ summary: MeetingSummary; latencyMs: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);

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

  const handleLoadSample = () => {
    setTranscript(BRIGHTSIDE_BOARD_MEETING_SAMPLE);
    setResult(null);
    setErrorMessage(null);
  };

  const handleGenerate = async () => {
    if (!transcript.trim()) return;
    setErrorMessage(null);
    setResult(null);
    try {
      const data = await summarizer.mutateAsync(transcript.trim());
      setResult(data);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to generate meeting minutes");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Meeting Transcript
          </CardTitle>
          <CardDescription>
            Paste a board meeting transcript or load the Brightside Foundation sample to generate
            structured minutes in under 30 seconds.
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
              <Button variant="outline" onClick={handleLoadSample} disabled={isLoading}>
                Load Sample Transcript
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
              Sample loaded: {BRIGHTSIDE_BOARD_MEETING_TITLE}
            </p>
          )}
        </CardContent>
      </Card>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Generation failed</AlertTitle>
          <AlertDescription className="flex flex-col gap-3">
            <span>{errorMessage}</span>
            <Button variant="outline" size="sm" onClick={handleGenerate} disabled={isLoading}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isLoading && (
        <Card>
          <CardContent className="flex items-center gap-3 py-8 justify-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm">
              Claude is extracting decisions, action items, and attendance…
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
            <SummaryOutput summary={result.summary} latencyMs={result.latencyMs} />
          </div>
        </>
      )}

      {!isLoading && !result && !errorMessage && !transcript.trim() && (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Paste a board meeting transcript or click <strong>Load Sample Transcript</strong> to run
            a one-click demo.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
