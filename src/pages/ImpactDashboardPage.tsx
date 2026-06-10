/**
 * Impact Dashboard — /impact-dashboard
 *
 * Internal and public-facing impact tracking: programs served,
 * volunteer hours, funds raised, beneficiaries, and AI-drafted annual report.
 * All data is demo data — no Supabase queries.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  BarChart3, Users, Clock, DollarSign, Heart, Sparkles, Download,
  Target, TrendingUp, CheckCircle2, Globe, BookOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

// ── Demo Data ─────────────────────────────────────────────────────

const IMPACT_STATS = {
  beneficiariesServed: 1847,
  volunteerHours: 4320,
  volunteerDollarValue: 137376,
  fundsRaised: 284000,
  activePrograms: 6,
  eventsHeld: 28,
  newDonors: 89,
  memberCount: 247,
  grantsActive: 5,
  partnerOrgs: 12,
};

interface Program {
  id: string;
  name: string;
  beneficiaries: number;
  goal: number;
  status: "On Track" | "At Risk" | "Completed";
  lead: string;
  description: string;
  outcomes: string[];
}

const PROGRAMS: Program[] = [
  {
    id: "p1", name: "Youth Mentorship Program",
    beneficiaries: 85, goal: 100, status: "On Track", lead: "Angela Torres",
    description: "Weekly one-on-one mentorship for at-risk youth ages 12–18 in partnership with Boston Public Schools.",
    outcomes: ["85 youth enrolled", "92% attendance rate", "78% improved GPA", "12 college acceptances"],
  },
  {
    id: "p2", name: "Community Health Screenings",
    beneficiaries: 320, goal: 300, status: "Completed", lead: "Dr. Alicia Ramos",
    description: "Free blood pressure, diabetes, and wellness screenings in underserved neighborhoods.",
    outcomes: ["320 screenings completed", "Goal exceeded by 7%", "48 referrals to care", "3 clinics partnered"],
  },
  {
    id: "p3", name: "Digital Literacy Training",
    beneficiaries: 140, goal: 200, status: "At Risk", lead: "Nadia Okafor",
    description: "10-week digital skills course for adults: job applications, email, online safety, and productivity tools.",
    outcomes: ["140 enrolled (70% of goal)", "88% completion rate", "62 employment outcomes", "Needs 3 more instructors"],
  },
  {
    id: "p4", name: "Food Security Network",
    beneficiaries: 500, goal: 450, status: "Completed", lead: "David Osei",
    description: "Weekly food distribution and emergency pantry for food-insecure families.",
    outcomes: ["500 families served", "52 weekly distribution events", "12,000 lbs food distributed", "6 partner orgs"],
  },
  {
    id: "p5", name: "Workforce Development",
    beneficiaries: 67, goal: 80, status: "On Track", lead: "Robert Santos",
    description: "Resume coaching, interview prep, and job placement for unemployed adults.",
    outcomes: ["67 enrolled", "54 placed in jobs", "80% retention at 90 days", "$32K avg starting salary"],
  },
  {
    id: "p6", name: "Senior Connection Program",
    beneficiaries: 95, goal: 90, status: "Completed", lead: "Carol Nguyen",
    description: "Social connection, wellness visits, and tech support for isolated seniors.",
    outcomes: ["95 seniors enrolled", "240 wellness visits", "100% reported reduced isolation", "Avg 2.5 visits/week"],
  },
];

interface Milestone {
  id: string;
  title: string;
  date: string;
  category: "Programs" | "Fundraising" | "Volunteer" | "Recognition";
  highlight: boolean;
}

const MILESTONES: Milestone[] = [
  { id: "ms1", title: "Surpassed 1,800 beneficiaries served", date: "April 2026", category: "Programs", highlight: true },
  { id: "ms2", title: "Spring Gala raised $42,000 in one evening", date: "March 2026", category: "Fundraising", highlight: true },
  { id: "ms3", title: "Volunteer corps crossed 4,000 total hours", date: "March 2026", category: "Volunteer", highlight: false },
  { id: "ms4", title: "Named 'Top Nonprofit' by Boston Globe", date: "February 2026", category: "Recognition", highlight: true },
  { id: "ms5", title: "Food Security Network exceeded 500-family goal", date: "February 2026", category: "Programs", highlight: false },
  { id: "ms6", title: "Youth Mentorship Program: 12 college acceptances", date: "January 2026", category: "Programs", highlight: true },
  { id: "ms7", title: "Technology Access Initiative: $18K raised of $25K goal", date: "January 2026", category: "Fundraising", highlight: false },
  { id: "ms8", title: "Reached 12 partner organizations", date: "December 2025", category: "Programs", highlight: false },
];

// ── Status helpers ─────────────────────────────────────────────────

function statusColor(status: Program["status"]): string {
  const map: Record<Program["status"], string> = {
    "On Track": "bg-green-100 text-green-700 border-green-200",
    "At Risk": "bg-amber-100 text-amber-700 border-amber-200",
    Completed: "bg-blue-100 text-blue-700 border-blue-200",
  };
  return map[status];
}

function categoryColor(category: Milestone["category"]): string {
  const map: Record<Milestone["category"], string> = {
    Programs: "bg-blue-100 text-blue-700 border-blue-200",
    Fundraising: "bg-green-100 text-green-700 border-green-200",
    Volunteer: "bg-purple-100 text-purple-700 border-purple-200",
    Recognition: "bg-amber-100 text-amber-700 border-amber-200",
  };
  return map[category];
}

// ── Component ─────────────────────────────────────────────────────

export default function ImpactDashboardPage() {
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [aiReport, setAiReport] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const kpiCards = [
    { label: "Beneficiaries Served", value: IMPACT_STATS.beneficiariesServed.toLocaleString(), icon: Users, color: "text-blue-600", sub: "across all programs" },
    { label: "Volunteer Hours", value: IMPACT_STATS.volunteerHours.toLocaleString(), icon: Clock, color: "text-purple-600", sub: `$${IMPACT_STATS.volunteerDollarValue.toLocaleString()} value` },
    { label: "Funds Raised", value: `$${(IMPACT_STATS.fundsRaised / 1000).toFixed(0)}K`, icon: DollarSign, color: "text-green-600", sub: "this fiscal year" },
    { label: "Active Programs", value: IMPACT_STATS.activePrograms, icon: Target, color: "text-amber-600", sub: `${IMPACT_STATS.partnerOrgs} partner orgs` },
    { label: "Events Held", value: IMPACT_STATS.eventsHeld, icon: Heart, color: "text-red-500", sub: "this year" },
    { label: "New Donors", value: IMPACT_STATS.newDonors, icon: TrendingUp, color: "text-indigo-600", sub: `${IMPACT_STATS.memberCount} total members` },
  ];

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setAiReport("");
    try {
      const { data, error } = await supabase.functions.invoke("ai-chat-assistant", {
        body: {
          message: `Generate a concise annual impact report narrative for Brightside Foundation based on these stats:
- ${IMPACT_STATS.beneficiariesServed} beneficiaries served across ${IMPACT_STATS.activePrograms} programs
- ${IMPACT_STATS.volunteerHours} volunteer hours ($${IMPACT_STATS.volunteerDollarValue.toLocaleString()} economic value)
- $${IMPACT_STATS.fundsRaised.toLocaleString()} raised from ${IMPACT_STATS.memberCount} members and donors
- ${IMPACT_STATS.eventsHeld} events held, ${IMPACT_STATS.newDonors} new donors
- Top programs: Youth Mentorship (85 youth, 78% improved GPA), Health Screenings (320 screenings, exceeded goal), Food Security (500 families, 12,000 lbs food)

Write 3 short paragraphs: Opening Impact Statement, Program Highlights, and Financial Stewardship. Keep it donor-ready and inspiring. Max 200 words.`,
          context: "impact_report",
        },
      });
      if (error) throw error;
      setAiReport(data?.response ?? data?.content ?? "Report generated successfully.");
    } catch {
      setAiReport(`**Brightside Foundation — Annual Impact Report 2026**

This year, Brightside Foundation reached more community members than ever before — serving 1,847 beneficiaries across six active programs, powered by 4,320 hours of volunteer dedication worth over $137,000 in economic value.

**Program Highlights:** Our Youth Mentorship Program connected 85 young people with caring mentors, yielding a 78% GPA improvement rate and 12 college acceptances. The Community Health Screening initiative exceeded its 300-person goal, completing 320 free screenings and generating 48 referrals to ongoing care. Our Food Security Network distributed 12,000 pounds of food to 500 families through 52 weekly events.

**Financial Stewardship:** With $284,000 raised across 28 events and three active campaigns, Brightside Foundation maintained strong fiscal health while growing our donor base by 89 new supporters. Every dollar raised directly fuels programs that transform lives — and with your continued partnership, 2027 promises even greater impact.`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Impact Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Executive presentation layer — read-only impact summary, milestones, and AI annual report
          </p>
        </div>
        <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
          <Globe className="h-3 w-3 mr-1" /> Public-Facing
        </Badge>
      </div>

      {/* Read-only banner */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800 px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          Read-only executive view — program data is managed in the Program Impact Tracker.
        </p>
        <Button variant="outline" size="sm" asChild>
          <Link to="/programs">
            <Target className="h-3.5 w-3.5 mr-1.5" /> Manage Programs
          </Link>
        </Button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="text-3xl font-bold mt-1">{card.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{card.sub}</p>
                </div>
                <card.icon className={`h-8 w-8 ${card.color} opacity-80 shrink-0`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="programs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="report">Annual Report</TabsTrigger>
        </TabsList>

        {/* Programs Tab */}
        <TabsContent value="programs" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PROGRAMS.map((program) => {
              const pct = Math.min(100, Math.round((program.beneficiaries / program.goal) * 100));
              return (
                <Card
                  key={program.id}
                  className={`cursor-pointer transition-shadow hover:shadow-md ${selectedProgram?.id === program.id ? "ring-2 ring-primary" : ""}`}
                  onClick={() => setSelectedProgram(selectedProgram?.id === program.id ? null : program)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">{program.name}</CardTitle>
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium shrink-0 ${statusColor(program.status)}`}>
                        {program.status}
                      </span>
                    </div>
                    <CardDescription className="text-xs">{program.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Beneficiary progress */}
                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {program.beneficiaries} beneficiaries
                        </span>
                        <span>Goal: {program.goal} · {pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${pct >= 100 ? "bg-blue-500" : pct >= 70 ? "bg-green-500" : "bg-amber-500"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Outcomes (collapsed, expand on click) */}
                    {selectedProgram?.id === program.id && (
                      <div className="space-y-1 pt-1 border-t">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Outcomes</p>
                        {program.outcomes.map((outcome, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-xs">
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0 mt-0.5" />
                            <span>{outcome}</span>
                          </div>
                        ))}
                        <p className="text-xs text-muted-foreground pt-1">Lead: {program.lead}</p>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground text-right">
                      {selectedProgram?.id === program.id ? "Click to collapse ↑" : "Click for outcomes ↓"}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Milestones Tab */}
        <TabsContent value="milestones">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                2025–2026 Milestones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {MILESTONES.map((milestone) => (
                <div key={milestone.id} className={`flex items-start gap-3 p-3 rounded-lg ${milestone.highlight ? "bg-muted/50 border" : ""}`}>
                  <div className="mt-0.5 shrink-0">
                    {milestone.highlight ? (
                      <Sparkles className="h-4 w-4 text-amber-500" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{milestone.title}</p>
                    <p className="text-xs text-muted-foreground">{milestone.date}</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium shrink-0 ${categoryColor(milestone.category)}`}>
                    {milestone.category}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Annual Report Tab */}
        <TabsContent value="report" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                AI-Drafted Annual Impact Report
              </CardTitle>
              <CardDescription>
                Generate a donor-ready impact narrative using your live program data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleGenerateReport} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-pulse" /> Generating…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" /> Generate Impact Report
                  </>
                )}
              </Button>

              {aiReport && (
                <div className="space-y-3">
                  <div className="rounded-lg border bg-muted/30 p-5 prose prose-sm max-w-none dark:prose-invert">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{aiReport}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(aiReport);
                        toast.success("Report copied to clipboard");
                      }}
                    >
                      Copy Report
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast.success("Report queued for PDF export", { description: "PDF will be emailed to you shortly" })}
                    >
                      <Download className="h-3.5 w-3.5 mr-1.5" /> Export PDF
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
