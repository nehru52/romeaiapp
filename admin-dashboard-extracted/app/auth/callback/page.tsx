/**
 * Google OAuth callback handler.
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
    <p style={{ color: "#999", fontSize: 16 }}>Signing you in...</p>
  );
}

export default function GoogleCallbackPage() {
  return (
    <div style={{
      display: "flex", justifyContent: "center", alignItems: "center",
      minHeight: "100vh", backgroundColor: "#0a0a0a", color: "#fff",
      fontFamily: "system-ui, sans-serif",
    }}>
      <Suspense fallback={<p style={{ color: "#999", fontSize: 16 }}>Loading...</p>}>
        <CallbackHandler />
      </Suspense>
    </div>
  );
}
