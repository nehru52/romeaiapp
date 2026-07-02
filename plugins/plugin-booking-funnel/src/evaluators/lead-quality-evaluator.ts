/**
 * LEAD_QUALITY evaluator — evaluates lead quality and
 * progression through the booking funnel.
 */

import {
  type IAgentRuntime,
  logger,
  type Memory,
  type State,
} from "@elizaos/core";
import { FUNNEL_LOG_PREFIX } from "../types.js";

interface LeadQualityResult {
  score: number;
  quality: string;
  signals: string[];
  suggestions: string[];
}

function evaluateLeadQuality(text: string): LeadQualityResult {
  const lowerText = text.toLowerCase();
  const signals: string[] = [];
  const suggestions: string[] = [];

  // Check for email engagement signals.
  if (lowerText.includes("opened") || lowerText.includes("clicked")) {
    signals.push("Email engagement detected");
  }
  if (lowerText.includes("replied") || lowerText.includes("response")) {
    signals.push("Direct reply — high intent");
  }
  if (lowerText.includes("calendly") || lowerText.includes("booked")) {
    signals.push("Consultation booked — sales qualified");
  }
  if (lowerText.includes("pricing") || lowerText.includes("package")) {
    signals.push("Pricing interest — bottom of funnel");
  }

  // Check for negative signals.
  if (lowerText.includes("unsubscribe") || lowerText.includes("bounced")) {
    signals.push("Negative signal — disengagement risk");
    suggestions.push("Pause nurture sequence and send re-engagement email");
  }

  // Check for source quality.
  if (lowerText.includes("instagram") || lowerText.includes("tiktok")) {
    signals.push("Social media source — high volume, variable quality");
  }
  if (lowerText.includes("referral")) {
    signals.push("Referral source — highest quality");
  }

  if (signals.length === 0) {
    suggestions.push("Capture more lead metadata for quality scoring");
    suggestions.push("Track email opens and clicks for engagement scoring");
  }

  const score = Math.min(100, signals.length * 25 + 25);
  const quality =
    score >= 75
      ? "HIGH"
      : score >= 50
        ? "MEDIUM"
        : score >= 25
          ? "LOW"
          : "UNQUALIFIED";

  return { score, quality, signals, suggestions };
}

export const leadQualityEvaluator = {
  name: "LEAD_QUALITY",
  description:
    "Evaluates lead quality and progression through the booking funnel",
  similes: ["LEAD_SCORE", "QUALITY_CHECK"],
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
      `${FUNNEL_LOG_PREFIX} LEAD_QUALITY evaluator running`,
    );

    const result = evaluateLeadQuality(text);

    const summary = [
      `Lead quality score: ${result.score}/100 (${result.quality})`,
      "",
      result.signals.length > 0
        ? `Signals:\n${result.signals.map((s) => `  ✓ ${s}`).join("\n")}`
        : "No engagement signals detected",
      result.suggestions.length > 0
        ? `\nSuggestions:\n${result.suggestions.map((s) => `  → ${s}`).join("\n")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    logger.info(
      {
        agentId: runtime.agentId,
        score: result.score,
        quality: result.quality,
      },
      `${FUNNEL_LOG_PREFIX} lead quality evaluation complete`,
    );

    if (callback) {
      await callback({ text: summary, data: result });
    }

    return result;
  },
  examples: [
    {
      context: "Agent is evaluating a lead's quality based on engagement",
      messages: [
        {
          name: "User",
          content: {
            text: "Lead opened 3 emails, clicked Calendly link, from Instagram source",
          },
        },
      ],
      outcome: "Lead quality: HIGH",
    },
  ],
};
