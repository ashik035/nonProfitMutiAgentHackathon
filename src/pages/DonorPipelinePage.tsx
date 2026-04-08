import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toastSuccess } from "@/lib/toast-helpers";
import { DollarSign, TrendingUp, Clock, Database } from "lucide-react";
import { DEMO_ORG } from "@/shared/data/nonprofitDemoData";

interface DonorCard {
  name: string;
  giving: string;
  score: number;
  scoreBadge: string;
  daysInStage: number;
}

interface PipelineColumn {
  title: string;
  count: number;
  color: string;
  borderColor: string;
  action: string;
  donors: DonorCard[];
}

const columns: PipelineColumn[] = [
  {
    title: "Identified",
    count: 47,
    color: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-t-blue-500",
    action: "Schedule Call",
    donors: [
      { name: "Margaret Chen", giving: "$420/yr", score: 94, scoreBadge: "High Readiness", daysInStage: 3 },
      { name: "Robert Okafor", giving: "$310/yr", score: 78, scoreBadge: "Ready", daysInStage: 7 },
      { name: "David Kim", giving: "$480/yr", score: 55, scoreBadge: "Needs Engagement", daysInStage: 14 },
    ],
  },
  {
    title: "Outreach Scheduled",
    count: 12,
    color: "bg-cyan-50 dark:bg-cyan-950/30",
    borderColor: "border-t-cyan-500",
    action: "Log Update",
    donors: [
      { name: "Susan Park", giving: "$275/yr", score: 71, scoreBadge: "Ready", daysInStage: 5 },
      { name: "Linda Torres", giving: "$390/yr", score: 89, scoreBadge: "High Readiness", daysInStage: 2 },
    ],
  },
  {
    title: "In Conversation",
    count: 8,
    color: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "border-t-emerald-500",
    action: "Log Update",
    donors: [
      { name: "James Wright", giving: "$500/yr", score: 88, scoreBadge: "High Readiness", daysInStage: 11 },
      { name: "Patricia Moore", giving: "$250/yr", score: 65, scoreBadge: "Ready", daysInStage: 8 },
    ],
  },
  {
    title: "Pledge Made",
    count: 3,
    color: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-t-amber-500",
    action: "Record Pledge",
    donors: [
      { name: "Angela Davis", giving: "$350 → $1,000", score: 92, scoreBadge: "Committed", daysInStage: 4 },
      { name: "Thomas Lee", giving: "$1,200 → $2,500", score: 96, scoreBadge: "Committed", daysInStage: 2 },
    ],
  },
  {
    title: "Upgraded ✓",
    count: 2,
    color: "bg-green-50 dark:bg-green-950/30",
    borderColor: "border-t-green-600",
    action: "Mark Upgraded",
    donors: [
      { name: "Richard Nguyen", giving: "$500 → $1,200", score: 100, scoreBadge: "Upgraded", daysInStage: 0 },
      { name: "Carol Martinez", giving: "$420 → $1,000", score: 100, scoreBadge: "Upgraded", daysInStage: 0 },
    ],
  },
];

function scoreBadgeColor(badge: string) {
  switch (badge) {
    case "High Readiness": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300";
    case "Ready": return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
    case "Needs Engagement": return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
    case "Committed": return "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300";
    case "Upgraded": return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
    default: return "bg-muted text-muted-foreground";
  }
}

const DonorPipelinePage = () => {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Donor Upgrade Pipeline</h1>
        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
          <Database className="h-3.5 w-3.5" />
          {DEMO_ORG.lastSyncLabel}
        </div>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-full bg-blue-100 dark:bg-blue-900/40 p-2">
              <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">$47,000/yr potential</p>
              <p className="text-sm text-muted-foreground">Total pipeline value if all upgrade</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-full bg-green-100 dark:bg-green-900/40 p-2">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">$2,000 secured</p>
              <p className="text-sm text-muted-foreground">Upgraded this quarter</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-full bg-amber-100 dark:bg-amber-900/40 p-2">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">34 days</p>
              <p className="text-sm text-muted-foreground">Avg days to upgrade</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {columns.map((col) => (
          <div key={col.title} className="space-y-3">
            {/* Column Header */}
            <div className={`rounded-lg border-t-4 ${col.borderColor} bg-card p-3`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-foreground">{col.title}</h3>
                <Badge variant="secondary" className="text-xs">{col.count}</Badge>
              </div>
            </div>

            {/* Donor Cards */}
            {col.donors.map((donor) => (
              <Card key={donor.name} className={`${col.color} border shadow-sm`}>
                <CardContent className="p-3 space-y-2">
                  <p className="font-medium text-sm text-foreground">{donor.name}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{donor.giving}</span>
                    <Badge className={`text-[10px] px-1.5 py-0 border-0 ${scoreBadgeColor(donor.scoreBadge)}`}>
                      {donor.scoreBadge}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">
                      {donor.daysInStage === 0 ? "Just now" : `${donor.daysInStage}d in stage`}
                    </span>
                    <span className="text-[11px] font-medium text-foreground">Score: {donor.score}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full h-7 text-xs"
                    onClick={() => toastSuccess(`${col.action} completed for ${donor.name}`)}
                  >
                    {col.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonorPipelinePage;
