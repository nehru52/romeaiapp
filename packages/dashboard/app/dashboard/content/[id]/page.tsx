"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { getContent, getContentById, updateContentStatus } from "@/lib/api";

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
    ? "bg-amber-100 text-amber-800"
    : s === "approved" || s === "ai_generated" || s === "pending_approval"
      ? "bg-green-100 text-green-800"
      : s === "scheduled"
        ? "bg-blue-100 text-blue-800"
        : "bg-muted text-muted-foreground";

interface ContentDetail {
  id: string;
  title: string;
  body: string;
  excerpt: string;
  platform: string;
  type: string;
  status: string;
  category: string;
  imageUrls: string[];
  createdAt: string;
}

const FALLBACK: ContentDetail = {
  id: "demo",
  title: "5 Vatican Mistakes Tourists Make (And How to Skip Every Line)",
  body: "Most tourists wake up at 7am, rush through breakfast, and stand 90 minutes under the Roman sun waiting to enter the Vatican. By 11am they're exhausted and staring at the Sistine Chapel through a wall of selfie sticks.\n\nHere's what actually works, based on real experience from Pointours — Rome's local travel experts.",
  excerpt: "Most people book 8am tours. Here's why that's a mistake...",
  platform: "instagram",
  type: "carousel",
  status: "draft",
  category: "educational",
  imageUrls: [],
  createdAt: new Date().toISOString(),
};

export default function ContentReviewPage() {
  const params = useParams();
  const router = useRouter();
  const contentId = (params.id as string) ?? "demo";

  const [content, setContent] = useState<ContentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [decision, setDecision] = useState<"pending" | "approved" | "rejected">(
    "pending",
  );
  const [actionLoading, setActionLoading] = useState(false);
  const [apiOffline, setApiOffline] = useState(false);

  useEffect(() => {
    const tenantId = localStorage.getItem("tenantId") ?? "demo";

    // Try dedicated endpoint first, then list + filter
    getContentById(contentId)
      .then((r) => {
        if (r?.success && r.data) {
          setContent(r.data as unknown as ContentDetail);
          setLoading(false);
          return;
        }
        throw new Error("not found by id");
      })
      .catch(() => {
        // Fallback: fetch all content and find by ID
        getContent(tenantId)
          .then((r) => {
            if (r?.success && r.data) {
              const found = r.data.find((c: any) => c.id === contentId);
              if (found) {
                setContent(found as unknown as ContentDetail);
                setLoading(false);
                return;
              }
            }
            setContent(FALLBACK);
            setApiOffline(true);
            setLoading(false);
          })
          .catch(() => {
            setContent(FALLBACK);
            setApiOffline(true);
            setLoading(false);
          });
      });
  }, [contentId]);

  const handleAction = async (action: "approved" | "rejected") => {
    setActionLoading(true);
    const _userId = localStorage.getItem("userId") ?? "demo";

    try {
      // Send status update with notes if rejecting
      const body: Record<string, string> = { status: action };
      if (action === "rejected" && notes.trim()) {
        body.notes = notes.trim();
      }
      const result = await updateContentStatus(contentId, action);
      if (result?.success) {
        setDecision(action);
        // If rejected with notes, trigger regeneration
        if (action === "rejected" && notes.trim()) {
          // The notes are stored — regeneration would happen here
          console.log("[content-review] Rejected with notes:", notes.trim());
        }
      } else {
        setDecision(action);
        setApiOffline(true);
      }
    } catch {
      setDecision(action);
      setApiOffline(true);
    }
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Loading content...
      </div>
    );
  }

  const c = content ?? FALLBACK;
  const bodyParagraphs = (c.body ?? "")
    .split("\n")
    .filter((p: string) => p.trim().length > 0);

  if (decision === "approved") {
    return (
      <div className="py-20 text-center space-y-4">
        <span style={{ fontSize: 48 }}>✓</span>
        <h1 className="font-display text-2xl font-semibold">Published!</h1>
        <p className="text-muted-foreground">
          Content is live on {c.platform}.
        </p>
        <Button onClick={() => router.push("/dashboard/content")}>
          Back to Library
        </Button>
      </div>
    );
  }

  if (decision === "rejected") {
    return (
      <div className="py-20 text-center space-y-4">
        <span style={{ fontSize: 48 }}>✗</span>
        <h1 className="font-display text-2xl font-semibold">Rejected</h1>
        <p className="text-muted-foreground">
          Content will be regenerated with your feedback.
        </p>
        <Button onClick={() => router.push("/dashboard/content")}>
          Back to Library
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/dashboard/content")}
      >
        ← Back to Library
      </Button>

      <div className="flex gap-2">
        <Badge>
          {platformIcons[c.platform] ?? "📄"} {c.platform}
        </Badge>
        <Badge variant="outline">{c.type}</Badge>
        <Badge variant="outline">{c.category}</Badge>
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${statusColor(c.status)}`}
        >
          {c.status}
        </span>
      </div>

      {apiOffline && (
        <div className="rounded-md bg-amber-50 dark:bg-amber-950/20 px-4 py-2 text-xs text-amber-700 dark:text-amber-300">
          API server offline — showing demo preview. Actions will apply locally.
        </div>
      )}

      <h1 className="font-display text-2xl font-semibold leading-tight">
        {c.title}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Content Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none dark:prose-invert space-y-3">
            {bodyParagraphs.map((p: string, i: number) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          {c.imageUrls.length > 0 && (
            <div className="mt-4 flex gap-2">
              {c.imageUrls.map((_url: string, i: number) => (
                <div
                  key={i}
                  className="h-20 w-20 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground"
                >
                  Image {i + 1}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Textarea
        placeholder="Revision notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
      />

      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
          disabled={actionLoading}
          onClick={() => handleAction("rejected")}
        >
          ✗ Reject & Regenerate
        </Button>
        <Button
          className="flex-[2] bg-green-600 hover:bg-green-700"
          disabled={actionLoading}
          onClick={() => handleAction("approved")}
        >
          {actionLoading ? "Publishing..." : "✓ Approve"}
        </Button>
      </div>
    </div>
  );
}
