import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { HelpCircle, Send } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const ticketSchema = z.object({
  subject: z.string().trim().min(1, "Subject is required").max(200, "Subject must be under 200 characters"),
  category: z.string().min(1, "Please select a category"),
  description: z.string().trim().min(20, "Description must be at least 20 characters").max(2000, "Description must be under 2000 characters"),
});

type TicketFormData = z.infer<typeof ticketSchema>;

const faqs = [
  {
    question: "How do I connect my CRM?",
    answer:
      "Navigate to Settings → Integrations and select your CRM provider (e.g. Salesforce, HubSpot). Follow the guided OAuth flow to authorize access. Once connected, your donor and contact data will sync automatically.",
  },
  {
    question: "What does the Data Health score mean?",
    answer:
      "The Data Health score reflects the completeness and accuracy of your donor records. It checks for missing emails, outdated addresses, duplicate entries, and inconsistent formatting. A higher score means cleaner data and more effective outreach.",
  },
  {
    question: "How do AI agents work?",
    answer:
      "AI agents are specialized assistants that monitor your data and operations in real time. Each agent has a specific focus — such as donor engagement, grant compliance, or event logistics — and can surface insights, draft communications, and flag issues automatically.",
  },
  {
    question: "Can I customize the dashboard for my role?",
    answer:
      "Yes. The Control Tower provides role-specific dashboards for Executive Directors, Development Directors, Finance Managers, and Operations Managers. Each view highlights the KPIs and workflows most relevant to that role.",
  },
  {
    question: "How do I generate a board report?",
    answer:
      "Go to Board Reports from the sidebar. You can generate a comprehensive report that pulls data from grants, events, donor pipeline, and financial reconciliation. Reports can be exported as PDF or shared directly with board members.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely. All data is encrypted in transit and at rest. We use row-level security policies so users only see data they're authorized to access. Activity logs track all changes for full auditability.",
  },
  {
    question: "How do I invite team members?",
    answer:
      "Administrators can invite team members from the Admin Panel → User Management. Each user can be assigned a role (Executive Director, Development Director, Finance Manager, or Operations Manager) which determines their dashboard and permissions.",
  },
  {
    question: "What integrations are supported?",
    answer:
      "We support Salesforce, HubSpot, Google Workspace, Microsoft 365, Zoom, Slack, QuickBooks, and more. Visit the Integration Center to see all available connectors and their setup status.",
  },
];

export default function HelpPage() {
  const { user } = useAuth();

  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      subject: "",
      category: "",
      description: "",
    },
  });

  const onSubmit = async (data: TicketFormData) => {
    const { error } = await supabase.from("support_tickets").insert({
      user_id: user?.id ?? null,
      user_email: user?.email ?? null,
      subject: data.subject,
      category: data.category,
      description: data.description,
    });

    if (error) {
      toast.error("Could not submit ticket. Please try again.");
      return;
    }

    toast.success("Ticket submitted. We'll be in touch within 1 business day.");
    form.reset();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
        <p className="text-muted-foreground">
          Find answers to common questions or submit a support ticket
        </p>
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Quick answers to the most common questions about the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`faq-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Support Ticket Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Submit a Support Ticket
          </CardTitle>
          <CardDescription>
            Need help with something specific? Submit a ticket and our team will respond within 1 business day.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-xl">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="Brief summary of your issue" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Bug Report">Bug Report</SelectItem>
                        <SelectItem value="Feature Request">Feature Request</SelectItem>
                        <SelectItem value="Integration Issue">Integration Issue</SelectItem>
                        <SelectItem value="General Question">General Question</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please describe your issue or question in detail (minimum 20 characters)"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={form.formState.isSubmitting}>
                <Send className="mr-2 h-4 w-4" />
                {form.formState.isSubmitting ? "Submitting…" : "Submit Ticket"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
