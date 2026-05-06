import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PenTool, Copy, RefreshCw, FileText, Loader2, Info } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DEMO_GRANTS } from "@/shared/data/nonprofitDemoData";
import { DEMO_PROGRAMS } from "@/shared/data/nonprofitDemoData";

const WRITING_SECTIONS = [
  "Executive Summary",
  "Program Narrative",
  "Evaluation Plan",
  "Budget Justification",
  "Statement of Need",
] as const;

type WritingSection = typeof WRITING_SECTIONS[number];

const activeGrants = DEMO_GRANTS.grants.filter((g) => g.status === "active");

export default function GrantWriterPage() {
  const [selectedGrantName, setSelectedGrantName] = useState<string>("");
  const [selectedProgramIds, setSelectedProgramIds] = useState<Set<string>>(new Set());
  const [selectedSection, setSelectedSection] = useState<WritingSection | "">("");
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const [draftSection, setDraftSection] = useState<WritingSection | "">("");
  const [error, setError] = useState<string | null>(null);

  const selectedGrant = activeGrants.find((g) => g.name === selectedGrantName);
  const selectedPrograms = DEMO_PROGRAMS.filter((p) => selectedProgramIds.has(p.id));

  const canGenerate = !!selectedGrant && !!selectedSection;

  const toggleProgram = (id: string) => {
    setSelectedProgramIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    setDraft(null);
    setError(null);
    setDraftSection(selectedSection as WritingSection);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-grant-draft", {
        body: {
          grant: selectedGrant,
          programs: selectedPrograms,
          section: selectedSection,
        },
      });
      if (fnError) throw fnError;
      setDraft(data?.draft ?? "No draft received.");
      toast.success("Draft generated");
    } catch {
      setError("Unable to generate draft — please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!draft) return;
    navigator.clipboard.writeText(draft);
    toast.success("Draft copied to clipboard");
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  const handleAddToReport = () => {
    toast.success("Draft added to grant report");
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Grant Writer</h1>
        <p className="text-sm text-muted-foreground">
          Brightside Foundation · AI-assisted grant writing using your real program data
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left panel — Context Selector */}
        <div className="lg:col-span-1 space-y-5">
          <Card>
            <CardContent className="p-5 space-y-5">
              {/* Grant selector */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Select Grant</Label>
                <Select value={selectedGrantName} onValueChange={setSelectedGrantName}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an active grant…" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeGrants.map((g) => (
                      <SelectItem key={g.name} value={g.name}>
                        {g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedGrant && (
                  <p className="text-xs text-muted-foreground">
                    {selectedGrant.funder} · ${selectedGrant.amount.toLocaleString()} · {selectedGrant.utilized}% utilized
                  </p>
                )}
              </div>

              {/* Programs multi-select */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Select Programs to Include</Label>
                <div className="space-y-2">
                  {DEMO_PROGRAMS.filter((p) => p.status === "active").map((program) => (
                    <div key={program.id} className="flex items-start gap-2.5">
                      <Checkbox
                        id={program.id}
                        checked={selectedProgramIds.has(program.id)}
                        onCheckedChange={() => toggleProgram(program.id)}
                        className="mt-0.5"
                      />
                      <div>
                        <label
                          htmlFor={program.id}
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          {program.name}
                        </label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {program.metrics.beneficiaryCount} beneficiaries · {Math.round((program.metrics.budgetUsed / program.metrics.budgetTotal) * 100)}% budget utilized
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Writing section selector */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Writing Section</Label>
                <Select value={selectedSection} onValueChange={(v) => setSelectedSection(v as WritingSection)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a section…" />
                  </SelectTrigger>
                  <SelectContent>
                    {WRITING_SECTIONS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Generate button */}
              <Button
                className="w-full"
                disabled={!canGenerate || loading}
                onClick={handleGenerate}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating…
                  </>
                ) : (
                  <>
                    <PenTool className="h-4 w-4 mr-2" /> Generate Draft
                  </>
                )}
              </Button>

              <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                AI uses your program outcomes, budget data, and impact metrics
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right panel — Draft Output */}
        <div className="lg:col-span-2">
          {/* Placeholder state */}
          {!loading && !draft && !error && (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-16 text-center min-h-[400px]">
              <PenTool className="h-10 w-10 text-muted-foreground/40 mb-4" />
              <p className="text-sm font-medium text-muted-foreground">
                Select a grant and writing section to generate a draft
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Choose programs to include for a more specific result
              </p>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <Card>
              <CardContent className="p-6 space-y-3">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
            </Card>
          )}

          {/* Error state */}
          {error && !loading && (
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 rounded-lg p-3 border border-red-200 dark:border-red-800">
                  {error}
                </p>
                <Button variant="outline" className="mt-4" onClick={handleGenerate}>
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Output state */}
          {draft && !loading && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">{draftSection}</h2>
                  {selectedGrant && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {selectedGrant.name} · {selectedGrant.funder}
                    </p>
                  )}
                </div>

                <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap bg-muted/30 rounded-lg p-4 border">
                  {draft}
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button size="sm" variant="outline" onClick={handleCopy}>
                    <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy Draft
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleRegenerate}>
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Regenerate
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleAddToReport}>
                    <FileText className="h-3.5 w-3.5 mr-1.5" /> Add to Grant Report
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground border-t pt-3">
                  AI-generated first draft. Review and edit before submission.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
