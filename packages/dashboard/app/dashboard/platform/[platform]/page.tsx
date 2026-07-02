"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateContent, setupPlatform } from "@/lib/api";

const API_KEY_LABELS: Record<string, string> = {
  instagram: "Instagram Graph API Access Token",
  tiktok: "TikTok API Access Token",
  pinterest: "Pinterest Access Token",
  youtube: "YouTube Data API Key",
  linkedin: "LinkedIn OAuth 2.0 Access Token",
  facebook: "Facebook Graph API Access Token",
};

// ── Real platform content type data (sourced from Meta, TikTok, Pinterest, YouTube, LinkedIn official docs) ──

const PLATFORM_DATA: Record<
  string,
  {
    name: string;
    emoji: string;
    contentTypes: {
      id: string;
      label: string;
      icon: string;
      description: string;
      bestFor: string;
      engagement: string;
    }[];
    bestTimes: string;
    tip: string;
  }
> = {
  instagram: {
    name: "Instagram",
    emoji: "📷",
    bestTimes: "Tue–Thu 11am–1pm, 7–9pm",
    tip: "Reels get 2x more reach than static posts. Carousels have the highest save rate — ideal for itineraries and guides.",
    contentTypes: [
      {
        id: "reel",
        label: "Reels",
        icon: "🎬",
        description: "15–90 second vertical videos with music/audio",
        bestFor: "Discovery, viral reach, POV content",
        engagement: "⭐⭐⭐⭐⭐ Highest reach",
      },
      {
        id: "carousel",
        label: "Carousels",
        icon: "🖼️",
        description: "2–10 swipeable slides with images or videos",
        bestFor: "Itineraries, tips, guides, storytelling",
        engagement: "⭐⭐⭐⭐ Highest saves",
      },
      {
        id: "story",
        label: "Stories",
        icon: "⏳",
        description: "24-hour disappearing vertical content",
        bestFor: "Behind-the-scenes, polls, daily updates",
        engagement: "⭐⭐⭐ Daily touchpoints",
      },
      {
        id: "feed_post",
        label: "Feed Posts",
        icon: "📸",
        description: "Single image or video in the main feed",
        bestFor: "Brand aesthetic, announcements, UGC",
        engagement: "⭐⭐ Baseline",
      },
    ],
  },
  tiktok: {
    name: "TikTok",
    emoji: "🎵",
    bestTimes: "Tue/Thu 2–5pm, Fri 7–9pm",
    tip: "First 3 seconds determine retention. Use trending sounds — videos with trending audio get 2.5x more views.",
    contentTypes: [
      {
        id: "short_video",
        label: "Short Videos",
        icon: "⚡",
        description: "15–60 second vertical videos",
        bestFor: "Trend jacking, POV, quick tips, hooks",
        engagement: "⭐⭐⭐⭐⭐ Viral potential",
      },
      {
        id: "long_video",
        label: "Long Videos",
        icon: "🎥",
        description: "1–10 minute vertical content",
        bestFor: "Deep dives, storytelling, tutorials",
        engagement: "⭐⭐⭐⭐ Higher watch time",
      },
      {
        id: "image_carousel",
        label: "Photo Mode",
        icon: "🖼️",
        description: "Swipeable image carousels with music",
        bestFor: "Photo dumps, before/after, galleries",
        engagement: "⭐⭐⭐ Niche format",
      },
      {
        id: "live",
        label: "TikTok LIVE",
        icon: "🔴",
        description: "Real-time streaming to followers",
        bestFor: "Q&A, tours, exclusive moments",
        engagement: "⭐⭐⭐⭐ Real-time engagement",
      },
    ],
  },
  pinterest: {
    name: "Pinterest",
    emoji: "📌",
    bestTimes: "Evenings 7–11pm (planners save for later)",
    tip: "Vertical 2:3 ratio pins perform best. Rich Pins drive 2x more clicks. SEO descriptions are critical — Pinterest is a search engine.",
    contentTypes: [
      {
        id: "standard_pin",
        label: "Standard Pins",
        icon: "📌",
        description: "Static vertical image with link",
        bestFor: "Blog posts, products, itineraries",
        engagement: "⭐⭐⭐⭐ Evergreen traffic",
      },
      {
        id: "video_pin",
        label: "Video Pins",
        icon: "🎬",
        description: "4 sec–15 min vertical video",
        bestFor: "Recipe demos, tours, how-to guides",
        engagement: "⭐⭐⭐⭐⭐ Higher engagement",
      },
      {
        id: "idea_pin",
        label: "Idea Pins",
        icon: "✨",
        description: "Multi-page video/image stories",
        bestFor: "Step-by-step guides, collections",
        engagement: "⭐⭐⭐⭐ Story format",
      },
      {
        id: "rich_pin",
        label: "Rich Pins",
        icon: "🔗",
        description: "Auto-updating pins from your website",
        bestFor: "Product listings, recipes, articles",
        engagement: "⭐⭐⭐ Always up-to-date",
      },
    ],
  },
  youtube: {
    name: "YouTube",
    emoji: "▶️",
    bestTimes: "Thu–Fri 2–4pm",
    tip: "Thumbnail is 80% of click-through rate. First 30 seconds must deliver on the title promise. SEO-optimized titles with the year rank higher.",
    contentTypes: [
      {
        id: "shorts",
        label: "Shorts",
        icon: "⚡",
        description: "15–60 second vertical videos",
        bestFor: "Quick tips, highlights, trend jacking",
        engagement: "⭐⭐⭐⭐⭐ Massive reach",
      },
      {
        id: "long_form",
        label: "Long-Form",
        icon: "🎥",
        description: "8–20 minute horizontal videos",
        bestFor: "Travel guides, deep dives, vlogs",
        engagement: "⭐⭐⭐⭐ Highest monetization",
      },
      {
        id: "community",
        label: "Community Posts",
        icon: "💬",
        description: "Text/image/poll posts to subscribers",
        bestFor: "Polls, updates, behind-the-scenes",
        engagement: "⭐⭐⭐ Subscriber engagement",
      },
      {
        id: "live",
        label: "YouTube LIVE",
        icon: "🔴",
        description: "Real-time streaming",
        bestFor: "Virtual tours, Q&A, events",
        engagement: "⭐⭐⭐⭐ Real-time + replay",
      },
    ],
  },
  linkedin: {
    name: "LinkedIn",
    emoji: "💼",
    bestTimes: "Tue–Thu 7–8am, 12pm",
    tip: "B2B corporate travel focus. Case studies and industry insights perform best. Tag relevant tourism boards for amplification.",
    contentTypes: [
      {
        id: "feed_post",
        label: "Feed Posts",
        icon: "📝",
        description: "Text + image/document/video post",
        bestFor: "Case studies, insights, announcements",
        engagement: "⭐⭐⭐⭐ Professional audience",
      },
      {
        id: "article",
        label: "Articles",
        icon: "📄",
        description: "Long-form published articles on LinkedIn",
        bestFor: "Thought leadership, travel guides",
        engagement: "⭐⭐⭐⭐⭐ Authority building",
      },
      {
        id: "carousel",
        label: "Carousel PDFs",
        icon: "📑",
        description: "Swipeable PDF document posts",
        bestFor: "Itineraries, checklists, reports",
        engagement: "⭐⭐⭐⭐ High saves",
      },
      {
        id: "video",
        label: "LinkedIn Video",
        icon: "🎬",
        description: "Native or embedded video posts",
        bestFor: "Event highlights, team stories",
        engagement: "⭐⭐⭐ Niche but effective",
      },
    ],
  },
  facebook: {
    name: "Facebook",
    emoji: "👥",
    bestTimes: "Tue–Fri 9am–1pm",
    tip: "Native video outperforms shared links. Facebook Groups with 'Italy Travel Tips' engagement drive subtle agency mentions. Minimal hashtags.",
    contentTypes: [
      {
        id: "reel",
        label: "Facebook Reels",
        icon: "🎬",
        description: "15–90 second vertical videos",
        bestFor: "Discovery, reach, viral content",
        engagement: "⭐⭐⭐⭐ Wide reach",
      },
      {
        id: "feed_post",
        label: "Feed Posts",
        icon: "📸",
        description: "Image/video/text in the main feed",
        bestFor: "Updates, events, photo albums",
        engagement: "⭐⭐⭐ Core format",
      },
      {
        id: "story",
        label: "Stories",
        icon: "⏳",
        description: "24-hour disappearing content",
        bestFor: "Daily updates, polls, quick tips",
        engagement: "⭐⭐⭐ Daily engagement",
      },
      {
        id: "group_post",
        label: "Group Posts",
        icon: "👥",
        description: "Posts in niche Facebook Groups",
        bestFor: "Community building, subtle promotion",
        engagement: "⭐⭐⭐⭐ Targeted audience",
      },
    ],
  },
};

