"use client";

import { useState } from "react";

export function DevelopersSection() {
  return (
    <section id="developers" className="relative py-24 lg:py-32 bg-foreground text-background overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 40px, currentColor 40px, currentColor 41px)` }} />
      </div>
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-flex items-center gap-3 text-sm font-mono text-background/50 mb-6"><span className="w-8 h-px bg-background/30" />Tech Stack</span>
            <h2 className="text-4xl lg:text-6xl font-display tracking-tight mb-6">Powered by the best AI models. Open source at the core.</h2>
            <p className="text-lg text-background/60 leading-relaxed mb-8">
              DeepSeek V4 Pro for strategy. FLUX.2 Pro for photorealistic images. Kling 3.0 for cinematic reels. ElevenLabs for voiceover. Apify for trend data. All orchestrated by elizaOS — the open-source agent framework. Self-host or let us run it. Your choice.
            </p>
            <div className="flex flex-wrap gap-3">
              {["DeepSeek V4", "FLUX.2 Pro", "Ideogram 3.0", "Kling 3.0", "Veo 3.1", "ElevenLabs", "Apify", "elizaOS"].map((tech) => (
                <span key={tech} className="px-4 py-2 border border-background/20 text-sm font-mono text-background/60">{tech}</span>
              ))}
            </div>
          </div>
          <div className="lg:pl-12">
            <div className="border border-background/10 p-8 font-mono text-sm">
              <div className="text-background/30 mb-4">// Your content engine config</div>
              <div className="space-y-1 text-background/70">
                <div><span className="text-background/30">models</span> = {'{'}</div>
                <div className="pl-4">strategy: <span className="text-green-400">"deepseek-v4-pro"</span>,</div>
                <div className="pl-4">images: <span className="text-green-400">"flux-2-pro"</span>,</div>
                <div className="pl-4">video: <span className="text-green-400">"kling-3"</span>,</div>
                <div className="pl-4">voice: <span className="text-green-400">"elevenlabs-v2"</span></div>
                <div>{'}'}</div>
              </div>
              <div className="mt-6 space-y-1 text-background/70">
                <div><span className="text-background/30">platforms</span> = ['<span className="text-green-400">instagram</span>', '<span className="text-green-400">tiktok</span>', '<span className="text-green-400">pinterest</span>', '<span className="text-green-400">youtube</span>']</div>
              </div>
              <div className="mt-6 space-y-1 text-background/70">
                <div><span className="text-background/30">postsPerMonth</span> = <span className="text-amber-400">40</span></div>
                <div><span className="text-background/30">monthlyCost</span> = <span className="text-amber-400">"€86"</span></div>
                <div><span className="text-background/30">roi</span> = <span className="text-green-400">11.6</span> <span className="text-background/30">// x</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
