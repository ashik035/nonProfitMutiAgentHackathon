import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Brain,
  Sparkles,
  Zap,
  Cloud,
  CheckCircle2,
  XCircle,
  Loader2,
  DollarSign,
  Eye,
  Rocket,
  Star,
  Calculator,
  Settings,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  Shield,
  Key,
  Radio,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSyncModels, useSyncAllModels } from "@/hooks/useModelSync";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface AIProvider {
  id: string;
  name: string;
  slug: string;
  enabled: boolean;
  is_active: boolean;
  api_key_secret_name: string | null;
  created_at: string;
  integration_provider_id: string | null;
  integration_provider_name: string | null;
  connection_status: 'connected' | 'disconnected' | 'error' | null;
  is_connected: boolean;
}

interface AIModel {
  id: string;
  provider_id: string;
  name: string;
  model_id: string;
  category: "chat" | "embedding";
  context_window: number;
  input_cost_per_1k: number;
  output_cost_per_1k: number;
  embedding_cost_per_1k: number;
  enabled: boolean;
  is_default: boolean;
  features: Record<string, boolean> | null;
}

const providerIcons: Record<string, React.ReactNode> = {
  lovable: <Shield className="h-5 w-5 text-purple-500" />,
  openai: <Brain className="h-5 w-5" />,
  anthropic: <Sparkles className="h-5 w-5" />,
  google: <Cloud className="h-5 w-5" />,
  perplexity: <Zap className="h-5 w-5" />,
};

