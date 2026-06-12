import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Download, RefreshCw, Send, Loader2, FileText, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DEMO_BOARD_REPORT,
  DEMO_BOARD_REPORT_SECTIONS,
  DEMO_AGENT_ACTIVITY,
  ORG_NAME,
} from "@/shared/data/nonprofitDemoData";
import { boardReportPdfFilename, downloadBoardReportPdf } from "@/lib/boardReportPdf";

const { quarter } = DEMO_BOARD_REPORT;
const sections = DEMO_BOARD_REPORT_SECTIONS;
const boardAgentActivity = DEMO_AGENT_ACTIVITY.filter((run) => run.agentSlug === "board-reporting");

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-[600px] w-full max-w-[760px] mx-auto rounded-xl" />
    </div>
  );
}

function varianceClasses(v: number) {
  if (v >= 0) return "text-green-700 bg-green-50 dark:text-green-300 dark:bg-green-900/20";
  if (v > -20) return "text-red-600 bg-red-50 dark:text-red-300 dark:bg-red-900/20";
  return "text-red-700 font-bold bg-red-100 dark:text-red-300 dark:bg-red-900/30";
}

export default function BoardReportsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [approved, setApproved] = useState(false);
  const [draftModal, setDraftModal] = useState(false);
  const [reviewModal, setReviewModal] = useState(false);
  const [draftGenerating, setDraftGenerating] = useState(false);
  const [reviewEmail, setReviewEmail] = useState("executive@brightsideFdn.org");
  const [reviewMessage, setReviewMessage] = useState(`The ${quarter} Board Report draft is ready for your review and approval.`);
  const [draftSources, setDraftSources] = useState({ salesforce: true, stripe: true, grants: true });
  const [draftSections, setDraftSections] = useState({ exec: true, financial: true, donor: true, grants: true, health: true, agents: true });

  useEffect(() => {
    document.title = `Board Reports | ${ORG_NAME}`;
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const runPdfExport = (markApproved: boolean) => {
    setExporting(true);
    try {
      downloadBoardReportPdf(markApproved || approved);
      if (markApproved) setApproved(true);
      toast.success(markApproved ? `✓ ${quarter} Board Report approved and exported` : "✓ Board report re-exported successfully", {
        description: `${boardReportPdfFilename()} downloaded — check your downloads folder.`,
      });
    } catch {
      toast.error("Failed to generate PDF");
    } finally {
      setExporting(false);
    }
  };

  const handleExport = () => runPdfExport(true);
  const handleReExport = () => runPdfExport(false);

  const handleGenerateDraft = () => {
    setDraftGenerating(true);
    setTimeout(() => {
      setDraftGenerating(false);
      setDraftModal(false);
      setApproved(false);
      toast.success("✓ New draft generated", {
        description: `${quarter} Board Report regenerated from latest data.`,
      });
    }, 2000);
  };

  const handleSendReview = () => {
    setReviewModal(false);
    toast.success("✓ Review request sent to Executive Director", {
      description: `Email sent to ${reviewEmail}`,
    });
  };

  const now = new Date();
  const exportDate = `${now.toLocaleString("en-US", { month: "short" })} ${now.getDate()}, ${now.getFullYear()}`;
  const quarterLabel = quarter.split(" ")[0];

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Board Reports</h1>
          <p className="text-sm text-muted-foreground">
            {ORG_NAME} · Board-ready reports generated from your data
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {approved ? (
          <Button variant="secondary" className="gap-1.5" onClick={handleReExport} disabled={exporting}>
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {exporting ? "Preparing PDF…" : "Re-export PDF"}
          </Button>
        ) : (
          <Button className="gap-1.5" onClick={handleExport} disabled={exporting}>
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {exporting ? "Preparing PDF…" : "Approve & Export PDF"}
          </Button>
        )}
        <Button variant="secondary" className="gap-1.5" onClick={() => setDraftModal(true)}>
          <RefreshCw className="h-4 w-4" />
          Generate New Draft
        </Button>
        <Button variant="outline" className="gap-1.5" onClick={() => setReviewModal(true)}>
          <Send className="h-4 w-4" />
          Request ED Review
        </Button>
      </div>

      {/* Document preview */}
      <div className="mx-auto max-w-[760px]">
        <Card className="border shadow-sm">
          <CardContent className="p-8 sm:p-12 space-y-8">
            {/* Header */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shrink-0">BF</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-foreground">Board Report — {quarter}</h2>
                      {approved && <CheckCircle className="h-5 w-5 text-green-600" />}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Prepared by Nonprofit Control Tower · {exportDate}
                    </p>
                  </div>
                </div>
                <Badge className={`shrink-0 border-0 ${approved ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"}`}>
                  {approved ? `Approved — Exported ${exportDate}` : "Draft — Pending ED Approval"}
                </Badge>
              </div>
              <div className="border-b border-border" />
            </div>

            {/* Executive Summary */}
            <section className="space-y-2">
              <h3 className="text-base font-semibold text-foreground">Executive Summary</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {sections.executiveSummary}
              </p>
            </section>

            {/* Financial Snapshot */}
            <section className="space-y-3">
              <h3 className="text-base font-semibold text-foreground">Financial Snapshot</h3>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-xs font-semibold">Metric</TableHead>
                      <TableHead className="text-xs font-semibold text-right">{quarterLabel} Target</TableHead>
                      <TableHead className="text-xs font-semibold text-right">{quarterLabel} Actual</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Variance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sections.financialRows.map((row, i) => (
                      <TableRow key={row.metric} className={i % 2 === 1 ? "bg-muted/30" : ""}>
                        <TableCell className="text-sm font-medium">{row.metric}</TableCell>
                        <TableCell className="text-sm text-right text-muted-foreground">{row.target}</TableCell>
                        <TableCell className="text-sm text-right font-medium">{row.actual}</TableCell>
                        <TableCell className="text-right">
                          <span className={`text-sm font-medium px-1.5 py-0.5 rounded ${varianceClasses(row.variance)}`}>
                            {row.variance >= 0 ? "+" : ""}{row.variance}%
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>

            {/* Donor Engagement */}
            <section className="space-y-3">
              <h3 className="text-base font-semibold text-foreground">Donor Engagement</h3>
              <div className="grid grid-cols-2 gap-3">
                {sections.donorMetrics.map((item) => (
                  <div key={item.label} className="rounded-lg border p-3">
                    <p className="text-lg font-bold text-foreground">{item.value}</p>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    {item.detail && <p className="text-xs text-green-600 mt-0.5">{item.detail}</p>}
                  </div>
                ))}
              </div>
            </section>

            {/* Grant Status */}
            <section className="space-y-3">
              <h3 className="text-base font-semibold text-foreground">Grant Status</h3>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-xs font-semibold">Grant</TableHead>
                      <TableHead className="text-xs font-semibold">Funder</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Amount</TableHead>
                      <TableHead className="text-xs font-semibold">Status</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Utilization</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sections.grantRows.map((row, i) => (
                      <TableRow key={row.grant} className={i % 2 === 1 ? "bg-muted/30" : ""}>
                        <TableCell className="text-sm font-medium">{row.grant}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{row.funder}</TableCell>
                        <TableCell className="text-sm text-right">{row.amount}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[10px] ${row.status.includes("due") ? "border-amber-200 text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-300" : "border-green-200 text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-300"}`}>
                            {row.status}
                          </Badge>
                        </TableCell>
                        <TableCell className={`text-sm text-right font-medium ${row.utilization < 65 ? "text-amber-600" : "text-foreground"}`}>
                          {row.utilization}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>

            {/* Data Health */}
            <section className="space-y-3">
              <h3 className="text-base font-semibold text-foreground">Data Health</h3>
              <div className="grid grid-cols-3 gap-3">
                {sections.dataHealth.map((item) => (
                  <div key={item.label} className="rounded-lg border p-3 text-center">
                    <p className="text-lg font-bold text-foreground">{item.value}</p>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* AI Agent Activity */}
            <section className="space-y-3">
              <h3 className="text-base font-semibold text-foreground">AI Agent Activity</h3>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-xs font-semibold">Agent</TableHead>
                      <TableHead className="text-xs font-semibold">Action</TableHead>
                      <TableHead className="text-xs font-semibold">Outcome</TableHead>
                      <TableHead className="text-xs font-semibold text-right">When</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {boardAgentActivity.map((run, i) => (
                      <TableRow key={run.id} className={i % 2 === 1 ? "bg-muted/30" : ""}>
                        <TableCell className="text-sm font-medium">{run.agentName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{run.action}</TableCell>
                        <TableCell className="text-sm">{run.outcome}</TableCell>
                        <TableCell className="text-sm text-right text-muted-foreground">{run.timestamp}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>

            {/* Footer */}
            <div className="border-t border-border pt-4">
              <p className="text-[11px] text-muted-foreground text-center">
                Data sourced from Salesforce, Stripe, and QuickBooks · Report generated by Nonprofit Control Tower
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generate New Draft Modal */}
      <Dialog open={draftModal} onOpenChange={setDraftModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate New Draft</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-foreground">Select report period</label>
              <select className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" defaultValue={quarter}>
                <option>{quarter}</option>
                <option>Q1 2026</option>
                <option>Q4 2025</option>
                <option>Q3 2025</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Data sources</label>
              <div className="mt-2 space-y-2">
                {[
                  { key: "salesforce", label: "Salesforce" },
                  { key: "stripe", label: "Stripe" },
                  { key: "grants", label: "Grant Tracker" },
                ].map((s) => (
                  <div key={s.key} className="flex items-center gap-2">
                    <Checkbox
                      checked={draftSources[s.key as keyof typeof draftSources]}
                      onCheckedChange={(v) => setDraftSources((p) => ({ ...p, [s.key]: !!v }))}
                    />
                    <span className="text-sm">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Include sections</label>
              <div className="mt-2 space-y-2">
                {[
                  { key: "exec", label: "Executive Summary" },
                  { key: "financial", label: "Financial Snapshot" },
                  { key: "donor", label: "Donor Engagement" },
                  { key: "grants", label: "Grant Status" },
                  { key: "health", label: "Data Health" },
                  { key: "agents", label: "AI Agent Activity" },
                ].map((s) => (
                  <div key={s.key} className="flex items-center gap-2">
                    <Checkbox
                      checked={draftSections[s.key as keyof typeof draftSections]}
                      onCheckedChange={(v) => setDraftSections((p) => ({ ...p, [s.key]: !!v }))}
                    />
                    <span className="text-sm">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDraftModal(false)}>Cancel</Button>
            <Button onClick={handleGenerateDraft} disabled={draftGenerating}>
              {draftGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {draftGenerating ? "Generating…" : "Generate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request ED Review Modal */}
      <Dialog open={reviewModal} onOpenChange={setReviewModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request ED Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-foreground">To</label>
              <Input className="mt-1" value={reviewEmail} onChange={(e) => setReviewEmail(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Message</label>
              <Textarea className="mt-1" rows={3} value={reviewMessage} onChange={(e) => setReviewMessage(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewModal(false)}>Cancel</Button>
            <Button onClick={handleSendReview}>Send Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
