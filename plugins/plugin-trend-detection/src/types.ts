/**
 * Core type definitions for @elizaos/plugin-trend-detection.
 *
 * Covers trend scraping, analysis, and content recommendation
 * for the Rome/Italy travel social media niche.
 */

/** Supported trend scraping sources. */
export type TrendSource = "apify" | "socialcrawl" | "firecrawl" | "manual";

/** Platforms where trends are tracked. */
export type TrendPlatform =
  | "instagram"
  | "tiktok"
  | "pinterest"
  | "youtube"
  | "twitter";

/** Content category for trend classification. */
export type TrendCategory =
  | "destination"
  | "food"
  | "culture"
  | "budget"
  | "luxury"
  | "adventure"
  | "seasonal";

/** A single scraped trend signal from social media. */
export interface ScrapedTrend {
  /** Unique identifier. */
  id: string;
  /** Platform where observed. */
  platform: TrendPlatform;
  /** Source that produced this trend. */
  source: TrendSource;
  /** Content category. */
  category: TrendCategory;
  /** Primary hashtag driving the trend. */
  hashtag: string;
  /** Engagement rate as a decimal (e.g. 0.045 = 4.5%). */
  engagementRate: number;
  /** Velocity score 0-100 indicating how fast the trend is rising. */
  velocityScore: number;
  /** Sample captions demonstrating the trend voice. */
  sampleCaptions: string[];
  /** Top posts for this trend. */
  topPosts: { url: string; likes: number; comments: number }[];
  /** Related hashtags. */
  relatedHashtags: string[];
  /** ISO 8601 timestamp of when this was scraped. */
  timestamp: string;
  /** Whether this trend is currently rising. */
  isRising: boolean;
}

/** Aggregated trend analysis result. */
export interface TrendAnalysis {
  /** Top trends sorted by velocity. */
  topTrends: ScrapedTrend[];
  /** Hashtags with highest growth velocity. */
  risingHashtags: string[];
  /** Content gaps — topics with demand but low supply. */
  contentGaps: string[];
  /** Recommended content angles based on analysis. */
  recommendedAngles: string[];
  /** Competitor insights. */
  competitorInsights: {
    competitor: string;
    topPost: string;
    engagement: number;
  }[];
}

/** A content recommendation derived from trend analysis. */
export interface ContentRecommendation {
  /** The angle / topic to cover. */
  angle: string;
  /** Suggested hook line. */
  suggestedHook: string;
  /** Best platform for this content. */
  targetPlatform: TrendPlatform;
  /** Best format for this content. */
  targetFormat: string;
  /** Recommended hashtags. */
  hashtags: string[];
  /** Priority level. */
  priority: "high" | "medium" | "low";
  /** Estimated engagement based on current trends. */
  estimatedEngagement: number;
}

/** Service type constant for the trend detection service registry. */
export const TREND_SERVICE_TYPE = "TREND_DETECTION" as const;

/** Log prefix used across all modules in this plugin. */
export const TREND_LOG_PREFIX = "[plugin-trend-detection]" as const;

/**
 * Proven viral hook formulas for Rome travel content.
 */
export const VIRAL_HOOK_FORMULAS = [
  "I wish I knew this before...",
  "This vs That comparison",
  "POV: You are...",
  "The real reason...",
  "Stop doing X, do Y instead",
  "X things I wish I knew before visiting Rome",
] as const;

/**
 * Popular Rome travel hashtags for trend comparison.
 */
export const ROME_TRAVEL_HASHTAGS = [
  "#RomeTravel",
  "#VisitRome",
  "#ItalyTravel",
  "#RomeFood",
  "#HiddenRome",
  "#RomeGuide",
  "#ItalyVacation",
  "#RomeDiaries",
  "#RomeItinerary",
  "#RomeTips",
  "#RomeOnABudget",
  "#RomeInspo",
  "#RomeVibes",
  "#RomeWithKids",
  "#RomeSoloTravel",
  "#RomeLuxury",
  "#RomePhotography",
  "#RomeArt",
  "#RomeHistory",
  "#RomeLocal",
] as const;
