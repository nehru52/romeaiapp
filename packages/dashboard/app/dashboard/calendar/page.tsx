"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getContent } from "@/lib/api";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const platformIcons: Record<string, string> = {
  instagram: "📷",
  tiktok: "🎵",
  pinterest: "📌",
  youtube: "▶️",
  linkedin: "💼",
  facebook: "👥",
};
const statusColors: Record<string, string> = {
  draft: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  ai_generated:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  pending_approval:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  approved:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  published: "bg-muted text-muted-foreground",
};

interface Post {
  title: string;
  platform: string;
  type: string;
  status: string;
  id?: string;
}

const FALLBACK_POSTS: Record<string, Post[]> = {
  "2026-06-23": [
    {
      title: "Why morning tours are overrated",
      platform: "instagram",
      type: "carousel",
      status: "approved",
    },
    {
      title: "POV: Golden hour walk",
      platform: "tiktok",
      type: "reel",
      status: "scheduled",
    },
  ],
  "2026-06-24": [
    {
      title: "5 packing mistakes",
      platform: "instagram",
      type: "reel",
      status: "draft",
    },
    {
      title: "The pasta dish everyone asks for",
      platform: "pinterest",
      type: "pin",
      status: "scheduled",
    },
  ],
  "2026-06-25": [
    {
      title: "Client smile transformation",
      platform: "instagram",
      type: "carousel",
      status: "approved",
    },
    {
      title: "New listing walkthrough",
      platform: "youtube",
      type: "shorts",
      status: "scheduled",
    },
    {
      title: "How we stage a home",
      platform: "tiktok",
      type: "reel",
      status: "draft",
    },
  ],
  "2026-06-26": [
    {
      title: "Veneers vs Whitening",
      platform: "instagram",
      type: "carousel",
      status: "scheduled",
    },
    {
      title: "Open house Sunday 2-4pm",
      platform: "facebook",
      type: "feed_post",
      status: "approved",
    },
  ],
  "2026-06-27": [
    {
      title: "Weekend Rome itinerary",
      platform: "instagram",
      type: "reel",
      status: "draft",
    },
  ],
  "2026-06-28": [
    {
      title: "Client testimonial",
      platform: "linkedin",
      type: "feed_post",
      status: "draft",
    },
    {
      title: "Summer menu launch",
      platform: "instagram",
      type: "story",
      status: "scheduled",
    },
  ],
};

export default function CalendarPage() {
  const router = useRouter();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [selected, setSelected] = useState<string | null>(null);
  const [postsMap, setPostsMap] =
    useState<Record<string, Post[]>>(FALLBACK_POSTS);

  useEffect(() => {
    const tenantId = localStorage.getItem("tenantId") ?? "demo";
    getContent(tenantId)
      .then((r) => {
        if (r?.success && r.data && r.data.length > 0) {
          const map: Record<string, Post[]> = {};
          for (const c of r.data as any[]) {
            const dateRaw = c.scheduledAt ?? c.createdAt;
            if (!dateRaw) continue;
            const d = new Date(dateRaw);
            if (Number.isNaN(d.getTime())) continue;
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
            if (!map[key]) map[key] = [];
            map[key].push({
              title: c.title ?? "Untitled",
              platform: c.platform ?? "instagram",
              type: c.type ?? "post",
              status: c.status ?? "draft",
              id: c.id,
            });
          }
          if (Object.keys(map).length > 0) setPostsMap(map);
        }
      })
      .catch(() => {}); // keep fallback
  }, []);

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();
  const todayStr = new Date().toISOString().split("T")[0];
  const selectedPosts = selected ? (postsMap[selected] ?? []) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-px bg-foreground/20" />
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
              Schedule
            </span>
          </div>
          <h1 className="font-display text-3xl tracking-tight">
            Content Calendar
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            All your posts across every platform, in one view.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (month === 0) {
                setMonth(11);
                setYear((y) => y - 1);
              } else setMonth((m) => m - 1);
            }}
          >
            ←
          </Button>
          <span className="text-sm font-semibold min-w-[120px] text-center">
            {MONTHS[month]} {year}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (month === 11) {
                setMonth(0);
                setYear((y) => y + 1);
              } else setMonth((m) => m + 1);
            }}
          >
            →
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden text-sm">
        {DAYS.map((d) => (
          <div
            key={d}
            className="bg-card p-2 text-center font-medium text-muted-foreground"
          >
            {d}
          </div>
        ))}
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`e-${i}`} className="bg-card p-2 min-h-[80px]" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const ds = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const posts = postsMap[ds] ?? [];
          const isToday = ds === todayStr;
          return (
            <button
              key={day}
              type="button"
              onClick={() => setSelected(ds)}
              className={`bg-card p-1 min-h-[80px] text-left transition-colors hover:bg-muted/50 ${ds === selected ? "ring-2 ring-primary" : ""}`}
            >
              <span
                className={`inline-flex items-center justify-center w-6 h-6 text-xs rounded-full ${isToday ? "bg-foreground text-background font-bold" : "text-muted-foreground"}`}
              >
                {day}
              </span>
              {posts.slice(0, 2).map((p, pi) => (
                <div
                  key={pi}
                  className="flex items-center gap-1 px-0.5 mt-0.5 text-[10px] truncate"
                >
                  <span>{platformIcons[p.platform] ?? "📄"}</span>
                  <span className="truncate">{p.title}</span>
                </div>
              ))}
              {posts.length > 2 && (
                <div className="text-[10px] text-muted-foreground px-1">
                  +{posts.length - 2} more
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">
              {new Date(`${selected}T00:00:00`).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard/platform/instagram")}
            >
              + Add Post
            </Button>
          </div>
          {selectedPosts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No posts scheduled. Click "+ Add Post" to create one.
            </p>
          ) : (
            selectedPosts.map((p, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg border"
              >
                <span className="text-xl">
                  {platformIcons[p.platform] ?? "📄"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.title}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px]">
                      {p.platform}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {p.type}
                    </Badge>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded ${statusColors[p.status] ?? ""}`}
                    >
                      {p.status}
                    </span>
                  </div>
                </div>
                {p.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/dashboard/content/${p.id}`)}
                  >
                    Review →
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
