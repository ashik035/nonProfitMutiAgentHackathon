import {
  ArrowLeftRight,
  AlertTriangle,
  DollarSign,
  ShieldAlert,
  Link2,
  Flag,
  Download,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DEMO_RECONCILIATION } from "@/shared/data/nonprofitDemoData";

interface SummaryCardProps {
  icon: React.ReactNode;
  count: number;
  label: string;
  variant: "amber" | "red";
}

function SummaryCard({ icon, count, label, variant }: SummaryCardProps) {
  const bg = variant === "amber" ? "bg-amber-50 ring-amber-200" : "bg-red-50 ring-red-200";
  const iconColor = variant === "amber" ? "text-amber-600" : "text-red-600";

  return (
    <Card className={`ring-1 border-0 ${bg}`}>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={iconColor}>{icon}</div>
        <div>
          <p className="text-2xl font-bold">{count}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

const TRANSACTIONS_FOR_REVIEW = [
  {
    id: "TXN-4821",
    description: "Online donation — $250.00",
    source: "Stripe",
    date: "Feb 28, 2026",
    issue: "No matching entry in QuickBooks",
  },
  {
    id: "TXN-4835",
    description: "Event ticket sale — $150.00",
    source: "Stripe",
    date: "Mar 1, 2026",
    issue: "Fee variance of $3.50 detected",
  },
  {
    id: "TXN-4842",
    description: "Grant disbursement — $10,000.00",
    source: "QuickBooks",
    date: "Mar 2, 2026",
    issue: "Restricted fund code mismatch",
  },
];

export default function ReconciliationPage() {
  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reconciliation</h1>
        <p className="text-sm text-muted-foreground">
          Match transactions across your payment processors and finance systems
        </p>
        <Badge variant="secondary" className="mt-2">
          Connected to Stripe &middot; QuickBooks Online &middot; Last synced 4 hours ago
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          icon={<ArrowLeftRight className="h-6 w-6" />}
          count={DEMO_RECONCILIATION.unmatchedTransactions}
          label="Unmatched transactions"
          variant="amber"
        />
        <SummaryCard
          icon={<DollarSign className="h-6 w-6" />}
          count={DEMO_RECONCILIATION.feeVarianceAlerts}
          label="Fee variance alerts"
          variant="amber"
        />
        <SummaryCard
          icon={<ShieldAlert className="h-6 w-6" />}
          count={DEMO_RECONCILIATION.restrictedFundMismatches}
          label="Restricted fund mismatch"
          variant="red"
        />
      </div>

      {/* Transactions Requiring Review */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions Requiring Review</CardTitle>
          <CardDescription>
            {DEMO_RECONCILIATION.transactionsRequiringReview} transactions need your attention
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {TRANSACTIONS_FOR_REVIEW.map((txn) => (
            <div
              key={txn.id}
              className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{txn.description}</p>
                  <Badge variant="outline" className="text-xs">
                    {txn.id}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {txn.source} &middot; {txn.date} &middot;{" "}
                  <span className="text-amber-600">{txn.issue}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="gap-1.5">
                  <Link2 className="h-3.5 w-3.5" />
                  Match
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5">
                  <Flag className="h-3.5 w-3.5" />
                  Flag
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Monthly Reconciliation Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Reconciliation Summary</CardTitle>
          <CardDescription>February 2026 — 142 of 147 transactions matched</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-[96.6%] rounded-full bg-green-500" />
            </div>
            <span className="text-sm font-medium text-green-600">96.6%</span>
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" className="gap-1.5">
              <Download className="h-4 w-4" />
              Export Reconciliation Report
            </Button>
            <Button className="gap-1.5">
              <CheckCircle className="h-4 w-4" />
              Mark as Balanced
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
