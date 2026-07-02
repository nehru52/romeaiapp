/**
 * GENERATE_IMAGE action — routes a single image request to the optimal model.
 *
 * The router picks the best model automatically based on content type:
 *   photoreal    → FLUX.2 Pro   ($0.055) — photorealistic destination imagery
 *   text_heavy   → Ideogram 3.0 ($0.030) — carousels and infographics with text
 *   brand_asset  → Imagen 4 Ultra ($0.060) — polished headers, logos, testimonials
 *   ugc          → Seedream 5   ($0.030) — brand-consistent UGC, 4K native
 *   story        → Grok Imagine ($0.070) — fast vertical Stories content
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
  type ImageContentType,
  type ImageModel,
  MODEL_PRICING,
  ROUTING_MAP,
} from "../types.ts";

const CONTENT_TYPE_KEYWORDS: Array<{
  type: ImageContentType;
  keywords: string[];
}> = [
  {
    type: "text_heavy",
    keywords: ["carousel", "infographic", "text", "itinerary", "tips", "guide"],
  },
  {
    type: "brand_asset",
    keywords: [
      "brand",
      "logo",
      "header",
      "banner",
      "testimonial",
      "promotional",
    ],
  },
  {
    type: "ugc",
    keywords: ["ugc", "user generated", "candid", "authentic", "character"],
  },
  {
    type: "story",
    keywords: [
      "story",
      "stories",
      "reel",
      "behind the scenes",
      "poll",
      "quick",
    ],
  },
  {
    type: "photoreal",
    keywords: [
      "photo",
      "real",
      "lifestyle",
      "destination",
      "scenic",
      "landscape",
    ],
  },
];

function extractContentType(text: string): ImageContentType {
  const lower = text.toLowerCase();
  for (const { type, keywords } of CONTENT_TYPE_KEYWORDS) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return type;
    }
  }
  return "photoreal";
}

function extractModel(text: string): ImageModel | undefined {
  const lower = text.toLowerCase();
  if (lower.includes("flux")) return "flux-2-pro";
  if (lower.includes("ideogram")) return "ideogram-3";
  if (lower.includes("seedream")) return "seedream-5";
  if (lower.includes("imagen")) return "imagen-4-ultra";
  if (lower.includes("grok")) return "grok-imagine";
  return undefined;
}

function extractPrompt(text: string): string {
  const promptMatch = text.match(
    /(?:prompt[:\s]+|generate[:\s]+|create[:\s]+)(.+?)(?:\s+using|\s+with model|$)/i,
  );
  if (promptMatch?.[1]) {
    return promptMatch[1].trim();
  }
  return text.length > 20
    ? text
    : "Rome Colosseum at golden hour, cinematic travel photography";
}

export const generateImageAction: Action = {
  name: "GENERATE_IMAGE",
  description:
    "Generate an image using the optimal AI model for the content type. Routes automatically: photoreal→FLUX.2 Pro, text_heavy→Ideogram 3.0, brand_asset→Imagen 4 Ultra, ugc→Seedream 5, story→Grok Imagine.",
  similes: ["CREATE_IMAGE", "MAKE_IMAGE", "DESIGN_IMAGE", "GENERATE_PHOTO"],
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
      `${IMAGE_GEN_LOG_PREFIX} GENERATE_IMAGE handler called`,
    );

    const text = message.content.text ?? "";
    const contentType = extractContentType(text);
    const modelOverride = extractModel(text);
    const prompt = extractPrompt(text);

    const service = runtime.getService<ImageRouterService>(
      IMAGE_ROUTER_SERVICE_TYPE,
    );

    const routedModel = modelOverride ?? ROUTING_MAP[contentType];
    const costPerImage = MODEL_PRICING[routedModel];

    if (service) {
      const remaining = service.getRemainingBudget();
      if (remaining < costPerImage) {
        const budgetText = `Monthly image budget exhausted. Remaining: $${remaining.toFixed(3)}, cost: $${costPerImage.toFixed(3)}.`;
        logger.warn(
          { remaining, costPerImage },
          `${IMAGE_GEN_LOG_PREFIX} budget exceeded`,
        );
        await callback?.({ text: budgetText });
        return {
          success: false,
          text: budgetText,
          data: { budgetExceeded: true },
        };
      }
    }

    const result = service
      ? service.generateMockResult({
          prompt,
          contentType,
          model: modelOverride,
        })
      : {
          url: `https://mock.image-gen.rome/${routedModel}/1440x1080?prompt=${encodeURIComponent(prompt.slice(0, 60))}`,
          model: routedModel,
          cost: costPerImage,
          width: 1440,
          height: 1080,
          contentType,
        };

    service?.trackSpend(result.cost);

    const responseText = [
      `Image generated using ${result.model}:`,
      ``,
      `URL: ${result.url}`,
      `Content type: ${result.contentType}`,
      `Dimensions: ${result.width}×${result.height}px`,
      `Cost: $${result.cost.toFixed(3)}`,
      `Model rationale: ${contentType} content → ${result.model} (optimal for this type)`,
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
      data: { result },
    };
  },
};
