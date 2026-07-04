"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TIERS = [
  { name: "Free", price: "$0", features: ["5 posts/month", "1 platform", "1 blog/month", "Approval gate"], color: "bg-zinc-500/10 text-zinc-400" },
  { name: "Starter", price: "$199/mo", features: ["20 posts/month", "2 platforms", "2 blogs/month", "AI images", "Approval gate"], color: "bg-blue-500/10 text-blue-400" },
  { name: "Growth", price: "$499/mo", features: ["60 posts/month", "4 platforms", "8 blogs/month", "AI images & video", "Trend detection", "Booking funnel"], color: "bg-violet-500/10 text-violet-400" },
  { name: "Empire", price: "$999/mo", features: ["200 posts/month", "6 platforms", "30 blogs/month", "Everything in Growth", "No approval gate", "White-label"], color: "bg-amber-500/10 text-amber-400" },
];

export default function PermissionsSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Subscription & Permissions</h1>

      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>You are on the Free tier. Upgrade to unlock more features.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="text-sm px-3 py-1">Free Plan</Badge>
            <span className="text-sm text-muted-foreground">5 posts/month • 1 platform</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>Choose the plan that fits your business.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TIERS.map((tier) => (
              <div key={tier.name} className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-4 flex flex-col gap-3">
                <div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tier.color}`}>{tier.name}</span>
                  <p className="text-lg font-bold mt-2">{tier.price}</p>
                </div>
                <ul className="space-y-1.5 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <span className="text-emerald-400 shrink-0 mt-0.5">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Button variant={tier.name === "Free" ? "outline" : "default"} size="sm" className="w-full" disabled={tier.name === "Free"}>
                  {tier.name === "Free" ? "Current" : "Upgrade"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
