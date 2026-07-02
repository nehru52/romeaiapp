import type {
  Action,
  ActionResult,
  HandlerCallback,
  IAgentRuntime,
  Memory,
  State,
} from "@elizaos/core";
import { logger } from "@elizaos/core";
import type { VideoTier } from "../types.ts";
import { TIER_PRICING } from "../types.ts";

function extractTier(text: string): VideoTier {
  const lower = text.toLowerCase();
  if (lower.includes("hero") || lower.includes("cinematic")) return "hero";
  if (
    lower.includes("product") ||
    lower.includes("tour") ||
    lower.includes("showcase")
  )
    return "product";
  if (
    lower.includes("story") ||
    lower.includes("snippet") ||
    lower.includes("quick")
  )
    return "story";
  return "standard";
}

export const generateVideo: Action = {
  name: "GENERATE_VIDEO",
  similes: ["CREATE_VIDEO", "MAKE_VIDEO", "GENERATE_REEL", "MAKE_REEL"],
  description:
    "Generate a video using the Tiered Cinematic Pipeline. Routes to the optimal model based on tier: hero (Veo 3.1), standard (Kling 3.0), product (Runway), or story (Luma Ray).",
  validate: async () => true,
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    _state?: State,
    _options?: unknown,
    callback?: HandlerCallback,
  ): Promise<ActionResult> => {
    const text = message.content.text as string;
    const tier = extractTier(text);
    const pricing = TIER_PRICING[tier];
    const addVoiceover =
      text.toLowerCase().includes("voiceover") ||
      text.toLowerCase().includes("narration");

    const service =
      runtime.getService<
        import("../services/video-pipeline-service.ts").VideoPipelineService
      >("VIDEO_PIPELINE");
    if (!service) {
      logger.error("[GENERATE_VIDEO] VideoPipelineService not found");
      return {
        success: false,
        error: "Video pipeline service not available",
      } as ActionResult;
    }

    const result = service.generateMockVideo({
      prompt: text,
      tier,
      addVoiceover,
    });
    service.trackSpend(result.cost);

    const responseText = `🎬 Video Generated!\nTier: ${tier}\nModel: ${pricing.model}\nDuration: ${pricing.duration}s\nCost: $${result.cost}\nVoiceover: ${addVoiceover ? "Yes" : "No"}\nURL: ${result.url}`;

    if (callback) {
      await callback({ text: responseText });
    }

    logger.info(
      `[GENERATE_VIDEO] Generated ${tier} video with ${pricing.model}, cost: $${result.cost}`,
    );
    return {
      success: true,
      text: responseText,
      data: { video: result },
    } as unknown as ActionResult;
  },
};
