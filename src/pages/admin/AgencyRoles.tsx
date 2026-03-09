import { useState } from "react";
import { Users, Building2, FolderKanban, User, Search, Loader2, DollarSign, Settings, ShieldCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  useAgencyRoleAdmin,
  useUpsertAgencyRole,
  type UserAgencyRow,
} from "@/hooks/useAgencyRoleAdmin";
import { type AgencyRole, ROLE_DISPLAY_NAMES } from "@/hooks/useAgencyRole";

const ROLE_LABELS: Record<string, string> = {
  executive_director: ROLE_DISPLAY_NAMES.executive_director,
  development_director: ROLE_DISPLAY_NAMES.development_director,
  finance_manager: ROLE_DISPLAY_NAMES.finance_manager,
  operations_manager: ROLE_DISPLAY_NAMES.operations_manager,
  admin: ROLE_DISPLAY_NAMES.admin,
};

const ROLE_COLORS: Record<string, string> = {
  executive_director: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  development_director: "bg-green-500/15 text-green-700 dark:text-green-400",
  finance_manager: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  operations_manager: "bg-teal-500/15 text-teal-700 dark:text-teal-400",
  admin: "bg-slate-500/15 text-slate-700 dark:text-slate-400",
};

const ROLE_ICONS: Record<string, React.ElementType> = {
  executive_director: Building2,
  development_director: FolderKanban,
  finance_manager: DollarSign,
  operations_manager: Settings,
  admin: ShieldCheck,
};

function initials(name: string | null, email: string | null): string {
  if (name) {
    return name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  }
  return (email?.[0] ?? "?").toUpperCase();
}

function UserRow({ row }: { row: UserAgencyRow }) {
  const upsert = useUpsertAgencyRole();
  const [localRole, setLocalRole] = useState<AgencyRole | "none">(row.agency_role ?? "none");

  const RoleIcon = localRole !== "none" ? (ROLE_ICONS[localRole] ?? User) : User;

  const handleRoleChange = (val: string) => {
    const newRole = val === "none" ? null : (val as AgencyRole);
    setLocalRole(val as AgencyRole | "none");
    upsert.mutate({
      user_id: row.user_id,
      agency_role: newRole,
    });
  };

  return (
    <div className="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-muted/30 transition-colors">
      {/* Avatar */}
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src={row.avatar_url ?? undefined} alt={row.full_name ?? ""} />
        <AvatarFallback className="text-xs">
          {initials(row.full_name, row.email)}
        </AvatarFallback>
      </Avatar>

      {/* Name + email */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{row.full_name ?? "—"}</p>
        <p className="text-xs text-muted-foreground truncate">{row.email}</p>
      </div>

      {/* Current role badge */}
      {localRole !== "none" ? (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium shrink-0",
            ROLE_COLORS[localRole]
          )}
        >
          <RoleIcon className="h-3 w-3" />
          {ROLE_LABELS[localRole]}
        </span>
      ) : (
        <span className="text-xs text-muted-foreground shrink-0 italic">unassigned</span>
      )}

      {/* Role selector */}
      <Select value={localRole} onValueChange={handleRoleChange} disabled={upsert.isPending}>
        <SelectTrigger className="h-8 w-32 text-xs">
          <SelectValue placeholder="Assign role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No role</SelectItem>
          <SelectItem value="executive_director">Executive Director</SelectItem>
          <SelectItem value="development_director">Development Director</SelectItem>
          <SelectItem value="finance_manager">Finance Manager</SelectItem>
          <SelectItem value="operations_manager">Operations Manager</SelectItem>
          <SelectItem value="admin">Administrator</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export default function AgencyRoles() {
  const { data: users, isLoading } = useAgencyRoleAdmin();
  const [search, setSearch] = useState("");

  const filtered = (users ?? []).filter((u) => {
    const q = search.toLowerCase();
    return (
      (u.full_name ?? "").toLowerCase().includes(q) ||
      (u.email ?? "").toLowerCase().includes(q)
    );
  });

  const assignedCount = (users ?? []).filter((u) => u.agency_role !== null).length;

  // Summary counts per role
  const counts = (users ?? []).reduce<Record<string, number>>(
    (acc, u) => {
      if (u.agency_role) acc[u.agency_role] = (acc[u.agency_role] ?? 0) + 1;
      return acc;
    },
    {}
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                Agency Role Assignment
              </CardTitle>
              <CardDescription className="mt-1">
                {assignedCount} of {users?.length ?? 0} users have been assigned an agency role.
                Unassigned users see the generic dashboard and are prompted to pick a role on
                first login.
              </CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              {(["executive_director", "development_director", "finance_manager", "operations_manager", "admin"] as const).map((role) => (
                <Badge
                  key={role}
                  variant="outline"
                  className={cn("capitalize text-xs", ROLE_COLORS[role])}
                >
                  {ROLE_LABELS[role]}: {counts[role] ?? 0}
                </Badge>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </CardHeader>

        <CardContent className="px-2 pb-4">
          {/* Column headers */}
          <div className="flex items-center gap-4 px-4 pb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide border-b mb-1">
            <div className="w-8 shrink-0" />
            <div className="flex-1">User</div>
            <div className="w-20 shrink-0 text-center">Role</div>
            <div className="w-32 shrink-0 text-center">Assign</div>
          </div>

          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {search ? "No users match your search." : "No users found."}
            </p>
          ) : (
            <div className="divide-y divide-border/40">
              {filtered.map((row) => (
                <UserRow key={row.user_id} row={row} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Role descriptions</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1.5">
          <p>
            <strong className="text-foreground">Executive Director</strong> — Organization at a glance:
            data health, grant deadlines, board reports, donor growth.
          </p>
          <p>
            <strong className="text-foreground">Development Director</strong> — Donor and engagement
            activity: untagged attendees, pipeline prospects, follow-up tasks.
          </p>
          <p>
            <strong className="text-foreground">Finance Manager</strong> — Financial operations:
            unmatched transactions, restricted fund alerts, grant utilization.
          </p>
          <p>
            <strong className="text-foreground">Operations Manager</strong> — System and data operations:
            data health, active AI agents, integrations, pending AI actions.
          </p>
          <p>
            <strong className="text-foreground">Administrator</strong> — Combined view of all dashboard
            cards and system administration.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
