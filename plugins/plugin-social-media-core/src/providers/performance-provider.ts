/**
 * PERFORMANCE_DASHBOARD provider — injects aggregated social media performance metrics.
 *
 * Reads from SocialMediaService when available. Falls back to placeholder text
 * when no published posts exist yet.
 */

import type {
  IAgentRuntime,
  Memory,
  Provider,
  ProviderResult,
  State,
} from "@elizaos/core";
import type { SocialMediaService } from "../services/social-media-service.ts";
import {
  type Platform,
  type PostPerformance,
  SOCIAL_MEDIA_SERVICE_TYPE,
} from "../types.ts";

function formatPerformanceSummary(performances: PostPerformance[]): string {
  if (performances.length === 0) {
    return "No published posts with performance data yet. Schedule and publish posts to see metrics here.";
  }

  const byPlatform = new Map<Platform, PostPerformance[]>();
  for (const perf of performances) {
    const existing = byPlatform.get(perf.platform) ?? [];
    byPlatform.set(perf.platform, [...existing, perf]);
  }

  const totalImpressions = performances.reduce(
    (sum, p) => sum + p.impressions,
    0,
  );
  const totalEngagement = performances.reduce(
    (sum, p) => sum + p.engagement,
    0,
  );
  const totalConversions = performances.reduce(
    (sum, p) => sum + p.conversions,
    0,
  );
  const avgEngagementRate =
    totalImpressions > 0
      ? ((totalEngagement / totalImpressions) * 100).toFixed(2)
      : "0.00";

  const platformLines: string[] = [];
  for (const [platform, perfs] of byPlatform) {
    const imp = perfs.reduce((s, p) => s + p.impressions, 0);
    const eng = perfs.reduce((s, p) => s + p.engagement, 0);
    const rate = imp > 0 ? ((eng / imp) * 100).toFixed(2) : "0.00";
    platformLines.push(
      `  ${platform}: ${perfs.length} post(s) | ${imp.toLocaleString()} impressions | ${rate}% engagement`,
    );
  }

  return [
    "Social Media Performance Dashboard",
    "",
    `Total posts tracked: ${performances.length}`,
    `Total impressions: ${totalImpressions.toLocaleString()}`,
    `Total engagement: ${totalEngagement.toLocaleString()}`,
    `Avg engagement rate: ${avgEngagementRate}%`,
    `Total conversions: ${totalConversions}`,
    "",
    "By platform:",
    ...platformLines,
  ].join("\n");
}

export const performanceProvider: Provider = {
  name: "PERFORMANCE_DASHBOARD",
  description:
    "Provides social media performance metrics across all platforms for the Rome travel agency",
  dynamic: true,
  contexts: ["social", "automation", "general"],
  contextGate: { anyOf: ["social", "automation", "general"] },
  cacheStable: false,
  async get(
    runtime: IAgentRuntime,
    _message: Memory,
    _state: State,
  ): Promise<ProviderResult> {
    const service = runtime.getService<SocialMediaService>(
      SOCIAL_MEDIA_SERVICE_TYPE,
    );

    const performances: PostPerformance[] = [];

    if (service) {
      const publishedPosts = service
        .getScheduledPosts()
        .filter((p) => p.status === "published");

      for (const post of publishedPosts) {
        const perf = service.getPostPerformance(post.id);
        if (perf) {
          performances.push(perf);
        }
      }
    }

    const summaryText = formatPerformanceSummary(performances);

    return {
      text: summaryText,
      values: {
        postCount: performances.length,
        totalImpressions: performances.reduce((s, p) => s + p.impressions, 0),
        totalConversions: performances.reduce((s, p) => s + p.conversions, 0),
      },
      data: { performances },
    };
  },
};
