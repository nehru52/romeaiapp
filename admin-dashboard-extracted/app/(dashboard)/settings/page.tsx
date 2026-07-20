/**
 * Settings Hub — overview of all settings sections.
 */

"use client";

import { useRouter } from "next/navigation";
import { Key, Mail, User, CreditCard, ArrowRight } from "lucide-react";

const SETTINGS_SECTIONS = [
  { name: "Profile", desc: "Your name, email, and account details", href: "/settings/profile", icon: User },
  { name: "Security", desc: "Change password and manage 2FA", href: "/settings/security", icon: Key },
  { name: "Notifications", desc: "Email, SMS, and Telegram alerts", href: "/settings/communication", icon: Mail },
  { name: "Subscription", desc: "Plan, billing, and invoices", href: "/settings/permissions", icon: CreditCard },
];

export default function SettingsHubPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-2">
          <span className="w-6 h-px bg-foreground/30" />
          Account
        </span>
        <h1 className="text-3xl md:text-4xl font-display tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 stagger-children">
        {SETTINGS_SECTIONS.map((section) => (
          <button
            key={section.name}
            onClick={() => router.push(section.href)}
            className="bg-card border border-border/50 rounded-2xl p-6 text-left hover-lift transition-all duration-300 group cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center">
                <section.icon className="h-5 w-5 text-foreground/70" />
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-foreground/60 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-display text-xl mb-1">{section.name}</h3>
            <p className="text-sm text-muted-foreground">{section.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
