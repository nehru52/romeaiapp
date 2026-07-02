/**
 * BATCH_GENERATE action — generates one full week of content images.
 *
 * Produces 10 images following the Rome travel agency 60/30/10 content mix:
 *   6 × photoreal  (inspirational, 60%)  → FLUX.2 Pro
 *   3 × text_heavy (educational, 30%)    → Ideogram 3.0
 *   1 × brand_asset (promotional, 10%)   → Imagen 4 Ultra
 *
 * Estimated weekly cost: (6×$0.055) + (3×$0.030) + (1×$0.060) = $0.480
 */

import {
  type Action,
  type ActionResult,
  type HandlerCallback,
  type HandlerOptions,
  type IAgentRuntime,
  logger,
  type Memory,
  type State,
} from "@elizaos/core";
import type { ImageRouterService } from "../services/image-router-service.ts";
import {
  IMAGE_GEN_LOG_PREFIX,
  IMAGE_ROUTER_SERVICE_TYPE,
  type ImageResult,
  MODEL_PRICING,
  WEEKLY_CONTENT_MIX,
} from "../types.ts";
import {
  buildBrandAssetPrompt,
  buildPhotorealPrompt,
  buildTextHeavyPrompt,
} from "../utils/prompt-builder.ts";

/** Rome destinations and themes used to vary the weekly batch. */
const ROME_LOCATIONS = [
  "Colosseum",
  "Trevi Fountain",
  "Pantheon",
  "Trastevere",
  "Roman Forum",
  "Piazza Navona",
];

const TIME_OF_DAY = [
  "golden hour",
  "blue hour",
  "midday",
  "sunrise",
  "dusk",
  "late afternoon",
];
const STYLES = [
  "cinematic",
  "editorial",
  "documentary",
  "moody",
  "vibrant",
  "timeless",
];
const CAROUSEL_TOPICS = [
  "Top 7 Rome Travel Tips",
  "5 Hidden Gems in Rome",
  "3-Day Rome Itinerary",
];
const COLOR_PALETTES = [
  "warm terracotta, aged parchment, muted gold",
  "deep navy, cream, burnt sienna",
  "sage green, travertine white, olive gold",
];

function buildWeeklyBatchPrompts(): Array<{ prompt: string; label: string }> {
  return WEEKLY_CONTENT_MIX.map(({ contentType, label }, index) => {
    switch (contentType) {
      case "photoreal": {
        const location =
          ROME_LOCATIONS[index % ROME_LOCATIONS.length] ?? "Colosseum";
        const timeOfDay =
          TIME_OF_DAY[index % TIME_OF_DAY.length] ?? "golden hour";
        const style = STYLES[index % STYLES.length] ?? "cinematic";
        return {
          prompt: buildPhotorealPrompt(location, timeOfDay, style),
          label,
        };
      }
      case "text_heavy": {
        const topicIndex = Math.floor(index / 2) % CAROUSEL_TOPICS.length;
        const topic = CAROUSEL_TOPICS[topicIndex] ?? "Rome Travel Tips";
        const palette =
          COLOR_PALETTES[topicIndex % COLOR_PALETTES.length] ??
          "warm terracotta, aged parchment, muted gold";
        return {
          prompt: buildTextHeavyPrompt(
            topic,
            ["Tip 1", "Tip 2", "Tip 3", "Tip 4", "Tip 5"],
            palette,
          ),
          label,
        };
      }
      case "brand_asset": {
        return {
          prompt: buildBrandAssetPrompt(
            "weekly offer banner",
            "Roma Travel Agency, sophisticated and warm",
          ),
          label,
        };
      }
      default: {
        return {
          prompt: `Rome travel content for ${label}`,
          label,
        };
      }
    }
  });
}

/** Estimated weekly batch cost using the 60/30/10 mix. */
function estimateWeeklyCost(): number {
  return WEEKLY_CONTENT_MIX.reduce((sum, { contentType }) => {
    const model =
      contentType === "photoreal"
        ? "flux-2-pro"
        : contentType === "text_heavy"
          ? "ideogram-3"
          : "imagen-4-ultra";
    return sum + MODEL_PRICING[model];
  }, 0);
}

