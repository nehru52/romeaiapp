/**
 * CONTENT_STRATEGY provider — injects content strategy context into the LLM prompt.
 *
 * Based on the 60/30/10 content mix rule and platform-specific viral formulas
 * for Rome travel agencies.
 */

import type {
  IAgentRuntime,
  Memory,
  Provider,
  ProviderResult,
  State,
} from "@elizaos/core";

const CONTENT_STRATEGY_TEXT = `
Rome Travel Agency — Social Media Content Strategy

## 60/30/10 Content Mix Rule
- 60% Inspirational: aspirational Rome imagery, travel dreams, emotional storytelling, golden-hour visuals
- 30% Educational: travel tips, Roman history, hidden gems, local knowledge, packing guides, neighbourhood guides
- 10% Promotional: direct offers, package deals, booking CTAs, seasonal promotions, agency highlights

## Viral Content Formulas (Rome Travel Niche)

### TikTok / Reels (short-form video)
- Hook format: "POV: You're in Rome doing X…" or "Things nobody tells you about Rome…"
- Structure: Hook (3s) → Value delivery (20–30s) → Save/Follow CTA (5s)
- Best audio: trending Italian-flavoured tracks or emotional cinematic cues
- Target: 15–60 seconds

### Instagram Carousels (educational / inspirational)
- Slide 1: Bold hook question or statement (stop-the-scroll)
- Slides 2–7: One tip / fact / visual per slide
- Final slide: Save CTA + soft follow ask
- Caption: 150–300 words with 3-tier hashtag strategy

### Pinterest Pins (discovery + SEO)
- Vertical format (2:3 ratio)
- Text overlay: "X [Things / Tips / Places] in Rome You Need to Know"
- Description: 300–500 words with keyword-rich long-tail copy
- Link to agency booking page

### YouTube (long-form authority content)
- Title formula: "Rome [Year] | [Specific Promise] — Everything You Need to Know"
- Structure: Hook (30s) → Agenda (30s) → Value content → Subscribe CTA
- Target: 8–15 minutes for travel guides, 3–5 minutes for quick tips

## Platform Optimal Posting Windows
- Instagram: Tue–Thu 11am–1pm, 7–9pm
- TikTok: Tue/Thu 2–5pm, Fri 7–9pm
- Pinterest: Evening (7–11pm)
- YouTube: Thu–Fri 2–4pm
- Facebook: Tue–Fri 9am–1pm
- LinkedIn: Tue–Thu 7–8am, 12pm

## Hashtag Tiers
- Tier 1 (high volume): #rome #italy #italytravel #travel
- Tier 2 (mid-range): #hiddenrome #rometips #romanholiday #italianfood
- Tier 3 (niche): platform-specific or experience-specific tags
- Rule: 3–5 from each tier; never exceed 12 on TikTok, 30 on Instagram

## Content Quality Benchmarks
- Engagement rate target: >3.5% (Instagram), >5% (TikTok)
- Save rate target: >1% of impressions (indicates high value)
- Share rate target: >0.5% (indicates virality potential)
`.trim();

export const contentStrategyProvider: Provider = {
  name: "CONTENT_STRATEGY",
  description:
    "Provides content strategy context based on the 60/30/10 rule and Rome travel agency best practices",
  dynamic: false,
  contexts: ["social", "automation", "general"],
  contextGate: { anyOf: ["social", "automation", "general"] },
  cacheStable: true,
  cacheScope: "agent",
  async get(
    _runtime: IAgentRuntime,
    _message: Memory,
    _state: State,
  ): Promise<ProviderResult> {
    return {
      text: CONTENT_STRATEGY_TEXT,
      values: {
        contentMixRule: "60/30/10",
        platformCount: 6,
        hasViralFormulas: true,
      },
      data: {
        strategy: "60/30/10",
        platforms: [
          "instagram",
          "tiktok",
          "pinterest",
          "youtube",
          "facebook",
          "linkedin",
        ],
      },
    };
  },
};
