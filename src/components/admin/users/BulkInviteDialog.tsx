/**
 * BulkInviteDialog — paste a list of emails to invite many users at once.
 */
import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useCreateUserInvite } from "@/hooks/useUserInvites";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type RowResult = { email: string; role: string; ok: boolean; error?: string };

const VALID_ROLES = new Set(["user", "moderator", "admin"]);

function parseInput(text: string): Array<{ email: string; role: string }> {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .map((line) => {
      const [emailRaw, roleRaw] = line.split(",").map((s) => s?.trim());
      const role = roleRaw && VALID_ROLES.has(roleRaw.toLowerCase()) ? roleRaw.toLowerCase() : "user";
      return { email: emailRaw, role };
    })
    .filter((r) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email));
}

export default function BulkInviteDialog({ open, onOpenChange }: Props) {
  const [text, setText] = useState("");
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<RowResult[]>([]);
  const createInvite = useCreateUserInvite();

  const parsed = parseInput(text);

  const run = async () => {
    if (parsed.length === 0) {
      toast.error("No valid email addresses found");
      return;
    }
    setRunning(true);
    const next: RowResult[] = [];
    for (const row of parsed) {
      try {
        await createInvite.mutateAsync({ email: row.email, role: row.role });
        next.push({ ...row, ok: true });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed";
        next.push({ ...row, ok: false, error: msg });
      }
    }
    setResults(next);
    setRunning(false);
    const okCount = next.filter((r) => r.ok).length;
    toast.success(`${okCount} of ${next.length} invitations sent`);
  };

  const reset = () => {
    setText("");
    setResults([]);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Bulk invite users
          </DialogTitle>
          <DialogDescription>
            Paste one email per line. Optionally append a role:
            <code className="ml-1 rounded bg-muted px-1">email,role</code>
            (role = user | moderator | admin). Defaults to <code>user</code>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <Label htmlFor="bulk-emails">Emails</Label>
          <Textarea
            id="bulk-emails"
            rows={8}
            placeholder={"jane@nonprofit.org\nbob@nonprofit.org,moderator\n# comments allowed"}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="font-mono text-sm"
            disabled={running}
          />
          <p className="text-xs text-muted-foreground">
            {parsed.length} valid {parsed.length === 1 ? "entry" : "entries"} detected.
          </p>

          {results.length > 0 && (
            <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border p-2 text-sm">
              {results.map((r, i) => (
                <div key={i} className="flex items-center gap-2">
                  {r.ok
                    ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    : <AlertCircle  className="h-4 w-4 text-destructive shrink-0" />}
                  <span className="flex-1 truncate">{r.email}</span>
                  <span className="text-xs text-muted-foreground">{r.ok ? r.role : r.error}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={running}>
            Close
          </Button>
          <Button onClick={run} disabled={running || parsed.length === 0}>
            {running ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending {parsed.length}…</>
            ) : (
              <><Upload className="mr-2 h-4 w-4" />Send {parsed.length} invites</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
