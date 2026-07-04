"use client";

import { ArrowLeft, Calendar, ExternalLink, FileText, Image, Video } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  blog: <FileText className="h-4 w-4" />, reel: <Video className="h-4 w-4" />,
  carousel: <Image className="h-4 w-4" />, feed_post: <FileText className="h-4 w-4" />,
};

export default function ContentDetailPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/users"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Content Detail</h1>
          <p className="text-muted-foreground text-sm">Content ID: {id}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Sample Content Item</CardTitle>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary">ai_generated</Badge>
              <Badge variant="outline">instagram</Badge>
            </div>
          </div>
          <CardDescription>Created on {new Date().toLocaleDateString()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-1">Caption</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Stop scrolling — this travel tip changes everything. Here&apos;s the thing about finding the best local experiences that nobody talks about: it&apos;s not about spending more. It&apos;s about knowing where to look. The businesses winning on Instagram right now aren&apos;t the ones with the biggest budgets. They&apos;re the ones showing up every single day with value.
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Scheduled: Not set</span>
            <span className="flex items-center gap-1"><ExternalLink className="h-3 w-3" /> Platform: instagram</span>
          </div>
          <div className="flex gap-2">
            <Button size="sm">Approve & Publish</Button>
            <Button size="sm" variant="outline">Request Changes</Button>
            <Button size="sm" variant="ghost" className="text-red-400">Reject</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
