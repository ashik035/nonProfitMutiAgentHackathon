import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export interface QuickStat {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
}

interface QuickStatsRowProps {
  stats: QuickStat[];
}

export default function QuickStatsRow({ stats }: QuickStatsRowProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-5">
            <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            {stat.change && (
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                {stat.positive && <TrendingUp className="h-3 w-3 text-green-600" />}
                <span>{stat.change}</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
