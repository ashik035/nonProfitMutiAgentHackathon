import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, Loader2, DollarSign, TrendingUp, Clock, Users, Mic, FileText, Copy, Download, Paperclip, Edit3 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DonorProfileSheet } from "@/components/donors/DonorProfileSheet";

interface Donor {
  id: string;
  name: string;
  currentGiving: string;
  targetGiving: string;
  assignedTo: string;
  note?: string;
  outreachDate?: string;
  lastContact?: string;
  pledgeAmount?: string;
  pledgeDate?: string;
  upgradeAmount?: string;
  completedDate?: string;
  // Enriched fields for letter generation
  email?: string;
  fundDesignation?: string;
  totalGiving?: string;
  lastGiftAmount?: string;
  lastGiftDate?: string;
  givingHistory?: string;
  contactNotes?: string;
  volunteerHistory?: string;
}

interface Column {
  id: string;
  title: string;
  color: string;
  borderColor: string;
}

const COLUMNS: Column[] = [
  { id: "identified", title: "Identified", color: "bg-blue-50 dark:bg-blue-950/30", borderColor: "border-t-blue-500" },
  { id: "outreach", title: "Outreach Scheduled", color: "bg-cyan-50 dark:bg-cyan-950/30", borderColor: "border-t-cyan-500" },
  { id: "conversation", title: "In Conversation", color: "bg-emerald-50 dark:bg-emerald-950/30", borderColor: "border-t-emerald-500" },
  { id: "pledge", title: "Pledge Made", color: "bg-amber-50 dark:bg-amber-950/30", borderColor: "border-t-amber-500" },
  { id: "upgraded", title: "Upgraded ✓", color: "bg-green-50 dark:bg-green-950/30", borderColor: "border-t-green-600" },
];

