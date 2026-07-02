"use client";

import { useEffect, useRef, useState } from "react";

const features = [
  {
    name: "Content Engine",
    description:
      "AI generates posts, carousels, reels, blogs, and email sequences using your brand voice and product catalog.",
  },
  {
    name: "Smart Scheduling",
    description:
      "Posts go live at optimal times per platform. Instagram Tue-Thu 11am. TikTok Tue/Thu 2pm. Pinterest evenings.",
  },
  {
    name: "Analytics & Learning",
    description:
      "Track engagement, saves, shares, clicks, and bookings. The engine learns what works and adapts.",
  },
];

export function InfrastructureSection() {
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
            How it runs
          </span>
          <h2
            className={`text-4xl lg:text-6xl font-display tracking-tight transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            Set it. Forget it.
            <br />
            <span className="text-muted-foreground">Wake up to bookings.</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div
              key={f.name}
              className={`p-8 border border-foreground/10 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="w-2 h-2 rounded-full bg-foreground mb-6" />
              <h3 className="text-xl font-display mb-3">{f.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
