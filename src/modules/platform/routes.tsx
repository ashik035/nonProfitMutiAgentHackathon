/**
 * Platform Module Routes
 *
 * Core user-facing routes: dashboard, profile, settings, feedback,
 * notifications, and auth callbacks.
 * These are always available regardless of module configuration.
 */
import { Navigate, Route } from "react-router-dom";
import { ModuleRoute } from "@/components/routing/ModuleRoute";

// Public pages
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import AuthCallback from "@/pages/AuthCallback";
import MicrosoftAuthCallback from "@/pages/MicrosoftAuthCallback";
import TermsAndConditions from "@/pages/TermsAndConditions";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Pricing from "@/pages/Pricing";
import NotFound from "@/pages/NotFound";

// Core protected pages (always available)
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import Sessions from "@/pages/Sessions";
import HelpPage from "@/pages/HelpPage";
import Notifications from "@/pages/Notifications";
import Feedback from "@/pages/Feedback";
import FeedbackDetail from "@/pages/FeedbackDetail";

import AIAgents from "@/pages/AIAgents";
import AIChat from "@/pages/AIChat";
import PersonalKnowledge from "@/modules/knowledge/pages/PersonalKnowledge";

// Nonprofit pages
import DataHealthPage from "@/pages/DataHealthPage";
import DonorPipelinePage from "@/pages/DonorPipelinePage";
import ReconciliationPage from "@/pages/ReconciliationPage";
import EventsHubPage from "@/pages/EventsHubPage";
import GrantsPage from "@/pages/GrantsPage";
import BoardReportsPage from "@/pages/BoardReportsPage";
import AIAgentsPage from "@/pages/AIAgentsPage";
import AIAgentDetailPage from "@/pages/AIAgentDetailPage";
import AIAgentSettingsPage from "@/pages/AIAgentSettingsPage";
import IntegrationCenterPage from "@/pages/IntegrationCenterPage";
import AgentsBrowse from "@/pages/AgentsBrowse";
import AgentDetail from "@/pages/AgentDetail";
import AgentActivityFeed from "@/pages/AgentActivityFeed";
import DonorRetentionPage from "@/pages/DonorRetentionPage";
import ProgramsPage from "@/pages/ProgramsPage";
import CommunicationsPage from "@/pages/CommunicationsPage";
import VoiceNotesPage from "@/pages/VoiceNotesPage";
import GrantWriterPage from "@/pages/GrantWriterPage";
import MembershipPage from "@/pages/MembershipPage";
import VolunteersPage from "@/pages/VolunteersPage";
import DonationCenterPage from "@/pages/DonationCenterPage";
import PublicPresencePage from "@/pages/PublicPresencePage";
import ImpactDashboardPage from "@/pages/ImpactDashboardPage";
import AIEngagementScoringPage from "@/pages/AIEngagementScoringPage";

/**
 * Public routes - no auth required
 */
export const publicRoutes = (
  <>
    <Route path="/" element={<Login />} />
    <Route path="/home" element={<Index />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/auth/callback" element={<AuthCallback />} />
    <Route path="/auth-callback" element={<MicrosoftAuthCallback />} />
    <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
    <Route path="/pricing" element={<Pricing />} />
  </>
);

/**
 * Core protected routes - always available to authenticated users
 */
export const coreProtectedRoutes = (
  <>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/settings" element={<Settings />} />
    <Route path="/sessions" element={<Sessions />} />
    <Route path="/help" element={<HelpPage />} />
    <Route path="/feedback" element={<Feedback />} />
    <Route path="/feedback/:id" element={<FeedbackDetail />} />

    {/* Feature-flag gated but part of platform */}
    <Route element={<ModuleRoute requiresFeatureFlag="enableNotifications" />}>
      <Route path="/notifications" element={<Notifications />} />
    </Route>

    {/* AI features */}
    <Route path="/ai-agents-legacy" element={<AIAgents />} />
    <Route path="/ai-chat" element={<AIChat />} />

    {/* Personal knowledge */}
    <Route path="/personal-knowledge" element={<PersonalKnowledge />} />

    {/* Nonprofit pages — installation-level module gates */}
    <Route element={<ModuleRoute module="data-health" />}>
      <Route path="/data-health" element={<DataHealthPage />} />
    </Route>
    <Route element={<ModuleRoute module="donor-pipeline" />}>
      <Route path="/donor-pipeline" element={<DonorPipelinePage />} />
    </Route>
    <Route element={<ModuleRoute module="reconciliation" />}>
      <Route path="/reconciliation" element={<ReconciliationPage />} />
    </Route>
    <Route element={<ModuleRoute module="events" />}>
      <Route path="/events" element={<EventsHubPage />} />
      <Route path="/event-management" element={<Navigate to="/events?tab=manage" replace />} />
    </Route>
    <Route element={<ModuleRoute module="grants" />}>
      <Route path="/grants" element={<GrantsPage />} />
    </Route>
    <Route element={<ModuleRoute module="board-reports" />}>
      <Route path="/board-reports" element={<BoardReportsPage />} />
    </Route>
    <Route element={<ModuleRoute module="ai-agents" />}>
      <Route path="/ai-agents" element={<AIAgentsPage />} />
      <Route path="/ai-agents/:id" element={<AIAgentDetailPage />} />
      <Route path="/ai-agents/:id/settings" element={<AIAgentSettingsPage />} />
      <Route path="/agents" element={<AgentsBrowse />} />
      <Route path="/agents/activity" element={<AgentActivityFeed />} />
      <Route path="/agents/:slug" element={<AgentDetail />} />
    </Route>
    <Route element={<ModuleRoute module="integration-center" />}>
      <Route path="/integration-center" element={<IntegrationCenterPage />} />
      <Route path="/integrations" element={<IntegrationCenterPage />} />
    </Route>
    <Route element={<ModuleRoute module="donor-retention" />}>
      <Route path="/donor-retention" element={<DonorRetentionPage />} />
    </Route>
    <Route element={<ModuleRoute module="programs" />}>
      <Route path="/programs" element={<ProgramsPage />} />
    </Route>
    <Route element={<ModuleRoute module="communications" />}>
      <Route path="/communications" element={<CommunicationsPage />} />
    </Route>
    <Route element={<ModuleRoute module="voice-notes" />}>
      <Route path="/voice-notes" element={<VoiceNotesPage />} />
    </Route>
    <Route element={<ModuleRoute module="grant-writer" />}>
      <Route path="/grant-writer" element={<GrantWriterPage />} />
    </Route>
    <Route element={<ModuleRoute module="membership" />}>
      <Route path="/membership" element={<MembershipPage />} />
    </Route>
    <Route element={<ModuleRoute module="volunteers" />}>
      <Route path="/volunteers" element={<VolunteersPage />} />
    </Route>
    <Route element={<ModuleRoute module="donations" />}>
      <Route path="/donations" element={<DonationCenterPage />} />
    </Route>
    <Route element={<ModuleRoute module="public-presence" />}>
      <Route path="/public-presence" element={<PublicPresencePage />} />
    </Route>
    <Route element={<ModuleRoute module="impact-dashboard" />}>
      <Route path="/impact-dashboard" element={<ImpactDashboardPage />} />
    </Route>
    <Route element={<ModuleRoute module="engagement-scoring" />}>
      <Route path="/engagement-scoring" element={<AIEngagementScoringPage />} />
    </Route>
  </>
);

/**
 * 404 catch-all
 */
export const catchAllRoute = <Route path="*" element={<NotFound />} />;
