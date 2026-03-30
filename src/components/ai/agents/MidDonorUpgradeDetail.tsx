import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, Users, Sparkles, UserPlus, Calendar, Clock, Play } from "lucide-react";
import { toastSuccess } from "@/lib/toast-helpers";

const DONORS = [
  { name: "Margaret Chen", avg: "$420/yr", years: "4 years", score: 94, badge: "High Readiness" },
  { name: "Robert Okafor", avg: "$310/yr", years: "5 years", score: 78, badge: "Ready" },
  { name: "Susan Park", avg: "$275/yr", years: "3 years", score: 71, badge: "Ready" },
  { name: "Linda Torres", avg: "$390/yr", years: "4 years", score: 89, badge: "High Readiness" },
];

const FINDINGS = [
  { text: "47 donors identified in the $250–$999 upgrade range", severity: "green" as const },
  { text: "12 flagged as high-readiness based on giving consistency and event engagement", severity: "amber" as const },
  { text: "8 donors have not been contacted in 90+ days — outreach recommended", severity: "red" as const },
];

const SIGNALS = [
  { text: "4 donors in upgraded cohort showing major gift capacity signals", color: "green" },
  { text: "2 prospects have board-adjacent relationships", color: "amber" },
  { text: "Top prospect: 8-year giving history, 6 events, est. capacity $25K+", color: "blue" },
  { text: "Next major gift review recommended: April 15", color: "slate", icon: true },
];

const ACTIVITY = [
  { time: "10:42 AM", text: "Scanned 3,847 donor records" },
  { time: "10:43 AM", text: "Identified 47 upgrade candidates" },
  { time: "10:43 AM", text: "Scored readiness for all 47 donors" },
  { time: "10:44 AM", text: "Flagged 4 donors with major gift signals" },
  { time: "10:44 AM", text: "Run complete — 12 high-readiness donors flagged" },
];

const SEVERITY_BG: Record<string, string> = {
  green: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300",
  amber: "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300",
  red: "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300",
};

const SIGNAL_BADGE: Record<string, string> = {
  green: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  amber: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  blue: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

const BADGE_STYLE: Record<string, string> = {
  "High Readiness": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  Ready: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
};

export default function MidDonorUpgradeDetail() {
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
          <span className="text-sm text-muted-foreground ml-2">Last run: 2 hours ago</span>
        </div>
        <Button size="sm" variant="outline" onClick={() => toastSuccess("Agent is running — results will appear shortly")}>
          <Play className="h-3.5 w-3.5 mr-1.5" /> Run Now
        </Button>
      </div>

      {/* Section 1 — Upgrade Pipeline (Recent Findings) */}
      <Card className="rounded-xl border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Upgrade Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {FINDINGS.map((f, i) => (
            <div key={i} className={`flex items-start gap-3 rounded-lg border p-3 ${SEVERITY_BG[f.severity]}`}>
              <p className="text-sm font-medium flex-1">{f.text}</p>
              <Badge variant="outline" className={`text-xs capitalize shrink-0 ${SEVERITY_BG[f.severity]}`}>
                {f.severity === "green" ? "info" : f.severity === "amber" ? "attention" : "action needed"}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Section 2 — Donor Signal List */}
      <Card className="rounded-xl border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" /> Donor Signal List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-left">
                  <th className="pb-2 font-medium">Donor</th>
                  <th className="pb-2 font-medium">Avg/yr</th>
                  <th className="pb-2 font-medium">Tenure</th>
                  <th className="pb-2 font-medium">Score</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {DONORS.map((d) => (
                  <tr key={d.name} className="border-b last:border-0">
                    <td className="py-3 font-medium text-foreground">{d.name}</td>
                    <td className="py-3 text-muted-foreground">{d.avg}</td>
                    <td className="py-3 text-muted-foreground">{d.years}</td>
                    <td className="py-3 font-semibold text-foreground">{d.score}</td>
                    <td className="py-3">
                      <Badge variant="secondary" className={`text-xs ${BADGE_STYLE[d.badge] ?? ""}`}>
                        {d.badge}
                      </Badge>
                    </td>
                    <td className="py-3 text-right">
                      <Button size="sm" variant="outline" onClick={() => toastSuccess(`Outreach task created for ${d.name}`)}>
                        Create Outreach Task
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Section 3 — Major Gift Signals */}
      <Card className="rounded-xl border-border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> Major Gift Signals
          </CardTitle>
          <p className="text-sm text-muted-foreground">Upgraded donors showing major gift potential</p>
          <p className="text-xs text-muted-foreground">Monitored automatically after $1,000 upgrade milestone</p>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SIGNALS.map((s, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
                {s.icon ? <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" /> : <div className={`h-2.5 w-2.5 rounded-full mt-1.5 shrink-0 ${s.color === "green" ? "bg-green-500" : s.color === "amber" ? "bg-amber-500" : s.color === "blue" ? "bg-blue-500" : "bg-slate-400"}`} />}
                <p className="text-sm text-foreground flex-1">{s.text}</p>
                <Badge variant="secondary" className={`text-xs shrink-0 ${SIGNAL_BADGE[s.color]}`}>
                  {s.color === "green" ? "signal" : s.color === "amber" ? "network" : s.color === "blue" ? "top prospect" : "scheduled"}
                </Badge>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={() => toastSuccess("Major Gift Review scheduled")}>
            <Calendar className="h-3.5 w-3.5 mr-1.5" /> Schedule Major Gift Review
          </Button>
        </CardContent>
      </Card>

      {/* Section 4 — Suggested Actions */}
      <Card className="rounded-xl border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Suggested Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {["Generate Outreach List", "Export to CSV", "Create Follow-Up Tasks", "Schedule Major Gift Review"].map((action) => (
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
