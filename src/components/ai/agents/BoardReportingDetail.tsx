import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, FileDown, MessageSquare, Clock, BarChart3, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format, subDays, subHours } from "date-fns";

const NOW = new Date();
const currentQuarter = `Q${Math.ceil((NOW.getMonth() + 1) / 3)} ${NOW.getFullYear()}`;

interface KPIItem {
  id: string;
  name: string;
  current: string;
  target: string;
  variance: string;
  status: "needs_approval" | "approved";
}

const INITIAL_KPIS: KPIItem[] = [
  { id: "k1", name: "Major Gift Goal", current: "$201K", target: "$300K", variance: "67% of target", status: "needs_approval" },
  { id: "k2", name: "Events Revenue", current: "$142K", target: "$160K", variance: "89% of target", status: "needs_approval" },
  { id: "k3", name: "Volunteer Hours", current: "2,340 hrs", target: "3,000 hrs", variance: "78% of target", status: "needs_approval" },
];

const ACTIVITY_LOG = [
  { time: format(subHours(NOW, 1), "h:mm a"), text: `Generated ${currentQuarter} board report draft` },
  { time: format(subHours(NOW, 1), "h:mm a"), text: "Pulled data from Salesforce, Stripe, and grant tracker" },
  { time: format(subHours(NOW, 1), "h:mm a"), text: "3 KPIs flagged for ED approval" },
  { time: format(subDays(NOW, 1), "MMM d"), text: "Run complete — data sources synced, no report generated" },
  { time: format(subDays(NOW, 7), "MMM d"), text: `Previous ${currentQuarter} draft generated — superseded` },
];

export default function BoardReportingDetail() {
  const [kpis, setKpis] = useState(INITIAL_KPIS);
  const [exporting, setExporting] = useState(false);

  const handleApprove = (id: string, name: string) => {
    setKpis((prev) => prev.map((k) => (k.id === id ? { ...k, status: "approved" as const } : k)));
    toast.success(`Approved — ${name} added to report`);
  };

  const handleAddNote = (name: string) => {
    toast.info(`Adding note for ${name}...`);
  };

  const handleExport = () => {
    setExporting(true);
    toast("Preparing PDF...", { icon: "📄" });
    setTimeout(() => {
      setExporting(false);
      toast.success("Board report ready to download");
    }, 2000);
  };

  const pendingCount = kpis.filter((k) => k.status === "needs_approval").length;
  const approvedCount = kpis.filter((k) => k.status === "approved").length;

  return (
    <div className="space-y-6">
      {/* Export button at top */}
      <div className="flex justify-end">
        <Button className="gap-1.5" onClick={handleExport} disabled={exporting}>
          {exporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileDown className="h-4 w-4" />
          )}
          {exporting ? "Preparing PDF..." : "Export Board Report PDF"}
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold">{pendingCount}</p>
          <p className="text-xs text-muted-foreground">KPIs need approval</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
          <p className="text-xs text-muted-foreground">Approved for report</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-primary">5 hrs</p>
          <p className="text-xs text-muted-foreground">Est. time saved</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" /> {currentQuarter} Report — KPIs Requiring Approval
          </CardTitle>
          <CardDescription>
            {pendingCount > 0
              ? `${pendingCount} KPI${pendingCount !== 1 ? "s" : ""} need ED approval before export`
              : "All KPIs approved — report ready for export"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {kpis.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <CheckCircle className="h-10 w-10 text-green-500" />
              <p className="font-semibold text-foreground">All clear</p>
              <p className="text-sm text-muted-foreground">No items need review</p>
            </div>
          ) : (
            kpis.map((k) => (
              <div key={k.id} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-foreground">{k.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Current: {k.current} · Target: {k.target} · {k.variance}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      k.status === "approved"
                        ? "text-green-600 border-green-200 bg-green-50 text-xs"
                        : "text-amber-600 border-amber-200 bg-amber-50 text-xs"
                    }
                  >
                    {k.status === "approved" ? "Approved" : "Needs Approval"}
                  </Badge>
                </div>
                {/* Progress bar */}
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: k.variance.replace(/[^0-9]/g, "") + "%" }}
                  />
                </div>
                {k.status === "needs_approval" && (
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" className="gap-1.5" onClick={() => handleApprove(k.id, k.name)}>
                      <CheckCircle className="h-3.5 w-3.5" /> Approve for Report
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => handleAddNote(k.name)}>
                      <MessageSquare className="h-3.5 w-3.5" /> Add Note
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4" /> Activity Log</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {ACTIVITY_LOG.map((a, i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              <span className="text-muted-foreground font-mono text-xs mt-0.5 shrink-0 w-20">{a.time}</span>
              <span className="text-foreground">{a.text}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
