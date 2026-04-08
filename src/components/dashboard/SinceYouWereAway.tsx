import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

export interface DigestAction {
  label: string;
  href: string;
}

interface SinceYouWereAwayProps {
  lastLoginAgo: string;
  summary: string;
  actions: DigestAction[];
}

export default function SinceYouWereAway({ lastLoginAgo, summary, actions }: SinceYouWereAwayProps) {
  return (
    <Card>
      <CardContent className="p-6 relative">
        <Badge
          className="absolute top-4 right-4 bg-primary/10 text-primary border-0 text-[10px] px-2 py-0.5 gap-1"
        >
          <Sparkles className="h-3 w-3" />
          AI
        </Badge>

        <p className="text-sm font-medium text-muted-foreground mb-2">
          Since your last login · {lastLoginAgo}
        </p>

        <p className="text-sm text-foreground leading-relaxed">
          {summary}
        </p>

        <div className="flex flex-wrap gap-2 mt-4">
          {actions.map((action) => (
            <Link
              key={action.href}
              to={action.href}
              className="inline-flex items-center rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
            >
              {action.label}
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
