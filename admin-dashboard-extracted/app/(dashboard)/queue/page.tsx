"use client";
/**
 * /queue — Content Approval Inbox
 * Redesigned with pastel palette.
 */
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, RefreshCw, Loader2, Instagram, Video, ImageIcon, FileText, LayoutGrid, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface QueueItem {
  id: string;
  title: string;
  excerpt?: string;
  platform: string;
  type: string;
  status: string;
  createdAt: string;
  scheduledAt?: string;
  imageUrls?: string[];
}

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "#E1306C",
  tiktok: "#00F2EA",
  youtube: "#FF0000",
  facebook: "#1877F2",
  linkedin: "#0A66C2",
  pinterest: "#E60023",
};

const TYPE_ICON: Record<string, React.ElementType> = {
  reel: Video,
  carousel: LayoutGrid,
  feed_post: ImageIcon,
  story: Instagram,
  blog: FileText,
  tiktok: Video,
  default: FileText,
};

export default function QueuePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<Record<string, boolean>>({});
  const [bulkLoading, setBulkLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/login");
  }, [isLoading, isAuthenticated, router]);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const tenantId = sessionStorage.getItem(`tenant_${user.userId}`) ?? `tenant_${user.userId}`;
      const res = await fetch(`/api/queue/${tenantId}`);
      const data = await res.json();
      if (data.success) setItems(data.data ?? []);
    } catch {
      toast.error("Failed to load queue");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const approve = async (id: string) => {
    if (!user) return;
    setActioning(p => ({ ...p, [id]: true }));
    try {
      const res = await fetch("/api/notifications/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.userId, contentId: id }),
      });
      if (res.ok) {
        setItems(p => p.map(i => i.id === id ? { ...i, status: "approved" } : i));
        toast.success("Approved and queued for publishing");
      } else {
        toast.error("Approval failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setActioning(p => ({ ...p, [id]: false }));
    }
  };

  const reject = async (id: string) => {
    setActioning(p => ({ ...p, [id]: true }));
    try {
      await fetch(`/api/content/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "rejected in queue" }),
      });
      setItems(p => p.map(i => i.id === id ? { ...i, status: "rejected" } : i));
      toast.success("Rejected");
    } catch {
      toast.error("Network error");
    } finally {
      setActioning(p => ({ ...p, [id]: false }));
    }
  };

  const bulkApprove = async () => {
    if (!user) return;
    const pending = items.filter(i => i.status === "ai_generated" || i.status === "pending_approval");
    if (!pending.length) return;
    setBulkLoading(true);
    try {
      const res = await fetch("/api/queue/bulk-approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.userId, contentIds: pending.map(i => i.id) }),
      });
      const data = await res.json();
      if (data.success) {
        setItems(p => p.map(i =>
          pending.find(p2 => p2.id === i.id) ? { ...i, status: "approved" } : i
        ));
        toast.success(`${data.data.approved} pieces approved`);
      }
    } catch {
      toast.error("Bulk approve failed");
    } finally {
      setBulkLoading(false);
    }
  };

  const filtered = items.filter(i => {
    if (filter === "all") return true;
    if (filter === "pending") return i.status === "ai_generated" || i.status === "pending_approval" || i.status === "pending_review";
    return i.status === filter;
  });

  const pendingCount = items.filter(i =>
    i.status === "ai_generated" || i.status === "pending_approval" || i.status === "pending_review"
  ).length;

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
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Queue</p>
          <h1 className="text-[32px] md:text-[42px] font-semibold tracking-tight leading-tight">
            Content Queue
          </h1>
          <p className="text-muted-foreground mt-1.5 text-[15px]">
            {pendingCount > 0
              ? `${pendingCount} piece${pendingCount !== 1 ? "s" : ""} waiting for your approval`
              : "All content reviewed"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}
            className="rounded-full border-black/10 h-9 px-3">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
          {pendingCount > 0 && (
            <Button onClick={bulkApprove} disabled={bulkLoading}
              className="rounded-full bg-foreground hover:bg-foreground/90 text-background h-9 px-4 text-sm">
              {bulkLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Check className="h-3.5 w-3.5 mr-1.5" />}
              Approve all ({pendingCount})
            </Button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-muted/40 p-1 rounded-2xl w-fit">
        {(["pending", "all", "approved", "rejected"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
              filter === f
                ? "bg-background text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}>
            {f === "pending" ? `Pending${pendingCount > 0 ? ` (${pendingCount})` : ""}` : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Items */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/30" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-muted/30 rounded-[24px] py-20 text-center">
          <p className="text-muted-foreground text-sm">
            {filter === "pending"
              ? "Nothing pending — you're all caught up."
              : `No ${filter} content yet.`}
          </p>
          <Button onClick={() => router.push("/generate")} variant="outline"
            className="mt-4 rounded-full border-black/10">
            Generate content
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => {
            const isPending = item.status === "ai_generated" || item.status === "pending_approval" || item.status === "pending_review";
            const isApproved = item.status === "approved";
            const isRejected = item.status === "rejected";
            const Icon = TYPE_ICON[item.type] ?? TYPE_ICON.default;
            const color = PLATFORM_COLORS[item.platform] ?? "#888";
            const busy = actioning[item.id];

            return (
              <div key={item.id}
                className={`rounded-[24px] p-5 transition-all duration-200 ${
                  isApproved ? "bg-mint/60 opacity-70"
                    : isRejected ? "bg-muted/40 opacity-40"
                    : "bg-pink hover:scale-[1.005]"
                }`}>
                <div className="flex items-start gap-4">
                  {/* Type icon */}
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-muted-foreground/60" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wide"
                        style={{ color }}>{item.platform}</span>
                      <span className="text-muted-foreground/30">·</span>
                      <span className="text-[11px] text-muted-foreground/50 capitalize">
                        {item.type.replace(/_/g, " ")}
                      </span>
                      <span className="ml-auto text-[10px] text-muted-foreground/30">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-medium text-sm leading-snug mb-1">{item.title}</h3>
                    {item.excerpt && (
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {item.excerpt}
                      </p>
                    )}
                  </div>
                </div>

                {isPending && (
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-black/5">
                    <Button size="sm" onClick={() => approve(item.id)} disabled={busy}
                      className="rounded-full bg-foreground hover:bg-foreground/90 text-background h-8 px-4 text-xs">
                      {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Check className="h-3 w-3 mr-1.5" />Approve</>}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => reject(item.id)} disabled={busy}
                      className="rounded-full border-black/10 h-8 px-4 text-xs">
                      <X className="h-3 w-3 mr-1.5" /> Reject
                    </Button>
                    <button onClick={() => router.push("/generate")}
                      className="ml-auto text-[11px] text-muted-foreground/50 hover:text-foreground transition-colors flex items-center gap-1">
                      Edit <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {isApproved && (
                  <p className="text-[11px] text-muted-foreground/40 mt-3 pt-3 border-t border-black/5">
                    Approved — scheduled for publishing
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
