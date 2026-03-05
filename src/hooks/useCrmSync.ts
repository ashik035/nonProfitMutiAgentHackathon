import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { invalidateKeys } from "@/lib/cache";
import { toast } from "sonner";

export function useCrmSync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("crm-sync", { body: {} });
      if (error) throw error;
      return data as { success: boolean; results?: unknown[]; error?: string };
    },
    onSuccess: (data) => {
      invalidateKeys.deals(queryClient);
      invalidateKeys.clients(queryClient);
      queryClient.invalidateQueries({ queryKey: ["crm-connection-status"] });
      if (data?.success) {
        const total = (data.results ?? []).reduce(
          (sum: number, r: { inbound?: number; outbound?: number }) =>
            sum + (r.inbound ?? 0) + (r.outbound ?? 0),
          0
        );
        toast.success(total > 0 ? `CRM sync completed. ${total} records processed.` : "CRM sync completed.");
      } else {
        toast.error(data?.error ?? "CRM sync failed");
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || "CRM sync failed");
    },
  });
}
