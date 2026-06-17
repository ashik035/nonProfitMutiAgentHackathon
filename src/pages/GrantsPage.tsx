import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, CheckCircle, ChevronDown, Loader2, Users, Copy, Download, Clock, ShieldCheck, PenTool } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import { jsPDF } from "jspdf";
import { DEMO_GRANTS_PAGE, type GrantsPageGrant } from "@/shared/data/nonprofitDemoData";

function buildReportText(g: {
  name: string; funder: string; amount: number; period: string; programOfficer: string;
  utilization: number; reportDueDays: number;
  budgetBreakdown: { label: string; pct: number }[];
  deliverables: { text: string; done: boolean }[];
}) {
  const utilized = Math.round(g.amount * g.utilization / 100);
  const remaining = g.amount - utilized;
  const completed = g.deliverables.filter(d => d.done);
  const pending = g.deliverables.filter(d => !d.done);
  const lines: string[] = [];
  lines.push(`Report Draft — ${g.name}`, "");
  lines.push(`Funder: ${g.funder}`);
  lines.push(`Award Amount: $${g.amount.toLocaleString()}`);
  lines.push(`Grant Period: ${g.period}`);
  lines.push(`Program Officer: ${g.programOfficer}`, "");
  lines.push("Fund Utilization");
  lines.push(`${g.utilization}% of $${g.amount.toLocaleString()} utilized ($${utilized.toLocaleString()} spent, $${remaining.toLocaleString()} remaining)`);
  g.budgetBreakdown.forEach(b => {
    lines.push(`  • ${b.label}: ${b.pct}% — $${Math.round(g.amount * b.pct / 100).toLocaleString()}`);
  });
  lines.push("", "Key Activities Summary");
  completed.forEach(d => lines.push(`  • ${d.text} — Completed`));
  if (pending.length > 0) {
    lines.push(`  • ${pending.length} deliverable${pending.length > 1 ? "s" : ""} remaining: ${pending.map(d => d.text).join("; ")}`);
  }
  if (g.reportDueDays <= 14) {
    lines.push("", `⚠ Report due in ${g.reportDueDays} days — action required`);
  }
  return lines.join("\n");
}

function downloadGrantReportPdf(g: Parameters<typeof buildReportText>[0]) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 48;
  const marginTop = 56;
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - marginX * 2;
  let y = marginTop;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  const titleLines = doc.splitTextToSize(`Report Draft — ${g.name}`, maxWidth);
  doc.text(titleLines, marginX, y);
  y += titleLines.length * 20 + 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const body = buildReportText(g).split("\n").slice(2).join("\n");
  const wrapped = doc.splitTextToSize(body, maxWidth);
  const lineHeight = 15;
  wrapped.forEach((line: string) => {
    if (y + lineHeight > pageHeight - marginTop) {
      doc.addPage();
      y = marginTop;
    }
    doc.text(line, marginX, y);
    y += lineHeight;
  });

  const slug = g.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  doc.save(`grant-report-${slug || "draft"}.pdf`);
}

interface Grant extends GrantsPageGrant {}

function utilizationColor(pct: number) {
  if (pct >= 75) return "bg-green-500";
  if (pct >= 50) return "bg-amber-500";
  return "bg-amber-500";
}

