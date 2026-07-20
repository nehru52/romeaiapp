/**
 * Content Calendar — monthly view with scheduled posts.
 * Redesigned with pastel palette.
 */

"use client";

import CalendarView, { type CalendarEvent } from "@/components/ui/calendar-view/calendar-view";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";

export default function CalendarPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) { router.replace("/login"); return; }
    if (!user) return;
    const tenantId = sessionStorage.getItem(`tenant_${user.userId}`) ?? `tenant_${user.userId}`;
    fetch(`/api/content/${tenantId}`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data?.length > 0) {
          const mapped: CalendarEvent[] = d.data.map((item: any, i: number) => ({
            id: item.id ?? `ev_${i}`,
            date: item.scheduledAt ?? item.createdAt ?? new Date().toISOString(),
            title: item.title ?? "Untitled",
            platform: item.platform ?? "instagram",
            status: (item.status === "published" ? "published" : item.status === "scheduled" ? "scheduled" : "pending") as CalendarEvent["status"],
            type: item.type ?? "feed_post",
          }));
          setEvents(mapped);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isLoading, isAuthenticated, user, router]);

  const stats = useMemo(() => ({
    scheduled: events.filter(e => e.status === "scheduled").length,
    published: events.filter(e => e.status === "published").length,
    pending: events.filter(e => e.status === "pending").length,
  }), [events]);

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Calendar</p>
          <h1 className="text-[32px] md:text-[42px] font-semibold tracking-tight leading-tight">
            Content Calendar
          </h1>
          <p className="text-muted-foreground mt-1.5 text-[15px]">
            Plan and schedule your social media content
          </p>
        </div>
        <Button
          onClick={() => router.push("/generate")}
          className="shrink-0 rounded-full bg-foreground hover:bg-foreground/90 text-background h-11 px-6 text-sm font-medium"
        >
          <Plus className="h-4 w-4 mr-1.5" /> Generate Content
        </Button>
      </div>

      {/* Stat pills */}
      <div className="grid gap-4 grid-cols-3 stagger-children">
        <div className="bg-lavender rounded-[24px] p-6 hover-lift transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Scheduled</span>
            <span className="w-2 h-2 rounded-full bg-foreground/30" />
          </div>
          <div className="text-[36px] font-semibold tracking-tight">{stats.scheduled}</div>
          <p className="text-xs text-muted-foreground mt-1.5">Posts waiting to go live</p>
        </div>
        <div className="bg-yellow rounded-[24px] p-6 hover-lift transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pending</span>
            <span className="w-2 h-2 rounded-full bg-foreground/20" />
          </div>
          <div className="text-[36px] font-semibold tracking-tight">{stats.pending}</div>
          <p className="text-xs text-muted-foreground mt-1.5">Awaiting review</p>
        </div>
        <div className="bg-mint rounded-[24px] p-6 hover-lift transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Published</span>
            <span className="w-2 h-2 rounded-full bg-foreground/40" />
          </div>
          <div className="text-[36px] font-semibold tracking-tight">{stats.published}</div>
          <p className="text-xs text-muted-foreground mt-1.5">Live on social platforms</p>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white/50 rounded-[24px] p-1">
        <CalendarView events={events} onEventClick={setSelectedEvent} />
      </div>

      {/* Selected event detail */}
      {selectedEvent && (
        <div className="bg-pink rounded-[24px] p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-start justify-between gap-4 mb-6">
            <h3 className="text-2xl font-semibold tracking-tight">{selectedEvent.title}</h3>
            <span className="px-3 py-1 text-xs font-medium rounded-full capitalize bg-white/60">
              {selectedEvent.status}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="p-4 rounded-2xl bg-white/60">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">Platform</span>
              <span className="font-medium capitalize">{selectedEvent.platform}</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/60">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">Type</span>
              <span className="font-medium capitalize">{selectedEvent.type}</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/60">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">Date</span>
              <span className="font-medium">{new Date(selectedEvent.date).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex gap-3 mt-6 pt-6 border-t border-black/5">
            {selectedEvent.status === "pending" && (
              <>
                <Button size="sm" className="rounded-full bg-foreground hover:bg-foreground/90 text-background">Approve</Button>
                <Button size="sm" variant="outline" className="rounded-full border-black/10">Reschedule</Button>
              </>
            )}
            {selectedEvent.status === "scheduled" && (
              <Button size="sm" variant="outline" className="rounded-full border-black/10">Edit Schedule</Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
