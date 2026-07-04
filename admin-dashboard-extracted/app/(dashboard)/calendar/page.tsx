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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Content Calendar</h1>
          <p className="text-muted-foreground">Plan and schedule your social media content</p>
        </div>
        <Button onClick={() => router.push("/generate")} size="sm">
          <Plus className="h-4 w-4 mr-1.5" /> Generate Content
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Scheduled</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-blue-400">{stats.scheduled}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Pending</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-yellow-400">{stats.pending}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Published</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-emerald-400">{stats.published}</div></CardContent>
        </Card>
      </div>

      <CalendarView events={events} onEventClick={setSelectedEvent} />

      {selectedEvent && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{selectedEvent.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div><span className="text-muted-foreground">Platform:</span> <span className="font-medium capitalize">{selectedEvent.platform}</span></div>
              <div><span className="text-muted-foreground">Type:</span> <span className="font-medium capitalize">{selectedEvent.type}</span></div>
              <div><span className="text-muted-foreground">Status:</span> <span className="font-medium capitalize">{selectedEvent.status}</span></div>
            </div>
            <div className="flex gap-2 mt-4">
              {selectedEvent.status === "pending" && (
                <>
                  <Button size="sm">Approve</Button>
                  <Button size="sm" variant="outline">Reschedule</Button>
                </>
              )}
              {selectedEvent.status === "scheduled" && (
                <Button size="sm" variant="outline">Edit Schedule</Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
