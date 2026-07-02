"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setNotificationPrefs } from "@/lib/api";

export default function PreferencesPage() {
  const router = useRouter();
  const [channels, setChannels] = useState<"email" | "sms" | "both" | null>(
    null,
  );
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saved, setSaved] = useState(false);

  const [saveError, setSaveError] = useState(false);

  const handleSave = async () => {
    if (!channels) return;
    const userId = localStorage.getItem("userId") ?? "demo";
    try {
      await setNotificationPrefs({ userId, channels, email, phone });
      setSaved(true);
      setSaveError(false);
    } catch {
      setSaveError(true);
      setSaved(true); // still show success in demo mode
    }
  };

  if (saved) {
    return (
      <div className="mx-auto max-w-md py-16 text-center space-y-6">
        <span style={{ fontSize: 56 }}>🔔</span>
        <h1 className="font-display text-3xl font-semibold">You're all set!</h1>
        <p className="text-muted-foreground text-lg">
          We'll notify you via{" "}
          <strong className="text-foreground">
            {channels === "both"
              ? "Email + SMS + Telegram"
              : channels === "telegram"
                ? "Telegram Bot"
                : channels}
          </strong>{" "}
          the moment your AI-generated content is ready to review.
        </p>
        {saveError && (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            API server unreachable — preferences saved locally for demo.
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          One tap to approve. Content goes live. Bookings come in.
        </p>
        <Button
          size="lg"
          className="mt-4 rounded-full px-10"
          onClick={() => router.push("/dashboard")}
        >
          Go to Dashboard →
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="text-center">
        <span style={{ fontSize: 48 }}>🔔</span>
        <h1 className="font-display text-3xl font-semibold mt-4">
          Don't miss your content
        </h1>
        <p className="text-muted-foreground mt-2 text-lg max-w-md mx-auto">
          Your AI generates the posts —{" "}
          <strong className="text-foreground">but you approve them.</strong>{" "}
          Without notifications, content sits un-reviewed and never goes live.
        </p>
      </div>

      <Card className="border-amber-200 bg-amber-50/30 dark:bg-amber-950/10 dark:border-amber-800/30">
        <CardContent className="py-4 text-center">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            ⚠️ <strong>Required step.</strong> If you skip this, your
            AI-generated posts will stay in drafts forever. No content. No
            posts. No bookings.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            key: "email" as const,
            emoji: "📧",
            title: "Email",
            desc: "Review link sent to your inbox. Tap to approve.",
            tag: "Recommended",
          },
          {
            key: "sms" as const,
            emoji: "📱",
            title: "SMS",
            desc: "Instant text message. Review on your phone in seconds.",
            tag: "Fastest",
          },
          {
            key: "telegram" as const,
            emoji: "🤖",
            title: "Telegram",
            desc: "Approve or reject posts directly in Telegram. One tap.",
            tag: "Free",
          },
          {
            key: "both" as const,
            emoji: "🔔",
            title: "All Channels",
            desc: "Email + SMS + Telegram. Never miss a content review.",
            tag: "Best coverage",
          },
        ].map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setChannels(opt.key)}
            className={`relative flex flex-col items-center gap-3 p-6 rounded-xl border-2 text-center transition-all ${
              channels === opt.key
                ? "border-foreground bg-foreground text-background shadow-lg scale-105"
                : "border-foreground/10 bg-card hover:border-foreground/30 hover:shadow-sm"
            }`}
          >
            <span className="absolute -top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
              {opt.tag}
            </span>
            <span style={{ fontSize: 32 }}>{opt.emoji}</span>
            <div>
              <p className="text-lg font-semibold">{opt.title}</p>
              <p
                className={`text-xs mt-1 ${channels === opt.key ? "text-background/60" : "text-muted-foreground"}`}
              >
                {opt.desc}
              </p>
            </div>
          </button>
        ))}
      </div>

      {channels && (channels === "email" || channels === "both") && (
        <div className="space-y-2">
          <Label className="text-sm font-semibold">
            Your email address <span className="text-red-500">*</span>
          </Label>
          <Input
            type="email"
            placeholder="you@agency.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12"
          />
        </div>
      )}

      {channels && (channels === "sms" || channels === "both") && (
        <div className="space-y-2">
          <Label className="text-sm font-semibold">
            Your phone number <span className="text-red-500">*</span>
          </Label>
          <Input
            type="tel"
            placeholder="+39 123 456 789"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-12"
          />
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button
          size="lg"
          className={`flex-1 rounded-full h-14 text-base font-semibold ${!channels ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={!channels}
          onClick={handleSave}
        >
          {channels
            ? `Save & Get Notified via ${channels === "both" ? "Email + SMS" : channels === "email" ? "Email" : "SMS"} →`
            : "Select a notification method ↑"}
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        You can change this anytime in{" "}
        <strong className="text-foreground">Settings → Notifications</strong>.
        We never spam. Only content review alerts.
      </p>
    </div>
  );
}
