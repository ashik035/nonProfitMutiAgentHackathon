import { useState } from "react";
import { format } from "date-fns";
import { Ticket } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { useSupportTickets, useUpdateSupportTicket, type SupportTicket } from "@/hooks/useSupportTickets";

const categoryColors: Record<string, string> = {
  "Bug Report": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  "Feature Request": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  "Integration Issue": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  "General Question": "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

const statusColors: Record<string, string> = {
  open: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  resolved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

const statusLabels: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
};

export default function AdminSupportTickets() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const { data: tickets, isLoading } = useSupportTickets(statusFilter);
  const updateTicket = useUpdateSupportTicket();

  const openSheet = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setEditStatus(ticket.status);
    setEditNotes(ticket.admin_notes ?? "");
  };

  const handleSave = () => {
    if (!selectedTicket) return;
    updateTicket.mutate(
      { id: selectedTicket.id, status: editStatus, admin_notes: editNotes || null },
      { onSuccess: () => setSelectedTicket(null) }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Support Tickets</h1>
        <p className="text-muted-foreground">Submitted by users via the Help page</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              <CardTitle className="text-base">All Tickets</CardTitle>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Loading…</p>
          ) : !tickets?.length ? (
            <p className="text-center py-8 text-muted-foreground">No support tickets yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Submitted</TableHead>
                  <TableHead>User Email</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(t.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>{t.user_email ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={categoryColors[t.category] ?? ""}>
                        {t.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[240px] truncate">{t.subject}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusColors[t.status] ?? ""}>
                        {statusLabels[t.status] ?? t.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => openSheet(t)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail Sheet */}
      <Sheet open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          {selectedTicket && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedTicket.subject}</SheetTitle>
                <SheetDescription>
                  {selectedTicket.user_email ?? "Unknown user"} · {format(new Date(selectedTicket.created_at), "MMM d, yyyy")}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-5">
                <div>
                  <p className="text-sm font-medium mb-1">Category</p>
                  <Badge variant="secondary" className={categoryColors[selectedTicket.category] ?? ""}>
                    {selectedTicket.category}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">Description</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedTicket.description}</p>
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">Status</p>
                  <Select value={editStatus} onValueChange={setEditStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">Admin Notes</p>
                  <Textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Internal notes about this ticket…"
                    className="min-h-[100px]"
                  />
                </div>

                <Button onClick={handleSave} disabled={updateTicket.isPending} className="w-full">
                  {updateTicket.isPending ? "Saving…" : "Save Changes"}
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
