/**
 * RoleGate
 *
 * Wraps any page or UI element — if the user has access it renders children,
 * if not it shows a clean "Contact your admin" message.
 *
 * When ROLE_GATING_ENABLED is false, always renders children.
 */

import React from "react";
import { ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useNonprofitRolePermissions } from "@/hooks/useNonprofitRolePermissions";
import { ROLE_GATING_ENABLED } from "@/shared/config/roleGating";

interface RoleGateProps {
  /** Resource type to check */
  resourceType: "module" | "agent";
  /** Resource key to check (e.g. "data-health", "crm-data-integrity") */
  resourceKey: string;
  /** Content to render when access is granted */
  children: React.ReactNode;
  /** Optional custom fallback */
  fallback?: React.ReactNode;
}

export function RoleGate({ resourceType, resourceKey, children, fallback }: RoleGateProps) {
  const { hasPermission, isLoading } = useNonprofitRolePermissions();

  // When gating is off, always show children
  if (!ROLE_GATING_ENABLED) return <>{children}</>;

  // While loading permissions, show children to avoid flash
  if (isLoading) return <>{children}</>;

  if (hasPermission(resourceType, resourceKey)) {
    return <>{children}</>;
  }

  if (fallback) return <>{fallback}</>;

  return (
    <div className="flex items-center justify-center min-h-[300px] p-8">
      <Card className="max-w-md w-full">
        <CardContent className="flex flex-col items-center gap-4 pt-8 pb-8 text-center">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <ShieldAlert className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Access Restricted</h3>
            <p className="text-sm text-muted-foreground">
              Contact your admin to request access to this module.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
