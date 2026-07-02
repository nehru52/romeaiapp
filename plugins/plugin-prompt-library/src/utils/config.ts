/**
 * Configuration helpers for @elizaos/plugin-prompt-library.
 *
 * Reads prompt library settings from environment variables.
 */

/** Get the default model for new prompts. */
export function getDefaultModel(): string {
  return process.env.DEFAULT_MODEL ?? "deepseek-v4-pro";
}

/** Check if prompt caching is enabled. */
export function getPromptCacheEnabled(): boolean {
  const raw = process.env.PROMPT_CACHE_ENABLED;
  if (raw === undefined || raw === "true") return true;
  return false;
}
