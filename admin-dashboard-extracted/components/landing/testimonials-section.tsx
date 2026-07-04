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
    <section ref={ref} className="relative py-24 lg:py-32">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="mb-16 lg:mb-24">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
            <span className="w-8 h-px bg-foreground/30" />
            Testimonials
          </span>
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.author}
              className={`bg-card border border-border/50 rounded-2xl p-6 hover:border-foreground/20 transition-all duration-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <svg key={j} className="w-4 h-4 text-foreground/20 fill-foreground/20" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <blockquote className="text-sm text-muted-foreground leading-relaxed mb-6">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div>
                <div className="text-sm font-semibold">{t.author}</div>
                <div className="text-xs text-muted-foreground/70">{t.role}</div>
                <div className="mt-2 inline-block px-2 py-0.5 rounded-md bg-foreground/[0.04] text-[10px] font-mono text-muted-foreground/50">
                  {t.industry}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
