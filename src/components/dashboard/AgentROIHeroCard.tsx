import { Bot, Clock, DollarSign, Sparkles } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { AgencyRole } from "@/hooks/useAgencyRole";
import {
  formatDollarValue,
  formatHoursSaved,
  getAgentROIStats,
  NONPROFIT_STAFF_HOURLY_RATE,
} from "@/lib/agentRoi";

interface AgentROIHeroCardProps {
  role: Exclude<AgencyRole, "admin">;
}

export default function AgentROIHeroCard({ role }: AgentROIHeroCardProps) {
  const { hoursSaved, dollarValue, agentRunCount, agentCount } = getAgentROIStats(role);
  const hoursLabel = formatHoursSaved(hoursSaved);

  return (
    <Card className="ai-card relative overflow-hidden border-primary/20 shadow-ai">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          background:
            "linear-gradient(135deg, hsl(var(--ai-gradient-start)), hsl(var(--ai-gradient-end)))",
        }}
      />

      <CardContent className="relative p-6 lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ai-gradient text-white shadow-ai">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">AI ROI this week</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
                Your AI agents saved{" "}
                <span className="ai-gradient-text">{hoursLabel} hours</span> this week
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {agentRunCount} successful run{agentRunCount === 1 ? "" : "s"} across {agentCount} role-relevant agent{agentCount === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:min-w-[280px]">
            <div className="rounded-lg border border-primary/10 bg-background/80 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Est. value</span>
              </div>
              <p className="mt-2 text-xl font-semibold text-foreground">
                {formatDollarValue(dollarValue)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                at ${NONPROFIT_STAFF_HOURLY_RATE}/hr staff rate
              </p>
            </div>
            <div className="rounded-lg border border-primary/10 bg-background/80 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Bot className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Agent runs</span>
              </div>
              <p className="mt-2 text-xl font-semibold text-foreground">{agentRunCount}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                this month
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
