/**
 * Task Attachments Hook
 *
 * Fetches file attachments for a task from task_attachments.
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { TaskAttachment } from "../types/tasks";
import { queryKeys } from "@/lib/cache";

export function useTaskAttachments(taskId: string | undefined) {
  return useQuery({
    queryKey: [...queryKeys.tasks.detail(taskId ?? ""), "attachments"],
    queryFn: async (): Promise<TaskAttachment[]> => {
      if (!taskId) return [];

      const { data, error } = await supabase
        .from("task_attachments")
        .select("*")
        .eq("task_id", taskId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return (data || []).map((row: any) => ({
        id: row.id,
        task_id: row.task_id,
        file_name: row.file_name,
        file_size: row.file_size ?? null,
        file_type: row.file_type ?? null,
        storage_path: row.file_path || row.storage_path || "",
        uploaded_by: row.uploaded_by ?? null,
        created_at: row.created_at,
      })) as TaskAttachment[];
    },
    enabled: !!taskId,
  });
}
