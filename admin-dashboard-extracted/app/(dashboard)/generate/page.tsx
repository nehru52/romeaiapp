/**
 * Content Generation Wizard — multi-step flow.
 * Step 1: Platforms -> Step 2: Frequency -> Step 3: API Keys ->
 * Step 4: Notifications -> Step 5: Generating -> Step 6: Review & Approve
 * Redesigned with premium light-theme template tokens.
 */

"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles, X, RefreshCw, Bell, MessageSquare, Mail } from "lucide-react";

// ── Platform definitions ──────────────────────────────────────────────

const PLATFORMS = [
  {
    slug: "instagram", name: "Instagram", color: "#E1306C",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
    description: "Stories, Reels, Carousels, Feed Posts",
    contentTypes: ["Reels (15-90s)", "Carousels (2-10 slides)", "Stories", "Feed Posts"],
  },
  {
    slug: "tiktok", name: "TikTok", color: "#00F2EA",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
    description: "Short-form vertical videos, trends, sounds",
    contentTypes: ["Short videos (15-60s)", "Trend-based content", "Duets/Stitches", "Live streams"],
  },
  {
    slug: "youtube", name: "YouTube", color: "#FF0000",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    description: "Long-form videos, Shorts, community posts",
    contentTypes: ["Shorts (15-60s)", "Long videos (2-20min)", "Community posts", "Live streams"],
  },
  {
    slug: "facebook", name: "Facebook", color: "#1877F2",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    description: "Page posts, videos, events, community",
    contentTypes: ["Feed Posts", "Video Posts", "Event Promotions", "Community Posts"],
  },
  {
    slug: "pinterest", name: "Pinterest", color: "#E60023",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
      </svg>
    ),
    description: "Pins, boards, visual discovery",
    contentTypes: ["Idea Pins", "Standard Pins", "Video Pins", "Rich Pins"],
  },
  {
    slug: "linkedin", name: "LinkedIn", color: "#0A66C2",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    description: "Articles, company updates, professional content",
    contentTypes: ["Articles", "Company Updates", "Job Posts", "Professional Tips"],
  },
];

type Step = "platforms" | "frequency" | "keys" | "notifications" | "generating" | "review";

const FREQUENCY_OPTIONS = [
  { label: "Light", posts: "1-2 / day", desc: "~10-14 posts/week — consistent presence", value: "light" },
  { label: "Standard", posts: "3-4 / day", desc: "~20-28 posts/week — strong engagement", value: "standard" },
  { label: "Heavy", posts: "5-6 / day", desc: "~35-42 posts/week — maximum reach", value: "heavy" },
];

const NOTIFICATION_CHANNELS = [
  { slug: "dashboard", name: "Dashboard", icon: Bell, desc: "Review and approve directly in the app" },
  { slug: "telegram", name: "Telegram", icon: MessageSquare, desc: "Get approval requests via Telegram bot" },
  { slug: "email", name: "Email", icon: Mail, desc: "Receive content for approval via email" },
];

// Mock generated content for review
interface GeneratedItem {
  id: string; title: string; platform: string; type: string; excerpt: string; status: "pending_review" | "approved" | "rejected";
  feedback?: string;
}

// Progress steps indicator
const STEPS = [
  { key: "platforms", label: "Platforms" },
  { key: "frequency", label: "Frequency" },
  { key: "keys", label: "API Keys" },
  { key: "notifications", label: "Notifications" },
];

// ── Page ──────────────────────────────────────────────────────────────

