import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowLeftRight, CheckCircle, UserPlus, Search, Flag, Loader2, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import {
  DEMO_RECONCILIATION_PAGE,
  type ReconciliationFlaggedTxn,
} from "@/shared/data/nonprofitDemoData";

type FlaggedTxn = ReconciliationFlaggedTxn;

const { flaggedTxn: INITIAL_TXN, pendingCount: INITIAL_PENDING, searchResults: SEARCH_RESULTS, matchedTxns: MATCHED_TXNS } = DEMO_RECONCILIATION_PAGE;

export default function ReconciliationPage() {
  const [txn, setTxn] = useState<FlaggedTxn | null>(INITIAL_TXN);
  const [pendingCount, setPendingCount] = useState(INITIAL_PENDING);
  const [createModal, setCreateModal] = useState(false);
  const [matchModal, setMatchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [aprilOpen, setAprilOpen] = useState(false);
  const [marchOpen, setMarchOpen] = useState(false);
  const [txnDrawer, setTxnDrawer] = useState(false);
  const [reportModal, setReportModal] = useState(false);

  const resolveTxn = (msg: string) => {
    setTxn(null);
    setPendingCount(0);
    toast.success(msg);
  };

  const handleCreateRecord = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setCreateModal(false);
      resolveTxn("✓ Donor record created for M. Chen — synced to Salesforce");
    }, 1500);
  };

  const handleMatch = (name: string) => {
    setMatchModal(false);
    resolveTxn(`✓ Transaction matched to ${name}`);
  };

  const handleFlag = () => {
    setTxn((prev) => prev ? { ...prev, status: "under_review" } : prev);
    toast("Flagged for Finance Review", { icon: "🏷️" });
  };

  const filteredResults = SEARCH_RESULTS.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Financial Reconciliation</h1>
        <p className="text-sm text-muted-foreground">Brightside Foundation · Stripe ↔ Salesforce transaction matching</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Transactions This Month", value: "847" },
          { label: "Matched", value: "846 (99.9%)" },
          { label: "Pending Review", value: String(pendingCount) },
          { label: "Month Status", value: pendingCount === 0 ? "Complete ✓" : "Nearly Complete" },
        ].map((s, i) => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${i === 3 && pendingCount === 0 ? "text-green-600" : ""}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Flagged Transaction */}
      {txn ? (
        <Card className={`border-2 ${txn.status === "under_review" ? "border-yellow-300" : "border-amber-300"}`}>
          <CardContent className="p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-lg">{txn.amount} — {txn.date}</p>
                <p className="text-sm text-muted-foreground">Stripe ID: {txn.stripeId}</p>
                <p className="text-sm text-muted-foreground">Email: {txn.email}</p>
              </div>
              <Badge className={txn.status === "under_review" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}>
                {txn.status === "under_review" ? "UNDER FINANCE REVIEW" : "NO CRM MATCH FOUND"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">One-time donation via Stripe checkout</p>
            <p className="text-sm text-muted-foreground italic">
              "This email address does not exist in Salesforce. Possible new donor or guest checkout."
            </p>
            <div className="flex flex-wrap gap-2">
              {txn.status === "under_review" ? (
                <Button size="sm" onClick={() => resolveTxn("Transaction resolved")}>
                  <CheckCircle className="h-3.5 w-3.5 mr-1.5" /> Mark as Resolved
                </Button>
              ) : (
                <>
                  <Button size="sm" onClick={() => setCreateModal(true)}>
                    <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Create Donor Record in Salesforce
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setMatchModal(true)}>
                    <Search className="h-3.5 w-3.5 mr-1.5" /> Match to Existing Donor
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleFlag}>
                    <Flag className="h-3.5 w-3.5 mr-1.5" /> Flag for Finance Review
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => resolveTxn("Transaction resolved")}>
                    <CheckCircle className="h-3.5 w-3.5 mr-1.5" /> Mark as Resolved
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/10">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-3" />
            <p className="font-semibold text-green-700">All transactions matched</p>
            <p className="text-sm text-muted-foreground">No items need review</p>
          </CardContent>
        </Card>
      )}

      {/* Monthly Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* April */}
          <Collapsible open={aprilOpen} onOpenChange={setAprilOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full rounded-lg border p-4 hover:bg-muted/50">
              <div className="flex items-center gap-3">
                {aprilOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <div className="text-left">
                  <p className="font-medium">April 2026</p>
                  <p className="text-xs text-muted-foreground">847 transactions · $142,340 total · {pendingCount} pending</p>
                </div>
              </div>
              <Badge className={pendingCount === 0 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
                {pendingCount === 0 ? "100% matched ✓" : "99.9% matched"}
              </Badge>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <Button variant="outline" size="sm" className="mb-3" onClick={() => setTxnDrawer(true)}>View All Transactions</Button>
            </CollapsibleContent>
          </Collapsible>

          {/* March */}
          <Collapsible open={marchOpen} onOpenChange={setMarchOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full rounded-lg border p-4 hover:bg-muted/50">
              <div className="flex items-center gap-3">
                {marchOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <div className="text-left">
                  <p className="font-medium">March 2026</p>
                  <p className="text-xs text-muted-foreground">923 transactions · $158,200 total · 0 pending</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-700">100% matched ✓</Badge>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <Button variant="outline" size="sm" onClick={() => setReportModal(true)}>View Report</Button>
            </CollapsibleContent>
          </Collapsible>

          {/* February */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">February 2026</p>
                <p className="text-xs text-muted-foreground">891 transactions · $134,700 total · 0 pending</p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-700">100% matched ✓</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Create Record Modal */}
      <Dialog open={createModal} onOpenChange={setCreateModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Donor Record in Salesforce</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input placeholder="Enter full name" defaultValue="" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input defaultValue="m.chen@outlook.com" readOnly className="bg-muted" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input defaultValue="$2,340.00" readOnly className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input defaultValue="April 6, 2026" readOnly className="bg-muted" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreateRecord} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Create Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Match Modal */}
      <Dialog open={matchModal} onOpenChange={setMatchModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Match to Existing Donor</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <Input placeholder="Search donors..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            {searchQuery.length > 0 && (
              <div className="space-y-2">
                {filteredResults.map((r) => (
                  <button
                    key={r.email}
                    className="w-full text-left rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                    onClick={() => handleMatch(r.name)}
                  >
                    <p className="font-medium text-sm">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.email} · Last gift {r.lastGift}</p>
                  </button>
                ))}
                {filteredResults.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No results found</p>}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMatchModal(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transactions Drawer */}
      <Sheet open={txnDrawer} onOpenChange={setTxnDrawer}>
        <SheetContent className="sm:max-w-2xl overflow-y-auto">
          <SheetHeader><SheetTitle>April 2026 Transactions</SheetTitle></SheetHeader>
          <div className="mt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Date</th>
                  <th className="text-left py-2 px-2">Donor Name</th>
                  <th className="text-right py-2 px-2">Amount</th>
                  <th className="text-left py-2 px-2">Stripe ID</th>
                  <th className="text-left py-2 px-2">Salesforce ID</th>
                  <th className="text-center py-2 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {MATCHED_TXNS.map((t, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-2 px-2">{t.date}</td>
                    <td className="py-2 px-2 font-medium">{t.name}</td>
                    <td className="py-2 px-2 text-right">{t.amount}</td>
                    <td className="py-2 px-2 text-muted-foreground">{t.stripeId}</td>
                    <td className="py-2 px-2 text-muted-foreground">{t.sfId}</td>
                    <td className="py-2 px-2 text-center text-green-600 text-xs">{t.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SheetContent>
      </Sheet>

      {/* Report Modal */}
      <Dialog open={reportModal} onOpenChange={setReportModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>March 2026 — Reconciliation Summary</DialogTitle></DialogHeader>
          <div className="space-y-3 py-4 text-sm">
            <p>Total Transactions: 923</p>
            <p>Total Amount: $158,200</p>
            <p>Match Rate: 100%</p>
            <p>Unresolved: 0</p>
            <p className="text-green-600 font-medium">✓ Month closed and balanced</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
