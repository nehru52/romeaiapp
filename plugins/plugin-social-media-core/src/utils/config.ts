/**
 * Configuration utilities for @elizaos/plugin-social-media-core.
 *
 * Reads platform credentials and API configuration from environment variables.
 * All getters follow the pattern: return the env var if set, otherwise return
 * the provided default (or undefined).
 */

/**
 * Returns the value of an environment variable, or a default if not set.
 */
export function getEnvOrDefault(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}

/**
 * Returns the value of an environment variable, or undefined if not set.
 */
export function getEnvOptional(key: string): string | undefined {
  return process.env[key];
}

// ---------------------------------------------------------------------------
// Platform credentials
// ---------------------------------------------------------------------------

/** Instagram Graph API access token. */
export function getInstagramAccessToken(): string | undefined {
  return getEnvOptional("INSTAGRAM_ACCESS_TOKEN");
}

/** TikTok API access token. */
export function getTikTokAccessToken(): string | undefined {
  return getEnvOptional("TIKTOK_ACCESS_TOKEN");
}

/** Pinterest API access token. */
export function getPinterestAccessToken(): string | undefined {
  return getEnvOptional("PINTEREST_ACCESS_TOKEN");
}

/** YouTube Data API access token. */
export function getYouTubeAccessToken(): string | undefined {
  return getEnvOptional("YOUTUBE_ACCESS_TOKEN");
}

/** Facebook Graph API access token. */
export function getFacebookAccessToken(): string | undefined {
  return getEnvOptional("FACEBOOK_ACCESS_TOKEN");
}

/** LinkedIn API access token. */
export function getLinkedInAccessToken(): string | undefined {
  return getEnvOptional("LINKEDIN_ACCESS_TOKEN");
}

// ---------------------------------------------------------------------------
// DeepSeek API configuration
// ---------------------------------------------------------------------------

/** DeepSeek API key for content generation. */
export function getDeepSeekApiKey(): string | undefined {
  return getEnvOptional("DEEPSEEK_API_KEY");
}

/** DeepSeek API base URL. Defaults to the public DeepSeek endpoint. */
export function getDeepSeekApiUrl(): string {
  return getEnvOrDefault("DEEPSEEK_API_URL", "https://api.deepseek.com/v1");
}
