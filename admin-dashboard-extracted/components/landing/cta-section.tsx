"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";

export function CtaSection() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative py-24 lg:py-32 bg-foreground text-background overflow-hidden">
      {/* Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 40px, currentColor 40px, currentColor 41px)`,
        }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-background/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 text-center">
        <div
          className={`transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background/10 border border-background/10 text-xs font-medium mb-8">
            <Zap className="w-3 h-3" />
            Powered by DeepSeek AI
          </div>
          <h2 className="text-4xl lg:text-6xl font-display tracking-tight mb-6">
            Ready to automate your
            <br />
            <span className="text-background/50">social media?</span>
          </h2>
          <p className="text-background/50 max-w-lg mx-auto mb-10 text-lg leading-relaxed">
            Join businesses and agencies using Optimus AI to generate, schedule,
            and publish their entire social presence — on autopilot.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-background hover:bg-background/90 text-foreground px-8 h-14 text-base rounded-full group"
            >
              <Link href="/login">
                Start free trial
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-14 px-8 text-base rounded-full border-background/20 hover:bg-background/10 text-background"
            >
              <Link href="/login">Talk to sales</Link>
            </Button>
          </div>
          <p className="mt-6 text-xs text-background/30">
            Free tier includes 5 posts/month. No credit card required.
          </p>
        </div>
      </div>
    </section>
  );
}
