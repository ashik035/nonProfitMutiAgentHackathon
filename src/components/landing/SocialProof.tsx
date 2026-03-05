import { Quote, TrendingUp, Clock, Zap, Sparkles } from "lucide-react";
import { AIIndicator, AIGradientText } from "@/components/ui/ai-indicator";

const testimonials = [
  {
    quote:
      "It's been a game-changer for our development team. We finally have one place to track donors, grants, and board priorities without the spreadsheet chaos.",
    author: "Sarah Mitchell",
    role: "Executive Director, Community Foundation",
  },
  {
    quote:
      "Our grant reporting time dropped by 70% and our board now has real-time visibility into our programs. Finally, AI built for nonprofits.",
    author: "Marcus Johnson",
    role: "COO, Healthcare Nonprofit",
  },
];

const stats = [
  {
    icon: TrendingUp,
    value: "80%",
    label: "of nonprofits cite operational efficiency as their #1 challenge",
  },
  {
    icon: Zap,
    value: "60%",
    label: "of nonprofit reporting tasks can be automated",
  },
  {
    icon: Clock,
    value: "2x",
    label: "faster grant reporting with AI assistance",
  },
];

export function SocialProof() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-4 flex items-center justify-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Trusted By Leaders
          </span>
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Why Firms Are <AIGradientText>Switching</AIGradientText>
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Join forward-thinking nonprofits already amplifying their mission with AI
        </p>
      </div>

      {/* Testimonials */}
      <div className="mx-auto mt-16 grid max-w-4xl gap-8 lg:grid-cols-2">
        {testimonials.map((testimonial, index) => (
          <div 
            key={index} 
            className="ai-card p-8 transition-all duration-300 hover:shadow-ai"
          >
            {/* AI indicator */}
            <div className="absolute top-4 right-4">
              <AIIndicator variant="dot" size="sm" status="active" />
            </div>
            
            <Quote className="mb-4 h-8 w-8 text-primary" />
            <blockquote className="text-lg font-medium leading-relaxed text-foreground">
              "{testimonial.quote}"
            </blockquote>
            <div className="mt-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full ai-gradient shadow-ai text-lg font-bold text-white">
                {testimonial.author.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-foreground">{testimonial.author}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="mx-auto mt-16 grid max-w-4xl gap-8 sm:grid-cols-3">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="group text-center rounded-2xl border border-border/50 bg-card p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-ai"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ai-gradient shadow-ai transition-transform group-hover:scale-105">
              <stat.icon className="h-7 w-7 text-white" />
            </div>
            <p className="text-4xl font-bold text-foreground">{stat.value}</p>
            <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
