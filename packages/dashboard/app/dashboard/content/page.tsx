"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getContent } from "@/lib/api";

interface ContentRow {
  id: string;
  title: string;
  platform: string;
  type: string;
  status: string;
  date: string;
  preview: string;
}

const FALLBACK_CONTENT: ContentRow[] = [
  {
    id: "c1",
    title: "Why morning tours are overrated",
    platform: "instagram",
    type: "carousel",
    status: "draft",
    date: "Jun 23, 2026",
    preview: "Most people book 8am tours. Here's why that's a mistake...",
  },
  {
    id: "c2",
    title: "POV: Walking through the restaurant at golden hour",
    platform: "tiktok",
    type: "reel",
    status: "draft",
    date: "Jun 23, 2026",
    preview: "You walk in. The smell hits you first. Fresh basil...",
  },
  {
    id: "c3",
    title: "5 packing mistakes first-timers make",
    platform: "instagram",
    type: "reel",
    status: "draft",
    date: "Jun 23, 2026",
    preview: "1. Overpacking shoes. 2. No power adapter...",
  },
  {
    id: "c4",
    title: "Before/After: Client smile transformation",
    platform: "instagram",
    type: "carousel",
    status: "approved",
    date: "Jun 22, 2026",
    preview: "Slide 1: The before. Slide 2: Two weeks later...",
  },
  {
    id: "c5",
    title: "New listing walkthrough — 3 bed, 2 bath",
    platform: "youtube",
    type: "shorts",
    status: "approved",
    date: "Jun 22, 2026",
    preview: "Walk through this stunning mid-century home...",
  },
  {
    id: "c6",
    title: "The pasta dish everyone asks for",
    platform: "pinterest",
    type: "pin",
    status: "scheduled",
    date: "Jun 21, 2026",
    preview: "Cacio e pepe. Three ingredients. Pure magic...",
  },
  {
    id: "c7",
    title: "This vs That: Veneers vs Whitening",
    platform: "instagram",
    type: "carousel",
    status: "scheduled",
    date: "Jun 21, 2026",
    preview: "Which is right for you? Let's compare...",
  },
  {
    id: "c8",
    title: "How we stage a home in 24 hours",
    platform: "tiktok",
    type: "reel",
    status: "published",
    date: "Jun 20, 2026",
    preview: "Empty room → fully staged. Timelapse magic.",
  },
];

const FILTERS = ["All", "Drafts", "Approved", "Scheduled", "Published"];
const platformIcons: Record<string, string> = {
  instagram: "📷",
  tiktok: "🎵",
  pinterest: "📌",
  youtube: "▶️",
  linkedin: "💼",
  facebook: "👥",
};
const statusColor = (s: string) =>
  s === "draft"
    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
    : s === "approved" || s === "ai_generated" || s === "pending_approval"
      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      : s === "scheduled"
        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
        : "bg-muted text-muted-foreground";

function apiRow(c: any): ContentRow {
  return {
    id: c.id ?? "",
    title: c.title ?? "Untitled",
    platform: c.platform ?? "instagram",
    type: c.type ?? "post",
    status: c.status ?? "draft",
    date: c.scheduledAt
      ? new Date(c.scheduledAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : c.createdAt
        ? new Date(c.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "—",
    preview: (c.excerpt ?? c.body ?? "").slice(0, 120),
  };
}

export default function ContentLibraryPage() {
  const router = useRouter();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<ContentRow[]>(FALLBACK_CONTENT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tenantId = localStorage.getItem("tenantId") ?? "demo";
    const statusParam =
      filter === "All"
        ? undefined
        : filter === "Drafts"
          ? "draft"
          : filter === "Approved"
            ? "approved"
            : filter === "Scheduled"
              ? "scheduled"
              : "published";

    getContent(tenantId, statusParam ? { status: statusParam } : undefined)
      .then((r) => {
        if (r?.success && r.data && r.data.length > 0) {
          setItems(r.data.map(apiRow));
        } else {
          // Keep fallback filtered
          const filtered = FALLBACK_CONTENT.filter((c) => {
            if (filter === "Drafts") return c.status === "draft";
            if (filter === "Approved") return c.status === "approved";
            if (filter === "Scheduled") return c.status === "scheduled";
            if (filter === "Published") return c.status === "published";
            return true;
          });
          setItems(filtered);
        }
      })
      .catch(() => {
        setItems(FALLBACK_CONTENT);
      })
      .finally(() => setLoading(false));
  }, [filter]);

  const filtered = items.filter((c) =>
    search ? c.title.toLowerCase().includes(search.toLowerCase()) : true,
  );

  const counts: Record<string, number> = {};
  items.forEach((c) => {
    counts[c.status] = (counts[c.status] ?? 0) + 1;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-px bg-foreground/20" />
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
              Library
            </span>
          </div>
          <h1 className="font-display text-3xl tracking-tight">
            Content Library
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {items.length} posts · Review, approve, and track everything.
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/platform/instagram")}>
          + Generate New
        </Button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map((f) => {
          const key = f === "All" ? "all" : f.toLowerCase();
          const count = f === "All" ? items.length : (counts[key] ?? 0);
          return (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              className="rounded-full text-xs"
              onClick={() => setFilter(f)}
            >
              {f}{" "}
              {count > 0 && <span className="ml-1 opacity-60">({count})</span>}
            </Button>
          );
        })}
        <Input
          placeholder="Search content..."
          className="ml-auto max-w-[200px] h-8 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="py-16 text-center text-muted-foreground">
          Loading content...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          No content found. Click "+ Generate New" to create your first post.
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((c) => (
            <Card
              key={c.id}
              className="cursor-pointer hover:border-foreground/30 transition-colors"
              onClick={() => router.push(`/dashboard/content/${c.id}`)}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className="text-2xl">
                  {platformIcons[c.platform] ?? "📄"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{c.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {c.preview}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="text-[10px]">
                    {c.platform}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {c.type}
                  </Badge>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${statusColor(c.status)}`}
                  >
                    {c.status}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {c.date}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
