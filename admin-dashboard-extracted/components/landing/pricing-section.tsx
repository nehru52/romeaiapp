"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";

const TIERS = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    desc: "Perfect for trying out the platform.",
    features: [
      "5 posts per month",
      "1 website scan",
      "Basic brand voice detection",
      "Email support",
      "1 industry pack",
    ],
    cta: "Get started",
    href: "/login",
    featured: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    desc: "For growing businesses and agencies.",
    features: [
      "Unlimited posts",
      "Unlimited website scans",
      "Full 30-day content calendar",
      "Advanced brand voice learning",
      "All 6 industry packs",
      "Telegram bot approval",
      "Priority AI generation",
      "Analytics dashboard",
    ],
    cta: "Start free trial",
    href: "/login",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For agencies and large teams.",
    features: [
      "Everything in Pro",
      "White-label dashboard",
      "Custom industry packs",
      "API access",
      "Dedicated account manager",
      "SLA guarantee",
      "Custom integrations",
      "Team collaboration",
    ],
    cta: "Contact sales",
    href: "/login",
    featured: false,
  },
];

export function PricingSection() {
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
    <section id="pricing" ref={ref} className="relative py-24 lg:py-32 bg-foreground/[0.02] border-y border-border/50">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="text-center mb-16 lg:mb-24">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
            <span className="w-8 h-px bg-foreground/30" />
            Pricing
          </span>
          <h2
            className={`text-4xl lg:text-6xl font-display tracking-tight mb-4 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Simple, transparent pricing.
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Start free. Upgrade when you&apos;re ready. No hidden fees, no surprises.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {TIERS.map((tier, i) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl p-8 transition-all duration-700 ${
                tier.featured
                  ? "bg-foreground text-background ring-2 ring-foreground"
                  : "bg-card border border-border/50 hover:border-foreground/20"
              } ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {tier.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-foreground text-background border border-background/20 text-xs font-medium">
                  Most popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-display">{tier.price}</span>
                  <span className={`text-sm ${tier.featured ? "text-background/50" : "text-muted-foreground"}`}>
                    {tier.period}
                  </span>
                </div>
                <p className={`text-sm ${tier.featured ? "text-background/60" : "text-muted-foreground"}`}>
                  {tier.desc}
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check className={`w-4 h-4 mt-0.5 shrink-0 ${tier.featured ? "text-background/70" : "text-muted-foreground"}`} />
                    <span className={tier.featured ? "text-background/80" : "text-muted-foreground"}>{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                size="lg"
                className={`w-full rounded-full group ${
                  tier.featured
                    ? "bg-background hover:bg-background/90 text-foreground"
                    : "bg-foreground hover:bg-foreground/90 text-background"
                }`}
              >
                <Link href={tier.href}>
                  {tier.cta}
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
