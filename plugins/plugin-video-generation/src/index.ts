import type { Plugin } from "@elizaos/core";
import { addVoiceover } from "./actions/add-voiceover.ts";
import { generateVideo } from "./actions/generate-video.ts";
import { videoBudgetProvider } from "./providers/video-budget-provider.ts";
import { VideoPipelineService } from "./services/video-pipeline-service.ts";

export const videoGenerationPlugin: Plugin = {
  name: "video-generation",
  description:
    "Tiered cinematic video generation pipeline for Rome travel content. Routes to Veo 3.1 (hero), Kling 3.0 (standard), Runway (product), Luma Ray (stories) with ElevenLabs voiceover.",
  actions: [generateVideo, addVoiceover],
  providers: [videoBudgetProvider],
  services: [VideoPipelineService],
};

export default videoGenerationPlugin;
