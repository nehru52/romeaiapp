"use client";
/**
 * /trends — Trending Topics Feed
 * Redesigned with pastel palette.
 */
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { TrendingUp, RefreshCw, Loader2, Zap, ArrowUpRight, Filter } from "lucide-react";
import { toast } from "sonner";

interface TrendSignal {
  topic: string;
  platform: string;
  strength: number;
  source: string;
  detectedAt: string;
  isRising: boolean;
  estimatedReach: number;
}

interface TrendReport {
  niche: string;
  generatedAt: string;
  signals: TrendSignal[];
  topTopics: string[];
  platformBreakdown: Record<string, number>;
  averageStrength: number;
  recommendation: string;
}

const NICHES = [
  "fitness", "travel", "restaurant", "real-estate",
  "dental", "lifestyle", "business", "fashion", "tech", "general",
];

const STRENGTH_LABEL = (s: number) =>
  s >= 0.8 ? "Hot" : s >= 0.6 ? "Rising" : s >= 0.4 ? "Steady" : "Emerging";

const PLATFORM_COLORS: Record<string, string> = {
  reddit: "#FF4500",
  youtube: "#FF0000",
  web: "#6366F1",
  instagram: "#E1306C",
  twitter: "#1D9BF0",
  rss: "#F59E0B",
};

