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
    <section id="pricing" ref={ref} className="relative py-32 lg:py-40 border-t border-border/50">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
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
            Simple, transparent
            <br />
            <span className="text-stroke">pricing.</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Start free. Upgrade when you&apos;re ready. No hidden fees, no surprises.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-px bg-border/50 max-w-5xl mx-auto overflow-hidden rounded-2xl stagger-children">
          {TIERS.map((tier, i) => (
            <div
              key={tier.name}
              className={`relative p-8 lg:p-12 bg-background transition-all duration-700 ${
                tier.featured ? "md:-my-4 md:py-12 lg:py-16 border-2 border-foreground rounded-2xl z-10" : ""
              } ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {tier.featured && (
                <span className="absolute -top-3 left-8 px-3 py-1 bg-brand-amber text-background text-xs font-mono uppercase tracking-widest rounded-full">
                  Most popular
                </span>
              )}

              {/* Tier Header */}
              <div className="mb-8">
                <span className="font-mono text-xs text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-3xl mt-2">{tier.name}</h3>
                <p className="text-sm text-muted-foreground mt-2">{tier.desc}</p>
              </div>

              {/* Price */}
              <div className="mb-8 pb-8 border-b border-border/50">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-5xl lg:text-6xl">{tier.price}</span>
                  <span className="text-muted-foreground">{tier.period}</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-10">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-foreground mt-0.5 shrink-0" />
                    <span className="text-sm text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                asChild
                size="lg"
                className={`w-full rounded-full group ${
                  tier.featured
                    ? "bg-foreground hover:bg-foreground/90 text-background"
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

        {/* Bottom Note */}
        <p className="mt-12 text-center text-sm text-muted-foreground">
          All plans include automatic updates, HTTPS, and DDoS protection.{" "}
          <a href="#" className="underline underline-offset-4 hover:text-foreground transition-colors">
            Compare all features
          </a>
        </p>
      </div>
    </section>
  );
}
