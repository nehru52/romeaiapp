import Link from "next/link";
import { Zap } from "lucide-react";

const FOOTER_LINKS = {
  Product: ["Features", "How it works", "Pricing", "Industry packs", "Changelog"],
  Resources: ["Documentation", "API reference", "Blog", "Guides", "Help center"],
  Company: ["About", "Careers", "Contact", "Partners", "Press kit"],
  Legal: ["Privacy policy", "Terms of service", "Cookie policy", "GDPR", "Security"],
};

export function FooterSection() {
  return (
    <footer className="border-t border-border/50">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-16">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Zap className="w-5 h-5" />
              Optimus AI
            </Link>
            <p className="text-xs text-muted-foreground/60 leading-relaxed max-w-[200px]">
              AI-powered social media automation for businesses of every size and industry.
            </p>
          </div>

          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold tracking-wider text-muted-foreground/40 uppercase mb-4">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      href="/"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground/40">
            &copy; {new Date().getFullYear()} Optimus AI. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/30 font-mono">
            Powered by DeepSeek Reasoner
          </p>
        </div>
      </div>
    </footer>
  );
}
