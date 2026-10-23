import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiClient, ApiError, registerUnauthorizedHandler } from "../api/client";
import { AuthUser, BatchReportPayload, HealthResponse } from "../types/zixie";
import { localPreviewPayload } from "../demo/preview";

type ThemeMode = "dark" | "light";

interface WorkspaceContextValue {
  user: AuthUser | null;
  authLoading: boolean;
  isPreviewMode: boolean;
  health: HealthResponse;
  refreshHealth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  enterPreviewMode: () => void;
  logout: () => Promise<void>;

  activePayload: BatchReportPayload | null;
  reportLoading: boolean;
  reportError: string | null;
  loadDemoCohort: () => Promise<void>;
  loadReportById: (reportId: string) => Promise<void>;
  uploadAndAnalyze: (files: File[]) => Promise<BatchReportPayload>;
  clearReportError: () => void;

  theme: ThemeMode;
  toggleTheme: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

const THEME_STORAGE_KEY = "zixie_ui_theme";

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [health, setHealth] = useState<HealthResponse>({ status: "healthy" });

  const [activePayload, setActivePayload] = useState<BatchReportPayload | null>(null);
  const [reportLoading, setReportLoading] = useState<boolean>(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    return saved === "light" ? "light" : "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const refreshHealth = useCallback(async () => {
    const status = await apiClient.getHealth();
    setHealth(status);
  }, []);

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      setUser(null);
      setActivePayload(null);
      if (location.pathname !== "/auth") {
        navigate("/auth", { replace: true });
      }
    });
  }, [navigate, location.pathname]);

  const loadDemoCohort = useCallback(async () => {
    if (isPreviewMode) {
      setReportError(null);
      setActivePayload(localPreviewPayload);
      return;
    }
    setReportLoading(true);
    setReportError(null);
    try {
      const payload = await apiClient.fetchDemoReport();
      setActivePayload(payload);
    } catch (err) {
      setReportError(err instanceof Error ? err.message : "Failed to load cohort data.");
    } finally {
      setReportLoading(false);
    }
  }, [isPreviewMode]);

  const enterPreviewMode = useCallback(() => {
    if (!import.meta.env.DEV) return;
    setIsPreviewMode(true);
    setUser({ id: "local-preview", name: "Preview Reviewer", email: "preview@local" });
    setActivePayload(localPreviewPayload);
    setReportError(null);
    navigate("/", { replace: true });
  }, [navigate]);

  const loadReportById = useCallback(async (reportId: string) => {
    if (isPreviewMode) {
      throw new Error("Saved reports are unavailable in the local UI preview.");
    }
    setReportLoading(true);
    setReportError(null);
    try {
      const payload = await apiClient.fetchReportById(reportId.trim());
      setActivePayload(payload);
    } catch (err) {
      setReportError(err instanceof Error ? err.message : `Could not fetch report ${reportId}`);
      throw err;
    } finally {
      setReportLoading(false);
    }
  }, [isPreviewMode]);

  const uploadAndAnalyze = useCallback(async (files: File[]) => {
    if (isPreviewMode) {
      throw new Error("Uploads are unavailable in the local UI preview.");
    }
    setReportLoading(true);
    setReportError(null);
    try {
      const payload = await apiClient.analyzeSubmissions(files);
      setActivePayload(payload);
      return payload;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Batch analysis failed.";
      setReportError(message);
      throw err;
    } finally {
      setReportLoading(false);
    }
  }, [isPreviewMode]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await refreshHealth();
      try {
        const currentUser = await apiClient.getMe();
        if (!mounted) return;
        setUser(currentUser);
        try {
          const demo = await apiClient.fetchDemoReport();
          if (mounted) setActivePayload(demo);
        } catch {
          // User is authenticated; leave empty state if /api/demo is unavailable
        }
      } catch (err) {
        if (!mounted) return;
        setUser(null);
        if (err instanceof ApiError && err.status === 401 && location.pathname !== "/auth") {
          navigate("/auth", { replace: true });
        }
      } finally {
        if (mounted) setAuthLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const loggedIn = await apiClient.login(email, password);
      setUser(loggedIn);
      await loadDemoCohort();
      navigate("/", { replace: true });
    },
    [loadDemoCohort, navigate]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const registered = await apiClient.register(name, email, password);
      setUser(registered);
      await loadDemoCohort();
      navigate("/", { replace: true });
    },
    [loadDemoCohort, navigate]
  );

  const logout = useCallback(async () => {
    if (isPreviewMode) {
      setIsPreviewMode(false);
      setUser(null);
      setActivePayload(null);
      navigate("/auth", { replace: true });
      return;
    }
    try {
      await apiClient.logout();
    } finally {
      setUser(null);
      setActivePayload(null);
      navigate("/auth", { replace: true });
    }
  }, [isPreviewMode, navigate]);

  return (
    <WorkspaceContext.Provider
      value={{
        user,
        authLoading,
        isPreviewMode,
        health,
        refreshHealth,
        login,
        register,
        enterPreviewMode,
        logout,
        activePayload,
        reportLoading,
        reportError,
        loadDemoCohort,
        loadReportById,
        uploadAndAnalyze,
        clearReportError: () => setReportError(null),
        theme,
        toggleTheme,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspace must be used inside WorkspaceProvider");
  }
  return ctx;
}
