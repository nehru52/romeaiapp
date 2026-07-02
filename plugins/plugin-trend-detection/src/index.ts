/**
 * @elizaos/plugin-trend-detection
 *
 * Social media trend scraping and analysis for Rome/Italy travel content.
 *
 * Provides:
 *   Actions:
 *     SCRAPE_TRENDS      — scrape trending content from social platforms
 *     ANALYZE_TRENDS     — identify content gaps and rising hashtags
 *     RECOMMEND_CONTENT  — generate content recommendations from trends
 *
 *   Providers:
 *     TRENDS_INSIGHTS    — injects trending topics and gap analysis
 *
 *   Services:
 *     TrendScraperService — scraping, analysis, recommendation engine
 *
 *   Evaluators:
 *     TREND_RELEVANCE    — scores content against current trends
 */

import {
  type IAgentRuntime,
  logger,
  type Plugin,
  type RegisteredEvaluator,
} from "@elizaos/core";
import { analyzeTrendsAction } from "./actions/analyze-trends.ts";
import { recommendContentAction } from "./actions/recommend-content.ts";
import { scrapeTrendsAction } from "./actions/scrape-trends.ts";
import { trendRelevanceEvaluator } from "./evaluators/trend-relevance-evaluator.ts";
import { trendInsightsProvider } from "./providers/trend-insights-provider.ts";
import { TrendScraperService } from "./services/trend-scraper-service.ts";
import { TREND_LOG_PREFIX } from "./types.ts";

export { analyzeTrendsAction } from "./actions/analyze-trends.ts";
export { recommendContentAction } from "./actions/recommend-content.ts";
export { scrapeTrendsAction } from "./actions/scrape-trends.ts";
export { trendRelevanceEvaluator } from "./evaluators/trend-relevance-evaluator.ts";
export { trendInsightsProvider } from "./providers/trend-insights-provider.ts";
export { TrendScraperService } from "./services/trend-scraper-service.ts";
// Re-export all public types and utilities.
export * from "./types.ts";
export * from "./utils/config.ts";

export const trendDetectionPlugin: Plugin = {
  name: "trend-detection",
  description:
    "Social media trend scraping and analysis for Rome/Italy travel content",

  actions: [scrapeTrendsAction, analyzeTrendsAction, recommendContentAction],

  providers: [trendInsightsProvider],

  services: [TrendScraperService],

  evaluators: [trendRelevanceEvaluator as unknown as RegisteredEvaluator],

  async init(
    _config: Record<string, string>,
    runtime: IAgentRuntime,
  ): Promise<void> {
    logger.info(
      { agentId: runtime.agentId },
      `${TREND_LOG_PREFIX} plugin initialised`,
    );
  },

  tests: [
    {
      name: "trend-detection-smoke",
      tests: [
        {
          name: "Types are importable",
          fn: async (_runtime: IAgentRuntime) => {
            const { VIRAL_HOOK_FORMULAS, ROME_TRAVEL_HASHTAGS } = await import(
              "./types.ts"
            );
            if (VIRAL_HOOK_FORMULAS.length < 3) {
              throw new Error("VIRAL_HOOK_FORMULAS is too short");
            }
            if (ROME_TRAVEL_HASHTAGS.length < 10) {
              throw new Error("ROME_TRAVEL_HASHTAGS is too short");
            }
            logger.success("Types smoke test passed");
          },
        },
        {
          name: "TrendScraperService scrape and analyze",
          fn: async (runtime: IAgentRuntime) => {
            const service = runtime.getService<TrendScraperService>(
              TrendScraperService.serviceType,
            );
            if (!service) {
              logger.warn("TrendScraperService not registered — skipping");
              return;
            }
            const trends = await service.scrapeTrends(
              "instagram",
              "destination",
            );
            if (trends.length === 0) {
              throw new Error("No trends returned from scrapeTrends");
            }
            const analysis = await service.analyzeTrends(trends);
            if (analysis.topTrends.length === 0) {
              throw new Error("analyzeTrends returned empty topTrends");
            }
            const recs = await service.getRecommendations(analysis);
            if (recs.length === 0) {
              throw new Error("getRecommendations returned empty array");
            }
            logger.success("TrendScraperService scrape/analyze test passed");
          },
        },
      ],
    },
  ],
};

export default trendDetectionPlugin;
