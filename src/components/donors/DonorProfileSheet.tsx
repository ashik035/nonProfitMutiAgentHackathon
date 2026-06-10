/**
 * DonorProfileSheet — unified donor profile slide-over.
 *
 * Aggregates everything known about one donor across the app:
 * pipeline stage, giving history (live nonprofit_donations + demo),
 * membership, engagement score, next best action, and outreach history.
 *
 * Pure UI aggregation matched by donor name — no backend changes.
 * Opened from Donor Pipeline, Donor Retention, Donation Center,
 * and Communications.
 */

import { useState } from "react";
import { toast } from "sonner";
import {
  Heart, Mail, CreditCard, Sparkles, GitBranch, History, BadgeDollarSign, Phone, UserSearch,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useDonations } from "@/hooks/useDonations";
import {
  findDonorProfile, DEMO_DONATIONS_RECENT, DEMO_MEMBERS,
} from "@/shared/data/nonprofitDemoData";
import { donorScoreColor, segmentBadgeColor } from "@/components/donors/donorBadges";

export function DonorProfileSheet({
  donorName,
  onOpenChange,
}: {
  donorName: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [emailOpen, setEmailOpen] = useState(false);
  const { data: liveDonations = [], isLoading: donationsLoading } = useDonations();

  const profile = findDonorProfile(donorName);

  // Giving history: live DB rows matched by name, demo rows as fallback
  const liveGifts = donorName
    ? liveDonations.filter((d) => d.donor_name?.trim().toLowerCase() === donorName.trim().toLowerCase())
    : [];
  const demoGifts = donorName
    ? DEMO_DONATIONS_RECENT.filter((d) => d.donorName.trim().toLowerCase() === donorName.trim().toLowerCase())
    : [];

  // Membership: demo registry match (live nonprofit_members mirrors this data)
  const member = donorName
    ? DEMO_MEMBERS.find((m) => m.name.trim().toLowerCase() === donorName.trim().toLowerCase())
    : undefined;

  const handleDraftEmail = () => {
    setEmailOpen(false);
    toast.success(`Re-engagement email drafted for ${donorName}`, {
      description: "Queued for review before sending",
    });
  };

  return (
    <>
      <Sheet open={!!donorName} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          {donorName && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2 flex-wrap">
                  <SheetTitle>{donorName}</SheetTitle>
                  {profile && (
                    <Badge variant="outline" className={`text-xs ${segmentBadgeColor(profile.segment)}`}>
                      {profile.segment}
                    </Badge>
                  )}
                </div>
                {profile && (
                  <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" /> {profile.email}
                    </span>
                    {profile.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" /> {profile.phone}
                      </span>
                    )}
                  </div>
                )}
              </SheetHeader>

              {!profile ? (
                <div className="mt-12 flex flex-col items-center text-center gap-3 text-muted-foreground">
                  <UserSearch className="h-10 w-10" />
                  <p className="text-sm font-medium">No unified profile yet</p>
                  <p className="text-xs max-w-xs">
                    {donorName} hasn't been added to the donor registry. Giving and outreach
                    data will appear here once their record is reconciled.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-6">
                  {/* Engagement score + next best action */}
                  <div className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-indigo-500" /> Engagement Score
                      </p>
                      <Badge variant="outline" className={`text-sm font-bold ${donorScoreColor(profile.engagementScore)}`}>
                        {profile.engagementScore}
                      </Badge>
                    </div>
                    <Progress value={profile.engagementScore} className="h-1.5" />
                    <div className="rounded-md bg-muted/50 p-3">
                      <p className="text-xs font-semibold text-muted-foreground mb-0.5">Next Best Action</p>
                      <p className="text-sm">{profile.nextBestAction}</p>
                    </div>
                  </div>

                  {/* Giving summary */}
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="rounded-lg border p-3 text-center">
                      <p className="text-lg font-bold">${profile.totalGiving.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Lifetime Giving</p>
                    </div>
                    <div className="rounded-lg border p-3 text-center">
                      <p className="text-lg font-bold">${profile.lastGiftAmount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Last Gift</p>
                    </div>
                    <div className="rounded-lg border p-3 text-center">
                      <p className="text-lg font-bold text-xs pt-1.5">{profile.lastGiftDate}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Last Gift Date</p>
                    </div>
                  </div>

                  {/* Pipeline stage */}
                  {profile.pipelineStage && (
                    <div className="rounded-lg border p-3 flex items-center justify-between">
                      <p className="text-sm font-semibold flex items-center gap-1.5">
                        <GitBranch className="h-4 w-4 text-primary" /> Donor Pipeline
                      </p>
                      <Badge variant="secondary" className="text-xs">{profile.pipelineStage}</Badge>
                    </div>
                  )}

                  {/* Membership */}
                  {(profile.isMember || member) && (
                    <div className="rounded-lg border p-3 space-y-1">
                      <p className="text-sm font-semibold flex items-center gap-1.5">
                        <CreditCard className="h-4 w-4 text-primary" /> Membership
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="outline" className="text-xs">{member?.tier ?? profile.memberTier}</Badge>
                        {member && (
                          <>
                            <Badge variant="secondary" className="text-xs">{member.status}</Badge>
                            <span className="text-xs text-muted-foreground">Renews {member.renewalDate}</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Recent gifts */}
                  <div>
                    <h4 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
                      <BadgeDollarSign className="h-4 w-4 text-primary" /> Recent Gifts
                    </h4>
                    {donationsLoading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-9 w-full" />
                        <Skeleton className="h-9 w-full" />
                      </div>
                    ) : liveGifts.length === 0 && demoGifts.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No gift records found in Donation Center.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {liveGifts.slice(0, 5).map((d) => (
                          <div key={d.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                            <div>
                              <span className="font-medium">${Number(d.amount).toLocaleString()}</span>
                              <span className="text-xs text-muted-foreground ml-2">{d.frequency}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{d.fund_designation ?? "General Operating"}</span>
                          </div>
                        ))}
                        {liveGifts.length === 0 && demoGifts.slice(0, 5).map((d) => (
                          <div key={d.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                            <div>
                              <span className="font-medium">${d.amount.toLocaleString()}</span>
                              <span className="text-xs text-muted-foreground ml-2">{d.frequency}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-xs">{d.campaignName}</p>
                              <p className="text-xs text-muted-foreground">{d.date}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Outreach history */}
                  <div>
                    <h4 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
                      <History className="h-4 w-4 text-primary" /> Outreach History
                    </h4>
                    <div className="space-y-1">
                      {profile.outreachHistory.map((entry, i) => (
                        <div key={i} className="flex gap-3 text-sm py-1.5 border-b last:border-0">
                          <span className="text-muted-foreground text-xs w-20 shrink-0 pt-0.5">{entry.date}</span>
                          <div>
                            <Badge variant="outline" className="text-[10px] mr-1.5">{entry.channel}</Badge>
                            <span className="text-xs">{entry.summary}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={() => setEmailOpen(true)}>
                      <Mail className="h-4 w-4 mr-1.5" /> Draft Email
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => toast.success(`Contact logged for ${donorName}`, { description: "Synced to CRM" })}
                    >
                      <Heart className="h-4 w-4 mr-1.5" /> Log Contact
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Draft email dialog */}
      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Draft Email — {donorName}</DialogTitle>
            <DialogDescription>AI-drafted outreach based on their profile and giving history</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Subject</label>
              <Input defaultValue={`Your Impact at Brightside, ${donorName?.split(" ")[0]}`} />
            </div>
            <div>
              <label className="text-sm font-medium">Email Body</label>
              <Textarea
                rows={8}
                defaultValue={`Dear ${donorName?.split(" ")[0]},\n\n${profile?.nextBestAction ?? "Thank you for your continued support of Brightside Foundation."}\n\nYour lifetime support of $${profile?.totalGiving.toLocaleString() ?? "—"} has made a real difference in our community.\n\nWith gratitude,\nBrightside Foundation Team`}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailOpen(false)}>Cancel</Button>
            <Button onClick={handleDraftEmail}>
              <Mail className="h-4 w-4 mr-1" /> Queue for Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
