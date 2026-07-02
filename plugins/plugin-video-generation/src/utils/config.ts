import type { VideoModel } from "../types.ts";

export function getEnvOrDefault(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

export function getEnvOptional(key: string): string | null {
  return process.env[key] || null;
}

export function getModelApiKey(model: VideoModel): string | null {
  const keyMap: Record<VideoModel, string> = {
    "veo-3-1": "VEO_API_KEY",
    "kling-3-pro": "KLING_API_KEY",
    "runway-gen-4-5": "RUNWAY_API_KEY",
    "luma-ray-3-14": "LUMA_API_KEY",
  };
  return getEnvOptional(keyMap[model]);
}

export function getElevenLabsApiKey(): string | null {
  return getEnvOptional("ELEVENLABS_API_KEY");
}

export function getMonthlyBudget(): number {
  const raw = process.env.VIDEO_MONTHLY_BUDGET;
  return raw ? Number(raw) : 30;
}
