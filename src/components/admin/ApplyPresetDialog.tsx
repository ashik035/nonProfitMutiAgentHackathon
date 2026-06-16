import { Check, Loader2, Minus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { PresetApplySummary, PricingPreset } from "@/shared/config/pricingPresets";

interface ApplyPresetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preset: PricingPreset | null;
  summary: PresetApplySummary | null;
  isPending: boolean;
  onConfirm: () => void;
}

function ModuleChangeList({
  items,
  icon: Icon,
  iconClassName,
}: {
  items: PresetApplySummary["enabling"];
  icon: typeof Check;
  iconClassName: string;
}) {
  if (items.length === 0) return null;

  return (
    <ul className="space-y-2 max-h-48 overflow-y-auto pr-1">
      {items.map((item) => (
        <li key={item.id} className="flex items-start gap-2 text-sm">
          <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${iconClassName}`} />
          <span>
            <span className="font-medium">{item.name}</span>
            {item.pageRoute && (
              <span className="text-muted-foreground ml-1.5 font-mono text-xs">
                {item.pageRoute}
              </span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function ApplyPresetDialog({
  open,
  onOpenChange,
  preset,
  summary,
  isPending,
  onConfirm,
}: ApplyPresetDialogProps) {
  if (!preset || !summary) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Apply {preset.name} preset?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4 text-left text-sm text-muted-foreground">
              <p>
                This will update which modules are visible to all users. Core modules
                (Dashboard, AI Agents) always stay on.
              </p>

              <div>
                <p className="font-medium text-foreground mb-2 flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-green-600" />
                  Modules that will be enabled
                </p>
                {summary.enabling.length > 0 ? (
                  <ModuleChangeList
                    items={summary.enabling}
                    icon={Check}
                    iconClassName="text-green-600"
                  />
                ) : (
                  <p className="text-sm">No additional modules will be enabled.</p>
                )}
              </div>

              {summary.disabling.length > 0 && (
                <div>
                  <p className="font-medium text-foreground mb-2 flex items-center gap-1.5">
                    <Minus className="h-4 w-4 text-amber-600" />
                    Modules that will be turned off
                  </p>
                  <ModuleChangeList
                    items={summary.disabling}
                    icon={Minus}
                    iconClassName="text-amber-600"
                  />
                  <p className="text-xs mt-2">
                    Users will lose sidebar access and be redirected if they visit these
                    routes directly.
                  </p>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button onClick={onConfirm} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Applying…
              </>
            ) : (
              "Confirm and apply"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
