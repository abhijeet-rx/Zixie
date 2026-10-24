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
                        description="Set grading guides, choose which provided starter files to ignore, and set submission deadlines."
                      />
                    }
                  />
                  <Route
                    path="/team"
                    element={
                      <DemoScreen
                        title="Academic Integrity Team"
                        description="Manage teaching assistant roles and choose who can review submissions and reports."
                      />
                    }
                  />
                  <Route
                    path="/integrations"
                    element={
                      <DemoScreen
                        title="Course Platform Connections"
                        description="Connect Canvas, Gradescope, or GitHub Classroom to bring in course submissions."
                      />
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <DemoScreen
                        title="Workspace Settings"
                        description="Choose how long submissions are kept and how your organization signs in."
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
