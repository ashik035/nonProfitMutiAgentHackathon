/**
 * Program Impact Tracker — /programs
 *
 * Program cards with metrics, AI-generated impact narratives,
 * and "Add to Grant Report" button.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Target, Users, Clock, DollarSign, TrendingUp, Sparkles, FileText, CheckCircle2, BarChart3,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { DEMO_PROGRAMS, DEMO_GRANTS, type DemoProgram } from "@/shared/data/nonprofitDemoData";

const statusColors = {
  active: "text-green-600 border-green-200 bg-green-50 dark:bg-green-950/20",
  completed: "text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-950/20",
  planning: "text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-950/20",
};

function generateImpactNarrative(program: DemoProgram): string {
  const utilPct = Math.round((program.metrics.budgetUsed / program.metrics.budgetTotal) * 100);
  const outcomePct = Math.round((program.metrics.outcomesAchieved / program.metrics.outcomesTarget) * 100);
  return `The ${program.name} has served ${program.metrics.beneficiaryCount} beneficiaries since its launch, achieving ${outcomePct}% of its target outcomes. With ${program.metrics.volunteerHours.toLocaleString()} volunteer hours contributed and ${utilPct}% of the budget utilized ($${program.metrics.budgetUsed.toLocaleString()} of $${program.metrics.budgetTotal.toLocaleString()}), the program is ${outcomePct >= 90 ? "on track to meet all goals" : outcomePct >= 70 ? "progressing well toward its objectives" : "in early stages with strong growth potential"}. Led by ${program.leadStaff}, the initiative continues to demonstrate measurable community impact.`;
}

export default function ProgramsPage() {
  const [detailProgram, setDetailProgram] = useState<DemoProgram | null>(null);

  const totalBeneficiaries = DEMO_PROGRAMS.reduce((s, p) => s + p.metrics.beneficiaryCount, 0);
  const totalVolunteerHours = DEMO_PROGRAMS.reduce((s, p) => s + p.metrics.volunteerHours, 0);
  const activeCount = DEMO_PROGRAMS.filter((p) => p.status === "active").length;

  const handleAddToGrant = (program: DemoProgram) => {
    toast.success(`${program.name} impact data added to grant report`, {
      description: `Linked to ${DEMO_GRANTS.grants[0].name}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Program Impact Tracker
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Operational program management — track outcomes, log beneficiaries, and monitor budgets
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/impact-dashboard">
            <BarChart3 className="h-4 w-4 mr-2" /> View Impact Dashboard
          </Link>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeCount}</p>
              <p className="text-xs text-muted-foreground">Active Programs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalBeneficiaries.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Beneficiaries</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-50 dark:bg-green-950/20 flex items-center justify-center">
              <Clock className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalVolunteerHours.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Volunteer Hours</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{DEMO_PROGRAMS.length}</p>
              <p className="text-xs text-muted-foreground">Total Programs</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Program Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {DEMO_PROGRAMS.map((program) => {
          const utilPct = Math.round((program.metrics.budgetUsed / program.metrics.budgetTotal) * 100);
          const outcomePct = Math.round((program.metrics.outcomesAchieved / program.metrics.outcomesTarget) * 100);

          return (
            <Card key={program.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{program.name}</CardTitle>
                    <CardDescription className="mt-1">{program.description}</CardDescription>
                  </div>
                  <Badge variant="outline" className={`text-xs capitalize ${statusColors[program.status]}`}>
                    {program.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                  <span>Lead: {program.leadStaff}</span>
                  <span>•</span>
                  <span>Started: {program.startDate}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Metrics grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Beneficiaries:</span>
                    <span className="font-medium">{program.metrics.beneficiaryCount}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Vol. Hours:</span>
                    <span className="font-medium">{program.metrics.volunteerHours.toLocaleString()}</span>
                  </div>
                </div>

                {/* Budget utilization */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Budget Utilization</span>
                    <span className="font-medium">{utilPct}%</span>
                  </div>
                  <Progress value={utilPct} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    ${program.metrics.budgetUsed.toLocaleString()} of ${program.metrics.budgetTotal.toLocaleString()}
                  </p>
                </div>

                {/* Outcomes */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Outcomes Achieved</span>
                    <span className="font-medium">{program.metrics.outcomesAchieved}/{program.metrics.outcomesTarget}</span>
                  </div>
                  <Progress value={outcomePct} className="h-2" />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <Button size="sm" variant="outline" onClick={() => setDetailProgram(program)}>
                    <Sparkles className="h-3.5 w-3.5 mr-1" />
                    Impact Summary
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleAddToGrant(program)}>
                    <FileText className="h-3.5 w-3.5 mr-1" />
                    Add to Grant Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Impact narrative sheet */}
      <Sheet open={!!detailProgram} onOpenChange={() => setDetailProgram(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {detailProgram && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Impact Summary
                </SheetTitle>
                <SheetDescription>{detailProgram.name}</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="rounded-lg border p-4 bg-muted/30">
                  <p className="text-sm leading-relaxed">
                    {generateImpactNarrative(detailProgram)}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-2xl font-bold text-foreground">{detailProgram.metrics.beneficiaryCount}</p>
                    <p className="text-xs text-muted-foreground">Beneficiaries Served</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-2xl font-bold text-foreground">{detailProgram.metrics.volunteerHours.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Volunteer Hours</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-2xl font-bold text-foreground">{Math.round((detailProgram.metrics.outcomesAchieved / detailProgram.metrics.outcomesTarget) * 100)}%</p>
                    <p className="text-xs text-muted-foreground">Outcomes Achieved</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-2xl font-bold text-foreground">${detailProgram.metrics.budgetUsed.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Budget Used</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1" variant="outline" onClick={() => {
                    navigator.clipboard.writeText(generateImpactNarrative(detailProgram));
                    toast.success("Impact narrative copied to clipboard");
                  }}>
                    Copy Narrative
                  </Button>
                  <Button className="flex-1" onClick={() => {
                    handleAddToGrant(detailProgram);
                    setDetailProgram(null);
                  }}>
                    <FileText className="h-4 w-4 mr-1" />
                    Add to Grant Report
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
