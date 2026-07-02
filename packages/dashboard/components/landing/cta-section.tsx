"use client";

import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.3 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-32 lg:py-40">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 text-center">
        <div
          className={`transition-all duration-1000 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
        >
          <h2 className="text-5xl lg:text-8xl font-display tracking-tight mb-8 leading-[0.95]">
            Your next customer
            <br />
            starts with one post.
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
            Stop doing social media manually. Stop guessing what content
            converts. <br className="hidden lg:block" />
            Let AI handle it — while you run your business.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-foreground hover:bg-foreground/90 text-background px-10 h-14 text-base rounded-full group"
              asChild
            >
              <a href="/auth">
                Start your free trial
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
            <p className="text-sm text-muted-foreground">
              14-day trial. Set up in 5 minutes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
