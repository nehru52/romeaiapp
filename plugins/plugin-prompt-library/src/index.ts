/**
 * @elizaos/plugin-prompt-library
 *
 * Comprehensive AI prompt library for all Rome Travel Agency models.
 *
 * Provides:
 *   Actions:
 *     GET_PROMPT          — retrieve a prompt template by ID
 *     LIST_PROMPTS        — browse all available prompt templates
 *     RENDER_PROMPT       — render a template with variables
 *
 *   Providers:
 *     PROMPT_LIBRARY      — injects relevant prompts into context
 *
 *   Services:
 *     PromptService       — template storage, listing, rendering
 *
 * Includes 12+ prompt templates for:
 *   DeepSeek V4 Pro/Flash, FLUX.2 Pro, Ideogram 3.0, Veo 3.1,
 *   Kling 3.0, Runway Gen-4, Luma Ray, ElevenLabs v2
 */

import { type IAgentRuntime, logger, type Plugin } from "@elizaos/core";
import { getPromptAction } from "./actions/get-prompt.ts";
import { listPromptsAction } from "./actions/list-prompts.ts";
import { renderPromptAction } from "./actions/render-prompt.ts";
import { promptLibraryProvider } from "./providers/prompt-library-provider.ts";
import { PromptService } from "./services/prompt-service.ts";
import { PROMPT_LOG_PREFIX } from "./types.ts";

export { getPromptAction } from "./actions/get-prompt.ts";
export { listPromptsAction } from "./actions/list-prompts.ts";
export { renderPromptAction } from "./actions/render-prompt.ts";
export { promptLibraryProvider } from "./providers/prompt-library-provider.ts";
export { PromptService } from "./services/prompt-service.ts";
// Re-export all public types and utilities.
export * from "./types.ts";
export * from "./utils/config.ts";

export const promptLibraryPlugin: Plugin = {
  name: "prompt-library",
  description:
    "Comprehensive AI prompt library for all Rome Travel Agency models",

  actions: [getPromptAction, listPromptsAction, renderPromptAction],

  providers: [promptLibraryProvider],

  services: [PromptService],

  async init(
    _config: Record<string, string>,
    runtime: IAgentRuntime,
  ): Promise<void> {
    logger.info(
      { agentId: runtime.agentId },
      `${PROMPT_LOG_PREFIX} plugin initialised`,
    );
  },

  tests: [
    {
      name: "prompt-library-smoke",
      tests: [
        {
          name: "Types are importable",
          fn: async (_runtime: IAgentRuntime) => {
            const { PROMPT_LIBRARY_SERVICE_TYPE } = await import("./types.ts");
            if (PROMPT_LIBRARY_SERVICE_TYPE !== "PROMPT_LIBRARY") {
              throw new Error("PROMPT_LIBRARY_SERVICE_TYPE mismatch");
            }
            logger.success("Types smoke test passed");
          },
        },
        {
          name: "PromptService list and render",
          fn: async (runtime: IAgentRuntime) => {
            const service = runtime.getService<PromptService>(
              PromptService.serviceType,
            );
            if (!service) {
              logger.warn("PromptService not registered — skipping");
              return;
            }
            const all = service.listPrompts();
            if (all.length < 5) {
              throw new Error(`Expected >= 5 prompts, got ${all.length}`);
            }
            const strategy = service.listPrompts("content-strategy");
            if (strategy.length === 0) {
              throw new Error("No content-strategy prompts found");
            }
            const rendered = service.renderPrompt("flux-photoreal-rome", {
              scene: "Colosseum at sunset",
              style_details: "Golden hour, wide angle",
            });
            if (!rendered) {
              throw new Error("renderPrompt returned null");
            }
            if (!rendered.renderedText.includes("Colosseum")) {
              throw new Error("Variable substitution failed");
            }
            const categories = service.getCategories();
            if (categories.length < 3) {
              throw new Error("Too few categories");
            }
            const models = service.getModels();
            if (models.length < 3) {
              throw new Error("Too few models");
            }
            logger.success("PromptService list/render test passed");
          },
        },
      ],
    },
  ],
};

export default promptLibraryPlugin;
