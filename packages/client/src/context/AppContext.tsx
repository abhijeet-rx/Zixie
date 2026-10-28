import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { AnalysisReport, UserSession } from '../types/zixie';
import { api, ApiError } from '../lib/api';
import { createLocalSampleReport } from '../demo/localSample';

interface AppContextValue {
  user: UserSession | null;
  authChecked: boolean;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  dbDegraded: boolean;
  dismissDbBanner: () => void;
  report: AnalysisReport | null;
  loadingReport: boolean;
  reportError: string | null;
  refreshReport: () => Promise<void>;
  setReport: (report: AnalysisReport | null) => void;
  setUser: (user: UserSession | null) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(() => import.meta.env.DEV ? {
    id: 'local-preview',
    email: 'reviewer@zixie.local',
    name: 'Local Reviewer',
    institution: 'Local preview',
  } : null);
  const [authChecked, setAuthChecked] = useState(import.meta.env.DEV);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const current = document.documentElement.getAttribute('data-theme');
    return current === 'dark' ? 'dark' : 'light';
  });
  const [dbDegraded, setDbDegraded] = useState(false);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [loadingReport, setLoadingReport] = useState<boolean>(true);
  const [reportError, setReportError] = useState<string | null>(null);
  const themeTransitionTimeout = useRef<number | null>(null);

  const toggleTheme = useCallback(() => {
    document.documentElement.classList.add('theme-transitioning');
    if (themeTransitionTimeout.current !== null) {
      window.clearTimeout(themeTransitionTimeout.current);
    }
    themeTransitionTimeout.current = window.setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
      themeTransitionTimeout.current = null;
    }, 760);

    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      return next;
    });
  }, []);

  useEffect(() => () => {
    if (themeTransitionTimeout.current !== null) {
      window.clearTimeout(themeTransitionTimeout.current);
    }
    document.documentElement.classList.remove('theme-transitioning');
  }, []);

  const refreshReport = useCallback(async () => {
    setLoadingReport(true);
    setReportError(null);
    try {
      const res = await api.getLatestReport();
      setReport(res.report);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setReport(null);
      } else if (err instanceof Error) {
        setReportError(err.message);
      }
    } finally {
      setLoadingReport(false);
    }
  }, []);

  // Check /api/health once on app mount
  useEffect(() => {
    api
      .checkHealth()
      .then((health) => {
        if (health.status === 'degraded' || health.database === 'unavailable') {
          setDbDegraded(true);
        }
      })
      .catch(() => {
        // Non-blocking health check
      });
  }, []);

  // Check authenticated session on mount
  useEffect(() => {
    if (import.meta.env.DEV) {
      void createLocalSampleReport()
        .then(setReport)
        .catch((error: unknown) => setReportError(error instanceof Error ? error.message : 'Sample analysis could not be generated.'))
        .finally(() => setLoadingReport(false));
      return;
    }

    const isAuthRoute = window.location.pathname === '/auth';
    api
      .getSession()
      .then((res) => {
        setUser(res.user);
        setAuthChecked(true);
        return refreshReport();
      })
      .catch(() => {
        setAuthChecked(true);
        setLoadingReport(false);
        if (!isAuthRoute) {
          const returnUrl = window.location.pathname + window.location.search;
          window.sessionStorage.setItem('zixie_return_url', returnUrl);
          window.location.replace('/auth');
        }
      });
  }, [refreshReport]);

  return (
    <AppContext.Provider
      value={{
        user,
        authChecked,
        theme,
        toggleTheme,
        dbDegraded,
        dismissDbBanner: () => setDbDegraded(false),
        report,
        loadingReport,
        reportError,
        refreshReport,
        setReport,
        setUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
