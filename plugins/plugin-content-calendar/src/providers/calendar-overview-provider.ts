/**
 * CALENDAR_OVERVIEW provider — injects current week's content
 * calendar and scheduling status into agent context.
 */

import type {
  IAgentRuntime,
  Memory,
  Provider,
  ProviderResult,
  State,
} from "@elizaos/core";

const CALENDAR_OVERVIEW_TEXT = `
Rome Travel — Content Calendar Overview

## Weekly Schedule Template (60/30/10 Mix)

MONDAY — 🎠 Carousel | Inspirational
  "Monday Inspiration — Rome Aesthetic"
  Best for: aspirational imagery, travel dreams

TUESDAY — 🎬 Reel | Educational
  "Tuesday Tips — Rome Travel Hack"
  Best for: quick tips, hidden gems, how-to content

WEDNESDAY — 📖 Story | Inspirational
  "Wednesday Wanderlust — Hidden Rome"
  Best for: behind-the-scenes, day-in-the-life

THURSDAY — 🎬 Reel | Educational
  "Thursday Throwback — Roman History"
  Best for: historical facts, mythology, architecture

FRIDAY — 🎠 Carousel | Promotional
  "Friday Feature — Package Spotlight"
  Best for: offers, packages, booking CTAs

SATURDAY — 📖 Story | Inspirational
  "Saturday Vibes — Weekend in Rome"
  Best for: lifestyle content, weekend energy

SUNDAY — 📝 Feed Post | Educational
  "Sunday Planning — Week Ahead Tips"
  Best for: planning guides, packing lists, prep content

## Platform Playbooks
- Instagram: 5-7 posts/week, Reels get 2x reach
- TikTok: 3-5 posts/week, first 3 seconds critical
- Pinterest: 5-10 pins/week, vertical 2:3 ratio
- YouTube: 1-2 videos/week, thumbnail is 80% of CTR
- Facebook: 3-5 posts/week, native video wins
- LinkedIn: 2-3 posts/week, industry insights work

## Content Mix Targets
- 60% Inspirational: aspirational imagery, emotional storytelling
- 30% Educational: tips, history, hidden gems, local knowledge
- 10% Promotional: direct offers, packages, booking CTAs
`.trim();

export const calendarOverviewProvider: Provider = {
  name: "CALENDAR_OVERVIEW",
  description:
    "Injects current week's content calendar and scheduling status into agent context",
  dynamic: true,
  contexts: ["CALENDAR"],
  contextGate: { anyOf: ["CALENDAR"] },
  cacheStable: false,
  cacheScope: "agent",
  async get(
    _runtime: IAgentRuntime,
    _message: Memory,
    _state: State,
  ): Promise<ProviderResult> {
    return {
      text: CALENDAR_OVERVIEW_TEXT,
      values: {
        daysPerWeek: 7,
        platforms: 6,
        postsPerWeek: 10,
        mixRule: "60/30/10",
      },
      data: {
        schedule: {
          monday: { format: "carousel", category: "inspirational" },
          tuesday: { format: "reel", category: "educational" },
          wednesday: { format: "story", category: "inspirational" },
          thursday: { format: "reel", category: "educational" },
          friday: { format: "carousel", category: "promotional" },
          saturday: { format: "story", category: "inspirational" },
          sunday: { format: "feed_post", category: "educational" },
        },
        mixTargets: {
          inspirational: 60,
          educational: 30,
          promotional: 10,
        },
      },
    };
  },
};
