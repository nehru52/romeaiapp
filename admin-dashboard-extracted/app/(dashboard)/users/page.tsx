/**
 * Content Manager — shows all AI-generated content for the current user.
 */

"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FileText, Image, Loader2, Video, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

const STATUS_COLORS: Record<string, string> = {
  ai_generated: "text-blue-400 bg-blue-500/10",
  pending_approval: "text-yellow-400 bg-yellow-500/10",
  approved: "text-green-400 bg-green-500/10",
  published: "text-emerald-400 bg-emerald-500/10",
  scheduled: "text-purple-400 bg-purple-500/10",
  rejected: "text-red-400 bg-red-500/10",
};

export default function ContentPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) { router.replace("/login"); return; }
    if (!user) return;

    // Fetch content from API
    fetch("/api/content/demo-tenant")
      .then(r => r.json())
      .then(d => { if (d.success) setContent(d.data ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading || loading) {
    return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Content Manager</h1>
          <p className="text-muted-foreground">AI-generated social media content for your business</p>
        </div>
        <Button onClick={() => router.push("/dashboard")} variant="outline">Generate New</Button>
      </div>

      {content.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
            <FileText className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-muted-foreground text-sm">No content generated yet</p>
            <p className="text-muted-foreground/60 text-xs">Head to the Dashboard to start generating AI-powered posts</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {content.map((item) => (
            <Card key={item.id} className="hover:border-white/10 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2 min-w-0">
                    {TYPE_ICONS[item.type] ?? <FileText className="h-4 w-4" />}
                    <CardTitle className="text-sm font-medium truncate">{item.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[item.status] ?? "text-muted-foreground bg-accent"}`}>
                      {item.status.replace(/_/g, " ")}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase font-medium">{item.platform}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground line-clamp-2">{item.excerpt}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-muted-foreground/60">{new Date(item.createdAt).toLocaleDateString()}</span>
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                    <ExternalLink className="h-3 w-3" /> View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
