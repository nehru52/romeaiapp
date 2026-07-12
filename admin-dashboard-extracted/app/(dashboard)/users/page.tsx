/**
 * Content Manager — AI-generated content grouped by platform.
 */

"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FileText, Image, Loader2, Video, ExternalLink, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ContentItem {
  id: string; title: string; type: string; platform: string;
  status: string; category: string; createdAt: string; excerpt: string;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  blog: <FileText className="h-4 w-4" />,
  reel: <Video className="h-4 w-4" />,
  carousel: <Image className="h-4 w-4" />,
  feed_post: <FileText className="h-4 w-4" />,
};

const STATUS_STYLES: Record<string, string> = {
  ai_generated: "bg-foreground/5 text-foreground/70",
  pending_approval: "bg-foreground/8 text-foreground/60",
  approved: "bg-foreground/10 text-foreground/70",
  published: "bg-foreground/10 text-foreground/80",
  scheduled: "bg-foreground/5 text-foreground/60",
  rejected: "bg-foreground/5 text-foreground/50",
};

const PLATFORMS = ["instagram", "tiktok", "facebook", "pinterest", "linkedin"];

export default function ContentPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) { router.replace("/login"); return; }
    if (!user) return;

    fetch("/api/content/demo-tenant")
      .then(r => r.json())
      .then(d => { if (d.success) setContent(d.data ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isLoading, isAuthenticated, user, router]);

  // Only show approved + published content
  const visibleContent = useMemo(
    () => content.filter(c => c.status === "approved" || c.status === "published"),
    [content],
  );

  const contentByPlatform = useMemo(() => {
    const grouped: Record<string, ContentItem[]> = {};
    for (const platform of PLATFORMS) {
      grouped[platform] = visibleContent.filter(c => c.platform === platform);
    }
    grouped["other"] = visibleContent.filter(c => !PLATFORMS.includes(c.platform));
    return grouped;
  }, [visibleContent]);

  if (isLoading || loading) {
    return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-2">
            <span className="w-6 h-px bg-foreground/30" />
            Library
          </span>
          <h1 className="text-3xl md:text-4xl font-display tracking-tight">Content Manager</h1>
          <p className="text-muted-foreground mt-1">AI-generated social media content — grouped by platform</p>
        </div>
        <Button onClick={() => router.push("/generate")} className="shrink-0 rounded-full bg-foreground hover:bg-foreground/90 text-background h-10 px-5">
          <Plus className="h-4 w-4 mr-1.5" /> Generate New
        </Button>
      </div>

      {visibleContent.length === 0 ? (
        <div className="bg-card border border-border/30 border-dashed rounded-2xl py-16 px-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-foreground/5 flex items-center justify-center mx-auto mb-4">
            <FileText className="h-6 w-6 text-muted-foreground/40" />
          </div>
          <p className="text-muted-foreground text-sm mb-1">No approved content yet</p>
          <p className="text-muted-foreground/60 text-xs">Generate content and approve it to see it here</p>
        </div>
      ) : (
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="bg-muted/50 p-1 rounded-xl gap-0">
            <TabsTrigger value="all" className="rounded-lg text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground px-4 py-1.5 transition-all">
              All <span className="ml-1 text-[10px] text-muted-foreground">({visibleContent.length})</span>
            </TabsTrigger>
            {PLATFORMS.map(p => {
              const count = contentByPlatform[p]?.length ?? 0;
              if (count === 0) return null;
              return (
                <TabsTrigger key={p} value={p} className="rounded-lg text-sm capitalize data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground px-4 py-1.5 transition-all">
                  {p} <span className="ml-1 text-[10px] text-muted-foreground">({count})</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="all">
            <ContentList items={content} />
          </TabsContent>
          {PLATFORMS.map(p => (
            <TabsContent key={p} value={p}>
              <ContentList items={contentByPlatform[p] ?? []} />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}

function ContentList({ items }: { items: ContentItem[] }) {
  if (items.length === 0) {
    return (
      <div className="bg-card border border-border/30 border-dashed rounded-2xl py-12 text-center">
        <p className="text-muted-foreground text-sm">No content for this platform yet</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 stagger-children">
      {items.map((item) => (
        <div key={item.id} className="bg-card border border-border/50 rounded-2xl p-6 hover-lift transition-all duration-300 group">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center shrink-0">
                {TYPE_ICONS[item.type] ?? <FileText className="h-4 w-4 text-muted-foreground" />}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-medium truncate">{item.title}</h3>
                <p className="text-[11px] font-mono text-muted-foreground/60 mt-0.5">{item.platform}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${STATUS_STYLES[item.status] ?? "bg-foreground/5 text-muted-foreground"}`}>
                {item.status.replace(/_/g, " ")}
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">{item.excerpt}</p>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-muted-foreground/50">{new Date(item.createdAt).toLocaleDateString()}</span>
            <button className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5">
              <ExternalLink className="h-3 w-3" /> View
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
