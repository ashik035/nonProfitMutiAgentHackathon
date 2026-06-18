import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { icons, Sparkles, Bot, Clock, Play, Loader2, Eye, Activity, Zap } from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
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
  TEAM_BADGE_LABELS,
  type AgentTeamAgent,
  type AgentTeamDef,
} from "@/components/ai/agentTeamConfig";
import { cn } from "@/lib/utils";
import { hoursAgo } from "@/shared/data/nonprofitDemoData";
import { useNonprofitRolePermissions } from "@/hooks/useNonprofitRolePermissions";
import { useAgentOperationalStats } from "@/hooks/useAgentOperationalStats";
import { useMeetingSummarizer } from "@/hooks/useMeetingSummarizer";
import { useActionItemTracker } from "@/hooks/useActionItemTracker";
import { useExecutiveDailyBriefer } from "@/hooks/useExecutiveDailyBriefer";
import { useDonorChurnRisk } from "@/hooks/useDonorChurnRisk";
import { useStrategicInsights } from "@/hooks/useStrategicInsights";
import { BRIGHTSIDE_BOARD_MEETING_SAMPLE } from "@/shared/data/brightsideBoardMeetingSample";

const LIVE_OPERATIONAL_SLUGS = new Set([
  "meeting-intelligence",
  "action-item-tracker",
  "executive-daily-briefer",
  "donor-churn-risk",
  "strategic-insights",
]);

type AgentFilter = "all" | "live" | "findings";

/* ── activity banner messages ── */

const BANNER_MESSAGES = [
  "Meeting Summarizer: paste a board transcript and get structured minutes in under 30 seconds",
  "CRM Data Integrity Agent found 3 potential duplicate records — Sarah Chen and Michael Torres flagged",
  "Grant Compliance Agent: Kresge Foundation report due in 8 days — utilization at 61%",
  "Board Reporting Agent: Q1 Board Report draft ready — 3 KPIs need ED approval before export",
];

