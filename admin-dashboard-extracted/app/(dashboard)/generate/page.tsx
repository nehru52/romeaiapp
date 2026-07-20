/**
 * Content Generation Wizard — redesigned with pastel palette.
 */

"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles, X, RefreshCw, Bell, MessageSquare, Mail } from "lucide-react";
import { toast } from "sonner";

const PLATFORMS = [
  { slug: "instagram", name: "Instagram", color: "#E1306C", description: "Stories, Reels, Carousels, Feed Posts", contentTypes: ["reel", "carousel", "feed_post", "story"] },
  { slug: "tiktok", name: "TikTok", color: "#00F2EA", description: "Short-form vertical videos, trends", contentTypes: ["tiktok", "reel"] },
  { slug: "youtube", name: "YouTube", color: "#FF0000", description: "Long-form videos, Shorts", contentTypes: ["reel", "blog"] },
  { slug: "facebook", name: "Facebook", color: "#1877F2", description: "Page posts, videos, events", contentTypes: ["feed_post", "blog"] },
  { slug: "pinterest", name: "Pinterest", color: "#E60023", description: "Pins, boards, visual discovery", contentTypes: ["pin", "carousel"] },
  { slug: "linkedin", name: "LinkedIn", color: "#0A66C2", description: "Articles, updates, professional content", contentTypes: ["blog", "feed_post"] },
];

const CONTENT_TYPE_LABELS: Record<string, string> = {
  reel: "Reels / Short Video",
  carousel: "Carousels",
  feed_post: "Feed Posts",
  story: "Stories",
  tiktok: "TikTok Videos",
  pin: "Pins",
  blog: "Articles / Blogs",
};

const FREQUENCY_OPTIONS = [
  { label: "Light", posts: "1-2 / day", desc: "~10-14 posts/week", value: "light", count: 2 },
  { label: "Standard", posts: "3-4 / day", desc: "~20-28 posts/week", value: "standard", count: 3 },
  { label: "Heavy", posts: "5-6 / day", desc: "~35-42 posts/week", value: "heavy", count: 5 },
];

const NOTIFICATION_CHANNELS = [
  { slug: "dashboard", name: "Dashboard", icon: Bell, desc: "Review and approve directly in the app" },
  { slug: "telegram", name: "Telegram", icon: MessageSquare, desc: "Get approval requests via Telegram bot" },
  { slug: "email", name: "Email", icon: Mail, desc: "Receive content for approval via email" },
];

const STEPS = [
  { key: "platforms", label: "Platforms" },
  { key: "content-types", label: "Content" },
  { key: "frequency", label: "Frequency" },
  { key: "keys", label: "API Keys" },
  { key: "notifications", label: "Notify" },
];

type Step = "platforms" | "content-types" | "frequency" | "keys" | "notifications" | "generating" | "review";

interface GeneratedItem {
  id: string;
  title: string;
  platform: string;
  type: string;
  excerpt: string;
  status: "pending_review" | "approved" | "rejected";
  feedback?: string;
  tenantId?: string;
}

