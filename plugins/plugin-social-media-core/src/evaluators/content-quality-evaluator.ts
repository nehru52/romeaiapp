/**
 * CONTENT_QUALITY evaluator — evaluates content quality before posting.
 *
 * Checks content against Rome travel agency quality criteria and returns
 * a score from 0–1. A score below 0.6 indicates the content needs revision
 * before scheduling.
 */

import {
  type IAgentRuntime,
  logger,
  type Memory,
  type State,
} from "@elizaos/core";
import { SOCIAL_MEDIA_LOG_PREFIX } from "../types.ts";

interface QualityCheckResult {
  score: number;
  passed: string[];
  failed: string[];
  suggestions: string[];
}

const MIN_CAPTION_LENGTH = 50;
const MAX_HASHTAG_COUNT = 30;
const MIN_HASHTAG_COUNT = 3;
const ROME_KEYWORDS = [
  "rome",
  "italy",
  "italian",
  "colosseum",
  "vatican",
  "trastevere",
  "piazza",
  "trevi",
  "pantheon",
  "gelato",
  "pasta",
  "pizza",
  "forum",
  "palatine",
  "borghese",
];
const ENGAGEMENT_TRIGGERS = [
  "save",
  "share",
  "comment",
  "link in bio",
  "book now",
  "swipe",
  "tag a friend",
  "follow",
  "click",
];

function checkContent(text: string): QualityCheckResult {
  const lowerText = text.toLowerCase();
  const passed: string[] = [];
  const failed: string[] = [];
  const suggestions: string[] = [];

  // Check minimum caption length.
  if (text.length >= MIN_CAPTION_LENGTH) {
    passed.push("Caption meets minimum length");
  } else {
    failed.push("Caption too short");
    suggestions.push(
      `Expand caption to at least ${MIN_CAPTION_LENGTH} characters`,
    );
  }

  // Check for Rome/Italy relevance.
  const hasRomeKeyword = ROME_KEYWORDS.some((kw) => lowerText.includes(kw));
  if (hasRomeKeyword) {
    passed.push("Contains Rome/Italy relevant keywords");
  } else {
    failed.push("Missing Rome/Italy keywords");
    suggestions.push(
      "Include at least one Rome or Italy keyword for relevance",
    );
  }

  // Check for hashtags.
  const hashtagMatches = text.match(/#\w+/g) ?? [];
  const hashtagCount = hashtagMatches.length;
  if (hashtagCount >= MIN_HASHTAG_COUNT && hashtagCount <= MAX_HASHTAG_COUNT) {
    passed.push(`Hashtag count within range (${hashtagCount})`);
  } else if (hashtagCount < MIN_HASHTAG_COUNT) {
    failed.push("Too few hashtags");
    suggestions.push(
      `Add at least ${MIN_HASHTAG_COUNT} hashtags for discoverability`,
    );
  } else {
    failed.push("Too many hashtags");
    suggestions.push(`Reduce to ${MAX_HASHTAG_COUNT} or fewer hashtags`);
  }

  // Check for engagement trigger.
  const hasEngagementTrigger = ENGAGEMENT_TRIGGERS.some((trigger) =>
    lowerText.includes(trigger),
  );
  if (hasEngagementTrigger) {
    passed.push("Contains engagement CTA");
  } else {
    failed.push("Missing engagement CTA");
    suggestions.push(
      "Add a call-to-action (save, comment, share, or link in bio)",
    );
  }

  // Check for emoji presence (improves engagement on most platforms).
  const hasEmoji = /\p{Emoji}/u.test(text);
  if (hasEmoji) {
    passed.push("Contains emoji for visual appeal");
  } else {
    failed.push("No emoji detected");
    suggestions.push("Add 1–3 relevant emoji to increase engagement rate");
  }

  // Check for excessive capitalisation (spam signal).
  const upperCaseRatio =
    text.length > 0 ? (text.match(/[A-Z]/g) ?? []).length / text.length : 0;
  if (upperCaseRatio < 0.3) {
    passed.push("Capitalisation within normal range");
  } else {
    failed.push("Excessive capitalisation detected");
    suggestions.push("Reduce ALL CAPS usage — it can trigger spam filters");
  }

  const totalChecks = passed.length + failed.length;
  const score = totalChecks > 0 ? passed.length / totalChecks : 0;

  return { score, passed, failed, suggestions };
}

export const contentQualityEvaluator = {
  name: "CONTENT_QUALITY",
  description:
    "Evaluates content quality before posting. Checks caption length, Rome relevance, hashtags, CTAs, and engagement signals.",
  similes: ["QUALITY_CHECK", "CONTENT_REVIEW"],
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
      `${SOCIAL_MEDIA_LOG_PREFIX} CONTENT_QUALITY evaluator running`,
    );

    const result = checkContent(text);

    const verdict =
      result.score >= 0.8
        ? "EXCELLENT"
        : result.score >= 0.6
          ? "GOOD"
          : result.score >= 0.4
            ? "NEEDS_IMPROVEMENT"
            : "POOR";

    const summary = [
      `Content quality score: ${(result.score * 100).toFixed(0)}/100 (${verdict})`,
      "",
      result.passed.length > 0
        ? `Passed checks:\n${result.passed.map((p) => `  ✓ ${p}`).join("\n")}`
        : "",
      result.failed.length > 0
        ? `Failed checks:\n${result.failed.map((f) => `  ✗ ${f}`).join("\n")}`
        : "",
      result.suggestions.length > 0
        ? `Suggestions:\n${result.suggestions.map((s) => `  → ${s}`).join("\n")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    logger.info(
      { agentId: runtime.agentId, score: result.score, verdict },
      `${SOCIAL_MEDIA_LOG_PREFIX} content quality evaluation complete`,
    );

    if (callback) {
      await callback({ text: summary, data: { ...result, verdict } });
    }

    return { verdict, ...result };
  },
  examples: [
    {
      context: "Agent is reviewing a Rome travel post before scheduling",
      messages: [
        {
          name: "User",
          content: {
            text: "✨ Rome's Colosseum at golden hour — save this for your Italy bucket list! #rome #italy #colosseum #travel #bucketlist",
          },
        },
      ],
      outcome: "Content quality score: 80/100 (EXCELLENT)",
    },
  ],
};
