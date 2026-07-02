"use client";

import { ArrowRight, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const plans = [
  {
    name: "Starter",
    description: "For small businesses getting started with AI content.",
    monthlyPrice: 199,
    yearlyPrice: 159,
    features: [
      "2 platforms (Instagram + TikTok)",
      "20 posts per month",
      "2 blogs per month",
      "AI image generation (FLUX)",
      "Content approval via Telegram",
      "Email support",
    ],
    cta: "Get started",
    popular: false,
  },
  {
    name: "Growth",
    description: "For growing agencies that need volume across platforms.",
    monthlyPrice: 499,
    yearlyPrice: 399,
    features: [
      "4 platforms",
      "60 posts per month",
      "8 blogs per month",
      "AI image + video generation",
      "Reverse-engineer viral content",
      "Approval workflow + Telegram bot",
      "Priority support",
    ],
    cta: "Get started",
    popular: true,
  },
  {
    name: "Empire",
    description: "For agencies managing multiple clients at scale.",
    monthlyPrice: 999,
    yearlyPrice: 799,
    features: [
      "All 6 platforms",
      "200 posts per month",
      "30 blogs per month",
      "AI image + video generation",
      "Viral formula library (56 patterns)",
      "White-label ready",
      "Dedicated account manager",
    ],
    cta: "Contact sales",
    popular: false,
  },
];

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);
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
    <section id="pricing" ref={sectionRef} className="relative py-24 lg:py-32">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="mb-16 lg:mb-24">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
            <span className="w-8 h-px bg-foreground/30" />
            Pricing
          </span>
          <div className="grid lg:grid-cols-2 gap-8 items-end">
            <h2
              className={`text-4xl lg:text-6xl font-display tracking-tight transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              Costs less than one booking.
              <br />
              <span className="text-muted-foreground">Returns 11x more.</span>
            </h2>
            <div className="flex items-center gap-4 justify-start lg:justify-end">
              <span
                className={`text-sm ${!isYearly ? "text-foreground" : "text-muted-foreground"}`}
              >
                Monthly
              </span>
              <Switch checked={isYearly} onCheckedChange={setIsYearly} />
              <span
                className={`text-sm ${isYearly ? "text-foreground" : "text-muted-foreground"}`}
              >
                Yearly{" "}
                <span className="text-green-500 text-xs ml-1">Save 20%</span>
              </span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative group transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div
                className={`h-full flex flex-col p-8 border ${plan.popular ? "border-foreground shadow-2xl" : "border-foreground/10 hover:border-foreground/30"} transition-all duration-300`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-foreground text-background px-4 py-1 text-xs font-medium">
                    Most popular
                  </div>
                )}
                <div className="mb-8">
                  <h3 className="text-xl font-display mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </div>
                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-display">
                      €{isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-muted-foreground">/mo</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <Check className="w-4 h-4 mt-0.5 shrink-0 text-green-500" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full rounded-full h-12 ${plan.popular ? "bg-foreground text-background hover:bg-foreground/90" : "border-foreground/20"} group`}
                  variant={plan.popular ? "default" : "outline"}
                  asChild
                >
                  <a href="/auth">
                    {plan.cta}
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </a>
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  14-day free trial. No credit card.
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            All plans include a{" "}
            <span className="text-foreground font-medium">
              14-day free trial
            </span>
            . No credit card required. Cancel anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
