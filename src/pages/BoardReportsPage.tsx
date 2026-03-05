import {
  FileText,
  Download,
  RefreshCw,
  Users,
  DollarSign,
  Clock,
  Briefcase,
  TrendingUp,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DEMO_BOARD_REPORT } from "@/shared/data/nonprofitDemoData";

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail?: string;
  detailColor?: string;
}

function KpiCard({ icon, label, value, detail, detailColor = "text-green-600" }: KpiCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
          {detail && (
            <p className={`mt-0.5 text-xs font-medium ${detailColor}`}>{detail}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function BoardReportsPage() {
  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Board Reports</h1>
        <p className="text-sm text-muted-foreground">
          Board-ready reports generated from your organization's data
        </p>
      </div>

      {/* Status Banner */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 ring-1 ring-green-200 border-0">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
              {DEMO_BOARD_REPORT.status}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Last generated today
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-1.5">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
            <Button className="gap-1.5">
              <RefreshCw className="h-4 w-4" />
              Generate New Draft
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={<Users className="h-5 w-5 text-primary" />}
          label="Total Donors"
          value={DEMO_BOARD_REPORT.totalDonors.toLocaleString()}
          detail={`↑${DEMO_BOARD_REPORT.donorGrowth}% vs last quarter`}
        />
        <KpiCard
          icon={<DollarSign className="h-5 w-5 text-primary" />}
          label="Total Revenue"
          value={`$${DEMO_BOARD_REPORT.totalRevenue.toLocaleString()}`}
          detail={`${DEMO_BOARD_REPORT.revenueVsGoal}% of goal`}
        />
        <KpiCard
          icon={<Clock className="h-5 w-5 text-primary" />}
          label="Volunteer Hours"
          value={DEMO_BOARD_REPORT.volunteerHours.toLocaleString()}
        />
        <KpiCard
          icon={<Briefcase className="h-5 w-5 text-primary" />}
          label="Active Programs"
          value={String(DEMO_BOARD_REPORT.programsActive)}
        />
      </div>

      {/* Financial Snapshot */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Snapshot</CardTitle>
          <CardDescription>
            Revenue, expenses, and fund balance summary for the current quarter
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20">
            <p className="text-sm text-muted-foreground">
              Financial chart will render when connected to live data
            </p>
          </div>
          <div className="mt-4">
            <Button variant="outline" className="gap-1.5">
              <Eye className="h-4 w-4" />
              View Full Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Engagement Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Metrics</CardTitle>
          <CardDescription>
            Donor retention, event participation, and volunteer engagement trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20">
            <p className="text-sm text-muted-foreground">
              Engagement trends will render when connected to live data
            </p>
          </div>
          <div className="mt-4">
            <Button variant="outline" className="gap-1.5">
              <Eye className="h-4 w-4" />
              View Full Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
