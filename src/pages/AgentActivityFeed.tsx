/**
 * Agent Activity Feed — /agents/activity
 *
 * Real-time log of all agent runs. Auto-refreshes every 30s.
 * Uses demo data consistent with the app's demo-mode pattern.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Bot, CheckCircle2, Loader2, XCircle, RefreshCw, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DEMO_AGENT_ACTIVITY, type AgentActivityRun } from "@/shared/data/nonprofitDemoData";

const statusConfig = {
  success: { icon: CheckCircle2, label: "Success", className: "text-green-600 bg-green-50 border-green-200 dark:bg-green-950/20" },
  running: { icon: Loader2, label: "Running", className: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/20" },
  failed: { icon: XCircle, label: "Failed", className: "text-red-600 bg-red-50 border-red-200 dark:bg-red-950/20" },
};

export default function AgentActivityFeed() {
  const navigate = useNavigate();
  const [runs, setRuns] = useState<AgentActivityRun[]>(DEMO_AGENT_ACTIVITY);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      setRuns([...DEMO_AGENT_ACTIVITY]);
      setLastRefresh(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRuns([...DEMO_AGENT_ACTIVITY]);
    setLastRefresh(new Date());
  };

  const successCount = runs.filter((r) => r.status === "success").length;
  const runningCount = runs.filter((r) => r.status === "running").length;
  const failedCount = runs.filter((r) => r.status === "failed").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Agent Activity Feed
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time log of all AI agent runs across the platform
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Last refresh: {lastRefresh.toLocaleTimeString()}
          </span>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-50 dark:bg-green-950/20 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{successCount}</p>
              <p className="text-xs text-muted-foreground">Successful Runs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center">
              <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{runningCount}</p>
              <p className="text-xs text-muted-foreground">Currently Running</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-50 dark:bg-red-950/20 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{failedCount}</p>
              <p className="text-xs text-muted-foreground">Failed Runs</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Recent Agent Runs</CardTitle>
          <CardDescription>Auto-refreshes every 30 seconds</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs.map((run) => {
                const sc = statusConfig[run.status];
                const StatusIcon = sc.icon;
                return (
                  <TableRow
                    key={run.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/agents/${run.agentSlug}`)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4 text-muted-foreground" />
                        {run.agentName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{run.team}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{run.action}</TableCell>
                    <TableCell className="text-sm max-w-[300px] truncate">{run.outcome}</TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{run.timestamp}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${sc.className}`}>
                        <StatusIcon className={`h-3 w-3 mr-1 ${run.status === "running" ? "animate-spin" : ""}`} />
                        {sc.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
