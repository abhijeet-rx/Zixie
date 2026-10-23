import { useCallback, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AlertCircle, LoaderCircle } from 'lucide-react';
import { MainWorkspace } from '../components/MainWorkspace';
import { useAuthStore } from '../store/auth';
import { analyzeFiles, fetchDemoReport } from '../lib/api';
import type { CohortAnalysisReport } from '../lib/types';

export default function DashboardPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isChecking = useAuthStore((s) => s.isChecking);
  const checkSession = useAuthStore((s) => s.checkSession);
  const userName = useAuthStore((s) => s.userName);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [report, setReport] = useState<CohortAnalysisReport | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBenchmark = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchDemoReport();
      setReport(data.report);
      setReportId(data.reportId);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not connect to the analysis service.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isChecking) void checkSession();
    else if (isAuthenticated) void loadBenchmark();
  }, [isChecking, isAuthenticated, checkSession, loadBenchmark]);

  const upload = useCallback(async (files: File[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await analyzeFiles(files);
      setReport(data.report);
      setReportId(data.reportId);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Upload failed.';
      setError(message);
      throw caught;
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isChecking) return <div className="z-loading-screen" role="status"><span className="z-mark">z</span><LoaderCircle className="animate-spin" size={20} /><span>Checking your session…</span></div>;
  if (!isAuthenticated) return <Navigate to="/auth" replace />;

  return (
    <>
      <MainWorkspace
        report={report}
        reportId={reportId}
        userName={userName}
        isLoading={isLoading}
        onReloadBenchmark={loadBenchmark}
        onUpload={upload}
        onLogout={() => { void logout().finally(() => navigate('/auth')); }}
      />
      {error && (
        <div className="z-toast" role="alert">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} aria-label="Dismiss error">×</button>
        </div>
      )}
      {isLoading && !report && (
        <div className="z-loading-screen" role="status">
          <span className="z-mark">z</span>
          <LoaderCircle className="animate-spin" size={20} />
          <span>Connecting to the analysis engine…</span>
        </div>
      )}
    </>
  );
}
