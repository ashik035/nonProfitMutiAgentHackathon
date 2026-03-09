import { useState } from "react";
import { Building2, FolderKanban, DollarSign, Settings, ShieldCheck, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { AgencyRole } from "@/hooks/useAgencyRole";

interface RoleOption {
  role: AgencyRole;
  label: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: "executive_director",
    label: "Executive Director",
    subtitle: "Organization at a glance: data health, grants, board reports, donor growth",
    icon: Building2,
    color: "text-blue-700 dark:text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/40",
  },
  {
    role: "development_director",
    label: "Development Director",
    subtitle: "Donor and engagement activity: pipeline, follow-ups, event attendees",
    icon: FolderKanban,
    color: "text-green-700 dark:text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/40",
  },
  {
    role: "finance_manager",
    label: "Finance Manager",
    subtitle: "Financial operations: transactions, restricted funds, grant utilization",
    icon: DollarSign,
    color: "text-amber-700 dark:text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/40",
  },
  {
    role: "operations_manager",
    label: "Operations Manager",
    subtitle: "System and data operations: AI agents, integrations, data health",
    icon: Settings,
    color: "text-teal-700 dark:text-teal-400",
    bgColor: "bg-teal-500/10",
    borderColor: "border-teal-500/40",
  },
];

interface RoleSetupModalProps {
  open: boolean;
}

/**
 * Shown to any authenticated user whose agency_role is still null.
 * Lets them self-assign Owner / PM / IC; the choice is saved to
 * user_role_preferences and AuthContext is patched in-place so the
 * dashboard re-routes without a full page reload.
 */
export function RoleSetupModal({ open }: RoleSetupModalProps) {
  const { user, refreshAgencyPreferences } = useAuth();
  const [selected, setSelected] = useState<AgencyRole | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!selected || !user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("user_role_preferences")
        .upsert(
          {
            user_id: user.id,
            role: "user",
            agency_role: selected,
          },
          { onConflict: "user_id,role" }
        );
      if (error) throw error;
      // Patch AuthContext profile so Dashboard re-routes instantly
      await refreshAgencyPreferences();
    } catch (err) {
      console.error("Failed to save agency role:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} modal>
      <DialogContent
        className="sm:max-w-lg"
        // Prevent closing by clicking backdrop or pressing Escape — must choose a role
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-xl">Welcome — choose your dashboard view</DialogTitle>
          <DialogDescription>
            Select the role that best describes how you use the platform. This determines which
            dashboard you see by default. Your admin can change it anytime.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-3">
          {ROLE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isActive = selected === opt.role;
            return (
              <button
                key={opt.role}
                onClick={() => setSelected(opt.role)}
                className={cn(
                  "w-full flex items-center gap-4 rounded-lg border-2 p-4 text-left transition-all",
                  isActive
                    ? `${opt.borderColor} ${opt.bgColor}`
                    : "border-border hover:border-muted-foreground/40 hover:bg-muted/30"
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                    isActive ? opt.bgColor : "bg-muted"
                  )}
                >
                  <Icon className={cn("h-5 w-5", isActive ? opt.color : "text-muted-foreground")} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("font-medium text-sm", isActive && opt.color)}>{opt.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{opt.subtitle}</p>
                </div>
                <div
                  className={cn(
                    "h-4 w-4 rounded-full border-2 shrink-0 transition-colors",
                    isActive ? `${opt.borderColor} bg-current` : "border-muted-foreground/40"
                  )}
                />
              </button>
            );
          })}
        </div>

        <Button
          className="w-full mt-1"
          disabled={!selected || saving}
          onClick={handleSave}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          {saving ? "Saving…" : "Go to my dashboard"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
