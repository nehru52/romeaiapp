/**
 * ANALYZE_TRENDS action — analyzes scraped trends to identify
 * content gaps, rising hashtags, and recommended angles.
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
import { TREND_LOG_PREFIX } from "../types.js";

export const analyzeTrendsAction: Action = {
  name: "ANALYZE_TRENDS",
  description:
    "Analyze scraped trends to identify content gaps, rising hashtags, and recommended content angles",
  similes: ["ANALYZE_TRENDS", "TREND_ANALYSIS", "CONTENT_GAPS", "TREND_REPORT"],
  validate: async (_runtime: IAgentRuntime): Promise<boolean> => true,
  handler: async (
    runtime: IAgentRuntime,
    _message: Memory,
    _state?: State,
    _options?: HandlerOptions,
    callback?: HandlerCallback,
  ): Promise<ActionResult> => {
    logger.info(
      { agentId: runtime.agentId },
      `${TREND_LOG_PREFIX} ANALYZE_TRENDS handler called`,
    );

    const service = runtime.getService<TrendScraperService>(
      TrendScraperService.serviceType,
    );

    if (!service) {
      const errorMsg = "TrendScraperService not registered";
      logger.error(`${TREND_LOG_PREFIX} ${errorMsg}`);
      return { success: false, text: errorMsg };
    }

    // First scrape, then analyze.
    const trends = await service.scrapeTrends("instagram", "destination");
    const analysis = await service.analyzeTrends(trends);

    const responseText = [
      "Trend Analysis Report — Rome Travel",
      "═══════════════════════════════════",
      "",
      `Top trending hashtags (${analysis.topTrends.length} analyzed):`,
      ...analysis.topTrends
        .slice(0, 5)
        .map(
          (t, i) =>
            `  ${i + 1}. ${t.hashtag} — velocity: ${t.velocityScore}, engagement: ${(t.engagementRate * 100).toFixed(1)}%`,
        ),
      "",
      "Rising hashtags:",
      `  ${analysis.risingHashtags.slice(0, 8).join(", ")}`,
      "",
      "Content gaps identified:",
      ...analysis.contentGaps.map((g) => `  → ${g}`),
      "",
      "Recommended angles:",
      ...analysis.recommendedAngles.map((a) => `  ✦ ${a}`),
      "",
      "Competitor insights:",
      ...analysis.competitorInsights.map(
        (c) =>
          `  ${c.competitor}: "${c.topPost}" (${c.engagement.toLocaleString()} engagements)`,
      ),
    ].join("\n");

    await callback?.({ text: responseText });

    return {
      success: true,
      text: responseText,
      data: { analysis },
    };
  },
};
