/**
 * Landing page — light theme, professional, conversion-focused.
 */

import Link from "next/link";

const features = [
  { icon: "🔍", title: "Website Analysis", desc: "We scan your site, detect your niche, and generate a complete UI/UX audit — automatically." },
  { icon: "📅", title: "30-Day Content Plan", desc: "Get a full month of posts, reels, and carousels tailored to your industry and audience." },
  { icon: "🤖", title: "AI Content Engine", desc: "DeepSeek-powered generation creates scroll-stopping content that actually converts." },
  { icon: "📊", title: "Approval Workflow", desc: "Review, approve, or request changes via dashboard or Telegram before anything goes live." },
  { icon: "🎨", title: "Brand Voice Learning", desc: "We analyze your website's tone, vocabulary, and style to match your brand perfectly." },
  { icon: "⚡", title: "One-Click Setup", desc: "Enter your website URL. That's it. Our AI handles everything else in under 60 seconds." },
];

const packs = [
  { icon: "✈️", name: "Travel & Tours", desc: "Agencies, tour operators, DMCs, cruise lines" },
  { icon: "🏠", name: "Real Estate", desc: "Agents, brokerages, luxury properties, rentals" },
  { icon: "🍽️", name: "Restaurants", desc: "Cafes, bars, food trucks, caterers, delivery" },
  { icon: "💪", name: "Fitness", desc: "Gyms, personal trainers, nutrition coaches" },
  { icon: "🦷", name: "Medical & Dental", desc: "Clinics, dentists, dermatologists, med spas" },
  { icon: "⚡", name: "Custom", desc: "Any business, any niche, any platform" },
];

const steps = [
  { num: "1", title: "Enter your website", desc: "Paste your URL — we scan everything automatically." },
  { num: "2", title: "Get your audit", desc: "Receive a full UI/UX report plus niche detection in seconds." },
  { num: "3", title: "Review your calendar", desc: "See your 30-day content plan with posts, reels, and stories." },
  { num: "4", title: "Approve & publish", desc: "Review content via dashboard or Telegram. Approve with one click." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-bold text-lg">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            Optimus AI
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Sign In</Link>
            <Link href="/login" className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors">Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-indigo-50" />
        <div className="absolute top-20 right-0 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-violet-200/40 to-indigo-200/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-amber-200/30 to-rose-200/20 blur-3xl" />
        <div className="relative max-w-4xl mx-auto px-4 py-24 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-700 text-xs font-medium mb-6">
            ✨ Now powered by DeepSeek Reasoner
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
            Turn any website into a
            <br />
            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 bg-clip-text text-transparent">
              fully automated social media engine
            </span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Paste your URL. Get a UI/UX audit, niche detection, and a 30-day content calendar — all powered by AI. Your business runs itself on social media.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/login" className="inline-flex items-center px-8 py-3.5 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors text-sm shadow-lg shadow-gray-900/10">
              Get Started Free →
            </Link>
            <Link href="/login" className="inline-flex items-center px-8 py-3.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm">
              View Demo
            </Link>
          </div>
          <p className="mt-4 text-xs text-gray-400">No credit card required · Free tier includes 5 posts/month</p>
        </div>
      </section>

      {/* Logos / Trust */}
      <section className="border-y border-gray-100 bg-gray-50/50">
        <div className="max-w-4xl mx-auto px-4 py-8 flex items-center justify-center gap-8 flex-wrap">
          <span className="text-xs font-medium text-gray-300 uppercase tracking-wider">Trusted by agencies worldwide</span>
          <span className="text-sm font-bold text-gray-400">✈️ Travel</span>
          <span className="text-sm font-bold text-gray-400">🏠 Real Estate</span>
          <span className="text-sm font-bold text-gray-400">🍽️ Food</span>
          <span className="text-sm font-bold text-gray-400">💪 Fitness</span>
          <span className="text-sm font-bold text-gray-400">🦷 Medical</span>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold tracking-tight mb-3">How it works</h2>
          <p className="text-gray-500 max-w-lg mx-auto">Four steps from website URL to fully automated social media presence.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((s) => (
            <div key={s.num} className="relative text-center group">
              <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-900 font-bold text-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-900 group-hover:text-white transition-colors">{s.num}</div>
              <h3 className="font-semibold mb-1.5">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight mb-3">Everything you need</h2>
            <p className="text-gray-500 max-w-lg mx-auto">AI-powered tools that handle your entire social media presence.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="font-semibold mb-1.5">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Packs */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold tracking-tight mb-3">Pre-built for your industry</h2>
          <p className="text-gray-500 max-w-lg mx-auto">Every niche gets custom AI prompts, hashtag strategies, and content calendars.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {packs.map((p) => (
            <div key={p.name} className="text-center p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
              <div className="text-2xl mb-2">{p.icon}</div>
              <h3 className="text-sm font-semibold mb-1">{p.name}</h3>
              <p className="text-[11px] text-gray-400 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Ready to automate your social media?</h2>
          <p className="text-gray-400 max-w-md mx-auto mb-8">Join agencies and businesses using Optimus AI to run their entire social presence on autopilot.</p>
          <Link href="/login" className="inline-flex items-center px-8 py-3.5 rounded-xl bg-white text-gray-900 font-semibold hover:bg-gray-100 transition-colors text-sm">
            Get Started Free →
          </Link>
          <p className="mt-4 text-xs text-gray-500">Free tier · 5 posts/month · No credit card</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            Optimus AI
          </div>
          <div className="flex items-center gap-6 text-xs text-gray-400">
            <Link href="/login" className="hover:text-gray-600 transition-colors">Sign In</Link>
            <span>Terms</span>
            <span>Privacy</span>
            <span>© 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
