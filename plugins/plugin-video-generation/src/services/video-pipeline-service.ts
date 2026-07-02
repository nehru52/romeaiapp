import { type IAgentRuntime, logger, Service } from "@elizaos/core";
import type {
  VideoModel,
  VideoRequest,
  VideoResult,
  VideoTier,
} from "../types.ts";
import {
  ELEVENLABS_COST_PER_CHAR,
  TIER_PRICING,
  TIER_ROUTING,
} from "../types.ts";

export class VideoPipelineService extends Service {
  static override readonly serviceType = "VIDEO_PIPELINE";

  override capabilityDescription =
    "Tiered video generation pipeline with model routing and voiceover";

  private monthlySpend = 0;
  private currentMonth = new Date().getMonth();

  static override async start(
    _runtime: IAgentRuntime,
  ): Promise<VideoPipelineService> {
    return new VideoPipelineService();
  }

  override async stop(): Promise<void> {
    // no-op
  }

  private resetSpendIfNewMonth(): void {
    const m = new Date().getMonth();
    if (m !== this.currentMonth) {
      this.currentMonth = m;
      this.monthlySpend = 0;
    }
  }

  getTierForContent(tier: VideoTier): VideoModel {
    return TIER_ROUTING[tier];
  }

  generateMockVideo(request: VideoRequest): VideoResult {
    const pricing = TIER_PRICING[request.tier];
    const voiceoverCost = request.addVoiceover
      ? Math.round(request.prompt.length * ELEVENLABS_COST_PER_CHAR * 100) / 100
      : 0;
    const totalCost = Math.round((pricing.cost + voiceoverCost) * 100) / 100;

    return {
      url: `https://mock-video-api.example.com/${pricing.model}/${Date.now()}.mp4`,
      model: pricing.model,
      tier: request.tier,
      duration: pricing.duration,
      cost: totalCost,
      hasVoiceover: !!request.addVoiceover,
      voiceoverCost: voiceoverCost || undefined,
    };
  }

  generateMockVoiceover(
    script: string,
    _accent: string,
  ): { url: string; cost: number; characterCount: number } {
    const charCount = script.length;
    const cost = Math.round(charCount * ELEVENLABS_COST_PER_CHAR * 100) / 100;
    return {
      url: `https://mock-elevenlabs.example.com/vo/${Date.now()}.mp3`,
      cost,
      characterCount: charCount,
    };
  }

  trackSpend(amount: number): void {
    this.resetSpendIfNewMonth();
    this.monthlySpend = Math.round((this.monthlySpend + amount) * 100) / 100;
    logger.info(
      `[VideoPipelineService] Spend tracked: $${amount}, monthly total: $${this.monthlySpend}`,
    );
  }

  getMonthlySpend(): number {
    this.resetSpendIfNewMonth();
    return this.monthlySpend;
  }

  getRemainingBudget(budget: number): number {
    return Math.round((budget - this.getMonthlySpend()) * 100) / 100;
  }
}
