import { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { icons, Sparkles, ArrowLeft, ArrowRight, Zap, BookOpen, MapPin, Bot, Clock } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { findAgentBySlug, CATEGORY_COLORS } from "@/components/ai/agentTeamConfig";
import { cn } from "@/lib/utils";
import MidDonorUpgradeDetail from "@/components/ai/agents/MidDonorUpgradeDetail";
import DonorLapseDetectionDetail from "@/components/ai/agents/DonorLapseDetectionDetail";
import CRMDataIntegrityDetail from "@/components/ai/agents/CRMDataIntegrityDetail";
import ReconciliationDetail from "@/components/ai/agents/ReconciliationDetail";
import GrantComplianceDetail from "@/components/ai/agents/GrantComplianceDetail";
import EventIntelligenceDetail from "@/components/ai/agents/EventIntelligenceDetail";
import BoardReportingDetail from "@/components/ai/agents/BoardReportingDetail";
import MeetingIntelligenceDetail from "@/components/ai/agents/MeetingIntelligenceDetail";
import ActionItemTrackerDetail from "@/components/ai/agents/ActionItemTrackerDetail";
import ExecutiveDailyBrieferDetail from "@/components/ai/agents/ExecutiveDailyBrieferDetail";
import DonorChurnRiskDetail from "@/components/ai/agents/DonorChurnRiskDetail";
import StrategicInsightsDetail from "@/components/ai/agents/StrategicInsightsDetail";

function getIcon(name: string) {
  return (icons as Record<string, React.ComponentType<{ className?: string }>>)[name] ?? Bot;
}

export default function AgentDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const result = slug ? findAgentBySlug(slug) : undefined;

  useEffect(() => {
    document.title = result
      ? `${result.agent.name} | AI Agents | Nonprofit AI`
      : "Agent Not Found | Nonprofit AI";
  }, [result]);

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <Bot className="h-12 w-12 text-muted-foreground" />
        <h1 className="text-xl font-semibold text-foreground">Agent not found</h1>
        <Button variant="outline" onClick={() => navigate("/agents")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Agents
        </Button>
      </div>
    );
  }

  const { agent, team } = result;
  const Icon = getIcon(agent.icon);
  const cat = CATEGORY_COLORS[team.id] ?? CATEGORY_COLORS.general;
  const siblings = team.agents.filter((a) => a.slug !== agent.slug);

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Button variant="ghost" size="sm" onClick={() => navigate("/agents")} className="gap-1.5">
        <ArrowLeft className="h-4 w-4" /> All Agents
      </Button>

      {/* Hero */}
      <Card className="overflow-hidden rounded-2xl border border-border shadow-sm">
        <div
          className="h-[132px] sm:h-[148px] relative"
          style={{
            background: `linear-gradient(90deg, hsl(${team.gradientFrom}), hsl(${team.gradientTo}))`,
          }}
        >
          <div
            className="absolute -left-6 top-2 h-32 w-32 rounded-full opacity-20"
            style={{ background: "white" }}
          />
          <div
            className="absolute right-12 top-4 h-24 w-24 rounded-full opacity-15"
            style={{ background: "white" }}
          />
        </div>

        <div className="bg-card px-6 pb-6">
          {/* Icon overlapping the banner, left aligned */}
          <div
            className="relative z-20 -mt-6 w-[72px] h-[72px] rounded-2xl flex items-center justify-center ring-4 ring-background shadow-lg"
            style={{
              background: `linear-gradient(135deg, hsl(${team.gradientFrom}), hsl(${team.gradientTo}))`,
            }}
          >
            <Icon className="h-8 w-8 text-white" />
          </div>

          {/* Title block below the icon, CTA on the right */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{agent.name}</h1>
              <Badge variant="secondary" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                Part of {team.name}
              </Badge>
              <p className="text-base text-muted-foreground max-w-xl leading-relaxed">
                {agent.description}
              </p>
            </div>

            {agent.whereToFind && (
              <Button
                className="hidden sm:flex gap-2 shrink-0 shadow-sm"
                onClick={() => navigate(agent.whereToFind!.path)}
                style={{
                  background: `linear-gradient(135deg, hsl(${team.gradientFrom}), hsl(${team.gradientTo}))`,
                }}
              >
                Go to {agent.whereToFind.label}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Mobile CTA */}
          {agent.whereToFind && (
            <Button
              className="w-full mt-4 sm:hidden gap-2 shadow-sm"
              onClick={() => navigate(agent.whereToFind!.path)}
              style={{
                background: `linear-gradient(135deg, hsl(${team.gradientFrom}), hsl(${team.gradientTo}))`,
              }}
            >
              Go to {agent.whereToFind.label}
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </Card>

      {/* Custom detail pages for specific agents */}
      {slug === "crm-data-integrity" ? (
        <CRMDataIntegrityDetail />
      ) : slug === "reconciliation-fund-accounting" ? (
        <ReconciliationDetail />
      ) : slug === "grant-compliance" ? (
        <GrantComplianceDetail />
      ) : slug === "event-intelligence" ? (
        <EventIntelligenceDetail />
      ) : slug === "board-reporting" ? (
        <BoardReportingDetail />
      ) : slug === "meeting-intelligence" ? (
        <MeetingIntelligenceDetail />
      ) : slug === "action-item-tracker" ? (
        <ActionItemTrackerDetail />
      ) : slug === "executive-daily-briefer" ? (
        <ExecutiveDailyBrieferDetail />
      ) : slug === "donor-churn-risk" ? (
        <DonorChurnRiskDetail />
      ) : slug === "strategic-insights" ? (
        <StrategicInsightsDetail />
      ) : slug === "mid-donor-upgrade" ? (
        <MidDonorUpgradeDetail />
      ) : slug === "donor-lapse-detection" ? (
        <DonorLapseDetectionDetail />
      ) : (
        /* Content grid — default layout */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-4">
            <Accordion type="multiple" defaultValue={["capabilities", "how-to-use", "where"]}>
              {/* Capabilities */}
              {agent.capabilities && agent.capabilities.length > 0 && (
                <AccordionItem value="capabilities" className="border rounded-xl px-5 bg-card shadow-sm">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      <span className="font-semibold">What this agent does</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ol className="space-y-3">
                      {agent.capabilities.map((cap, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                            style={{
                              background: `linear-gradient(135deg, hsl(${team.gradientFrom}), hsl(${team.gradientTo}))`,
                            }}
                          >
                            {i + 1}
                          </span>
                          <span className="text-sm text-foreground leading-relaxed">{cap}</span>
                        </li>
                      ))}
                    </ol>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* How to use */}
              {agent.howToUse && agent.howToUse.length > 0 && (
                <AccordionItem value="how-to-use" className="border rounded-xl px-5 bg-card shadow-sm mt-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span className="font-semibold">How to use it</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ol className="space-y-3">
                      {agent.howToUse.map((step, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold bg-muted text-muted-foreground">
                            {i + 1}
                          </span>
                          <span className="text-sm text-foreground leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Where to find */}
              {agent.whereToFind && (
                <AccordionItem value="where" className="border rounded-xl px-5 bg-card shadow-sm mt-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="font-semibold">Where to find it</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      This agent is available in the{" "}
                      <Link to={agent.whereToFind.path} className="text-primary font-medium hover:underline">
                        {agent.whereToFind.label}
                      </Link>{" "}
                      section.
                    </p>
                    <Button size="sm" variant="outline" onClick={() => navigate(agent.whereToFind!.path)}>
                      Go to {agent.whereToFind.label}
                      <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>

            {/* Recent Activity Log */}
            <Card className="rounded-xl border-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Recent Activity Log
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { time: "10:42 AM", text: "Scanned 3,847 donor records" },
                  { time: "10:43 AM", text: "Identified 47 upgrade candidates" },
                  { time: "10:43 AM", text: "Scored readiness for 47 donors" },
                  { time: "10:44 AM", text: "Generated outreach priority list" },
                  { time: "10:44 AM", text: "Run complete — 12 high-readiness donors flagged" },
                ].map((a, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <span className="text-muted-foreground font-mono text-xs mt-0.5 shrink-0 w-16">{a.time}</span>
                    <span className="text-foreground">{a.text}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Info card */}
            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Agent Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Built by</p>
                  <p className="font-medium text-foreground">Nonprofit AI</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Team</p>
                  <Link to="/agents" className="flex items-center gap-2 mt-1 group">
                    <div
                      className="w-6 h-6 rounded flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, hsl(${team.gradientFrom}), hsl(${team.gradientTo}))`,
                      }}
                    >
                      <Sparkles className="h-3 w-3 text-white" />
                    </div>
                    <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {team.name}
                    </span>
                  </Link>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Category</p>
                  <Badge className={cn("mt-1 border-0", cat.badge)}>{team.id}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Related agents */}
            {siblings.length > 0 && (
              <Card className="rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Other agents in this team
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {siblings.map((sib) => {
                    const SibIcon = getIcon(sib.icon);
                    return (
                      <Link
                        key={sib.slug}
                        to={`/agents/${sib.slug}`}
                        className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted transition-colors"
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{
                            background: `linear-gradient(135deg, hsl(${team.gradientFrom} / 0.15), hsl(${team.gradientTo} / 0.15))`,
                          }}
                        >
                          <SibIcon className="h-4 w-4 text-foreground" />
                        </div>
                        <span className="text-sm font-medium text-foreground">{sib.name}</span>
                      </Link>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
