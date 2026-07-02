"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("account");
  const [email, setEmail] = useState("agent@tours.com");
  const [agency, setAgency] = useState("Pointours");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [brandVoice, setBrandVoice] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [contentTone, setContentTone] = useState("educational");
  const [approvalGate, setApprovalGate] = useState(true);
  const [autoPublish, setAutoPublish] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const tenantId =
    (typeof window !== "undefined" ? localStorage.getItem("tenantId") : null) ??
    "demo-tenant";

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`${API}/api/tenants/${tenantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: agency,
          websiteUrl,
          brandVoice,
          hashtags,
          contentTone,
          approvalGate,
          autoPublish,
          emailNotif,
          smsNotif,
          weeklyReport,
        }),
      });
    } catch {
      /* demo fallback */
    }
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard")}
          className="mb-2"
        >
          ← Back to Dashboard
        </Button>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-8 h-px bg-foreground/20" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
            Configure
          </span>
        </div>
        <h1 className="font-display text-3xl tracking-tight">Settings</h1>
      </div>

      <div className="flex gap-2 border-b pb-2">
        {["account", "agency", "content", "notifications"].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-sm rounded-md capitalize ${activeTab === t ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {activeTab === "account" && (
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Your login and profile settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Agency Name</Label>
              <Input
                value={agency}
                onChange={(e) => setAgency(e.target.value)}
              />
            </div>
            <Button onClick={handleSave}>Save Changes</Button>
            {saving && (
              <p className="text-sm text-muted-foreground">Saving...</p>
            )}
            {saved && (
              <p className="text-sm text-green-500">✓ Settings saved</p>
            )}
            <div className="pt-4 mt-4 border-t border-destructive/20">
              <p className="text-sm font-medium text-destructive mb-2">
                Danger zone
              </p>
              <a
                href="/"
                onClick={() => {
                  localStorage.clear();
                }}
              >
                <Button
                  variant="outline"
                  className="w-full border-destructive/30 text-destructive hover:bg-destructive/10"
                >
                  🚪 Log out & return to home
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "agency" && (
        <Card>
          <CardHeader>
            <CardTitle>Agency Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Website URL</Label>
              <Input
                placeholder="https://yourtours.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Brand Voice</Label>
              <Input
                placeholder="Warm, knowledgeable, insider"
                value={brandVoice}
                onChange={(e) => setBrandVoice(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <Label>Approval Gate</Label>
                <p className="text-xs text-muted-foreground">
                  Review content before publishing
                </p>
              </div>
              <Switch
                checked={approvalGate}
                onCheckedChange={setApprovalGate}
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <Label>Auto-publish</Label>
                <p className="text-xs text-muted-foreground">
                  Skip review for routine posts
                </p>
              </div>
              <Switch checked={autoPublish} onCheckedChange={setAutoPublish} />
            </div>
            <Button onClick={handleSave}>Save</Button>
          </CardContent>
        </Card>
      )}

      {activeTab === "content" && (
        <Card>
          <CardHeader>
            <CardTitle>Content Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Default Hashtags</Label>
              <Input
                placeholder="#Rome #Italy #Travel"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Tone</Label>
              <select
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={contentTone}
                onChange={(e) => setContentTone(e.target.value)}
              >
                <option value="inspirational">Inspirational</option>
                <option value="educational">Educational</option>
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
              </select>
            </div>
            <Button onClick={handleSave}>Save</Button>
          </CardContent>
        </Card>
      )}

      {activeTab === "notifications" && (
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <Label>Email notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Get alerted when content is ready
                </p>
              </div>
              <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <Label>SMS notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Text when drafts are ready
                </p>
              </div>
              <Switch checked={smsNotif} onCheckedChange={setSmsNotif} />
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <Label>Weekly report</Label>
                <p className="text-xs text-muted-foreground">
                  Analytics summary every Monday
                </p>
              </div>
              <Switch
                checked={weeklyReport}
                onCheckedChange={setWeeklyReport}
              />
            </div>
            <Button onClick={handleSave}>Save Preferences</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
