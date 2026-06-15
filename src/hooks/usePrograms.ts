/**
 * usePrograms — Nonprofit program impact tracker hooks.
 * Replaces DEMO_PROGRAMS in ProgramsPage.
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "@/lib/cache";
import type { Database } from "@/integrations/supabase/types";

export type Program = Database["public"]["Tables"]["nonprofit_programs"]["Row"];
export type ProgramStatus = "active" | "completed" | "planning";

export interface ProgramView {
  id: string;
  name: string;
  description: string;
  startDate: string;
  status: ProgramStatus;
  leadStaff: string;
  metrics: {
    beneficiaryCount: number;
    volunteerHours: number;
    budgetUsed: number;
    budgetTotal: number;
    outcomesAchieved: number;
    outcomesTarget: number;
  };
}

function formatProgramDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function mapProgramRow(row: Program): ProgramView {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    startDate: formatProgramDate(row.start_date),
    status: row.status as ProgramStatus,
    leadStaff: row.lead_staff ?? "",
    metrics: {
      beneficiaryCount: row.beneficiary_count,
      volunteerHours: row.volunteer_hours,
      budgetUsed: row.budget_used,
      budgetTotal: row.budget_total,
      outcomesAchieved: row.outcomes_achieved,
      outcomesTarget: row.outcomes_target,
    },
  };
}

export function usePrograms() {
  return useQuery({
    queryKey: queryKeys.nonprofit.programs.list(),
    queryFn: async (): Promise<ProgramView[]> => {
      const { data, error } = await supabase
        .from("nonprofit_programs")
        .select("*")
        .order("start_date", { ascending: false });

      if (error) throw error;
      return (data ?? []).map((row) => mapProgramRow(row as Program));
    },
  });
}
