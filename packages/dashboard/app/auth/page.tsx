"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"login" | "signup">("signup");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Show error from OAuth callback redirect
  useEffect(() => {
    const err = searchParams.get("error");
    if (err) {
      setError(decodeURIComponent(err));
      setTab("login"); // They tried to login with Google
    }
  }, [searchParams]);

  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

  const clearError = () => {
    setError("");
  };

  // ── Google Auth ──────────────────────────────────────────────────────

  const handleGoogleAuth = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (clientId) {
      const redirectUri = `${window.location.origin}/auth/callback`;
      // Pass the current tab so the callback knows whether this is signup or login intent
      localStorage.setItem("authIntent", tab);
      window.location.href =
        `https://accounts.google.com/o/oauth2/v2/auth` +
        `?client_id=${clientId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code` +
        `&scope=openid%20profile%20email`;
      return;
    }
    // No Google client ID configured — demo fallback
    demoLogin();
  };

  // ── Email Auth ───────────────────────────────────────────────────────

  const handleEmailAuth = async () => {
    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }

    setLoading(true);
    setError("");

    const endpoint =
      tab === "signup"
        ? `${API}/api/auth/email/signup`
        : `${API}/api/auth/email/login`;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      let data: {
        success: boolean;
        data?: { userId: string; name: string; onboardingComplete: boolean };
        error?: string;
      };
      try {
        data = await res.json();
      } catch {
        // API unreachable — fall back to demo mode
        demoLogin();
        return;
      }

      if (!data.success) {
        // API returned an auth error — show it (wrong password, duplicate email, etc.)
        setError(data.error ?? "Authentication failed. Please try again.");
        setLoading(false);
        return;
      }

      // Success — store session and route
      const { userId, name } = data.data!;
      localStorage.setItem("userId", userId);
      localStorage.setItem("userName", name ?? email.split("@")[0]!);

      if (tab === "signup") {
        router.push("/niche");
      } else {
        localStorage.setItem("onboardingComplete", "true");
        router.push("/dashboard");
      }
    } catch {
      // Network error — API server completely unreachable, fall back to demo
      demoLogin();
    }
    setLoading(false);
  };

  // Demo fallback — only used when API is offline (not for auth errors)
  const demoLogin = () => {
    if (tab === "signup") {
      localStorage.setItem("userId", `demo-${Date.now()}`);
      localStorage.setItem("userName", email?.split("@")[0] ?? "New User");
      router.push("/niche");
    } else {
      localStorage.setItem("userId", `demo-${email || Date.now()}`);
      localStorage.setItem("userName", email?.split("@")[0] ?? "User");
      localStorage.setItem("onboardingComplete", "true");
      router.push("/dashboard");
    }
  };

  // ── Render ──────────────────────────────────────────────────────────

  const isSignup = tab === "signup";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold">
            {isSignup ? "Create your account" : "Welcome back"}
          </CardTitle>
          <CardDescription>
            {isSignup
              ? "AI-powered social media content for your business. Get started free."
              : "Sign in to manage your content and view your dashboard."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Tabs */}
          <div className="flex rounded-lg bg-muted p-1">
            <button
              onClick={() => {
                setTab("signup");
                clearError();
              }}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
                tab === "signup"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Sign up
            </button>
            <button
              onClick={() => {
                setTab("login");
                clearError();
              }}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
                tab === "login"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Log in
            </button>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@business.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder={
                isSignup
                  ? "Create a password (min 4 characters)"
                  : "Enter your password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEmailAuth()}
              autoComplete={isSignup ? "new-password" : "current-password"}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-md bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Email button */}
          <Button
            className="w-full"
            size="lg"
            disabled={loading}
            onClick={handleEmailAuth}
          >
            <span className="mr-2">✉️</span>
            {isSignup ? "Sign up with Email" : "Log in with Email"}
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          {/* Google button */}
          <Button
            className="w-full"
            size="lg"
            variant="outline"
            disabled={loading}
            onClick={handleGoogleAuth}
          >
            <svg
              className="mr-2 h-5 w-5"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {isSignup ? "Sign up with Google" : "Continue with Google"}
          </Button>

          {/* Footer text */}
          {isSignup ? (
            <p className="text-center text-xs text-muted-foreground">
              By signing up, you agree to our Terms of Service. Already have an
              account?{" "}
              <button
                onClick={() => {
                  setTab("login");
                  clearError();
                }}
                className="underline hover:text-foreground"
              >
                Log in
              </button>
            </p>
          ) : (
            <p className="text-center text-xs text-muted-foreground">
              Don't have an account?{" "}
              <button
                onClick={() => {
                  setTab("signup");
                  clearError();
                }}
                className="underline hover:text-foreground"
              >
                Sign up free
              </button>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
