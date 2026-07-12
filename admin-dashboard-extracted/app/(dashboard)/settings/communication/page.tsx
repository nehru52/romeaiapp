"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, CalendarDays } from "lucide-react";
import { useState } from "react";

export default function CommunicationSettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const phone = (form.elements.namedItem("phone") as HTMLInputElement).value;

    // Call notification preferences API
    try {
      await fetch("/api/notifications/prefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "demo-user",
          channels: phone ? "both" : "email",
          email: email || null,
          phone: phone || null,
          approvalOnly: true,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* non-critical */ }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-2">
          <span className="w-6 h-px bg-foreground/30" />
          Settings
        </span>
        <h1 className="text-3xl md:text-4xl font-display tracking-tight">Communication Settings</h1>
        <p className="text-muted-foreground mt-1">Manage notification preferences and calendar sync</p>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center">
            <Bell className="h-5 w-5 text-foreground/70" />
          </div>
          <div>
            <h3 className="font-display text-xl">Notification Preferences</h3>
            <p className="text-sm text-muted-foreground">Where should we send content approval notifications?</p>
          </div>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
            <Input id="email" name="email" type="email" placeholder="you@company.com" className="rounded-xl border-border/50 focus-visible:ring-foreground/20" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">Phone Number (SMS)</Label>
            <Input id="phone" name="phone" type="tel" placeholder="+1 555 123 4567" className="rounded-xl border-border/50 focus-visible:ring-foreground/20" />
          </div>
          <p className="text-xs text-muted-foreground">
            You&apos;ll receive notifications when new content is ready for your review.
          </p>
          <Button type="submit" className="rounded-full bg-foreground hover:bg-foreground/90 text-background h-10 px-6">
            {saved ? "Saved" : "Save Preferences"}
          </Button>
        </form>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center">
            <CalendarDays className="h-5 w-5 text-foreground/70" />
          </div>
          <div>
            <h3 className="font-display text-xl">Content Calendar Sync</h3>
            <p className="text-sm text-muted-foreground">Connect your calendar to sync scheduled posts</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Sync your content schedule with Google Calendar or Outlook to see your posting plan alongside your other events.
        </p>
        <Button variant="outline" disabled className="rounded-full border-border/50">Coming Soon</Button>
      </div>
    </div>
  );
}
