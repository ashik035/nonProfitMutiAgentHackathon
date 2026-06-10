/**
 * Member Engagement — /engagement-scoring
 *
 * Member engagement scores, lapse risk detection, predicted renewal likelihood,
 * and AI-suggested next best actions per member. Scoped to members —
 * donor engagement scores surface in Donor Retention and the unified
 * donor profile instead.
 * Engagement scores computed from demo data; AI suggestions via edge function.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Sparkles, TrendingDown, TrendingUp, Users, AlertTriangle,
  CheckCircle2, Clock, Heart, Target, Zap, ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";

// ── Types ─────────────────────────────────────────────────────────

type EngagementTier = "Active" | "At Risk" | "Lapsed";
type RenewalLikelihood = "High" | "Medium" | "Low";

interface EngagementSignal {
  label: string;
  value: string;
  positive: boolean;
}

interface ScoredMember {
  id: string;
  name: string;
  email: string;
  memberType: "Member" | "Donor" | "Volunteer";
  engagementScore: number;          // 0–100
  tier: EngagementTier;
  renewalLikelihood: RenewalLikelihood;
  lastActivity: string;
  signals: EngagementSignal[];
  suggestedAction?: string;         // populated after AI call
  isLoadingAction?: boolean;
}

// ── Demo Data ─────────────────────────────────────────────────────

const SCORED_MEMBERS: ScoredMember[] = [
  // Active — High engagement
  { id: "sm-01", name: "Angela Torres", email: "angela.torres@email.com", memberType: "Volunteer", engagementScore: 94, tier: "Active", renewalLikelihood: "High", lastActivity: "2 days ago",
    signals: [
      { label: "Events attended", value: "8 this year", positive: true },
      { label: "Volunteer shifts", value: "12 completed", positive: true },
      { label: "Donations", value: "$4,800 lifetime", positive: true },
      { label: "Email open rate", value: "87%", positive: true },
    ]},
  { id: "sm-02", name: "Patricia Lee", email: "p.lee@brightsideboard.org", memberType: "Member", engagementScore: 91, tier: "Active", renewalLikelihood: "High", lastActivity: "1 week ago",
    signals: [
      { label: "Board meetings", value: "All attended", positive: true },
      { label: "Events attended", value: "6 this year", positive: true },
      { label: "Donations", value: "$12,000+ lifetime", positive: true },
      { label: "Committees", value: "2 active", positive: true },
    ]},
  { id: "sm-03", name: "Lisa Chen", email: "lisa.chen@email.com", memberType: "Donor", engagementScore: 88, tier: "Active", renewalLikelihood: "High", lastActivity: "2 weeks ago",
    signals: [
      { label: "Giving frequency", value: "Monthly recurring", positive: true },
      { label: "Events attended", value: "5 this year", positive: true },
      { label: "Volunteer hours", value: "420 hrs", positive: true },
      { label: "Latest gift", value: "$10,000", positive: true },
    ]},
  { id: "sm-04", name: "Kevin Park", email: "kevin.park@kpmg.com", memberType: "Member", engagementScore: 79, tier: "Active", renewalLikelihood: "High", lastActivity: "3 weeks ago",
    signals: [
      { label: "Events attended", value: "4 this year", positive: true },
      { label: "Donations", value: "$2,000 this year", positive: true },
      { label: "Email open rate", value: "71%", positive: true },
      { label: "Committees", value: "1 active", positive: true },
    ]},
  { id: "sm-05", name: "Aisha Patel", email: "aisha.patel@email.com", memberType: "Volunteer", engagementScore: 76, tier: "Active", renewalLikelihood: "High", lastActivity: "1 week ago",
    signals: [
      { label: "Volunteer shifts", value: "9 completed", positive: true },
      { label: "Events attended", value: "3 this year", positive: true },
      { label: "Donations", value: "$3,600 lifetime", positive: true },
      { label: "Skills shared", value: "Photography + Mentoring", positive: true },
    ]},
  // At Risk — Declining engagement
  { id: "sm-06", name: "Thomas Rivera", email: "t.rivera@email.com", memberType: "Member", engagementScore: 48, tier: "At Risk", renewalLikelihood: "Medium", lastActivity: "6 weeks ago",
    signals: [
      { label: "Events attended", value: "1 this year (was 4)", positive: false },
      { label: "Email open rate", value: "22% (was 65%)", positive: false },
      { label: "Renewal date", value: "In 3 days", positive: false },
      { label: "Last donation", value: "8 months ago", positive: false },
    ]},
  { id: "sm-07", name: "Priya Mehta", email: "priya.mehta@tech.com", memberType: "Member", engagementScore: 43, tier: "At Risk", renewalLikelihood: "Medium", lastActivity: "5 weeks ago",
    signals: [
      { label: "Events attended", value: "0 in last 90 days", positive: false },
      { label: "Renewal date", value: "In 15 days", positive: false },
      { label: "Email open rate", value: "31%", positive: false },
      { label: "Volunteer shifts", value: "0 scheduled", positive: false },
    ]},
  { id: "sm-08", name: "Robert Okafor", email: "robert.okafor@email.com", memberType: "Donor", engagementScore: 41, tier: "At Risk", renewalLikelihood: "Medium", lastActivity: "7 weeks ago",
    signals: [
      { label: "Giving trend", value: "Decreased 40%", positive: false },
      { label: "Last event", value: "5 months ago", positive: false },
      { label: "Email open rate", value: "28%", positive: false },
      { label: "Lifetime giving", value: "$5,400 (5 years)", positive: true },
    ]},
  { id: "sm-09", name: "Margaret Chen", email: "margaret.chen@email.com", memberType: "Donor", engagementScore: 38, tier: "At Risk", renewalLikelihood: "Low", lastActivity: "9 weeks ago",
    signals: [
      { label: "Events attended", value: "0 this year (was 3)", positive: false },
      { label: "Last donation", value: "4 months ago", positive: false },
      { label: "Email open rate", value: "15%", positive: false },
      { label: "Volunteering", value: "No shifts in 6 months", positive: false },
    ]},
  // Lapsed
  { id: "sm-10", name: "Carlos Diaz", email: "carlos.diaz@email.com", memberType: "Member", engagementScore: 18, tier: "Lapsed", renewalLikelihood: "Low", lastActivity: "4 months ago",
    signals: [
      { label: "Membership", value: "Expired 45 days ago", positive: false },
      { label: "Events attended", value: "0 this year", positive: false },
      { label: "Email opens", value: "Last opened 3 months ago", positive: false },
      { label: "Donations", value: "None in 12 months", positive: false },
    ]},
  { id: "sm-11", name: "Yuki Tanaka", email: "yuki.tanaka@email.com", memberType: "Member", engagementScore: 12, tier: "Lapsed", renewalLikelihood: "Low", lastActivity: "5 months ago",
    signals: [
      { label: "Membership", value: "Expired 35 days ago", positive: false },
      { label: "Events attended", value: "0 in 6 months", positive: false },
      { label: "Email opens", value: "0% open rate", positive: false },
      { label: "Last contact", value: "5 months ago", positive: false },
    ]},
  { id: "sm-12", name: "Omar Hassan", email: "omar.hassan@email.com", memberType: "Member", engagementScore: 9, tier: "Lapsed", renewalLikelihood: "Low", lastActivity: "6 months ago",
    signals: [
      { label: "Membership", value: "Expired 60 days ago", positive: false },
      { label: "Events attended", value: "0 this year", positive: false },
      { label: "Email unsubscribed", value: "Yes", positive: false },
      { label: "Last donation", value: "Never", positive: false },
    ]},
];

const ENGAGEMENT_STATS = {
  totalScored: SCORED_MEMBERS.length,
  active: SCORED_MEMBERS.filter((m) => m.tier === "Active").length,
  atRisk: SCORED_MEMBERS.filter((m) => m.tier === "At Risk").length,
  lapsed: SCORED_MEMBERS.filter((m) => m.tier === "Lapsed").length,
  avgScore: Math.round(SCORED_MEMBERS.reduce((sum, m) => sum + m.engagementScore, 0) / SCORED_MEMBERS.length),
};

// ── Helpers ──────────────────────────────────────────────────────

function tierColor(tier: EngagementTier): string {
  const map: Record<EngagementTier, string> = {
    Active: "bg-green-100 text-green-700 border-green-200",
    "At Risk": "bg-amber-100 text-amber-700 border-amber-200",
    Lapsed: "bg-red-100 text-red-700 border-red-200",
  };
  return map[tier];
}

function renewalColor(likelihood: RenewalLikelihood): string {
  const map: Record<RenewalLikelihood, string> = {
    High: "text-green-600",
    Medium: "text-amber-600",
    Low: "text-red-600",
  };
  return map[likelihood];
}

function scoreBarColor(score: number): string {
  if (score >= 70) return "bg-green-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-red-500";
}

// ── Component ─────────────────────────────────────────────────────

export default function AIEngagementScoringPage() {
  const [members, setMembers] = useState<ScoredMember[]>(SCORED_MEMBERS);
  const [selectedMember, setSelectedMember] = useState<ScoredMember | null>(null);
  const [tierFilter, setTierFilter] = useState<EngagementTier | "All">("All");

  const filteredMembers = members.filter(
    (m) => tierFilter === "All" || m.tier === tierFilter
  );

  const handleGetNextAction = async (member: ScoredMember) => {
    // Update loading state
    setMembers((prev) =>
      prev.map((m) => m.id === member.id ? { ...m, isLoadingAction: true } : m)
    );
    if (selectedMember?.id === member.id) {
      setSelectedMember((prev) => prev ? { ...prev, isLoadingAction: true } : prev);
    }

    try {
      const { data, error } = await supabase.functions.invoke("ai-chat-assistant", {
        body: {
          message: `Suggest the single best next action to re-engage this nonprofit member/donor in 1–2 sentences. Be specific and actionable.

Name: ${member.name}
Type: ${member.memberType}
Engagement Score: ${member.engagementScore}/100
Tier: ${member.tier}
Last Activity: ${member.lastActivity}
Signals: ${member.signals.map((s) => `${s.label}: ${s.value}`).join(", ")}

Respond with only the action suggestion, no preamble.`,
          context: "engagement_scoring",
        },
      });
      if (error) throw error;

      const action = data?.response ?? data?.content ?? "";
      setMembers((prev) =>
        prev.map((m) => m.id === member.id ? { ...m, suggestedAction: action, isLoadingAction: false } : m)
      );
      if (selectedMember?.id === member.id) {
        setSelectedMember((prev) => prev ? { ...prev, suggestedAction: action, isLoadingAction: false } : prev);
      }
    } catch {
      const fallbackActions: Record<EngagementTier, string> = {
        Active: `Send ${member.name} a personal thank-you note highlighting their specific contributions (${member.signals[0]?.value}) and invite them to an exclusive VIP preview of your next major event.`,
        "At Risk": `Call ${member.name} directly within 48 hours — acknowledge the gap in engagement, share a compelling program story, and offer a free event ticket to rebuild the connection before their renewal date.`,
        Lapsed: `Send ${member.name} a "We miss you" email with a 50% renewal discount valid for 7 days, featuring a 1-minute impact video showing what their past support made possible.`,
      };
      const action = fallbackActions[member.tier];
      setMembers((prev) =>
        prev.map((m) => m.id === member.id ? { ...m, suggestedAction: action, isLoadingAction: false } : m)
      );
      if (selectedMember?.id === member.id) {
        setSelectedMember((prev) => prev ? { ...prev, suggestedAction: action, isLoadingAction: false } : prev);
      }
    }
  };

  const handleBulkAction = (tier: EngagementTier) => {
    const count = members.filter((m) => m.tier === tier).length;
    toast.success(`Re-engagement campaign queued for ${count} ${tier} members`, {
      description: "Personalized emails will be drafted and sent within 24 hours",
    });
  };

  const kpiCards = [
    { label: "Total Scored", value: ENGAGEMENT_STATS.totalScored, icon: Users, color: "text-blue-600" },
    { label: "Active", value: ENGAGEMENT_STATS.active, icon: CheckCircle2, color: "text-green-600" },
    { label: "At Risk", value: ENGAGEMENT_STATS.atRisk, icon: AlertTriangle, color: "text-amber-600" },
    { label: "Avg Score", value: ENGAGEMENT_STATS.avgScore, icon: Target, color: "text-purple-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          Member Engagement
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          AI-powered engagement scores, lapse risk detection, and next best actions for every member.
          Looking for donors? Engagement scores live in{" "}
          <Link to="/donor-retention" className="text-primary hover:underline">Donor Retention</Link>.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="text-3xl font-bold mt-1">{card.value}</p>
                </div>
                <card.icon className={`h-8 w-8 ${card.color} opacity-80`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick action banners */}
      {ENGAGEMENT_STATS.atRisk > 0 && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                    {ENGAGEMENT_STATS.atRisk} members are at risk of lapsing
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    Proactive outreach now can prevent churn
                  </p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="border-amber-300 shrink-0" onClick={() => handleBulkAction("At Risk")}>
                <Zap className="h-3.5 w-3.5 mr-1.5" /> Re-Engage All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all" onClick={() => setTierFilter("All")}>
            All ({ENGAGEMENT_STATS.totalScored})
          </TabsTrigger>
          <TabsTrigger value="active" onClick={() => setTierFilter("Active")}>
            Active ({ENGAGEMENT_STATS.active})
          </TabsTrigger>
          <TabsTrigger value="atrisk" onClick={() => setTierFilter("At Risk")}>
            At Risk ({ENGAGEMENT_STATS.atRisk})
          </TabsTrigger>
          <TabsTrigger value="lapsed" onClick={() => setTierFilter("Lapsed")}>
            Lapsed ({ENGAGEMENT_STATS.lapsed})
          </TabsTrigger>
        </TabsList>

        {["all", "active", "atrisk", "lapsed"].map((tabVal) => (
          <TabsContent key={tabVal} value={tabVal}>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead className="hidden md:table-cell">Renewal Likelihood</TableHead>
                      <TableHead className="hidden lg:table-cell">Last Activity</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member) => (
                      <TableRow key={member.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedMember(member)}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.memberType}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className={`h-full rounded-full ${scoreBarColor(member.engagementScore)}`}
                                style={{ width: `${member.engagementScore}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium w-6">{member.engagementScore}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${tierColor(member.tier)}`}>
                            {member.tier}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className={`text-sm font-medium flex items-center gap-1 ${renewalColor(member.renewalLikelihood)}`}>
                            {member.renewalLikelihood === "High" ? <TrendingUp className="h-3.5 w-3.5" /> : member.renewalLikelihood === "Low" ? <TrendingDown className="h-3.5 w-3.5" /> : null}
                            {member.renewalLikelihood}
                          </span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                          {member.lastActivity}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => { e.stopPropagation(); setSelectedMember(member); }}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Member Detail Sheet */}
      <Sheet
        open={!!selectedMember}
        onOpenChange={(open) => {
          if (!open) setSelectedMember(null);
        }}
      >
        <SheetContent className="sm:max-w-md overflow-y-auto">
          {selectedMember && (() => {
            // Get latest state from members array
            const live = members.find((m) => m.id === selectedMember.id) ?? selectedMember;
            return (
              <>
                <SheetHeader>
                  <SheetTitle>{live.name}</SheetTitle>
                  <div className="flex gap-2 flex-wrap mt-1">
                    <Badge variant="outline">{live.memberType}</Badge>
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${tierColor(live.tier)}`}>
                      {live.tier}
                    </span>
                  </div>
                </SheetHeader>

                <div className="mt-6 space-y-5">
                  {/* Score gauge */}
                  <div className="rounded-lg border p-4 text-center">
                    <p className="text-5xl font-bold" style={{ color: live.engagementScore >= 70 ? "#16a34a" : live.engagementScore >= 40 ? "#d97706" : "#dc2626" }}>
                      {live.engagementScore}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Engagement Score</p>
                    <div className="h-2 rounded-full bg-muted overflow-hidden mt-2 mx-4">
                      <div
                        className={`h-full rounded-full ${scoreBarColor(live.engagementScore)}`}
                        style={{ width: `${live.engagementScore}%` }}
                      />
                    </div>
                    <p className={`text-sm font-medium mt-2 flex items-center justify-center gap-1 ${renewalColor(live.renewalLikelihood)}`}>
                      {live.renewalLikelihood === "High" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      {live.renewalLikelihood} renewal likelihood
                    </p>
                  </div>

                  {/* Signals */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Engagement Signals</h4>
                    <div className="space-y-2">
                      {live.signals.map((signal, i) => (
                        <div key={i} className="flex items-center justify-between text-sm border rounded-lg px-3 py-2">
                          <span className="text-muted-foreground">{signal.label}</span>
                          <span className={`font-medium flex items-center gap-1 ${signal.positive ? "text-green-700 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                            {signal.positive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                            {signal.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Next Best Action */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-primary" /> AI Next Best Action
                    </h4>
                    {live.suggestedAction ? (
                      <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                        <p className="text-sm leading-relaxed">{live.suggestedAction}</p>
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            onClick={() => toast.success(`Action queued for ${live.name}`)}
                          >
                            <Zap className="h-3.5 w-3.5 mr-1.5" /> Take Action
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleGetNextAction(live)}
                            disabled={live.isLoadingAction}
                          >
                            Regenerate
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => handleGetNextAction(live)}
                        disabled={live.isLoadingAction}
                      >
                        {live.isLoadingAction ? (
                          <>
                            <Sparkles className="h-4 w-4 mr-2 animate-pulse" /> Analyzing…
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" /> Get AI Recommendation
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Quick info */}
                  <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Last activity: {live.lastActivity}
                  </div>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>
    </div>
  );
}
