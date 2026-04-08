import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ChevronDown, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export type DemoRole = "executive_director" | "development_director" | "finance_manager" | "operations_manager";

const ROLES: { value: DemoRole; label: string }[] = [
  { value: "executive_director", label: "Executive Director" },
  { value: "development_director", label: "Development Director" },
  { value: "finance_manager", label: "Finance Manager" },
  { value: "operations_manager", label: "Operations Manager" },
];

const STORAGE_KEY = "demo-role-override";

export function useDemoRole(): [DemoRole, (role: DemoRole) => void] {
  const [role, setRoleState] = useState<DemoRole>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && ROLES.some((r) => r.value === stored)) return stored as DemoRole;
    } catch {}
    return "executive_director";
  });

  const setRole = (newRole: DemoRole) => {
    setRoleState(newRole);
    try { localStorage.setItem(STORAGE_KEY, newRole); } catch {}
    toast.success(`Viewing as ${ROLES.find((r) => r.value === newRole)?.label}`);
  };

  return [role, setRole];
}

export function DemoRoleSwitcher({ role, onRoleChange }: { role: DemoRole; onRoleChange: (role: DemoRole) => void }) {
  const currentLabel = ROLES.find((r) => r.value === role)?.label ?? "Executive Director";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 rounded-full border-border bg-muted/50 px-3 text-xs font-medium text-foreground hover:bg-muted"
        >
          <User className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{currentLabel}</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {ROLES.map((r) => (
          <DropdownMenuItem
            key={r.value}
            onClick={() => onRoleChange(r.value)}
            className={role === r.value ? "bg-accent font-medium" : ""}
          >
            {r.label}
            {role === r.value && <span className="ml-auto text-primary text-xs">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
