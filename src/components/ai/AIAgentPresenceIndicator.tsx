import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIAgentPresenceIndicatorProps {
  agentName: string;
  agentSlug: string;
  gradientFrom?: string;
  gradientTo?: string;
  className?: string;
}

export default function AIAgentPresenceIndicator({
  agentName,
  agentSlug,
  gradientFrom = "199 89% 48%",
  gradientTo = "187 100% 42%",
  className,
}: AIAgentPresenceIndicatorProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/agents/${agentSlug}`)}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border bg-card shadow-sm px-3 py-1.5 transition-all hover:shadow-md animate-fade-in cursor-pointer",
        className
      )}
      style={{ borderColor: `hsl(${gradientFrom} / 0.3)` }}
    >
      {/* Pulsing dot */}
      <span className="relative flex h-2.5 w-2.5">
        <span
          className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
          style={{ background: `hsl(${gradientFrom})` }}
        />
        <span
          className="relative inline-flex h-2.5 w-2.5 rounded-full"
          style={{ background: `hsl(${gradientFrom})` }}
        />
      </span>

      <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />

      <span className="text-xs font-medium text-foreground">{agentName}</span>

      <span className="text-[10px] text-muted-foreground font-medium px-1.5 py-0.5 rounded bg-muted">
        AI
      </span>
    </button>
  );
}
