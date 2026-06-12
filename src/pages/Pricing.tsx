import { Link } from "react-router-dom";
import { useState } from "react";
import {
  ArrowRight,
  Brain,
  Check,
  Menu,
  Minus,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBranding } from "@/contexts/BrandingContext";
import { AIIndicator, AIGradientText } from "@/components/ui/ai-indicator";
import { Footer } from "@/components/landing/Footer";
import { cn } from "@/lib/utils";

const DEMO_BOOKING_URL = "https://nonprofitai.software/try-demo";
const CONTACT_SALES_URL = "https://nonprofitai.software/contact";

interface PricingTier {
  id: string;
  name: string;
  price: string;
  priceNote: string;
  budgetGuidance: string;
  description: string;
  modules: string[];
  aiRunsPerMonth: string;
  ctaLabel: string;
  ctaHref: string;
  popular?: boolean;
}

const PRICING_TIERS: PricingTier[] = [
  {
    id: "starter",
    name: "Starter",
    price: "$299",
    priceNote: "/month",
    budgetGuidance: "For organizations under $500K annual budget",
    description:
      "Essential operational intelligence for smaller nonprofits getting started with AI-assisted workflows.",
    modules: [
      "Role-based dashboards (ED, DD, FM, OM)",
      "Grants management",
      "Events hub",
      "Board reports",
      "Data health monitoring",
      "Core AI agent team (4 agents)",
    ],
    aiRunsPerMonth: "1,000",
    ctaLabel: "Book a Demo",
    ctaHref: DEMO_BOOKING_URL,
  },
  {
    id: "growth",
    name: "Growth",
    price: "$599",
    priceNote: "/month",
    budgetGuidance: "For organizations with $500K–$2M annual budget",
    description:
      "Full fundraising and people operations for mid-size nonprofits ready to scale donor engagement.",
    modules: [
      "Everything in Starter",
      "Donation center & campaigns",
      "Membership management",
      "Volunteer management",
      "Donor pipeline & retention",
      "Communications hub",
      "Knowledge base & semantic search",
      "Meetings with AI summaries",
      "Task & action management",
      "Full AI agent teams (16 agents)",
    ],
    aiRunsPerMonth: "5,000",
    ctaLabel: "Book a Demo",
    ctaHref: DEMO_BOOKING_URL,
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    priceNote: "pricing",
    budgetGuidance: "For organizations with $2M+ annual budget",
    description:
      "Advanced CRM, projects, custom integrations, and dedicated support for complex organizations.",
    modules: [
      "Everything in Growth",
      "CRM & business development",
      "Projects & milestones",
      "Impact dashboard",
      "Custom integrations & API access",
      "SSO & advanced security",
      "Dedicated success manager",
      "Custom AI agent configuration",
    ],
    aiRunsPerMonth: "Custom",
    ctaLabel: "Talk to Sales",
    ctaHref: CONTACT_SALES_URL,
  },
];

type ComparisonValue = boolean | string;

interface ComparisonRow {
  feature: string;
  starter: ComparisonValue;
  growth: ComparisonValue;
  enterprise: ComparisonValue;
  highlight?: boolean;
}

const COMPARISON_ROWS: ComparisonRow[] = [
  {
    feature: "Annual org budget",
    starter: "Under $500K",
    growth: "$500K – $2M",
    enterprise: "$2M+",
    highlight: true,
  },
  {
    feature: "Monthly price",
    starter: "$299/mo",
    growth: "$599/mo",
    enterprise: "Custom",
    highlight: true,
  },
  {
    feature: "AI agent runs / month",
    starter: "1,000",
    growth: "5,000",
    enterprise: "Custom",
  },
  {
    feature: "Included users",
    starter: "Up to 10",
    growth: "Up to 25",
    enterprise: "Unlimited",
  },
  {
    feature: "Role-based dashboards",
    starter: true,
    growth: true,
    enterprise: true,
  },
  {
    feature: "Grants & board reports",
    starter: true,
    growth: true,
    enterprise: true,
  },
  {
    feature: "Events & data health",
    starter: true,
    growth: true,
    enterprise: true,
  },
  {
    feature: "Donations & campaigns",
    starter: false,
    growth: true,
    enterprise: true,
  },
  {
    feature: "Membership & volunteers",
    starter: false,
    growth: true,
    enterprise: true,
  },
  {
    feature: "Donor pipeline & retention",
    starter: false,
    growth: true,
    enterprise: true,
  },
  {
    feature: "Knowledge base",
    starter: false,
    growth: true,
    enterprise: true,
  },
  {
    feature: "Meetings & AI summaries",
    starter: false,
    growth: true,
    enterprise: true,
  },
  {
    feature: "CRM & projects",
    starter: false,
    growth: false,
    enterprise: true,
  },
  {
    feature: "Custom integrations",
    starter: false,
    growth: false,
    enterprise: true,
  },
  {
    feature: "Dedicated success manager",
    starter: false,
    growth: false,
    enterprise: true,
  },
  {
    feature: "Support",
    starter: "Email",
    growth: "Priority email",
    enterprise: "Dedicated",
  },
];

