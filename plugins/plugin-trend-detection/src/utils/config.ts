/**
 * Configuration helpers for @elizaos/plugin-trend-detection.
 *
 * Reads API keys and settings from environment variables.
 */

/** Get the Apify API key for social media scraping. */
export function getApifyApiKey(): string | undefined {
  return process.env.APIFY_API_KEY || undefined;
}

/** Get the SocialCrawl API key. */
export function getSocialCrawlApiKey(): string | undefined {
  return process.env.SOCIALCRAWL_API_KEY || undefined;
}

/** Get the Firecrawl API key. */
export function getFirecrawlApiKey(): string | undefined {
  return process.env.FIRECRAWL_API_KEY || undefined;
}

/** Get the primary trend source. */
export function getTrendSource(): string {
  return process.env.TREND_SOURCE ?? "apify";
}

/** Get the scraping interval in hours. */
export function getScrapeIntervalHours(): number {
  const raw = process.env.SCRAPE_INTERVAL_HOURS;
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : 6;
}
