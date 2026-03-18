import { useNavigate } from "react-router-dom";
import { icons, Sparkles, ArrowRight, Bot } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { allTeams, type AgentTeamDef } from "@/components/ai/agentTeamConfig";
import { cn } from "@/lib/utils";

function getIcon(name: string) {
  return (icons as Record<string, React.ComponentType<{ className?: string }>>)[name] ?? Bot;
}

function TeamMiniCard({ team }: { team: AgentTeamDef }) {
  const navigate = useNavigate();

  return (
    <div
      className={cn(
        "min-w-[240px] flex-shrink-0 rounded-2xl border border-border bg-card overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg",
        "border-b-4",
        team.accentColor
      )}
      onClick={() => navigate("/agents")}
    >
      {/* Gradient strip */}
      <div
        className="h-2"
        style={{
          background: `linear-gradient(90deg, hsl(${team.gradientFrom}), hsl(${team.gradientTo}))`,
        }}
      />

      <div className="p-4 space-y-3">
        {/* Overlapping icons */}
        <div className="flex">
          {team.agents.slice(0, 4).map((a, i) => {
            const Icon = getIcon(a.icon);
            return (
              <div
                key={a.slug}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-white ring-2 ring-background",
                  i > 0 && "-ml-2.5"
                )}
                style={{
                  background: `linear-gradient(135deg, hsl(${team.gradientFrom}), hsl(${team.gradientTo}))`,
                  zIndex: 4 - i,
                }}
              >
                <Icon className="h-4 w-4" />
              </div>
            );
          })}
        </div>

        <div>
          <p className="text-sm font-bold text-foreground">{team.name}</p>
          <p className="text-xs text-muted-foreground">{team.agents.length} agents</p>
        </div>

        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:gap-2 transition-all">
          Explore <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </div>
  );
}

export default function AITeamsDashboardCard() {
  const navigate = useNavigate();
  const totalAgents = allTeams.reduce((sum, t) => sum + t.agents.length, 0);

  return (
    <Card className="rounded-2xl border-primary/20 overflow-hidden relative">
      {/* Subtle rainbow overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          background:
            "linear-gradient(135deg, hsl(280 70% 50%), hsl(190 80% 45%), hsl(30 90% 50%), hsl(150 70% 40%))",
        }}
      />

      <CardHeader className="relative pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">Your AI Team</CardTitle>
        </div>
        <CardDescription>
          {totalAgents} specialized agents across {allTeams.length} teams
        </CardDescription>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {/* Horizontal scroll */}
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
          {allTeams.map((team) => (
            <TeamMiniCard key={team.id} team={team} />
          ))}
        </div>

        <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => navigate("/agents")}>
          Browse All Agents <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </CardContent>
    </Card>
  );
}
