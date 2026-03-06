/**
 * Pod Health Hooks
 * React Query hooks for pod health and performance tracking
 * Note: productivity_records table has been removed. These hooks now return
 * pod structure data without productivity metrics.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { PodHealthRecord, PodHealthStats, PodMemberPerformance } from '@/types/pods';

// ============================================
// QUERY KEYS
// ============================================
export const podHealthKeys = {
  all: ['pods', 'health'] as const,
  stats: () => [...podHealthKeys.all, 'stats'] as const,
  records: () => [...podHealthKeys.all, 'records'] as const,
  pod: (podId: string) => [...podHealthKeys.all, 'pod', podId] as const,
  members: (podId: string) => [...podHealthKeys.all, 'members', podId] as const,
};

// ============================================
// QUERIES
// ============================================

/**
 * Fetch aggregated pod health KPIs.
 * Returns pod count and zero placeholders for productivity metrics
 * (productivity_records table removed).
 */
export function usePodHealth() {
  return useQuery({
    queryKey: podHealthKeys.stats(),
    queryFn: async (): Promise<PodHealthStats> => {
      const { data: pods, error: podsError } = await supabase
        .from('pods')
        .select('id')
        .eq('is_active', true);

      if (podsError) throw podsError;

      return {
        pods_tracked: (pods || []).length,
        avg_throughput_pct: 0,
        sla_adherence_pct: 0,
        coaching_needs_count: 0,
      };
    },
  });
}

/**
 * Fetch pod health records for all pods.
 * Returns pod structure with zero productivity metrics.
 */
export function usePodHealthRecords() {
  return useQuery({
    queryKey: podHealthKeys.records(),
    queryFn: async (): Promise<PodHealthRecord[]> => {
      const { data: pods, error: podsError } = await (supabase as any)
        .from('pods')
        .select('id, name, color')
        .eq('is_active', true)
        .eq('show_in_resource_projection', true);

      if (podsError) throw podsError;

      const { data: podEmployees } = await (supabase as any)
        .from('pod_employees')
        .select('pod_id, employee_id, user_id, role')
        .eq('is_active', true);

      const managers = (podEmployees || []).filter((pe: any) => pe.role === 'manager');
      const managerMap = new Map<string, any>();
      managers.forEach((m: any) => managerMap.set(m.pod_id, m));

      const employeeIds = [...new Set((podEmployees || []).map((pe: any) => pe.employee_id).filter(Boolean))] as string[];
      const { data: employees } = await (supabase as any)
        .from('employee_profiles')
        .select('id, full_name, email')
        .in('id', employeeIds);

      const nameMap = new Map<string, string>();
      (employees || []).forEach((emp: any) => {
        if (emp.id) nameMap.set(emp.id, emp.full_name || emp.email || '');
      });

      return (pods || []).map((pod: any) => {
        const members = (podEmployees || []).filter((pe: any) => pe.pod_id === pod.id);
        const manager = managerMap.get(pod.id);
        const managerName = manager?.employee_id ? nameMap.get(manager.employee_id) || null : null;

        return {
          pod_id: pod.id,
          pod_name: pod.name,
          pod_color: pod.color || '#3b82f6',
          manager_id: manager?.user_id || null,
          manager_name: managerName,
          member_count: members.length,
          throughput_pct: 0,
          sla_adherence_pct: 0,
          coaching_needs_count: 0,
          is_out_of_sla: false,
        };
      });
    },
  });
}

/**
 * Fetch member performance for a specific pod.
 * Returns member list without productivity metrics.
 */
export function usePodMemberPerformance(podId: string | undefined) {
  return useQuery({
    queryKey: podHealthKeys.members(podId || ''),
    queryFn: async (): Promise<PodMemberPerformance[]> => {
      if (!podId) return [];

      const { data: podEmployees, error: peError } = await (supabase as any)
        .from('pod_employees')
        .select('employee_id, user_id, role')
        .eq('pod_id', podId)
        .eq('is_active', true);

      if (peError) throw peError;
      if (!podEmployees || podEmployees.length === 0) return [];

      const employeeIds = podEmployees.map((pe: any) => pe.employee_id).filter(Boolean);
      const { data: employees } = await (supabase as any)
        .from('employee_profiles')
        .select('id, email, full_name, location')
        .in('id', employeeIds);

      const employeeMap = new Map<string, any>();
      (employees || []).forEach((emp: any) => employeeMap.set(emp.id, emp));

      const performances: PodMemberPerformance[] = podEmployees
        .map((pe: any) => {
          const emp = pe.employee_id ? employeeMap.get(pe.employee_id) : null;
          if (!emp) return null;
          return {
            employee_id: pe.employee_id || '',
            employee_name: emp.full_name || emp.email,
            email: emp.email,
            department: null,
            location: emp.location || null,
            productivity_pct: null,
            role: (pe.role as 'manager' | 'member') || null,
          };
        })
        .filter(Boolean) as PodMemberPerformance[];

      return performances.sort((a, b) => a.employee_name.localeCompare(b.employee_name));
    },
    enabled: !!podId,
  });
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Assign a pod manager
 */
export function useAssignPodManager() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      podId,
      employeeId,
    }: {
      podId: string;
      employeeId: string | null;
    }): Promise<void> => {
      await (supabase as any)
        .from('pod_employees')
        .update({ role: 'member' })
        .eq('pod_id', podId)
        .eq('role', 'manager');

      if (employeeId) {
        const { data: existing } = await supabase
          .from('pod_employees')
          .select('id')
          .eq('pod_id', podId)
          .eq('employee_id', employeeId)
          .single();

        if (existing) {
          const { error } = await (supabase as any)
            .from('pod_employees')
            .update({ role: 'manager' })
            .eq('id', existing.id);
          if (error) throw error;
        } else {
          const { error } = await (supabase as any).from('pod_employees').insert({
            pod_id: podId,
            employee_id: employeeId,
            role: 'manager',
            source: 'manual',
            is_active: true,
          });
          if (error) throw error;
        }
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: podHealthKeys.all });
      queryClient.invalidateQueries({ queryKey: podHealthKeys.members(variables.podId) });
      toast.success('Pod manager assigned successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to assign pod manager');
    },
  });
}
