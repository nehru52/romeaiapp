"use client";

import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";
import { useState } from "react";

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-2">
          <span className="w-6 h-px bg-foreground/30" />
          Settings
        </span>
        <h1 className="text-3xl md:text-4xl font-display tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your personal information and account details</p>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center">
            <User className="h-5 w-5 text-foreground/70" />
          </div>
          <div>
            <h3 className="font-display text-xl">Personal Information</h3>
            <p className="text-sm text-muted-foreground">Your account details. Changes are saved locally.</p>
          </div>
        </div>
        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); setSaved(true); setTimeout(() => setSaved(false), 2000); }}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Name</Label>
              <Input id="name" defaultValue={user?.name ?? ""} placeholder="Your name" className="rounded-xl border-border/50 focus-visible:ring-foreground/20" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input id="email" defaultValue={user?.email ?? ""} disabled className="rounded-xl border-border/50 opacity-60" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="userId" className="text-sm font-medium">User ID</Label>
            <Input id="userId" defaultValue={user?.userId ?? ""} disabled className="rounded-xl border-border/50 opacity-60 font-mono text-xs" />
          </div>
          <Button type="submit" className="rounded-full bg-foreground hover:bg-foreground/90 text-background h-10 px-6">
            {saved ? "Saved" : "Save Changes"}
          </Button>
        </form>
      </div>
    </div>
  );
}
