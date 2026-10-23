import { create } from 'zustand';

interface AuthUser { id: string; name: string; email: string }
type AuthState = {
  user: AuthUser | null;
  isChecking: boolean;
  isAuthenticated: boolean;
  userName: string;
  checkSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

async function requestAuth(path: string, payload?: Record<string, string>) {
  const response = await fetch(`/api/auth/${path}`, {
    method: payload ? 'POST' : 'GET',
    credentials: 'same-origin',
    headers: payload ? { 'Content-Type': 'application/json' } : undefined,
    body: payload ? JSON.stringify(payload) : undefined,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Authentication request failed.' }));
    throw new Error(error.error || 'Authentication request failed.');
  }
  return response.status === 204 ? null : response.json() as Promise<{ user: AuthUser }>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isChecking: true,
  isAuthenticated: false,
  userName: '',
  checkSession: async () => {
    try {
      const result = await requestAuth('me');
      const user = result?.user ?? null;
      set({ user, userName: user?.name ?? '', isAuthenticated: !!user, isChecking: false });
    } catch {
      set({ user: null, userName: '', isAuthenticated: false, isChecking: false });
    }
  },
  login: async (email, password) => {
    const result = await requestAuth('login', { email, password });
    if (result) set({ user: result.user, userName: result.user.name, isAuthenticated: true, isChecking: false });
  },
  register: async (name, email, password) => {
    const result = await requestAuth('register', { name, email, password });
    if (result) set({ user: result.user, userName: result.user.name, isAuthenticated: true, isChecking: false });
  },
  logout: async () => {
    try { await requestAuth('logout', {}); } catch { /* Clear local state even if the server is unreachable. */ }
    set({ user: null, userName: '', isAuthenticated: false, isChecking: false });
  },
}));

// Preserve the older store exports used by legacy components while the
// routed workspace uses the API-backed context implementation.
export { WorkspaceProvider, useWorkspace } from "./auth.tsx";
