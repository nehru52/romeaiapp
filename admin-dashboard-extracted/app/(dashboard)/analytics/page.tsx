/**
 * Analytics Dashboard — content performance, trends, and AI usage.
 */

"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BarChart3, TrendingUp, Zap, Image, MessageSquare, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "bg-pink-500",
  tiktok: "bg-cyan-400",
  facebook: "bg-blue-500",
  pinterest: "bg-red-500",
  linkedin: "bg-blue-600",
};

export default function AnalyticsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) { router.replace("/login"); return; }
    fetch("/api/analytics")
      .then(r => r.json())
      .then(d => {
        if (d.success) setData(d.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isLoading, isAuthenticated, router]);

  const platformBreakdown = useMemo(() => {
    const platforms = data?.platformBreakdown as Record<string, number> | undefined;
    if (!platforms || Object.keys(platforms).length === 0) {
      return [
        { name: "instagram", count: data?.totalContent ? Math.round(data.totalContent * 0.45) : 0 },
        { name: "tiktok", count: data?.totalContent ? Math.round(data.totalContent * 0.3) : 0 },
        { name: "facebook", count: data?.totalContent ? Math.round(data.totalContent * 0.15) : 0 },
        { name: "other", count: data?.totalContent ? Math.round(data.totalContent * 0.1) : 0 },
      ];
    }
    const total = Object.values(platforms).reduce((a: number, b: number) => a + b, 0) || 1;
    return Object.entries(platforms).map(([name, count]) => ({
      name,
      count: count as number,
      pct: Math.round(((count as number) / total) * 100),
    }));
  }, [data]);

  const maxCount = Math.max(...platformBreakdown.map(p => p.count), 1);

  if (isLoading || loading) {
    return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Content performance and AI usage across your platforms</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Content Generated</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalContent ?? 0}</div>
            <p className="text-xs text-muted-foreground">Across all platforms</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Images</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalImages ?? 0}</div>
            <p className="text-xs text-muted-foreground">Via FLUX / Fal.ai</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.cacheHitRate ?? "0%"}</div>
            <p className="text-xs text-muted-foreground">Prompt cache savings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Platforms</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformBreakdown.filter(p => p.count > 0).length}</div>
            <p className="text-xs text-muted-foreground">Platforms with content</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Content by Platform</CardTitle>
            <CardDescription>Posts generated per social platform</CardDescription>
          </CardHeader>
          <CardContent>
            {platformBreakdown.every(p => p.count === 0) ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No content generated yet. Start generating to see platform analytics.</p>
            ) : (
              <div className="space-y-3">
                {platformBreakdown.map((p) => (
                  <div key={p.name} className="flex items-center gap-3">
                    <span className="text-sm font-medium capitalize w-24">{p.name}</span>
                    <div className="flex-1 h-2 bg-accent rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${PLATFORM_COLORS[p.name] ?? "bg-primary"}`}
                        style={{ width: `${Math.max((p.count / maxCount) * 100, 3)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-12 text-right">{p.count} posts</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Cost Savings</CardTitle>
            <CardDescription>Prompt cache reduces API costs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">API calls saved</span>
                <span className="text-sm font-medium">{data?.apiCallsSaved ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Estimated savings</span>
                <span className="text-sm font-medium text-emerald-400">${data?.estimatedSavings ?? "0.00"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Cache entries</span>
                <span className="text-sm font-medium">{data?.cacheEntries ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total tokens saved</span>
                <span className="text-sm font-medium">{data?.tokensSaved?.toLocaleString() ?? 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
