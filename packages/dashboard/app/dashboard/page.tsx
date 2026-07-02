"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDashboard } from "@/lib/api";

const Icon = ({ emoji }: { emoji: string }) => (
  <span style={{ fontSize: 24 }}>{emoji}</span>
);

const platformIcons: Record<
  string,
  { emoji: string; name: string; color: string }
> = {
  instagram: { emoji: "📷", name: "Instagram", color: "text-pink-500" },
  tiktok: { emoji: "🎵", name: "TikTok", color: "text-cyan-400" },
  pinterest: { emoji: "📌", name: "Pinterest", color: "text-red-500" },
  youtube: { emoji: "▶️", name: "YouTube", color: "text-red-600" },
  linkedin: { emoji: "💼", name: "LinkedIn", color: "text-blue-600" },
  facebook: { emoji: "👥", name: "Facebook", color: "text-blue-500" },
};

export default function DashboardPage() {
  const [userName, setUserName] = useState("User");
  const [tenantName, setTenantName] = useState("Your Business");
  const [platforms, setPlatforms] = useState<any[]>([]);

  useEffect(() => {
    const userId = localStorage.getItem("userId") ?? "demo";
    const name = localStorage.getItem("userName");
    if (name) setUserName(name);

    getDashboard(userId)
      .then((r) => {
        if (r?.success && r.data) {
          setTenantName(r.data.tenants[0]?.name ?? "Your Business");
          setPlatforms(r.data.platforms || []);
        }
      })
      .catch(() => {});
  }, []);

  const connectedCount = platforms.filter((p) => p.status !== "setup").length;
  const totalPosts = platforms.reduce((sum, p) => sum + (p.totalPosts || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl tracking-tight mb-2">
          Welcome back, {userName}
        </h1>
        <p className="text-muted-foreground">{tenantName}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Connected Platforms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{connectedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active platforms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalPosts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Generated content
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/calendar">
              <Button variant="outline" className="w-full">
                View Schedule
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Content Library
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/content">
              <Button variant="outline" className="w-full">
                Browse Content
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Platforms Grid */}
      <div>
        <h2 className="font-display text-2xl tracking-tight mb-4">
          Your Platforms
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(platformIcons).map(([key, meta]) => {
            const platform = platforms.find((p) => p.platform === key);
            const isConnected = platform && platform.status !== "setup";

            return (
              <Link key={key} href={`/dashboard/platform/${key}`}>
                <Card className="cursor-pointer hover:border-primary/50 transition-all h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={meta.color}>
                        <Icon emoji={meta.emoji} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{meta.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {isConnected
                            ? `${platform.postsPerDay || 0} posts/day · ${platform.totalPosts || 0} total`
                            : "Click to setup"}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Badge variant={isConnected ? "default" : "secondary"}>
                      {isConnected ? "● Connected" : "○ Setup Required"}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
