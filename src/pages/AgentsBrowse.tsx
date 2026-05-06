import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { icons, Sparkles, Bot, Clock, Play, Loader2, Eye } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  allTeams,
  CATEGORY_COLORS,
  type AgentTeamAgent,
} from "@/components/ai/agentTeamConfig";
import { cn } from "@/lib/utils";
import { hoursAgo } from "@/shared/data/nonprofitDemoData";
import { useNonprofitRolePermissions } from "@/hooks/useNonprofitRolePermissions";

/* ── activity banner messages ── */

const BANNER_MESSAGES = [
  "CRM Data Integrity Agent found 3 potential duplicate records — Sarah Chen and Michael Torres flagged",
  "Grant Compliance Agent: Kresge Foundation report due in 8 days — utilization at 61%",
  "Board Reporting Agent: Q1 Board Report draft ready — 3 KPIs need ED approval before export",
];

/* ── Core agent last-run times (dynamic) ── */
const CORE_LAST_RUN: Record<string, string> = {
  "crm-data-integrity": hoursAgo(1, 3),
  "reconciliation-fund-accounting": hoursAgo(3, 5),
  "grant-compliance": hoursAgo(2, 4),
  "event-intelligence": hoursAgo(5, 7),
  "board-reporting": hoursAgo(1, 2),
  "grant-budget-watcher": hoursAgo(2, 4),
  "integration-health-monitor": hoursAgo(1, 3),
  "onboarding-checklist-ai": hoursAgo(4, 8),
};

/* ── helpers ── */

function getIcon(name: string) {
  return (icons as Record<string, React.ComponentType<{ className?: string }>>)[name] ?? Bot;
}

function getCategoryForAgent(teamId: string) {
  return CATEGORY_COLORS[teamId] ?? CATEGORY_COLORS.general;
}

/* ── sub-components ── */

function ActivityBanner() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % BANNER_MESSAGES.length);
        setVisible(true);
      }, 300);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 flex items-center gap-3 overflow-hidden">
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>
      <p
        className={cn(
          "text-sm text-muted-foreground transition-all duration-300",
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
        )}
      >
        {BANNER_MESSAGES[index]}
      </p>
    </div>
  );
}

function ActivePulse() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="relative flex h-2.5 w-2.5 cursor-default">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">Agent is running</TooltipContent>
    </Tooltip>
  );
}

function BrowseSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-12 w-full rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-44 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

function AgentBrowseCard({
  agent,
  teamId,
  gradientFrom,
  gradientTo,
}: {
  agent: AgentTeamAgent;
  teamId: string;
  gradientFrom: string;
  gradientTo: string;
}) {
  const navigate = useNavigate();
  const Icon = getIcon(agent.icon);
  const cat = getCategoryForAgent(teamId);
  const hasOperational = !!agent.operational;
  const coreLastRun = CORE_LAST_RUN[agent.slug];

  const [running, setRunning] = useState(false);
  const [lastRunOverride, setLastRunOverride] = useState<string | null>(null);

  const displayLastRun = lastRunOverride ?? coreLastRun ?? hoursAgo(2, 6);
  const displayFindings = hasOperational ? agent.operational!.itemsToReview : 0;

  const handleRunNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (running) return;
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
      setLastRunOverride("just now");
      toast.success(`Run complete — ${displayFindings} findings`, {
        description: agent.name,
      });
    }, 1500);
  };

  return (
    <Card className="overflow-hidden rounded-2xl border border-border transition-all duration-300 hover:shadow-xl">
      <div
        className="h-20 relative"
        style={{
          background: `linear-gradient(135deg, hsl(${gradientFrom}), hsl(${gradientTo}))`,
        }}
      >
        <Badge
          className={cn("absolute top-3 right-3 text-[10px] px-2 py-0.5 font-medium border-0", cat.badge)}
        >
          Core Ops
        </Badge>
      </div>

      <div className="px-5 pt-0 pb-5">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center -mt-7 ring-4 ring-background shadow-lg"
          style={{
            background: `linear-gradient(135deg, hsl(${gradientFrom}), hsl(${gradientTo}))`,
          }}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>

        <div className="mt-3 space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="text-base font-semibold text-foreground leading-tight">{agent.name}</h4>
            <ActivePulse />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-green-600 border-green-200 bg-green-50 dark:bg-green-950/20">
              Active
            </Badge>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              Last run: {displayLastRun}
            </span>
          </div>
        </div>

        {hasOperational ? (
          <p className="text-sm text-muted-foreground leading-relaxed mt-3 line-clamp-2 italic">
            &ldquo;{agent.operational!.lastFinding}&rdquo;
          </p>
        ) : (
          <p className="text-sm text-muted-foreground leading-relaxed mt-3 line-clamp-2">
            {agent.description}
          </p>
        )}

        <div className="flex items-center gap-2 mt-3 text-[11px] text-muted-foreground">
          {displayFindings > 0 && (
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 font-medium bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
            >
              {displayFindings} {displayFindings === 1 ? "item" : "items"} to review
            </Badge>
          )}
          {hasOperational && (
            <span>· Est. {agent.operational!.timeSavedHrs} hrs saved this week</span>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            className="flex-1 gap-1.5"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/agents/${agent.slug}`);
            }}
          >
            <Eye className="h-3.5 w-3.5" />
            View Findings
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={handleRunNow}
            disabled={running}
          >
            {running ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
            {running ? "Running…" : "Run Now"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

/* ── main page ── */

export default function AgentsBrowse() {
  const [isLoading, setIsLoading] = useState(true);
  const { hasAgentPermission } = useNonprofitRolePermissions();

  useEffect(() => {
    document.title = "AI Agents | Brightside Foundation";
    const t = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const team = allTeams[0];

  // Filter agents based on role permissions (agents without permissionKey always show)
  const visibleAgents = useMemo(
    () => team.agents.filter((a) => !a.permissionKey || hasAgentPermission(a.permissionKey)),
    [team.agents, hasAgentPermission]
  );

  if (isLoading) return <BrowseSkeleton />;

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI Agents</h1>
          <p className="text-sm text-muted-foreground">
            {visibleAgents.length} agents actively monitoring your operations
          </p>
        </div>
      </div>

      <ActivityBanner />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {visibleAgents.map((agent) => (
          <AgentBrowseCard
            key={agent.slug}
            agent={agent}
            teamId={team.id}
            gradientFrom={team.gradientFrom}
            gradientTo={team.gradientTo}
          />
        ))}
      </div>
    </div>
  );
}
