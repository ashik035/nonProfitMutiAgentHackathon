/**
 * AIActivityWidget
 *
 * Small dashboard card showing the last 5 agent runs.
 * Clicking "View All" navigates to /agents/activity.
 */

import { useNavigate } from "react-router-dom";
import { Bot, CheckCircle2, Loader2, XCircle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DEMO_AGENT_ACTIVITY } from "@/shared/data/nonprofitDemoData";

const statusIcons = {
  success: { icon: CheckCircle2, className: "text-green-500" },
  running: { icon: Loader2, className: "text-blue-500 animate-spin" },
  failed: { icon: XCircle, className: "text-red-500" },
};

export default function AIActivityWidget() {
  const navigate = useNavigate();
  const recentRuns = DEMO_AGENT_ACTIVITY.slice(0, 5);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">AI Agent Activity</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={() => navigate("/agents/activity")}
          >
            View All
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
        <CardDescription>Latest agent runs across the platform</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {recentRuns.map((run) => {
          const si = statusIcons[run.status];
          const StatusIcon = si.icon;
          return (
            <div
              key={run.id}
              className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => navigate("/agents/activity")}
            >
              <StatusIcon className={`h-4 w-4 shrink-0 ${si.className}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{run.agentName}</p>
                <p className="text-xs text-muted-foreground truncate">{run.outcome}</p>
              </div>
              <span className="text-[11px] text-muted-foreground whitespace-nowrap">{run.timestamp}</span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