/* ── Core agent last-run times (dynamic) ── */
const CORE_LAST_RUN: Record<string, string> = {
  "meeting-intelligence": hoursAgo(0, 45),
  "action-item-tracker": hoursAgo(1, 12),
  "executive-daily-briefer": hoursAgo(2, 5),
  "donor-churn-risk": hoursAgo(3, 8),
  "strategic-insights": hoursAgo(4, 2),
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-72 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function getTeamBadgeLabel(teamId: string): string {
  return TEAM_BADGE_LABELS[teamId] ?? teamId;
}

function agentReviewCount(agent: AgentTeamAgent): number {
  return agent.operational?.itemsToReview ?? 0;
}

function sortAgentsByPriority(agents: AgentTeamAgent[]): AgentTeamAgent[] {
  return [...agents].sort((a, b) => {
    const aLive = LIVE_OPERATIONAL_SLUGS.has(a.slug) ? 1 : 0;
    const bLive = LIVE_OPERATIONAL_SLUGS.has(b.slug) ? 1 : 0;
    if (bLive !== aLive) return bLive - aLive;
    return agentReviewCount(b) - agentReviewCount(a);
  });
}

function matchesFilter(agent: AgentTeamAgent, filter: AgentFilter): boolean {
  if (filter === "live") return LIVE_OPERATIONAL_SLUGS.has(agent.slug);
  if (filter === "findings") return agentReviewCount(agent) > 0;
  return true;
}

function AgentBrowseCard({
  agent,
  teamId,
  teamBadgeLabel,
  gradientFrom,
  gradientTo,
  isLive,
}: {
  agent: AgentTeamAgent;
  teamId: string;
  teamBadgeLabel: string;
  gradientFrom: string;
  gradientTo: string;
  isLive: boolean;
}) {
  const navigate = useNavigate();
  const Icon = getIcon(agent.icon);
  const cat = getCategoryForAgent(teamId);
  const hasOperational = !!agent.operational;
  const coreLastRun = CORE_LAST_RUN[agent.slug];
  const liveStats = useAgentOperationalStats(agent.slug);
  const summarizer = useMeetingSummarizer();
  const actionTracker = useActionItemTracker();
  const dailyBriefer = useExecutiveDailyBriefer();
  const churnRisk = useDonorChurnRisk();
  const strategicInsights = useStrategicInsights();

  const [running, setRunning] = useState(false);
  const [lastRunOverride, setLastRunOverride] = useState<string | null>(null);

  const useLiveStats =
    LIVE_OPERATIONAL_SLUGS.has(agent.slug) &&
    (liveStats.lastFinding != null || liveStats.lastRunAt != null);
  const displayLastRun =
    lastRunOverride ??
    (useLiveStats && liveStats.lastRunLabel ? liveStats.lastRunLabel : null) ??
    coreLastRun ??
    hoursAgo(2, 6);
  const displayFindings = useLiveStats
    ? liveStats.itemsToReview
    : hasOperational
      ? agent.operational!.itemsToReview
      : 0;
  const displayTimeSavedHrs = useLiveStats
    ? liveStats.timeSavedHrs
    : hasOperational
      ? agent.operational!.timeSavedHrs
      : 0;
  const displayFindingText = useLiveStats
    ? liveStats.lastFinding
    : hasOperational
      ? agent.operational!.lastFinding
      : null;

  const handleRunNow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const goToDetail = (path: string, agentRunResult?: unknown) => {
      setLastRunOverride("just now");
      navigate(path, { state: agentRunResult ? { agentRunResult } : { autoRun: true } });
    };

    if (agent.slug === "meeting-intelligence") {
      if (running || summarizer.isPending) return;
      setRunning(true);
      try {
        const data = await summarizer.mutateAsync(BRIGHTSIDE_BOARD_MEETING_SAMPLE);
        goToDetail(`/agents/${agent.slug}`, data);
      } catch {
        goToDetail(`/agents/${agent.slug}`);
      } finally {
        setRunning(false);
      }
      return;
    }
    if (agent.slug === "action-item-tracker") {
      if (running || actionTracker.isPending) return;
      setRunning(true);
      try {
        const data = await actionTracker.mutateAsync();
        goToDetail(`/agents/${agent.slug}`, data);
      } catch {
        goToDetail(`/agents/${agent.slug}`);
      } finally {
        setRunning(false);
      }
      return;
    }
    if (agent.slug === "executive-daily-briefer") {
      if (running || dailyBriefer.isPending) return;
      setRunning(true);
      try {
        const data = await dailyBriefer.mutateAsync();
        goToDetail(`/agents/${agent.slug}`, data);
      } catch {
        goToDetail(`/agents/${agent.slug}`);
      } finally {
        setRunning(false);
      }
      return;
    }
    if (agent.slug === "donor-churn-risk") {
      if (running || churnRisk.isPending) return;
      setRunning(true);
      try {
        const data = await churnRisk.mutateAsync();
        goToDetail(`/agents/${agent.slug}`, data);
      } catch {
        goToDetail(`/agents/${agent.slug}`);
      } finally {
        setRunning(false);
      }
      return;
    }
    if (agent.slug === "strategic-insights") {
      if (running || strategicInsights.isPending) return;
      setRunning(true);
      try {
        const data = await strategicInsights.mutateAsync({ focus: "all" });
        goToDetail(`/agents/${agent.slug}`, data);
      } catch {
        goToDetail(`/agents/${agent.slug}`);
      } finally {
        setRunning(false);
      }
      return;
    }
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
    <Card
      className="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-md flex flex-col h-full min-w-0 cursor-pointer"
      onClick={() => navigate(`/agents/${agent.slug}`)}
    >
      {/* Gradient header + overlapping icon */}
      <div
        className="h-24 shrink-0 relative z-0"
        style={{
          background: `linear-gradient(90deg, hsl(${gradientFrom}), hsl(${gradientTo}))`,
        }}
      >
        <Badge
          className={cn(
            "absolute top-3 right-3 text-[10px] px-2 py-0.5 font-medium border-0 z-10",
            cat.badge
          )}
        >
          {teamBadgeLabel}
        </Badge>
        <div className="absolute -bottom-7 left-4 z-20 w-14 h-14 rounded-full flex items-center justify-center bg-slate-900 ring-4 ring-background shadow-md">
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>

      <div className="px-4 pb-4 pt-9 flex flex-col flex-1 min-w-0">
        {/* Title row */}
        <div className="flex items-center gap-2 min-w-0">
          <h4 className="text-sm font-semibold text-foreground leading-tight line-clamp-2">{agent.name}</h4>
          <ActivePulse />
        </div>

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {isLive ? (
            <Badge className="text-[10px] px-1.5 py-0 gap-0.5 bg-primary/10 text-primary border-primary/20">
              <Zap className="h-2.5 w-2.5" />
              Live
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
              Monitoring
            </Badge>
          )}
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            Last run: {displayLastRun}
          </span>
        </div>

        {displayFindingText ? (
          <p className="text-sm text-muted-foreground leading-relaxed mt-3 line-clamp-2 italic">
            &ldquo;{displayFindingText}&rdquo;
          </p>
        ) : hasOperational ? (
          <p className="text-sm text-muted-foreground leading-relaxed mt-3 line-clamp-2 italic">
            &ldquo;{agent.operational!.lastFinding}&rdquo;
          </p>
        ) : (
          <p className="text-sm text-muted-foreground leading-relaxed mt-3 line-clamp-2">
            {agent.description}
          </p>
        )}

        <div className="flex items-center gap-2 mt-3 text-[11px] text-muted-foreground flex-wrap">
          {displayFindings > 0 && (
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 font-medium bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
            >
              {displayFindings} {displayFindings === 1 ? "item" : "items"} to review
            </Badge>
          )}
          {(hasOperational || useLiveStats) && displayTimeSavedHrs > 0 && (
            <span>· Est. {displayTimeSavedHrs} hrs saved this week</span>
          )}
        </div>

        <div className="flex gap-1.5 mt-auto pt-3 min-w-0">
          <Button
            size="sm"
            className="flex-1 min-w-0 h-8 px-2 text-xs gap-1"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/agents/${agent.slug}`);
            }}
          >
            <Eye className="h-3 w-3 shrink-0" />
            <span className="truncate">
              {agent.slug === "meeting-intelligence"
                ? "Summarize"
                : agent.slug === "action-item-tracker"
                  ? "Track"
                  : agent.slug === "executive-daily-briefer"
                    ? "Brief"
                    : agent.slug === "donor-churn-risk"
                      ? "Scan"
                      : agent.slug === "strategic-insights"
                        ? "Insights"
                        : "View Findings"}
            </span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 min-w-0 h-8 px-2 text-xs gap-1"
            onClick={handleRunNow}
            disabled={running || summarizer.isPending || actionTracker.isPending || dailyBriefer.isPending || churnRisk.isPending || strategicInsights.isPending}
          >
            {running || summarizer.isPending || actionTracker.isPending || dailyBriefer.isPending || churnRisk.isPending || strategicInsights.isPending ? (
              <Loader2 className="h-3 w-3 shrink-0 animate-spin" />
            ) : (
              <Play className="h-3 w-3 shrink-0" />
            )}
            <span className="truncate">{running ? "Running…" : "Run Now"}</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}

function TeamSection({
  team,
  agents,
  filter,
}: {
  team: AgentTeamDef;
  agents: AgentTeamAgent[];
  filter: AgentFilter;
}) {
  const visibleAgents = sortAgentsByPriority(
    agents.filter((a) => matchesFilter(a, filter))
  );
  if (visibleAgents.length === 0) return null;

  const cat = CATEGORY_COLORS[team.id] ?? CATEGORY_COLORS.general;

  return (
    <section className="rounded-xl border border-border bg-card/50 overflow-hidden">
      <div
        className="h-1"
        style={{
          background: `linear-gradient(90deg, hsl(${team.gradientFrom}), hsl(${team.gradientTo}))`,
        }}
      />
      <div className="px-5 py-4 border-b border-border/60 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">{team.name}</h2>
            <Badge variant="secondary" className="text-[10px]">
              {visibleAgents.length} agent{visibleAgents.length === 1 ? "" : "s"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{team.tagline}</p>
        </div>
        <Badge className={cn("text-[10px] border-0", cat.badge)}>
          {getTeamBadgeLabel(team.id)}
        </Badge>
      </div>
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {visibleAgents.map((agent) => (
          <AgentBrowseCard
            key={agent.slug}
            agent={agent}
            teamId={team.id}
            teamBadgeLabel={getTeamBadgeLabel(team.id)}
            gradientFrom={team.gradientFrom}
            gradientTo={team.gradientTo}
            isLive={LIVE_OPERATIONAL_SLUGS.has(agent.slug)}
          />
        ))}
      </div>
    </section>
  );
}

function FilterTabs({
  filter,
  onChange,
  liveCount,
  findingsCount,
}: {
  filter: AgentFilter;
  onChange: (f: AgentFilter) => void;
  liveCount: number;
  findingsCount: number;
}) {
  const tabs: { id: AgentFilter; label: string; count?: number }[] = [
    { id: "all", label: "All agents" },
    { id: "live", label: "Live", count: liveCount },
    { id: "findings", label: "Needs review", count: findingsCount },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          size="sm"
          variant={filter === tab.id ? "default" : "outline"}
          className="h-8 text-xs"
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
          {tab.count != null && tab.count > 0 && (
            <Badge
              variant="secondary"
              className={cn(
                "ml-1.5 h-4 px-1 text-[10px] min-w-[1.25rem] justify-center",
                filter === tab.id && "bg-primary-foreground/20 text-primary-foreground"
              )}
            >
              {tab.count}
            </Badge>
          )}
        </Button>
      ))}
    </div>
  );
}

/* ── main page ── */

export default function AgentsBrowse() {
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<AgentFilter>("all");
  const { hasAgentPermission } = useNonprofitRolePermissions();

  useEffect(() => {
    document.title = "AI Agents | Brightside Foundation";
    const t = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const teamsWithAgents = useMemo(() => {
    return allTeams
      .map((team) => ({
        team,
        agents: team.agents.filter(
          (a) => !a.permissionKey || hasAgentPermission(a.permissionKey)
        ),
      }))
      .filter((entry) => entry.agents.length > 0);
  }, [hasAgentPermission]);

  const totalVisibleAgents = useMemo(
    () => teamsWithAgents.reduce((sum, { agents }) => sum + agents.length, 0),
    [teamsWithAgents]
  );

  const liveCount = useMemo(
    () =>
      teamsWithAgents.reduce(
        (sum, { agents }) =>
          sum + agents.filter((a) => LIVE_OPERATIONAL_SLUGS.has(a.slug)).length,
        0
      ),
    [teamsWithAgents]
  );

  const findingsCount = useMemo(
    () =>
      teamsWithAgents.reduce(
        (sum, { agents }) => sum + agents.filter((a) => agentReviewCount(a) > 0).length,
        0
      ),
    [teamsWithAgents]
  );

  const filteredTeamCount = useMemo(() => {
    return teamsWithAgents.filter(({ agents }) =>
      agents.some((a) => matchesFilter(a, filter))
    ).length;
  }, [teamsWithAgents, filter]);

  if (isLoading) return <BrowseSkeleton />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI Agents</h1>
            <p className="text-sm text-muted-foreground">
              {totalVisibleAgents} agents across {teamsWithAgents.length} teams · {liveCount} live
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 shrink-0" asChild>
          <Link to="/agents/activity">
            <Activity className="h-4 w-4" />
            Activity log
          </Link>
        </Button>
      </div>

      <ActivityBanner />

      <FilterTabs
        filter={filter}
        onChange={setFilter}
        liveCount={liveCount}
        findingsCount={findingsCount}
      />

      {filteredTeamCount === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No agents match this filter. Try &ldquo;All agents&rdquo; or check your role permissions.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {teamsWithAgents.map(({ team, agents }) => (
            <TeamSection key={team.id} team={team} agents={agents} filter={filter} />
          ))}
        </div>
      )}
    </div>
  );
}
