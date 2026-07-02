/**
 * SCHEDULE_QUALITY evaluator — evaluates content calendar for
 * 60/30/10 mix compliance and platform optimization.
 */

import {
  type IAgentRuntime,
  logger,
  type Memory,
  type State,
} from "@elizaos/core";
import { CALENDAR_LOG_PREFIX } from "../types.js";

interface ScheduleQualityResult {
  score: number;
  mixCompliance: string;
  platformDiversity: string;
  timingOptimization: string;
  suggestions: string[];
}

function evaluateSchedule(text: string): ScheduleQualityResult {
  const lowerText = text.toLowerCase();
  const suggestions: string[] = [];
  let score = 0;

  // Check 60/30/10 mix awareness.
  if (
    lowerText.includes("60/30/10") ||
    lowerText.includes("60%") ||
    lowerText.includes("inspirational")
  ) {
    score += 30;
  } else {
    suggestions.push("Apply the 60/30/10 content mix rule");
  }

  // Check platform diversity.
  const platforms = [
    "instagram",
    "tiktok",
    "pinterest",
    "youtube",
    "facebook",
    "linkedin",
  ];
  const mentionedPlatforms = platforms.filter((p) => lowerText.includes(p));
  if (mentionedPlatforms.length >= 2) {
    score += 25;
  } else {
    suggestions.push("Diversify across more platforms (min 2-3)");
  }

  // Check timing awareness.
  if (
    lowerText.includes("tuesday") ||
    lowerText.includes("thursday") ||
    lowerText.includes("optimal") ||
    lowerText.includes("best time")
  ) {
    score += 25;
  } else {
    suggestions.push("Schedule posts during optimal engagement windows");
  }

  // Check format diversity.
  const formats = ["reel", "carousel", "story", "feed_post", "pin"];
  const mentionedFormats = formats.filter(
    (f) => lowerText.includes(f.replace("_", " ")) || lowerText.includes(f),
  );
  if (mentionedFormats.length >= 2) {
    score += 20;
  } else {
    suggestions.push("Use a mix of formats (reels, carousels, stories)");
  }

  const mixCompliance =
    score >= 80
      ? "EXCELLENT"
      : score >= 60
        ? "GOOD"
        : score >= 40
          ? "FAIR"
          : "NEEDS_WORK";
  const platformDiversity =
    mentionedPlatforms.length >= 3
      ? "HIGH"
      : mentionedPlatforms.length >= 2
        ? "MEDIUM"
        : "LOW";
  const timingOptimization =
    lowerText.includes("optimal") || lowerText.includes("best")
      ? "OPTIMIZED"
      : "DEFAULT";

  return {
    score,
    mixCompliance,
    platformDiversity,
    timingOptimization,
    suggestions,
  };
}

export const scheduleQualityEvaluator = {
  name: "SCHEDULE_QUALITY",
  description:
    "Evaluates content calendar for 60/30/10 mix compliance and platform optimization",
  similes: ["SCHEDULE_CHECK", "CALENDAR_REVIEW"],
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    _state?: State,
    _options?: unknown,
    callback?: (result: unknown) => Promise<void>,
  ): Promise<unknown> => {
    const text = message.content.text ?? "";

    logger.info(
      { agentId: runtime.agentId },
      `${CALENDAR_LOG_PREFIX} SCHEDULE_QUALITY evaluator running`,
    );

    const result = evaluateSchedule(text);

    const summary = [
      `Schedule quality score: ${result.score}/100`,
      `Mix compliance: ${result.mixCompliance}`,
      `Platform diversity: ${result.platformDiversity}`,
      `Timing optimization: ${result.timingOptimization}`,
      "",
      ...result.suggestions.map((s) => `  → ${s}`),
    ]
      .filter(Boolean)
      .join("\n");

    logger.info(
      { agentId: runtime.agentId, score: result.score },
      `${CALENDAR_LOG_PREFIX} schedule quality evaluation complete`,
    );

    if (callback) {
      await callback({ text: summary, data: result });
    }

    return result;
  },
  examples: [
    {
      context: "Agent is reviewing a weekly content calendar",
      messages: [
        {
          name: "User",
          content: {
            text: "Weekly plan: Instagram reel on Tuesday, TikTok carousel on Thursday, Pinterest pin on Saturday. Using 60/30/10 mix with optimal posting times.",
          },
        },
      ],
      outcome: "Schedule quality score: 100/100 (EXCELLENT)",
    },
  ],
};
