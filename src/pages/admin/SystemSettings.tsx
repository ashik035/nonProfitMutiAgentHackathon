import { useState, useEffect } from "react";
import { useAppConfig, useUpdateAppConfig, useResetAppConfig, AppConfig } from "@/hooks/useAppConfig";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, Save, RefreshCw, Building2, Mail, Zap, Shield, Loader2, Database, Bot, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function SystemSettings() {
  const { data: config, isLoading } = useAppConfig();
  const updateConfig = useUpdateAppConfig();
  const resetConfig = useResetAppConfig();

  const [settings, setSettings] = useState<AppConfig | null>(null);
  const [seedOptions, setSeedOptions] = useState({
    seedAIAgents: true,
    seedKnowledgeCategories: true,
    seedSampleData: false,
  });
  const [isSeeding, setIsSeeding] = useState(false);

  // AI Agent Configuration (UI-only, no Supabase write yet)
  const [agentRunFrequency, setAgentRunFrequency] = useState("daily");
  const [agentAlertThreshold, setAgentAlertThreshold] = useState("medium");
  const [agentHumanApproval, setAgentHumanApproval] = useState(false);

  // Data Security Settings (UI-only, no Supabase write yet)
  const [dataRetentionPeriod, setDataRetentionPeriod] = useState("1-year");
  const [noRetainAI, setNoRetainAI] = useState(false);
  const [auditLogRetention, setAuditLogRetention] = useState("1-year");

  // Load config into local state when it arrives
  useEffect(() => {
    if (config) {
      setSettings(config);
    }
  }, [config]);

  const handleSave = async () => {
    if (!settings) return;
    await updateConfig.mutateAsync(settings);
  };

  const handleReset = async () => {
    await resetConfig.mutateAsync();
  };

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      const { data, error } = await supabase.functions.invoke("seed-template-data", {
        body: { options: seedOptions },
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`Successfully seeded: ${data.seeded.join(", ")}`);
        if (data.errors.length > 0) {
          toast.warning(`Errors: ${data.errors.join(", ")}`);
        }
      } else {
        toast.error("Failed to seed template data");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to seed template data");
    } finally {
      setIsSeeding(false);
    }
  };

  const isProcessing = updateConfig.isPending || resetConfig.isPending;

  if (isLoading || !settings) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground">
            Configure platform settings and preferences
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} disabled={isProcessing}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={isProcessing}>
            {isProcessing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Platform Branding */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            <CardTitle>Platform Branding</CardTitle>
          </div>
          <CardDescription>Configure your platform's name and branding</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="platformName">Platform Name</Label>
            <Input
              id="platformName"
              value={settings.branding.companyName}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  branding: { ...settings.branding, companyName: e.target.value },
                })
              }
              placeholder="Control Tower"
              disabled={isProcessing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="platformTagline">Platform Tagline</Label>
            <Input
              id="platformTagline"
              value={settings.branding.tagline}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  branding: { ...settings.branding, tagline: e.target.value },
                })
              }
              placeholder="AI-Powered Collaboration Platform"
              disabled={isProcessing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supportEmail">Support Email</Label>
            <Input
              id="supportEmail"
              type="email"
              value={settings.branding.supportEmail}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  branding: { ...settings.branding, supportEmail: e.target.value },
                })
              }
              placeholder="support@example.com"
              disabled={isProcessing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input
              id="logoUrl"
              value={settings.branding.logoUrl || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  branding: { ...settings.branding, logoUrl: e.target.value },
                })
              }
              placeholder="https://example.com/logo.png"
              disabled={isProcessing}
            />
            <p className="text-sm text-muted-foreground">
              URL to your company logo (optional)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Feature Flags */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            <CardTitle>Feature Flags</CardTitle>
          </div>
          <CardDescription>Enable or disable platform features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>AI Chat</Label>
              <p className="text-sm text-muted-foreground">
                Enable AI assistant chat functionality
              </p>
            </div>
            <Switch
              checked={settings.features.enableAIChat}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  features: { ...settings.features, enableAIChat: checked },
                })
              }
              disabled={isProcessing}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Knowledge Base</Label>
              <p className="text-sm text-muted-foreground">
                Enable knowledge base management
              </p>
            </div>
            <Switch
              checked={settings.features.enableKnowledgeBase}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  features: { ...settings.features, enableKnowledgeBase: checked },
                })
              }
              disabled={isProcessing}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Meetings</Label>
              <p className="text-sm text-muted-foreground">
                Enable meeting management and scheduling
              </p>
            </div>
            <Switch
              checked={settings.features.enableMeetings}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  features: { ...settings.features, enableMeetings: checked },
                })
              }
              disabled={isProcessing}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Tasks</Label>
              <p className="text-sm text-muted-foreground">
                Enable task management functionality
              </p>
            </div>
            <Switch
              checked={settings.features.enableTasks}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  features: { ...settings.features, enableTasks: checked },
                })
              }
              disabled={isProcessing}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Enable notification system
              </p>
            </div>
            <Switch
              checked={settings.features.enableNotifications}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  features: { ...settings.features, enableNotifications: checked },
                })
              }
              disabled={isProcessing}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Semantic Search</Label>
              <p className="text-sm text-muted-foreground">
                Enable AI-powered semantic search
              </p>
            </div>
            <Switch
              checked={settings.features.enableSemanticSearch}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  features: { ...settings.features, enableSemanticSearch: checked },
                })
              }
              disabled={isProcessing}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Clients Module</Label>
              <p className="text-sm text-muted-foreground">
                Enable client/CRM management
              </p>
            </div>
            <Switch
              checked={settings.features.enableClients}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  features: { ...settings.features, enableClients: checked },
                })
              }
              disabled={isProcessing}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>AI Agents</Label>
              <p className="text-sm text-muted-foreground">
                Enable AI agents management
              </p>
            </div>
            <Switch
              checked={settings.features.enableAIAgents}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  features: { ...settings.features, enableAIAgents: checked },
                })
              }
              disabled={isProcessing}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Personal Knowledge</Label>
              <p className="text-sm text-muted-foreground">
                Enable user personal file uploads
              </p>
            </div>
            <Switch
              checked={settings.features.enablePersonalKnowledge}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  features: { ...settings.features, enablePersonalKnowledge: checked },
                })
              }
              disabled={isProcessing}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Feedback Collection</Label>
              <p className="text-sm text-muted-foreground">
                Enable user feedback submission
              </p>
            </div>
            <Switch
              checked={settings.features.enableFeedback}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  features: { ...settings.features, enableFeedback: checked },
                })
              }
              disabled={isProcessing}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Google Drive Integration</Label>
              <p className="text-sm text-muted-foreground">
                Enable Google Drive file sync
              </p>
            </div>
            <Switch
              checked={settings.features.enableGoogleDrive}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  features: { ...settings.features, enableGoogleDrive: checked },
                })
              }
              disabled={isProcessing}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Zoom Integration</Label>
              <p className="text-sm text-muted-foreground">
                Enable Zoom meeting sync
              </p>
            </div>
            <Switch
              checked={settings.features.enableZoomSync}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  features: { ...settings.features, enableZoomSync: checked },
                })
              }
              disabled={isProcessing}
            />
          </div>
        </CardContent>
      </Card>

      {/* Template Data Seeding */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <CardTitle>Template Data Seeding</CardTitle>
          </div>
          <CardDescription>Populate the platform with default templates and sample data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="seedAIAgents"
                checked={seedOptions.seedAIAgents}
                onCheckedChange={(checked) =>
                  setSeedOptions({ ...seedOptions, seedAIAgents: checked as boolean })
                }
              />
              <label htmlFor="seedAIAgents" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Seed Default AI Agents (Meeting Summarizer, Document Analyzer, etc.)
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="seedKnowledgeCategories"
                checked={seedOptions.seedKnowledgeCategories}
                onCheckedChange={(checked) =>
                  setSeedOptions({ ...seedOptions, seedKnowledgeCategories: checked as boolean })
                }
              />
              <label htmlFor="seedKnowledgeCategories" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Seed Knowledge Base Categories
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="seedSampleData"
                checked={seedOptions.seedSampleData}
                onCheckedChange={(checked) =>
                  setSeedOptions({ ...seedOptions, seedSampleData: checked as boolean })
                }
              />
              <label htmlFor="seedSampleData" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Seed Sample Data (demo clients, meetings, etc.)
              </label>
            </div>
          </div>

          <Button onClick={handleSeedData} disabled={isSeeding} variant="outline" className="w-full">
            {isSeeding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Seeding Data...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Seed Template Data
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <CardTitle>Email Settings</CardTitle>
          </div>
          <CardDescription>Configure email notifications and sender information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Enable system email notifications
              </p>
            </div>
            <Switch
              checked={settings.email.enableEmailNotifications}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  email: { ...settings.email, enableEmailNotifications: checked },
                })
              }
              disabled={isProcessing}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="fromName">From Name</Label>
            <Input
              id="fromName"
              value={settings.email.fromName}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  email: { ...settings.email, fromName: e.target.value },
                })
              }
              placeholder="Control Tower"
              disabled={isProcessing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fromEmail">From Email</Label>
            <Input
              id="fromEmail"
              type="email"
              value={settings.email.fromEmail}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  email: { ...settings.email, fromEmail: e.target.value },
                })
              }
              placeholder="noreply@example.com"
              disabled={isProcessing}
            />
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>System Configuration</CardTitle>
          </div>
          <CardDescription>General system settings and security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">
                Put the platform in maintenance mode
              </p>
            </div>
            <Switch
              checked={settings.system.maintenanceMode}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  system: { ...settings.system, maintenanceMode: checked },
                })
              }
              disabled={isProcessing}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow Signups</Label>
              <p className="text-sm text-muted-foreground">
                Allow new users to register
              </p>
            </div>
            <Switch
              checked={settings.system.allowSignups}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  system: { ...settings.system, allowSignups: checked },
                })
              }
              disabled={isProcessing}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Email Verification</Label>
              <p className="text-sm text-muted-foreground">
                Require users to verify their email
              </p>
            </div>
            <Switch
              checked={settings.system.requireEmailVerification}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  system: { ...settings.system, requireEmailVerification: checked },
                })
              }
              disabled={isProcessing}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="sessionTimeout">Session Timeout (days)</Label>
            <Input
              id="sessionTimeout"
              type="number"
              min="1"
              max="30"
              value={settings.system.sessionTimeout}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  system: { ...settings.system, sessionTimeout: parseInt(e.target.value) || 7 },
                })
              }
              disabled={isProcessing}
            />
            <p className="text-sm text-muted-foreground">
              Number of days before a user session expires
            </p>
          </div>
        </CardContent>
      </Card>

      {/* AI Agent Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <CardTitle>AI Agent Configuration</CardTitle>
          </div>
          <CardDescription>Configure how AI agents run and surface findings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="agentFrequency">Run Frequency</Label>
            <Select value={agentRunFrequency} onValueChange={setAgentRunFrequency}>
              <SelectTrigger id="agentFrequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Every hour</SelectItem>
                <SelectItem value="six-hours">Every 6 hours</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="manual">Manual only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="alertThreshold">Alert Threshold</Label>
            <Select value={agentAlertThreshold} onValueChange={setAgentAlertThreshold}>
              <SelectTrigger id="alertThreshold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low — surface all findings</SelectItem>
                <SelectItem value="medium">Medium — surface moderate+ findings</SelectItem>
                <SelectItem value="high">High — surface critical findings only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Human Approval Required</Label>
              <p className="text-sm text-muted-foreground">
                Require human approval before applying AI suggestions
              </p>
            </div>
            <Switch
              checked={agentHumanApproval}
              onCheckedChange={setAgentHumanApproval}
            />
          </div>

          <Button
            onClick={() => toast.success("Agent settings saved successfully")}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            Save Agent Settings
          </Button>
        </CardContent>
      </Card>

      {/* Data Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            <CardTitle>Data Security</CardTitle>
          </div>
          <CardDescription>Configure data retention and AI privacy settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dataRetention">Data Retention Period</Label>
            <Select value={dataRetentionPeriod} onValueChange={setDataRetentionPeriod}>
              <SelectTrigger id="dataRetention">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30-days">30 days</SelectItem>
                <SelectItem value="90-days">90 days</SelectItem>
                <SelectItem value="1-year">1 year</SelectItem>
                <SelectItem value="indefinite">Indefinite</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>No-Retain AI Mode</Label>
              <p className="text-sm text-muted-foreground">
                Do not store conversation or suggestion data in AI systems
              </p>
            </div>
            <Switch
              checked={noRetainAI}
              onCheckedChange={setNoRetainAI}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="auditRetention">Audit Log Retention</Label>
            <Select value={auditLogRetention} onValueChange={setAuditLogRetention}>
              <SelectTrigger id="auditRetention">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="90-days">90 days</SelectItem>
                <SelectItem value="1-year">1 year</SelectItem>
                <SelectItem value="7-years">7 years</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={() => toast.success("Security settings saved successfully")}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            Save Security Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