function ComparisonCell({
  value,
  emphasized = false,
}: {
  value: ComparisonValue;
  emphasized?: boolean;
}) {
  if (typeof value === "boolean") {
    return value ? (
      <div
        className={cn(
          "mx-auto flex h-6 w-6 items-center justify-center rounded-full",
          emphasized ? "ai-gradient" : "bg-primary/10",
        )}
      >
        <Check
          className={cn(
            "h-3.5 w-3.5",
            emphasized ? "text-white" : "text-primary",
          )}
        />
      </div>
    ) : (
      <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-muted">
        <X className="h-3.5 w-3.5 text-muted-foreground/50" />
      </div>
    );
  }

  if (value === "—") {
    return <Minus className="mx-auto h-4 w-4 text-muted-foreground/40" />;
  }

  return (
    <span
      className={cn(
        "text-sm",
        emphasized ? "font-semibold text-primary" : "text-muted-foreground",
      )}
    >
      {value}
    </span>
  );
}

function PricingTierCard({ tier }: { tier: PricingTier }) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border bg-card p-8 shadow-soft transition-shadow hover:shadow-elevated",
        tier.popular
          ? "border-primary/40 ring-2 ring-primary/20"
          : "border-border",
      )}
    >
      {tier.popular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 ai-gradient border-0 px-4 py-1 text-xs font-bold text-white">
          Most Popular
        </Badge>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-bold text-foreground">{tier.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{tier.budgetGuidance}</p>
      </div>

      <div className="mb-4 flex items-baseline gap-1">
        <span className="text-4xl font-bold tracking-tight text-foreground">
          {tier.price}
        </span>
        <span className="text-sm text-muted-foreground">{tier.priceNote}</span>
      </div>

      <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
        {tier.description}
      </p>

      <div className="mb-6 rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          AI agent runs
        </p>
        <p className="mt-1 text-2xl font-bold text-foreground">
          {tier.aiRunsPerMonth}
          {tier.aiRunsPerMonth !== "Custom" && (
            <span className="text-sm font-normal text-muted-foreground">
              {" "}
              / month
            </span>
          )}
        </p>
      </div>

      <ul className="mb-8 flex-1 space-y-3">
        {tier.modules.map((module) => (
          <li key={module} className="flex items-start gap-2.5 text-sm">
            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Check className="h-3 w-3 text-primary" />
            </div>
            <span className="text-muted-foreground">{module}</span>
          </li>
        ))}
      </ul>

      <Button
        size="lg"
        className={cn(
          "h-12 w-full rounded-full font-semibold",
          tier.popular
            ? "btn-primary-bold border-0 text-white"
            : "border-2",
        )}
        variant={tier.popular ? "default" : "outline"}
        asChild
      >
        <a href={tier.ctaHref} target="_blank" rel="noopener noreferrer">
          {tier.ctaLabel}
          <ArrowRight className="ml-2 h-4 w-4" />
        </a>
      </Button>
    </div>
  );
}

