/**
 * SaaS Dashboard — social media automation overview.
 * Shows content stats, scheduled posts, connected platforms, and AI usage.
 */

"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CalendarDays, ImageIcon, MessageSquare, Plus, Share2, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, onboardingComplete } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-2">
            <span className="w-6 h-px bg-foreground/30" />
            Dashboard
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display tracking-tight">
            Welcome back, {user.name.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground mt-1">
            Your AI-powered social media command center.
          </p>
        </div>
        <Button
          onClick={() => router.push("/generate")}
          className="shrink-0 rounded-full bg-foreground hover:bg-foreground/90 text-background h-10 px-5"
        >
          <Plus className="h-4 w-4 mr-1.5" /> Generate Content
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
        <div className="bg-card border border-border/50 rounded-2xl p-6 hover-lift transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-xs text-muted-foreground">Content Generated</span>
            <MessageSquare className="h-4 w-4 text-brand-indigo/70" />
          </div>
          <div className="text-3xl lg:text-4xl font-display tracking-tight">0</div>
          <p className="text-xs text-muted-foreground/70 mt-1">Connect a platform to start generating</p>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-6 hover-lift transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-xs text-muted-foreground">Scheduled Posts</span>
            <CalendarDays className="h-4 w-4 text-brand-amber/70" />
          </div>
          <div className="text-3xl lg:text-4xl font-display tracking-tight">0</div>
          <p className="text-xs text-muted-foreground/70 mt-1">No posts scheduled yet</p>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-6 hover-lift transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-xs text-muted-foreground">Platforms Connected</span>
            <Share2 className="h-4 w-4 text-brand-emerald/70" />
          </div>
          <div className="text-3xl lg:text-4xl font-display tracking-tight">0</div>
          <p className="text-xs text-muted-foreground/70 mt-1">Set up your first platform</p>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="bg-muted/50 p-1 rounded-xl gap-0">
            <TabsTrigger value="overview" className="rounded-lg text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground px-4 py-1.5 transition-all">Overview</TabsTrigger>
            <TabsTrigger value="platforms" className="rounded-lg text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground px-4 py-1.5 transition-all">Platforms</TabsTrigger>
            <TabsTrigger value="ai-usage" className="rounded-lg text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground px-4 py-1.5 transition-all">AI Usage</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <div className="bg-card border border-border/50 rounded-2xl p-8">
              <h3 className="font-display text-2xl mb-1">Getting Started</h3>
              <p className="text-sm text-muted-foreground mb-6">Follow these steps to launch your automation</p>
              <ol className="space-y-4 text-sm">
                <li className={`flex items-start gap-3 ${onboardingComplete ? "opacity-50" : ""}`}>
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shrink-0 mt-0.5 ${
                    onboardingComplete
                      ? "bg-foreground/10 text-foreground/60"
                      : "bg-foreground text-background"
                  }`}>
                    {onboardingComplete ? (
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : "1"}
                  </span>
                  <span>
                    <strong className="text-foreground">Complete onboarding</strong>
                    {" "}— tell us about your business and niche
                    {onboardingComplete && <span className="block text-[11px] text-muted-foreground/60 mt-0.5 font-mono">Done</span>}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background text-xs font-bold shrink-0 mt-0.5">2</span>
                  <span><strong className="text-foreground">Connect a platform</strong> — Instagram, TikTok, or any social channel</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background text-xs font-bold shrink-0 mt-0.5">3</span>
                  <span><strong className="text-foreground">Set your schedule</strong> — choose how many posts per day</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background text-xs font-bold shrink-0 mt-0.5">4</span>
                  <span><strong className="text-foreground">Generate content</strong> — AI creates scroll-stopping posts</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background text-xs font-bold shrink-0 mt-0.5">5</span>
                  <span><strong className="text-foreground">Approve & publish</strong> — review in Telegram or dashboard, then go live</span>
                </li>
              </ol>
            </div>

            <div className="bg-card border border-border/50 rounded-2xl p-8">
              <h3 className="font-display text-2xl mb-1">Powered by AI</h3>
              <p className="text-sm text-muted-foreground mb-6">Your automation stack</p>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-foreground/[0.02] border border-border/30">
                  <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center shrink-0">
                    <Zap className="h-5 w-5 text-foreground/70" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">Viral Content Engine</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Reverse-engineers top-performing content in your niche</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-foreground/[0.02] border border-border/30">
                  <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center shrink-0">
                    <TrendingUp className="h-5 w-5 text-foreground/70" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">Trend Detection</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Identifies rising hashtags and content patterns</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-foreground/[0.02] border border-border/30">
                  <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center shrink-0">
                    <ImageIcon className="h-5 w-5 text-foreground/70" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">AI Image Generation</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Photorealistic images via FLUX, optimized per platform</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="platforms">
          <div className="bg-card border border-border/50 rounded-2xl p-8">
            <h3 className="font-display text-2xl mb-1">Connected Platforms</h3>
            <p className="text-sm text-muted-foreground mb-6">Instagram, TikTok, Pinterest, and more</p>
            <p className="text-sm text-muted-foreground">
              No platforms connected yet. Generate content via the API endpoint{" "}
              <code className="text-xs bg-foreground/5 px-1.5 py-0.5 rounded font-mono border border-border/30">POST /api/content/generate</code>{" "}
              and your content will appear here.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="ai-usage">
          <div className="bg-card border border-border/50 rounded-2xl p-8">
            <h3 className="font-display text-2xl mb-1">AI Usage</h3>
            <p className="text-sm text-muted-foreground mb-6">Token usage and cost estimates</p>
            <p className="text-sm text-muted-foreground">
              AI usage tracking will appear here once you start generating content.
              Set <code className="text-xs bg-foreground/5 px-1.5 py-0.5 rounded font-mono border border-border/30">OPENAI_API_KEY</code>{" "}
              to enable DeepSeek-powered content generation (~$0.001 per post).
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