export default function AIModelManagement() {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [apiKeyInputs, setApiKeyInputs] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [expandedKeySlug, setExpandedKeySlug] = useState<string | null>(null);

  // Cost calculator state
  const [inputTokens, setInputTokens] = useState(1000);
  const [outputTokens, setOutputTokens] = useState(1000);
  const [embeddingTokens, setEmbeddingTokens] = useState(1000);

  // Sync mutations
  const syncModels = useSyncModels();
  const syncAllModels = useSyncAllModels();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load providers directly from ai_providers table
      const { data: providersData, error: providersError } = await supabase
        .from("ai_providers")
        .select("*")
        .order("name");

      if (providersError) throw providersError;
      setProviders((providersData || []).map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        enabled: (p as any).enabled ?? (p as any).is_active ?? true,
        is_active: (p as any).is_active ?? false,
        api_key_secret_name: (p as any).api_key_secret_name ?? null,
        created_at: p.created_at,
        integration_provider_id: null,
        integration_provider_name: null,
        connection_status: null,
        is_connected: false,
      })));

      // Load models
      const { data: modelsData, error: modelsError } = await supabase
        .from("ai_models")
        .select("*")
        .order("category, name");

      if (modelsError) throw modelsError;
      setModels((modelsData || []).map((m) => ({
        id: m.id,
        provider_id: m.provider_id,
        name: m.name,
        model_id: m.model_id,
        category: m.category as "chat" | "embedding",
        context_window: m.context_window,
        input_cost_per_1k: Number(m.input_cost_per_1k),
        output_cost_per_1k: Number(m.output_cost_per_1k),
        embedding_cost_per_1k: Number(m.embedding_cost_per_1k),
        enabled: m.enabled,
        is_default: m.is_default,
        features: (m.features as Record<string, boolean>) || {},
      })));
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error("Failed to load AI models data");
    } finally {
      setLoading(false);
    }
  };

  const toggleProvider = async (providerId: string, enabled: boolean) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("ai_providers")
        .update({ is_active: enabled } as any)
        .eq("id", providerId);

      if (error) throw error;

      setProviders((prev) =>
        prev.map((p) => (p.id === providerId ? { ...p, enabled } : p))
      );
      toast.success(`Provider ${enabled ? "enabled" : "disabled"} successfully`);
    } catch (error: any) {
      console.error("Error updating provider:", error);
      toast.error("Failed to update provider");
    } finally {
      setUpdating(false);
    }
  };

  const setActiveProvider = async (providerId: string) => {
    setUpdating(true);
    try {
      // Deactivate all
      const { error: clearError } = await supabase
        .from("ai_providers")
        .update({ is_active: false } as any);

      if (clearError) throw clearError;

      // Activate selected
      const { error: setError } = await supabase
        .from("ai_providers")
        .update({ is_active: true } as any)
        .eq("id", providerId);

      if (setError) throw setError;

      setProviders((prev) =>
        prev.map((p) => ({ ...p, is_active: p.id === providerId }))
      );
      const name = providers.find((p) => p.id === providerId)?.name;
      toast.success(`${name} is now the active provider`);
    } catch (error: any) {
      console.error("Error setting active provider:", error);
      toast.error("Failed to set active provider");
    } finally {
      setUpdating(false);
    }
  };

  const saveApiKey = async (slug: string, secretName: string) => {
    const key = apiKeyInputs[slug]?.trim();
    if (!key) {
      toast.error("Please enter an API key");
      return;
    }
    setSavingKey(slug);
    try {
      // Store in app_config — the routing module reads from Deno.env first,
      // then falls back to app_config for keys stored this way.
      const configKey = `integrations.${secretName.toLowerCase()}`;
      const { error } = await supabase
        .from("app_config")
        .upsert({ key: configKey, value: key, category: "integrations" }, { onConflict: "key" });

      if (error) throw error;

      toast.success("API key saved. It will be used as a fallback if the environment secret is not set.");
      setApiKeyInputs((prev) => ({ ...prev, [slug]: "" }));
      setExpandedKeySlug(null);
    } catch (error: any) {
      console.error("Error saving API key:", error);
      toast.error("Failed to save API key");
    } finally {
      setSavingKey(null);
    }
  };

  const toggleModel = async (modelId: string, enabled: boolean) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("ai_models")
        .update({ enabled })
        .eq("id", modelId);

      if (error) throw error;

      setModels((prev) =>
        prev.map((m) => (m.id === modelId ? { ...m, enabled } : m))
      );
      toast.success(`Model ${enabled ? "enabled" : "disabled"} successfully`);
    } catch (error: any) {
      console.error("Error updating model:", error);
      toast.error("Failed to update model");
    } finally {
      setUpdating(false);
    }
  };

  const setDefaultModel = async (modelId: string, category: "chat" | "embedding") => {
    setUpdating(true);
    try {
      // First, remove default flag from all models in this category
      const { error: removeError } = await supabase
        .from("ai_models")
        .update({ is_default: false })
        .eq("category", category);

      if (removeError) throw removeError;

      // Then set the selected model as default
      const { error: setError } = await supabase
        .from("ai_models")
        .update({ is_default: true })
        .eq("id", modelId);

      if (setError) throw setError;

      setModels((prev) =>
        prev.map((m) =>
          m.category === category
            ? { ...m, is_default: m.id === modelId }
            : m
        )
      );
      toast.success(`Default ${category} model set successfully`);
    } catch (error: any) {
      console.error("Error setting default model:", error);
      toast.error("Failed to set default model");
    } finally {
      setUpdating(false);
    }
  };

  const calculateCost = (model: AIModel) => {
    const inputCost = (inputTokens / 1000) * model.input_cost_per_1k;
    const outputCost = (outputTokens / 1000) * model.output_cost_per_1k;
    const embeddingCost = (embeddingTokens / 1000) * model.embedding_cost_per_1k;

    if (model.category === "embedding") {
      return embeddingCost;
    }
    return inputCost + outputCost;
  };

  const formatCost = (cost: number) => {
    if (cost < 0.01) {
      return `$${cost.toFixed(6)}`;
    }
    return `$${cost.toFixed(4)}`;
  };

  const getFeatureBadges = (features: Record<string, boolean> | null) => {
    const badges = [];
    if (!features) return badges;
    if (features.vision) badges.push({ label: "Vision", icon: <Eye className="h-3 w-3" /> });
    if (features.reasoning) badges.push({ label: "Reasoning", icon: <Brain className="h-3 w-3" /> });
    if (features.fast) badges.push({ label: "Fast", icon: <Rocket className="h-3 w-3" /> });
    if (features.web_search) badges.push({ label: "Web Search", icon: <Zap className="h-3 w-3" /> });
    if (features.multimodal) badges.push({ label: "Multimodal", icon: <Sparkles className="h-3 w-3" /> });
    if (features.highest_quality) badges.push({ label: "Premium", icon: <Star className="h-3 w-3" /> });
    return badges;
  };

  // Sync handler for individual provider
  const handleSyncProvider = async (providerSlug: string) => {
    try {
      const result = await syncModels.mutateAsync({ providerSlug });

      if (result.success) {
        toast.success(
          `Synced ${result.synced || 0} new models, updated ${result.updated || 0} existing models${
            result.errors ? `, ${result.errors} errors` : ''
          }`
        );
        loadData(); // Reload the data
      }
    } catch (error: any) {
      console.error("Error syncing models:", error);
      toast.error(error.message || "Failed to sync models");
    }
  };

  // Sync handler for all providers
  const handleSyncAll = async () => {
    try {
      const results = await syncAllModels.mutateAsync();

      let totalSynced = 0;
      let totalUpdated = 0;
      let totalErrors = 0;

      Object.values(results).forEach((result) => {
        if (result.success) {
          totalSynced += result.synced || 0;
          totalUpdated += result.updated || 0;
          totalErrors += result.errors || 0;
        }
      });

      toast.success(
        `Synced ${totalSynced} new models, updated ${totalUpdated} existing models${
          totalErrors ? `, ${totalErrors} errors` : ''
        }`
      );
      loadData(); // Reload the data
    } catch (error: any) {
      console.error("Error syncing all models:", error);
      toast.error(error.message || "Failed to sync models");
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Model Management</h1>
          <p className="text-muted-foreground">
            Configure AI providers, models, and pricing for your platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Sync Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                disabled={syncModels.isPending || syncAllModels.isPending}
              >
                {(syncModels.isPending || syncAllModels.isPending) ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Sync Models
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleSyncAll}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Sync All Providers
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {providers.map((provider) => (
                <DropdownMenuItem
                  key={provider.id}
                  onClick={() => handleSyncProvider(provider.slug)}
                >
                  {providerIcons[provider.slug]}
                  <span className="ml-2">Sync {provider.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Cost Calculator */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Calculator className="mr-2 h-4 w-4" />
                Cost Calculator
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cost Calculator</DialogTitle>
              <DialogDescription>
                Estimate costs for different models based on token usage
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Input Tokens</Label>
                  <Input
                    type="number"
                    value={inputTokens}
                    onChange={(e) => setInputTokens(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Output Tokens</Label>
                  <Input
                    type="number"
                    value={outputTokens}
                    onChange={(e) => setOutputTokens(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Embedding Tokens</Label>
                  <Input
                    type="number"
                    value={embeddingTokens}
                    onChange={(e) => setEmbeddingTokens(Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Chat Models</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Model</TableHead>
                      <TableHead className="text-right">Estimated Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {models
                      .filter((m) => m.category === "chat" && m.enabled)
                      .map((model) => (
                        <TableRow key={model.id}>
                          <TableCell className="font-medium">{model.name}</TableCell>
                          <TableCell className="text-right">
                            {formatCost(calculateCost(model))}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Embedding Models</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Model</TableHead>
                      <TableHead className="text-right">Estimated Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {models
                      .filter((m) => m.category === "embedding" && m.enabled)
                      .map((model) => (
                        <TableRow key={model.id}>
                          <TableCell className="font-medium">{model.name}</TableCell>
                          <TableCell className="text-right">
                            {formatCost(calculateCost(model))}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Active Provider Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-primary" />
            Active Provider
          </CardTitle>
          <CardDescription>
            Select which AI provider powers all agent chats and executions. Only one provider is active at a time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {providers.map((provider) => {
              const isLovable = provider.slug === "lovable";
              return (
                <Card
                  key={provider.id}
                  className={`cursor-pointer border-2 transition-colors ${
                    provider.is_active
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => !provider.is_active && setActiveProvider(provider.id)}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg border p-2 bg-background">
                          {providerIcons[provider.slug] ?? <Brain className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-semibold">{provider.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {models.filter((m) => m.provider_id === provider.id && m.enabled).length} models
                          </p>
                        </div>
                      </div>
                      {provider.is_active && (
                        <Badge className="gap-1 bg-primary text-primary-foreground">
                          <CheckCircle2 className="h-3 w-3" />
                          Active
                        </Badge>
                      )}
                    </div>

                    {/* Lovable AI: built-in, no key needed */}
                    {isLovable ? (
                      <div className="flex items-center gap-2 pt-2 border-t text-sm text-green-600 dark:text-green-400">
                        <Shield className="h-3.5 w-3.5" />
                        Built-in — No API key required
                      </div>
                    ) : (
                      <div className="pt-2 border-t space-y-2">
                        <button
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedKeySlug(expandedKeySlug === provider.slug ? null : provider.slug);
                          }}
                        >
                          <Key className="h-3 w-3" />
                          {expandedKeySlug === provider.slug ? "Hide API Key" : "Configure API Key"}
                        </button>
                        {expandedKeySlug === provider.slug && (
                          <div
                            className="flex gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Input
                              type="password"
                              placeholder={`Enter ${provider.api_key_secret_name || "API key"}`}
                              value={apiKeyInputs[provider.slug] || ""}
                              onChange={(e) =>
                                setApiKeyInputs((prev) => ({ ...prev, [provider.slug]: e.target.value }))
                              }
                              className="h-8 text-xs"
                            />
                            <Button
                              size="sm"
                              className="h-8 text-xs shrink-0"
                              disabled={savingKey === provider.slug}
                              onClick={() => saveApiKey(provider.slug, provider.api_key_secret_name || "")}
                            >
                              {savingKey === provider.slug ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                "Save"
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Providers Overview */}
      <Card>
        <CardHeader>
          <CardTitle>All Providers</CardTitle>
          <CardDescription>
            Enable or disable providers. Use the Active Provider section above to control which one is used for chat.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {providers.map((provider) => (
              <Card key={provider.id} className="border-2">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg border p-2">
                          {providerIcons[provider.slug] ?? <Brain className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-semibold">{provider.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {models.filter((m) => m.provider_id === provider.id && m.enabled).length}{" "}
                            models
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={provider.enabled}
                        onCheckedChange={(enabled) => toggleProvider(provider.id, enabled)}
                        disabled={updating}
                      />
                    </div>

                    {/* API Key Status */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      {provider.slug === "lovable" ? (
                        <Badge variant="default" className="gap-1 bg-green-500">
                          <Shield className="h-3 w-3" />
                          Built-in
                        </Badge>
                      ) : provider.is_connected ? (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          API Configured
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Not Configured
                        </Badge>
                      )}

                      {provider.integration_provider_id && (
                        <Link to={`/admin/integrations/${provider.slug}`}>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Models by Provider */}
      {providers
        .filter((p) => p.enabled)
        .map((provider) => {
          const providerModels = models.filter((m) => m.provider_id === provider.id);
          const chatModels = providerModels.filter((m) => m.category === "chat");
          const embeddingModels = providerModels.filter((m) => m.category === "embedding");

          return (
            <Card key={provider.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg border p-2">{providerIcons[provider.slug]}</div>
                  <div>
                    <CardTitle>{provider.name} Models</CardTitle>
                    <CardDescription>
                      Configure models and pricing for {provider.name}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Chat Models */}
                {chatModels.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold">Chat Models</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Model</TableHead>
                          <TableHead>Context</TableHead>
                          <TableHead>Input Cost</TableHead>
                          <TableHead>Output Cost</TableHead>
                          <TableHead>Features</TableHead>
                          <TableHead>Default</TableHead>
                          <TableHead>Enabled</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {chatModels.map((model) => (
                          <TableRow key={model.id}>
                            <TableCell className="font-medium">{model.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {(model.context_window / 1000).toFixed(0)}k
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs">
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                {model.input_cost_per_1k.toFixed(5)}/1k
                              </div>
                            </TableCell>
                            <TableCell className="text-xs">
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                {model.output_cost_per_1k.toFixed(5)}/1k
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {getFeatureBadges(model.features).map((badge, i) => (
                                  <Badge key={i} variant="secondary" className="gap-1">
                                    {badge.icon}
                                    {badge.label}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant={model.is_default ? "default" : "outline"}
                                size="sm"
                                onClick={() => setDefaultModel(model.id, "chat")}
                                disabled={updating || !model.enabled}
                              >
                                {model.is_default ? (
                                  <CheckCircle2 className="h-4 w-4" />
                                ) : (
                                  <XCircle className="h-4 w-4" />
                                )}
                              </Button>
                            </TableCell>
                            <TableCell>
                              <Switch
                                checked={model.enabled}
                                onCheckedChange={(enabled) => toggleModel(model.id, enabled)}
                                disabled={updating}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Embedding Models */}
                {embeddingModels.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold">Embedding Models</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Model</TableHead>
                          <TableHead>Context</TableHead>
                          <TableHead>Cost</TableHead>
                          <TableHead>Features</TableHead>
                          <TableHead>Default</TableHead>
                          <TableHead>Enabled</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {embeddingModels.map((model) => (
                          <TableRow key={model.id}>
                            <TableCell className="font-medium">{model.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {(model.context_window / 1000).toFixed(1)}k
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs">
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                {model.embedding_cost_per_1k.toFixed(6)}/1k
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {getFeatureBadges(model.features).map((badge, i) => (
                                  <Badge key={i} variant="secondary" className="gap-1">
                                    {badge.icon}
                                    {badge.label}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant={model.is_default ? "default" : "outline"}
                                size="sm"
                                onClick={() => setDefaultModel(model.id, "embedding")}
                                disabled={updating || !model.enabled}
                              >
                                {model.is_default ? (
                                  <CheckCircle2 className="h-4 w-4" />
                                ) : (
                                  <XCircle className="h-4 w-4" />
                                )}
                              </Button>
                            </TableCell>
                            <TableCell>
                              <Switch
                                checked={model.enabled}
                                onCheckedChange={(enabled) => toggleModel(model.id, enabled)}
                                disabled={updating}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
    </div>
  );
}
