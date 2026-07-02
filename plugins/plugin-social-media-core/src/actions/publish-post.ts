/**
 * PUBLISH_POST action — immediately publish a scheduled post to the target platform.
 *
 * In production this would call the platform API via the appropriate access token.
 * Currently marks the post as published in the in-memory store and logs the intent.
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
  SOCIAL_MEDIA_LOG_PREFIX,
  SOCIAL_MEDIA_SERVICE_TYPE,
} from "../types.ts";

export const publishPostAction: Action = {
  name: "PUBLISH_POST",
  description:
    "Immediately publish a scheduled post to the target platform. Updates the post status to published.",
  similes: ["POST_NOW", "SEND_POST"],
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
      `${SOCIAL_MEDIA_LOG_PREFIX} PUBLISH_POST handler called`,
    );

    const text = message.content.text ?? "";

    // Extract post ID from message if provided.
    const postIdMatch = text.match(/post_\d+_[a-z0-9]+/);
    const postId = postIdMatch?.[0];

    const service = runtime.getService<SocialMediaService>(
      SOCIAL_MEDIA_SERVICE_TYPE,
    );

    if (!service) {
      const errorText =
        "SocialMediaService is not available. Ensure the plugin is correctly initialised.";
      logger.error(
        { agentId: runtime.agentId },
        `${SOCIAL_MEDIA_LOG_PREFIX} ${errorText}`,
      );
      await callback?.({ text: errorText });
      return { success: false, text: errorText };
    }

    if (!postId) {
      // No specific post id — publish all scheduled posts.
      const scheduled = service
        .getScheduledPosts()
        .filter((p) => p.status === "scheduled");

      if (scheduled.length === 0) {
        const noPostsText = "No scheduled posts found to publish.";
        await callback?.({ text: noPostsText });
        return { success: true, text: noPostsText, data: { published: [] } };
      }

      const published = scheduled
        .map((p) => service.publishPost(p.id))
        .filter(Boolean);

      const responseText = [
        `Published ${published.length} post(s):`,
        ...published.map(
          (p) =>
            `  - Post ${p?.id ?? "unknown"} on ${p?.platform ?? "unknown"}: ${p?.status ?? "unknown"}`,
        ),
      ].join("\n");

      await callback?.({ text: responseText });
      return { success: true, text: responseText, data: { published } };
    }

    const published = service.publishPost(postId);

    if (!published) {
      const notFoundText = `Post ${postId} not found in the schedule.`;
      await callback?.({ text: notFoundText });
      return { success: false, text: notFoundText };
    }

    const responseText = [
      `Post published successfully!`,
      ``,
      `Post ID: ${published.id}`,
      `Platform: ${published.platform}`,
      `Status: ${published.status}`,
      `Published at: ${new Date().toISOString()}`,
    ].join("\n");

    await callback?.({ text: responseText });

    return {
      success: true,
      text: responseText,
      data: { post: published },
    };
  },
};
