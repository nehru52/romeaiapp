/**
 * @elizaos/plugin-social-media-core
 *
 * Core social media automation for Rome travel agencies.
 *
 * Provides:
 *   Actions:
 *     GENERATE_CONTENT   — create content briefs using the 60/30/10 mix rule
 *     SCHEDULE_POST      — schedule posts at optimal platform times
 *     PUBLISH_POST       — immediately publish scheduled posts
 *     ANALYZE_TRENDS     — scan viral Rome/Italy travel content patterns
 *
 *   Providers:
 *     CONTENT_STRATEGY   — injects 60/30/10 strategy + viral formulas into context
 *     PERFORMANCE_DASHBOARD — aggregated cross-platform metrics
 *
 *   Services:
 *     SocialMediaService — in-memory post store, scheduling, publishing, analytics
 *
 *   Evaluators:
 *     CONTENT_QUALITY    — scores content against Rome travel quality criteria
 */

import {
  type IAgentRuntime,
  logger,
  type Plugin,
  type RegisteredEvaluator,
} from "@elizaos/core";
import { analyzeTrendsAction } from "./actions/analyze-trends.ts";
import { generateContentAction } from "./actions/generate-content.ts";
import { publishPostAction } from "./actions/publish-post.ts";
import { schedulePostAction } from "./actions/schedule-post.ts";
import { contentQualityEvaluator } from "./evaluators/content-quality-evaluator.ts";
import { contentStrategyProvider } from "./providers/content-strategy-provider.ts";
import { performanceProvider } from "./providers/performance-provider.ts";
import { SocialMediaService } from "./services/social-media-service.ts";
import { SOCIAL_MEDIA_LOG_PREFIX } from "./types.ts";

export { analyzeTrendsAction } from "./actions/analyze-trends.ts";
export { generateContentAction } from "./actions/generate-content.ts";
export { publishPostAction } from "./actions/publish-post.ts";
export { schedulePostAction } from "./actions/schedule-post.ts";
export { contentQualityEvaluator } from "./evaluators/content-quality-evaluator.ts";
export { contentStrategyProvider } from "./providers/content-strategy-provider.ts";
export { performanceProvider } from "./providers/performance-provider.ts";
export { SocialMediaService } from "./services/social-media-service.ts";
// Re-export all public types and utilities.
export * from "./types.ts";
export * from "./utils/config.ts";

export const socialMediaCorePlugin: Plugin = {
  name: "social-media-core",
  description: "Core social media automation for Rome travel agencies",

  actions: [
    generateContentAction,
    schedulePostAction,
    publishPostAction,
    analyzeTrendsAction,
  ],

  providers: [contentStrategyProvider, performanceProvider],

  services: [SocialMediaService],

  evaluators: [contentQualityEvaluator as unknown as RegisteredEvaluator],

  async init(
    _config: Record<string, string>,
    runtime: IAgentRuntime,
  ): Promise<void> {
    logger.info(
      { agentId: runtime.agentId },
      `${SOCIAL_MEDIA_LOG_PREFIX} plugin initialised`,
    );
  },

  tests: [
    {
      name: "social-media-core-smoke",
      tests: [
        {
          name: "Types are importable",
          fn: async (_runtime: IAgentRuntime) => {
            const { OPTIMAL_POSTING_TIMES } = await import("./types.ts");
            if (!OPTIMAL_POSTING_TIMES.instagram) {
              throw new Error("OPTIMAL_POSTING_TIMES.instagram is missing");
            }
            logger.success("Types smoke test passed");
          },
        },
        {
          name: "SocialMediaService schedule and retrieve",
          fn: async (runtime: IAgentRuntime) => {
            const service = runtime.getService<SocialMediaService>(
              SocialMediaService.serviceType,
            );
            if (!service) {
              logger.warn(
                "SocialMediaService not registered — skipping service test",
              );
              return;
            }
            const post = service.schedulePost({
              id: "test_post_001",
              platform: "instagram",
              format: "feed_post",
              category: "inspirational",
              content: "Test post content #rome",
              scheduledTime: new Date().toISOString(),
              status: "scheduled",
            });
            const posts = service.getScheduledPosts();
            if (!posts.some((p) => p.id === post.id)) {
              throw new Error(
                "Scheduled post not found in getScheduledPosts()",
              );
            }
            logger.success("SocialMediaService schedule/retrieve test passed");
          },
        },
      ],
    },
  ],
};

export default socialMediaCorePlugin;
