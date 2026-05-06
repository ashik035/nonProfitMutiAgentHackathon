/**
 * Donor Retention Dashboard — /donor-retention
 *
 * Retention rate, LYBUNT count, at-risk donor table,
 * retention trend, and AI re-engage button.
 */

import { useState } from "react";
import { toast } from "sonner";
import {
  Users, TrendingUp, AlertTriangle, Heart, Mail, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { DEMO_DONOR_RETENTION, type AtRiskDonor } from "@/shared/data/nonprofitDemoData";

export default function DonorRetentionPage() {
  const [emailOpen, setEmailOpen] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<AtRiskDonor | null>(null);
  const data = DEMO_DONOR_RETENTION;

  const handleReEngage = (donor: AtRiskDonor) => {
    setSelectedDonor(donor);
    setEmailOpen(true);
  };

  const handleSendEmail = () => {
    setEmailOpen(false);
    toast.success(`Re-engagement email drafted for ${selectedDonor?.name}`, {
      description: "Queued for review before sending",
    });
  };

  const retentionChange = data.retentionRate - data.lastYearRetentionRate;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Heart className="h-6 w-6 text-rose-500" />
          Donor Retention
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track donor loyalty, identify at-risk relationships, and re-engage lapsed givers
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Retention Rate</p>
              <Badge variant="outline" className={`text-xs ${retentionChange >= 0 ? "text-green-600 border-green-200 bg-green-50" : "text-red-600 border-red-200 bg-red-50"}`}>
                {retentionChange >= 0 ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                {Math.abs(retentionChange)}%
              </Badge>
            </div>
            <p className="text-3xl font-bold text-foreground mt-1">{data.retentionRate}%</p>
            <Progress value={data.retentionRate} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-muted-foreground">LYBUNT Donors</p>
            <p className="text-3xl font-bold text-foreground mt-1">{data.lybuntCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Gave last year, not yet this year</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-muted-foreground">At-Risk Donors</p>
            <p className="text-3xl font-bold text-amber-600 mt-1">{data.atRiskCount}</p>
            <p className="text-xs text-muted-foreground mt-1">No gift in 270+ days</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-muted-foreground">YoY Trend</p>
            <div className="flex items-end gap-2 mt-1">
              {data.retentionTrend.map((item) => (
                <div key={item.year} className="flex flex-col items-center gap-1">
                  <div
                    className="w-8 rounded-t bg-primary/80"
                    style={{ height: `${(item.rate / 100) * 48}px` }}
                  />
                  <span className="text-[10px] text-muted-foreground">{String(item.year).slice(-2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* At-risk donor table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            At-Risk Donors
          </CardTitle>
          <CardDescription>Donors who haven't given in 270+ days — sorted by days since last gift</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Donor Name</TableHead>
                <TableHead>Segment</TableHead>
                <TableHead>Last Gift Date</TableHead>
                <TableHead className="text-right">Last Gift</TableHead>
                <TableHead className="text-right">Total Giving</TableHead>
                <TableHead className="text-right">Days Lapsed</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.atRiskDonors.map((donor) => (
                <TableRow key={donor.id}>
                  <TableCell className="font-medium">{donor.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{donor.segment}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{donor.lastGiftDate}</TableCell>
                  <TableCell className="text-right text-sm">${donor.lastGiftAmount.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-sm">${donor.totalGiving.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className={`text-xs ${donor.daysSinceLastGift > 350 ? "text-red-600 border-red-200 bg-red-50" : "text-amber-600 border-amber-200 bg-amber-50"}`}>
                      {donor.daysSinceLastGift}d
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => handleReEngage(donor)}>
                      <Mail className="h-3.5 w-3.5 mr-1" />
                      Re-engage
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Re-engage email dialog */}
      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Re-engage {selectedDonor?.name}</DialogTitle>
            <DialogDescription>
              AI-drafted re-engagement email based on their giving history
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Subject</label>
              <Input defaultValue={`We Miss You, ${selectedDonor?.name?.split(" ")[0]} — Your Impact at Brightside`} />
            </div>
            <div>
              <label className="text-sm font-medium">Email Body</label>
              <Textarea
                rows={8}
                defaultValue={`Dear ${selectedDonor?.name?.split(" ")[0]},\n\nIt's been a while since we've heard from you, and we want you to know your past support of $${selectedDonor?.totalGiving?.toLocaleString()} has made a real difference.\n\nSince your last gift, Brightside Foundation has expanded our youth mentorship program to serve 85 young people and launched a new digital literacy initiative.\n\nWould you consider renewing your support? Even a gift of $${selectedDonor?.lastGiftAmount} would help us continue this important work.\n\nWith gratitude,\nBrightside Foundation Team`}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailOpen(false)}>Cancel</Button>
            <Button onClick={handleSendEmail}>
              <Mail className="h-4 w-4 mr-1" />
              Queue for Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
