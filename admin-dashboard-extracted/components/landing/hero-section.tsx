"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CYCLING_WORDS = ["create", "schedule", "publish", "grow"];

const STATS = [
  { value: "<60s", label: "to first calendar", company: "SETUP TIME" },
  { value: "30 days", label: "of content generated", company: "CALENDAR" },
  { value: "6+", label: "industry packs", company: "NICHES" },
  { value: "24/7", label: "AI-powered automation", company: "DEEPSEEK" },
];

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % CYCLING_WORDS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Subtle grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute h-px bg-foreground"
            style={{ top: `${10 * (i + 1)}%`, left: 0, right: 0 }}
          />
        ))}
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute w-px bg-foreground"
            style={{ left: `${6.25 * (i + 1)}%`, top: 0, bottom: 0 }}
          />
        ))}
      </div>

      {/* Gradient glow */}
      <div className="absolute top-1/3 right-0 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-foreground/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-foreground/[0.03] to-transparent blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 py-32 lg:py-40">
        {/* Eyebrow */}
        <div
          className={`mb-8 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground">
            <span className="w-8 h-px bg-foreground/30" />
            Powered by DeepSeek Reasoner
          </span>
        </div>

        {/* Headline */}
        <div className="mb-12">
          <h1
            className={`text-[clamp(2.5rem,8vw,7rem)] font-display leading-[0.95] tracking-tight transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <span className="block">Turn any website</span>
            <span className="block">
              into a{" "}
              <span className="relative inline-block">
                <span key={wordIndex} className="inline-flex">
                  {CYCLING_WORDS[wordIndex].split("").map((char, i) => (
                    <span
                      key={`${wordIndex}-${i}`}
                      className="inline-block animate-char-in"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      {char}
                    </span>
                  ))}
                </span>
                <span className="absolute -bottom-2 left-0 right-0 h-2 bg-foreground/10" />
              </span>
            </span>
            <span className="block text-muted-foreground">social media engine</span>
          </h1>
        </div>

        {/* Description + CTAs */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-end">
          <p
            className={`text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-xl transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Paste your URL. Our DeepSeek-powered AI scans your website, detects
            your niche, and generates a 30-day content calendar — posts, reels,
            carousels, and stories — all in under 60 seconds.
          </p>

          <div
            className={`flex items-start transition-all duration-700 delay-300 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <Button
              asChild
              size="lg"
              className="bg-foreground hover:bg-foreground/90 text-background px-10 h-16 text-lg rounded-full group"
            >
              <Link href="/login">
                Start free trial
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats marquee */}
      <div
        className={`absolute bottom-16 left-0 right-0 transition-all duration-700 delay-500 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex gap-16 marquee whitespace-nowrap">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-16">
              {STATS.map((stat) => (
                <div key={`${stat.company}-${i}`} className="flex items-baseline gap-4">
                  <span className="text-3xl lg:text-4xl font-display text-muted-foreground">
                    {stat.value}
                  </span>
                  <span className="text-sm text-muted-foreground/60">
                    {stat.label}
                    <span className="block font-mono text-[10px] mt-1 tracking-wider text-muted-foreground/30">
                      {stat.company}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
