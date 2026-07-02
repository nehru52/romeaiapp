export type VideoTier = "hero" | "standard" | "product" | "story";
export type VideoModel =
  | "veo-3-1"
  | "kling-3-pro"
  | "runway-gen-4-5"
  | "luma-ray-3-14";

export interface VideoRequest {
  prompt: string;
  tier: VideoTier;
  addVoiceover?: boolean;
  voiceAccent?: string;
  cameraControl?: string;
}

export interface VideoResult {
  url: string;
  model: VideoModel;
  tier: VideoTier;
  duration: number;
  cost: number;
  hasVoiceover: boolean;
  voiceoverCost?: number;
}

export interface VoiceoverRequest {
  script: string;
  accent: string;
  voiceId?: string;
}

export interface VoiceoverResult {
  url: string;
  cost: number;
  characterCount: number;
}

export const TIER_PRICING: Record<
  VideoTier,
  { model: VideoModel; cost: number; duration: number; allocation: number }
> = {
  hero: { model: "veo-3-1", cost: 1.6, duration: 8, allocation: 0.2 },
  standard: { model: "kling-3-pro", cost: 0.38, duration: 5, allocation: 0.5 },
  product: {
    model: "runway-gen-4-5",
    cost: 0.25,
    duration: 5,
    allocation: 0.2,
  },
  story: { model: "luma-ray-3-14", cost: 0.09, duration: 3, allocation: 0.1 },
};

export const TIER_ROUTING: Record<VideoTier, VideoModel> = {
  hero: "veo-3-1",
  standard: "kling-3-pro",
  product: "runway-gen-4-5",
  story: "luma-ray-3-14",
};

export const ELEVENLABS_COST_PER_CHAR = 0.003;
