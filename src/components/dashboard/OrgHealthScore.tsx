import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { hoursAgo } from "@/shared/data/nonprofitDemoData";

export type HealthBreakdownItem = {
  label: string;
  value: number | string;
  percent: number;
  color: "green" | "amber" | "red";
};

interface OrgHealthScoreProps {
  score: number;
  scoreColor: "green" | "amber" | "red";
  breakdown: HealthBreakdownItem[];
  insight: string;
}

const COLOR_MAP = {
  green: {
    ring: "ring-green-200 dark:ring-green-900",
    text: "text-green-700 dark:text-green-400",
    bg: "bg-green-500",
    border: "border-l-green-500",
  },
  amber: {
    ring: "ring-amber-200 dark:ring-amber-900",
    text: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-500",
    border: "border-l-amber-500",
  },
  red: {
    ring: "ring-red-200 dark:ring-red-900",
    text: "text-red-700 dark:text-red-400",
    bg: "bg-red-500",
    border: "border-l-red-500",
  },
};

const PROGRESS_BG: Record<string, string> = {
  green: "[&>div]:bg-green-500",
  amber: "[&>div]:bg-amber-500",
  red: "[&>div]:bg-red-500",
};

// Stable timestamp computed once
const UPDATED_AGO = hoursAgo(1, 3);

export default function OrgHealthScore({ score, scoreColor, breakdown, insight }: OrgHealthScoreProps) {
  const c = COLOR_MAP[scoreColor];

  return (
    <Card className={`border-l-4 ${c.border}`}>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          {/* Score circle */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center ring-4 ${c.ring} bg-background`}
            >
              <span className={`text-4xl font-bold ${c.text}`}>{score}</span>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">Org Health Score</p>
              <p className="text-[11px] text-muted-foreground">
                Updated {UPDATED_AGO} · Brightside Foundation
              </p>
            </div>
          </div>

          {/* Breakdown grid */}
          <div className="flex-1 grid grid-cols-2 gap-4">
            {breakdown.map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-medium text-foreground">{item.value}</span>
                </div>
                <Progress
                  value={item.percent}
                  className={`h-2 ${PROGRESS_BG[item.color]}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Insight line */}
        <p className="text-sm text-muted-foreground mt-4 border-t border-border pt-3">
          {insight}
        </p>
      </CardContent>
    </Card>
  );
}
