/**
 * ANALYZE_TRENDS action — analyze current trending content for Rome/Italy travel.
 *
 * Returns mock trend data representative of real patterns observed across
 * social platforms for the Rome travel niche. In production this would call
 * platform analytics APIs (TikTok Research API, Instagram Insights, etc.).
 */

import {
  type Action,
  type ActionResult,
  type HandlerCallback,
  type HandlerOptions,
  type IAgentRuntime,
  logger,
  type Memory,
  type State,
} from "@elizaos/core";
import { SOCIAL_MEDIA_LOG_PREFIX, type TrendData } from "../types.ts";

const ROME_TRAVEL_TRENDS: TrendData[] = [
  {
    platform: "tiktok",
    hashtag: "#romestreetfood",
    engagementRate: 0.087,
    velocityScore: 94,
    contentFormat: "reel",
    caption:
      "POV: You're eating the best cacio e pepe of your life at a tiny trattoria near Trastevere 🍝 #romestreetfood #italianfood #rome",
    audioTrend: "Bella Ciao (lo-fi remix)",
  },
  {
    platform: "instagram",
    hashtag: "#hiddenrome",
    engagementRate: 0.062,
    velocityScore: 81,
    contentFormat: "carousel",
    caption:
      "5 hidden piazzas in Rome that tourists always miss 🏛️ Save this for your trip! #hiddenrome #rome #traveltips",
  },
  {
    platform: "pinterest",
    hashtag: "#romanholiday",
    engagementRate: 0.041,
    velocityScore: 73,
    contentFormat: "pin",
    caption:
      "Complete Rome itinerary for 3 days — from the Colosseum to the best gelato spots 🍦 #romanholiday #rome #italy",
  },
  {
    platform: "youtube",
    hashtag: "#rometravelguide",
    engagementRate: 0.054,
    velocityScore: 68,
    contentFormat: "long_form",
    caption:
      "Rome in 4K | Ultimate travel guide 2024 — everything you need to know before you go 📽️ #rometravelguide",
    audioTrend: "Cinematic Travel Score (royalty-free)",
  },
  {
    platform: "instagram",
    hashtag: "#colosseumsunset",
    engagementRate: 0.079,
    velocityScore: 88,
    contentFormat: "reel",
    caption:
      "The Colosseum at golden hour is something else entirely ✨ #colosseumsunset #rome #italy #travel",
    audioTrend: "Golden Hour — JVKE",
  },
  {
    platform: "tiktok",
    hashtag: "#italytravel2024",
    engagementRate: 0.095,
    velocityScore: 97,
    contentFormat: "short",
    caption:
      "Things nobody tells you before visiting Rome 🤫 (saving this post = sending love) #italytravel2024 #rome",
    audioTrend: "It Girl — Toosii",
  },
  {
    platform: "facebook",
    hashtag: "#rometravelgroup",
    engagementRate: 0.033,
    velocityScore: 55,
    contentFormat: "feed_post",
    caption:
      "Planning your Rome trip? Here are the 10 must-sees for 2024 that every visitor should know about 🗺️",
  },
  {
    platform: "linkedin",
    hashtag: "#italytourism",
    engagementRate: 0.028,
    velocityScore: 48,
    contentFormat: "feed_post",
    caption:
      "How Rome's tourism industry is adapting to the experience economy — insights from the ground 🏛️ #italytourism",
  },
];

function summarizeTrends(trends: TrendData[]): string {
  const topByVelocity = [...trends]
    .sort((a, b) => b.velocityScore - a.velocityScore)
    .slice(0, 3);

  const lines = [
    "Trending Rome/Italy travel content analysis:",
    "",
    "Top viral patterns (by velocity score):",
    ...topByVelocity.map(
      (t) =>
        `  • ${t.platform} | ${t.hashtag} | velocity: ${t.velocityScore}/100 | engagement: ${(t.engagementRate * 100).toFixed(1)}%`,
    ),
    "",
    "Recommended hook structures:",
    '  • "POV: You\'re in Rome doing X…"',
    '  • "Things nobody tells you before visiting Rome…"',
    '  • "X hidden [places/foods/experiences] in Rome"',
    "",
    "Trending hashtag clusters:",
    "  Tier 1 (broadest reach): #rome #italy #italytravel",
    "  Tier 2 (mid-range):      #hiddenrome #rometips #romanholiday",
    "  Tier 3 (niche authority): #rometravelguide #colosseumsunset",
    "",
    "Best content formats this week:",
    "  TikTok: short-form POV reels (15–30s) with trending audio",
    "  Instagram: educational carousels (5–8 slides) with save CTAs",
    "  Pinterest: long-form pins with complete itineraries",
  ];

  return lines.join("\n");
}

export const analyzeTrendsAction: Action = {
  name: "ANALYZE_TRENDS",
  description:
    "Analyze current trending content for Rome/Italy travel. Returns viral patterns, hashtag clusters, and hook structures.",
  similes: ["CHECK_TRENDS", "TREND_SCAN", "VIRAL_CHECK"],
  validate: async (_runtime: IAgentRuntime): Promise<boolean> => true,
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    _state?: State,
    _options?: HandlerOptions,
    callback?: HandlerCallback,
  ): Promise<ActionResult> => {
    logger.info(
      { agentId: runtime.agentId },
      `${SOCIAL_MEDIA_LOG_PREFIX} ANALYZE_TRENDS handler called`,
    );

    const text = message.content.text ?? "";

    // Filter trends by platform if specified.
    const requestedPlatform = [
      "instagram",
      "tiktok",
      "pinterest",
      "youtube",
      "facebook",
      "linkedin",
    ].find((p) => text.toLowerCase().includes(p));

    const relevantTrends = requestedPlatform
      ? ROME_TRAVEL_TRENDS.filter((t) => t.platform === requestedPlatform)
      : ROME_TRAVEL_TRENDS;

    const summary = summarizeTrends(relevantTrends);

    await callback?.({ text: summary });

    return {
      success: true,
      text: summary,
      data: {
        trends: relevantTrends,
        analyzedAt: new Date().toISOString(),
        platformFilter: requestedPlatform ?? "all",
      },
    };
  },
};
