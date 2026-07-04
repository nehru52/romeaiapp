/**
 * Settings Hub — overview of all settings sections.
 */

"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Key, Mail, User, CreditCard, ArrowRight } from "lucide-react";

const SETTINGS_SECTIONS = [
  { name: "Profile", desc: "Your name, email, and account details", href: "/settings/profile", icon: User },
  { name: "Security", desc: "Change password and manage 2FA", href: "/settings/security", icon: Key },
  { name: "Notifications", desc: "Email, SMS, and Telegram alerts", href: "/settings/communication", icon: Mail },
  { name: "Subscription", desc: "Plan, billing, and invoices", href: "/settings/permissions", icon: CreditCard },
];

export default function SettingsHubPage() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {SETTINGS_SECTIONS.map((section) => (
          <Card
            key={section.name}
            className="cursor-pointer hover:border-white/10 transition-colors"
            onClick={() => router.push(section.href)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <section.icon className="h-5 w-5 text-muted-foreground" />
                <ArrowRight className="h-4 w-4 text-muted-foreground/30" />
              </div>
              <CardTitle className="text-base mt-2">{section.name}</CardTitle>
              <CardDescription>{section.desc}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
