/**
 * Agent Team Configuration
 *
 * Static source of truth for all AI agent teams and their members.
 * Used by the Browse page, Detail page, Dashboard card, and contextual banners.
 */

export interface AgentTeamAgent {
  name: string;
  slug: string;
  description: string;
  icon: string;
  capabilities?: string[];
  howToUse?: string[];
  whereToFind?: { label: string; path: string };
}

export interface AgentTeamDef {
  id: string;
  name: string;
  tagline: string;
  accentColor: string;
  gradientFrom: string;
  gradientTo: string;
  agents: AgentTeamAgent[];
}

export const agentTeams: Record<string, AgentTeamDef> = {
  sales: {
    id: "sales",
    name: "Donor Intelligence Team",
    tagline: "AI agents that help you cultivate donors and grow giving",
    accentColor: "border-b-red-500",
    gradientFrom: "280 70% 50%",
    gradientTo: "330 80% 55%",
    agents: [
      {
        name: "Donor Coach",
        slug: "deal-coach",
        description: "Analyzes donor relationships and recommends cultivation strategies to increase giving.",
        icon: "Trophy",
        capabilities: [
          "Score donors by engagement level and giving capacity",
          "Recommend personalized outreach strategies",
          "Identify at-risk donors before they lapse",
          "Suggest optimal ask amounts based on history",
        ],
        howToUse: [
          "Navigate to the Cultivation Pipeline",
          "Select a donor prospect to see coaching insights",
          "Review the recommended actions and talking points",
          "Mark actions as complete to track progress",
        ],
        whereToFind: { label: "Cultivation Pipeline", path: "/deals" },
      },
      {
        name: "Daily Briefing",
        slug: "deal-daily-briefing",
        description: "Morning summary of donor activity, upcoming meetings, and pipeline changes.",
        icon: "Newspaper",
        capabilities: [
          "Compile overnight donor activity across channels",
          "Surface today's meetings with donor context",
          "Flag pipeline stage changes and new prospects",
          "Highlight grant deadlines within 7 days",
        ],
        howToUse: [
          "Check your dashboard each morning for the briefing card",
          "Click through to any highlighted item for details",
          "Use the briefing to prioritize your day",
        ],
        whereToFind: { label: "Dashboard", path: "/dashboard" },
      },
      {
        name: "Quick Donor Email",
        slug: "quick-deal-email",
        description: "Drafts personalized donor communications based on relationship history.",
        icon: "Mail",
        capabilities: [
          "Generate thank-you letters after gifts",
          "Draft meeting follow-up emails with action items",
          "Create personalized event invitations",
          "Write grant acknowledgment correspondence",
        ],
        howToUse: [
          "Open a donor or contact record",
          "Click the 'Draft Email' action button",
          "Review and customize the generated draft",
          "Send directly or copy to your email client",
        ],
        whereToFind: { label: "Contacts", path: "/contacts" },
      },
      {
        name: "Donor AI Chat",
        slug: "deal-ai-chat",
        description: "Conversational assistant for donor research and relationship insights.",
        icon: "MessageSquare",
        capabilities: [
          "Answer questions about donor history and preferences",
          "Research prospect wealth and philanthropic interests",
          "Compare donor segments and giving patterns",
          "Generate talking points for upcoming meetings",
        ],
        howToUse: [
          "Open the AI Chat from the sidebar",
          "Ask questions about any donor or prospect",
          "Use suggested prompts or type your own",
          "Export insights to donor records",
        ],
        whereToFind: { label: "AI Chat", path: "/ai-chat" },
      },
    ],
  },
  meetings: {
    id: "meetings",
    name: "Meeting AI Team",
    tagline: "AI agents that capture, analyze, and act on meeting intelligence",
    accentColor: "border-b-blue-500",
    gradientFrom: "190 80% 45%",
    gradientTo: "210 85% 55%",
    agents: [
      {
        name: "Meeting Summarizer",
        slug: "meeting-summarizer",
        description: "Automatically generates concise summaries from meeting transcripts and notes.",
        icon: "FileText",
        capabilities: [
          "Extract key decisions and commitments from transcripts",
          "Generate structured meeting minutes",
          "Identify donor-related action items automatically",
          "Create shareable summary documents",
        ],
        howToUse: [
          "Record or upload a meeting transcript",
          "The summarizer processes it within minutes",
          "Review the generated summary and highlights",
          "Share with attendees or attach to donor records",
        ],
        whereToFind: { label: "Meeting Transcripts", path: "/meetings/transcripts" },
      },
      {
        name: "Action Extractor",
        slug: "action-item-extractor",
        description: "Pulls action items from meeting discussions and assigns them to team members.",
        icon: "ListChecks",
        capabilities: [
          "Detect commitments and promises in conversation",
          "Auto-assign action items to mentioned team members",
          "Set suggested due dates based on context",
          "Track completion across meetings",
        ],
        howToUse: [
          "Open any meeting with a transcript",
          "Navigate to the Takeaways tab",
          "Review extracted action items",
          "Confirm assignments and due dates",
        ],
        whereToFind: { label: "Meeting Takeaways", path: "/meetings/schedule" },
      },
      {
        name: "Efficiency Analyzer",
        slug: "meeting-efficiency-analyzer",
        description: "Evaluates meeting effectiveness and suggests improvements for better outcomes.",
        icon: "Gauge",
        capabilities: [
          "Score meetings on efficiency metrics (time, decisions, participation)",
          "Identify meetings that could be emails",
          "Track meeting culture trends over time",
          "Suggest optimal meeting lengths and formats",
        ],
        howToUse: [
          "Meetings are analyzed automatically after completion",
          "View efficiency scores on the meetings dashboard",
          "Review trend reports monthly",
          "Apply suggested improvements to recurring meetings",
        ],
        whereToFind: { label: "Meetings", path: "/meetings/schedule" },
      },
      {
        name: "Client Call Analyzer",
        slug: "client-call-analyzer",
        description: "Analyzes donor and funder calls for sentiment, needs, and follow-up opportunities.",
        icon: "PhoneCall",
        capabilities: [
          "Detect donor sentiment and engagement level",
          "Identify unspoken needs and concerns",
          "Flag follow-up opportunities and next steps",
          "Compare call quality across team members",
        ],
        howToUse: [
          "Tag a meeting as a donor or funder call",
          "Upload or connect the transcript",
          "Review the analysis dashboard for insights",
          "Act on flagged follow-up opportunities",
        ],
        whereToFind: { label: "Meeting Transcripts", path: "/meetings/transcripts" },
      },
    ],
  },
  eos: {
    id: "eos",
    name: "Strategy AI Team",
    tagline: "AI agents that power strategic planning and organizational health",
    accentColor: "border-b-amber-500",
    gradientFrom: "30 90% 50%",
    gradientTo: "45 95% 55%",
    agents: [
      {
        name: "Strategy Coach",
        slug: "eos-coach",
        description: "Guides strategic planning sessions and tracks organizational goal alignment.",
        icon: "GraduationCap",
        capabilities: [
          "Facilitate strategic planning with structured frameworks",
          "Track OKR progress and flag misalignment",
          "Generate quarterly review agendas",
          "Recommend priority adjustments based on data",
        ],
        howToUse: [
          "Open the Strategy section from the sidebar",
          "Review your current OKRs and scorecards",
          "Ask the coach for recommendations",
          "Apply suggested adjustments to your plan",
        ],
      },
      {
        name: "Pattern Detective",
        slug: "eos-pattern-detective",
        description: "Discovers recurring patterns and trends across organizational data.",
        icon: "Search",
        capabilities: [
          "Identify recurring issues and bottlenecks",
          "Detect seasonal giving patterns",
          "Surface correlations between activities and outcomes",
          "Flag anomalies in operational data",
        ],
        howToUse: [
          "The detective runs automatically on your data",
          "Review pattern alerts on the dashboard",
          "Drill into specific findings for detail",
          "Use insights to inform strategic decisions",
        ],
      },
      {
        name: "Team Health Monitor",
        slug: "eos-pod-health",
        description: "Monitors team dynamics, workload distribution, and collaboration health.",
        icon: "HeartPulse",
        capabilities: [
          "Track team capacity and workload balance",
          "Detect burnout risk indicators early",
          "Measure cross-team collaboration frequency",
          "Recommend team structure optimizations",
        ],
        howToUse: [
          "Review the team health dashboard weekly",
          "Check individual team scores for red flags",
          "Act on recommended interventions",
          "Track improvement over time",
        ],
      },
      {
        name: "Quarterly Digest",
        slug: "eos-quarterly-digest",
        description: "Compiles comprehensive quarterly reports with AI-generated analysis.",
        icon: "CalendarRange",
        capabilities: [
          "Aggregate metrics across all departments",
          "Generate narrative analysis of quarterly performance",
          "Compare against previous quarters and annual goals",
          "Produce board-ready summary documents",
        ],
        howToUse: [
          "Trigger digest generation at quarter end",
          "Review the auto-generated report draft",
          "Customize sections and add commentary",
          "Export to PDF for board distribution",
        ],
        whereToFind: { label: "Board Reports", path: "/board-reports" },
      },
    ],
  },
  projects: {
    id: "projects",
    name: "Project AI Team",
    tagline: "AI agents that streamline project planning, execution, and delivery",
    accentColor: "border-b-emerald-500",
    gradientFrom: "150 70% 40%",
    gradientTo: "170 75% 50%",
    agents: [
      {
        name: "Project Analyst",
        slug: "project-analyst",
        description: "Analyzes project timelines, budgets, and resource allocation for optimal delivery.",
        icon: "BarChart3",
        capabilities: [
          "Forecast project completion dates based on velocity",
          "Identify resource bottlenecks before they occur",
          "Track budget burn rate against milestones",
          "Recommend task prioritization for maximum impact",
        ],
        howToUse: [
          "Open any project from the Projects section",
          "Review the AI analysis panel on the right",
          "Check forecasts and risk indicators",
          "Apply recommended adjustments to the plan",
        ],
        whereToFind: { label: "Projects", path: "/projects" },
      },
      {
        name: "Program Planner",
        slug: "bug-feature-planner",
        description: "Helps plan and prioritize program initiatives based on impact and feasibility.",
        icon: "Bug",
        capabilities: [
          "Score initiatives by impact, effort, and alignment",
          "Generate implementation roadmaps",
          "Identify dependencies between initiatives",
          "Suggest phasing for resource-constrained teams",
        ],
        howToUse: [
          "Add new initiatives to your project board",
          "Run the planner for prioritization scoring",
          "Review the suggested roadmap",
          "Adjust priorities based on your context",
        ],
        whereToFind: { label: "Projects", path: "/projects" },
      },
      {
        name: "Technical Planner",
        slug: "technical-plan-generator",
        description: "Creates detailed technical implementation plans for system projects.",
        icon: "Cpu",
        capabilities: [
          "Break down technical projects into phases and tasks",
          "Estimate effort based on complexity analysis",
          "Identify technical risks and mitigation strategies",
          "Generate architecture decision records",
        ],
        howToUse: [
          "Describe your technical project requirements",
          "Review the generated implementation plan",
          "Customize phases, tasks, and estimates",
          "Track execution against the plan",
        ],
        whereToFind: { label: "Projects", path: "/projects" },
      },
      {
        name: "Process Reviewer",
        slug: "code-review-generator",
        description: "Reviews processes and workflows for efficiency improvements and best practices.",
        icon: "Code",
        capabilities: [
          "Audit current workflows for inefficiencies",
          "Benchmark against nonprofit best practices",
          "Generate process improvement recommendations",
          "Track implementation of suggested changes",
        ],
        howToUse: [
          "Select a process or workflow to review",
          "Run the analysis and wait for results",
          "Review findings and recommendations",
          "Implement changes and measure improvement",
        ],
      },
    ],
  },
};

