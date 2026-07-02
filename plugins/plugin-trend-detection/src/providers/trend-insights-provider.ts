/**
 * TRENDS_INSIGHTS provider — injects current trending topics and
 * content gap analysis into agent context.
 */

import type {
  IAgentRuntime,
  Memory,
  Provider,
  ProviderResult,
  State,
} from "@elizaos/core";

const TREND_INSIGHTS_TEXT = `
Rome Travel — Current Trend Insights

## Trending Topics (This Week)
- "Hidden Rome" aesthetic content — underground tours, secret viewpoints
- Budget travel breakdowns — Rome on €50/day challenge videos
- Food tourism — carbonara rankings, gelato taste tests, market tours
- "Rome vs Paris" comparison posts — high engagement, high controversy
- POV immersion content — "You wake up in a Trastevere apartment..."

## Rising Hashtags
#HiddenRome (+340% this month), #RomeOnABudget (+280%), #RomeFoodTour (+195%),
#ItalyTravelTips (+156%), #RomeDiaries (+120%)

## Content Gaps
- Budget accommodation reviews (high demand, low creator supply)
- Rome with kids / family travel guides
- Accessible travel in Rome (wheelchair-friendly routes)
- Night photography spots beyond the Trevi Fountain

## Viral Formulas Working Now
1. "I wish I knew this before visiting Rome" — 3.2x avg engagement
2. "Rome vs [City]" comparison — 2.8x avg engagement, high comments
3. "POV: You're [experience]" — 2.1x avg engagement, high shares
4. "Stop doing X, do Y instead" — 1.9x avg engagement, high saves

## Competitor Activity
- @romewithlucy: 5am Colosseum content performing well (12.5K avg)
- @italyfoodie: Gelato ranking series (8.9K avg)
- @budgetrome: €50/day challenge (15.2K avg — highest in niche)
`.trim();

export const trendInsightsProvider: Provider = {
  name: "TREND_INSIGHTS",
  description:
    "Injects current trending topics and content gap analysis for Rome travel into agent context",
  dynamic: true,
  contexts: ["TREND_ANALYSIS"],
  contextGate: { anyOf: ["TREND_ANALYSIS"] },
  cacheStable: false,
  cacheScope: "agent",
  async get(
    _runtime: IAgentRuntime,
    _message: Memory,
    _state: State,
  ): Promise<ProviderResult> {
    return {
      text: TREND_INSIGHTS_TEXT,
      values: {
        trendingTopics: 5,
        risingHashtags: 5,
        contentGaps: 4,
        viralFormulas: 4,
      },
      data: {
        topHashtags: [
          "#HiddenRome",
          "#RomeOnABudget",
          "#RomeFoodTour",
          "#ItalyTravelTips",
          "#RomeDiaries",
        ],
        gaps: [
          "Budget accommodation reviews",
          "Rome with kids",
          "Accessible travel",
          "Night photography spots",
        ],
      },
    };
  },
};
