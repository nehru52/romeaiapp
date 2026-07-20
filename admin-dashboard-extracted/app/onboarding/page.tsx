/**
 * Premium onboarding — light theme with design tokens.
 * Niche selection → website → analysis → dashboard.
 */

"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const PACKS = [
  { slug: "travel-agency", name: "Travel & Tours", icon: "✈️", desc: "Hotels, operators, cruises, DMCs" },
  { slug: "real-estate", name: "Real Estate", icon: "🏠", desc: "Agents, brokerages, luxury properties" },
  { slug: "restaurant", name: "Restaurants", icon: "🍽️", desc: "Cafes, bars, food trucks, caterers" },
  { slug: "fitness-coaching", name: "Fitness & Coaching", icon: "💪", desc: "Gyms, trainers, nutritionists, coaches" },
  { slug: "dental-clinic", name: "Dental & Medical", icon: "🦷", desc: "Dentists, dermatologists, med spas" },
  { slug: "custom", name: "Custom / Other", icon: "⚡", desc: "Any business, any niche, any platform" },
];

type Step = "niche" | "describe" | "website" | "analyzing" | "done";

export default function OnboardingPage() {
  const { user, isAuthenticated, isLoading, completeOnboarding } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<Step>("niche");
  const [selectedPack, setSelectedPack] = useState<string | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [businessDescription, setBusinessDescription] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/login");
  }, [isLoading, isAuthenticated, router]);

  // Block render until auth state resolved — prevents flash of onboarding UI
  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-6 h-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  const handleNicheSelect = (slug: string) => {
    setSelectedPack(slug);
    setError(null);
    if (slug === "custom") {
      setStep("describe");
    } else {
      setStep("website");
    }
  };

  const handleDescribeContinue = () => {
    if (!businessDescription.trim()) {
      setError("Please describe your business so we can generate tailored content.");
      return;
    }
    setError(null);
    setStep("website");
  };

  const handleWebsiteSubmit = async () => {
    if (!websiteUrl.trim()) { setError("Please enter your business website URL."); return; }
    if (!websiteUrl.match(/^https?:\/\/.+/)) { setError("Please enter a valid URL starting with http:// or https://"); return; }
    if (!user) return;
    setSubmitting(true); setError(null); setStep("analyzing");

    try {
      await fetch("/api/onboarding/niche", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.userId,
          niche: selectedPack ?? "custom",
          packSlug: selectedPack ?? "custom",
          ...(businessDescription ? { businessDescription } : {}),
        }),
      });
      const res = await fetch("/api/onboarding/website", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.userId, url: websiteUrl }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? "Failed to analyze website.");
      setAnalysis(data.data.analysis);
      await completeOnboarding();
      setStep("done");
      setTimeout(() => router.replace("/dashboard"), 2500);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong."); setStep("website");
    } finally { setSubmitting(false); }
  };

  const steps = [
    { label: "Pick Niche", active: step === "niche", done: step !== "niche" && step !== "describe" },
    { label: step === "describe" ? "Describe" : "Add Website", active: step === "describe" || step === "website" || step === "analyzing", done: step === "done" },
    { label: "Ready!", active: step === "done", done: false },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-6 h-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background flex flex-col items-center justify-center px-4 py-16 noise-overlay">
      {/* Subtle grid lines from template */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={`h-${i}`} className="absolute h-px bg-foreground/10" style={{ top: `${16.6 * (i + 1)}%`, left: 0, right: 0 }} />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-[720px]">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-foreground/[0.04] border border-border/50 mb-5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-foreground">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-display tracking-tight">
            {step === "done" ? "You're all set!" : "Let's set up your account"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            {step === "done" ? "Redirecting to your dashboard..." : "We just need a couple of things to get your AI engine running"}
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {steps.map((s, i) => (
            <div key={s.label} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
                s.done ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" :
                s.active ? "bg-card text-foreground border border-border/50" :
                "bg-transparent text-muted-foreground/30 border border-border/30"
              }`}>
                {s.done && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                {s.label}
              </div>
              {i < steps.length - 1 && <div className={`w-6 h-px transition-all duration-300 ${s.done ? "bg-emerald-500/30" : "bg-border/50"}`} />}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="relative rounded-2xl border border-border/50 bg-card p-8 shadow-sm">
          {/* Decorative corners (from CTA section pattern) */}
          <div className="absolute top-0 right-0 w-16 h-16 border-b border-l border-border/10 rounded-tr-2xl" />
          <div className="absolute bottom-0 left-0 w-16 h-16 border-t border-r border-border/10 rounded-bl-2xl" />

          {/* Step: Niche Selection */}
          {step === "niche" && (
            <div className="space-y-4">
              <p className="text-center text-sm text-muted-foreground mb-6">Select your industry — we'll pre-load the best AI templates for you</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PACKS.map((pack) => (
                  <button
                    key={pack.slug}
                    onClick={() => handleNicheSelect(pack.slug)}
                    className="group flex flex-col items-center gap-3 p-5 rounded-xl border border-border/50 bg-card hover:border-foreground/20 hover-lift transition-all duration-300"
                  >
                    <span className="text-2xl">{pack.icon}</span>
                    <span className="text-sm font-semibold">{pack.name}</span>
                    <span className="text-[10px] text-muted-foreground leading-tight text-center">{pack.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step: Describe Business */}
          {step === "describe" && (
            <div className="space-y-5">
              <p className="text-center text-sm text-muted-foreground mb-2">
                Tell us about your business — our AI will understand your niche and generate the right content for you
              </p>
              <textarea
                placeholder="Describe your business: what you do, who your customers are, what makes you unique, and your brand voice..."
                value={businessDescription}
                onChange={(e) => setBusinessDescription(e.target.value)}
                rows={5}
                autoFocus
                className="w-full px-4 py-3 bg-background border border-input rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-all resize-none"
              />
              {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-destructive/5 border border-destructive/10 text-destructive text-xs">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {error}
                </div>
              )}
              <button
                onClick={handleDescribeContinue}
                className="w-full py-3 rounded-full bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 transition-all duration-200"
              >
                Continue to Website
              </button>
            </div>
          )}

          {/* Step: Website URL */}
          {(step === "website" || step === "analyzing") && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/50 border border-border/50">
                <span className="text-lg">{PACKS.find(p => p.slug === selectedPack)?.icon ?? "⚡"}</span>
                <div>
                  <p className="text-sm font-medium">{PACKS.find(p => p.slug === selectedPack)?.name ?? "Custom"}</p>
                  <button onClick={() => { setStep("niche"); setSelectedPack(null); }} className="text-xs text-muted-foreground hover:text-foreground transition-colors mt-0.5">Change</button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2 ml-1">Your business website URL</label>
                <input
                  type="url" placeholder="https://yourbusiness.com" value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)} disabled={submitting} autoFocus
                  className="w-full px-4 py-3 bg-background border border-input rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-all disabled:opacity-40"
                />
                <p className="mt-2 text-[11px] text-muted-foreground/50 ml-1">We'll analyze your site to learn your brand voice, products, and audience</p>
              </div>

              {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-destructive/5 border border-destructive/10 text-destructive text-xs">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {error}
                </div>
              )}

              <button
                onClick={handleWebsiteSubmit}
                disabled={submitting || step === "analyzing"}
                className="w-full py-3 rounded-full bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 transition-all duration-200 disabled:opacity-40"
              >
                {step === "analyzing" ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    Analyzing your website...
                  </span>
                ) : "Analyze & Continue →"}
              </button>
            </div>
          )}

          {/* Step: Done */}
          {step === "done" && (
            <div className="text-center space-y-4">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-2 ${analysis?.uxScore >= 70 ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-amber-500/10 border border-amber-500/20"}`}>
                <span className="text-2xl">{analysis?.uxScore >= 70 ? "✅" : "⚠️"}</span>
              </div>
              <h2 className="text-lg font-display">Analysis Complete</h2>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                <strong className="text-foreground">{analysis?.title ?? "your website"}</strong> · {analysis?.industry ?? "business"} industry · {analysis?.confidence ? Math.round(analysis.confidence * 100) : 87}% match
              </p>

              {analysis?.uxScore != null && (
                <div className="text-left p-4 rounded-xl bg-accent/50 border border-border/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold">UX Audit Score</span>
                    <span className={`text-lg font-bold ${analysis.uxScore >= 70 ? "text-emerald-600" : analysis.uxScore >= 50 ? "text-amber-600" : "text-destructive"}`}>{analysis.uxScore}/100</span>
                  </div>
                  <div className="h-1.5 bg-border/50 rounded-full overflow-hidden mb-3">
                    <div className={`h-full rounded-full transition-all duration-700 ${analysis.uxScore >= 70 ? "bg-emerald-500" : analysis.uxScore >= 50 ? "bg-amber-500" : "bg-destructive"}`} style={{ width: `${analysis.uxScore}%` }} />
                  </div>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {analysis.uxFlaws?.slice(0, 4).map((f: any, i: number) => (
                      <div key={i} className="flex gap-2 text-[10px] py-1 border-b border-border/30 last:border-0">
                        <span className={`shrink-0 px-1.5 py-0.5 rounded font-semibold ${
                          f.severity === "critical" ? "bg-red-500/10 text-red-600" :
                          f.severity === "high" ? "bg-amber-500/10 text-amber-600" :
                          f.severity === "medium" ? "bg-blue-500/10 text-blue-600" :
                          "bg-zinc-500/10 text-zinc-600"
                        }`}>{f.severity}</span>
                        <div>
                          <div className="font-medium">{f.title}</div>
                          <div className="text-muted-foreground leading-relaxed">{f.recommendation}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysis?.contentCalendar && analysis.contentCalendar.length > 0 && (
                <div className="text-left p-4 rounded-xl bg-accent/50 border border-border/50">
                  <div className="text-xs font-semibold mb-2">📅 30-Day Content Plan</div>
                  <div className="space-y-1 max-h-36 overflow-y-auto">
                    {analysis.contentCalendar.slice(0, 7).map((day: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-[10px] py-1 border-b border-border/30 last:border-0">
                        <span className="text-muted-foreground/50 w-10">{day.date?.slice(5)}</span>
                        <span className="text-muted-foreground/70 w-8 font-medium">{day.dayOfWeek?.slice(0, 3)}</span>
                        <span className="text-muted-foreground w-20 capitalize">{day.platform} · {day.contentType}</span>
                        <span className="text-foreground truncate flex-1">{day.topic}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground/40 text-center mt-2">+ {analysis.contentCalendar.length - 7} more days · Full calendar in dashboard</p>
                </div>
              )}

              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground pt-2">
                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                Redirecting to dashboard...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
