import type { Metadata } from "next";
import type React from "react";
import "./globals.css";
import { ClientProviders } from "@/components/client-providers";

export const metadata: Metadata = {
  title: "Optimus AI — AI-Powered Social Media Automation",
  description:
    "Turn any website into a fully automated social media engine. DeepSeek-powered AI scans your site, detects your niche, and generates a 30-day content calendar — in under 60 seconds.",
  keywords: [
    "AI social media",
    "content automation",
    "social media scheduler",
    "AI content generator",
    "DeepSeek AI",
    "social media calendar",
  ],
  openGraph: {
    title: "Optimus AI — AI-Powered Social Media Automation",
    description:
      "Turn any website into a fully automated social media engine. Powered by DeepSeek.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground antialiased">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
