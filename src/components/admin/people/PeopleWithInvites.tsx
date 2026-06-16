/**
 * People + Pending Invites — single page combining both surfaces.
 */
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

const PeoplePanel = lazy(() => import("@/pages/admin/UserManagement"));
const InvitesPanel = lazy(() => import("@/components/admin/users/InvitesPanel"));

export default function PeopleWithInvites() {
  return (
    <div className="space-y-10">
      <Suspense fallback={<div className="flex h-40 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}>
        <PeoplePanel />
      </Suspense>

      <div className="border-t pt-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Pending Invites</h2>
          <p className="text-sm text-muted-foreground">Outstanding invitations — resend or revoke as needed.</p>
        </div>
        <Suspense fallback={<div className="flex h-40 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}>
          <InvitesPanel />
        </Suspense>
      </div>
    </div>
  );
}
