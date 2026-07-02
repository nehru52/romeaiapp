"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getPacks, selectNiche } from "@/lib/api";

interface Pack {
  slug: string;
  name: string;
  description: string;
  icon: string;
  exampleBusinesses: string[];
  featured: boolean;
}

export default function NichePage() {
  const router = useRouter();
  const [packs, setPacks] = useState<Pack[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Show demo packs immediately
    const demoPacks = [
      {
        slug: "travel-agency",
        name: "Travel Agency & Tours",
        description: "Hotels, tour operators, cruise specialists.",
        icon: "✈️",
        exampleBusinesses: ["Rome tour agency", "Safari company"],
        featured: true,
      },
      {
        slug: "real-estate",
        name: "Real Estate & Property",
        description: "Agents, brokerages, luxury rentals.",
        icon: "🏠",
        exampleBusinesses: ["Miami realtor", "Airbnb manager"],
        featured: true,
      },
      {
        slug: "restaurant",
        name: "Restaurants & Food",
        description: "Cafes, bars, food trucks, caterers.",
        icon: "🍽️",
        exampleBusinesses: ["Italian restaurant", "Food truck"],
        featured: true,
      },
      {
        slug: "fitness-coaching",
        name: "Fitness & Coaching",
        description: "Gyms, personal trainers, nutritionists.",
        icon: "💪",
        exampleBusinesses: ["Personal trainer", "Yoga studio"],
        featured: true,
      },
      {
        slug: "dental-clinic",
        name: "Dental & Medical",
        description: "Dentists, med spas, optometrists.",
        icon: "🦷",
        exampleBusinesses: ["Dental clinic", "Dermatologist"],
        featured: true,
      },
      {
        slug: "custom",
        name: "Custom / Other",
        description: "Any business not listed above.",
        icon: "⚡",
        exampleBusinesses: ["Any business"],
        featured: false,
      },
    ];

    setPacks(demoPacks);

    // Try to get from API but don't wait
    getPacks()
      .then((r) => {
        if (r?.success && r.data) setPacks(r.data);
      })
      .catch(() => {});
  }, []);

  const [customStep, setCustomStep] = useState(0);
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>(
    {},
  );

  const customQuestions = [
    {
      key: "industry",
      label: "What industry are you in?",
      placeholder: "e.g. Legal services, Automotive, Education, Salon...",
    },
    {
      key: "products",
      label: "What do you sell or offer?",
      placeholder: "e.g. Legal consultations, Car repairs, Online courses...",
    },
    {
      key: "audience",
      label: "Who is your ideal customer?",
      placeholder:
        "e.g. Small business owners, Car enthusiasts, College students...",
    },
    {
      key: "personality",
      label: "What's your brand personality?",
      placeholder:
        "e.g. Professional & trusted, Bold & energetic, Calm & empathetic...",
    },
    {
      key: "location",
      label: "Where do you serve customers?",
      placeholder: "e.g. New York City, Nationwide USA, Online only...",
    },
  ];

  const handleContinue = async () => {
    if (!selected) return;

    // Custom pack: show questionnaire first
    if (selected === "custom" && customStep < customQuestions.length) {
      return; // User must fill current question before proceeding
    }

    setLoading(true);
    const pack = packs.find((p) => p.slug === selected);
    if (!pack) return;

    const userId = localStorage.getItem("userId") ?? "demo";
    try {
      await selectNiche(userId, pack.name, pack.slug);
    } catch {
      /* demo fallback */
    }

    // Store custom answers for the content engine
    if (selected === "custom" && Object.keys(customAnswers).length > 0) {
      localStorage.setItem("customPackAnswers", JSON.stringify(customAnswers));
    }

    router.push("/website");
  };

  const handleCustomNext = () => {
    const question = customQuestions[customStep];
    if (!question) return;

    const currentAnswer = customAnswers[question.key]?.trim();
    if (!currentAnswer) return;

    if (customStep < customQuestions.length - 1) {
      setCustomStep((s) => s + 1);
    } else {
      // Last question - save and continue
      setLoading(true);
      const userId = localStorage.getItem("userId") ?? "demo";

      // Store answers in localStorage
      localStorage.setItem("customPackAnswers", JSON.stringify(customAnswers));
      console.log("Custom pack answers saved:", customAnswers);

      // Call API
      selectNiche(userId, "Custom Business", "custom")
        .then(() => {
          router.push("/website");
        })
        .catch(() => {
          // Fallback - still go to website even if API fails
          console.log("API failed, continuing anyway");
          router.push("/website");
        });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-4xl text-center">
        <h1 className="mb-2 font-display text-3xl font-semibold tracking-tight">
          What&apos;s your business?
        </h1>
        <p className="mb-8 text-muted-foreground">
          Select your industry so we can customize your content engine.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {packs.map((pack) => (
            <Card
              key={pack.slug}
              className={`cursor-pointer transition-all hover:border-primary/50 ${
                selected === pack.slug
                  ? "border-primary ring-2 ring-primary/20"
                  : ""
              }`}
              onClick={() => setSelected(pack.slug)}
            >
              <CardHeader className="pb-2">
                <div className="mb-2 text-3xl">{pack.icon}</div>
                <CardTitle className="text-lg">{pack.name}</CardTitle>
                <CardDescription>{pack.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {pack.featured && (
                    <Badge variant="secondary" className="text-xs">
                      Popular
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Custom pack questionnaire */}
        {selected === "custom" && customStep < customQuestions.length ? (
          <div className="mt-8 mx-auto max-w-md text-left space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-8 h-px bg-foreground/20" />
              <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                Question {customStep + 1} of {customQuestions.length}
              </span>
            </div>
            <h2 className="font-display text-2xl tracking-tight">
              {customQuestions[customStep]?.label}
            </h2>
            <Input
              placeholder={customQuestions[customStep]?.placeholder}
              value={customAnswers[customQuestions[customStep]?.key] ?? ""}
              onChange={(e) =>
                setCustomAnswers((prev) => ({
                  ...prev,
                  [customQuestions[customStep]?.key]: e.target.value,
                }))
              }
              onKeyDown={(e) => e.key === "Enter" && handleCustomNext()}
              className="h-12 text-base"
              autoFocus
            />
            <div className="flex gap-3">
              {customStep > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setCustomStep((s) => s - 1)}
                >
                  ← Back
                </Button>
              )}
              <Button
                className="flex-1"
                disabled={
                  !customAnswers[customQuestions[customStep]?.key]?.trim()
                }
                onClick={handleCustomNext}
              >
                {customStep < customQuestions.length - 1
                  ? "Next →"
                  : "Generate My Pack →"}
              </Button>
            </div>
          </div>
        ) : (
          /* Standard Continue button for pre-built packs */
          <Button
            size="lg"
            className="mt-8"
            disabled={!selected || loading}
            onClick={handleContinue}
          >
            {loading ? "Saving..." : "Continue →"}
          </Button>
        )}
      </div>
    </div>
  );
}
