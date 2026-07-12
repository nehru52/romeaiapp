/**
 * Google OAuth callback handler — light theme with design tokens.
 * Receives the auth code from Google redirect, exchanges it for a session.
 */

"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

function CallbackHandler() {
  const { loginWithGoogle, isAuthenticated, onboardingComplete } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const code = searchParams.get("code");
    const state = searchParams.get("state") as "login" | "signup" | null;
    if (code) {
      loginWithGoogle(code, undefined, state ?? "signup").catch(() => {
        router.replace("/login?error=google_failed");
      });
    } else {
      router.replace("/login?error=no_code");
    }
  }, [searchParams, loginWithGoogle, router]);

  useEffect(() => {
    if (isAuthenticated) {
      if (onboardingComplete) {
        router.replace("/dashboard");
      } else {
        router.replace("/onboarding");
      }
    }
  }, [isAuthenticated, onboardingComplete, router]);

  return (
    <div className="flex items-center gap-3">
      <div className="w-5 h-5 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      <p className="text-sm text-muted-foreground font-mono">Signing you in...</p>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <div className="relative flex items-center justify-center min-h-screen bg-background noise-overlay">
      <Suspense fallback={
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground font-mono">Loading...</p>
        </div>
      }>
        <CallbackHandler />
      </Suspense>
    </div>
  );
}