const INITIAL_DONORS: Record<string, Donor[]> = {
  identified: [
    { id: "d1", name: "Margaret Liu", currentGiving: "$2,500/yr", targetGiving: "$5,000/yr", assignedTo: "Maria Santos",
      email: "margaret.liu@email.com", fundDesignation: "Technology Access", totalGiving: "$8,750",
      lastGiftAmount: "$2,500", lastGiftDate: "January 2026",
      givingHistory: "$2,500 (Jan 2026), $2,500 (Jan 2025), $2,000 (Jan 2024), $1,750 (Jan 2023)",
      contactNotes: "Retired software engineer. Passionate about digital literacy for underserved youth. Volunteers as a coding mentor every Saturday.",
      volunteerHistory: "Weekly coding mentor since 2023, attended Tech for Good gala 2025" },
    { id: "d2", name: "Robert Kim", currentGiving: "$1,800/yr", targetGiving: "$3,000/yr", assignedTo: "",
      email: "r.kim@email.com", fundDesignation: "General Operating", totalGiving: "$5,400",
      lastGiftAmount: "$1,800", lastGiftDate: "December 2025",
      givingHistory: "$1,800 (Dec 2025), $1,800 (Dec 2024), $1,800 (Dec 2023)",
      contactNotes: "Local business owner — Kim's Hardware. Interested in workforce development programs.",
      volunteerHistory: "Donated supplies for community center renovation 2024" },
    { id: "d3", name: "Patricia Osei", currentGiving: "$3,200/yr", targetGiving: "$7,500/yr", assignedTo: "Maria Santos",
      email: "p.osei@email.com", fundDesignation: "Youth Programs", totalGiving: "$12,800",
      lastGiftAmount: "$3,200", lastGiftDate: "February 2026",
      givingHistory: "$3,200 (Feb 2026), $3,200 (Feb 2025), $3,200 (Feb 2024), $3,200 (Feb 2023)",
      contactNotes: "School principal. Deeply invested in after-school tutoring program. Has referred three other donors.",
      volunteerHistory: "Board advisory committee member, Spring Gala host committee 2025" },
  ],
  outreach: [
    { id: "d4", name: "David Chen", currentGiving: "$2,100/yr", targetGiving: "$5,000/yr", assignedTo: "Maria Santos", outreachDate: "Apr 10, 2026",
      email: "david.chen@email.com", fundDesignation: "General Operating", totalGiving: "$6,300",
      lastGiftAmount: "$2,100", lastGiftDate: "November 2025",
      givingHistory: "$2,100 (Nov 2025), $2,100 (Nov 2024), $2,100 (Nov 2023)",
      contactNotes: "Financial advisor. Expressed interest in planned giving program at last event.",
      volunteerHistory: "Attended Fall Fundraiser 2024 and 2025" },
    { id: "d5", name: "Susan Park", currentGiving: "$4,500/yr", targetGiving: "$10,000/yr", assignedTo: "Kevin Park", outreachDate: "Apr 12, 2026",
      email: "susan.park@email.com", fundDesignation: "Youth Programs", totalGiving: "$18,000",
      lastGiftAmount: "$4,500", lastGiftDate: "March 2026",
      givingHistory: "$4,500 (Mar 2026), $4,500 (Mar 2025), $4,500 (Sep 2024), $4,500 (Mar 2024)",
      contactNotes: "Pediatrician. Her daughter participated in our summer camp. Interested in scholarship fund naming.",
      volunteerHistory: "Health screening volunteer 2024, Summer Camp sponsor 2025" },
  ],
  conversation: [
    { id: "d6", name: "Jennifer Walsh", currentGiving: "$1,950/yr", targetGiving: "$5,000/yr", assignedTo: "Maria Santos", lastContact: "Apr 5",
      note: "Very interested in naming opportunity for youth programs room",
      email: "jennifer.walsh@email.com", fundDesignation: "Youth Programs", totalGiving: "$7,350",
      lastGiftAmount: "$750", lastGiftDate: "March 2026",
      givingHistory: "$750 (Mar 2026), $500 (Dec 2025), $700 (Jun 2025), $500 (Dec 2024), $500 (Mar 2024)",
      contactNotes: "Attorney. Youth education meant a great deal to her late mother, Eleanor Walsh, who volunteered here for 15 years. Jennifer is considering a naming gift in her mother's honor.",
      volunteerHistory: "Attended Spring Gala 2025 and 2026, Eleanor Walsh Memorial donor since 2024" },
    { id: "d7", name: "Mark Abrams", currentGiving: "$3,800/yr", targetGiving: "$7,500/yr", assignedTo: "Kevin Park", lastContact: "Apr 3",
      note: "Meeting scheduled Apr 15 with ED",
      email: "mark.abrams@email.com", fundDesignation: "General Operating", totalGiving: "$15,200",
      lastGiftAmount: "$3,800", lastGiftDate: "January 2026",
      givingHistory: "$3,800 (Jan 2026), $3,800 (Jan 2025), $3,800 (Jan 2024), $3,800 (Jan 2023)",
      contactNotes: "Real estate developer. Long-time supporter since founding. Interested in capital campaign for new community center wing.",
      volunteerHistory: "Founding donor, attended every annual gala, site tour host for potential donors" },
  ],
  pledge: [
    { id: "d8", name: "Thomas Rivera", currentGiving: "$2,500/yr", targetGiving: "$5,000/yr", assignedTo: "Maria Santos", pledgeAmount: "$5,000", pledgeDate: "Apr 1, 2026",
      email: "thomas.rivera@email.com", fundDesignation: "General Operating", totalGiving: "$12,500",
      lastGiftAmount: "$5,000", lastGiftDate: "April 2026",
      givingHistory: "$5,000 pledge (Apr 2026), $2,500 (Jan 2026), $2,500 (Jan 2025), $2,500 (Jan 2024), $2,500 (Jan 2023), $2,500 (Jan 2022)",
      contactNotes: "Retired teacher. Believes strongly in educational equity. His grandchildren attend our after-school program.",
      volunteerHistory: "Reading tutor volunteer 2022-present, Mentor Match program participant" },
  ],
  upgraded: [
    { id: "d9", name: "Carol Nguyen", currentGiving: "$1,200/yr", targetGiving: "$2,500/yr", assignedTo: "Maria Santos", upgradeAmount: "+$1,300/yr", completedDate: "Mar 28, 2026",
      email: "carol.nguyen@email.com", fundDesignation: "Technology Access", totalGiving: "$4,900",
      lastGiftAmount: "$2,500", lastGiftDate: "March 2026",
      givingHistory: "$2,500 (Mar 2026 — upgraded!), $1,200 (Mar 2025), $1,200 (Mar 2024), $1,000 (Mar 2023)",
      contactNotes: "IT consultant. Upgraded after seeing demo of new computer lab. Very excited about STEM curriculum.",
      volunteerHistory: "Computer lab setup volunteer, Tech Career Day speaker 2025" },
  ],
};