export default function Pricing() {
  const { companyName, logoUrl } = useBranding();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/home" className="flex items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={companyName}
                className="h-9 w-9 rounded-lg object-cover"
              />
            ) : (
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl ai-gradient shadow-ai">
                <Brain className="h-5 w-5 text-white" />
                <div className="absolute -top-0.5 -right-0.5">
                  <AIIndicator variant="dot" size="sm" />
                </div>
              </div>
            )}
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-foreground">
                Nonprofit Control Tower
              </span>
              <span className="hidden text-xs text-muted-foreground sm:inline">
                by NonprofitAI.software
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            <Link
              to="/home#features"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </Link>
            <Link
              to="/pricing"
              className="text-sm font-medium text-foreground"
            >
              Pricing
            </Link>
            <a
              href="https://nonprofitai.software"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Resources
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="hidden font-medium sm:flex"
              asChild
            >
              <Link to="/login">Sign in</Link>
            </Button>
            <Button
              size="sm"
              className="btn-primary-bold hidden rounded-full border-0 px-5 font-semibold text-white sm:flex"
              asChild
            >
              <a
                href={DEMO_BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Sparkles className="mr-1.5 h-4 w-4" />
                Get Started
              </a>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-border lg:hidden">
            <nav className="flex flex-col gap-2 p-4">
              <Link
                to="/home#features"
                className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                to="/pricing"
                className="rounded-lg px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                to="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign in
              </Link>
              <Button
                size="sm"
                className="btn-primary-bold mt-2 rounded-full border-0 font-semibold text-white"
                asChild
              >
                <a
                  href={DEMO_BOOKING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Sparkles className="mr-1.5 h-4 w-4" />
                  Get Started
                </a>
              </Button>
            </nav>
          </div>
        )}
      </header>

      <main>
        <section className="relative overflow-hidden bg-ai-mesh">
          <div className="absolute inset-0 -z-10 bg-grid-pattern opacity-40" />
          <div className="absolute top-10 left-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 right-10 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />

          <div className="mx-auto max-w-7xl px-6 py-20 text-center lg:py-28">
            <div className="mb-4 flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                Pricing
              </span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Plans That Scale With{" "}
              <AIGradientText>Your Mission</AIGradientText>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Transparent pricing sized to your organization&apos;s budget — so
              you can move from demo to decision without guesswork. All plans
              include secure hosting, RLS-protected data, and nonprofit-specific
              AI agents.
            </p>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground/80">
              Pricing shown is indicative. Final rates confirmed during your
              onboarding call.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-3">
            {PRICING_TIERS.map((tier) => (
              <PricingTierCard key={tier.id} tier={tier} />
            ))}
          </div>
        </section>

        <section className="border-y border-border/50 bg-muted/20">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Compare <AIGradientText>Plans</AIGradientText>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                See what&apos;s included at each tier — modules, AI capacity, and
                support.
              </p>
            </div>

            <div className="mx-auto mt-12 max-w-5xl overflow-hidden rounded-2xl border border-border bg-card shadow-elevated">
              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="p-5 text-left font-bold text-foreground">
                        Feature
                      </th>
                      <th className="p-5 text-center font-bold text-muted-foreground">
                        Starter
                      </th>
                      <th className="p-5 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-bold text-primary">Growth</span>
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-semibold"
                          >
                            Most Popular
                          </Badge>
                        </div>
                      </th>
                      <th className="p-5 text-center font-bold text-muted-foreground">
                        Enterprise
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON_ROWS.map((row) => (
                      <tr
                        key={row.feature}
                        className={cn(
                          "border-b border-border/50 last:border-0",
                          row.highlight
                            ? "bg-primary/5"
                            : "hover:bg-muted/20",
                        )}
                      >
                        <td className="p-5 font-semibold text-foreground">
                          {row.feature}
                        </td>
                        <td className="p-5 text-center">
                          <ComparisonCell value={row.starter} />
                        </td>
                        <td className="p-5 text-center bg-primary/[0.03]">
                          <ComparisonCell value={row.growth} emphasized />
                        </td>
                        <td className="p-5 text-center">
                          <ComparisonCell value={row.enterprise} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-border sm:hidden">
                {COMPARISON_ROWS.map((row) => (
                  <div key={row.feature} className="p-4">
                    <p className="mb-3 font-semibold text-foreground">
                      {row.feature}
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div>
                        <p className="mb-1 font-medium text-muted-foreground">
                          Starter
                        </p>
                        <ComparisonCell value={row.starter} />
                      </div>
                      <div className="rounded-lg bg-primary/5 p-1">
                        <p className="mb-1 font-medium text-primary">Growth</p>
                        <ComparisonCell value={row.growth} emphasized />
                      </div>
                      <div>
                        <p className="mb-1 font-medium text-muted-foreground">
                          Enterprise
                        </p>
                        <ComparisonCell value={row.enterprise} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
          <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-ai-mesh">
            <div className="absolute top-0 left-0 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-accent/15 blur-3xl" />
            <div className="absolute inset-0 bg-grid-pattern opacity-20" />

            <div className="relative px-8 py-16 text-center sm:px-16 sm:py-20">
              <div className="mb-6 flex items-center justify-center">
                <AIIndicator variant="badge" status="active" size="lg" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Ready for the Next Step?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Book a 30-minute walkthrough with our team. We&apos;ll map your
                current tools, recommend the right tier, and show you a live demo
                tailored to your organization.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  size="lg"
                  className="btn-primary-bold h-14 rounded-full border-0 px-10 text-base font-bold text-white"
                  asChild
                >
                  <a
                    href={DEMO_BOOKING_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Schedule a Demo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 rounded-full border-2 bg-background/80 px-10 text-base font-semibold backdrop-blur-sm"
                  asChild
                >
                  <a
                    href={CONTACT_SALES_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Contact Sales
                  </a>
                </Button>
              </div>
              <p className="mt-8 text-sm text-muted-foreground">
                No long-term contracts on Starter and Growth. 14-day pilot
                available for qualified organizations.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
