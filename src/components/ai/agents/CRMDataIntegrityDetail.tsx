import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, X, ExternalLink, Clock, Database } from "lucide-react";
import { toast } from "sonner";
import { format, subDays, subHours } from "date-fns";

const NOW = new Date();

interface DuplicatePair {
  id: string;
  name: string;
  donorA: string;
  donorB: string;
  reason: string;
}

const INITIAL_FINDINGS: DuplicatePair[] = [
  { id: "d1", name: "Sarah Chen", donorA: "#1847", donorB: "#2103", reason: "Same email, different addresses. Created 14 months apart." },
  { id: "d2", name: "Michael Torres", donorA: "#892", donorB: "#1654", reason: "Same phone, name variation (Mike vs Michael)." },
  { id: "d3", name: "Jennifer Walsh", donorA: "#3021", donorB: "#3089", reason: "Created same day, likely double entry." },
];

const ACTIVITY_LOG = [
  { time: format(subHours(NOW, 2), "h:mm a"), text: "Scanned 1,847 donor records in Salesforce" },
  { time: format(subHours(NOW, 2), "h:mm a"), text: "Found 3 potential duplicate pairs" },
  { time: format(subDays(NOW, 1), "MMM d"), text: "Run complete — 5 duplicates found, 2 auto-resolved" },
  { time: format(subDays(NOW, 2), "MMM d"), text: "Run complete — 4 duplicates found" },
  { time: format(subDays(NOW, 3), "MMM d"), text: "Run complete — 6 duplicates found, 1 flagged" },
];

export default function CRMDataIntegrityDetail() {
  const [findings, setFindings] = useState(INITIAL_FINDINGS);
  const [approvedCount, setApprovedCount] = useState(2);

  const handleApprove = (id: string, name: string) => {
    setFindings((prev) => prev.filter((f) => f.id !== id));
    setApprovedCount((c) => c + 1);
    toast.success(`Approved — merging ${name} records`);
  };

  const handleDismiss = (id: string) => {
    setFindings((prev) => prev.filter((f) => f.id !== id));
    toast("Marked as different — will not suggest again", { icon: "✓" });
  };

  return (
    <div className="space-y-6">
      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold">{findings.length}</p>
          <p className="text-xs text-muted-foreground">Items to review</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
          <p className="text-xs text-muted-foreground">Approved this week</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-primary">2.5 hrs</p>
          <p className="text-xs text-muted-foreground">Est. time saved</p>
        </CardContent></Card>
      </div>

      {/* Findings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" /> Duplicate Records Found
          </CardTitle>
          <CardDescription>{findings.length} pairs need review</CardDescription>
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
                    <p className="font-medium text-foreground">{f.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Donor {f.donorA} vs {f.donorB}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 text-xs">
                    Needs Action
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground italic">&ldquo;{f.reason}&rdquo;</p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" className="gap-1.5" onClick={() => handleApprove(f.id, f.name)}>
                    <CheckCircle className="h-3.5 w-3.5" /> Approve Merge
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => handleDismiss(f.id)}>
                    <X className="h-3.5 w-3.5" /> Mark as Different
                  </Button>
                  <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => toast.info("Opening donor records...")}>
                    <ExternalLink className="h-3.5 w-3.5" /> View Records
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Activity Log */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" /> Activity Log
          </CardTitle>
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
