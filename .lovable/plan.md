## Enable Role-Based Access Control

The RBAC system is fully implemented and wired up — sidebar navigation filtering, agent visibility filtering, and the `RoleGate` component all work correctly. However, the feature flag `ROLE_GATING_ENABLED` is set to `false`, which causes `hasPermission()` to always return `true` for everyone.

### Change

**File: `src/shared/config/roleGating.ts`**
- Set `ROLE_GATING_ENABLED = true`

### What this activates

- **Sidebar navigation**: Items with `requiredPermission` (Data Health, Grants, Events, Board Reports, Reconciliation, Donor Pipeline) will only show for roles that have matching permissions in the `nonprofit_role_permissions` table.
- **Agent visibility**: Agents with a `permissionKey` (Grant Budget Watcher, Integration Health Monitor, Onboarding Checklist AI) will only show for authorized roles.
- **Admin + Executive Director**: Full access to everything (unchanged).
- **No role assigned**: Full access (legacy fallback, unchanged).
- **Development Director, Finance Manager, Operations Manager**: See only their permitted modules and agents per the seeded permission rules.

### Risk

Low — single line change. If anything breaks, flipping back to `false` restores current behavior instantly.
