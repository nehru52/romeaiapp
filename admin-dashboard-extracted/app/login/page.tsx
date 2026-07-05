/**
 * Premium login page — glassmorphism design with animated gradient background.
 * World-class first impression. Email + Google OAuth.
 */

"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";

export default function LoginPage() {
  const { user, login, signup, loginWithGoogle, isAuthenticated, onboardingComplete, isLoading, error, clearError } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const passwordChecks = useMemo(() => ({
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSymbol: /[^A-Za-z0-9]/.test(password),
    allValid: password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password),
  }), [password]);

  // Don't auto-redirect — let the user see the login page first

  const displayError = localError ?? error;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setLocalError(null);
    clearError();
    try {
      if (mode === "signup") {
        if (!name.trim()) { setLocalError("Please enter your name."); setSubmitting(false); return; }
        if (!passwordChecks.minLength) { setLocalError("Password must be at least 8 characters."); setSubmitting(false); return; }
        if (!passwordChecks.hasUpper) { setLocalError("Password must include at least one uppercase letter."); setSubmitting(false); return; }
        if (!passwordChecks.hasNumber) { setLocalError("Password must include at least one number."); setSubmitting(false); return; }
        if (!passwordChecks.hasSymbol) { setLocalError("Password must include at least one symbol (e.g. !@#$%)."); setSubmitting(false); return; }
        await signup(email, password, name.trim());
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setLocalError(err.message ?? "Authentication failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "459672196990-16u7i5fmlsks21pp4j7kvegrsha1sara.apps.googleusercontent.com";
    const redirectUri = typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback`
      : "";
    const scope = "openid profile email";
    const state = mode; // "login" or "signup" — passed through to callback

    const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(scope)}` +
      `&state=${encodeURIComponent(state)}` +
      `&access_type=offline` +
      `&prompt=consent`;

    window.location.href = googleUrl;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-[#030303]"><div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#030303] px-4">
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-violet-600/20 via-fuchsia-500/10 to-transparent blur-3xl animate-[float_12s_ease-in-out_infinite]" />
        <div className="absolute -bottom-1/2 -right-1/4 w-[700px] h-[700px] rounded-full bg-gradient-to-tl from-indigo-600/15 via-blue-500/10 to-transparent blur-3xl animate-[float_15s_ease-in-out_infinite_reverse]" />
        <div className="absolute top-1/3 left-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-amber-500/5 via-rose-500/5 to-transparent blur-3xl animate-[float_10s_ease-in-out_infinite]" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 -z-10 opacity-[0.015]" style={{
        backgroundImage: "radial-gradient(circle, rgb(255 255 255) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      <div className="w-full max-w-[440px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 border border-white/10 mb-5 backdrop-blur-sm">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Optimus AI</h1>
          <p className="text-sm text-white/40 mt-1.5">AI-powered social media automation</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-2xl p-8 shadow-2xl shadow-black/50">
          {/* Google button */}
          <button
            onClick={handleGoogle}
            disabled={submitting}
            className="flex items-center justify-center gap-3 w-full px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white text-sm font-medium transition-all duration-200 disabled:opacity-40"
          >
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            {mode === "signup" ? "Sign up with Google" : "Login with Gmail"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-xs text-white/20 font-medium">or</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-medium text-white/30 mb-1.5 ml-1">Full Name</label>
                <input
                  type="text" placeholder="Alex Johnson" value={name}
                  onChange={(e) => setName(e.target.value)} disabled={submitting}
                  onFocus={() => setFocused("name")} onBlur={() => setFocused(null)}
                  autoComplete="name"
                  className="w-full px-4 py-2.5 bg-white/[0.03] border rounded-xl text-sm text-white placeholder:text-white/15 outline-none transition-all duration-200 disabled:opacity-40"
                  style={{ borderColor: focused === "name" ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)" }}
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-white/30 mb-1.5 ml-1">Email</label>
              <input
                type="email" placeholder="you@company.com" value={email}
                onChange={(e) => setEmail(e.target.value)} required disabled={submitting}
                onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
                autoComplete="email"
                className="w-full px-4 py-2.5 bg-white/[0.03] border rounded-xl text-sm text-white placeholder:text-white/15 outline-none transition-all duration-200 disabled:opacity-40"
                style={{ borderColor: focused === "email" ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)" }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/30 mb-1.5 ml-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"} placeholder="••••••••" value={password}
                  onChange={(e) => setPassword(e.target.value)} required disabled={submitting}
                  onFocus={() => setFocused("password")} onBlur={() => setFocused(null)}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  className="w-full px-4 py-2.5 pr-11 bg-white/[0.03] border rounded-xl text-sm text-white placeholder:text-white/15 outline-none transition-all duration-200 disabled:opacity-40"
                  style={{ borderColor: focused === "password" ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {mode === "signup" && password.length > 0 && (
              <div className="space-y-1 px-1">
                {[
                  { key: "minLength", label: "At least 8 characters", met: passwordChecks.minLength },
                  { key: "hasUpper", label: "One uppercase letter", met: passwordChecks.hasUpper },
                  { key: "hasNumber", label: "One number", met: passwordChecks.hasNumber },
                  { key: "hasSymbol", label: "One symbol", met: passwordChecks.hasSymbol },
                ].map((check) => (
                  <div key={check.key} className="flex items-center gap-2 text-xs">
                    <span className={check.met ? "text-emerald-400" : "text-white/15"}>
                      {check.met ? "✓" : "○"}
                    </span>
                    <span className={check.met ? "text-emerald-400/80" : "text-white/25"}>
                      {check.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {displayError && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/5 border border-red-500/10 text-red-400 text-xs">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {displayError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="relative w-full py-3 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Please wait...
                </span>
              ) : mode === "login" ? "Login" : "Create Account"}
            </button>
          </form>

          {/* Toggle */}
          <p className="mt-6 text-center text-sm text-white/25">
            {mode === "login" ? (
              <>New to Optimus? <button onClick={() => { setMode("signup"); clearError(); setLocalError(null); }} type="button" className="text-white/60 hover:text-white font-medium transition-colors">Create an account</button></>
            ) : (
              <>Already have an account? <button onClick={() => { setMode("login"); clearError(); setLocalError(null); }} type="button" className="text-white/60 hover:text-white font-medium transition-colors">Login</button></>
            )}
          </p>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-[11px] text-white/10">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
