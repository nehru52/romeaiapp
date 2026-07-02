/**
 * Configuration utilities for @elizaos/plugin-image-generation.
 *
 * Reads API keys and budget configuration from environment variables.
 * All getters return undefined when the variable is not set so callers
 * can decide whether to fall back to mock mode or throw.
 */

import { DEFAULT_MONTHLY_BUDGET } from "../types.ts";

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
// Model API keys
// ---------------------------------------------------------------------------

/** Black Forest Labs API key for FLUX.2 Pro ($0.055/img). */
export function getFluxApiKey(): string | undefined {
  return getEnvOptional("FLUX_API_KEY");
}

/** Ideogram API key for text-heavy carousels and infographics ($0.03/img). */
export function getIdeogramApiKey(): string | undefined {
  return getEnvOptional("IDEOGRAM_API_KEY");
}

/** Seedream API key for brand-consistent UGC and 4K character reference ($0.03/img). */
export function getSeedreamApiKey(): string | undefined {
  return getEnvOptional("SEEDREAM_API_KEY");
}

/** Google Imagen 4 Ultra API key for premium brand assets ($0.06/img). */
export function getImagenApiKey(): string | undefined {
  return getEnvOptional("IMAGEN_API_KEY");
}

/** xAI Grok Imagine API key for fast Stories content ($0.07/img). */
export function getGrokApiKey(): string | undefined {
  return getEnvOptional("GROK_API_KEY");
}

// ---------------------------------------------------------------------------
// Budget configuration
// ---------------------------------------------------------------------------

/**
 * Monthly image generation budget in USD.
 * Reads IMAGE_MONTHLY_BUDGET from the environment; defaults to $50.
 */
export function getMonthlyBudget(): number {
  const raw = getEnvOptional("IMAGE_MONTHLY_BUDGET");
  if (!raw) {
    return DEFAULT_MONTHLY_BUDGET;
  }
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : DEFAULT_MONTHLY_BUDGET;
}