export const batchGenerateAction: Action = {
  name: "BATCH_GENERATE",
  description:
    "Generate a full week of content images (10 total) following the 60/30/10 mix rule: 6 photorealistic, 3 educational carousels, 1 promotional asset.",
  similes: ["GENERATE_ALL", "CREATE_BATCH", "PRODUCE_CONTENT"],
  validate: async (_runtime: IAgentRuntime): Promise<boolean> => true,
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    _state?: State,
    _options?: HandlerOptions,
    callback?: HandlerCallback,
  ): Promise<ActionResult> => {
    logger.info(
      { agentId: runtime.agentId },
      `${IMAGE_GEN_LOG_PREFIX} BATCH_GENERATE handler called`,
    );

    const _text = message.content.text ?? "";
    const service = runtime.getService<ImageRouterService>(
      IMAGE_ROUTER_SERVICE_TYPE,
    );
    const estimatedCost = estimateWeeklyCost();

    if (service) {
      const remaining = service.getRemainingBudget();
      if (remaining < estimatedCost) {
        const budgetText = `Monthly budget insufficient for weekly batch. Required: $${estimatedCost.toFixed(3)}, remaining: $${remaining.toFixed(3)}.`;
        logger.warn(
          { remaining, estimatedCost },
          `${IMAGE_GEN_LOG_PREFIX} batch budget exceeded`,
        );
        await callback?.({ text: budgetText });
        return {
          success: false,
          text: budgetText,
          data: { budgetExceeded: true },
        };
      }
    }

    const batchPrompts = buildWeeklyBatchPrompts();
    const results: ImageResult[] = batchPrompts.map(({ prompt }, index) => {
      const { contentType } = WEEKLY_CONTENT_MIX[index] ?? {
        contentType: "photoreal" as const,
      };
      const request = { prompt, contentType } as const;

      if (service) {
        return service.generateMockResult(request);
      }

      const model =
        contentType === "photoreal"
          ? "flux-2-pro"
          : contentType === "text_heavy"
            ? "ideogram-3"
            : "imagen-4-ultra";

      return {
        url: `https://mock.image-gen.rome/${model}/1440x1080?batch=${index + 1}`,
        model,
        cost: MODEL_PRICING[model],
        width: 1440,
        height: 1080,
        contentType,
      };
    });

    const totalCost = results.reduce((sum, r) => sum + r.cost, 0);
    service?.trackSpend(totalCost);

    const imageLines = results.map((r, i) => {
      const label = batchPrompts[i]?.label ?? `Image ${i + 1}`;
      return `  ${i + 1}. [${r.contentType}] ${r.model} — ${label}`;
    });

    const photorealCount = results.filter(
      (r) => r.contentType === "photoreal",
    ).length;
    const textHeavyCount = results.filter(
      (r) => r.contentType === "text_heavy",
    ).length;
    const brandAssetCount = results.filter(
      (r) => r.contentType === "brand_asset",
    ).length;

    const responseText = [
      `Weekly content batch generated: ${results.length} images`,
      ``,
      `Content mix: ${photorealCount} photoreal (60%) · ${textHeavyCount} text_heavy (30%) · ${brandAssetCount} brand_asset (10%)`,
      ``,
      ...imageLines,
      ``,
      `Total cost: $${totalCost.toFixed(3)}`,
      `Models used: FLUX.2 Pro (photoreal), Ideogram 3.0 (educational), Imagen 4 Ultra (promotional)`,
      service
        ? `Remaining monthly budget: $${service.getRemainingBudget().toFixed(2)}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    await callback?.({ text: responseText });

    return {
      success: true,
      text: responseText,
      data: {
        results,
        totalCost,
        contentMix: {
          photoreal: photorealCount,
          text_heavy: textHeavyCount,
          brand_asset: brandAssetCount,
        },
      },
    };
  },
};
