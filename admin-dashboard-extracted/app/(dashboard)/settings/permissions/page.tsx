"use client";

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const TIERS = [
  { name: "Free", price: "$0", features: ["5 posts/month", "1 platform", "1 blog/month", "Approval gate"] },
  { name: "Starter", price: "$199/mo", features: ["20 posts/month", "2 platforms", "2 blogs/month", "AI images", "Approval gate"] },
  { name: "Growth", price: "$499/mo", features: ["60 posts/month", "4 platforms", "8 blogs/month", "AI images & video", "Trend detection", "Booking funnel"] },
  { name: "Empire", price: "$999/mo", features: ["200 posts/month", "6 platforms", "30 blogs/month", "Everything in Growth", "No approval gate", "White-label"] },
];

export default function PermissionsSettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-2">
          <span className="w-6 h-px bg-foreground/30" />
          Settings
        </span>
        <h1 className="text-3xl md:text-4xl font-display tracking-tight">Subscription &amp; Permissions</h1>
        <p className="text-muted-foreground mt-1">Manage your plan, billing, and feature access</p>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl p-8">
        <h3 className="font-display text-xl mb-1">Current Plan</h3>
        <p className="text-sm text-muted-foreground mb-6">You are on the Free tier. Upgrade to unlock more features.</p>
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-foreground/5 border border-border/30">
          <span className="text-xs font-mono font-medium text-foreground/80">Free Plan</span>
          <span className="text-xs text-muted-foreground">5 posts/month · 1 platform</span>
        </div>
      </div>

      <div>
        <h3 className="font-display text-xl mb-1">Available Plans</h3>
        <p className="text-sm text-muted-foreground mb-6">Choose the plan that fits your business.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TIERS.map((tier) => (
            <div key={tier.name} className="bg-card border border-border/50 rounded-2xl p-6 flex flex-col gap-4 hover-lift transition-all duration-300">
              <div>
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-foreground/5 text-foreground/70 border border-border/30">{tier.name}</span>
                <p className="text-2xl font-display mt-3">{tier.price}</p>
              </div>
              <ul className="space-y-2 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="text-xs text-muted-foreground flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-foreground/50 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button variant={tier.name === "Free" ? "outline" : "default"} size="sm" className="w-full rounded-full" disabled={tier.name === "Free"}>
                {tier.name === "Free" ? "Current" : "Upgrade"}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
