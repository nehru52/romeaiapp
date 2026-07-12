/**
 * Content Calendar — monthly view with scheduled posts.
 */

"use client";

import CalendarView, { type CalendarEvent } from "@/components/ui/calendar-view/calendar-view";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus } from "lucide-react";

export default function CalendarPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) { router.replace("/login"); return; }
    // Fetch real content items from API and convert to calendar events
    fetch("/api/content/demo-tenant")
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
  }, [isLoading, isAuthenticated, router]);

  const stats = useMemo(() => ({
    scheduled: events.filter(e => e.status === "scheduled").length,
    published: events.filter(e => e.status === "published").length,
    pending: events.filter(e => e.status === "pending").length,
  }), [events]);

  if (isLoading || loading) {
    return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-2">
            <span className="w-6 h-px bg-foreground/30" />
            Calendar
          </span>
          <h1 className="text-3xl md:text-4xl font-display tracking-tight">Content Calendar</h1>
          <p className="text-muted-foreground mt-1">Plan and schedule your social media content</p>
        </div>
        <Button onClick={() => router.push("/generate")} className="shrink-0 rounded-full bg-foreground hover:bg-foreground/90 text-background h-10 px-5">
          <Plus className="h-4 w-4 mr-1.5" /> Generate Content
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-3 stagger-children">
        <div className="bg-card border border-border/50 rounded-2xl p-6 hover-lift transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-xs text-muted-foreground">Scheduled</span>
            <span className="w-2 h-2 rounded-full bg-foreground/30" />
          </div>
          <div className="text-3xl lg:text-4xl font-display tracking-tight">{stats.scheduled}</div>
          <p className="text-xs text-muted-foreground/70 mt-1">Posts waiting to go live</p>
        </div>
        <div className="bg-card border border-border/50 rounded-2xl p-6 hover-lift transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-xs text-muted-foreground">Pending</span>
            <span className="w-2 h-2 rounded-full bg-foreground/20" />
          </div>
          <div className="text-3xl lg:text-4xl font-display tracking-tight">{stats.pending}</div>
          <p className="text-xs text-muted-foreground/70 mt-1">Awaiting review</p>
        </div>
        <div className="bg-card border border-border/50 rounded-2xl p-6 hover-lift transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-xs text-muted-foreground">Published</span>
            <span className="w-2 h-2 rounded-full bg-foreground/40" />
          </div>
          <div className="text-3xl lg:text-4xl font-display tracking-tight">{stats.published}</div>
          <p className="text-xs text-muted-foreground/70 mt-1">Live on social platforms</p>
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl p-1">
        <CalendarView events={events} onEventClick={setSelectedEvent} />
      </div>

      {selectedEvent && (
        <div className="bg-card border border-border/50 rounded-2xl p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-start justify-between gap-4 mb-6">
            <h3 className="font-display text-2xl">{selectedEvent.title}</h3>
            <span className={`px-3 py-1 text-xs font-mono rounded-full capitalize ${
              selectedEvent.status === "published"
                ? "bg-foreground/10 text-foreground/70"
                : selectedEvent.status === "scheduled"
                  ? "bg-foreground/10 text-foreground/70"
                  : "bg-foreground/5 text-muted-foreground"
            }`}>{selectedEvent.status}</span>
          </div>
          <div className="grid grid-cols-3 gap-6 text-sm">
            <div className="p-4 rounded-xl bg-foreground/[0.02] border border-border/30">
              <span className="font-mono text-xs text-muted-foreground block mb-1">Platform</span>
              <span className="font-medium capitalize">{selectedEvent.platform}</span>
            </div>
            <div className="p-4 rounded-xl bg-foreground/[0.02] border border-border/30">
              <span className="font-mono text-xs text-muted-foreground block mb-1">Type</span>
              <span className="font-medium capitalize">{selectedEvent.type}</span>
            </div>
            <div className="p-4 rounded-xl bg-foreground/[0.02] border border-border/30">
              <span className="font-mono text-xs text-muted-foreground block mb-1">Date</span>
              <span className="font-medium">{new Date(selectedEvent.date).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex gap-3 mt-6 pt-6 border-t border-border/30">
            {selectedEvent.status === "pending" && (
              <>
                <Button size="sm" className="rounded-full bg-foreground hover:bg-foreground/90 text-background">Approve</Button>
                <Button size="sm" variant="outline" className="rounded-full border-border/50">Reschedule</Button>
              </>
            )}
            {selectedEvent.status === "scheduled" && (
              <Button size="sm" variant="outline" className="rounded-full border-border/50">Edit Schedule</Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