const STAFF = ["Maria Santos", "Kevin Park", "Lisa Chen"];

export default function DonorPipelinePage() {
  const navigate = useNavigate();
  const [donors, setDonors] = useState(INITIAL_DONORS);
  const [outreachModal, setOutreachModal] = useState<Donor | null>(null);
  const [contactModal, setContactModal] = useState<Donor | null>(null);
  const [pledgeModal, setPledgeModal] = useState<Donor | null>(null);
  const [giftModal, setGiftModal] = useState<Donor | null>(null);
  const [profileDrawer, setProfileDrawer] = useState<Donor | null>(null);
  const [unifiedProfileDonor, setUnifiedProfileDonor] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Letter generation state
  const [letterLoading, setLetterLoading] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState<string | null>(null);
  const [editingLetter, setEditingLetter] = useState(false);
  const [editedLetter, setEditedLetter] = useState("");

  const totalInPipeline = Object.values(donors).flat().length;

  const moveDonor = (donorId: string, fromCol: string, toCol: string) => {
    setDonors((prev) => {
      const donor = prev[fromCol]?.find((d) => d.id === donorId);
      if (!donor) return prev;
      return {
        ...prev,
        [fromCol]: prev[fromCol].filter((d) => d.id !== donorId),
        [toCol]: [...(prev[toCol] || []), donor],
      };
    });
  };

  const handleScheduleOutreach = (donor: Donor) => {
    moveDonor(donor.id, "identified", "outreach");
    setOutreachModal(null);
    toast.success(`✓ Outreach scheduled for ${donor.name}`);
  };

  const handleMoveToConversation = (donor: Donor) => {
    moveDonor(donor.id, "outreach", "conversation");
    toast.success(`✓ Moved ${donor.name} to In Conversation`);
  };

  const handleRecordGift = (donor: Donor) => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      moveDonor(donor.id, "pledge", "upgraded");
      setGiftModal(null);
      toast.success(`✓ Gift of ${donor.pledgeAmount || "$5,000"} recorded for ${donor.name} — Salesforce updated`);
    }, 1500);
  };

  const handleAssign = (donorId: string, col: string, staffName: string) => {
    setDonors((prev) => ({
      ...prev,
      [col]: prev[col].map((d) => d.id === donorId ? { ...d, assignedTo: staffName } : d),
    }));
    toast.success(`✓ Assigned to ${staffName}`);
  };

  const handleGenerateLetter = async (donor: Donor) => {
    setLetterLoading(true);
    setGeneratedLetter(null);
    setEditingLetter(false);
    try {
      const { data, error } = await supabase.functions.invoke("generate-donor-letter", {
        body: { donor },
      });
      if (error) throw error;
      const letter = data?.letter || "Letter generation failed.";
      setGeneratedLetter(letter);
      setEditedLetter(letter);
      toast.success("✓ Acknowledgment letter generated");
    } catch (err) {
      console.error("Letter generation error:", err);
      toast.error("Failed to generate letter. Please try again.");
    } finally {
      setLetterLoading(false);
    }
  };

  const handleCopyLetter = () => {
    const text = editingLetter ? editedLetter : generatedLetter;
    if (text) {
      navigator.clipboard.writeText(text);
      toast.success("✓ Letter copied to clipboard");
    }
  };

  const handleDownloadLetter = () => {
    const text = editingLetter ? editedLetter : generatedLetter;
    if (!text || !profileDrawer) return;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Acknowledgment_Letter_${profileDrawer.name.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("✓ Letter downloaded");
  };

  const handleAttachLetter = () => {
    if (profileDrawer) {
      toast.success(`✓ Letter attached to ${profileDrawer.name}'s Salesforce record`);
    }
  };

  const resetLetterState = () => {
    setGeneratedLetter(null);
    setEditingLetter(false);
    setEditedLetter("");
    setLetterLoading(false);
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Donor Pipeline</h1>
        <p className="text-sm text-muted-foreground">Brightside Foundation · Mid-level donor upgrade tracking</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total in Pipeline", value: String(totalInPipeline), icon: Users },
          { label: "Est. Upgrade Value", value: "$38,500", icon: DollarSign },
          { label: "Upgrades This Quarter", value: "1", icon: TrendingUp },
          { label: "Avg Days to Upgrade", value: "47", icon: Clock },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {COLUMNS.map((col) => (
          <div key={col.id} className="space-y-3">
            <div className={`rounded-lg border-t-4 ${col.borderColor} bg-card p-3`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">{col.title}</h3>
                <Badge variant="secondary" className="text-xs">{donors[col.id]?.length || 0}</Badge>
              </div>
            </div>
            {(donors[col.id] || []).map((donor) => (
              <Card key={donor.id} className={`${col.color} border shadow-sm`}>
                <CardContent className="p-3 space-y-2">
                  <button
                    className="font-medium text-sm hover:underline text-left"
                    title="View unified donor profile"
                    onClick={() => setUnifiedProfileDonor(donor.name)}
                  >
                    {donor.name}
                  </button>
                  <p className="text-xs text-muted-foreground">{donor.currentGiving} → {donor.targetGiving}</p>
                  {donor.assignedTo && <p className="text-[11px] text-muted-foreground">Assigned: {donor.assignedTo}</p>}
                  {donor.outreachDate && <p className="text-[11px] text-muted-foreground">Outreach: {donor.outreachDate}</p>}
                  {donor.lastContact && <p className="text-[11px] text-muted-foreground">Last contact: {donor.lastContact}</p>}
                  {donor.note && <p className="text-[11px] italic text-muted-foreground">"{donor.note}"</p>}
                  {donor.pledgeAmount && <p className="text-[11px] text-muted-foreground">Pledged: {donor.pledgeAmount} on {donor.pledgeDate}</p>}
                  {donor.upgradeAmount && (
                    <Badge className="bg-green-100 text-green-800 border-0 text-[10px]">UPGRADED ✓ {donor.upgradeAmount}</Badge>
                  )}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {col.id === "identified" && (
                      <>
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setOutreachModal(donor)}>Schedule Outreach</Button>
                        {!donor.assignedTo && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="outline" className="h-7 text-xs">Assign <ChevronDown className="h-3 w-3 ml-1" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              {STAFF.map((s) => <DropdownMenuItem key={s} onClick={() => handleAssign(donor.id, col.id, s)}>{s}</DropdownMenuItem>)}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </>
                    )}
                    {col.id === "outreach" && (
                      <>
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setContactModal(donor)}>Log Contact</Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleMoveToConversation(donor)}>Move to Conversation</Button>
                      </>
                    )}
                    {col.id === "conversation" && (
                      <>
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setContactModal(donor)}>Log Contact</Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setPledgeModal(donor)}>Request Pledge</Button>
                      </>
                    )}
                    {col.id === "pledge" && (
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setGiftModal(donor)}>Record Gift</Button>
                    )}
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { resetLetterState(); setProfileDrawer(donor); }}>View Profile</Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      title="Record voice note"
                      onClick={() => navigate(`/voice-notes?donor=${encodeURIComponent(donor.name)}`)}
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ))}
      </div>

      {/* Outreach Modal */}
      <Dialog open={!!outreachModal} onOpenChange={() => setOutreachModal(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Schedule Outreach — {outreachModal?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <RadioGroup defaultValue="phone">
              <div className="flex items-center gap-2"><RadioGroupItem value="phone" id="phone" /><Label htmlFor="phone">Phone Call</Label></div>
              <div className="flex items-center gap-2"><RadioGroupItem value="coffee" id="coffee" /><Label htmlFor="coffee">Coffee Meeting</Label></div>
              <div className="flex items-center gap-2"><RadioGroupItem value="email" id="email" /><Label htmlFor="email">Email</Label></div>
              <div className="flex items-center gap-2"><RadioGroupItem value="event" id="event" /><Label htmlFor="event">Event Invite</Label></div>
            </RadioGroup>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <Label>Assigned to</Label>
              <Select defaultValue="maria">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STAFF.map((s) => <SelectItem key={s} value={s.toLowerCase().replace(" ", "-")}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea placeholder="Any notes for the outreach…" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOutreachModal(null)}>Cancel</Button>
            <Button onClick={() => outreachModal && handleScheduleOutreach(outreachModal)}>Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Log Modal */}
      <Dialog open={!!contactModal} onOpenChange={() => setContactModal(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Log Contact — {contactModal?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Contact type</Label>
              <Select defaultValue="phone"><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">Phone Call</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Duration (minutes)</Label><Input type="number" defaultValue="15" /></div>
            <div className="space-y-2"><Label>Summary</Label><Textarea placeholder="What was discussed?" /></div>
            <RadioGroup defaultValue="positive">
              <div className="flex items-center gap-2"><RadioGroupItem value="positive" id="pos" /><Label htmlFor="pos">Positive</Label></div>
              <div className="flex items-center gap-2"><RadioGroupItem value="neutral" id="neu" /><Label htmlFor="neu">Neutral</Label></div>
              <div className="flex items-center gap-2"><RadioGroupItem value="followup" id="fu" /><Label htmlFor="fu">Needs Follow-up</Label></div>
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setContactModal(null)}>Cancel</Button>
            <Button onClick={() => { setContactModal(null); toast.success("✓ Contact logged — synced to Salesforce"); }}>Save Contact Log</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pledge Modal */}
      <Dialog open={!!pledgeModal} onOpenChange={() => setPledgeModal(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Request Pledge — {pledgeModal?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Suggested ask amount</Label><Input defaultValue={pledgeModal?.targetGiving?.replace("/yr", "") || ""} /></div>
            <div className="space-y-2"><Label>Assigned to</Label>
              <Select defaultValue="maria"><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STAFF.map((s) => <SelectItem key={s} value={s.toLowerCase().replace(" ", "-")}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Talking points</Label>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>Highlight impact of increased giving on youth programs</li>
                <li>Discuss naming opportunity or recognition benefits</li>
                <li>Share recent success stories from program beneficiaries</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPledgeModal(null)}>Cancel</Button>
            <Button onClick={() => { setPledgeModal(null); toast.success("✓ Ask brief sent to Maria Santos"); }}>Send Ask Brief</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Gift Recording Modal */}
      <Dialog open={!!giftModal} onOpenChange={() => setGiftModal(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record Gift — {giftModal?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Gift amount</Label><Input defaultValue={giftModal?.pledgeAmount || "$5,000"} /></div>
            <div className="space-y-2"><Label>Payment method</Label>
              <Select defaultValue="check"><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="cc">Credit Card</SelectItem>
                  <SelectItem value="ach">ACH</SelectItem>
                  <SelectItem value="stock">Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Fund</Label>
              <Select defaultValue="general"><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Operating</SelectItem>
                  <SelectItem value="youth">Youth Programs</SelectItem>
                  <SelectItem value="tech">Technology</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGiftModal(null)}>Cancel</Button>
            <Button onClick={() => giftModal && handleRecordGift(giftModal)} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Record in Salesforce
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unified donor profile */}
      <DonorProfileSheet donorName={unifiedProfileDonor} onOpenChange={(open) => !open && setUnifiedProfileDonor(null)} />

      {/* Profile Drawer */}
      <Sheet open={!!profileDrawer} onOpenChange={() => { setProfileDrawer(null); resetLetterState(); }}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          {profileDrawer && (
            <>
              <SheetHeader><SheetTitle>{profileDrawer.name}</SheetTitle></SheetHeader>
              <div className="mt-6 space-y-4 text-sm">
                <div className="space-y-2">
                  <p><span className="text-muted-foreground">Current Giving:</span> {profileDrawer.currentGiving}</p>
                  <p><span className="text-muted-foreground">Target:</span> {profileDrawer.targetGiving}</p>
                  <p><span className="text-muted-foreground">Assigned to:</span> {profileDrawer.assignedTo || "Unassigned"}</p>
                  {profileDrawer.email && <p><span className="text-muted-foreground">Email:</span> {profileDrawer.email}</p>}
                  {profileDrawer.fundDesignation && <p><span className="text-muted-foreground">Fund:</span> {profileDrawer.fundDesignation}</p>}
                  {profileDrawer.totalGiving && <p><span className="text-muted-foreground">Total Lifetime Giving:</span> {profileDrawer.totalGiving}</p>}
                  {profileDrawer.contactNotes && <p><span className="text-muted-foreground">Notes:</span> {profileDrawer.contactNotes}</p>}
                  {profileDrawer.volunteerHistory && <p><span className="text-muted-foreground">Volunteer/Events:</span> {profileDrawer.volunteerHistory}</p>}
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Giving History</h4>
                  {profileDrawer.givingHistory ? (
                    <p className="text-xs text-muted-foreground">{profileDrawer.givingHistory}</p>
                  ) : (
                    <table className="w-full text-xs">
                      <thead><tr className="border-b"><th className="text-left py-1">Date</th><th className="text-right py-1">Amount</th></tr></thead>
                      <tbody>
                        <tr className="border-b"><td className="py-1">Mar 2026</td><td className="text-right py-1">$500</td></tr>
                        <tr className="border-b"><td className="py-1">Dec 2025</td><td className="text-right py-1">$1,000</td></tr>
                        <tr><td className="py-1">Jun 2025</td><td className="text-right py-1">$500</td></tr>
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Generate Letter Button */}
                <Button
                  className="w-full"
                  onClick={() => handleGenerateLetter(profileDrawer)}
                  disabled={letterLoading}
                >
                  {letterLoading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating Letter…</>
                  ) : (
                    <><FileText className="h-4 w-4 mr-2" /> Generate Acknowledgment Letter</>
                  )}
                </Button>

                {/* Letter Preview */}
                {generatedLetter && (
                  <div className="space-y-3">
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-sm">Acknowledgment Letter</h4>
                        <Badge variant="secondary" className="text-[10px]">AI Generated</Badge>
                      </div>
                      <div className="bg-white dark:bg-card border rounded-lg p-6 shadow-sm">
                        {/* Letterhead */}
                        <div className="border-b pb-3 mb-4">
                          <p className="font-semibold text-sm text-primary">Brightside Foundation</p>
                          <p className="text-[10px] text-muted-foreground">1200 Community Drive, Suite 300 · Springfield, IL 62701</p>
                        </div>

                        {/* Letter Body */}
                        {editingLetter ? (
                          <Textarea
                            value={editedLetter}
                            onChange={(e) => setEditedLetter(e.target.value)}
                            className="min-h-[300px] font-serif text-sm leading-relaxed border-0 shadow-none p-0 focus-visible:ring-0"
                          />
                        ) : (
                          <div className="font-serif text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                            {generatedLetter}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" onClick={handleCopyLetter}>
                        <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy to Clipboard
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleDownloadLetter}>
                        <Download className="h-3.5 w-3.5 mr-1.5" /> Download
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleAttachLetter}>
                        <Paperclip className="h-3.5 w-3.5 mr-1.5" /> Attach to Record
                      </Button>
                      <Button
                        variant={editingLetter ? "default" : "outline"}
                        size="sm"
                        onClick={() => setEditingLetter(!editingLetter)}
                      >
                        <Edit3 className="h-3.5 w-3.5 mr-1.5" /> {editingLetter ? "Done Editing" : "Edit Letter"}
                      </Button>
                    </div>
                  </div>
                )}

                <Button variant="outline" className="w-full" onClick={() => { setProfileDrawer(null); resetLetterState(); }}>Close</Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
