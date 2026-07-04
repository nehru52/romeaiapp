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
    <div className="flex flex-col gap-6">
      {/* Welcome header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Welcome back, {user.name.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground">
            Your AI-powered social media command center.
          </p>
        </div>
        <Button onClick={() => router.push("/generate")} className="shrink-0">
          <Plus className="h-4 w-4 mr-1.5" /> Generate Content
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Content Generated</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Connect a platform to start generating</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Posts</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">No posts scheduled yet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platforms Connected</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Set up your first platform</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="platforms">Platforms</TabsTrigger>
            <TabsTrigger value="ai-usage">AI Usage</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
                <CardDescription>Follow these steps to launch your automation</CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3 text-sm text-muted-foreground">
                  <li className={`flex items-start gap-3 ${onboardingComplete ? "opacity-60" : ""}`}>
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold shrink-0 ${
                      onboardingComplete
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-primary text-primary-foreground"
                    }`}>
                      {onboardingComplete ? "✓" : "1"}
                    </span>
                    <span>
                      <strong className={`${onboardingComplete ? "text-emerald-400/80" : "text-foreground"}`}>Complete onboarding</strong>
                      {" "}— tell us about your business and niche
                      {onboardingComplete && <span className="block text-[11px] text-emerald-500/60 mt-0.5">✓ Done</span>}
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground shrink-0">2</span>
                    <span><strong className="text-foreground">Connect a platform</strong> — Instagram, TikTok, or any social channel</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground shrink-0">3</span>
                    <span><strong className="text-foreground">Set your schedule</strong> — choose how many posts per day</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground shrink-0">4</span>
                    <span><strong className="text-foreground">Generate content</strong> — AI creates scroll-stopping posts</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground shrink-0">5</span>
                    <span><strong className="text-foreground">Approve & publish</strong> — review in Telegram or dashboard, then go live</span>
                  </li>
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Powered by AI</CardTitle>
                <CardDescription>Your automation stack</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="font-medium text-foreground">Viral Content Engine</p>
                      <p className="text-muted-foreground">Reverse-engineers top-performing content in your niche</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium text-foreground">Trend Detection</p>
                      <p className="text-muted-foreground">Identifies rising hashtags and content patterns</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
                    <ImageIcon className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="font-medium text-foreground">AI Image Generation</p>
                      <p className="text-muted-foreground">Photorealistic images via FLUX, optimized per platform</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="platforms">
          <Card>
            <CardHeader>
              <CardTitle>Connected Platforms</CardTitle>
              <CardDescription>Instagram, TikTok, Pinterest, and more</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No platforms connected yet. Generate content via the API endpoint{" "}
                <code className="text-xs bg-accent px-1.5 py-0.5 rounded">POST /api/content/generate</code>{" "}
                and your content will appear here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-usage">
          <Card>
            <CardHeader>
              <CardTitle>AI Usage</CardTitle>
              <CardDescription>Token usage and cost estimates</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                AI usage tracking will appear here once you start generating content.
                Set <code className="text-xs bg-accent px-1.5 py-0.5 rounded">OPENAI_API_KEY</code>{" "}
                to enable DeepSeek-powered content generation (~$0.001 per post).
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
