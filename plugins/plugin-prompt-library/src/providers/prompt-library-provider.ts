/**
 * PROMPT_LIBRARY provider — injects relevant prompt templates
 * into agent context based on the current task.
 */

import type {
  IAgentRuntime,
  Memory,
  Provider,
  ProviderResult,
  State,
} from "@elizaos/core";

const PROMPT_LIBRARY_TEXT = `
Rome Travel — AI Prompt Library

## Available Prompts by Category

### Content Strategy
- deepseek-content-strategy: Weekly content strategy generation

### Image Generation
- flux-photoreal-rome: Photorealistic Rome scenes (FLUX.2 Pro)
- ideogram-carousel-rome: Text-heavy carousel slides (Ideogram 3.0)

### Video Generation
- veo-hero-rome: Cinematic hero videos (Veo 3.1)
- kling-standard-rome: Standard short-form video (Kling 3.0)

### Copywriting
- deepseek-caption-rome: Engaging social media captions
- deepseek-hook-generator: Viral hook line generation

### Email Nurture
- deepseek-nurture-email: 5-email nurture sequence writer

### Trend Analysis
- deepseek-trend-analysis: Social media trend analysis

### Hashtags
- deepseek-hashtag-strategy: Optimal hashtag set generation

### Storytelling
- deepseek-storytelling: Compelling Rome travel stories

## Usage
Use LIST_PROMPTS to browse all templates.
Use GET_PROMPT <id> to view a specific template.
Use RENDER_PROMPT <id> with variables to generate a ready-to-use prompt.
`.trim();

export const promptLibraryProvider: Provider = {
  name: "PROMPT_LIBRARY",
  description:
    "Injects relevant prompt templates into agent context based on current task",
  dynamic: true,
  contexts: ["PROMPT"],
  contextGate: { anyOf: ["PROMPT"] },
  cacheStable: true,
  cacheScope: "agent",
  async get(
    _runtime: IAgentRuntime,
    _message: Memory,
    _state: State,
  ): Promise<ProviderResult> {
    return {
      text: PROMPT_LIBRARY_TEXT,
      values: {
        totalPrompts: 12,
        categories: 8,
        models: 12,
      },
      data: {
        categories: [
          "content-strategy",
          "image-generation",
          "video-generation",
          "copywriting",
          "email-nurture",
          "trend-analysis",
          "hashtag",
          "storytelling",
        ],
        models: [
          "deepseek-v4-pro",
          "deepseek-v4-flash",
          "flux-2-pro",
          "ideogram-3",
          "veo-3.1",
          "kling-3",
        ],
      },
    };
  },
};
