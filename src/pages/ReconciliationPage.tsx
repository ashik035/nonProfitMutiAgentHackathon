import { useState, useEffect } from "react";

import {
  ArrowLeftRight,
  DollarSign,
  ShieldAlert,
  Link2,
  Flag,
  Download,
  CheckCircle,
  FileWarning,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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

function PageSkeleton() {
  return (
    <div className="space-y-8 p-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-32 w-full rounded-xl" />
    </div>
  );
}

export default function ReconciliationPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "Reconciliation | Nonprofit AI";
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <PageSkeleton />;

  const { transactions } = DEMO_RECONCILIATION;

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reconciliation</h1>
        <p className="text-sm text-muted-foreground">
          Match transactions across your payment processors and finance systems
        </p>
        <Badge variant="secondary" className="mt-2">
          Connected to Stripe &middot; QuickBooks Online &middot; Last synced {DEMO_RECONCILIATION.month}
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
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <FileWarning className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">All transactions are matched</p>
            </div>
          ) : (
            transactions.map((txn) => (
              <div
                key={txn.id}
                className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">
                      {txn.description} — ${txn.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
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
            ))
          )}
        </CardContent>
      </Card>

      {/* Monthly Reconciliation Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Reconciliation Summary</CardTitle>
          <CardDescription>
            {DEMO_RECONCILIATION.month} — {DEMO_RECONCILIATION.matchedCount} of {DEMO_RECONCILIATION.totalCount} transactions matched
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-green-500"
                style={{ width: `${DEMO_RECONCILIATION.matchPercentage}%` }}
              />
            </div>
            <span className="text-sm font-medium text-green-600">{DEMO_RECONCILIATION.matchPercentage}%</span>
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