export const allTeams: AgentTeamDef[] = Object.values(agentTeams);

/** Find which team an agent belongs to */
export function findTeamForAgent(slug: string): AgentTeamDef | undefined {
  return allTeams.find((t) => t.agents.some((a) => a.slug === slug));
}

/** Find an agent + its team by slug */
export function findAgentBySlug(
  slug: string
): { agent: AgentTeamAgent; team: AgentTeamDef } | undefined {
  for (const team of allTeams) {
    const agent = team.agents.find((a) => a.slug === slug);
    if (agent) return { agent, team };
  }
  return undefined;
}

/** Icon slug → Lucide icon name mapping */
export const AGENT_ICON_MAP: Record<string, string> = {
  "deal-coach": "Trophy",
  "deal-daily-briefing": "Newspaper",
  "quick-deal-email": "Mail",
  "deal-ai-chat": "MessageSquare",
  "meeting-summarizer": "FileText",
  "action-item-extractor": "ListChecks",
  "meeting-efficiency-analyzer": "Gauge",
  "client-call-analyzer": "PhoneCall",
  "eos-coach": "GraduationCap",
  "eos-pattern-detective": "Search",
  "eos-pod-health": "HeartPulse",
  "eos-quarterly-digest": "CalendarRange",
  "project-analyst": "BarChart3",
  "bug-feature-planner": "Bug",
  "technical-plan-generator": "Cpu",
  "code-review-generator": "Code",
  "lead-followup-research": "Target",
};

/** Category color map keyed by team id */
export const CATEGORY_COLORS: Record<string, { from: string; to: string; badge: string }> = {
  sales: {
    from: "280 70% 50%",
    to: "330 80% 55%",
    badge: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  },
  meetings: {
    from: "190 80% 45%",
    to: "210 85% 55%",
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  },
  eos: {
    from: "30 90% 50%",
    to: "45 95% 55%",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  },
  projects: {
    from: "150 70% 40%",
    to: "170 75% 50%",
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  general: {
    from: "199 89% 48%",
    to: "187 100% 42%",
    badge: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
  },
};
