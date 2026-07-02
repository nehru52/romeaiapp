"use client";

import { useEffect, useRef, useState } from "react";

const integrations = [
  { name: "Instagram", category: "Social Media" },
  { name: "TikTok", category: "Social Media" },
  { name: "Pinterest", category: "Social Media" },
  { name: "YouTube", category: "Social Media" },
  { name: "Facebook", category: "Social Media" },
  { name: "LinkedIn", category: "Social Media" },
  { name: "FLUX.2 Pro", category: "AI Image" },
  { name: "Ideogram 3.0", category: "AI Image" },
  { name: "Kling 3.0", category: "AI Video" },
  { name: "Veo 3.1", category: "AI Video" },
  { name: "DeepSeek V4", category: "AI Strategy" },
  { name: "ElevenLabs", category: "Voiceover" },
  { name: "Calendly", category: "Booking" },
  { name: "ConvertKit", category: "Email" },
  { name: "Apify", category: "Trend Data" },
  { name: "Medium", category: "Blog" },
  { name: "Carrd", category: "Landing Pages" },
  { name: "Zernio", category: "Scheduling" },
];

export function IntegrationsSection() {
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
    <section
      ref={sectionRef}
      className="relative py-24 lg:py-32 overflow-hidden"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="mb-16 lg:mb-24">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
            <span className="w-8 h-px bg-foreground/30" />
            Integrations
          </span>
          <h2
            className={`text-4xl lg:text-6xl font-display tracking-tight transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            Everything connects.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl">
            18+ APIs already wired. Social platforms, AI models, booking tools,
            email marketing — all connected out of the box.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {integrations.map((item, i) => (
            <div
              key={item.name}
              className={`p-6 border border-foreground/10 hover:border-foreground/30 transition-all duration-500 text-center ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ transitionDelay: `${i * 50}ms` }}
            >
              <p className="text-sm font-medium">{item.name}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {item.category}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
