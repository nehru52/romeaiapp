"use client";

import { useEffect, useRef, useState } from "react";

const TESTIMONIALS = [
  {
    quote: "Optimus AI saved us 20+ hours per week on content creation. Our travel agency now posts daily across 4 platforms without anyone on the team touching a caption.",
    author: "Sarah Chen",
    role: "Owner, Wanderluxe Travel",
    industry: "Travel & Tours",
  },
  {
    quote: "The brand voice detection is scary good. It writes captions that sound exactly like me — our engagement is up 340% since switching to Optimus.",
    author: "Marcus Rodriguez",
    role: "Head of Marketing, FitLife Studios",
    industry: "Fitness",
  },
  {
    quote: "We were skeptical about AI-generated content, but the approval workflow gives us full control. The Telegram bot makes it dead simple to approve posts on the go.",
    author: "Dr. Priya Patel",
    role: "Founder, Radiant Dental",
    industry: "Medical & Dental",
  },
  {
    quote: "As a real estate agent, I need content that's hyper-local and timely. Optimus scans my listings and generates posts that actually drive showings.",
    author: "James Wilson",
    role: "Broker, Wilson Properties",
    industry: "Real Estate",
  },
  {
    quote: "The 30-day calendar feature alone is worth it. I can see exactly what's posting, when, and on which platform — all from one dashboard.",
    author: "Elena Torres",
    role: "Marketing Director, Tapas & Co",
    industry: "Restaurants",
  },
  {
    quote: "We white-labeled Optimus for our 40+ agency clients. The custom industry packs and API access made integration seamless. Game changer.",
    author: "David Kim",
    role: "CEO, SocialFirst Agency",
    industry: "Custom / Agency",
  },
];

export function TestimonialsSection() {
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
    <section ref={ref} className="relative py-32 lg:py-40 border-t border-border/50">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Section Label */}
        <div className="flex items-center gap-4 mb-16">
          <span className="text-sm font-mono text-muted-foreground">
            Testimonials
          </span>
          <div className="flex-1 h-px bg-border/50" />
          <span className="font-mono text-xs text-muted-foreground">
            {String(TESTIMONIALS.length).padStart(2, "0")} reviews
          </span>
        </div>

        {/* Header */}
        <div className="mb-16 lg:mb-24">
          <h2
            className={`text-4xl lg:text-6xl font-display tracking-tight transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Trusted by businesses
            <br />
            <span className="text-muted-foreground">across every industry.</span>
          </h2>
        </div>

        {/* Testimonial Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.author}
              className={`bg-card border border-border/50 rounded-2xl p-6 hover-lift transition-all duration-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {/* Stars */}
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <svg key={j} className="w-4 h-4 text-foreground/15 fill-foreground/15" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-sm text-muted-foreground leading-relaxed mb-6">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-foreground/[0.04] border border-border/50 flex items-center justify-center">
                  <span className="font-display text-lg">{t.author.charAt(0)}</span>
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.author}</div>
                  <div className="text-xs text-muted-foreground/70">{t.role}</div>
                </div>
              </div>

              {/* Industry tag */}
              <div className="mt-4 pt-4 border-t border-border/30">
                <span className="inline-block px-2 py-0.5 rounded-md bg-foreground/[0.03] text-[10px] font-mono text-muted-foreground/50">
                  {t.industry}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Trusted by marquee */}
        <div className="mt-24 pt-12 border-t border-border/50">
          <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase mb-8 text-center">
            Trusted by forward-thinking teams
          </p>
          <div className="w-full overflow-hidden">
            <div className="flex gap-16 items-center marquee">
              {Array.from({ length: 2 }).map((_, setIdx) => (
                <div key={setIdx} className="flex gap-16 items-center shrink-0">
                  {["Wanderluxe Travel", "FitLife Studios", "Radiant Dental", "Wilson Properties", "Tapas & Co", "SocialFirst Agency", "Nova Hospitality", "Atlas Realty"].map(
                    (company) => (
                      <span
                        key={`${setIdx}-${company}`}
                        className="font-display text-xl md:text-2xl text-foreground/20 whitespace-nowrap hover:text-foreground/50 transition-colors duration-300"
                      >
                        {company}
                      </span>
                    )
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
