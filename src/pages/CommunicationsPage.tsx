/**
 * Communication Center — /communications
 *
 * Donor segment selector, bulk email composer with AI,
 * sent email log, and thank-you letter queue.
 */

import { useState } from "react";
import { toast } from "sonner";
import {
  Mail, Send, Users, BarChart3, Heart, Sparkles, CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { DEMO_COMMUNICATIONS, type ThankYouItem } from "@/shared/data/nonprofitDemoData";
import { DonorProfileSheet } from "@/components/donors/DonorProfileSheet";

export default function CommunicationsPage() {
  const [selectedSegment, setSelectedSegment] = useState("All Donors");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [profileDonor, setProfileDonor] = useState<string | null>(null);
  const [thankYouItems, setThankYouItems] = useState<ThankYouItem[]>(DEMO_COMMUNICATIONS.thankYouQueue);
  const data = DEMO_COMMUNICATIONS;

  const handleAIDraft = () => {
    const segmentText = selectedSegment;
    setSubject(`Your Impact at Brightside Foundation — ${segmentText} Update`);
    setBody(`Dear {{first_name}},\n\nThank you for being part of the Brightside Foundation community. As a valued ${segmentText.toLowerCase()} supporter, we wanted to share some exciting updates about the impact your generosity has made.\n\nThis quarter, our programs have served over 1,000 beneficiaries across 5 active initiatives. Your support directly contributed to:\n\n• 85 youth in our mentorship program\n• 320 health screenings in underserved neighborhoods\n• 500 families supported through our food security network\n\nWe couldn't do this without you.\n\nWith gratitude,\nBrightside Foundation Team`);
    toast.success("AI draft generated", { description: `Personalized for ${segmentText} segment` });
  };

  const handleSendEmail = () => {
    if (!subject || !body) {
      toast.error("Please fill in subject and body");
      return;
    }
    toast.success("Bulk email queued for review", {
      description: `Sending to ${selectedSegment} segment`,
    });
    setSubject("");
    setBody("");
  };

  const handleThankYou = (item: ThankYouItem) => {
    setThankYouItems((prev) =>
      prev.map((ty) => (ty.id === item.id ? { ...ty, thankYouSent: true } : ty))
    );
    toast.success(`Thank-you letter drafted for ${item.donorName}`, {
      description: `For their $${item.donationAmount} donation`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Mail className="h-6 w-6 text-primary" />
          Communication Center
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Compose donor communications, track engagement, and manage thank-you letters
        </p>
      </div>

      <Tabs defaultValue="compose" className="space-y-4">
        <TabsList>
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="sent">Sent Emails</TabsTrigger>
          <TabsTrigger value="thank-you">Thank-You Queue</TabsTrigger>
        </TabsList>

        {/* Compose Tab */}
        <TabsContent value="compose" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Bulk Email Composer</CardTitle>
              <CardDescription>Select a donor segment and compose your message</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Donor Segment</label>
                  <Select value={selectedSegment} onValueChange={setSelectedSegment}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {data.segments.map((seg) => (
                        <SelectItem key={seg} value={seg}>{seg}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" onClick={handleAIDraft} className="w-full">
                    <Sparkles className="h-4 w-4 mr-1" />
                    AI Draft
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Subject Line</label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter email subject..."
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Email Body
                  <span className="text-xs text-muted-foreground ml-2">
                    Use {"{{first_name}}"} and {"{{gift_history}}"} for merge tags
                  </span>
                </label>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={10}
                  placeholder="Compose your email..."
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSendEmail}>
                  <Send className="h-4 w-4 mr-1" />
                  Queue for Review
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sent Emails Tab */}
        <TabsContent value="sent">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Sent Email Log</CardTitle>
              <CardDescription>Track open rates and engagement across campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Segment</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead className="text-right">Recipients</TableHead>
                    <TableHead className="text-right">Open Rate</TableHead>
                    <TableHead className="text-right">Click Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.sentEmails.map((email) => (
                    <TableRow key={email.id}>
                      <TableCell className="text-sm text-muted-foreground">{email.date}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{email.segment}</Badge>
                      </TableCell>
                      <TableCell className="font-medium text-sm">{email.subject}</TableCell>
                      <TableCell className="text-right text-sm">{email.recipientCount.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className={`text-xs ${email.openRate >= 50 ? "text-green-600 bg-green-50 border-green-200" : "text-muted-foreground"}`}>
                          {email.openRate}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className={`text-xs ${email.clickRate >= 15 ? "text-green-600 bg-green-50 border-green-200" : "text-muted-foreground"}`}>
                          {email.clickRate}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Thank-You Queue Tab */}
        <TabsContent value="thank-you">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="h-5 w-5 text-rose-500" />
                Thank-You Letter Queue
              </CardTitle>
              <CardDescription>Recent donations without a thank-you letter — one-click AI draft</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Donor</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {thankYouItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <button
                          className="hover:underline text-left"
                          title="View unified donor profile"
                          onClick={() => setProfileDonor(item.donorName)}
                        >
                          {item.donorName}
                        </button>
                      </TableCell>
                      <TableCell className="text-right">${item.donationAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.donationDate}</TableCell>
                      <TableCell>
                        {item.thankYouSent ? (
                          <Badge variant="outline" className="text-xs text-green-600 bg-green-50 border-green-200">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Sent
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-amber-600 bg-amber-50 border-amber-200">
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {!item.thankYouSent && (
                          <Button size="sm" variant="outline" onClick={() => handleThankYou(item)}>
                            <Sparkles className="h-3.5 w-3.5 mr-1" />
                            AI Draft
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Unified donor profile */}
      <DonorProfileSheet donorName={profileDonor} onOpenChange={(open) => !open && setProfileDonor(null)} />
    </div>
  );
}
