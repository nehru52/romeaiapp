/**
 * IMAGE_BUDGET provider — injects image generation cost and budget context.
 *
 * Reads from ImageRouterService when available. Falls back to placeholder
 * text when the service has not started or no images have been generated.
 */

import type {
  IAgentRuntime,
  Memory,
  Provider,
  ProviderResult,
  State,
} from "@elizaos/core";
import type { ImageRouterService } from "../services/image-router-service.ts";
import {
  IMAGE_ROUTER_SERVICE_TYPE,
  type ImageModel,
  MODEL_PRICING,
} from "../types.ts";
import { getMonthlyBudget } from "../utils/config.ts";

const MODEL_DESCRIPTIONS: Record<ImageModel, string> = {
  "flux-2-pro": "FLUX.2 Pro — photorealistic destination imagery",
  "ideogram-3": "Ideogram 3.0 — text-heavy carousels and infographics",
  "seedream-5": "Seedream 5 — brand-consistent UGC, 4K native",
  "imagen-4-ultra": "Imagen 4 Ultra — premium brand assets and headers",
  "grok-imagine": "Grok Imagine — fast Stories and behind-the-scenes",
};

function formatBudgetSummary(
  monthlySpend: number,
  remainingBudget: number,
  totalBudget: number,
): string {
  const percentUsed =
    totalBudget > 0 ? ((monthlySpend / totalBudget) * 100).toFixed(1) : "0.0";

  const priceLines = (
    Object.entries(MODEL_PRICING) as Array<[ImageModel, number]>
  ).map(
    ([model, price]) =>
      `  ${MODEL_DESCRIPTIONS[model]}: $${price.toFixed(3)}/image`,
  );

  return [
    "Image Generation Budget Dashboard",
    "",
    `Monthly budget: $${totalBudget.toFixed(2)}`,
    `Spent this month: $${monthlySpend.toFixed(3)} (${percentUsed}%)`,
    `Remaining: $${remainingBudget.toFixed(2)}`,
    "",
    "Model pricing:",
    ...priceLines,
    "",
    "Routing map:",
    "  photoreal   → flux-2-pro      ($0.055/img)",
    "  text_heavy  → ideogram-3      ($0.030/img)",
    "  brand_asset → imagen-4-ultra  ($0.060/img)",
    "  ugc         → seedream-5      ($0.030/img)",
    "  story       → grok-imagine    ($0.070/img)",
    "",
    "Weekly 60/30/10 batch cost estimate: $0.480",
    "  6 × photoreal  @ $0.055 = $0.330",
    "  3 × text_heavy @ $0.030 = $0.090",
    "  1 × brand_asset @ $0.060 = $0.060",
  ].join("\n");
}

export const imageBudgetProvider: Provider = {
  name: "IMAGE_BUDGET",
  description:
    "Tracks image generation costs, remaining monthly budget, and cost breakdown by model",
  dynamic: true,
  contexts: ["social", "automation", "general"],
  contextGate: { anyOf: ["social", "automation", "general"] },
  cacheStable: false,
  async get(
    runtime: IAgentRuntime,
    _message: Memory,
    _state: State,
  ): Promise<ProviderResult> {
    const service = runtime.getService<ImageRouterService>(
      IMAGE_ROUTER_SERVICE_TYPE,
    );
    const totalBudget = getMonthlyBudget();

    const monthlySpend = service?.getMonthlySpend() ?? 0;
    const remainingBudget = service?.getRemainingBudget() ?? totalBudget;

    const summaryText = formatBudgetSummary(
      monthlySpend,
      remainingBudget,
      totalBudget,
    );

    return {
      text: summaryText,
      values: {
        monthlySpend,
        remainingBudget,
        totalBudget,
        percentUsed:
          totalBudget > 0
            ? Math.round((monthlySpend / totalBudget) * 10000) / 100
            : 0,
      },
      data: {
        monthlySpend,
        remainingBudget,
        totalBudget,
        modelPricing: MODEL_PRICING,
      },
    };
  },
};
