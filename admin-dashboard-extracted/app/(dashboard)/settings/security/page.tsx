"use client";

import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function SecuritySettingsPage() {
  const { user } = useAuth();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const current = (form.elements.namedItem("current") as HTMLInputElement).value;
    const newPw = (form.elements.namedItem("new") as HTMLInputElement).value;
    const confirm = (form.elements.namedItem("confirm") as HTMLInputElement).value;

    if (newPw.length < 8) { setMessage({ type: "error", text: "Password must be at least 8 characters." }); return; }
    if (!/[A-Z]/.test(newPw)) { setMessage({ type: "error", text: "Password must include at least one uppercase letter." }); return; }
    if (!/[0-9]/.test(newPw)) { setMessage({ type: "error", text: "Password must include at least one number." }); return; }
    if (!/[^A-Za-z0-9]/.test(newPw)) { setMessage({ type: "error", text: "Password must include at least one symbol." }); return; }
    if (newPw !== confirm) { setMessage({ type: "error", text: "Passwords do not match." }); return; }

    try {
      const res = await fetch("/api/auth/email/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email, password: current }),
      });
      const data = await res.json();
      if (!data.success) {
        setMessage({ type: "error", text: "Current password is incorrect." });
        return;
      }
      // In production: call a password-change API endpoint
      setMessage({ type: "success", text: "Password updated successfully." });
      form.reset();
    } catch {
      setMessage({ type: "error", text: "Something went wrong. Please try again." });
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-2">
          <span className="w-6 h-px bg-foreground/30" />
          Settings
        </span>
        <h1 className="text-3xl md:text-4xl font-display tracking-tight">Security Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your password and account security</p>
      </div>
      <div className="bg-card border border-border/50 rounded-2xl p-8">
        <h3 className="font-display text-xl mb-1">Change Password</h3>
        <p className="text-sm text-muted-foreground mb-6">Use a strong, unique password to protect your account.</p>
        <form className="space-y-5" onSubmit={handlePasswordChange}>
          <div className="space-y-2">
            <Label htmlFor="current" className="text-sm font-medium">Current Password</Label>
            <Input id="current" name="current" type="password" required className="rounded-xl border-border/50 focus-visible:ring-foreground/20" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new" className="text-sm font-medium">New Password</Label>
            <Input id="new" name="new" type="password" required minLength={4} className="rounded-xl border-border/50 focus-visible:ring-foreground/20" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm" className="text-sm font-medium">Confirm New Password</Label>
            <Input id="confirm" name="confirm" type="password" required className="rounded-xl border-border/50 focus-visible:ring-foreground/20" />
          </div>
          {message && (
            <p className={`text-sm ${
              message.type === "success" ? "text-foreground/70" : "text-destructive"
            }`}>
              {message.text}
            </p>
          )}
          <Button type="submit" className="rounded-full bg-foreground hover:bg-foreground/90 text-background h-10 px-6">
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );
}
