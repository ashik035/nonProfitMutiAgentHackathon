import {
  BookOpen,
  Clock,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DEMO_GRANTS } from "@/shared/data/nonprofitDemoData";

function utilizationColor(pct: number) {
  if (pct > 90) return { bar: "bg-red-500", text: "text-red-600", badge: "bg-red-100 text-red-700" };
  if (pct >= 75) return { bar: "bg-amber-500", text: "text-amber-600", badge: "bg-amber-100 text-amber-700" };
  return { bar: "bg-green-500", text: "text-green-600", badge: "bg-green-100 text-green-700" };
}

export default function GrantsPage() {
  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Grants</h1>
        <p className="text-sm text-muted-foreground">
          Track grant lifecycle, deadlines, and fund utilization
        </p>
        <Badge variant="secondary" className="mt-2">
          Data sourced from your CRM &middot; Last synced 3 hours ago
        </Badge>
      </div>

      {/* Alert Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="ring-1 ring-amber-200 border-0 bg-amber-50">
          <CardContent className="flex items-center gap-4 p-5">
            <Clock className="h-6 w-6 text-amber-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                {DEMO_GRANTS.upcomingDeadlines} grant deadlines within{" "}
                {DEMO_GRANTS.deadlineDaysThreshold} days
              </p>
            </div>
            <Button size="sm" variant="outline">
              View Details
            </Button>
          </CardContent>
        </Card>
        <Card className="ring-1 ring-red-200 border-0 bg-red-50">
          <CardContent className="flex items-center gap-4 p-5">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                1 grant over 90% utilized
              </p>
            </div>
            <Button size="sm" variant="outline">
              View Details
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Active Grants */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Active Grants</h2>
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
          {DEMO_GRANTS.grants.map((grant) => {
            const colors = utilizationColor(grant.utilized);
            return (
              <Card key={grant.name}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{grant.name}</CardTitle>
                  <CardDescription>{grant.funder}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Fund Utilization</span>
                      <span className={`font-medium ${colors.text}`}>{grant.utilized}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${colors.bar}`}
                        style={{ width: `${grant.utilized}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      ${grant.amount.toLocaleString()} total
                    </span>
                    <Badge className={`${colors.badge} hover:${colors.badge}`}>
                      {grant.daysUntilDeadline} days left
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    Generate Compliance Summary
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