export default function GeneratePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>("platforms");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [frequency, setFrequency] = useState<string>("standard");
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [keyErrors, setKeyErrors] = useState<Record<string, string>>({});
  const [notificationChannels, setNotificationChannels] = useState<string[]>(["dashboard"]);
  const [generatedItems, setGeneratedItems] = useState<GeneratedItem[]>([]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace("/login");
  }, [authLoading, isAuthenticated, router]);

  const togglePlatform = (slug: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(slug) ? prev.filter(p => p !== slug) : [...prev, slug]
    );
  };

  const selectAllPlatforms = () => {
    if (selectedPlatforms.length === PLATFORMS.length) setSelectedPlatforms([]);
    else setSelectedPlatforms(PLATFORMS.map(p => p.slug));
  };

  const toggleNotificationChannel = (slug: string) => {
    setNotificationChannels(prev =>
      prev.includes(slug) ? prev.filter(c => c !== slug) : [...prev, slug]
    );
  };

  // Validate API keys before proceeding
  const handleKeysContinue = () => {
    const errors: Record<string, string> = {};
    for (const slug of selectedPlatforms) {
      if (!apiKeys[slug]?.trim()) {
        const plat = PLATFORMS.find(p => p.slug === slug)!;
        errors[slug] = `${plat.name} API key is required`;
      }
    }
    setKeyErrors(errors);
    if (Object.keys(errors).length === 0) {
      setStep("notifications");
    }
  };

  // Generate mock content for review
  const handleGenerate = async () => {
    if (!user) return;
    setStep("generating");

    // Simulate API setup
    for (const platform of selectedPlatforms) {
      try {
        await fetch("/api/platforms/setup", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.userId, tenantId: "demo-tenant", platform,
            postsPerDay: frequency === "light" ? 1 : frequency === "heavy" ? 5 : 3,
            duration: "1week", apiKey: apiKeys[platform] ?? "",
          }),
        });
      } catch {}
    }

    // Generate mock content items for review
    const types = ["carousel", "reel", "feed_post", "story"];
    const titles = [
      "Behind the scenes: How we deliver quality every day",
      "Top 5 tips to level up your experience this week",
      "Customer spotlight: A story you need to hear",
      "The secret to getting more out of your routine",
      "Why our community keeps growing every month",
      "Quick guide: Getting started in under 5 minutes",
    ];

    const items: GeneratedItem[] = [];
    for (const platform of selectedPlatforms) {
      const count = frequency === "light" ? 2 : frequency === "heavy" ? 5 : 3;
      for (let i = 0; i < count; i++) {
        items.push({
          id: `gen_${platform}_${i}`,
          title: titles[(items.length + i) % titles.length]!,
          platform,
          type: types[i % types.length]!,
          excerpt: `AI-generated ${types[i % types.length]!.replace(/_/g, " ")} for ${PLATFORMS.find(p => p.slug === platform)?.name}. Optimized hook, trending hashtags, and platform-specific formatting included.`,
          status: "pending_review",
        });
      }
    }

    setGeneratedItems(items);
    // Trigger notification in header
    const { addNotification } = await import("@/components/header");
    addNotification(
      "Content ready for review",
      `${items.length} posts across ${selectedPlatforms.length} platform${selectedPlatforms.length !== 1 ? "s" : ""} — review and approve to publish`,
    );
    setStep("review");
  };

  // Approve a single item
  const approveItem = (id: string) => {
    setGeneratedItems(prev => prev.map(item =>
      item.id === id ? { ...item, status: "approved" as const } : item
    ));
  };

  // Reject a single item
  const rejectItem = (id: string) => {
    setGeneratedItems(prev => prev.map(item =>
      item.id === id ? { ...item, status: "rejected" as const } : item
    ));
  };

  // Set feedback for a rejected item
  const setFeedback = (id: string, feedback: string) => {
    setGeneratedItems(prev => prev.map(item =>
      item.id === id ? { ...item, feedback } : item
    ));
  };

  // Regenerate rejected items
  const handleRegenerate = () => {
    setGeneratedItems(prev => prev.map(item => {
      if (item.status === "rejected") {
        return {
          ...item,
          status: "pending_review" as const,
          title: `[REVISED] ${item.title}`,
          excerpt: `Regenerated based on feedback: "${item.feedback ?? "No feedback provided"}". New version with improved hook, refined messaging, and adjusted tone.`,
          feedback: undefined,
        };
      }
      return item;
    }));
  };

  // Finish — mark as done, redirect to content
  const handleFinish = async () => {
    for (const item of generatedItems) {
      if (item.status === "approved") {
        try {
          await fetch("/api/notifications/approve", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user?.userId, contentId: item.id }),
          });
        } catch {}
      }
    }
    router.push("/users");
  };

  const approvedCount = generatedItems.filter(i => i.status === "approved").length;
  const rejectedCount = generatedItems.filter(i => i.status === "rejected").length;
  const pendingCount = generatedItems.filter(i => i.status === "pending_review").length;

  const currentStepIndex = STEPS.findIndex(s => s.key === step);

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const goBack = () => {
    if (step === "platforms") router.back();
    else if (step === "frequency") setStep("platforms");
    else if (step === "keys") setStep("frequency");
    else if (step === "notifications") setStep("keys");
  };

  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-2">
          <span className="w-6 h-px bg-foreground/30" />
          Content
        </span>
        <h1 className="text-3xl md:text-4xl font-display tracking-tight">
          {step === "review" ? "Review & Approve" : "Generate Content"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {step === "review"
            ? `${approvedCount} approved · ${pendingCount} pending · ${rejectedCount} need revision`
            : `Step ${currentStepIndex + 1} of ${STEPS.length}`}
        </p>
      </div>

      {/* Progress stepper — only for wizard steps */}
      {step !== "review" && step !== "generating" && (
        <div className="flex items-center gap-0">
          {STEPS.map((s, i) => {
            const isActive = s.key === step;
            const isPast = currentStepIndex > i;
            return (
              <div key={s.key} className="flex items-center flex-1">
                <div className="flex items-center gap-2">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-medium transition-all ${
                    isActive
                      ? "btn-gradient text-white shadow-md"
                      : isPast
                        ? "bg-brand-emerald/15 text-brand-emerald"
                        : "bg-foreground/5 text-muted-foreground/50"
                  }`}>
                    {isPast ? (
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </span>
                  <span className={`text-xs font-mono hidden sm:block ${
                    isActive ? "text-foreground font-medium" : "text-muted-foreground/50"
                  }`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-3 ${currentStepIndex > i ? "bg-brand-emerald/40" : "bg-border"}`} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Step 1: Choose Platforms ──────────────────────────────── */}
      {step === "platforms" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Select one or more platforms to generate content for</p>
            <button onClick={selectAllPlatforms} className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors">
              {selectedPlatforms.length === PLATFORMS.length ? "Deselect All" : "Select All"}
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {PLATFORMS.map((plat) => {
              const selected = selectedPlatforms.includes(plat.slug);
              return (
                <button key={plat.slug} onClick={() => togglePlatform(plat.slug)}
                  className={`relative flex flex-col items-start gap-3 p-5 rounded-2xl border text-left transition-all duration-300 bg-card card-pop ${
                    selected
                      ? "border-foreground/30 ring-1 ring-foreground/20 shadow-md scale-[1.01]"
                      : "border-border/50 hover:border-foreground/20"
                  }`}>
                  {selected && (
                    <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-brand-emerald text-white">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{
                    backgroundColor: plat.color ? `${plat.color}15` : undefined,
                    color: plat.color ?? undefined,
                  }}>
                    {plat.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{plat.name}</p>
                    <p className="text-[11px] text-muted-foreground/60 mt-0.5">{plat.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {plat.contentTypes.map((ct) => (
                      <span key={ct} className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-foreground/[0.04] text-muted-foreground/50 border border-border/30">{ct}</span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          <Button
            onClick={() => setStep("frequency")}
            disabled={selectedPlatforms.length === 0}
            className="w-full rounded-full bg-foreground hover:bg-foreground/90 text-background h-11"
          >
            Continue with {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? "s" : ""}
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      )}

      {/* ── Step 2: Posting Frequency ─────────────────────────────── */}
      {step === "frequency" && (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            How much content for{" "}
            <strong className="text-foreground">{selectedPlatforms.map(s => PLATFORMS.find(p => p.slug === s)?.name).join(", ")}</strong>?
          </p>

          <div className="grid gap-3">
            {FREQUENCY_OPTIONS.map((opt) => (
              <button key={opt.value} onClick={() => setFrequency(opt.value)}
                className={`flex items-center gap-4 p-5 rounded-2xl border text-left transition-all duration-300 bg-card card-pop ${
                  frequency === opt.value
                    ? "border-foreground/30 ring-1 ring-foreground/20"
                    : "border-border/50 hover:border-foreground/20"
                }`}>
                <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 shrink-0 transition-all ${
                  frequency === opt.value ? "border-foreground bg-foreground" : "border-border"
                }`}>
                  {frequency === opt.value && <Check className="h-3 w-3 text-background" />}
                </span>
                <div>
                  <p className="font-semibold text-sm text-foreground">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.posts}</p>
                </div>
                <span className="ml-auto text-xs text-muted-foreground/50 hidden sm:block">{opt.desc}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={goBack} className="flex-1 rounded-full border-border/50 h-11">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
            </Button>
            <Button onClick={() => setStep("keys")} className="flex-1 rounded-full bg-foreground hover:bg-foreground/90 text-background h-11">
              Continue <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 3: API Keys ──────────────────────────────────────── */}
      {step === "keys" && (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Paste your API keys for each platform to enable direct publishing
          </p>

          <div className="space-y-4">
            {selectedPlatforms.map((slug) => {
              const plat = PLATFORMS.find(p => p.slug === slug)!;
              const err = keyErrors[slug];
              return (
                <div key={slug} className={`bg-card border rounded-2xl p-5 transition-all ${
                  err ? "border-foreground/30" : "border-border/50"
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{
                      backgroundColor: plat.color ? `${plat.color}15` : undefined,
                      color: plat.color ?? undefined,
                    }}>
                      {plat.icon}
                    </div>
                    <span className="text-sm font-medium">{plat.name}</span>
                  </div>
                  <input type="password" placeholder={`${plat.name} API key...`}
                    value={apiKeys[slug] ?? ""}
                    onChange={(e) => {
                      setApiKeys(prev => ({ ...prev, [slug]: e.target.value }));
                      if (e.target.value.trim()) setKeyErrors(prev => { const n = { ...prev }; delete n[slug]; return n; });
                    }}
                    className={`w-full px-4 py-2.5 bg-foreground/[0.03] border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-foreground/30 transition-all ${
                      err ? "border-foreground/30" : "border-border/50"
                    }`}
                  />
                  {err && <p className="text-[11px] text-destructive mt-1.5 flex items-center gap-1"><X className="h-3 w-3" /> {err}</p>}
                  {!err && <p className="text-[10px] text-muted-foreground/40 mt-1.5 font-mono">Required to post directly to {plat.name}</p>}
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={goBack} className="flex-1 rounded-full border-border/50 h-11">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
            </Button>
            <Button onClick={handleKeysContinue} className="flex-1 rounded-full bg-foreground hover:bg-foreground/90 text-background h-11">
              Continue <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 4: Notification Preferences ───────────────────────── */}
      {step === "notifications" && (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Where should we notify you when content is ready for review?
          </p>

          <div className="grid gap-3">
            {NOTIFICATION_CHANNELS.map((chan) => {
              const selected = notificationChannels.includes(chan.slug);
              return (
                <button key={chan.slug} onClick={() => toggleNotificationChannel(chan.slug)}
                  className={`flex items-center gap-4 p-5 rounded-2xl border text-left transition-all duration-300 bg-card card-pop ${
                    selected
                      ? "border-foreground/30 ring-1 ring-foreground/20"
                      : "border-border/50 hover:border-foreground/20"
                  }`}>
                  <span className={`flex h-5 w-5 items-center justify-center rounded border-2 shrink-0 transition-all ${
                    selected ? "border-foreground bg-foreground" : "border-border"
                  }`}>
                    {selected && <Check className="h-3 w-3 text-background" />}
                  </span>
                  <chan.icon className={`h-5 w-5 ${selected ? "text-foreground" : "text-muted-foreground/50"}`} />
                  <div>
                    <p className="font-semibold text-sm text-foreground">{chan.name}</p>
                    <p className="text-xs text-muted-foreground">{chan.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={goBack} className="flex-1 rounded-full border-border/50 h-11">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
            </Button>
            <Button onClick={handleGenerate} className="flex-1 rounded-full bg-foreground hover:bg-foreground/90 text-background h-11" size="lg">
              <Sparkles className="w-4 h-4 mr-1.5" /> Generate Content
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 5: Generating ─────────────────────────────────────── */}
      {step === "generating" && (
        <div className="bg-card border border-border/30 border-dashed rounded-2xl py-24 px-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-foreground/5 flex items-center justify-center mx-auto mb-6">
            <Loader2 className="h-8 w-8 animate-spin text-foreground/60" />
          </div>
          <p className="font-semibold text-lg font-display">Generating your content...</p>
          <p className="text-sm text-muted-foreground mt-1.5">
            {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? "s" : ""} ·{" "}
            {frequency === "light" ? "Light" : frequency === "heavy" ? "Heavy" : "Standard"} schedule
          </p>
        </div>
      )}

      {/* ── Step 6: Review & Approve ───────────────────────────────── */}
      {step === "review" && (
        <div className="space-y-6">
          {/* Summary bar */}
          <div className="flex items-center gap-4 text-sm bg-card border border-border/50 rounded-2xl p-4">
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-foreground/60" />
              <span>{approvedCount} approved</span>
            </span>
            <span className="w-px h-4 bg-border/50" />
            <span className="text-muted-foreground">{pendingCount} pending</span>
            {rejectedCount > 0 && (
              <>
                <span className="w-px h-4 bg-border/50" />
                <span className="text-muted-foreground">{rejectedCount} need revision</span>
              </>
            )}
          </div>

          {/* Content items */}
          <div className="space-y-3">
            {generatedItems.map((item) => {
              const plat = PLATFORMS.find(p => p.slug === item.platform);
              const isApproved = item.status === "approved";
              const isRejected = item.status === "rejected";
              return (
                <div key={item.id} className={`bg-card border rounded-2xl p-6 transition-all duration-300 ${
                  isApproved ? "border-foreground/20 bg-foreground/[0.015]" :
                  isRejected ? "border-foreground/15 bg-foreground/[0.01]" :
                  "border-border/50"
                }`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {plat?.icon && (
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{
                          backgroundColor: (plat as any)?.color ? `${(plat as any).color}15` : undefined,
                          color: (plat as any)?.color ?? undefined,
                        }}>
                          <span className="[&>svg]:w-4 [&>svg]:h-4">{plat.icon}</span>
                        </div>
                      )}
                      <div>
                        <h3 className="text-sm font-medium">{item.title}</h3>
                        <p className="text-[10px] font-mono text-muted-foreground/60 mt-0.5 capitalize">{item.platform} · {item.type.replace(/_/g, " ")}</p>
                      </div>
                    </div>
                    <span className={`shrink-0 text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      isApproved ? "bg-foreground/10 text-foreground/70" :
                      isRejected ? "bg-foreground/5 text-muted-foreground/60" :
                      "bg-foreground/5 text-muted-foreground/60"
                    }`}>
                      {item.status === "pending_review" ? "pending" : item.status}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">{item.excerpt}</p>

                  {/* Rejected: show feedback box */}
                  {isRejected && (
                    <div className="mb-4">
                      <textarea
                        placeholder="What needs to be fixed? Be specific so the AI can improve..."
                        value={item.feedback ?? ""}
                        onChange={(e) => setFeedback(item.id, e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 bg-foreground/[0.03] border border-border/50 rounded-xl text-xs text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-foreground/30 transition-all resize-none"
                      />
                    </div>
                  )}

                  {/* Actions */}
                  {item.status === "pending_review" && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => approveItem(item.id)} className="rounded-full bg-foreground hover:bg-foreground/90 text-background text-xs h-8 px-4">
                        <Check className="h-3 w-3 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => rejectItem(item.id)} className="rounded-full border-border/50 text-xs h-8 px-4">
                        <X className="h-3 w-3 mr-1" /> Reject
                      </Button>
                    </div>
                  )}
                  {isApproved && (
                    <p className="text-[11px] text-foreground/50 flex items-center gap-1.5">
                      <Check className="h-3 w-3" /> Approved — ready to publish
                    </p>
                  )}
                  {isRejected && (
                    <p className="text-[11px] text-muted-foreground/50 flex items-center gap-1.5">
                      Rejected — add feedback and click regenerate
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom actions */}
          <div className="flex gap-3">
            {rejectedCount > 0 && (
              <Button variant="outline" onClick={handleRegenerate} className="flex-1 rounded-full border-border/50 h-11">
                <RefreshCw className="h-4 w-4 mr-1.5" /> Regenerate {rejectedCount} Rejected
              </Button>
            )}
            <Button
              onClick={handleFinish}
              disabled={pendingCount > 0}
              className="flex-1 rounded-full bg-foreground hover:bg-foreground/90 text-background h-11"
              size="lg"
            >
              {pendingCount > 0
                ? `Review all ${pendingCount} pending items first`
                : `Finish — ${approvedCount} post${approvedCount !== 1 ? "s" : ""} ready`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
