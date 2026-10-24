import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppShell } from './components/layout/AppShell';
import { AuthPage } from './pages/AuthPage';
import { OverviewPage } from './pages/OverviewPage';
import { SubmissionsPage } from './pages/SubmissionsPage';
import { SimilarityPage } from './pages/SimilarityPage';
import { AiSignalsPage } from './pages/AiSignalsPage';
import { ReportsPage } from './pages/ReportsPage';
import { DemoScreen } from './pages/DemoScreen';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/auth" element={import.meta.env.DEV ? <Navigate to="/" replace /> : <AuthPage />} />
          <Route
            path="/*"
            element={
              <AppShell>
                <Routes>
                  <Route path="/" element={<OverviewPage />} />
                  <Route path="/submissions" element={<SubmissionsPage />} />
                  <Route path="/similarity" element={<SimilarityPage />} />
                  <Route path="/ai-signals" element={<AiSignalsPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route
                    path="/assessments"
                    element={
                      <DemoScreen
                        title="Course Assessments"
                        description="Configure assignment rubrics, starter-code exclusion templates, and submission windows."
                      />
                    }
                  />
                  <Route
                    path="/team"
                    element={
                      <DemoScreen
                        title="Academic Integrity Team"
                        description="Manage teaching assistant roles, reviewer permissions, and department audit access."
                      />
                    }
                  />
                  <Route
                    path="/integrations"
                    element={
                      <DemoScreen
                        title="LMS & Git Integrations"
                        description="Connect Canvas, Gradescope, and GitHub Classroom webhooks."
                      />
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <DemoScreen
                        title="Workspace Settings"
                        description="Review retention policies and institutional authentication configuration."
                      />
                    }
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AppShell>
            }
          />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
};

export default App;
