import { Link } from "react-router-dom";
import { Brain } from "lucide-react";
import { AIIndicator } from "@/components/ui/ai-indicator";

const industries = [
  { name: "For Community Nonprofits", href: "/industries/community" },
  { name: "For Foundations", href: "/industries/foundations" },
  { name: "For Healthcare Nonprofits", href: "/industries/healthcare" },
  { name: "For Faith Organizations", href: "/industries/faith" },
];

const resources = [
  { name: "Security & Compliance", href: "/security" },
  { name: "Documentation", href: "/docs" },
  { name: "API Reference", href: "/api" },
  { name: "Support", href: "/support" },
];

const company = [
  { name: "About", href: "https://nonprofitai.software/about" },
  { name: "Blog", href: "https://nonprofitai.software/blog" },
  { name: "Careers", href: "https://nonprofitai.software/careers" },
  { name: "Contact", href: "https://nonprofitai.software/contact" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl ai-gradient shadow-ai">
                <Brain className="h-5 w-5 text-white" />
                <div className="absolute -top-0.5 -right-0.5">
                  <AIIndicator variant="dot" size="sm" />
                </div>
              </div>
              <div>
                <span className="text-lg font-bold text-foreground">Nonprofit Control Tower</span>
                <span className="ml-1 text-lg font-semibold text-primary">Control Tower</span>
              </div>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground leading-relaxed">
              The operational intelligence layer for modern nonprofits.
              Secure, mission-driven, and built to scale.
            </p>
            <a
              href="https://nonprofitai.software"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Visit nonprofitai.software →
            </a>
          </div>

          {/* Industries */}
          <div>
            <h4 className="text-sm font-bold text-foreground">Industries</h4>
            <ul className="mt-4 space-y-3">
              {industries.map((item) => (
                <li key={item.name}>
                  <Link 
                    to={item.href} 
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-bold text-foreground">Resources</h4>
            <ul className="mt-4 space-y-3">
              {resources.map((item) => (
                <li key={item.name}>
                  <Link 
                    to={item.href} 
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-bold text-foreground">Company</h4>
            <ul className="mt-4 space-y-3">
              {company.map((item) => (
                <li key={item.name}>
                  <a 
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} NonprofitAI.software. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="https://nonprofitai.software/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </a>
            <a href="https://nonprofitai.software/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
