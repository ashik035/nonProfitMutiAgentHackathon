import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Flag, UserPlus, Clock, ArrowLeftRight } from "lucide-react";
import { toast } from "sonner";
import { format, subDays, subHours } from "date-fns";

const NOW = new Date();

interface FlaggedTransaction {
  id: string;
  amount: string;
  date: string;
  chargeId: string;
  detail: string;
  status: "needs_action" | "in_progress" | "resolved";
}

const INITIAL_FINDINGS: FlaggedTransaction[] = [
  {
    id: "t1",
    amount: "$2,340.00",
    date: format(subDays(NOW, 2), "MMM d, yyyy"),
    chargeId: "ch_3OxK9L",
    detail: "No matching record found in Salesforce. Donor email: m.chen@outlook.com — not in CRM.",
    status: "needs_action",
  },
];

const ACTIVITY_LOG = [
  { time: format(subHours(NOW, 4), "h:mm a"), text: "Scanned 312 Stripe transactions" },
  { time: format(subHours(NOW, 4), "h:mm a"), text: "Matched 311 transactions to QuickBooks" },
  { time: format(subHours(NOW, 4), "h:mm a"), text: "1 unmatched transaction flagged" },
  { time: format(subDays(NOW, 1), "MMM d"), text: "Run complete — 0 unmatched transactions" },
  { time: format(subDays(NOW, 2), "MMM d"), text: "Run complete — 2 unmatched, 1 auto-resolved" },
];

export default function ReconciliationDetail() {
  const [findings, setFindings] = useState(INITIAL_FINDINGS);

  const handleCreateRecord = (id: string) => {
    setFindings((prev) => prev.filter((f) => f.id !== id));
    toast.success("CRM record created — transaction matched");
  };

  const handleFlag = (id: string) => {
    setFindings((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: "in_progress" as const } : f))
    );
    toast("Flagged for Finance Review", { icon: "🏷️" });
  };

  const handleResolve = (id: string) => {
    setFindings((prev) => prev.filter((f) => f.id !== id));
    toast.success("Marked as resolved");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold">{findings.length}</p>
          <p className="text-xs text-muted-foreground">Items to review</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-green-600">311</p>
          <p className="text-xs text-muted-foreground">Auto-matched this run</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-primary">1.5 hrs</p>
          <p className="text-xs text-muted-foreground">Est. time saved</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5" /> Flagged Transactions
          </CardTitle>
          <CardDescription>{findings.length} transaction{findings.length !== 1 ? "s" : ""} need review</CardDescription>
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
                    <p className="font-medium text-foreground">{f.amount} — {f.date}</p>
                    <p className="text-sm text-muted-foreground">Stripe charge ID: {f.chargeId}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={f.status === "in_progress"
                      ? "text-amber-600 border-amber-200 bg-amber-50 text-xs"
                      : "text-red-600 border-red-200 bg-red-50 text-xs"
                    }
                  >
                    {f.status === "in_progress" ? "In Progress" : "Needs Action"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground italic">&ldquo;{f.detail}&rdquo;</p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" className="gap-1.5" onClick={() => handleCreateRecord(f.id)}>
                    <UserPlus className="h-3.5 w-3.5" /> Create CRM Record
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => handleFlag(f.id)} disabled={f.status === "in_progress"}>
                    <Flag className="h-3.5 w-3.5" /> Flag for Finance Review
                  </Button>
                  <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => handleResolve(f.id)}>
                    <CheckCircle className="h-3.5 w-3.5" /> Mark as Resolved
                  </Button>
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
