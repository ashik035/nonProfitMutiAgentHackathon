import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { icons, Sparkles, ChevronDown, ChevronUp, ArrowRight, Bot } from "lucide-react";

import { Button } from "@/components/ui/button";
import { agentTeams, type AgentTeamDef } from "@/components/ai/agentTeamConfig";
import { cn } from "@/lib/utils";

function getIcon(name: string) {
  return (icons as Record<string, React.ComponentType<{ className?: string }>>)[name] ?? Bot;
}

interface AgentTeamBannerProps {
  teamId: string;
  className?: string;
}

export default function AgentTeamBanner({ teamId, className }: AgentTeamBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const team: AgentTeamDef | undefined = agentTeams[teamId];

  if (!team) return null;

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card overflow-hidden border-b-4 transition-all",
        team.accentColor,
        className
      )}
    >
      {/* Collapsed header */}
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors"
      >
        {/* Overlapping icons */}
        <div className="flex shrink-0">
          {team.agents.slice(0, 4).map((a, i) => {
            const Icon = getIcon(a.icon);
            return (
              <div
                key={a.slug}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-white ring-2 ring-background",
                  i > 0 && "-ml-2"
                )}
                style={{
                  background: `linear-gradient(135deg, hsl(${team.gradientFrom}), hsl(${team.gradientTo}))`,
                  zIndex: 4 - i,
                }}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
            );
          })}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="text-sm font-bold text-foreground truncate">{team.name}</span>
          </div>
          <p className="text-xs text-muted-foreground truncate">{team.tagline}</p>
        </div>

        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {team.agents.map((agent) => {
              const AgentIcon = getIcon(agent.icon);
              return (
                <div
                  key={agent.slug}
                  className="min-w-[200px] flex-shrink-0 rounded-xl border border-border bg-background p-3 cursor-pointer hover:shadow-md transition-all"
                  onClick={() => navigate(`/agents/${agent.slug}`)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                      style={{
                        background: `linear-gradient(135deg, hsl(${team.gradientFrom}), hsl(${team.gradientTo}))`,
                      }}
                    >
                      <AgentIcon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">{agent.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{agent.description}</p>
                  <span className="inline-flex items-center gap-1 text-xs text-primary font-medium mt-2">
                    Learn more <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
