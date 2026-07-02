"use client";

import { useEffect, useRef, useState } from "react";

function AnimatedCounter({
  end,
  suffix = "",
  prefix = "",
}: {
  end: number;
  suffix?: string;
  prefix?: string;
}) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.5 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const duration = 2000;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [isVisible, end]);

  return (
    <div ref={ref} className="text-5xl lg:text-7xl font-display tabular-nums">
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </div>
  );
}

const metrics = [
  { value: 40, suffix: "+", label: "Posts per month, automated" },
  { value: 6, suffix: "", label: "Platforms managed simultaneously" },
  { value: 1160, suffix: "%", label: "Average ROI for travel agencies" },
  {
    value: 86,
    prefix: "€",
    suffix: "",
    label: "Total monthly automation cost",
  },
];

export function MetricsSection() {
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
            By the numbers
          </span>
          <h2
            className={`text-4xl lg:text-6xl font-display tracking-tight transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            Content that pays for itself.
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-16">
          {metrics.map((m, i) => (
            <div
              key={m.label}
              className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <AnimatedCounter
                end={m.value}
                suffix={m.suffix}
                prefix={m.prefix}
              />
              <p className="text-sm text-muted-foreground mt-3">{m.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
