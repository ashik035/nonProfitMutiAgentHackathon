import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { icons, Sparkles, ArrowRight, Bot } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  allTeams,
  CATEGORY_COLORS,
  type AgentTeamDef,
  type AgentTeamAgent,
} from "@/components/ai/agentTeamConfig";
import { cn } from "@/lib/utils";

/* ── helpers ── */

function getIcon(name: string) {
  return (icons as Record<string, React.ComponentType<{ className?: string }>>)[name] ?? Bot;
}

function getCategoryForAgent(teamId: string) {
  return CATEGORY_COLORS[teamId] ?? CATEGORY_COLORS.general;
}

/* ── sub-components ── */

function BrowseSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-44 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

function OverlappingIcons({
  agents,
  gradientFrom,
  gradientTo,
  size = "lg",
}: {
  agents: AgentTeamAgent[];
  gradientFrom: string;
  gradientTo: string;
  size?: "sm" | "lg";
}) {
  const s = size === "lg" ? "w-12 h-12" : "w-10 h-10";
  const ring = size === "lg" ? "ring-3" : "ring-2";
  const ml = size === "lg" ? "-ml-3" : "-ml-2.5";
  const iconSize = size === "lg" ? "h-5 w-5" : "h-4 w-4";

  return (
    <div className="flex">
      {agents.slice(0, 4).map((a, i) => {
        const Icon = getIcon(a.icon);
        return (
          <div
            key={a.slug}
            className={cn(
              s,
              "rounded-full flex items-center justify-center text-primary-foreground",
              ring,
              "ring-background",
              i > 0 && ml
            )}
            style={{
              background: `linear-gradient(135deg, hsl(${gradientFrom}), hsl(${gradientTo}))`,
              zIndex: 4 - i,
            }}
            title={a.name}
          >
            <Icon className={iconSize} />
          </div>
        );
      })}
    </div>
  );
}

function TeamCard({ team, onClick }: { team: AgentTeamDef; onClick: () => void }) {
  return (
    <Card
      className={cn(
        "cursor-pointer overflow-hidden rounded-2xl border border-border transition-all duration-300 hover:shadow-xl",
        "border-b-4",
        team.accentColor
      )}
      onClick={onClick}
    >
      <CardContent className="p-6 space-y-4">
        <OverlappingIcons
          agents={team.agents}
          gradientFrom={team.gradientFrom}
          gradientTo={team.gradientTo}
        />
        <div>
          <h3 className="text-xl font-bold text-foreground">{team.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{team.tagline}</p>
        </div>
        <Button variant="outline" className="hover:bg-primary hover:text-primary-foreground transition-colors">
          Explore Team
        </Button>
      </CardContent>
    </Card>
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

  return (
    <Card className="overflow-hidden rounded-2xl border border-border transition-all duration-300 hover:shadow-xl">
      {/* gradient header */}
      <div
        className="h-24 relative"
        style={{
          background: `linear-gradient(135deg, hsl(${gradientFrom}), hsl(${gradientTo}))`,
        }}
      >
        <Badge
          className={cn("absolute top-3 right-3 text-[10px] px-2 py-0.5 font-medium border-0", cat.badge)}
        >
          {teamId}
        </Badge>
      </div>

      {/* icon overlapping header/body */}
      <div className="px-5 pt-0 pb-5">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center -mt-7 ring-4 ring-background bg-foreground/90 dark:bg-card text-primary-foreground dark:text-foreground shadow-lg"
          style={{
            background: `linear-gradient(135deg, hsl(${gradientFrom}), hsl(${gradientTo}))`,
          }}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>

        <div className="mt-3 space-y-1">
          <h4 className="text-lg font-semibold text-foreground">{agent.name}</h4>
          <p className="text-xs text-muted-foreground">By Nonprofit AI</p>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mt-2 line-clamp-2">
          {agent.description}
        </p>

        <Button
          variant="outline"
          className="w-full mt-4 hover:bg-primary hover:text-primary-foreground transition-colors"
          onClick={() => navigate(`/agents/${agent.slug}`)}
        >
          Learn More
        </Button>
      </div>
    </Card>
  );
}

function TeamDetailSection({ team }: { team: AgentTeamDef }) {
  const Icon = getIcon(team.agents[0]?.icon ?? "Bot");

  return (
    <section id={`team-${team.id}`} className="scroll-mt-24 space-y-5">
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow"
          style={{
            background: `linear-gradient(135deg, hsl(${team.gradientFrom}), hsl(${team.gradientTo}))`,
          }}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">{team.name}</h2>
          <p className="text-sm text-muted-foreground">{team.tagline}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {team.agents.map((agent) => (
          <AgentBrowseCard
            key={agent.slug}
            agent={agent}
            teamId={team.id}
            gradientFrom={team.gradientFrom}
            gradientTo={team.gradientTo}
          />
        ))}
      </div>
    </section>
  );
}

/* ── main page ── */

export default function AgentsBrowse() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "AI Agents | Nonprofit AI";
    const t = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  if (isLoading) return <BrowseSkeleton />;

  const scrollToTeam = (teamId: string) => {
    document.getElementById(`team-${teamId}`)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="space-y-10">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI Agents</h1>
          <p className="text-sm text-muted-foreground">
            Browse and run specialized AI agents across your workspace
          </p>
        </div>
      </div>

      {/* Team cards grid */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Agent Teams</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {allTeams.map((team) => (
            <TeamCard key={team.id} team={team} onClick={() => scrollToTeam(team.id)} />
          ))}
        </div>
      </div>

      {/* Team detail sections */}
      {allTeams.map((team) => (
        <TeamDetailSection key={team.id} team={team} />
      ))}
    </div>
  );
}
