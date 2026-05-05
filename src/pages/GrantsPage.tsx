import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FileText, CheckCircle, ChevronDown, Loader2, Users, Copy, Download, Clock } from "lucide-react";
import { toast } from "sonner";

interface GrantDeliverable {
  text: string;
  done: boolean;
}

interface Grant {
  id: string;
  name: string;
  funder: string;
  amount: number;
  period: string;
  status: "AT RISK" | "ON TRACK";
  utilization: number;
  reportDueDays: number;
  programOfficer: string;
  deliverables: GrantDeliverable[];
  budgetBreakdown: { label: string; pct: number }[];
}

const INITIAL_GRANTS: Grant[] = [
  {
    id: "g1", name: "Community Health Initiative", funder: "Kresge Foundation",
    amount: 185000, period: "Jan 1 – Dec 31, 2026", status: "AT RISK",
    utilization: 61, reportDueDays: 8, programOfficer: "Dr. Alicia Ramos",
    deliverables: [
      { text: "Q1 Progress Report submitted", done: true },
      { text: "Mid-year financial report submitted", done: true },
      { text: "Site visit scheduled (due May 15)", done: false },
      { text: "Final narrative report (due Dec 15)", done: false },
    ],
    budgetBreakdown: [{ label: "Personnel", pct: 45 }, { label: "Programs", pct: 35 }, { label: "Overhead", pct: 20 }],
  },
  {
    id: "g2", name: "Youth Programs Initiative", funder: "Robert Wood Johnson Foundation",
    amount: 95000, period: "Oct 1, 2025 – Sep 30, 2026", status: "ON TRACK",
    utilization: 88, reportDueDays: 31, programOfficer: "Marcus Webb",
    deliverables: [
      { text: "Program launch report", done: true },
      { text: "Quarterly financial update", done: true },
      { text: "Participant survey results", done: false },
      { text: "Year-end impact assessment", done: false },
    ],
    budgetBreakdown: [{ label: "Personnel", pct: 50 }, { label: "Programs", pct: 40 }, { label: "Overhead", pct: 10 }],
  },
  {
    id: "g3", name: "Technology Access Fund", funder: "Gates Foundation",
    amount: 125000, period: "Jul 1, 2025 – Jun 30, 2026", status: "ON TRACK",
    utilization: 44, reportDueDays: 83, programOfficer: "Sandra Liu",
    deliverables: [
      { text: "Equipment procurement report", done: true },
      { text: "Digital literacy curriculum plan", done: false },
      { text: "Mid-year progress report", done: false },
      { text: "Final impact report", done: false },
    ],
    budgetBreakdown: [{ label: "Equipment", pct: 55 }, { label: "Training", pct: 30 }, { label: "Admin", pct: 15 }],
  },
  {
    id: "g4", name: "Housing Support Initiative", funder: "Local Community Foundation",
    amount: 92000, period: "Jan 1 – Jun 30, 2026", status: "ON TRACK",
    utilization: 71, reportDueDays: 52, programOfficer: "James Okafor",
    deliverables: [
      { text: "Needs assessment completed", done: true },
      { text: "Partner agreements signed", done: true },
      { text: "Mid-program evaluation", done: false },
      { text: "Final report", done: false },
    ],
    budgetBreakdown: [{ label: "Direct Services", pct: 60 }, { label: "Staffing", pct: 30 }, { label: "Admin", pct: 10 }],
  },
];

function utilizationColor(pct: number) {
  if (pct >= 75) return "bg-green-500";
  if (pct >= 50) return "bg-amber-500";
  return "bg-amber-500";
}

export default function GrantsPage() {
  const [grants, setGrants] = useState(INITIAL_GRANTS);
  const [drawerGrant, setDrawerGrant] = useState<Grant | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);
  const [reportGrant, setReportGrant] = useState<Grant | null>(null);

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
        <h1 className="text-2xl font-bold tracking-tight">Grants</h1>
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
                    <Button className="flex-1" variant="outline" onClick={() => { toast.success("Draft copied to clipboard!"); }}>
                      <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy Draft
                    </Button>
                    <Button className="flex-1" variant="outline" onClick={() => { toast.success("Download ready — check your downloads folder"); }}>
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
