"use client";

import { Eye, FileCheck, Lock, Shield } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const items = [
  {
    icon: <Lock className="w-6 h-6" />,
    title: "Your API keys, encrypted",
    description:
      "All platform credentials stored with AES-256 encryption. Never logged. Never exposed in content.",
  },
  {
    icon: <Eye className="w-6 h-6" />,
    title: "Human approval gate",
    description:
      "Content never publishes without your review. You see every post before it goes live — always.",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "GDPR compliant",
    description:
      "Built for European travel agencies. All data stays in EU regions. Full privacy controls.",
  },
  {
    icon: <FileCheck className="w-6 h-6" />,
    title: "Content provenance",
    description:
      "Every AI-generated post is watermarked with its source model, date, and approval chain.",
  },
];

export function SecuritySection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 lg:py-32">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="mb-16 lg:mb-24">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
            <span className="w-8 h-px bg-foreground/30" />
            Trust
          </span>
          <h2
            className={`text-4xl lg:text-6xl font-display tracking-tight transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            Your brand. Your control.
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((item, i) => (
            <div
              key={item.title}
              className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center mb-4 text-foreground/70">
                {item.icon}
              </div>
              <h3 className="font-medium mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
