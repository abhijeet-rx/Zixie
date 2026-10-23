import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { WorkspaceProvider, useWorkspace } from "./store/auth";
import { WorkspaceShell } from "./components/WorkspaceShell";
import { AuthPage } from "./pages/AuthPage";
import { OverviewPage } from "./pages/OverviewPage";
import { SubmissionsPage } from "./pages/SubmissionsPage";
import { SimilarityPage } from "./pages/SimilarityPage";
import { AiSignalsPage } from "./pages/AiSignalsPage";
import { ReportsPage } from "./pages/ReportsPage";
import {
  AssessmentsPage,
  IntegrationsPage,
  SettingsPage,
  TeamPage,
} from "./pages/LocalPrototypePages";
import { ScreenSkeleton } from "./components/StatePrimitives";

const ProtectedRouteGuard: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, authLoading } = useWorkspace();

  if (authLoading) {
    return (
      <div style={{ padding: "32px", maxWidth: "680px", margin: "0 auto" }}>
        <ScreenSkeleton label="Verifying cookie session (/api/auth/me)..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <WorkspaceProvider>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route
            element={
              <ProtectedRouteGuard>
                <WorkspaceShell />
              </ProtectedRouteGuard>
            }
          >
            <Route path="/" element={<OverviewPage />} />
            <Route path="/submissions" element={<SubmissionsPage />} />
            <Route path="/similarity" element={<SimilarityPage />} />
            <Route path="/ai-detection" element={<AiSignalsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/assessments" element={<AssessmentsPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/integrations" element={<IntegrationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </WorkspaceProvider>
    </BrowserRouter>
  );
};

export default App;
