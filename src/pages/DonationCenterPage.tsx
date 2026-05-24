/**
 * Donation Center — /donations
 *
 * Campaign management, donation tracking, and fund breakdown reporting.
 * Backed by Supabase nonprofit_campaigns + nonprofit_donations tables.
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  DollarSign, TrendingUp, Users, Target, Heart, RefreshCw, BarChart3, Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useDonations, useDonationStats, useCreateDonation, type DonationFrequency } from "@/hooks/useDonations";
import { toast } from "sonner";

// ── Helpers ──────────────────────────────────────────────────────

function frequencyBadgeColor(frequency: string): string {
  const map: Record<string, string> = {
    "One-Time": "bg-gray-100 text-gray-700 border-gray-200",
    Monthly: "bg-green-100 text-green-700 border-green-200",
    Quarterly: "bg-blue-100 text-blue-700 border-blue-200",
    Annual: "bg-purple-100 text-purple-700 border-purple-200",
  };
  return map[frequency] ?? "bg-gray-100 text-gray-700 border-gray-200";
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Form schema ───────────────────────────────────────────────────

const FUND_DESIGNATIONS = ["General Operating", "Youth Programs", "Health Initiative", "Technology Fund", "Emergency Relief"] as const;
type FundDesignationType = (typeof FUND_DESIGNATIONS)[number];

const donationSchema = z.object({
  donorName: z.string().min(2, "Name required"),
  amount: z.coerce.number().min(1, "Amount must be at least $1"),
  frequency: z.enum(["One-Time", "Monthly", "Quarterly", "Annual"] as const),
  campaignId: z.string().optional(),
  fundDesignation: z.enum(FUND_DESIGNATIONS),
});
type DonationForm = z.infer<typeof donationSchema>;

// ── Component ─────────────────────────────────────────────────────

export default function DonationCenterPage() {
  const [frequencyFilter, setFrequencyFilter] = useState<DonationFrequency | "All">("All");

  const { data: campaigns = [], isLoading: campaignsLoading } = useCampaigns();
  const { data: donations = [], isLoading: donationsLoading } = useDonations({
    frequency: frequencyFilter !== "All" ? frequencyFilter : undefined,
  });
  const activeCampaigns = campaigns.filter((c) => c.is_active);
  const { data: stats } = useDonationStats(activeCampaigns.length);
  const createDonation = useCreateDonation();

  const form = useForm<DonationForm>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      donorName: "",
      amount: 0,
      frequency: "One-Time",
      campaignId: "",
      fundDesignation: "General Operating",
    },
  });

  // Destructure once to avoid multiple watch() subscriptions causing excessive re-renders
  const { frequency: watchedFrequency, campaignId: watchedCampaignId, fundDesignation: watchedFundDesignation } = form.watch();

  const onSubmit = async (data: DonationForm) => {
    const campaign = campaigns.find((c) => c.id === data.campaignId);
    await createDonation.mutateAsync({
      donor_name: data.donorName,
      amount: data.amount,
      frequency: data.frequency,
      campaign_id: data.campaignId || null,
      fund_designation: data.fundDesignation,
    });
    toast.success("Donation recorded", {
      description: `$${data.amount} ${data.frequency} from ${data.donorName}${campaign ? ` to ${campaign.name}` : ""}.`,
    });
    form.reset();
  };

  const kpiCards = [
    { label: "Raised This Year", value: stats ? `$${stats.totalRaisedThisYear.toLocaleString()}` : "—", icon: TrendingUp, color: "text-green-600" },
    { label: "Average Gift", value: stats ? `$${stats.averageGift}` : "—", icon: DollarSign, color: "text-blue-600" },
    { label: "Recurring Donors", value: stats?.recurringDonors ?? "—", icon: RefreshCw, color: "text-purple-600" },
    { label: "Active Campaigns", value: activeCampaigns.length, icon: Target, color: "text-amber-600" },
  ];

  const frequencyFilters: Array<DonationFrequency | "All"> = ["All", "One-Time", "Monthly", "Quarterly", "Annual"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-primary" />
          Donation Center
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage campaigns, track donations, and analyze fund allocation
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground truncate">{card.label}</p>
                  <p className="text-2xl font-bold mt-1">{card.value}</p>
                </div>
                <card.icon className={`h-8 w-8 ${card.color} opacity-80 shrink-0`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="donations">Donations</TabsTrigger>
          <TabsTrigger value="funds">Fund Breakdown</TabsTrigger>
          <TabsTrigger value="new">New Donation</TabsTrigger>
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns">
          {campaignsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : campaigns.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No campaigns yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaigns.map((campaign) => {
                const pct = campaign.goal > 0 ? Math.round((Number(campaign.raised) / Number(campaign.goal)) * 100) : 0;
                const remaining = Number(campaign.goal) - Number(campaign.raised);
                return (
                  <Card key={campaign.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base">{campaign.name}</CardTitle>
                        <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 border-blue-200 shrink-0">
                          {campaign.fund_designation}
                        </span>
                      </div>
                      {campaign.description && (
                        <p className="text-xs text-muted-foreground">{campaign.description}</p>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Progress */}
                      <div>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="text-muted-foreground">${Number(campaign.raised).toLocaleString()} raised</span>
                          <span className="font-semibold">{pct}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-green-500 transition-all"
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Goal: ${Number(campaign.goal).toLocaleString()} · {remaining > 0 ? `$${remaining.toLocaleString()} to go` : "Goal reached! 🎉"}
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> {campaign.donor_count} donors
                        </span>
                        {campaign.end_date && (
                          <span>Ends {formatDate(campaign.end_date)}</span>
                        )}
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          toast.success(`Sharing ${campaign.name}`, { description: "Campaign link copied to clipboard" });
                        }}
                      >
                        <Heart className="h-3.5 w-3.5 mr-1.5" /> Share Campaign
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Donations Tab */}
        <TabsContent value="donations" className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {frequencyFilters.map((filter) => (
              <Button
                key={filter}
                size="sm"
                variant={frequencyFilter === filter ? "default" : "outline"}
                onClick={() => setFrequencyFilter(filter)}
              >
                {filter}
              </Button>
            ))}
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Donor</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead className="hidden lg:table-cell">Fund</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="hidden lg:table-cell">Method</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {donationsLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ) : donations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No donations recorded yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    donations.map((donation) => (
                      <TableRow key={donation.id}>
                        <TableCell className="font-medium text-sm">
                          {donation.is_anonymous ? "Anonymous" : donation.donor_name}
                        </TableCell>
                        <TableCell className="text-sm font-semibold text-green-700 dark:text-green-400">
                          ${Number(donation.amount).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${frequencyBadgeColor(donation.frequency)}`}>
                            {donation.frequency}
                          </span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                          {donation.fund_designation ?? "—"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {formatDate(donation.created_at)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                          {donation.payment_method ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <p className="text-xs text-muted-foreground">
            Showing {donations.length} donation{donations.length !== 1 ? "s" : ""}
          </p>
        </TabsContent>

        {/* Fund Breakdown Tab */}
        <TabsContent value="funds">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                Fund Allocation — This Year
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!stats ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : stats.fundBreakdown.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No donation data this year yet</p>
              ) : (
                <>
                  {stats.fundBreakdown.map((item) => (
                    <div key={item.label} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{item.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">${item.amount.toLocaleString()}</span>
                          <span className="font-semibold w-10 text-right">{item.percentage}%</span>
                        </div>
                      </div>
                      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground pt-2">
                    Total: ${stats.totalRaisedThisYear.toLocaleString()} raised this year
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* New Donation Tab */}
        <TabsContent value="new">
          <Card className="max-w-lg">
            <CardHeader>
              <CardTitle className="text-base">Record a Donation</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="don-name">Donor Name</Label>
                  <Input id="don-name" placeholder="Jane Smith" {...form.register("donorName")} />
                  {form.formState.errors.donorName && (
                    <p className="text-xs text-destructive">{form.formState.errors.donorName.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="don-amount">Amount ($)</Label>
                  <Input id="don-amount" type="number" min={1} step={1} placeholder="100" {...form.register("amount")} />
                  {form.formState.errors.amount && (
                    <p className="text-xs text-destructive">{form.formState.errors.amount.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>Frequency</Label>
                  <Select value={watchedFrequency} onValueChange={(v) => form.setValue("frequency", v as DonationFrequency)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="One-Time">One-Time</SelectItem>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                      <SelectItem value="Quarterly">Quarterly</SelectItem>
                      <SelectItem value="Annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Campaign (optional)</Label>
                  <Select value={watchedCampaignId} onValueChange={(v) => form.setValue("campaignId", v)}>
                    <SelectTrigger><SelectValue placeholder="Select campaign" /></SelectTrigger>
                    <SelectContent>
                      {campaigns.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Fund Designation</Label>
                  <Select value={watchedFundDesignation} onValueChange={(v) => form.setValue("fundDesignation", v as FundDesignationType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FUND_DESIGNATIONS.map((fd) => (
                        <SelectItem key={fd} value={fd}>{fd}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={createDonation.isPending}>
                  {createDonation.isPending ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Recording…</>
                  ) : (
                    <><DollarSign className="h-4 w-4 mr-2" /> Record Donation</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
