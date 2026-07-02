"use client";

import { useEffect, useState } from "react";

const testimonials = [
  {
    quote:
      "We got 40 posts in one click. Our Instagram went from dead to 3 posts a day. Bookings doubled.",
    author: "Marco R.",
    role: "Founder, Tour Operator",
    avatar: "MR",
  },
  {
    quote:
      "I didn't believe AI could match our brand voice. Then it generated a carousel that got 12K saves. We sold out that week.",
    author: "Elena V.",
    role: "Owner, Boutique Hotel",
    avatar: "EV",
  },
  {
    quote:
      "Pasted my restaurant's website. Ten minutes later I had a week of content. Now I just approve and it posts.",
    author: "Priya K.",
    role: "Chef & Owner, Bistro",
    avatar: "PK",
  },
  {
    quote:
      "The auto-replies handle DMs while I'm with patients. My clinic's Instagram runs itself now.",
    author: "James T.",
    role: "Dentist, Private Practice",
    avatar: "JT",
  },
  {
    quote:
      "We manage 12 properties. This replaced our $2K/month social media agency. Same quality. 90% cheaper.",
    author: "Lisa M.",
    role: "Director, Real Estate Group",
    avatar: "LM",
  },
];

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(
      () => setActiveIndex((prev) => (prev + 1) % testimonials.length),
      6000,
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-24 lg:py-32 bg-foreground text-background overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 40px, currentColor 40px, currentColor 41px)`,
          }}
        />
      </div>
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="mb-16 lg:mb-24">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-background/50 mb-6">
            <span className="w-8 h-px bg-background/30" />
            Testimonials
          </span>
          <h2
            className={`text-4xl lg:text-6xl font-display tracking-tight transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            Trusted by businesses.
            <br />
            <span className="text-background/50">Across every industry.</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative h-[300px]">
            {testimonials.map((t, i) => (
              <div
                key={t.author}
                className={`absolute inset-0 transition-all duration-700 ${i === activeIndex ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"}`}
              >
                <blockquote className="text-2xl lg:text-3xl font-display leading-relaxed mb-8">
                  "{t.quote}"
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-background/10 flex items-center justify-center text-sm font-medium">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-medium">{t.author}</p>
                    <p className="text-sm text-background/50">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {testimonials.map((t, i) => (
              <button
                key={t.author}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={`w-full text-left p-4 border-b border-background/10 transition-all duration-300 ${i === activeIndex ? "opacity-100" : "opacity-30 hover:opacity-60"}`}
              >
                <p className="text-sm font-medium">{t.author}</p>
                <p className="text-xs text-background/50">{t.role}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
