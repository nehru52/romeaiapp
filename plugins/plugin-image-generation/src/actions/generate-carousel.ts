/**
 * GENERATE_CAROUSEL action — produces a multi-slide carousel image set.
 *
 * Always uses Ideogram 3.0 for text-heavy slides because it is the only
 * model that reliably renders legible text inside the image. Cover and
 * closing brand slides use Imagen 4 Ultra for additional polish.
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
} from "../types.ts";

/** Default slide count when not specified in the message. */
const DEFAULT_SLIDE_COUNT = 7;
const MAX_SLIDE_COUNT = 10;

function extractSlideCount(text: string): number {
  const match = text.match(/(\d+)\s*(?:slide|card|page)/i);
  if (match?.[1]) {
    const parsed = Number.parseInt(match[1], 10);
    return Number.isFinite(parsed) && parsed >= 2 && parsed <= MAX_SLIDE_COUNT
      ? parsed
      : DEFAULT_SLIDE_COUNT;
  }
  return DEFAULT_SLIDE_COUNT;
}

function extractTopic(text: string): string {
  const match = text.match(
    /(?:about|on|for|topic[:\s]+)\s+(.+?)(?:\s+with|\s+\d+\s*slide|$)/i,
  );
  return match?.[1]?.trim() ?? "Top Rome Travel Tips";
}

function buildSlidePrompts(
  topic: string,
  slideCount: number,
): Array<{ label: string; prompt: string }> {
  const slides: Array<{ label: string; prompt: string }> = [];

  // Slide 1: cover — brand asset treatment
  slides.push({
    label: "Cover slide",
    prompt: `Instagram carousel cover slide for "${topic}". Bold headline text, premium layout, Rome travel brand aesthetic, terracotta and cream palette, dramatic Colosseum silhouette background.`,
  });

  // Middle slides: educational text-heavy (Ideogram 3.0)
  const tipCount = slideCount - 2;
  for (let i = 0; i < tipCount; i++) {
    slides.push({
      label: `Tip slide ${i + 1}`,
      prompt: `Carousel slide ${i + 2} of ${slideCount} for "${topic}". Clean infographic layout, numbered tip ${i + 1}, readable body text, warm terracotta accent, 1:1 square format.`,
    });
  }

  // Final slide: CTA brand slide
  slides.push({
    label: "CTA closing slide",
    prompt: `Instagram carousel final slide for "${topic}". "Save this for your Rome trip!" call-to-action text, agency logo area, booking link prompt, premium brand feel.`,
  });

  return slides;
}

export const generateCarouselAction: Action = {
  name: "GENERATE_CAROUSEL",
  description:
    "Generate a multi-slide carousel using Ideogram 3.0 for text rendering. Ideal for tips, itineraries, and educational Rome travel content.",
  similes: ["MAKE_CAROUSEL", "CREATE_CAROUSEL", "DESIGN_CAROUSEL"],
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
      `${IMAGE_GEN_LOG_PREFIX} GENERATE_CAROUSEL handler called`,
    );

    const text = message.content.text ?? "";
    const slideCount = extractSlideCount(text);
    const topic = extractTopic(text);
    const slidePrompts = buildSlidePrompts(topic, slideCount);

    const service = runtime.getService<ImageRouterService>(
      IMAGE_ROUTER_SERVICE_TYPE,
    );

    // Estimate total cost: slide 1 + last slide = Imagen 4 Ultra, rest = Ideogram 3.0
    const ideogramSlides = slideCount - 2;
    const totalCost =
      MODEL_PRICING["imagen-4-ultra"] * 2 +
      MODEL_PRICING["ideogram-3"] * Math.max(0, ideogramSlides);

    if (service) {
      const remaining = service.getRemainingBudget();
      if (remaining < totalCost) {
        const budgetText = `Monthly budget insufficient for ${slideCount}-slide carousel. Required: $${totalCost.toFixed(3)}, remaining: $${remaining.toFixed(3)}.`;
        logger.warn(
          { remaining, totalCost },
          `${IMAGE_GEN_LOG_PREFIX} carousel budget exceeded`,
        );
        await callback?.({ text: budgetText });
        return {
          success: false,
          text: budgetText,
          data: { budgetExceeded: true },
        };
      }
    }

    const results: ImageResult[] = slidePrompts.map((slide, index) => {
      const isCoverOrCta = index === 0 || index === slidePrompts.length - 1;
      const contentType = isCoverOrCta ? "brand_asset" : "text_heavy";
      const request = { prompt: slide.prompt, contentType } as const;

      if (service) {
        return service.generateMockResult(request);
      }

      const model = isCoverOrCta ? "imagen-4-ultra" : "ideogram-3";
      return {
        url: `https://mock.image-gen.rome/${model}/1080x1080?slide=${index + 1}`,
        model,
        cost: MODEL_PRICING[model],
        width: 1080,
        height: 1080,
        contentType,
      };
    });

    const spentTotal = results.reduce((sum, r) => sum + r.cost, 0);
    service?.trackSpend(spentTotal);

    const slideLines = results.map((r, i) => {
      const label = slidePrompts[i]?.label ?? `Slide ${i + 1}`;
      return `  Slide ${i + 1} (${label}): ${r.model} — ${r.url}`;
    });

    const responseText = [
      `Carousel generated: ${slideCount} slides for "${topic}"`,
      ``,
      ...slideLines,
      ``,
      `Total cost: $${spentTotal.toFixed(3)}`,
      `Models used: Ideogram 3.0 (text slides) + Imagen 4 Ultra (cover/CTA)`,
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
      data: { results, topic, slideCount, totalCost: spentTotal },
    };
  },
};
