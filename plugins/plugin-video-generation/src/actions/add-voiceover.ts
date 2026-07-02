import type { Action } from "@elizaos/core";
import { logger } from "@elizaos/core";

export const addVoiceover: Action = {
  name: "ADD_VOICEOVER",
  similes: ["ADD_NARRATION", "VOICEOVER", "NARRATE"],
  description:
    "Add AI voiceover with Italian-accented English to a video using ElevenLabs",
  validate: async () => true,
  handler: async (runtime, message, _state, _options, callback) => {
    const text = message.content.text as string;
    const accent = text.toLowerCase().includes("italian")
      ? "italian-english"
      : "neutral-english";

    const service =
      runtime.getService<
        import("../services/video-pipeline-service.ts").VideoPipelineService
      >("VIDEO_PIPELINE");
    if (!service) {
      return { success: false, error: "Video pipeline service not available" };
    }

    const result = service.generateMockVoiceover(text, accent);
    const responseText = `🎙️ Voiceover Generated!\nAccent: ${accent}\nCharacters: ${result.characterCount}\nCost: $${result.cost}\nURL: ${result.url}`;

    if (callback) {
      await callback({ text: responseText, content: result });
    }

    logger.info(
      `[ADD_VOICEOVER] Generated voiceover, ${result.characterCount} chars, cost: $${result.cost}`,
    );
    return { success: true, data: result };
  },
};
