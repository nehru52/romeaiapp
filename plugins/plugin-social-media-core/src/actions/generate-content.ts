/**
 * GENERATE_CONTENT action — produces a social media content brief for a Rome travel post.
 *
 * Applies the 60/30/10 content mix rule:
 *   60% inspirational — aspirational imagery and storytelling
 *   30% educational   — tips, history, insider knowledge
 *   10% promotional   — direct offers, packages, CTAs
 */

import {
  type Action,
  type ActionResult,
  type HandlerCallback,
  type HandlerOptions,
  type IAgentRuntime,
  logger,
  type Memory,
  type State,
} from "@elizaos/core";
import type {
  ContentBrief,
  ContentCategory,
  ContentFormat,
  Platform,
} from "../types.ts";
import { SOCIAL_MEDIA_LOG_PREFIX } from "../types.ts";

const CONTENT_MIX_RULE = `60/30/10 Content Mix Rule:
- 60% Inspirational: aspirational Rome imagery, travel dreams, emotional storytelling
- 30% Educational: tips, history, hidden gems, local knowledge, travel hacks
- 10% Promotional: direct offers, packages, booking CTAs, agency services`;

const IMAGE_MODEL_BY_FORMAT: Record<string, string> = {
  reel: "RunwayML Gen-3 (video generation recommended)",
  carousel: "Midjourney v7 or DALL-E 3 (multi-image carousel)",
  story: "Midjourney v7 (vertical 9:16 format)",
  feed_post: "Midjourney v7 or Stable Diffusion XL",
  short: "RunwayML Gen-3 (short video)",
  long_form: "RunwayML Gen-3 (YouTube-length video)",
  pin: "Midjourney v7 (vertical 2:3 Pinterest format)",
  ugc: "iPhone cinematic mode or UGC creator brief",
};

const VIDEO_MODEL_BY_FORMAT: Record<string, string> = {
  reel: "RunwayML Gen-3 Alpha or Kling AI",
  short: "RunwayML Gen-3 Alpha or Kling AI",
  long_form: "Sora or RunwayML Gen-3 (extended)",
  ugc: "Real device recording — no AI model needed",
};

function buildHashtags(
  platform: Platform,
  category: ContentCategory,
  topic: string,
): string[] {
  const base = ["#rome", "#italy", "#italytravel", "#romeitaly", "#visitrome"];
  const categoryTags: Record<ContentCategory, string[]> = {
    inspirational: [
      "#travelinspiration",
      "#bucketlist",
      "#wanderlust",
      "#traveldreams",
    ],
    educational: ["#traveltips", "#hiddengems", "#rometips", "#localknowledge"],
    promotional: [
      "#rometravel",
      "#italyholiday",
      "#romanholiday",
      "#travelagency",
    ],
  };
  const platformTags: Record<Platform, string[]> = {
    instagram: ["#instagramrome", "#igtravel"],
    tiktok: ["#tiktoktravel", "#fyp", "#romedaytrip"],
    pinterest: ["#pinteresttravel", "#travelboard"],
    youtube: ["#rometravel", "#romevlog"],
    facebook: ["#rometravelgroup", "#italytravel"],
    linkedin: ["#travelbusiness", "#tourismmarketing"],
  };
  const topicSlug = topic.toLowerCase().replace(/\s+/g, "");
  return [
    ...base,
    ...categoryTags[category],
    ...(platformTags[platform] ?? []),
    `#${topicSlug}`,
  ].slice(0, 12);
}

function buildCaptionDraft(
  platform: Platform,
  category: ContentCategory,
  topic: string,
  hook: string,
): string {
  const cta: Record<ContentCategory, string> = {
    inspirational: "Save this for your Rome bucket list! 🏛️",
    educational: "Which tip surprised you most? Drop it in the comments! 💬",
    promotional: "Book your Rome experience — link in bio! 🔗",
  };
  const limit: Record<Platform, number> = {
    instagram: 2200,
    tiktok: 300,
    pinterest: 500,
    youtube: 5000,
    facebook: 63206,
    linkedin: 3000,
  };
  const body = `${hook}\n\n${topic} — one of Rome's most unforgettable experiences. Whether you're a first-time visitor or a seasoned traveller, this is something you simply cannot miss.\n\n${cta[category]}`;
  const cap = limit[platform] ?? 2200;
  return body.length > cap ? `${body.slice(0, cap - 3)}...` : body;
}

