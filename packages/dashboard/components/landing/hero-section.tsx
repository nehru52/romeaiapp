"use client";

import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AnimatedSphere } from "./animated-sphere";

const words = ["content", "captions", "carousels", "scripts"];

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    setIsVisible(true);
  }, []);
  useEffect(() => {
    const interval = setInterval(
      () => setWordIndex((prev) => (prev + 1) % words.length),
      2500,
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] lg:w-[800px] lg:h-[800px] opacity-40 pointer-events-none">
        <AnimatedSphere />
      </div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        {[...Array(8)].map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute h-px bg-foreground/10"
            style={{ top: `${12.5 * (i + 1)}%`, left: 0, right: 0 }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 py-32 lg:py-40">
        <div
          className={`mb-6 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground">
            <span className="w-8 h-px bg-foreground/30" />
            AI-powered social media for any business
          </span>
        </div>
        <div className="mb-10 max-w-4xl">
          <h1
            className={`text-[clamp(3.5rem,10vw,9rem)] font-display leading-[0.92] tracking-tight transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <span className="block">Your business.</span>
            <span className="block">
              Auto-posting{" "}
              <span className="relative inline-block">
                <span key={wordIndex} className="inline-flex">
                  {words[wordIndex].split("").map((char, i) => (
                    <span
                      key={`${wordIndex}-${i}`}
                      className="inline-block animate-char-in"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      {char}
                    </span>
                  ))}
                </span>
                <span className="absolute -bottom-2 left-0 right-0 h-3 bg-foreground/10" />
              </span>
            </span>
          </h1>
        </div>
        <div
          className={`max-w-xl transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed mb-8">
            Paste your website. AI analyzes your brand. DeepSeek writes your
            posts, FLUX generates your images. You review and approve — all from
            Telegram.
          </p>
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <Button
              size="lg"
              className="bg-foreground hover:bg-foreground/90 text-background px-8 h-14 text-base rounded-full group"
              asChild
            >
              <a href="/auth">
                Start free trial
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 text-base rounded-full border-foreground/20 hover:bg-foreground/5"
              asChild
            >
              <a href="#how-it-works">See how it works</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
