"use client";

import { useEffect, useRef, useState } from "react";
import {
  Search,
  CalendarDays,
  MessageSquareText,
  Palette,
  Zap,
  ShieldCheck,
} from "lucide-react";

const FEATURES = [
  {
    number: "01",
    icon: Search,
    title: "AI Website Analysis",
    description:
      "Paste any website URL and our DeepSeek-powered engine scans your entire site — detecting your niche, brand voice, and target audience in under 60 seconds. No manual setup required.",
  },
  {
    number: "02",
    icon: CalendarDays,
    title: "30-Day Content Calendar",
    description:
      "Get a full month of platform-optimized content — posts, reels, carousels, and stories — tailored to your industry and designed to maximize engagement and conversions.",
  },
  {
    number: "03",
    icon: MessageSquareText,
    title: "Smart Approval Workflow",
    description:
      "Review, edit, approve, or request changes via dashboard or Telegram bot. Every piece of content goes through your approval before it ever goes live.",
  },
  {
    number: "04",
    icon: Palette,
    title: "Brand Voice Learning",
    description:
      "Our AI analyzes your website's tone, vocabulary, and visual style to generate content that sounds authentically like you — never generic, never off-brand.",
  },
  {
    number: "05",
    icon: Zap,
    title: "One-Click Automation",
    description:
      "Enter your URL once. Our AI handles everything — scanning, niche detection, content generation, calendar scheduling, and publishing. Set it and forget it.",
  },
  {
    number: "06",
    icon: ShieldCheck,
    title: "Enterprise-Ready Security",
    description:
      "End-to-end encryption, role-based access controls, and SOC 2 compliant infrastructure. Your brand data and content stay private and secure.",
  },
];

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof FEATURES)[0];
  index: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const Icon = feature.icon;

  return (
    <div
      ref={ref}
      className={`group transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 py-10 lg:py-14 border-b border-border/50">
        <span className="shrink-0 font-mono text-sm text-muted-foreground/50">
          {feature.number}
        </span>
        <div className="flex-1 grid lg:grid-cols-2 gap-8 items-start">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Icon className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-2xl lg:text-3xl font-display group-hover:translate-x-2 transition-transform duration-500">
                {feature.title}
              </h3>
            </div>
            <p className="text-muted-foreground leading-relaxed max-w-lg">
              {feature.description}
            </p>
          </div>
          <div className="hidden lg:flex justify-end items-center">
            <div className="w-48 h-32 rounded-2xl bg-foreground/[0.03] border border-border/30 flex items-center justify-center">
              <Icon className="w-10 h-10 text-muted-foreground/30" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FeaturesSection() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" ref={ref} className="relative py-24 lg:py-32">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="mb-16 lg:mb-24">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
            <span className="w-8 h-px bg-foreground/30" />
            Capabilities
          </span>
          <h2
            className={`text-4xl lg:text-6xl font-display tracking-tight transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Everything you need.
            <br />
            <span className="text-muted-foreground">Nothing you don&apos;t.</span>
          </h2>
        </div>

        <div>
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.number} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
