import { useState, useEffect } from 'react';
import { ThemeProvider } from './lib/theme';
import { StitchAuthScreen } from './components/stitch/StitchAuthScreen';
import { LoadingTransitionScreen } from './components/LoadingTransitionScreen';
import { MainWorkspace } from './components/MainWorkspace';
import { fetchDemoReport, analyzeFiles } from './lib/api';
import type { CohortAnalysisReport } from './lib/types';

export default function App() {
  // Clear any legacy localStorage theme/mode overrides that might trap the user in the old UI
  if (typeof window !== 'undefined') {
    localStorage.removeItem('zixie_ui_mode');
    localStorage.setItem('zixie-theme', 'light');
  }

  // Flow: 1. auth -> 2. loading -> 3. dashboard
  const [stage, setStage] = useState<'auth' | 'loading' | 'dashboard'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('stage') === 'dashboard') return 'dashboard';
    }
    return 'auth';
  });
  const [userName, setUserName] = useState('Abhijeet (Head TA)');

  // Shared data state for the active report
  const [report, setReport] = useState<CohortAnalysisReport | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Auto-fetch demo benchmark cohort on mount so it's ready once user enters
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark');
    root.classList.add('light');
    loadDemo();
  }, []);

  const loadDemo = async () => {
    setLoading(true);
    try {
      const data = await fetchDemoReport();
      setReport(data.report);
      setReportId(data.reportId);
    } catch (err: any) {
      console.error('Failed to load demo report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (files: File[]) => {
    setLoading(true);
    try {
      const data = await analyzeFiles(files);
      setReport(data.report);
      setReportId(data.reportId);
    } catch (err: any) {
      console.error('Upload failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[#F8FAFC] text-slate-800 antialiased flex flex-col font-sans">
        {/* STEP 1: AUTH SCREEN */}
        {stage === 'auth' && (
          <StitchAuthScreen
            onSuccess={(name) => {
              setUserName(name);
              setStage('loading'); // Flow: auth -> loading animation
            }}
          />
        )}

        {/* STEP 2: LOADING ANIMATION */}
        {stage === 'loading' && (
          <LoadingTransitionScreen
            userName={userName}
            onComplete={() => setStage('dashboard')} // Flow: loading -> main screen
          />
        )}

        {/* STEP 3: MAIN SCREEN WITH UPLOAD ANSWERS & UNTITLED UI SIDEBAR */}
        {stage === 'dashboard' && (
          <MainWorkspace
            report={report}
            reportId={reportId}
            userName={userName}
            isLoading={loading}
            onReloadBenchmark={loadDemo}
            onUpload={handleUpload}
            onLogout={() => setStage('auth')}
          />
        )}
      </div>
    </ThemeProvider>
  );
}
