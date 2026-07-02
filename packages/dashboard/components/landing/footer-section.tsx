"use client";

import { AnimatedWave } from "./animated-wave";

const footerLinks = {
  Product: ["Features", "Pricing", "Integrations", "Changelog", "API Docs"],
  Solutions: [
    "Travel Agencies",
    "Tour Operators",
    "Hotel Groups",
    "DMCs",
    "Cruise Lines",
  ],
  Resources: ["Blog", "Case Studies", "Help Center", "Community", "Status"],
  Company: ["About", "Careers", "Contact", "Privacy", "Terms"],
};

export function FooterSection() {
  return (
    <footer className="relative bg-foreground text-background pt-24 pb-12 overflow-hidden">
      <AnimatedWave />
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
          <div className="col-span-2 md:col-span-1">
            <span className="font-display text-xl font-semibold">
              🚀 Optimus
            </span>
            <p className="text-sm text-background/50 mt-3">
              AI-powered social media automation for travel agencies.
            </p>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-medium mb-4">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-background/50 hover:text-background transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 border-t border-background/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-background/40">
            © 2026 Optimus. Built with ❤️ for travel agencies worldwide.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-background/30">hello@optimus.ai</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
