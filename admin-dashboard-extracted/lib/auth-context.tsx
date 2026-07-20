/**
 * Auth context — thin wrapper around Auth.js v5 SessionProvider.
 *
 * Session is stored in an encrypted httpOnly cookie managed by Auth.js.
 * Frontend NEVER accesses the token directly (XSS-proof).
 *
 * Uses `useSession` from `next-auth/react` for session state.
 * Business logic (onboarding, tenant linking) lives in AuthService.
 */

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  SessionProvider,
  signIn as authSignIn,
  signOut as authSignOut,
  useSession,
} from "next-auth/react";
import { useRouter } from "next/navigation";

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
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  completeOnboarding: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

// ── Context ──────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthStateManager>{children}</AuthStateManager>
    </SessionProvider>
  );
}

function AuthStateManager({ children }: { children: ReactNode }) {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";
  const sessionData = session as any;

  const user: User | null = isAuthenticated && session?.user
    ? {
        userId: sessionData?.userId ?? session.user.id ?? "",
        name: session.user.name ?? "",
        email: session.user.email ?? "",
      }
    : null;

  const onboardingComplete: boolean = sessionData?.onboardingComplete ?? false;

  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  // ── Email + password signup ────────────────────────────────────────

  const signup = useCallback(async (email: string, password: string, name: string) => {
    setError(null);
    // Create user account first
    const res = await fetch("/api/auth/email/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password, name }),
    });
    const data = await res.json();
    if (!data.success) {
      const msg = data.error ?? "Signup failed";
      setError(msg);
      throw new Error(msg);
    }

    // Sign in with the new credentials
    const result = await authSignIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(result.error);
      throw new Error(result.error);
    }

    router.push("/onboarding");
  }, [router]);

  // ── Email + password login ─────────────────────────────────────────

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    const result = await authSignIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      const msg = result.error === "CredentialsSignin"
        ? "Invalid email or password."
        : result.error;
      setError(msg);
      throw new Error(msg);
    }

    await update(); // Refresh session to get onboardingComplete

    // Check if onboarding is complete for redirect
    const updatedSession = await update();
    const complete = (updatedSession as any)?.onboardingComplete ?? false;
    if (complete) {
      router.push("/dashboard");
    } else {
      router.push("/onboarding");
    }
  }, [router, update]);

  // ── Google OAuth ───────────────────────────────────────────────────

  const loginWithGoogle = useCallback(async () => {
    setError(null);
    await authSignIn("google", {
      callbackUrl: "/onboarding",
    });
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────

  const logout = useCallback(async () => {
    await authSignOut({ redirect: false });
    router.push("/login");
  }, [router]);

  // ── Onboarding ─────────────────────────────────────────────────────

  const completeOnboarding = useCallback(async () => {
    try {
      await fetch("/api/auth/onboarding-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });
      await update(); // Refresh session to get updated onboardingComplete
    } catch {
      // Non-critical — session still valid
    }
  }, [update]);

  // ── Refresh ────────────────────────────────────────────────────────

  const refreshSession = useCallback(async () => {
    await update();
  }, [update]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated,
      onboardingComplete,
      error,
      login,
      signup,
      loginWithGoogle,
      logout,
      clearError,
      completeOnboarding,
      refreshSession,
    }),
    [user, isLoading, isAuthenticated, onboardingComplete, error, login, signup, loginWithGoogle, logout, clearError, completeOnboarding, refreshSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Hook ─────────────────────────────────────────────────────────────

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an <AuthProvider>");
  return ctx;
}

// ── HOC ──────────────────────────────────────────────────────────────

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
): React.FC<P> {
  return function ProtectedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div style={{
          display: "flex", justifyContent: "center", alignItems: "center",
          minHeight: "100vh", backgroundColor: "#0a0a0a", color: "#fff",
          fontFamily: "system-ui, sans-serif",
        }}>
          <p>Loading...</p>
        </div>
      );
    }

    if (!isAuthenticated) {
      if (typeof window !== "undefined") window.location.href = "/login";
      return null;
    }

    return <Component {...props} />;
  };
}

