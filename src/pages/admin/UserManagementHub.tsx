/**
 * User Management Hub — layout shell.
 *
 * Renders the page header + breadcrumb, then an <Outlet /> for the active
 * sub-route (People & Invites, Roles & Permissions).
 */
import { Link, Outlet, useLocation } from "react-router-dom";

const CRUMBS: Record<string, string> = {
  "": "People & Invites",
  roles: "Roles & Permissions",
};

export default function UserManagementHub() {
  const { pathname } = useLocation();
  const segment = pathname.replace(/^\/admin\/users\/?/, "").split("/")[0] ?? "";
  const label = CRUMBS[segment] ?? "People & Invites";

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/admin" className="hover:text-foreground">Admin</Link>
          <span>/</span>
          <Link to="/admin/users" className="hover:text-foreground">User Management</Link>
          <span>/</span>
          <span className="text-foreground">{label}</span>
        </div>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          Manage people, invitations, roles, and permissions.
        </p>
      </div>

      <Outlet />
    </div>
  );
}
