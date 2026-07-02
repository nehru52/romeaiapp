/**
 * RECOMMEND_CONTENT action — generates content recommendations
 * based on current trend analysis.
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
import type { ContentRecommendation } from "../types.js";
import { TREND_LOG_PREFIX } from "../types.js";

export const recommendContentAction: Action = {
  name: "RECOMMEND_CONTENT",
  description:
    "Generate content recommendations based on current trend analysis and viral formulas",
  similes: [
    "RECOMMEND_CONTENT",
    "CONTENT_IDEAS",
    "WHAT_TO_POST",
    "POST_IDEAS",
    "CONTENT_SUGGESTIONS",
  ],
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
      `${TREND_LOG_PREFIX} RECOMMEND_CONTENT handler called`,
    );

    const service = runtime.getService<TrendScraperService>(
      TrendScraperService.serviceType,
    );

    if (!service) {
      const errorMsg = "TrendScraperService not registered";
      logger.error(`${TREND_LOG_PREFIX} ${errorMsg}`);
      return { success: false, text: errorMsg };
    }

    const trends = await service.scrapeTrends("instagram", "destination");
    const analysis = await service.analyzeTrends(trends);
    const recommendations = await service.getRecommendations(analysis);

    const highPriority = recommendations.filter(
      (r: ContentRecommendation) => r.priority === "high",
    );
    const medPriority = recommendations.filter(
      (r: ContentRecommendation) => r.priority === "medium",
    );

    const responseText = [
      "Content Recommendations — Rome Travel",
      "══════════════════════════════════════",
      "",
      `Generated ${recommendations.length} recommendations from ${trends.length} trends`,
      "",
      "🔴 HIGH PRIORITY:",
      ...highPriority.map(
        (r: ContentRecommendation, i: number) =>
          `  ${i + 1}. [${r.targetPlatform}/${r.targetFormat}] ${r.angle}\n     Hook: "${r.suggestedHook}"\n     Est. engagement: ${r.estimatedEngagement}`,
      ),
      "",
      "🟡 MEDIUM PRIORITY:",
      ...medPriority.map(
        (r: ContentRecommendation, i: number) =>
          `  ${i + 1}. [${r.targetPlatform}/${r.targetFormat}] ${r.angle}`,
      ),
      "",
      "Use GENERATE_CONTENT to create a full brief for any recommendation.",
    ].join("\n");

    await callback?.({ text: responseText });

    return {
      success: true,
      text: responseText,
      data: { recommendations, highPriority: highPriority.length },
    };
  },
};
