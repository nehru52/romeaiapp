/**
 * SCRAPE_TRENDS action — scrapes trending Rome/Italy travel content
 * from social media platforms.
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
import { TrendScraperService } from "../services/trend-scraper-service.ts";
import type { ScrapedTrend } from "../types.js";
import { TREND_LOG_PREFIX } from "../types.js";

export const scrapeTrendsAction: Action = {
  name: "SCRAPE_TRENDS",
  description:
    "Scrape trending Rome/Italy travel content from social media platforms using Apify, SocialCrawl, or Firecrawl",
  similes: ["SCRAPE_TRENDS", "FETCH_TRENDS", "GET_TRENDS", "SCAN_TRENDS"],
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
      `${TREND_LOG_PREFIX} SCRAPE_TRENDS handler called`,
    );

    const text = message.content.text ?? "";
    const lowerText = text.toLowerCase();

    // Extract platform from message, default to instagram.
    const platform =
      ["instagram", "tiktok", "pinterest", "youtube", "twitter"].find((p) =>
        lowerText.includes(p),
      ) ?? "instagram";

    // Extract category from message, default to destination.
    const category =
      ["food", "culture", "budget", "luxury", "adventure", "seasonal"].find(
        (c) => lowerText.includes(c),
      ) ?? "destination";

    const service = runtime.getService<TrendScraperService>(
      TrendScraperService.serviceType,
    );

    if (!service) {
      const errorMsg = "TrendScraperService not registered";
      logger.error(`${TREND_LOG_PREFIX} ${errorMsg}`);
      return { success: false, text: errorMsg };
    }

    const trends = await service.scrapeTrends(platform, category);

    const rising = trends.filter((t: ScrapedTrend) => t.isRising);
    const topEngagement = [...trends]
      .sort(
        (a: ScrapedTrend, b: ScrapedTrend) =>
          b.engagementRate - a.engagementRate,
      )
      .slice(0, 3);

    const responseText = [
      `Scraped ${trends.length} trends for ${platform} (${category}):`,
      "",
      `Rising trends: ${rising.length}`,
      `Top hashtags: ${topEngagement.map((t: ScrapedTrend) => t.hashtag).join(", ")}`,
      `Avg engagement: ${((trends.reduce((sum: number, t: ScrapedTrend) => sum + t.engagementRate, 0) / trends.length) * 100).toFixed(1)}%`,
      "",
      "Use ANALYZE_TRENDS for gap analysis and content recommendations.",
    ].join("\n");

    await callback?.({ text: responseText });

    return {
      success: true,
      text: responseText,
      data: { trends, platform, category, count: trends.length },
    };
  },
};
