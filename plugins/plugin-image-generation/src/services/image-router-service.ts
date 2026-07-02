/**
 * ImageRouterService — core orchestration service for @elizaos/plugin-image-generation.
 *
 * Manages model routing, cost estimation, mock generation, and monthly budget
 * tracking. Real API calls would replace generateMockResult() in production.
 */

import { type IAgentRuntime, logger, Service } from "@elizaos/core";
import {
  IMAGE_GEN_LOG_PREFIX,
  IMAGE_ROUTER_SERVICE_TYPE,
  type ImageContentType,
  type ImageModel,
  type ImageRequest,
  type ImageResult,
  MODEL_DEFAULT_DIMENSIONS,
  MODEL_PRICING,
  ROUTING_MAP,
} from "../types.ts";
import {
  getFluxApiKey,
  getGrokApiKey,
  getIdeogramApiKey,
  getImagenApiKey,
  getMonthlyBudget,
  getSeedreamApiKey,
} from "../utils/config.ts";

/** Key used to identify monthly spend resets (YYYY-MM format). */
function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export class ImageRouterService extends Service {
  static override readonly serviceType = IMAGE_ROUTER_SERVICE_TYPE;

  override capabilityDescription =
    "Multi-model image generation router with cost tracking and budget management for Rome travel content.";

  /** Cumulative spend in USD for the current calendar month. */
  private monthlySpend = 0;

  /** The month this spend counter was last reset (YYYY-MM). */
  private currentMonth = currentMonthKey();

  static override async start(
    runtime: IAgentRuntime,
  ): Promise<ImageRouterService> {
    logger.info(
      { agentId: runtime.agentId },
      `${IMAGE_GEN_LOG_PREFIX} starting ImageRouterService`,
    );
    return new ImageRouterService(runtime);
  }

  override async stop(): Promise<void> {
    logger.info(`${IMAGE_GEN_LOG_PREFIX} stopping ImageRouterService`);
  }

  // ---------------------------------------------------------------------------
  // Routing
  // ---------------------------------------------------------------------------

  /**
   * Returns the optimal model for the given content type.
   * Uses the ROUTING_MAP lookup — no fallback heuristics needed.
   */
  route(contentType: ImageContentType): ImageModel {
    return ROUTING_MAP[contentType];
  }

  // ---------------------------------------------------------------------------
  // Cost estimation
  // ---------------------------------------------------------------------------

  /**
   * Estimates the total cost in USD for generating `count` images of a given
   * content type using the routed model.
   */
  estimateCost(contentType: ImageContentType, count: number): number {
    const model = this.route(contentType);
    const pricePerImage = MODEL_PRICING[model];
    return Math.round(pricePerImage * count * 1000) / 1000;
  }

  // ---------------------------------------------------------------------------
  // Generation (mock)
  // ---------------------------------------------------------------------------

  /**
   * Returns a mock ImageResult for the given request.
   *
   * In production this method would call the relevant model API endpoint.
   * The mock URL format encodes enough information for downstream consumers
   * to verify routing and cost logic in tests.
   */
  generateMockResult(request: ImageRequest): ImageResult {
    const model = request.model ?? this.route(request.contentType);
    const dimensions = MODEL_DEFAULT_DIMENSIONS[model];
    const width = request.width ?? dimensions.width;
    const height = request.height ?? dimensions.height;
    const cost = MODEL_PRICING[model];

    const seedSuffix =
      request.seed !== undefined ? `&seed=${request.seed}` : "";
    const encodedPrompt = encodeURIComponent(request.prompt.slice(0, 60));
    const url = `https://mock.image-gen.rome/${model}/${width}x${height}?prompt=${encodedPrompt}${seedSuffix}`;

    logger.info(
      { model, width, height, cost, contentType: request.contentType },
      `${IMAGE_GEN_LOG_PREFIX} mock image generated`,
    );

    return {
      url,
      model,
      cost,
      width,
      height,
      contentType: request.contentType,
    };
  }

  // ---------------------------------------------------------------------------
  // API key resolution
  // ---------------------------------------------------------------------------

  /**
   * Returns the API key for the given model, or null if not configured.
   * Callers should check for null and fall back to mock mode as appropriate.
   */
  getModelApiKey(model: ImageModel): string | null {
    switch (model) {
      case "flux-2-pro":
        return getFluxApiKey() ?? null;
      case "ideogram-3":
        return getIdeogramApiKey() ?? null;
      case "seedream-5":
        return getSeedreamApiKey() ?? null;
      case "imagen-4-ultra":
        return getImagenApiKey() ?? null;
      case "grok-imagine":
        return getGrokApiKey() ?? null;
    }
  }

  // ---------------------------------------------------------------------------
  // Budget tracking
  // ---------------------------------------------------------------------------

  /**
   * Records a spend amount in USD against the current month's budget.
   * Automatically resets the counter when the calendar month changes.
   */
  trackSpend(amountUsd: number): void {
    const month = currentMonthKey();
    if (month !== this.currentMonth) {
      logger.info(
        {
          previousMonth: this.currentMonth,
          newMonth: month,
          rolledOver: this.monthlySpend,
        },
        `${IMAGE_GEN_LOG_PREFIX} monthly spend counter reset`,
      );
      this.monthlySpend = 0;
      this.currentMonth = month;
    }
    this.monthlySpend =
      Math.round((this.monthlySpend + amountUsd) * 1000) / 1000;
    logger.info(
      { spend: amountUsd, totalMonthlySpend: this.monthlySpend },
      `${IMAGE_GEN_LOG_PREFIX} spend tracked`,
    );
  }

  /** Returns the cumulative spend in USD for the current calendar month. */
  getMonthlySpend(): number {
    return this.monthlySpend;
  }

  /** Returns the remaining budget in USD for the current calendar month. */
  getRemainingBudget(): number {
    const budget = getMonthlyBudget();
    const remaining = budget - this.monthlySpend;
    return Math.round(Math.max(0, remaining) * 1000) / 1000;
  }
}
