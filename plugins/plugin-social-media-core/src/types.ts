/**
 * Core type definitions for @elizaos/plugin-social-media-core.
 *
 * Covers the Rome travel agency social media automation domain:
 * platforms, content formats, scheduling, trend signals, and performance data.
 */

/** Supported social media platforms for Rome travel content. */
export type Platform =
  | "instagram"
  | "tiktok"
  | "pinterest"
  | "youtube"
  | "facebook"
  | "linkedin";

/** Content format variants across platforms. */
export type ContentFormat =
  | "reel"
  | "carousel"
  | "story"
  | "feed_post"
  | "short"
  | "long_form"
  | "pin"
  | "ugc";

/**
 * Content category following the 60/30/10 content mix rule.
 * - inspirational: 60% — aspirational Rome travel imagery and storytelling
 * - educational: 30% — tips, history, insider knowledge
 * - promotional: 10% — direct offers, packages, CTAs
 */
export type ContentCategory = "inspirational" | "educational" | "promotional";

/** Lifecycle status of a scheduled social media post. */
export type PostStatus = "draft" | "scheduled" | "published" | "failed";

/**
 * A social media post at any stage of its lifecycle.
 * Created by SCHEDULE_POST, published by PUBLISH_POST.
 */
export interface ScheduledPost {
  /** Unique identifier for the post. */
  id: string;
  /** Target platform for publication. */
  platform: Platform;
  /** Content format to be used. */
  format: ContentFormat;
  /** Content category (drives the 60/30/10 mix). */
  category: ContentCategory;
  /** Caption text or script for the post. */
  content: string;
  /** URL of the image asset, if applicable. */
  imageUrl?: string | undefined;
  /** URL of the video asset, if applicable. */
  videoUrl?: string | undefined;
  /** ISO 8601 timestamp for when the post should go live. */
  scheduledTime: string;
  /** Current lifecycle status. */
  status: PostStatus;
}

/**
 * Trending content signal for Rome/Italy travel on a given platform.
 * Produced by ANALYZE_TRENDS.
 */
export interface TrendData {
  /** Platform where this trend was observed. */
  platform: Platform;
  /** Primary hashtag driving the trend. */
  hashtag: string;
  /** Engagement rate as a decimal (e.g. 0.045 = 4.5%). */
  engagementRate: number;
  /** Velocity score 0–100 indicating how fast the trend is rising. */
  velocityScore: number;
  /** Recommended content format for this trend. */
  contentFormat: ContentFormat;
  /** Sample caption demonstrating the trend voice and hook structure. */
  caption: string;
  /** Trending audio track name, if applicable (TikTok/Reels). */
  audioTrend?: string | undefined;
}

/**
 * A content brief produced by GENERATE_CONTENT.
 * Provides the creative direction for producing a single post asset.
 */
export interface ContentBrief {
  /** Opening hook line designed to stop the scroll within 3 seconds. */
  hook: string;
  /** Description of the visual direction for the asset. */
  visualDirection: string;
  /** Recommended hashtags for reach and discoverability. */
  hashtags: string[];
  /** Target content format. */
  format: ContentFormat;
  /** Target platform. */
  platform: Platform;
  /** Reference trend that informed this brief, if any. */
  trendSource?: string | undefined;
}

/**
 * Performance metrics for a published post.
 * Returned by the PERFORMANCE_DASHBOARD provider and getPostPerformance().
 */
export interface PostPerformance {
  /** ID of the post this data belongs to. */
  postId: string;
  /** Platform where the post was published. */
  platform: Platform;
  /** Total impressions (reach × frequency). */
  impressions: number;
  /** Total engagements (likes + comments + shares + saves). */
  engagement: number;
  /** Number of saves / bookmarks. */
  saves: number;
  /** Number of shares / reposts. */
  shares: number;
  /** Link clicks to the agency website or booking page. */
  clicks: number;
  /** Attributed booking conversions. */
  conversions: number;
}

/** Service type constant for the social media service registry. */
export const SOCIAL_MEDIA_SERVICE_TYPE = "SOCIAL_MEDIA" as const;

/** Log prefix used across all modules in this plugin. */
export const SOCIAL_MEDIA_LOG_PREFIX = "[plugin-social-media-core]" as const;

/**
 * Optimal posting window per platform.
 * Times are expressed as human-readable descriptions used in scheduling logic.
 */
export const OPTIMAL_POSTING_TIMES: Record<Platform, string> = {
  instagram: "Tue–Thu 11am–1pm, 7–9pm",
  tiktok: "Tue/Thu 2–5pm, Fri 7–9pm",
  pinterest: "Evening (7–11pm)",
  youtube: "Thu–Fri 2–4pm",
  facebook: "Tue–Fri 9am–1pm",
  linkedin: "Tue–Thu 7–8am, 12pm",
} as const;
