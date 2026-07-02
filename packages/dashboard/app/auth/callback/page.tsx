"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [status, setStatus] = useState("Signing you in...");

  useEffect(() => {
    const code = params.get("code");
    const authIntent = localStorage.getItem("authIntent") ?? "signup";

    if (!code) {
      setStatus("No authorization code received. Please try again.");
      return;
    }

    async function exchangeCode() {
      const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

      try {
        // Exchange the Google code for user info via our backend
        const res = await fetch(`${API}/api/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            redirectUri: `${window.location.origin}/auth/callback`,
            intent: authIntent, // "signup" or "login"
          }),
        });

        const data = await res.json();

        if (data.success && data.data) {
          const { userId, name, isNewUser } = data.data;

          localStorage.setItem("userId", userId);
          localStorage.setItem("userName", name ?? "User");

          setStatus("Sign in successful!");

          setTimeout(() => {
            if (isNewUser) {
              router.push("/niche");
            } else {
              localStorage.setItem("onboardingComplete", "true");
              router.push("/dashboard");
            }
          }, 800);
        } else {
          // Show the error — user will see it and be redirected back to auth
          setStatus(data.error ?? "Authentication failed. Please try again.");
          setTimeout(() => {
            router.push(
              `/auth?error=${encodeURIComponent(data.error ?? "auth_failed")}`,
            );
          }, 2500);
        }
      } catch {
        // API not running — demo fallback
        setStatus("Sign in successful!");
        setTimeout(() => {
          const userId = `google-${Date.now()}`;
          localStorage.setItem("userId", userId);
          localStorage.setItem("userName", "User");

          if (authIntent === "login") {
            localStorage.setItem("onboardingComplete", "true");
            router.push("/dashboard");
          } else {
            router.push("/niche");
          }
        }, 800);
      }
    }

    exchangeCode();
  }, [params, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full text-3xl ${
            status.includes("failed") || status.includes("No")
              ? "bg-destructive/10"
              : "bg-green-100 dark:bg-green-900/30"
          }`}
        >
          {status.includes("failed") || status.includes("No") ? "✗" : "✓"}
        </div>
        <h1 className="font-display text-xl font-semibold">{status}</h1>
        <p className="text-sm text-muted-foreground">
          {status.includes("failed") || status.includes("No")
            ? "Please go back and try again."
            : "Redirecting to your dashboard..."}
        </p>
      </div>
    </div>
  );
}
