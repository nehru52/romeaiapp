/**
 * Dashboard — redesigned with pastel warm palette.
 */
"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CalendarDays, ImageIcon, MessageSquare, Plus, Share2, TrendingUp, Zap, Clock, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DashboardStats {
  contentGenerated: number;
  scheduledPosts: number;
  platformsConnected: number;
  pendingApproval: number;
  published: number;
  platforms: Array<{ platform: string; status: string; generated: number; published: number }>;
  aiCostThisMonth: number;
}

const STAT_CARDS = [
  { key: "contentGenerated", label: "Content Generated", icon: MessageSquare, bg: "bg-pink", color: "text-pink-foreground" },
  { key: "pendingApproval", label: "Pending Approval", icon: Clock, bg: "bg-yellow", color: "text-yellow-foreground" },
  { key: "published", label: "Published", icon: CheckCircle, bg: "bg-mint", color: "text-mint-foreground" },
  { key: "aiCost", label: "AI Cost (month)", icon: Zap, bg: "bg-lavender", color: "text-lavender-foreground" },
] as const;

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, onboardingComplete } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/login");
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!user) return;
    console.log("[dashboard] user loaded, fetching stats. userId:", user.userId);
    loadStats();
    const interval = setInterval(loadStats, 30_000);
    return () => clearInterval(interval);
  }, [user]);

  async function loadStats() {
    if (!user) return;
    try {
      console.log("[dashboard] fetching /api/dashboard and /api/analytics/" + user.userId);
      const [dashRes, analyticsRes] = await Promise.all([
        fetch("/api/dashboard", { credentials: "include" }),
        fetch(`/api/analytics/${user.userId}`, { credentials: "include" }),
      ]);
      console.log("[dashboard] dash status:", dashRes.status, "analytics status:", analyticsRes.status);
      const dash = await dashRes.json();
      const analytics = await analyticsRes.json();
      console.log("[dashboard] dash:", dash, "analytics:", analytics);

      const platforms = dash.data?.platforms ?? [];
      const contentTotal = analytics.data?.totalContent ?? 0;
      const scheduled = platforms.reduce((s: number, p: any) => s + (p.contentStatus?.generated ?? 0), 0);
      const pending = platforms.reduce((s: number, p: any) => s + (p.contentStatus?.pendingApproval ?? 0), 0);
      const published = platforms.reduce((s: number, p: any) => s + (p.contentStatus?.published ?? 0), 0);

      setStats({
        contentGenerated: contentTotal || scheduled,
        scheduledPosts: scheduled,
        platformsConnected: platforms.filter((p: any) => p.status !== "setup").length,
        pendingApproval: pending,
        published,
        platforms: platforms.map((p: any) => ({
          platform: p.platform,
          status: p.status,
          generated: p.contentStatus?.generated ?? 0,
          published: p.contentStatus?.published ?? 0,
        })),
        aiCostThisMonth: (contentTotal || scheduled) * 0.001,
      });
      setLoadError(null);
    } catch (err: any) {
      console.error("[dashboard] loadStats error:", err.message);
      setLoadError(err.message ?? "Failed to load dashboard data");
    } finally {
      setStatsLoading(false);
    }
  }

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-muted border-t-foreground animate-spin" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
          <p className="text-xs text-muted-foreground/50">
            {isLoading ? "Checking session..." : "User not loaded"}
          </p>
        </div>
      </div>
    );
  }

  if (loadError && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <span className="text-destructive text-lg">!</span>
          </div>
          <p className="text-sm text-muted-foreground">Failed to load dashboard data</p>
          <p className="text-xs text-muted-foreground/50 font-mono">{loadError}</p>
          <button onClick={() => { setLoadError(null); setStatsLoading(true); loadStats(); }} className="text-xs text-foreground/60 hover:text-foreground underline">Retry</button>
        </div>
      </div>
    );
  }

  const s = stats;

  const statValues: Record<string, { value: string | number; loading: boolean }> = {
    contentGenerated: { value: s?.contentGenerated ?? 0, loading: statsLoading },
    pendingApproval: { value: s?.pendingApproval ?? 0, loading: statsLoading },
    published: { value: s?.published ?? 0, loading: statsLoading },
    aiCost: { value: `$${(s?.aiCostThisMonth ?? 0).toFixed(3)}`, loading: statsLoading },
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Dashboard
          </p>
          <h1 className="text-[32px] md:text-[42px] font-semibold tracking-tight leading-tight">
            Welcome back, {user.name.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground mt-1.5 text-[15px]">
            Your AI-powered social media command center
          </p>
        </div>
        <Button
          onClick={() => router.push("/generate")}
          className="shrink-0 rounded-full bg-foreground hover:bg-foreground/90 text-background h-11 px-6 text-sm font-medium"
        >
          <Plus className="h-4 w-4 mr-1.5" /> Generate Content
        </Button>
      </div>

      {/* Stats grid — 4 pastel cards */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
        {STAT_CARDS.map((card) => (
          <div
            key={card.key}
            className={`${card.bg} rounded-[24px] p-6 hover-lift transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {card.label}
              </span>
              <card.icon className="h-4 w-4 opacity-50" />
            </div>
            <div className="text-[36px] font-semibold tracking-tight leading-none">
              {statValues[card.key]?.loading ? "—" : statValues[card.key]?.value}
            </div>
            {card.key === "pendingApproval" && (s?.pendingApproval ?? 0) > 0 && (
              <button
                onClick={() => router.push("/queue")}
                className="text-xs font-medium underline underline-offset-2 hover:opacity-70 transition-opacity mt-2 inline-block"
              >
                Review in queue →
              </button>
            )}
            {card.key === "aiCost" && (
              <p className="text-xs text-muted-foreground mt-2">~$0.001 per post (DeepSeek V4)</p>
            )}
          </div>
        ))}
      </div>

      {/* Pending approval banner */}
      {(s?.pendingApproval ?? 0) > 0 && (
        <div className="bg-yellow rounded-[24px] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-sm">
              {s?.pendingApproval} piece{(s?.pendingApproval ?? 0) !== 1 ? "s" : ""} of content waiting
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review and approve to publish to your platforms
            </p>
          </div>
          <Button
            onClick={() => router.push("/queue")}
            className="shrink-0 rounded-full bg-foreground hover:bg-foreground/90 text-background h-10 px-5 text-sm"
          >
            Review Now <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </Button>
        </div>
      )}

      {/* Content tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted/40 p-1 rounded-2xl gap-0 inline-flex">
          <TabsTrigger
            value="overview"
            className="rounded-xl text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground px-5 py-2 transition-all"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="platforms"
            className="rounded-xl text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground px-5 py-2 transition-all"
          >
            Platforms
          </TabsTrigger>
          <TabsTrigger
            value="ai-usage"
            className="rounded-xl text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground px-5 py-2 transition-all"
          >
            AI Stack
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-5">
          <div className="grid gap-5 grid-cols-1 lg:grid-cols-2">
            {/* Getting Started */}
            <div className="bg-blue rounded-[24px] p-8">
              <h3 className="text-2xl font-semibold tracking-tight mb-1">Getting Started</h3>
              <p className="text-sm text-muted-foreground mb-7">Follow these steps to launch your automation</p>
              <ol className="space-y-4">
                {[
                  { label: "Complete onboarding", sub: "Tell us about your business and niche", done: !!onboardingComplete },
                  { label: "Generate content", sub: "AI creates scroll-stopping posts from trending topics", done: (s?.contentGenerated ?? 0) > 0 },
                  { label: "Review in queue", sub: "Approve what looks good, reject the rest", done: (s?.published ?? 0) > 0 },
                  { label: "Check trends", sub: "See what's trending in your niche", done: false },
                  { label: "Monitor analytics", sub: "Track performance and AI cost savings", done: false },
                ].map((item, i) => (
                  <li key={i} className={`flex items-start gap-3 text-sm ${item.done ? "opacity-50" : ""}`}>
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold shrink-0 mt-0.5 ${
                        item.done ? "bg-foreground/10 text-foreground/60" : "bg-foreground text-background"
                      }`}
                    >
                      {item.done ? <CheckCircle className="w-3 h-3" /> : i + 1}
                    </span>
                    <span>
                      <strong>{item.label}</strong> — {item.sub}
                      {item.done && (
                        <span className="block text-[11px] text-muted-foreground/50 mt-0.5">Done</span>
                      )}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Quick Actions */}
            <div className="bg-lavender rounded-[24px] p-8">
              <h3 className="text-2xl font-semibold tracking-tight mb-1">Quick Actions</h3>
              <p className="text-sm text-muted-foreground mb-7">Jump to what matters most</p>
              <div className="space-y-3">
                {[
                  { label: "Generate new content", sub: "Pick platforms, AI does the rest", href: "/generate", icon: Sparkles },
                  { label: "Browse trending topics", sub: "See what's hot in your niche", href: "/trends", icon: TrendingUp },
                  { label: "Review content queue", sub: "Approve and schedule posts", href: "/queue", icon: CheckCircle },
                  { label: "View content calendar", sub: "See your publishing schedule", href: "/calendar", icon: CalendarDays },
                ].map((action, i) => (
                  <button
                    key={i}
                    onClick={() => router.push(action.href)}
                    className="w-full flex items-start gap-4 p-4 rounded-2xl bg-white/60 hover:bg-white/80 transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center shrink-0">
                      <action.icon className="h-4 w-4 text-foreground/60" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{action.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{action.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="platforms">
          <div className="bg-mint rounded-[24px] p-8">
            <h3 className="text-2xl font-semibold tracking-tight mb-1">Platform Activity</h3>
            <p className="text-sm text-muted-foreground mb-7">Content generated and published per platform</p>
            {!s || s.platforms.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-muted-foreground mb-4">No platforms set up yet.</p>
                <Button
                  onClick={() => router.push("/generate")}
                  className="rounded-full bg-foreground text-background h-10 px-5 text-sm"
                >
                  Set up a platform →
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {s.platforms.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white/60"
                  >
                    <div>
                      <p className="font-medium text-sm capitalize">{p.platform}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 capitalize">{p.status}</p>
                    </div>
                    <div className="flex gap-8 text-right">
                      <div>
                        <p className="text-lg font-semibold">{p.generated}</p>
                        <p className="text-[11px] text-muted-foreground">generated</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold">{p.published}</p>
                        <p className="text-[11px] text-muted-foreground">published</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="ai-usage">
          <div className="bg-pink rounded-[24px] p-8">
            <h3 className="text-2xl font-semibold tracking-tight mb-1">Powered by AI</h3>
            <p className="text-sm text-muted-foreground mb-7">Your automation stack</p>
            <div className="space-y-3">
              {[
                { name: "DeepSeek V4", sub: "Content generation — ~$0.001/post", icon: Zap, env: "DEEPSEEK_API_KEY" },
                { name: "FLUX via Fal.ai", sub: "Image generation for carousels & thumbnails", icon: ImageIcon, env: "FAL_KEY" },
                { name: "Seedance 2.0 / Kling", sub: "Video generation via OpenMontage pipeline", icon: Share2, env: "FAL_KEY (video)" },
                { name: "Agent-Reach", sub: "Trend detection — Reddit, YouTube, web search", icon: TrendingUp, env: "Zero-config (Python CLI)" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-white/60"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center shrink-0">
                    <item.icon className="h-5 w-5 text-foreground/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>
                  </div>
                  <code className="text-[10px] text-muted-foreground/40 bg-white/60 px-2.5 py-1 rounded-lg border border-white/80 self-center shrink-0">
                    {item.env}
                  </code>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Sparkles({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.912 5.813a2 2 0 001.272 1.272L21 12l-5.816 1.916a2 2 0 00-1.272 1.272L12 21l-1.912-5.812a2 2 0 00-1.272-1.272L3 12l5.816-1.916a2 2 0 001.272-1.272L12 3z" />
    </svg>
  );
}
