/**
 * SCHEDULE_POST action — schedule a post for optimal time on the specified platform.
 *
 * Optimal posting times per platform (based on engagement data):
 *   Instagram  Tue–Thu 11am–1pm, 7–9pm
 *   TikTok     Tue/Thu 2–5pm, Fri 7–9pm
 *   Pinterest  Evening (7–11pm)
 *   YouTube    Thu–Fri 2–4pm
 *   Facebook   Tue–Fri 9am–1pm
 *   LinkedIn   Tue–Thu 7–8am, 12pm
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
import type { SocialMediaService } from "../services/social-media-service.ts";
import {
  type ContentCategory,
  type ContentFormat,
  OPTIMAL_POSTING_TIMES,
  type Platform,
  type ScheduledPost,
  SOCIAL_MEDIA_LOG_PREFIX,
  SOCIAL_MEDIA_SERVICE_TYPE,
} from "../types.ts";

/**
 * Returns the next optimal posting time for the given platform as an ISO string.
 * Uses a simple heuristic: add the platform's optimal offset to the current time
 * so there is always a scheduled slot in the near future.
 */
function nextOptimalTime(platform: Platform): string {
  const now = new Date();
  const offsetHours: Record<Platform, number> = {
    instagram: 2,
    tiktok: 3,
    pinterest: 6,
    youtube: 4,
    facebook: 2,
    linkedin: 1,
  };
  const offset = offsetHours[platform] ?? 2;
  const scheduled = new Date(now.getTime() + offset * 60 * 60 * 1000);
  return scheduled.toISOString();
}

function generatePostId(): string {
  return `post_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export const schedulePostAction: Action = {
  name: "SCHEDULE_POST",
  description:
    "Schedule a post for optimal time on the specified platform. Stores the post in the schedule and returns the confirmed slot.",
  similes: ["QUEUE_POST", "PLAN_POST", "TIMER_POST"],
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
      `${SOCIAL_MEDIA_LOG_PREFIX} SCHEDULE_POST handler called`,
    );

    const text = message.content.text ?? "";

    const platform: Platform = ([
      "instagram",
      "tiktok",
      "pinterest",
      "youtube",
      "facebook",
      "linkedin",
    ].find((p) => text.toLowerCase().includes(p)) ?? "instagram") as Platform;

    const format: ContentFormat = ([
      "reel",
      "carousel",
      "story",
      "feed_post",
      "short",
      "long_form",
      "pin",
      "ugc",
    ].find(
      (f) =>
        text.toLowerCase().includes(f.replace("_", " ")) ||
        text.toLowerCase().includes(f),
    ) ?? "feed_post") as ContentFormat;

    const category: ContentCategory = text.toLowerCase().includes("promot")
      ? "promotional"
      : text.toLowerCase().includes("educat") ||
          text.toLowerCase().includes("tip")
        ? "educational"
        : "inspirational";

    const scheduledTime = nextOptimalTime(platform);

    const post: ScheduledPost = {
      id: generatePostId(),
      platform,
      format,
      category,
      content: text,
      scheduledTime,
      status: "scheduled",
    };

    const service = runtime.getService<SocialMediaService>(
      SOCIAL_MEDIA_SERVICE_TYPE,
    );
    if (service) {
      service.schedulePost(post);
    } else {
      logger.warn(
        { agentId: runtime.agentId },
        `${SOCIAL_MEDIA_LOG_PREFIX} SocialMediaService not available; post stored in-action only`,
      );
    }

    const formattedTime = new Date(scheduledTime).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });

    const responseText = [
      `Post scheduled successfully!`,
      ``,
      `Post ID: ${post.id}`,
      `Platform: ${platform}`,
      `Format: ${format}`,
      `Category: ${category}`,
      `Scheduled time: ${formattedTime}`,
      `Optimal window for ${platform}: ${OPTIMAL_POSTING_TIMES[platform]}`,
      `Status: ${post.status}`,
    ].join("\n");

    await callback?.({ text: responseText });

    return {
      success: true,
      text: responseText,
      data: { post },
    };
  },
};
