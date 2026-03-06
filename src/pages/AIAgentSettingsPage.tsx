import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Settings } from "lucide-react";
import { DEMO_AGENTS } from "@/shared/data/nonprofitDemoData";

export default function AIAgentSettingsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const agent = DEMO_AGENTS.find((a) => a.id === id);

  return (
    <div className="space-y-6 pt-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/ai-agents/${id}`)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Configure {agent?.name || "Agent"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Agent configuration settings
          </p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm rounded-xl">
        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Settings className="h-12 w-12 mb-4 opacity-40" />
          <p className="text-lg font-medium">Configuration Coming Soon</p>
          <p className="text-sm mt-1">
            Agent settings and scheduling will be available in a future update.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