export default function GrantsPage() {
  const navigate = useNavigate();
  const [grants, setGrants] = useState(DEMO_GRANTS_PAGE);
  const [drawerGrant, setDrawerGrant] = useState<Grant | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);
  const [reportGrant, setReportGrant] = useState<Grant | null>(null);

  // Compliance summary state
  const [complianceGrant, setComplianceGrant] = useState<Grant | null>(null);
  const [complianceLoading, setComplianceLoading] = useState(false);
  const [complianceSummary, setComplianceSummary] = useState<string | null>(null);
  const [complianceError, setComplianceError] = useState<string | null>(null);

  const handleGenerateCompliance = async (grant: Grant) => {
    setComplianceGrant(grant);
    setComplianceLoading(true);
    setComplianceSummary(null);
    setComplianceError(null);
    try {
      const { data, error } = await supabase.functions.invoke("generate-compliance-summary", {
        body: { grant },
      });
      if (error) throw error;
      setComplianceSummary(data?.summary ?? "No summary received.");
    } catch {
      setComplianceError("Unable to generate compliance summary — please try again.");
    } finally {
      setComplianceLoading(false);
    }
  };

  const handleCloseCompliance = () => {
    setComplianceGrant(null);
    setComplianceSummary(null);
    setComplianceError(null);
    setComplianceLoading(false);
  };

  const totalValue = grants.reduce((s, g) => s + g.amount, 0);
  const reportsDue = grants.filter((g) => g.reportDueDays <= 30).length;
  const avgUtil = Math.round(grants.reduce((s, g) => s + g.utilization, 0) / grants.length);

  const handleGenerateReport = (grant: Grant) => {
    setGenerating(grant.id);
    setTimeout(() => {
      setGenerating(null);
      setReportGrant(grant);
    }, 1500);
  };

  const handleToggleDeliverable = (grantId: string, idx: number) => {
    setGrants((prev) =>
      prev.map((g) =>
        g.id === grantId
          ? { ...g, deliverables: g.deliverables.map((d, i) => i === idx ? { ...d, done: !d.done } : d) }
          : g
      )
    );
    if (drawerGrant?.id === grantId) {
      setDrawerGrant((prev) =>
        prev ? { ...prev, deliverables: prev.deliverables.map((d, i) => i === idx ? { ...d, done: !d.done } : d) } : prev
      );
    }
    toast.success("Deliverable marked complete");
  };

  const handleAssign = (grantName: string, staffName: string) => {
    toast.success(`✓ Assigned to ${staffName} — they've been notified`);
  };

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Grants Management</h1>
        <p className="text-sm text-muted-foreground">Brightside Foundation · Track grants, deadlines, and fund utilization</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Grants", value: String(grants.length) },
          { label: "Total Grant Value", value: `$${(totalValue / 1000).toFixed(0)}K` },
          { label: "Reports Due (30 days)", value: String(reportsDue) },
          { label: "Avg Utilization", value: `${avgUtil}%` },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Grant Cards */}
      <div className="space-y-4">
        {grants.map((grant) => (
          <Card key={grant.id}>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{grant.name}</h3>
                  <p className="text-sm text-muted-foreground">{grant.funder} · ${grant.amount.toLocaleString()} · {grant.period}</p>
                  <p className="text-xs text-muted-foreground mt-1">Program Officer: {grant.programOfficer}</p>
                </div>
                <Badge className={grant.status === "AT RISK" ? "bg-red-100 text-red-700 border-red-200" : "bg-green-100 text-green-700 border-green-200"}>
                  {grant.status}
                </Badge>
              </div>
              {/* Utilization bar */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Fund Utilization</span>
                  <span className={`font-medium ${grant.utilization < 50 ? "text-amber-600" : grant.utilization > 85 ? "text-green-600" : "text-foreground"}`}>{grant.utilization}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full ${utilizationColor(grant.utilization)} transition-all`} style={{ width: `${grant.utilization}%` }} />
                </div>
              </div>
              <p className={`text-sm font-medium ${grant.reportDueDays <= 14 ? "text-red-600" : "text-muted-foreground"}`}>
                Report due in {grant.reportDueDays} days
              </p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => setDrawerGrant(grant)}>
                  <FileText className="h-3.5 w-3.5 mr-1.5" /> View Grant Details
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleGenerateReport(grant)} disabled={generating === grant.id}>
                  {generating === grant.id ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : null}
                  Generate Report Draft
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleGenerateCompliance(grant)}>
                  <ShieldCheck className="h-3.5 w-3.5 mr-1.5" /> Generate Compliance Summary
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    navigate(
                      `/grant-writer?grant=${encodeURIComponent(grant.name)}&funder=${encodeURIComponent(grant.funder)}&amount=${grant.amount}&utilized=${grant.utilization}`
                    )
                  }
                >
                  <PenTool className="h-3.5 w-3.5 mr-1.5" /> Open in Grant Writer
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <Users className="h-3.5 w-3.5" /> Assign to Staff <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {["Maria Santos", "Kevin Park", "Lisa Chen"].map((name) => (
                      <DropdownMenuItem key={name} onClick={() => handleAssign(grant.name, name)}>
                        {name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Grant Detail Drawer */}
      <Sheet open={!!drawerGrant} onOpenChange={() => setDrawerGrant(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          {drawerGrant && (
            <>
              <SheetHeader>
                <SheetTitle>{drawerGrant.name}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Funder:</span> {drawerGrant.funder}</p>
                  <p><span className="text-muted-foreground">Amount:</span> ${drawerGrant.amount.toLocaleString()}</p>
                  <p><span className="text-muted-foreground">Period:</span> {drawerGrant.period}</p>
                  <p><span className="text-muted-foreground">Program Officer:</span> {drawerGrant.programOfficer}</p>
                  <p><span className="text-muted-foreground">Utilization:</span> {drawerGrant.utilization}%</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Deliverables</h4>
                  <div className="space-y-2">
                    {drawerGrant.deliverables.map((d, i) => (
                      <button
                        key={i}
                        className="flex items-center gap-2 text-sm w-full text-left hover:bg-muted/50 rounded p-2 -ml-2"
                        onClick={() => !d.done && handleToggleDeliverable(drawerGrant.id, i)}
                      >
                        {d.done ? (
                          <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                        )}
                        <span className={d.done ? "line-through text-muted-foreground" : ""}>{d.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Budget Breakdown</h4>
                  <div className="space-y-2">
                    {drawerGrant.budgetBreakdown.map((b) => (
                      <div key={b.label} className="flex justify-between text-sm">
                        <span>{b.label}</span>
                        <span className="font-medium">{b.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Button variant="outline" className="w-full" onClick={() => setDrawerGrant(null)}>Close</Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Compliance Summary Modal */}
      <Dialog open={!!complianceGrant} onOpenChange={handleCloseCompliance}>
        <DialogContent className="sm:max-w-[560px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              Compliance Summary — {complianceGrant?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            {complianceLoading && (
              <div className="space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            )}
            {complianceError && (
              <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 rounded-lg p-3 border border-red-200 dark:border-red-800">
                {complianceError}
              </p>
            )}
            {complianceSummary && !complianceLoading && (
              <div className="space-y-4">
                <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed">
                  <ReactMarkdown>{complianceSummary}</ReactMarkdown>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <p className="text-xs text-muted-foreground">AI-generated summary. Verify against source documents before submission.</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(complianceSummary);
                      toast.success("Compliance summary copied to clipboard");
                    }}
                  >
                    <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Draft Sheet */}
      <Sheet open={!!reportGrant} onOpenChange={() => setReportGrant(null)}>
        <SheetContent className="sm:max-w-[480px] overflow-y-auto">
          {reportGrant && (() => {
            const utilized = Math.round(reportGrant.amount * reportGrant.utilization / 100);
            const remaining = reportGrant.amount - utilized;
            const completedDel = reportGrant.deliverables.filter(d => d.done);
            const pendingDel = reportGrant.deliverables.filter(d => !d.done);
            return (
              <>
                <SheetHeader>
                  <SheetTitle>Report Draft — {reportGrant.name}</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-5 text-sm">
                  {/* Header info */}
                  <div className="rounded-lg border p-4 space-y-1.5 bg-muted/30">
                    <p><span className="text-muted-foreground">Grant:</span> {reportGrant.name}</p>
                    <p><span className="text-muted-foreground">Funder:</span> {reportGrant.funder}</p>
                    <p><span className="text-muted-foreground">Award Amount:</span> ${reportGrant.amount.toLocaleString()}</p>
                    <p><span className="text-muted-foreground">Grant Period:</span> {reportGrant.period}</p>
                    <p><span className="text-muted-foreground">Program Officer:</span> {reportGrant.programOfficer}</p>
                  </div>

                  {/* Utilization */}
                  <div>
                    <h4 className="font-semibold mb-2">Fund Utilization</h4>
                    <div className="h-2.5 rounded-full bg-muted overflow-hidden mb-2">
                      <div className={`h-full rounded-full ${utilizationColor(reportGrant.utilization)} transition-all`} style={{ width: `${reportGrant.utilization}%` }} />
                    </div>
                    <p className="text-muted-foreground">
                      {reportGrant.utilization}% of ${reportGrant.amount.toLocaleString()} utilized (${utilized.toLocaleString()} spent, ${remaining.toLocaleString()} remaining)
                    </p>
                    <div className="mt-2 space-y-1">
                      {reportGrant.budgetBreakdown.map(b => (
                        <div key={b.label} className="flex justify-between">
                          <span className="text-muted-foreground">{b.label}</span>
                          <span>{b.pct}% — ${Math.round(reportGrant.amount * b.pct / 100).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key Activities */}
                  <div>
                    <h4 className="font-semibold mb-2">Key Activities Summary</h4>
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                      {completedDel.map((d, i) => (
                        <li key={i}>{d.text} — <span className="text-green-600 font-medium">Completed</span></li>
                      ))}
                      {pendingDel.length > 0 && (
                        <li>{pendingDel.length} deliverable{pendingDel.length > 1 ? "s" : ""} remaining: {pendingDel.map(d => d.text).join("; ")}</li>
                      )}
                    </ul>
                  </div>

                  {/* Deadline callout */}
                  {reportGrant.reportDueDays <= 14 && (
                    <div className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700 p-3">
                      <Clock className="h-4 w-4 text-amber-600 shrink-0" />
                      <span className="text-amber-700 dark:text-amber-400 font-medium">
                        Report due in {reportGrant.reportDueDays} days — action required
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button className="flex-1" variant="outline" onClick={() => {
                      navigator.clipboard.writeText(buildReportText(reportGrant));
                      toast.success("Draft copied to clipboard!");
                    }}>
                      <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy Draft
                    </Button>
                    <Button className="flex-1" variant="outline" onClick={() => {
                      try {
                        downloadGrantReportPdf(reportGrant);
                        toast.success("PDF downloaded — check your downloads folder");
                      } catch (e) {
                        console.error(e);
                        toast.error("Failed to generate PDF");
                      }
                    }}>
                      <Download className="h-3.5 w-3.5 mr-1.5" /> Download as PDF
                    </Button>
                  </div>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>
    </div>
  );
}
