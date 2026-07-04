/**
 * Auth context and provider — session management, login/signup, protected routes.
 *
 * Stores session in localStorage for persistence across page reloads.
 * All API calls go through the saas-core Hono router at /api/*.
 */

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

// ── Types ────────────────────────────────────────────────────────────

export interface User {
  userId: string;
  name: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  onboardingComplete: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: (code: string, redirectUri?: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  completeOnboarding: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

// ── Constants ────────────────────────────────────────────────────────

const STORAGE_KEY = "optimus_auth";
const SESSION_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

// ── Helpers ──────────────────────────────────────────────────────────

function loadFromStorage(): { user: User | null; onboardingComplete: boolean } {
  if (typeof window === "undefined") return { user: null, onboardingComplete: false };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { user: null, onboardingComplete: false };
    const data = JSON.parse(raw);
    // Check session expiry
    if (data.expiresAt && Date.now() > data.expiresAt) {
      localStorage.removeItem(STORAGE_KEY);
      return { user: null, onboardingComplete: false };
    }
    return {
      user: data.user ?? null,
      onboardingComplete: data.onboardingComplete ?? false,
    };
  } catch {
    return { user: null, onboardingComplete: false };
  }
}

function saveToStorage(user: User | null, onboardingComplete: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        user,
        onboardingComplete,
        expiresAt: Date.now() + SESSION_TTL,
      })
    );
  } catch {
    // localStorage full or unavailable — session remains in-memory only
  }
}

function clearStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

// ── Context ──────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const stored = loadFromStorage();
    return {
      user: stored.user,
      isLoading: true,
      isAuthenticated: !!stored.user,
      onboardingComplete: stored.onboardingComplete,
      error: null,
    };
  });

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = loadFromStorage();
    setState({
      user: stored.user,
      isLoading: false,
      isAuthenticated: !!stored.user,
      onboardingComplete: stored.onboardingComplete,
      error: null,
    });
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Email + password signup
  const signup = useCallback(
    async (email: string, password: string, name: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const res = await fetch("/api/auth/email/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });
        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error ?? "Signup failed");
        }
        const user: User = {
          userId: data.data.userId,
          name: data.data.name ?? name,
          email,
        };
        saveToStorage(user, false);
        setState({
          user,
          isLoading: false,
          isAuthenticated: true,
          onboardingComplete: false,
          error: null,
        });
      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err.message ?? "Signup failed. Please try again.",
        }));
        throw err;
      }
    },
    []
  );

  // Email + password login
  const login = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const res = await fetch("/api/auth/email/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error ?? "Login failed");
      }
      const user: User = {
        userId: data.data.userId,
        name: data.data.name ?? email.split("@")[0]!,
        email,
      };
      const onboardingComplete = data.data.onboardingComplete ?? false;
      saveToStorage(user, onboardingComplete);
      setState({
        user,
        isLoading: false,
        isAuthenticated: true,
        onboardingComplete,
        error: null,
      });
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err.message ?? "Invalid email or password.",
      }));
      throw err;
    }
  }, []);

  // Google OAuth login
  const loginWithGoogle = useCallback(
    async (code: string, redirectUri?: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const res = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            redirectUri: redirectUri ?? window.location.origin + "/auth/callback",
            intent: "signup",
          }),
        });
        const data = await res.json();
        if (!data.success) {
          // If user already exists, fall back to login intent
          if (data.error?.includes("already exists")) {
            const loginRes = await fetch("/api/auth/google", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                code,
                redirectUri: redirectUri ?? window.location.origin + "/auth/callback",
                intent: "login",
              }),
            });
            const loginData = await loginRes.json();
            if (!loginData.success) {
              throw new Error(loginData.error ?? "Google login failed");
            }
            const user: User = {
              userId: loginData.data.userId,
              name: loginData.data.name ?? "User",
              email: loginData.data.email ?? "",
            };
            saveToStorage(user, loginData.data.onboardingComplete ?? false);
            setState({
              user,
              isLoading: false,
              isAuthenticated: true,
              onboardingComplete: loginData.data.onboardingComplete ?? false,
              error: null,
            });
            return;
          }
          throw new Error(data.error ?? "Google login failed");
        }
        const user: User = {
          userId: data.data.userId,
          name: data.data.name ?? "User",
          email: data.data.email ?? "",
        };
        saveToStorage(user, data.data.onboardingComplete ?? false);
        setState({
          user,
          isLoading: false,
          isAuthenticated: true,
          onboardingComplete: data.data.onboardingComplete ?? false,
          error: null,
        });
      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err.message ?? "Google login failed. Please try again.",
        }));
        throw err;
      }
    },
    []
  );

  // Logout
  const logout = useCallback(() => {
    clearStorage();
    setState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      onboardingComplete: false,
      error: null,
    });
  }, []);

  // Mark onboarding complete
  const completeOnboarding = useCallback(async () => {
    if (!state.user) return;
    try {
      await fetch("/api/auth/onboarding-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: state.user.userId }),
      });
      const updated = true;
      saveToStorage(state.user, updated);
      setState((prev) => ({ ...prev, onboardingComplete: true }));
    } catch {
      // Non-critical — onboarding state is also stored on server
    }
  }, [state.user]);

  // Refresh session from server
  const refreshSession = useCallback(async () => {
    if (!state.user) return;
    try {
      const res = await fetch(`/api/auth/session/${state.user.userId}`);
      const data = await res.json();
      if (data.success && data.data) {
        const onboardingComplete =
          data.data.onboardingComplete ?? state.onboardingComplete;
        saveToStorage(state.user, onboardingComplete);
        setState((prev) => ({ ...prev, onboardingComplete }));
      }
    } catch {
      // Server unavailable — keep local session
    }
  }, [state.user, state.onboardingComplete]);

  const value = useMemo(
    () => ({
      ...state,
      login,
      signup,
      loginWithGoogle,
      logout,
      clearError,
      completeOnboarding,
      refreshSession,
    }),
    [state, login, signup, loginWithGoogle, logout, clearError, completeOnboarding, refreshSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Hook ─────────────────────────────────────────────────────────────

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return ctx;
}

// ── HOC for protected routes ─────────────────────────────────────────

export function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return function ProtectedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#0a0a0a",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
        }}>
          <p>Loading...</p>
        </div>
      );
    }

    if (!isAuthenticated) {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return null;
    }

    return <Component {...props} />;
  };
}