export default function PlatformPage() {
  const params = useParams();
  const router = useRouter();
  const platform = (params.platform as string) ?? "instagram";
  const data = PLATFORM_DATA[platform] ?? PLATFORM_DATA.instagram!;

  const [step, setStep] = useState(0);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [postsPerDay, setPostsPerDay] = useState(2);
  const [duration, setDuration] = useState<"1week" | "2weeks" | "1month">(
    "1week",
  );
  const [apiKey, setApiKey] = useState("");
  const [done, setDone] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);

  const days = duration === "1week" ? 7 : duration === "2weeks" ? 14 : 30;
  const totalPosts = postsPerDay * days;

  const toggleType = (id: string) => {
    setSelectedTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  const handleLaunch = async () => {
    setLaunching(true);
    setLaunchError(null);
    const userId = localStorage.getItem("userId") ?? "demo";
    const tenantId = localStorage.getItem("tenantId") ?? "demo-tenant";
    const today = new Date().toISOString().split("T")[0]!;

    try {
      const setupResult = await setupPlatform({
        userId,
        tenantId,
        platform,
        postsPerDay,
        duration,
        startDate: today,
        apiKey,
      });
      if (!setupResult?.success)
        throw new Error(setupResult?.error ?? "Platform setup failed");

      const contentResult = await generateContent({
        userId,
        tenantId,
        platform,
        count: postsPerDay,
      });
      if (!contentResult?.success)
        throw new Error(contentResult?.error ?? "Content generation failed");

      setDone(true);
    } catch (err: unknown) {
      setLaunchError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setLaunching(false);
    }
  };

  if (done) {
    return (
      <div className="mx-auto max-w-md py-20 text-center space-y-6">
        <span style={{ fontSize: 56 }}>🚀</span>
        <h1 className="font-display text-3xl font-semibold">
          Content Engine Launched!
        </h1>
        <div className="space-y-2 text-muted-foreground text-sm">
          <p>
            {totalPosts} posts queued for {data.emoji} {data.name}
          </p>
          <p>
            Formats:{" "}
            {selectedTypes
              .map((t) => data.contentTypes.find((c) => c.id === t)?.icon)
              .join(" ")}{" "}
            {selectedTypes
              .map((t) => data.contentTypes.find((c) => c.id === t)?.label)
              .join(", ")}
          </p>
          <p>
            {postsPerDay} posts/day × {days} days
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Dashboard
          </Button>
          <Button onClick={() => router.push("/dashboard/preferences")}>
            Set Notifications →
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/dashboard")}
      >
        ← Back
      </Button>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Step {step + 1} of 4</span>
        <span className="w-24 h-1 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-foreground transition-all"
            style={{ width: `${((step + 1) / 4) * 100}%` }}
          />
        </span>
      </div>

      {/* STEP 1: Content types */}
      {step === 0 && (
        <>
          <div>
            <h1 className="font-display text-2xl font-semibold">
              {data.emoji} What types of content for {data.name}?
            </h1>
            <p className="text-muted-foreground mt-1">
              Select the formats you want AI to generate. Pick at least one.
            </p>
          </div>
          <div className="grid gap-3">
            {data.contentTypes.map((ct) => {
              const active = selectedTypes.includes(ct.id);
              return (
                <button
                  key={ct.id}
                  type="button"
                  onClick={() => toggleType(ct.id)}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${
                    active
                      ? "border-foreground bg-foreground/5 shadow-sm"
                      : "border-foreground/10 hover:border-foreground/30"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-2xl mt-0.5">{ct.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-base">
                          {ct.label}
                        </span>
                        <Badge variant="secondary" className="text-[10px]">
                          {ct.engagement}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {ct.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Best for: {ct.bestFor}
                      </p>
                    </div>
                    <span
                      className={`text-lg shrink-0 ${active ? "text-foreground" : "text-muted-foreground/30"}`}
                    >
                      {active ? "✓" : "○"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          <Card className="border-amber-200 bg-amber-50/30 dark:bg-amber-950/10 dark:border-amber-800/30">
            <CardContent className="py-3 text-sm text-amber-800 dark:text-amber-200">
              💡 <strong>Pro tip:</strong> {data.tip}
            </CardContent>
          </Card>
          <Button
            className="w-full"
            disabled={selectedTypes.length === 0}
            onClick={() => setStep(1)}
          >
            Continue — {selectedTypes.length} format
            {selectedTypes.length !== 1 ? "s" : ""} selected →
          </Button>
        </>
      )}

      {/* STEP 2: Posts per day */}
      {step === 1 && (
        <>
          <div>
            <h1 className="font-display text-2xl font-semibold">
              How many posts per day?
            </h1>
            <p className="text-muted-foreground mt-1">
              {data.name} ·{" "}
              {selectedTypes
                .map((t) => data.contentTypes.find((c) => c.id === t)?.label)
                .join(", ")}
            </p>
          </div>
          <div className="flex gap-3 justify-center flex-wrap">
            {[1, 2, 3, 5, 7, 10].map((n) => (
              <Button
                key={n}
                variant={postsPerDay === n ? "default" : "outline"}
                className="h-16 w-16 text-xl font-bold rounded-xl"
                onClick={() => setPostsPerDay(n)}
              >
                {n}
              </Button>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            {postsPerDay} post{postsPerDay > 1 ? "s" : ""} per day
          </p>
          <Card className="border-amber-200 bg-amber-50/30 dark:bg-amber-950/10 dark:border-amber-800/30">
            <CardContent className="py-3 text-sm text-amber-800 dark:text-amber-200">
              ⏰ Best posting times on {data.name}:{" "}
              <strong>{data.bestTimes}</strong>
            </CardContent>
          </Card>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setStep(0)}
            >
              ← Back
            </Button>
            <Button className="flex-1" onClick={() => setStep(2)}>
              Continue →
            </Button>
          </div>
        </>
      )}

      {/* STEP 3: Duration */}
      {step === 2 && (
        <>
          <div>
            <h1 className="font-display text-2xl font-semibold">
              For how long?
            </h1>
            <p className="text-muted-foreground mt-1">
              {postsPerDay} posts/day × your selected duration
            </p>
          </div>
          <div className="space-y-3">
            {(["1week", "2weeks", "1month"] as const).map((d) => (
              <Card
                key={d}
                className={`cursor-pointer transition-all ${duration === d ? "border-primary ring-2 ring-primary/20" : "hover:border-foreground/30"}`}
                onClick={() => setDuration(d)}
              >
                <CardHeader className="flex flex-row justify-between items-center py-4">
                  <div>
                    <CardTitle className="text-lg">
                      {d === "1week"
                        ? "1 Week"
                        : d === "2weeks"
                          ? "2 Weeks"
                          : "1 Month"}
                    </CardTitle>
                    <CardDescription>
                      {d === "1week"
                        ? "Quick test run"
                        : d === "2weeks"
                          ? "Solid campaign"
                          : "Full content calendar"}
                    </CardDescription>
                  </div>
                  <span className="text-2xl font-bold tabular-nums">
                    {postsPerDay *
                      (d === "1week" ? 7 : d === "2weeks" ? 14 : 30)}
                  </span>
                </CardHeader>
              </Card>
            ))}
          </div>
          <div className="rounded-lg bg-muted p-4 text-center">
            <span className="text-sm text-muted-foreground">
              {postsPerDay} posts/day × {days} days =
            </span>{" "}
            <span className="text-2xl font-bold">{totalPosts}</span>{" "}
            <span className="text-sm text-muted-foreground">
              {data.name} posts
            </span>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setStep(1)}
            >
              ← Back
            </Button>
            <Button className="flex-1" onClick={() => setStep(3)}>
              Continue →
            </Button>
          </div>
        </>
      )}

      {/* STEP 4: API Key */}
      {step === 3 && (
        <>
          <div>
            <h1 className="font-display text-2xl font-semibold">
              Connect {data.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              Paste your API key. We never store it in plain text.
            </p>
          </div>
          <div className="rounded-lg bg-muted p-4 space-y-1 text-sm">
            <p>
              <strong>Summary</strong>
            </p>
            <p className="text-muted-foreground">
              {data.emoji} {data.name} ·{" "}
              {selectedTypes
                .map((t) => data.contentTypes.find((c) => c.id === t)?.label)
                .join(", ")}
            </p>
            <p className="text-muted-foreground">
              {postsPerDay} posts/day ·{" "}
              {duration === "1week"
                ? "1 Week"
                : duration === "2weeks"
                  ? "2 Weeks"
                  : "1 Month"}{" "}
              · <strong>{totalPosts} total</strong>
            </p>
          </div>
          <div className="space-y-2">
            <Label>
              {API_KEY_LABELS[platform] ?? `${data.name} API Key`}{" "}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              type="password"
              placeholder={
                API_KEY_LABELS[platform] ??
                "Paste your API key or access token..."
              }
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="h-12"
            />
          </div>
          {launchError && (
            <Card className="border-red-300 bg-red-50/50 dark:bg-red-950/10 dark:border-red-800/30">
              <CardContent className="py-3 text-sm text-red-700 dark:text-red-300">
                <strong>Setup failed:</strong> {launchError}
              </CardContent>
            </Card>
          )}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              disabled={launching}
              onClick={() => setStep(2)}
            >
              ← Back
            </Button>
            <Button
              className="flex-1"
              size="lg"
              disabled={apiKey.length < 4 || launching}
              onClick={handleLaunch}
            >
              {launching ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Launching...
                </span>
              ) : (
                "🚀 Launch Content Engine"
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
