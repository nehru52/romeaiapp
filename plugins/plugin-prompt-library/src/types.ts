/**
 * Core type definitions for @elizaos/plugin-prompt-library.
 *
 * Covers prompt templates, rendering, and model-specific
 * prompt configurations for the Rome Travel Agency AI system.
 */

/** AI models used in the Rome Travel Agency system. */
export type PromptModel =
  | "deepseek-v4-pro"
  | "deepseek-v4-flash"
  | "flux-2-pro"
  | "ideogram-3"
  | "imagen-4-ultra"
  | "seedream-5"
  | "grok-imagine"
  | "veo-3.1"
  | "kling-3"
  | "runway-gen4"
  | "luma-ray"
  | "elevenlabs-v2";

/** Prompt category for organization. */
export type PromptCategory =
  | "content-strategy"
  | "image-generation"
  | "video-generation"
  | "copywriting"
  | "email-nurture"
  | "trend-analysis"
  | "caption"
  | "hashtag"
  | "hook"
  | "storytelling";

/** A reusable prompt template. */
export interface PromptTemplate {
  /** Unique identifier. */
  id: string;
  /** Human-readable name. */
  name: string;
  /** AI model this prompt is optimized for. */
  model: PromptModel;
  /** Category for organization. */
  category: PromptCategory;
  /** Description of what this prompt does. */
  description: string;
  /** Template text with {{variable}} placeholders. */
  template: string;
  /** Variable names used in the template. */
  variables: string[];
  /** Example usage. */
  example: string;
  /** Tags for search and filtering. */
  tags: string[];
}

/** A rendered prompt with variables filled in. */
export interface RenderedPrompt {
  /** ID of the source template. */
  templateId: string;
  /** Target model. */
  model: PromptModel;
  /** Fully rendered prompt text. */
  renderedText: string;
  /** Variables used in rendering. */
  variables: Record<string, string>;
  /** ISO 8601 timestamp of rendering. */
  timestamp: string;
}

/** Service type constant for the prompt library service registry. */
export const PROMPT_LIBRARY_SERVICE_TYPE = "PROMPT_LIBRARY" as const;

/** Log prefix used across all modules in this plugin. */
export const PROMPT_LOG_PREFIX = "[plugin-prompt-library]" as const;
