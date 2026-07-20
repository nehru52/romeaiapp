"use client";

import { ArrowLeft, Calendar, ExternalLink, FileText, Image, Video } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  blog: <FileText className="h-4 w-4" />, reel: <Video className="h-4 w-4" />,
  carousel: <Image className="h-4 w-4" />, feed_post: <FileText className="h-4 w-4" />,
};

export default function ContentDetailPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="rounded-xl">
          <Link href="/users"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-1">
            <span className="w-6 h-px bg-foreground/30" />
            Content
          </span>
          <h1 className="text-2xl md:text-3xl font-display tracking-tight">Content Detail</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Content ID: {id}</p>
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl p-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center">
              <Video className="h-5 w-5 text-foreground/70" />
            </div>
            <div>
              <h3 className="font-display text-xl">Sample Content Item</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Created on {new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-foreground/5 text-foreground/70 border border-border/30">ai_generated</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-foreground/5 text-muted-foreground/70 border border-border/30">instagram</span>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-medium mb-2">Caption</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Stop scrolling — this travel tip changes everything. Here&apos;s the thing about finding the best local experiences that nobody talks about: it&apos;s not about spending more. It&apos;s about knowing where to look. The businesses winning on Instagram right now aren&apos;t the ones with the biggest budgets. They&apos;re the ones showing up every single day with value.
          </p>
        </div>

        <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6 p-4 rounded-xl bg-foreground/[0.02] border border-border/30">
          <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Scheduled: Not set</span>
          <span className="flex items-center gap-1.5"><ExternalLink className="h-3.5 w-3.5" /> Platform: instagram</span>
        </div>

        <div className="flex gap-3 pt-6 border-t border-border/30">
          <Button size="sm" className="rounded-full bg-foreground hover:bg-foreground/90 text-background">Approve &amp; Publish</Button>
          <Button size="sm" variant="outline" className="rounded-full border-border/50">Request Changes</Button>
          <Button size="sm" variant="outline" className="rounded-full border-border/50 text-muted-foreground hover:text-foreground">Reject</Button>
        </div>
      </div>
    </div>
  );
}
