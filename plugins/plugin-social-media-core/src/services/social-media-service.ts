/**
 * SocialMediaService — main orchestration service for @elizaos/plugin-social-media-core.
 *
 * Manages the in-memory post store and exposes scheduling, publishing, and
 * performance query methods used by the plugin's actions.
 */

import { type IAgentRuntime, logger, Service } from "@elizaos/core";
import {
  type PostPerformance,
  type ScheduledPost,
  SOCIAL_MEDIA_LOG_PREFIX,
  SOCIAL_MEDIA_SERVICE_TYPE,
} from "../types.ts";

export class SocialMediaService extends Service {
  static override readonly serviceType = SOCIAL_MEDIA_SERVICE_TYPE;

  override capabilityDescription =
    "Social media scheduling, publishing, and performance tracking for Rome travel content.";

  /** In-memory store keyed by post id. */
  private readonly posts = new Map<string, ScheduledPost>();

  static override async start(
    runtime: IAgentRuntime,
  ): Promise<SocialMediaService> {
    logger.info(
      { agentId: runtime.agentId },
      `${SOCIAL_MEDIA_LOG_PREFIX} starting SocialMediaService`,
    );
    return new SocialMediaService(runtime);
  }

  override async stop(): Promise<void> {
    logger.info(`${SOCIAL_MEDIA_LOG_PREFIX} stopping SocialMediaService`);
    this.posts.clear();
  }

  // ---------------------------------------------------------------------------
  // Scheduling
  // ---------------------------------------------------------------------------

  /**
   * Store a new post in the in-memory schedule.
   * Returns the stored post (unchanged — caller already built the object).
   */
  schedulePost(post: ScheduledPost): ScheduledPost {
    this.posts.set(post.id, post);
    logger.info(
      {
        postId: post.id,
        platform: post.platform,
        scheduledTime: post.scheduledTime,
      },
      `${SOCIAL_MEDIA_LOG_PREFIX} post scheduled`,
    );
    return post;
  }

  /**
   * Returns all posts currently in the store, sorted by scheduledTime ascending.
   */
  getScheduledPosts(): ScheduledPost[] {
    return Array.from(this.posts.values()).sort((a, b) =>
      a.scheduledTime.localeCompare(b.scheduledTime),
    );
  }

  /**
   * Cancel a scheduled post by id.
   * Returns the cancelled post, or undefined if not found.
   */
  cancelScheduledPost(postId: string): ScheduledPost | undefined {
    const post = this.posts.get(postId);
    if (!post) {
      logger.warn(
        { postId },
        `${SOCIAL_MEDIA_LOG_PREFIX} cancelScheduledPost: post not found`,
      );
      return undefined;
    }
    const cancelled: ScheduledPost = { ...post, status: "failed" };
    this.posts.set(postId, cancelled);
    logger.info({ postId }, `${SOCIAL_MEDIA_LOG_PREFIX} post cancelled`);
    return cancelled;
  }

  // ---------------------------------------------------------------------------
  // Publishing
  // ---------------------------------------------------------------------------

  /**
   * Mark a post as published.
   * In production this would call the platform API; here it updates status only.
   * Returns the updated post, or undefined if not found.
   */
  publishPost(postId: string): ScheduledPost | undefined {
    const post = this.posts.get(postId);
    if (!post) {
      logger.warn(
        { postId },
        `${SOCIAL_MEDIA_LOG_PREFIX} publishPost: post not found`,
      );
      return undefined;
    }
    const published: ScheduledPost = { ...post, status: "published" };
    this.posts.set(postId, published);
    logger.info(
      { postId, platform: post.platform },
      `${SOCIAL_MEDIA_LOG_PREFIX} post published`,
    );
    return published;
  }

  // ---------------------------------------------------------------------------
  // Performance
  // ---------------------------------------------------------------------------

  /**
   * Returns mock performance data for a given post id.
   *
   * In production this would query the platform analytics APIs.
   * Values are seeded deterministically from the postId so repeated calls
   * return consistent numbers during a session.
   */
  getPostPerformance(postId: string): PostPerformance | undefined {
    const post = this.posts.get(postId);
    if (!post) {
      logger.warn(
        { postId },
        `${SOCIAL_MEDIA_LOG_PREFIX} getPostPerformance: post not found`,
      );
      return undefined;
    }

    // Deterministic seed from postId length for consistent mock data.
    const seed = postId.length;
    const impressions = 1000 + seed * 47;
    const engagement = Math.floor(impressions * 0.04);
    const saves = Math.floor(engagement * 0.2);
    const shares = Math.floor(engagement * 0.15);
    const clicks = Math.floor(engagement * 0.1);
    const conversions = Math.floor(clicks * 0.05);

    return {
      postId,
      platform: post.platform,
      impressions,
      engagement,
      saves,
      shares,
      clicks,
      conversions,
    };
  }
}