export default function TrendsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [report, setReport] = useState<TrendReport | null>(null);
  const [fetching, setFetching] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [selectedNiche, setSelectedNiche] = useState("general");
  const [platformFilter, setPlatformFilter] = useState("all");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/login");
  }, [isLoading, isAuthenticated, router]);

  const fetchTrends = useCallback(async (niche = selectedNiche) => {
    setFetching(true);
    setReport(null);
    try {
      const params = new URLSearchParams({ niche, max: "12" });
      const res = await fetch(`/api/trends?${params}`);
      const data = await res.json();
      if (data.success) {
        setReport(data.data);
      } else {
        toast.error("Could not load trends — check Agent-Reach setup");
      }
    } catch {
      toast.error("Network error loading trends");
    } finally {
      setFetching(false);
    }
  }, [selectedNiche]);

  useEffect(() => {
    if (isAuthenticated && user) fetchTrends();
  }, [isAuthenticated, user]); // eslint-disable-line

  const handleNicheChange = (niche: string) => {
    setSelectedNiche(niche);
    fetchTrends(niche);
  };

  const generateFromTopic = async (topic: string) => {
    if (!user) return;
    setGenerating(topic);
    try {
      const tenantId = sessionStorage.getItem(`tenant_${user.userId}`) ?? `tenant_${user.userId}`;
      const res = await fetch("/api/trends/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.userId,
          tenantId,
          platform: "instagram",
          topic,
          contentType: "carousel",
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Content generated — check your queue");
        router.push("/queue");
      } else {
        toast.error(data.error ?? "Generation failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setGenerating(null);
    }
  };

  const visibleSignals = (report?.signals ?? []).filter(s =>
    platformFilter === "all" || s.platform === platformFilter
  );

  const platforms = [...new Set((report?.signals ?? []).map(s => s.platform))];

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Trends</p>
          <h1 className="text-[32px] md:text-[42px] font-semibold tracking-tight leading-tight">
            Trending Topics
          </h1>
          <p className="text-muted-foreground mt-1.5 text-[15px]">
            Live signals from Reddit, YouTube, and web — powered by Agent-Reach
          </p>
        </div>
        <Button variant="outline" onClick={() => fetchTrends()} disabled={fetching}
          className="rounded-full border-black/10 h-10 px-5 text-sm">
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${fetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Niche selector */}
      <div className="flex flex-wrap gap-2">
        {NICHES.map(n => (
          <button key={n} onClick={() => handleNicheChange(n)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all capitalize ${
              selectedNiche === n
                ? "bg-foreground text-background border-foreground"
                : "bg-white/60 border-black/5 text-muted-foreground hover:border-black/20 hover:text-foreground"
            }`}>
            {n}
          </button>
        ))}
      </div>

      {/* Top topics quick-generate */}
      {report?.topTopics && report.topTopics.length > 0 && (
        <div className="bg-blue rounded-[24px] p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 opacity-50" />
            <span className="text-sm font-semibold">Top trending right now</span>
            <span className="ml-auto text-[10px] text-muted-foreground/40">
              {report.generatedAt ? new Date(report.generatedAt).toLocaleTimeString() : ""}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {report.topTopics.slice(0, 6).map(topic => (
              <button key={topic}
                onClick={() => generateFromTopic(topic)}
                disabled={generating === topic}
                className="group flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white/70 hover:bg-white transition-all text-sm">
                {generating === topic
                  ? <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                  : <Zap className="h-3 w-3 text-muted-foreground/40 group-hover:text-foreground transition-colors" />}
                <span className="text-xs font-medium">{topic}</span>
              </button>
            ))}
          </div>
          {report.recommendation && (
            <p className="text-xs text-muted-foreground/60 mt-5 pt-5 border-t border-black/5">
              {report.recommendation}
            </p>
          )}
        </div>
      )}

      {/* Platform filter */}
      {platforms.length > 1 && (
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground/40" />
          <div className="flex gap-1">
            <button onClick={() => setPlatformFilter("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                platformFilter === "all" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              }`}>all</button>
            {platforms.map(p => (
              <button key={p} onClick={() => setPlatformFilter(p)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${
                  platformFilter === p ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                }`}>
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Signals */}
      {fetching ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            Scanning Reddit, YouTube, and web for trending {selectedNiche} topics...
          </p>
        </div>
      ) : visibleSignals.length === 0 ? (
        <div className="bg-muted/30 rounded-[24px] py-20 text-center">
          <p className="text-muted-foreground text-sm">
            No trend signals yet for <strong>{selectedNiche}</strong>.
          </p>
          <p className="text-xs text-muted-foreground/50 mt-1">
            Make sure <code className="bg-foreground/5 px-1 rounded">AGENT_REACH_PYTHON</code> is set correctly
          </p>
          <Button onClick={() => fetchTrends()} variant="outline"
            className="mt-4 rounded-full border-black/10 text-sm">
            Retry
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleSignals.map((signal, i) => (
            <div key={`${signal.topic}-${i}`}
              className="bg-white/50 rounded-[24px] p-5 hover:bg-white/80 transition-all group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[11px] font-semibold capitalize px-2 py-0.5 rounded-full bg-white/70"
                      style={{ color: PLATFORM_COLORS[signal.platform] ?? "#888" }}>
                      {signal.platform}
                    </span>
                    {signal.isRising && (
                      <span className="text-[10px] text-muted-foreground/50 flex items-center gap-0.5">
                        <ArrowUpRight className="h-3 w-3" /> rising
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground/40 ml-auto">
                      {STRENGTH_LABEL(signal.strength)}
                    </span>
                  </div>
                  <h3 className="font-medium text-sm leading-snug">{signal.topic}</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="flex-1 h-1.5 bg-foreground/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-foreground/20 transition-all duration-500"
                          style={{ width: `${Math.round(signal.strength * 100)}%` }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground/40 w-8">
                        {Math.round(signal.strength * 100)}%
                      </span>
                    </div>
                    {signal.estimatedReach > 0 && (
                      <span className="text-[10px] text-muted-foreground/40">
                        ~{signal.estimatedReach >= 1000
                          ? `${(signal.estimatedReach / 1000).toFixed(0)}k`
                          : signal.estimatedReach} reach
                      </span>
                    )}
                  </div>
                </div>

                <Button size="sm"
                  onClick={() => generateFromTopic(signal.topic)}
                  disabled={generating === signal.topic}
                  className="shrink-0 rounded-full bg-foreground hover:bg-foreground/90 text-background h-8 px-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  {generating === signal.topic
                    ? <Loader2 className="h-3 w-3 animate-spin" />
                    : <><Zap className="h-3 w-3 mr-1" />Generate</>}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Platform breakdown */}
      {report?.platformBreakdown && Object.keys(report.platformBreakdown).length > 0 && (
        <div className="bg-lavender rounded-[24px] p-6">
          <p className="text-sm font-semibold mb-4">Signal sources</p>
          <div className="flex flex-wrap gap-3">
            {Object.entries(report.platformBreakdown).map(([platform, count]) => (
              <div key={platform} className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full"
                  style={{ background: PLATFORM_COLORS[platform] ?? "#888" }} />
                <span className="capitalize text-muted-foreground">{platform}</span>
                <span className="font-semibold text-xs">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
