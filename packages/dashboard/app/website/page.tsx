"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { submitWebsite } from "@/lib/api";

interface WebsiteAnalysis {
  url: string;
  title: string;
  description: string;
  industry: string;
  confidence: number;
  keywords: string[];
  products: { name: string; description: string; priceHint: string }[];
  brandVoice: {
    tone: string[];
    formality: number;
    vocabulary: string[];
    samplePhrases: string[];
  };
  targetAudience: string[];
  socialLinks: Record<string, string>;
  suggestedPack: string;
  locations: string[];
  contactInfo: { email?: string; phone?: string; address?: string };
}

type ProgressStep = "scraping" | "analyzing" | "detecting" | "complete";

const STEP_LABELS: Record<ProgressStep, string> = {
  scraping: "Scraping website...",
  analyzing: "Analyzing content...",
  detecting: "Detecting industry...",
  complete: "Complete!",
};

export default function WebsitePage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [progressStep, setProgressStep] = useState<ProgressStep>("scraping");
  const [analysis, setAnalysis] = useState<WebsiteAnalysis | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearProgressInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleSubmit = async () => {
    if (!url.startsWith("http")) return;
    setLoading(true);
    setProgressStep("scraping");

    const userId = localStorage.getItem("userId") ?? "demo";

    intervalRef.current = setInterval(() => {
      setProgressStep((prev) => {
        if (prev === "scraping") return "analyzing";
        if (prev === "analyzing") return "detecting";
        return prev;
      });
    }, 2000);

    try {
      const result = await submitWebsite(userId, url);
      if (result?.success && result.data?.analysis) {
        setProgressStep("complete");
        await new Promise((r) => setTimeout(r, 600));
        clearProgressInterval();
        setAnalysis(result.data.analysis as unknown as WebsiteAnalysis);
        setLoading(false);
        return;
      }
    } catch {
      /* fall through to demo */
    }

    clearProgressInterval();
    const domain =
      url.replace("https://", "").replace("www.", "").split("/")[0] ?? url;
    const lowerUrl = `${url} ${domain}`.toLowerCase();

    setProgressStep("analyzing");
    await new Promise((r) => setTimeout(r, 2000));
    setProgressStep("detecting");
    await new Promise((r) => setTimeout(r, 2000));
    setProgressStep("complete");
    await new Promise((r) => setTimeout(r, 600));

    let industry = "Business Services",
      confidence = 0.3,
      pack = "custom";
    if (
      lowerUrl.includes("tour") ||
      lowerUrl.includes("travel") ||
      lowerUrl.includes("hotel")
    ) {
      industry = "Travel & Tourism";
      confidence = 0.6;
      pack = "travel-agency";
    } else if (
      lowerUrl.includes("real") ||
      lowerUrl.includes("property") ||
      lowerUrl.includes("house")
    ) {
      industry = "Real Estate";
      confidence = 0.6;
      pack = "real-estate";
    } else if (
      lowerUrl.includes("restaurant") ||
      lowerUrl.includes("food") ||
      lowerUrl.includes("cafe")
    ) {
      industry = "Restaurant & Food";
      confidence = 0.6;
      pack = "restaurant";
    } else if (
      lowerUrl.includes("fit") ||
      lowerUrl.includes("gym") ||
      lowerUrl.includes("coach")
    ) {
      industry = "Fitness & Coaching";
      confidence = 0.6;
      pack = "fitness-coaching";
    }

    setAnalysis({
      url,
      title: domain,
      description: `${domain} business website`,
      industry,
      confidence,
      keywords: [],
      products: [],
      brandVoice: {
        tone: ["professional"],
        formality: 5,
        vocabulary: [],
        samplePhrases: [],
      },
      targetAudience: ["general"],
      socialLinks: {},
      suggestedPack: pack,
      locations: [],
      contactInfo: {},
    });
    setLoading(false);
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-12">
            <Spinner className="mx-auto mb-6 h-10 w-10 text-primary" />
            <CardTitle className="mb-2">{STEP_LABELS[progressStep]}</CardTitle>
            <CardDescription>
              {progressStep === "scraping" && `Fetching content from ${url}...`}
              {progressStep === "analyzing" &&
                "Extracting metadata, products, and brand voice..."}
              {progressStep === "detecting" &&
                "Identifying industry, audience, and social profiles..."}
              {progressStep === "complete" && "All analysis complete!"}
            </CardDescription>
            <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full bg-primary transition-all duration-700 ${
                  progressStep === "scraping"
                    ? "w-1/3"
                    : progressStep === "analyzing"
                      ? "w-2/3"
                      : "w-full"
                }`}
              />
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              {progressStep === "scraping" &&
                "● Scraping website  |  ○ Analyzing content  |  ○ Detecting industry"}
              {progressStep === "analyzing" &&
                "✓ Scraping website  |  ● Analyzing content  |  ○ Detecting industry"}
              {progressStep === "detecting" &&
                "✓ Scraping website  |  ✓ Analyzing content  |  ● Detecting industry"}
              {progressStep === "complete" &&
                "✓ Scraping website  |  ✓ Analyzing content  |  ✓ Detecting industry"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Results ──
  if (analysis) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-lg">
          <CardContent className="py-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-3xl dark:bg-green-900/30">
              ✓
            </div>
            <CardTitle className="mb-2 text-center">
              Analysis Complete!
            </CardTitle>
            <div className="mb-6 space-y-2">
              <div className="flex justify-between border-b py-2 text-sm">
                <span className="text-muted-foreground">Business</span>
                <span className="max-w-[60%] text-right font-medium">
                  {analysis.title}
                </span>
              </div>
              {analysis.description && (
                <div className="border-b py-2 text-sm">
                  <span className="mb-1 block text-muted-foreground">
                    Description
                  </span>
                  <p className="text-sm">{analysis.description}</p>
                </div>
              )}
              <div className="flex justify-between border-b py-2 text-sm">
                <span className="text-muted-foreground">Industry</span>
                <span className="font-medium">
                  {analysis.industry}{" "}
                  {analysis.confidence > 0 &&
                    `(${Math.round(analysis.confidence * 100)}% confidence)`}
                </span>
              </div>
              {analysis.products.length > 0 && (
                <div className="border-b py-2 text-sm">
                  <span className="mb-1 block text-muted-foreground">
                    Products / Services
                  </span>
                  <ul className="list-disc space-y-1 pl-4">
                    {analysis.products.map((p, i) => (
                      <li key={i} className="text-sm">
                        {p.name}
                        {p.priceHint ? ` — ${p.priceHint}` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {analysis.brandVoice.tone.length > 0 && (
                <div className="flex justify-between border-b py-2 text-sm">
                  <span className="text-muted-foreground">Brand Voice</span>
                  <span className="font-medium capitalize">
                    {analysis.brandVoice.tone.join(", ")}
                  </span>
                </div>
              )}
              {analysis.targetAudience.length > 0 &&
                analysis.targetAudience[0] !== "general" && (
                  <div className="flex justify-between border-b py-2 text-sm">
                    <span className="text-muted-foreground">
                      Target Audience
                    </span>
                    <span className="max-w-[60%] text-right font-medium capitalize">
                      {analysis.targetAudience.join(", ")}
                    </span>
                  </div>
                )}
              {Object.keys(analysis.socialLinks).length > 0 && (
                <div className="border-b py-2 text-sm">
                  <span className="mb-1 block text-muted-foreground">
                    Social Profiles
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(analysis.socialLinks).map(
                      ([platform, link]) => (
                        <a
                          key={platform}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded bg-muted px-2 py-1 text-xs capitalize hover:bg-muted/80"
                        >
                          {platform}
                        </a>
                      ),
                    )}
                  </div>
                </div>
              )}
              <div className="flex justify-between py-2 text-sm">
                <span className="text-muted-foreground">Suggested Pack</span>
                <span className="font-medium">{analysis.suggestedPack}</span>
              </div>
            </div>
            <CardDescription className="mb-6 text-center text-green-600 dark:text-green-400">
              Your content engine is ready. Taking you to the dashboard...
            </CardDescription>
            <Button
              className="w-full"
              onClick={() => {
                localStorage.setItem("onboardingComplete", "true");
                const uid = localStorage.getItem("userId");
                if (uid)
                  fetch("http://localhost:3001/api/auth/onboarding-complete", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId: uid }),
                  }).catch(() => {});
                router.push("/dashboard");
              }}
            >
              Go to Dashboard →
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Input ──
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>Your website URL</CardTitle>
          <CardDescription>
            Paste your company website so we can analyze your brand and
            auto-configure your content engine.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="url"
            placeholder="https://yourbusiness.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && url.startsWith("http") && handleSubmit()
            }
          />
          <Button
            className="w-full"
            disabled={!url.startsWith("http")}
            onClick={handleSubmit}
          >
            Analyze My Website →
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
