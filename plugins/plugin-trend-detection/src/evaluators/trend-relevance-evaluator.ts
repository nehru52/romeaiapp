/**
 * TREND_RELEVANCE evaluator — evaluates whether generated content
 * aligns with current trending topics for Rome travel.
 */

import {
  type IAgentRuntime,
  logger,
  type Memory,
  type State,
} from "@elizaos/core";
import { TREND_LOG_PREFIX } from "../types.js";

const TRENDING_KEYWORDS = [
  "hidden",
  "secret",
  "budget",
  "cheap",
  "food",
  "carbonara",
  "gelato",
  "trastevere",
  "colosseum",
  "vatican",
  "pantheon",
  "trevi",
  "forum",
  "comparison",
  "vs",
  "pov",
  "local",
  "authentic",
  "underground",
  "rooftop",
  "sunset",
];

const ENGAGEMENT_SIGNALS = [
  "save",
  "share",
  "comment",
  "link in bio",
  "book now",
  "swipe",
  "tag",
  "follow",
  "click",
];

interface RelevanceResult {
  score: number;
  trendingKeywords: string[];
  engagementSignals: string[];
  suggestions: string[];
}

function evaluateRelevance(text: string): RelevanceResult {
  const lowerText = text.toLowerCase();
  const passed: string[] = [];
  const failed: string[] = [];
  const suggestions: string[] = [];

  // Check trending keyword presence.
  const foundKeywords = TRENDING_KEYWORDS.filter((kw) =>
    lowerText.includes(kw),
  );
  if (foundKeywords.length >= 2) {
    passed.push(`Contains ${foundKeywords.length} trending keywords`);
  } else if (foundKeywords.length === 1) {
    passed.push("Contains 1 trending keyword");
    suggestions.push(
      "Add more trending keywords (hidden, budget, food, local)",
    );
  } else {
    failed.push("No trending keywords found");
    suggestions.push(
      `Include trending keywords: ${TRENDING_KEYWORDS.slice(0, 5).join(", ")}`,
    );
  }

  // Check engagement signals.
  const foundSignals = ENGAGEMENT_SIGNALS.filter((s) => lowerText.includes(s));
  if (foundSignals.length >= 1) {
    passed.push("Contains engagement CTA");
  } else {
    failed.push("Missing engagement CTA");
    suggestions.push(
      "Add a call-to-action (save, share, comment, link in bio)",
    );
  }

  // Check for numbers (listicles perform well).
  const hasNumbers = /\d+/.test(text);
  if (hasNumbers) {
    passed.push("Contains numbers (listicle format)");
  } else {
    suggestions.push("Consider adding numbered tips for higher engagement");
  }

  // Check for question (drives comments).
  const hasQuestion = text.includes("?");
  if (hasQuestion) {
    passed.push("Contains question (drives comments)");
  } else {
    suggestions.push("Add a question to drive comment engagement");
  }

  const totalChecks = passed.length + failed.length;
  const score = totalChecks > 0 ? passed.length / totalChecks : 0;

  return {
    score: Math.round(score * 100),
    trendingKeywords: foundKeywords,
    engagementSignals: foundSignals,
    suggestions,
  };
}

export const trendRelevanceEvaluator = {
  name: "TREND_RELEVANCE",
  description:
    "Evaluates whether generated content aligns with current trending topics for Rome travel",
  similes: ["TREND_CHECK", "RELEVANCE_SCORE"],
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
      `${TREND_LOG_PREFIX} TREND_RELEVANCE evaluator running`,
    );

    const result = evaluateRelevance(text);

    const verdict =
      result.score >= 80
        ? "HIGHLY_RELEVANT"
        : result.score >= 60
          ? "RELEVANT"
          : result.score >= 40
            ? "MODERATE"
            : "LOW_RELEVANCE";

    const summary = [
      `Trend relevance score: ${result.score}/100 (${verdict})`,
      "",
      result.trendingKeywords.length > 0
        ? `Trending keywords found: ${result.trendingKeywords.join(", ")}`
        : "No trending keywords found",
      result.engagementSignals.length > 0
        ? `Engagement signals: ${result.engagementSignals.join(", ")}`
        : "No engagement signals found",
      "",
      ...result.suggestions.map((s) => `  → ${s}`),
    ]
      .filter(Boolean)
      .join("\n");

    logger.info(
      { agentId: runtime.agentId, score: result.score, verdict },
      `${TREND_LOG_PREFIX} trend relevance evaluation complete`,
    );

    if (callback) {
      await callback({ text: summary, data: { ...result, verdict } });
    }

    return { verdict, ...result };
  },
  examples: [
    {
      context: "Agent is evaluating a Rome travel post for trend alignment",
      messages: [
        {
          name: "User",
          content: {
            text: "5 hidden food spots in Rome that locals don't want tourists to know about. Save this for your trip! #HiddenRome #RomeFood #budget",
          },
        },
      ],
      outcome: "Trend relevance: HIGHLY_RELEVANT",
    },
  ],
};
