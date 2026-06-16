/**
 * InvitesPanel — pending user invites with resend / revoke.
 */
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, RefreshCw, X, Loader2, Inbox, UserPlus, Upload } from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
  useUserInvites,
  useDeleteUserInvite,
  useResendUserInvite,
} from "@/hooks/useUserInvites";
import AddUserDialog from "./AddUserDialog";
import BulkInviteDialog from "./BulkInviteDialog";

export default function InvitesPanel() {
  const { data: invites = [], isLoading } = useUserInvites();
  const del = useDeleteUserInvite();
  const resend = useResendUserInvite();
  const [addOpen, setAddOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Pending Invitations</CardTitle>
              <CardDescription>
                Invites that have been sent but not yet accepted. Resend to extend
                the link by 7 days, or revoke to cancel.
              </CardDescription>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={() => setBulkOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Bulk Invite
              </Button>
              <Button size="sm" onClick={() => setAddOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite User
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : invites.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
              <Inbox className="h-8 w-8" />
              <p>No pending invitations.</p>
              <p className="text-xs">
                Click "Invite User" to send your first invitation.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {invites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{invite.email}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline">{invite.role}</Badge>
                        <span>Expires {formatDate(invite.expires_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => resend.mutate(invite.id)}
                      disabled={resend.isPending}
                    >
                      <RefreshCw className="mr-1 h-4 w-4" />
                      Resend
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => del.mutate(invite.id)}
                      disabled={del.isPending}
                    >
                      <X className="mr-1 h-4 w-4 text-destructive" />
                      Revoke
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddUserDialog open={addOpen} onOpenChange={setAddOpen} />
      <BulkInviteDialog open={bulkOpen} onOpenChange={setBulkOpen} />
    </>
  );
}
