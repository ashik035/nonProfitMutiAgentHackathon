import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, FileText, UserPlus, Clock, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { format, subDays, subHours } from "date-fns";

const NOW = new Date();

interface GrantAlert {
  id: string;
  funder: string;
  amount: string;
  dueIn: string;
  utilization: number;
  detail: string;
  status: "needs_action" | "in_progress" | "on_track";
}

const INITIAL_FINDINGS: GrantAlert[] = [
  {
    id: "g1",
    funder: "Kresge Foundation",
    amount: "$185,000",
    dueIn: "8 days",
    utilization: 61,
    detail: "Narrative draft not started. Budget variance of $4,200 requires explanation.",
    status: "needs_action",
  },
  {
    id: "g2",
    funder: "Robert Wood Johnson",
    amount: "$95,000",
    dueIn: "31 days",
    utilization: 88,
    detail: "On track. No action required.",
    status: "on_track",
  },
];

const ACTIVITY_LOG = [
  { time: format(subHours(NOW, 3), "h:mm a"), text: "Scanned 4 active grants for compliance" },
  { time: format(subHours(NOW, 3), "h:mm a"), text: "Flagged 2 grants — 1 urgent, 1 on track" },
  { time: format(subDays(NOW, 1), "MMM d"), text: "Run complete — 1 grant flagged (Ford Foundation)" },
  { time: format(subDays(NOW, 2), "MMM d"), text: "Run complete — all grants on track" },
  { time: format(subDays(NOW, 4), "MMM d"), text: "Run complete — 2 grants flagged for review" },
];

export default function GrantComplianceDetail() {
  const [findings, setFindings] = useState(INITIAL_FINDINGS);

  const handleOpenBuilder = () => {
    toast.info("Opening report builder...");
  };

  const handleAssign = (funder: string) => {
    toast.success(`Assigned to Development Director — ${funder}`);
  };

  const handleInProgress = (id: string) => {
    setFindings((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: "in_progress" as const } : f))
    );
    toast("Marked as In Progress", { icon: "🔄" });
  };

  const handleView = () => {
    toast.info("Opening grant details...");
  };

  const handleGenerateDraft = (funder: string) => {
    toast.success(`Generating compliance draft for ${funder}...`);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold">{findings.filter((f) => f.status === "needs_action").length}</p>
          <p className="text-xs text-muted-foreground">Items to review</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-green-600">1</p>
          <p className="text-xs text-muted-foreground">Resolved this week</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-primary">3 hrs</p>
          <p className="text-xs text-muted-foreground">Est. time saved</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" /> Grant Compliance Alerts
          </CardTitle>
          <CardDescription>{findings.length} grant{findings.length !== 1 ? "s" : ""} reviewed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {findings.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <CheckCircle className="h-10 w-10 text-green-500" />
              <p className="font-semibold text-foreground">All clear</p>
              <p className="text-sm text-muted-foreground">No items need review</p>
            </div>
          ) : (
            findings.map((f) => (
              <div key={f.id} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-foreground">{f.funder} — {f.amount}</p>
                    <p className="text-sm text-muted-foreground">
                      Report due in {f.dueIn} · Fund utilization: {f.utilization}%
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      f.status === "on_track"
                        ? "text-green-600 border-green-200 bg-green-50 text-xs"
                        : f.status === "in_progress"
                        ? "text-amber-600 border-amber-200 bg-amber-50 text-xs"
                        : "text-red-600 border-red-200 bg-red-50 text-xs"
                    }
                  >
                    {f.status === "on_track" ? "On Track" : f.status === "in_progress" ? "In Progress" : "Needs Action"}
                  </Badge>
                </div>
                {/* Utilization bar */}
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${f.utilization > 85 ? "bg-amber-500" : "bg-green-500"}`}
                    style={{ width: `${f.utilization}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground italic">&ldquo;{f.detail}&rdquo;</p>
                <div className="flex flex-wrap gap-2">
                  {f.status === "needs_action" && (
                    <>
                      <Button size="sm" className="gap-1.5" onClick={handleOpenBuilder}>
                        <FileText className="h-3.5 w-3.5" /> Open Report Builder
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1.5" onClick={() => handleAssign(f.funder)}>
                        <UserPlus className="h-3.5 w-3.5" /> Assign to Staff
                      </Button>
                      <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => handleInProgress(f.id)}>
                        Mark as In Progress
                      </Button>
                    </>
                  )}
                  {f.status === "on_track" && (
                    <>
                      <Button size="sm" variant="outline" className="gap-1.5" onClick={handleView}>
                        <ExternalLink className="h-3.5 w-3.5" /> View Grant
                      </Button>
                      <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => handleGenerateDraft(f.funder)}>
                        <FileText className="h-3.5 w-3.5" /> Generate Draft
                      </Button>
                    </>
                  )}
                </div>
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
