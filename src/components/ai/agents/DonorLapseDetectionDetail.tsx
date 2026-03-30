import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Users, Clock, Play } from "lucide-react";
import { toastSuccess } from "@/lib/toast-helpers";

const LAPSE_STATS = [
  { count: "9 donors", subtitle: "60-day lapse window", color: "amber" },
  { count: "23 donors", subtitle: "90-day lapse window", color: "orange" },
  { count: "41 donors", subtitle: "180+ day lapse window", color: "red" },
];

const AT_RISK = [
  { name: "James Wright", lastGift: "$500", daysAgo: "91 days ago", tenure: "7-year donor", badge: "Urgent" },
  { name: "Patricia Moore", lastGift: "$250", daysAgo: "67 days ago", tenure: "4-year donor", badge: "At Risk" },
  { name: "Thomas Lee", lastGift: "$1,200", daysAgo: "88 days ago", tenure: "9-year donor", badge: "Urgent" },
  { name: "Angela Davis", lastGift: "$350", daysAgo: "61 days ago", tenure: "3-year donor", badge: "At Risk" },
];

const FINDINGS = [
  { text: "23 donors have not given in 90+ days", severity: "amber" as const },
  { text: "7 donors giving over $500 are approaching lapse — high priority", severity: "red" as const },
  { text: "Re-engagement campaign recommended before end of Q2", severity: "blue" as const },
];

const ACTIVITY = [
  { time: "8:15 AM", text: "Scanned giving records for 3,847 donors" },
  { time: "8:16 AM", text: "Segmented by lapse window (60 / 90 / 180 days)" },
  { time: "8:17 AM", text: "Flagged 7 high-value donors as urgent" },
  { time: "8:17 AM", text: "Re-engagement recommendations generated" },
  { time: "8:18 AM", text: "Run complete — 23 donors flagged across all segments" },
];

const STAT_STYLES: Record<string, string> = {
  amber: "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20",
  orange: "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20",
  red: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20",
};

const STAT_DOT: Record<string, string> = {
  amber: "bg-amber-500",
  orange: "bg-orange-500",
  red: "bg-red-500",
};

const SEVERITY_BG: Record<string, string> = {
  amber: "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300",
  red: "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300",
  blue: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300",
};

const BADGE_STYLE: Record<string, string> = {
  Urgent: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  "At Risk": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
};

export default function DonorLapseDetectionDetail() {
  return (
    <div className="space-y-6">
      {/* Run Now */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          <span className="text-sm font-medium text-green-700 dark:text-green-400">Active</span>
          <span className="text-sm text-muted-foreground ml-2">Last run: 6 hours ago</span>
        </div>
        <Button size="sm" variant="outline" onClick={() => toastSuccess("Agent is running — results will appear shortly")}>
          <Play className="h-3.5 w-3.5 mr-1.5" /> Run Now
        </Button>
      </div>

      {/* Section 1 — Lapse Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {LAPSE_STATS.map((s) => (
          <Card key={s.subtitle} className={`rounded-xl border shadow-sm ${STAT_STYLES[s.color]}`}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <div className={`h-2.5 w-2.5 rounded-full ${STAT_DOT[s.color]}`} />
                <span className="text-2xl font-bold text-foreground">{s.count}</span>
              </div>
              <p className="text-sm text-muted-foreground">{s.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Section 2 — At-Risk Donors */}
      <Card className="rounded-xl border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" /> At-Risk Donors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-left">
                  <th className="pb-2 font-medium">Donor</th>
                  <th className="pb-2 font-medium">Last Gift</th>
                  <th className="pb-2 font-medium">Days Since</th>
                  <th className="pb-2 font-medium">Tenure</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {AT_RISK.map((d) => (
                  <tr key={d.name} className="border-b last:border-0">
                    <td className="py-3 font-medium text-foreground">{d.name}</td>
                    <td className="py-3 text-muted-foreground">{d.lastGift}</td>
                    <td className="py-3 text-muted-foreground">{d.daysAgo}</td>
                    <td className="py-3 text-muted-foreground">{d.tenure}</td>
                    <td className="py-3">
                      <Badge variant="secondary" className={`text-xs ${BADGE_STYLE[d.badge] ?? ""}`}>
                        {d.badge}
                      </Badge>
                    </td>
                    <td className="py-3 text-right">
                      <Button size="sm" variant="outline" onClick={() => toastSuccess(`Re-engagement task created for ${d.name}`)}>
                        Create Re-Engagement Task
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Section 3 — Recent Findings */}
      <Card className="rounded-xl border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Recent Findings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {FINDINGS.map((f, i) => (
            <div key={i} className={`flex items-start gap-3 rounded-lg border p-3 ${SEVERITY_BG[f.severity]}`}>
              <p className="text-sm font-medium flex-1">{f.text}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Section 4 — Suggested Actions */}
      <Card className="rounded-xl border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Suggested Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {["View All Lapsed Donors", "Generate Re-Engagement Plan", "Create Tasks for Development Team"].map((action) => (
              <Button key={action} size="sm" variant="outline" onClick={() => toastSuccess(`${action} — initiated`)}>
                {action}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 5 — Activity Log */}
      <Card className="rounded-xl border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" /> Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {ACTIVITY.map((a, i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              <span className="text-muted-foreground font-mono text-xs mt-0.5 shrink-0 w-16">{a.time}</span>
              <span className="text-foreground">{a.text}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