export default function GeneratePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>("platforms");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedContentTypes, setSelectedContentTypes] = useState<Record<string, string[]>>({});
  const [frequency, setFrequency] = useState("standard");
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [keyErrors, setKeyErrors] = useState<Record<string, string>>({});
  const [notificationChannels, setNotificationChannels] = useState<string[]>(["dashboard"]);
  const [generatedItems, setGeneratedItems] = useState<GeneratedItem[]>([]);
  const [tenantId, setTenantId] = useState<string>("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace("/login");
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!user) return;
    const stored = sessionStorage.getItem(`tenant_${user.userId}`);
    if (stored) { setTenantId(stored); return; }
    const derived = `tenant_${user.userId}`;
    sessionStorage.setItem(`tenant_${user.userId}`, derived);
    setTenantId(derived);
  }, [user]);

  const togglePlatform = (slug: string) => {
    setSelectedPlatforms(prev => prev.includes(slug) ? prev.filter(p => p !== slug) : [...prev, slug]);
  };

  const toggleContentType = (platform: string, type: string) => {
    setSelectedContentTypes(prev => {
      const current = prev[platform] ?? [];
      const updated = current.includes(type) ? current.filter(t => t !== type) : [...current, type];
      return { ...prev, [platform]: updated };
    });
  };

  const handleGenerate = async () => {
    if (!user) return;
    setStep("generating");

    const freqOpt = FREQUENCY_OPTIONS.find(f => f.value === frequency)!;
    const allItems: GeneratedItem[] = [];

    try {
      for (const platform of selectedPlatforms) {
        const contentTypes = selectedContentTypes[platform] ?? [PLATFORMS.find(p => p.slug === platform)?.contentTypes[0] ?? "reel"];

        for (const contentType of contentTypes) {
          const res = await fetch("/api/content/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user.userId,
              tenantId: tenantId || `tenant_${user.userId}`,
              platform,
              count: Math.max(1, Math.floor(freqOpt.count / contentTypes.length)),
              contentType,
            }),
          });
          const data = await res.json();
          if (data.success && data.data?.generated) {
            for (const item of data.data.generated) {
              allItems.push({
                id: item.id,
                title: item.title,
                platform,
                type: item.type ?? contentType,
                excerpt: item.excerpt,
                status: "pending_review",
                tenantId: item.tenantId,
              });
            }
          }
        }
      }

      if (allItems.length === 0) {
        toast.info("Content generated using templates (add DEEPSEEK_API_KEY for AI-powered content)");
      } else {
        toast.success(`${allItems.length} pieces of content ready for review`);
      }
    } catch {
      toast.error("Generation failed — check your API configuration");
    }

    setGeneratedItems(allItems);
    setStep("review");
  };

  const approveItem = async (id: string) => {
    const item = generatedItems.find(i => i.id === id);
    if (!item || !user) return;
    setGeneratedItems(prev => prev.map(i => i.id === id ? { ...i, status: "approved" as const } : i));
    try {
      await fetch("/api/notifications/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.userId, contentId: id }),
      });
    } catch { /* non-blocking */ }
  };

  const rejectItem = async (id: string) => {
    setGeneratedItems(prev => prev.map(i => i.id === id ? { ...i, status: "rejected" as const } : i));
    try {
      await fetch(`/api/content/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      });
    } catch { /* non-blocking */ }
  };

  const handleRegenerate = () => {
    setGeneratedItems(prev => prev.map(item =>
      item.status === "rejected"
        ? { ...item, status: "pending_review" as const, title: `[REVISED] ${item.title}`, excerpt: `Regenerated: ${item.excerpt}`, feedback: undefined }
        : item
    ));
  };

  const handleFinish = () => router.push("/queue");

  const approvedCount = generatedItems.filter(i => i.status === "approved").length;
  const rejectedCount = generatedItems.filter(i => i.status === "rejected").length;
  const pendingCount = generatedItems.filter(i => i.status === "pending_review").length;
  const currentStepIndex = STEPS.findIndex(s => s.key === step);

  const goBack = () => {
    if (step === "platforms") router.back();
    else if (step === "content-types") setStep("platforms");
    else if (step === "frequency") setStep("content-types");
    else if (step === "keys") setStep("frequency");
    else if (step === "notifications") setStep("keys");
  };

  if (authLoading) return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Content</p>
        <h1 className="text-[32px] md:text-[42px] font-semibold tracking-tight leading-tight">
          {step === "review" ? "Review & Approve" : "Generate Content"}
        </h1>
        <p className="text-muted-foreground mt-1.5 text-[15px]">
          {step === "review"
            ? `${approvedCount} approved · ${pendingCount} pending · ${rejectedCount} need revision`
            : `Step ${Math.max(1, currentStepIndex + 1)} of ${STEPS.length}`}
        </p>
      </div>

      {/* Progress stepper */}
      {step !== "review" && step !== "generating" && (
        <div className="flex items-center gap-0">
          {STEPS.map((s, i) => {
            const isActive = s.key === step;
            const isPast = currentStepIndex > i;
            return (
              <div key={s.key} className="flex items-center flex-1">
                <div className="flex items-center gap-2">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold transition-all ${
                    isActive ? "bg-foreground text-background" : isPast ? "bg-foreground/15 text-foreground" : "bg-muted text-muted-foreground/40"
                  }`}>
                    {isPast ? <Check className="w-3 h-3" /> : i + 1}
                  </span>
                  <span className={`text-xs font-medium hidden sm:block ${isActive ? "text-foreground" : "text-muted-foreground/40"}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-3 ${isPast ? "bg-foreground/20" : "bg-border"}`} />}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Step 1: Platforms ─────────────────────────────────────────── */}
      {step === "platforms" && (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">Select one or more platforms to generate content for</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {PLATFORMS.map(plat => {
              const selected = selectedPlatforms.includes(plat.slug);
              return (
                <button key={plat.slug} onClick={() => togglePlatform(plat.slug)}
                  className={`relative flex flex-col items-start gap-3 p-5 rounded-[24px] border text-left transition-all bg-white/50 ${
                    selected ? "border-foreground/30 ring-1 ring-foreground/10" : "border-black/5 hover:border-black/20"
                  }`}>
                  {selected && (
                    <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                  <div>
                    <p className="font-semibold text-sm" style={{ color: plat.color }}>{plat.name}</p>
                    <p className="text-[11px] text-muted-foreground/60 mt-0.5">{plat.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {plat.contentTypes.map(ct => (
                      <span key={ct} className="text-[10px] font-medium px-1.5 py-0.5 rounded-lg bg-white/60 text-muted-foreground/50">
                        {CONTENT_TYPE_LABELS[ct] ?? ct}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
          <Button
            onClick={() => setStep("content-types")}
            disabled={selectedPlatforms.length === 0}
            className="w-full rounded-full bg-foreground hover:bg-foreground/90 text-background h-12 text-sm font-medium"
          >
            Continue with {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? "s" : ""} <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      )}

      {/* ── Step 2: Content Types ─────────────────────────────────────── */}
      {step === "content-types" && (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">Choose what type of content to generate for each platform</p>
          <div className="space-y-6">
            {selectedPlatforms.map(slug => {
              const plat = PLATFORMS.find(p => p.slug === slug)!;
              return (
                <div key={slug} className="bg-white/50 rounded-[24px] p-5">
                  <p className="font-semibold text-sm mb-3" style={{ color: plat.color }}>{plat.name}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {plat.contentTypes.map(ct => {
                      const selected = (selectedContentTypes[slug] ?? []).includes(ct);
                      return (
                        <button key={ct} onClick={() => toggleContentType(slug, ct)}
                          className={`flex items-center gap-2 p-3 rounded-2xl border text-left text-sm transition-all ${
                            selected ? "border-foreground/30 bg-foreground/[0.04]" : "border-black/5 hover:border-black/20"
                          }`}>
                          <span className={`flex h-4 w-4 items-center justify-center rounded border shrink-0 ${
                            selected ? "bg-foreground border-foreground" : "border-black/20"
                          }`}>
                            {selected && <Check className="h-2.5 w-2.5 text-background" />}
                          </span>
                          <span className="text-xs font-medium">{CONTENT_TYPE_LABELS[ct] ?? ct}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={goBack} className="flex-1 rounded-full border-black/10 h-12">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
            </Button>
            <Button onClick={() => setStep("frequency")} className="flex-1 rounded-full bg-foreground hover:bg-foreground/90 text-background h-12">
              Continue <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 3: Frequency ────────────────────────────────────────── */}
      {step === "frequency" && (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">How much content per platform?</p>
          <div className="grid gap-3">
            {FREQUENCY_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => setFrequency(opt.value)}
                className={`flex items-center gap-4 p-5 rounded-[24px] border text-left transition-all bg-white/50 ${
                  frequency === opt.value ? "border-foreground/30 ring-1 ring-foreground/10" : "border-black/5 hover:border-black/20"
                }`}>
                <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 shrink-0 ${
                  frequency === opt.value ? "border-foreground bg-foreground" : "border-black/20"
                }`}>
                  {frequency === opt.value && <Check className="h-3 w-3 text-background" />}
                </span>
                <div>
                  <p className="font-semibold text-sm">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.posts}</p>
                </div>
                <span className="ml-auto text-xs text-muted-foreground/50 hidden sm:block">{opt.desc}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={goBack} className="flex-1 rounded-full border-black/10 h-12">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
            </Button>
            <Button onClick={() => setStep("keys")} className="flex-1 rounded-full bg-foreground hover:bg-foreground/90 text-background h-12">
              Continue <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 4: API Keys ──────────────────────────────────────────── */}
      {step === "keys" && (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">Paste API keys to enable direct publishing (optional)</p>
          <div className="space-y-4">
            {selectedPlatforms.map(slug => {
              const plat = PLATFORMS.find(p => p.slug === slug)!;
              const err = keyErrors[slug];
              return (
                <div key={slug} className="bg-white/50 rounded-[24px] p-5">
                  <p className="font-medium text-sm mb-3" style={{ color: plat.color }}>{plat.name}</p>
                  <input
                    type="password"
                    placeholder={`${plat.name} API key (optional)`}
                    value={apiKeys[slug] ?? ""}
                    onChange={e => { setApiKeys(prev => ({ ...prev, [slug]: e.target.value })); if (e.target.value.trim()) setKeyErrors(prev => { const n = { ...prev }; delete n[slug]; return n; }); }}
                    className="w-full px-4 py-2.5 bg-white/60 rounded-2xl text-sm placeholder:text-muted-foreground/30 outline-none focus:ring-1 focus:ring-foreground/20 transition-all"
                  />
                  {err && <p className="text-[11px] text-destructive mt-1.5 flex items-center gap-1"><X className="h-3 w-3" />{err}</p>}
                </div>
              );
            })}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={goBack} className="flex-1 rounded-full border-black/10 h-12">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
            </Button>
            <Button onClick={() => setStep("notifications")} className="flex-1 rounded-full bg-foreground hover:bg-foreground/90 text-background h-12">
              Continue <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 5: Notifications ─────────────────────────────────────── */}
      {step === "notifications" && (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">Where should we notify you when content is ready?</p>
          <div className="grid gap-3">
            {NOTIFICATION_CHANNELS.map(chan => {
              const selected = notificationChannels.includes(chan.slug);
              return (
                <button key={chan.slug}
                  onClick={() => setNotificationChannels(prev => prev.includes(chan.slug) ? prev.filter(c => c !== chan.slug) : [...prev, chan.slug])}
                  className={`flex items-center gap-4 p-5 rounded-[24px] border text-left transition-all bg-white/50 ${
                    selected ? "border-foreground/30 ring-1 ring-foreground/10" : "border-black/5 hover:border-black/20"
                  }`}>
                  <span className={`flex h-5 w-5 items-center justify-center rounded border-2 shrink-0 ${
                    selected ? "border-foreground bg-foreground" : "border-black/20"
                  }`}>
                    {selected && <Check className="h-3 w-3 text-background" />}
                  </span>
                  <chan.icon className={`h-5 w-5 ${selected ? "text-foreground" : "text-muted-foreground/40"}`} />
                  <div>
                    <p className="font-semibold text-sm">{chan.name}</p>
                    <p className="text-xs text-muted-foreground">{chan.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={goBack} className="flex-1 rounded-full border-black/10 h-12">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
            </Button>
            <Button onClick={handleGenerate} className="flex-1 rounded-full bg-foreground hover:bg-foreground/90 text-background h-12 text-sm font-medium">
              <Sparkles className="w-4 h-4 mr-1.5" /> Generate Content
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 6: Generating ─────────────────────────────────────────── */}
      {step === "generating" && (
        <div className="bg-mint rounded-[24px] py-24 px-8 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-foreground/40 mx-auto mb-6" />
          <p className="font-semibold text-lg">Generating your content with DeepSeek AI...</p>
          <p className="text-sm text-muted-foreground mt-1.5">{selectedPlatforms.length} platforms · detecting trends · building viral hooks</p>
        </div>
      )}

      {/* ── Step 7: Review & Approve ───────────────────────────────────── */}
      {step === "review" && (
        <div className="space-y-6">
          <div className="flex items-center gap-4 text-sm bg-white/50 rounded-[24px] p-5">
            <span className="flex items-center gap-1.5 font-medium"><Check className="w-3.5 h-3.5 text-foreground/60" />{approvedCount} approved</span>
            <span className="w-px h-4 bg-black/10" />
            <span className="text-muted-foreground">{pendingCount} pending</span>
            {rejectedCount > 0 && (
              <>
                <span className="w-px h-4 bg-black/10" />
                <span className="text-muted-foreground">{rejectedCount} need revision</span>
              </>
            )}
            {rejectedCount > 0 && (
              <button onClick={handleRegenerate} className="ml-auto flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                <RefreshCw className="h-3.5 w-3.5" /> Regenerate rejected
              </button>
            )}
          </div>

          {generatedItems.length === 0 && (
            <div className="bg-muted/30 rounded-[24px] py-16 text-center">
              <p className="text-muted-foreground text-sm">No content generated. Check your API configuration.</p>
              <Button onClick={() => setStep("platforms")} variant="outline" className="mt-4 rounded-full border-black/10">Start over</Button>
            </div>
          )}

          <div className="space-y-3">
            {generatedItems.map(item => {
              const plat = PLATFORMS.find(p => p.slug === item.platform);
              const isApproved = item.status === "approved";
              const isRejected = item.status === "rejected";
              return (
                <div key={item.id} className={`rounded-[24px] p-6 transition-all ${
                  isApproved ? "bg-mint/60" : isRejected ? "bg-muted/40 opacity-60" : "bg-pink"
                }`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-sm font-semibold">{item.title}</h3>
                      <p className="text-[10px] font-medium text-muted-foreground/60 mt-0.5 capitalize" style={{ color: plat?.color }}>
                        {item.platform} · {item.type.replace(/_/g, " ")}
                      </p>
                    </div>
                    <span className={`shrink-0 text-[10px] font-medium px-2.5 py-1 rounded-full ${
                      isApproved ? "bg-white/60 text-foreground/60"
                        : isRejected ? "bg-white/40 text-muted-foreground/50"
                        : "bg-white/60 text-muted-foreground/60"
                    }`}>
                      {item.status === "pending_review" ? "pending" : item.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">{item.excerpt}</p>
                  {!isApproved && !isRejected && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => approveItem(item.id)} className="rounded-full bg-foreground hover:bg-foreground/90 text-background h-8 px-4 text-xs">
                        <Check className="h-3 w-3 mr-1.5" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => rejectItem(item.id)} className="rounded-full border-black/10 h-8 px-4 text-xs">
                        <X className="h-3 w-3 mr-1.5" /> Reject
                      </Button>
                    </div>
                  )}
                  {isApproved && <p className="text-xs text-muted-foreground/40 font-medium">Saved to content queue →</p>}
                </div>
              );
            })}
          </div>

          {generatedItems.length > 0 && (
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { setStep("platforms"); setGeneratedItems([]); }} className="flex-1 rounded-full border-black/10 h-12">
                Generate More
              </Button>
              <Button onClick={handleFinish} className="flex-1 rounded-full bg-foreground hover:bg-foreground/90 text-background h-12">
                View Queue <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
