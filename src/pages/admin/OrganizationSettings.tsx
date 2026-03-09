import { useState } from "react";
import { Building2, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function OrganizationSettings() {
  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState("501c3-public");
  const [taxEin, setTaxEin] = useState("");
  const [fiscalYearStart, setFiscalYearStart] = useState("january");

  const [primaryCrm, setPrimaryCrm] = useState("salesforce");
  const [crmSyncFrequency, setCrmSyncFrequency] = useState("daily");

  const [boardReportTemplate, setBoardReportTemplate] = useState("standard-nonprofit");
  const [reportingCurrency, setReportingCurrency] = useState("USD");

  const handleSaveCrm = () => {
    toast.success("CRM settings saved successfully");
  };

  const handleSaveReporting = () => {
    toast.success("Reporting settings saved successfully");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Building2 className="h-6 w-6 text-muted-foreground" />
          Organization Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure your nonprofit's profile and reporting preferences
        </p>
      </div>

      {/* Section 1: Organization Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Profile</CardTitle>
          <CardDescription>Basic information about your nonprofit organization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orgName">Organization Name</Label>
            <Input
              id="orgName"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="My Nonprofit Organization"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="orgType">Organization Type</Label>
            <Select value={orgType} onValueChange={setOrgType}>
              <SelectTrigger id="orgType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="501c3-public">501(c)(3) Public Charity</SelectItem>
                <SelectItem value="501c3-private">501(c)(3) Private Foundation</SelectItem>
                <SelectItem value="501c4">501(c)(4)</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxEin">Tax EIN</Label>
            <Input
              id="taxEin"
              value={taxEin}
              onChange={(e) => setTaxEin(e.target.value)}
              placeholder="XX-XXXXXXX"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fiscalYear">Fiscal Year Start</Label>
            <Select value={fiscalYearStart} onValueChange={setFiscalYearStart}>
              <SelectTrigger id="fiscalYear">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="january">January</SelectItem>
                <SelectItem value="april">April</SelectItem>
                <SelectItem value="july">July</SelectItem>
                <SelectItem value="october">October</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: CRM Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>CRM Configuration</CardTitle>
          <CardDescription>Configure your primary CRM integration and sync settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="primaryCrm">Primary CRM</Label>
            <Select value={primaryCrm} onValueChange={setPrimaryCrm}>
              <SelectTrigger id="primaryCrm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="salesforce">Salesforce</SelectItem>
                <SelectItem value="blackbaud">Blackbaud RE NXT</SelectItem>
                <SelectItem value="bloomerang">Bloomerang</SelectItem>
                <SelectItem value="neon">Neon</SelectItem>
                <SelectItem value="virtuous">Virtuous</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="crmSync">CRM Sync Frequency</Label>
            <Select value={crmSyncFrequency} onValueChange={setCrmSyncFrequency}>
              <SelectTrigger id="crmSync">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Every hour</SelectItem>
                <SelectItem value="six-hours">Every 6 hours</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSaveCrm} className="gap-2">
            <Save className="h-4 w-4" />
            Save CRM Settings
          </Button>
        </CardContent>
      </Card>

      {/* Section 3: Reporting Template */}
      <Card>
        <CardHeader>
          <CardTitle>Reporting Template</CardTitle>
          <CardDescription>Configure default reporting formats and currency</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="boardTemplate">Default Board Report Template</Label>
            <Select value={boardReportTemplate} onValueChange={setBoardReportTemplate}>
              <SelectTrigger id="boardTemplate">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard-nonprofit">Standard Nonprofit</SelectItem>
                <SelectItem value="foundation">Foundation</SelectItem>
                <SelectItem value="government-grant">Government Grant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Reporting Currency</Label>
            <Select value={reportingCurrency} onValueChange={setReportingCurrency}>
              <SelectTrigger id="currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="CAD">CAD</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSaveReporting} className="gap-2">
            <Save className="h-4 w-4" />
            Save Reporting Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
