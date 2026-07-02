import type { Provider } from "@elizaos/core";
import { TIER_PRICING } from "../types.ts";

export const videoBudgetProvider: Provider = {
  name: "VIDEO_BUDGET",
  description: "Tracks video generation costs and remaining budget",
  dynamic: true,
  cacheStable: false,
  contexts: ["video", "content", "automation"],
  get: async (runtime) => {
    const service = runtime.getService("VIDEO_BUDGET") as any;
    const budget = 30;
    const spend = service?.getMonthlySpend?.() ?? 0;
    const remaining = Math.round((budget - spend) * 100) / 100;

    const breakdown = Object.entries(TIER_PRICING)
      .map(
        ([tier, p]) =>
          `  ${tier}: ${p.model} — $${p.cost}/${p.duration}s (${p.allocation * 100}%)`,
      )
      .join("\n");

    return {
      text: `📊 Video Generation Budget\nMonthly Budget: $${budget}\nSpent: $${spend}\nRemaining: $${remaining}\n\nModel Pricing:\n${breakdown}`,
      values: { budget, spend, remaining },
      data: { tierPricing: TIER_PRICING },
    };
  },
};
