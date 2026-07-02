/**
 * @elizaos/plugin-image-generation
 *
 * Multi-model image generation router for Rome travel agency content.
 *
 * Provides:
 *   Actions:
 *     GENERATE_IMAGE    — route a single image to the optimal model
 *     GENERATE_CAROUSEL — multi-slide carousel (Ideogram 3.0 for text slides)
 *     BATCH_GENERATE    — one week of content (10 images, 60/30/10 mix)
 *
 *   Providers:
 *     IMAGE_BUDGET      — current spend, remaining budget, model pricing
 *
 *   Services:
 *     ImageRouterService — routing, cost estimation, mock generation, budget tracking
 *
 * Model routing:
 *   photoreal    → FLUX.2 Pro        $0.055/img
 *   text_heavy   → Ideogram 3.0      $0.030/img
 *   brand_asset  → Imagen 4 Ultra    $0.060/img
 *   ugc          → Seedream 5        $0.030/img
 *   story        → Grok Imagine      $0.070/img
 */

import { type IAgentRuntime, logger, type Plugin } from "@elizaos/core";
import { batchGenerateAction } from "./actions/batch-generate.ts";
import { generateCarouselAction } from "./actions/generate-carousel.ts";
import { generateImageAction } from "./actions/generate-image.ts";
import { imageBudgetProvider } from "./providers/image-budget-provider.ts";
import { ImageRouterService } from "./services/image-router-service.ts";
import { IMAGE_GEN_LOG_PREFIX } from "./types.ts";

export { batchGenerateAction } from "./actions/batch-generate.ts";
export { generateCarouselAction } from "./actions/generate-carousel.ts";
export { generateImageAction } from "./actions/generate-image.ts";
export { imageBudgetProvider } from "./providers/image-budget-provider.ts";
export { ImageRouterService } from "./services/image-router-service.ts";
// Re-export all public types, utilities, and components.
export * from "./types.ts";
export * from "./utils/config.ts";
export * from "./utils/prompt-builder.ts";

export const imageGenerationPlugin: Plugin = {
  name: "image-generation",
  description:
    "Multi-model image generation router for Rome travel agency content",

  actions: [generateImageAction, generateCarouselAction, batchGenerateAction],

  providers: [imageBudgetProvider],

  services: [ImageRouterService],

  async init(
    _config: Record<string, string>,
    runtime: IAgentRuntime,
  ): Promise<void> {
    logger.info(
      { agentId: runtime.agentId },
      `${IMAGE_GEN_LOG_PREFIX} plugin initialised`,
    );
  },

  tests: [
    {
      name: "image-generation-smoke",
      tests: [
        {
          name: "Types and routing map are importable",
          fn: async (_runtime: IAgentRuntime) => {
            const { ROUTING_MAP, MODEL_PRICING } = await import("./types.ts");
            const contentTypes = [
              "photoreal",
              "text_heavy",
              "brand_asset",
              "ugc",
              "story",
            ] as const;
            for (const ct of contentTypes) {
              if (!ROUTING_MAP[ct]) {
                throw new Error(`ROUTING_MAP missing entry for "${ct}"`);
              }
              const model = ROUTING_MAP[ct];
              if (MODEL_PRICING[model] === undefined) {
                throw new Error(`MODEL_PRICING missing entry for "${model}"`);
              }
            }
            logger.success("Types smoke test passed");
          },
        },
        {
          name: "ImageRouterService route and estimateCost",
          fn: async (runtime: IAgentRuntime) => {
            const service = runtime.getService<ImageRouterService>(
              ImageRouterService.serviceType,
            );
            if (!service) {
              logger.warn(
                "ImageRouterService not registered — skipping service test",
              );
              return;
            }
            const model = service.route("photoreal");
            if (model !== "flux-2-pro") {
              throw new Error(
                `Expected flux-2-pro for photoreal, got ${model}`,
              );
            }
            const cost = service.estimateCost("text_heavy", 3);
            if (cost !== 0.09) {
              throw new Error(
                `Expected $0.090 for 3 text_heavy images, got $${cost}`,
              );
            }
            logger.success("ImageRouterService route/estimateCost test passed");
          },
        },
        {
          name: "ImageRouterService budget tracking",
          fn: async (runtime: IAgentRuntime) => {
            const service = runtime.getService<ImageRouterService>(
              ImageRouterService.serviceType,
            );
            if (!service) {
              logger.warn(
                "ImageRouterService not registered — skipping budget test",
              );
              return;
            }
            const beforeSpend = service.getMonthlySpend();
            service.trackSpend(0.055);
            const afterSpend = service.getMonthlySpend();
            if (afterSpend !== beforeSpend + 0.055) {
              throw new Error(
                `Expected spend ${beforeSpend + 0.055}, got ${afterSpend}`,
              );
            }
            logger.success("ImageRouterService budget tracking test passed");
          },
        },
        {
          name: "generateMockResult returns valid ImageResult",
          fn: async (runtime: IAgentRuntime) => {
            const service = runtime.getService<ImageRouterService>(
              ImageRouterService.serviceType,
            );
            if (!service) {
              logger.warn(
                "ImageRouterService not registered — skipping mock result test",
              );
              return;
            }
            const result = service.generateMockResult({
              prompt: "Colosseum at golden hour",
              contentType: "photoreal",
            });
            if (!result.url.includes("flux-2-pro")) {
              throw new Error(`Expected flux-2-pro in URL, got: ${result.url}`);
            }
            if (result.cost !== 0.055) {
              throw new Error(`Expected cost $0.055, got $${result.cost}`);
            }
            logger.success("generateMockResult smoke test passed");
          },
        },
      ],
    },
  ],
};

export default imageGenerationPlugin;
