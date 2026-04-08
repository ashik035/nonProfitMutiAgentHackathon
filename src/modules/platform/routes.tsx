/**
 * Platform Module Routes
 *
 * Core user-facing routes: dashboard, profile, settings, feedback,
 * notifications, and auth callbacks.
 * These are always available regardless of module configuration.
 */
import { Route } from "react-router-dom";
import { ModuleRoute } from "@/components/routing/ModuleRoute";

// Public pages
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import AuthCallback from "@/pages/AuthCallback";
import MicrosoftAuthCallback from "@/pages/MicrosoftAuthCallback";
import TermsAndConditions from "@/pages/TermsAndConditions";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import NotFound from "@/pages/NotFound";

// Core protected pages (always available)
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import Sessions from "@/pages/Sessions";
import Help from "@/pages/Help";
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
import EventsPage from "@/pages/EventsPage";
import GrantsPage from "@/pages/GrantsPage";
import BoardReportsPage from "@/pages/BoardReportsPage";
import AIAgentsPage from "@/pages/AIAgentsPage";
import AIAgentDetailPage from "@/pages/AIAgentDetailPage";
import AIAgentSettingsPage from "@/pages/AIAgentSettingsPage";
import IntegrationCenterPage from "@/pages/IntegrationCenterPage";
import AgentsBrowse from "@/pages/AgentsBrowse";
import AgentDetail from "@/pages/AgentDetail";

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
    <Route path="/help" element={<Help />} />
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

    {/* Nonprofit pages */}
    <Route path="/data-health" element={<DataHealthPage />} />
    <Route path="/donor-pipeline" element={<DonorPipelinePage />} />
    <Route path="/reconciliation" element={<ReconciliationPage />} />
    <Route path="/events" element={<EventsPage />} />
    <Route path="/grants" element={<GrantsPage />} />
    <Route path="/board-reports" element={<BoardReportsPage />} />
    <Route path="/ai-agents" element={<AIAgentsPage />} />
    <Route path="/ai-agents/:id" element={<AIAgentDetailPage />} />
    <Route path="/ai-agents/:id/settings" element={<AIAgentSettingsPage />} />
    <Route path="/integration-center" element={<IntegrationCenterPage />} />
    <Route path="/integrations" element={<IntegrationCenterPage />} />

    {/* Agent discovery pages */}
    <Route path="/agents" element={<AgentsBrowse />} />
    <Route path="/agents/:slug" element={<AgentDetail />} />
  </>
);

/**
 * 404 catch-all
 */
export const catchAllRoute = <Route path="*" element={<NotFound />} />;
