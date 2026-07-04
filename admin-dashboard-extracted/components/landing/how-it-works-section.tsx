"use client";

import { useEffect, useRef, useState } from "react";
import { Globe, ScanSearch, Rocket } from "lucide-react";

const STEPS = [
  {
    number: "I",
    icon: Globe,
    title: "Paste your website URL",
    description:
      "That's the only input we need. Our DeepSeek-powered crawler scans your entire site — pages, tone, imagery, CTAs — and builds a complete brand profile in under 60 seconds. No forms, no questionnaires, no friction.",
    highlight: "Average scan time: 42 seconds",
  },
  {
    number: "II",
    icon: ScanSearch,
    title: "AI generates your content calendar",
    description:
      "Our engine detects your niche, analyzes your audience, and produces a full 30-day content calendar — complete with captions, hashtags, image prompts, and platform-specific formatting for Instagram, LinkedIn, TikTok, and more.",
    highlight: "30 posts, reels, carousels, and stories",
  },
  {
    number: "III",
    icon: Rocket,
    title: "Review, approve, and publish",
    description:
      "Every piece of content goes through your approval workflow — via dashboard or Telegram bot. Approve with one click, request revisions, or let the AI auto-publish on your schedule. Full control, zero effort.",
    highlight: "One-click approval or Telegram bot",
  },
];

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
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

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="how-it-works" ref={ref} className="relative py-24 lg:py-32 bg-foreground text-background overflow-hidden">
      {/* Pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 40px, currentColor 40px, currentColor 41px)`,
        }}
      />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="mb-16 lg:mb-24">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-background/50 mb-6">
            <span className="w-8 h-px bg-background/30" />
            Process
          </span>
          <h2
            className={`text-4xl lg:text-6xl font-display tracking-tight transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Three steps.
            <br />
            <span className="text-background/50">Infinite possibilities.</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Steps */}
          <div>
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const isActive = activeStep === i;
              return (
                <button
                  key={step.number}
                  type="button"
                  onClick={() => setActiveStep(i)}
                  className={`w-full text-left py-8 border-b border-background/10 transition-all duration-500 group ${
                    isActive ? "opacity-100" : "opacity-40 hover:opacity-70"
                  }`}
                >
                  <div className="flex items-start gap-6">
                    <span className="font-display text-3xl text-background/30">{step.number}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className="w-5 h-5 text-background/50" />
                        <h3 className="text-xl lg:text-2xl font-display group-hover:translate-x-2 transition-transform duration-300">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-background/60 leading-relaxed text-sm">
                        {step.description}
                      </p>
                      {isActive && (
                        <>
                          <p className="mt-3 text-xs font-mono text-background/40">
                            {step.highlight}
                          </p>
                          <div className="mt-4 h-px bg-background/20 overflow-hidden">
                            <div
                              className="h-full bg-background"
                              style={{
                                animation: "how-it-works-progress 5s linear forwards",
                              }}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Visual panel */}
          <div className="lg:sticky lg:top-32 self-start">
            <div className="border border-background/10 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-background/10 flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-background/20" />
                  <div className="w-3 h-3 rounded-full bg-background/20" />
                  <div className="w-3 h-3 rounded-full bg-background/20" />
                </div>
                <span className="text-xs font-mono text-background/40">
                  step-{activeStep + 1}.tsx
                </span>
              </div>
              <div className="p-8 min-h-[280px] flex flex-col items-center justify-center gap-6">
                {(() => {
                  const Icon = STEPS[activeStep].icon;
                  return (
                    <>
                      <div className="w-20 h-20 rounded-2xl bg-background/10 flex items-center justify-center">
                        <Icon className="w-10 h-10 text-background/50" />
                      </div>
                      <p className="text-background/40 text-sm text-center leading-relaxed max-w-xs">
                        {STEPS[activeStep].highlight}
                      </p>
                    </>
                  );
                })()}
              </div>
              <div className="px-6 py-4 border-t border-background/10 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-mono text-background/40">
                  {activeStep === 2 ? "Ready to publish" : "Processing..."}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes how-it-works-progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </section>
  );
}