function buildHook(category: ContentCategory, topic: string): string {
  const hooks: Record<ContentCategory, string> = {
    inspirational: `✨ This is why everyone dreams of Rome… (${topic})`,
    educational: `🏛️ Most tourists miss this about ${topic} in Rome — here's what locals know:`,
    promotional: `🔑 Limited availability: exclusive ${topic} experience in Rome. Here's what's included:`,
  };
  return hooks[category];
}

export const generateContentAction: Action = {
  name: "GENERATE_CONTENT",
  description:
    "Generate a social media post (image + caption) for a specific platform and format. Applies the 60/30/10 content mix rule for Rome travel agencies.",
  similes: ["CREATE_CONTENT", "MAKE_POST", "GENERATE_POST"],
  validate: async (_runtime: IAgentRuntime): Promise<boolean> => true,
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    _state?: State,
    _options?: HandlerOptions,
    callback?: HandlerCallback,
  ): Promise<ActionResult> => {
    logger.info(
      { agentId: runtime.agentId },
      `${SOCIAL_MEDIA_LOG_PREFIX} GENERATE_CONTENT handler called`,
    );

    const text = message.content.text ?? "";

    // Extract parameters from message text with sensible defaults.
    const platform: Platform = ([
      "instagram",
      "tiktok",
      "pinterest",
      "youtube",
      "facebook",
      "linkedin",
    ].find((p) => text.toLowerCase().includes(p)) ?? "instagram") as Platform;

    const format: ContentFormat = ([
      "reel",
      "carousel",
      "story",
      "feed_post",
      "short",
      "long_form",
      "pin",
      "ugc",
    ].find(
      (f) =>
        text.toLowerCase().includes(f.replace("_", " ")) ||
        text.toLowerCase().includes(f),
    ) ?? "feed_post") as ContentFormat;

    const category: ContentCategory = text.toLowerCase().includes("promot")
      ? "promotional"
      : text.toLowerCase().includes("educat") ||
          text.toLowerCase().includes("tip")
        ? "educational"
        : "inspirational";

    // Extract topic — everything after "about" or "for", else default.
    const topicMatch = text.match(
      /(?:about|for|on)\s+(.+?)(?:\s+on\s|\s+for\s|$)/i,
    );
    const topic = topicMatch?.[1]?.trim() ?? "Rome's Colosseum at sunset";

    const hook = buildHook(category, topic);
    const hashtags = buildHashtags(platform, category, topic);
    const captionDraft = buildCaptionDraft(platform, category, topic, hook);

    const brief: ContentBrief = {
      hook,
      visualDirection: `${category === "inspirational" ? "Golden hour, wide-angle, warm tones" : category === "educational" ? "Clean informative overlay, medium shot" : "Direct-to-camera, branded overlay with CTA"} — subject: ${topic}`,
      hashtags,
      format,
      platform,
    };

    const imageModelRecommendation =
      IMAGE_MODEL_BY_FORMAT[format] ?? "Midjourney v7";
    const videoModelRecommendation = VIDEO_MODEL_BY_FORMAT[format];

    const responseText = [
      `Content brief generated for ${platform} (${format}, ${category}):`,
      "",
      `Hook: ${brief.hook}`,
      `Visual direction: ${brief.visualDirection}`,
      `Caption draft:\n${captionDraft}`,
      `Hashtags: ${hashtags.join(" ")}`,
      "",
      `Image model recommendation: ${imageModelRecommendation}`,
      videoModelRecommendation
        ? `Video model recommendation: ${videoModelRecommendation}`
        : "",
      "",
      `Content mix note: ${CONTENT_MIX_RULE.split("\n")[0]}`,
    ]
      .filter(Boolean)
      .join("\n");

    await callback?.({ text: responseText });

    return {
      success: true,
      text: responseText,
      data: {
        brief,
        captionDraft,
        hashtags,
        imageModelRecommendation,
        videoModelRecommendation,
        contentMixRule: "60/30/10",
      },
    };
  },
};
