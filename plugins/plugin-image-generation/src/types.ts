/**
 * Core type definitions for @elizaos/plugin-image-generation.
 *
 * Covers the multi-model image generation router domain:
 * models, content types, requests, results, pricing, and routing maps.
 */

/**
 * Supported image generation models.
 *
 * Each model is optimised for a different content type:
 * - flux-2-pro:      photorealistic lifestyle imagery
 * - ideogram-3:      text-in-image carousels and infographics
 * - seedream-5:      brand-consistent UGC with character reference
 * - imagen-4-ultra:  premium brand assets and polished headers
 * - grok-imagine:    fast Stories content and behind-the-scenes clips
 */
export type ImageModel =
  | "flux-2-pro"
  | "ideogram-3"
  | "seedream-5"
  | "imagen-4-ultra"
  | "grok-imagine";

/**
 * High-level content type that drives model routing.
 *
 * - photoreal:   lifestyle shots, destination imagery, golden-hour scenes
 * - text_heavy:  carousels with readable text overlays, itineraries, tips
 * - brand_asset: logos, headers, testimonial cards, polished marketing visuals
 * - ugc:         user-generated-content style, character reference, 4K native
 * - story:       vertical Stories format, quick tips, polls, behind-the-scenes
 */
export type ImageContentType =
  | "photoreal"
  | "text_heavy"
  | "brand_asset"
  | "ugc"
  | "story";

/** Input parameters for a single image generation request. */
export interface ImageRequest {
  /** Detailed generation prompt. */
  prompt: string;
  /** Content type determines model routing when model is omitted. */
  contentType: ImageContentType;
  /** Output width in pixels. Defaults to model-specific recommended value. */
  width?: number | undefined;
  /** Output height in pixels. Defaults to model-specific recommended value. */
  height?: number | undefined;
  /**
   * Override the routed model. When omitted the router picks the optimal model
   * for the given contentType.
   */
  model?: ImageModel | undefined;
  /** Reproducibility seed. Omit for a random result. */
  seed?: number | undefined;
}

/** Result returned after a successful image generation. */
export interface ImageResult {
  /** URL (or mock placeholder URL) of the generated image. */
  url: string;
  /** Model that was used to generate this image. */
  model: ImageModel;
  /** Cost in USD charged for this generation. */
  cost: number;
  /** Output width in pixels. */
  width: number;
  /** Output height in pixels. */
  height: number;
  /** Content type this result was produced for. */
  contentType: ImageContentType;
}

/** Per-image cost in USD for each model. */
export const MODEL_PRICING: Record<ImageModel, number> = {
  "flux-2-pro": 0.055,
  "ideogram-3": 0.03,
  "seedream-5": 0.03,
  "imagen-4-ultra": 0.06,
  "grok-imagine": 0.07,
} as const;

/**
 * Maps each content type to the recommended model.
 *
 * Routing rationale:
 * - photoreal    → flux-2-pro:      best photorealism for destination imagery
 * - text_heavy   → ideogram-3:      only model reliably rendering text in images
 * - brand_asset  → imagen-4-ultra:  highest polish for headers, logos, testimonials
 * - ugc          → seedream-5:      character reference and 4K native output
 * - story        → grok-imagine:    fastest turnaround for ephemeral Stories content
 */
export const ROUTING_MAP: Record<ImageContentType, ImageModel> = {
  photoreal: "flux-2-pro",
  text_heavy: "ideogram-3",
  brand_asset: "imagen-4-ultra",
  ugc: "seedream-5",
  story: "grok-imagine",
} as const;

/**
 * Default output dimensions per model (width × height in pixels).
 * Used when the caller does not specify explicit dimensions.
 */
export const MODEL_DEFAULT_DIMENSIONS: Record<
  ImageModel,
  { width: number; height: number }
> = {
  "flux-2-pro": { width: 1440, height: 1080 },
  "ideogram-3": { width: 1080, height: 1080 },
  "seedream-5": { width: 2160, height: 2160 },
  "imagen-4-ultra": { width: 1920, height: 1080 },
  "grok-imagine": { width: 1080, height: 1920 },
} as const;

/** Service type constant for the image router service registry. */
export const IMAGE_ROUTER_SERVICE_TYPE = "IMAGE_ROUTER" as const;

/** Log prefix used across all modules in this plugin. */
export const IMAGE_GEN_LOG_PREFIX = "[plugin-image-generation]" as const;

/** Default monthly image generation budget in USD. */
export const DEFAULT_MONTHLY_BUDGET = 50;

/**
 * Content mix percentages following the Rome travel agency 60/30/10 rule.
 * Used by BATCH_GENERATE to distribute 10 images per week.
 */
export const WEEKLY_CONTENT_MIX: Array<{
  contentType: ImageContentType;
  label: string;
}> = [
  { contentType: "photoreal", label: "Inspirational destination (60%)" },
  { contentType: "photoreal", label: "Inspirational lifestyle (60%)" },
  { contentType: "photoreal", label: "Inspirational golden hour (60%)" },
  { contentType: "photoreal", label: "Inspirational travel moment (60%)" },
  { contentType: "photoreal", label: "Inspirational architecture (60%)" },
  { contentType: "photoreal", label: "Inspirational food culture (60%)" },
  { contentType: "text_heavy", label: "Educational tips carousel (30%)" },
  { contentType: "text_heavy", label: "Educational itinerary carousel (30%)" },
  { contentType: "text_heavy", label: "Educational history carousel (30%)" },
  { contentType: "brand_asset", label: "Promotional offer header (10%)" },
] as const;
