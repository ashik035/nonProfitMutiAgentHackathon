import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Download, RefreshCw, Send, Loader2, FileText, CheckCircle, X } from "lucide-react";
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

const FINANCIAL_ROWS = [
  { metric: "Total Revenue", target: "$510,000", actual: "$487,000", variance: -4.5 },
  { metric: "Major Gifts", target: "$210,000", actual: "$248,000", variance: 18.1 },
  { metric: "Events Revenue", target: "$160,000", actual: "$142,000", variance: -11.3 },
  { metric: "Foundation Grants", target: "$140,000", actual: "$97,000", variance: -30.7 },
];

const GRANT_ROWS = [
  { grant: "Community Health Initiative", funder: "Kresge Foundation", amount: "$185,000", status: "Report due Apr 16", utilization: 61 },
  { grant: "Youth Programs", funder: "Robert Wood Johnson", amount: "$95,000", status: "On track", utilization: 88 },
  { grant: "Technology Access", funder: "Gates Foundation", amount: "$125,000", status: "Active", utilization: 44 },
  { grant: "Housing Support", funder: "Local Community Foundation", amount: "$92,000", status: "Active", utilization: 71 },
];

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
  const [reviewMessage, setReviewMessage] = useState("The Q1 Board Report draft is ready for your review and approval.");
  const [draftSources, setDraftSources] = useState({ salesforce: true, stripe: true, grants: true });
  const [draftSections, setDraftSections] = useState({ exec: true, financial: true, donor: true, grants: true, health: true });

  useEffect(() => {
    document.title = "Board Reports | Brightside Foundation";
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      setApproved(true);
      toast.success("✓ Q1 Board Report approved and exported", {
        description: "Brightside Foundation Q1 2026 Board Report is ready to download.",
      });
    }, 2000);
  };

  const handleReExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      toast.success("✓ Board report re-exported successfully");
    }, 2000);
  };

  const handleGenerateDraft = () => {
    setDraftGenerating(true);
    setTimeout(() => {
      setDraftGenerating(false);
      setDraftModal(false);
      setApproved(false);
      toast.success("✓ New draft generated", {
        description: "Q1 2026 Board Report regenerated from latest data.",
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
            Brightside Foundation · Board-ready reports generated from your data
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
                      <h2 className="text-xl font-bold text-foreground">Board Report — Q1 2026</h2>
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
                Brightside Foundation closed Q1 2026 with $487,000 in revenue against a $510,000 target (95%).
                Major gift activity increased 18% year-over-year. Two grant reports are due in the next 30 days.
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
                      <TableHead className="text-xs font-semibold text-right">Q1 Target</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Q1 Actual</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Variance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {FINANCIAL_ROWS.map((row, i) => (
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
                {[
                  { label: "Active Donors", value: "1,847", detail: "↑ 23 vs Q4" },
                  { label: "New Donors Acquired", value: "94" },
                  { label: "Lapsed Donors Recovered", value: "12" },
                  { label: "Mid-Level Upgrades in Pipeline", value: "8" },
                ].map((item) => (
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
                    {GRANT_ROWS.map((row, i) => (
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
                {[
                  { label: "Data Health Score", value: "82%" },
                  { label: "Duplicates Resolved (Q1)", value: "7" },
                  { label: "Records Updated by AI", value: "143" },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg border p-3 text-center">
                    <p className="text-lg font-bold text-foreground">{item.value}</p>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                  </div>
                ))}
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
              <select className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
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
