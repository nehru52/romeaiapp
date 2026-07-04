"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Communication Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Where should we send content approval notifications?</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" name="email" type="email" placeholder="you@company.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (SMS)</Label>
              <Input id="phone" name="phone" type="tel" placeholder="+1 555 123 4567" />
            </div>
            <p className="text-xs text-muted-foreground">
              You&apos;ll receive notifications when new content is ready for your review.
            </p>
            <Button type="submit">{saved ? "✓ Saved" : "Save Preferences"}</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Content Calendar Sync</CardTitle>
          <CardDescription>Connect your calendar to sync scheduled posts</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Sync your content schedule with Google Calendar or Outlook to see your posting plan alongside your other events.
          </p>
          <Button variant="outline" disabled>Coming Soon</Button>
        </CardContent>
      </Card>
    </div>
  );
}
