/**
 * PackService — manages industry packs: listing, loading, and auto-generation.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type {
  ClientCharacter,
  ClientConfig,
  ClientHashtags,
  IndustryPack,
  PackGeneratorAnswers,
} from "../types.js";

const PACKS_DIR = join(import.meta.dirname, "..", "packs");

export class PackService {
  private packs: Map<string, IndustryPack> = new Map();
  private loaded = false;

  /** Load all pack definitions from the packs directory. */
  loadPacks(): IndustryPack[] {
    if (this.loaded) return [...this.packs.values()];

    const indexPath = join(PACKS_DIR, "pack-index.json");

    if (!existsSync(indexPath)) {
      // Return built-in default packs if index isn't found.
      const defaults = this.getBuiltInPacks();
      for (const pack of defaults) {
        this.packs.set(pack.slug, pack);
      }
      this.loaded = true;
      return defaults;
    }

    try {
      const raw = readFileSync(indexPath, "utf-8");
      const data = JSON.parse(raw) as IndustryPack[];
      for (const pack of data) {
        this.packs.set(pack.slug, pack);
      }
    } catch {
      // Fall back to built-in packs.
      const defaults = this.getBuiltInPacks();
      for (const pack of defaults) {
        this.packs.set(pack.slug, pack);
      }
    }

    this.loaded = true;
    return [...this.packs.values()];
  }

  /** Get a single pack by slug. */
  getPack(slug: string): IndustryPack | undefined {
    this.loadPacks();
    return this.packs.get(slug);
  }

  /** Load the full pack configuration files for a client. */
  loadPackConfig(
    packSlug: string,
  ): Omit<
    ClientConfig,
    | "tenantId"
    | "products"
    | "platforms"
    | "credentialIds"
    | "updatedAt"
    | "promptOverrides"
  > | null {
    const packDir = join(PACKS_DIR, packSlug);
    if (!existsSync(packDir)) return null;

    try {
      const characterPath = join(packDir, "character.json");
      const _promptsPath = join(packDir, "prompts.json");
      const _calendarPath = join(packDir, "calendar.json");
      const _hooksPath = join(packDir, "hooks.json");
      const hashtagsPath = join(packDir, "hashtags.json");

      const character: ClientCharacter = existsSync(characterPath)
        ? JSON.parse(readFileSync(characterPath, "utf-8"))
        : this.getDefaultCharacter(packSlug);

      const hashtags: ClientHashtags = existsSync(hashtagsPath)
        ? JSON.parse(readFileSync(hashtagsPath, "utf-8"))
        : { tier1: [], tier2: [], tier3: [], geo: [] };

      return {
        packSlug,
        character,
        hashtags,
      };
    } catch {
      return null;
    }
  }

  /** Auto-generate a pack from client answers. */
  async generatePack(answers: PackGeneratorAnswers): Promise<{
    packSlug: string;
    character: ClientCharacter;
    prompts: Record<string, string>;
    calendar: Record<string, unknown>;
    hooks: string[];
    hashtags: ClientHashtags;
  }> {
    const slug = answers.industry
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const character = this.generateCharacter(answers);
    const prompts = this.generatePrompts(answers);
    const calendar = this.generateCalendar(answers);
    const hooks = this.generateHooks(answers);
    const hashtags = this.generateHashtags(answers);

    return {
      packSlug: slug,
      character,
      prompts,
      calendar,
      hooks,
      hashtags,
    };
  }

  // ── Private helpers ──────────────────────────────────────────────

  private getBuiltInPacks(): IndustryPack[] {
    return [
      {
        slug: "travel-agency",
        name: "Travel Agency & Tours",
        description: "Hotels, tour operators, DMCs, cruise specialists.",
        icon: "✈️",
        categories: ["travel", "tourism", "hospitality"],
        exampleBusinesses: [
          "Rome tour agency",
          "Bali resort",
          "NYC walking tours",
        ],
        path: "packs/travel-agency",
        featured: true,
      },
      {
        slug: "real-estate",
        name: "Real Estate & Property",
        description: "Agents, brokerages, luxury properties, rentals.",
        icon: "🏠",
        categories: ["real estate", "property", "rentals"],
        exampleBusinesses: [
          "Miami realtor",
          "London luxury agent",
          "Airbnb manager",
        ],
        path: "packs/real-estate",
        featured: true,
      },
      {
        slug: "restaurant",
        name: "Restaurants & Food",
        description: "Restaurants, cafes, bars, food trucks, caterers.",
        icon: "🍽️",
        categories: ["food", "restaurant", "hospitality"],
        exampleBusinesses: ["Italian restaurant", "NYC cafe", "food truck"],
        path: "packs/restaurant",
        featured: true,
      },
      {
        slug: "fitness-coaching",
        name: "Fitness & Coaching",
        description: "Gyms, personal trainers, nutritionists, life coaches.",
        icon: "💪",
        categories: ["fitness", "coaching", "wellness"],
        exampleBusinesses: [
          "Personal trainer",
          "Yoga studio",
          "Nutrition coach",
        ],
        path: "packs/fitness-coaching",
        featured: true,
      },
      {
        slug: "dental-clinic",
        name: "Dental & Medical Clinics",
        description: "Dentists, dermatologists, med spas, optometrists.",
        icon: "🦷",
        categories: ["medical", "dental", "healthcare"],
        exampleBusinesses: ["Dental clinic", "Med spa", "Dermatologist"],
        path: "packs/dental-clinic",
        featured: true,
      },
      {
        slug: "custom",
        name: "Custom / Other",
        description: "Any business not covered by the above packs.",
        icon: "⚡",
        categories: ["custom", "other"],
        exampleBusinesses: ["Any business type"],
        path: "packs/custom",
        featured: false,
      },
    ];
  }

  private getDefaultCharacter(slug: string): ClientCharacter {
    return {
      name: `${slug.charAt(0).toUpperCase() + slug.slice(1)} Expert`,
      bio: [""],
      lore: [""],
      knowledge: [""],
      style: {
        all: ["Be helpful, knowledgeable, and conversion-focused."],
        chat: ["Be direct and helpful."],
        post: ["Use clear hooks and strong CTAs."],
      },
      toneModifiers: {
        formality: 5,
        humor: 3,
        salesAggression: 4,
        empathy: 7,
      },
    };
  }

  private generateCharacter(answers: PackGeneratorAnswers): ClientCharacter {
    const name =
      answers.brandPersonality.split(",")[0]?.trim() ?? answers.industry;
    return {
      name: `${name} Expert`,
      bio: [
        `${name} specialist focused on ${answers.productsOrServices}.`,
        `Serves ${answers.targetAudience} across ${answers.locations.join(", ")}.`,
      ],
      lore: [
        `Knows the ${answers.industry} industry inside out.`,
        `Understands that customers don't buy ${answers.productsOrServices} — they buy outcomes.`,
      ],
      knowledge: [
        `${answers.industry} expertise, pricing, and trends.`,
        `Competitor awareness: ${answers.competitors.join(", ")}.`,
      ],
      style: {
        all: [
          "Keep sentences punchy and scannable.",
          "Always include a strong hook in the first sentence.",
          "End with a clear CTA.",
        ],
        chat: ["Be direct and value-first."],
        post: ["Use bullet points. End with CTA directing to link in bio."],
      },
      toneModifiers: {
        formality: answers.priceRange === "luxury" ? 8 : 5,
        humor: answers.priceRange === "luxury" ? 2 : 5,
        salesAggression: 4,
        empathy: 7,
      },
    };
  }

  private generatePrompts(
    answers: PackGeneratorAnswers,
  ): Record<string, string> {
    return {
      "content-strategy": `Weekly content strategy for ${answers.industry} targeting ${answers.targetAudience}. Content mix: 60% value, 30% education, 10% promotional.`,
      "image-photoreal": `Photorealistic shot of ${answers.productsOrServices}, professional lighting, 8K, editorial style.`,
      "image-carousel": `Clean infographic: "${answers.productsOrServices}" guide, modern design, brand colors, Pinterest-worthy.`,
      "caption-engagement": `Write engaging caption for ${answers.industry} about {{topic}}. Include hook, value, and CTA.`,
      "hook-generator": `Generate 5 viral hooks for ${answers.industry} content about {{topic}}. Under 100 characters each.`,
      "email-nurture": `Write nurture email for ${answers.industry} lead. Personal, value-first, CTA to consultation.`,
    };
  }

  private generateCalendar(
    _answers: PackGeneratorAnswers,
  ): Record<string, unknown> {
    return {
      monday: {
        format: "carousel",
        category: "inspirational",
        title: "Monday Feature",
      },
      tuesday: {
        format: "reel",
        category: "educational",
        title: "Tuesday Tips",
      },
      wednesday: {
        format: "story",
        category: "inspirational",
        title: "Wednesday Spotlight",
      },
      thursday: {
        format: "reel",
        category: "educational",
        title: "Thursday Deep Dive",
      },
      friday: {
        format: "carousel",
        category: "promotional",
        title: "Friday Offer",
      },
      saturday: {
        format: "story",
        category: "inspirational",
        title: "Saturday Vibes",
      },
      sunday: {
        format: "feed_post",
        category: "educational",
        title: "Sunday Planning",
      },
    };
  }

  private generateHooks(_answers: PackGeneratorAnswers): string[] {
    return [
      "I wish I knew this before...",
      "This vs That comparison",
      "POV: You're experiencing...",
      "Stop doing X, do Y instead",
      "The real reason everyone is...",
      "3 things nobody tells you about...",
    ];
  }

  private generateHashtags(answers: PackGeneratorAnswers): ClientHashtags {
    const words = answers.industry.split(/\s+/);
    return {
      tier1: words.map((w: string) => `#${w}`),
      tier2: answers.locations.map((l: string) => `#${l.replace(/\s+/g, "")}`),
      tier3: [`#${answers.industry.replace(/\s+/g, "")}Expert`],
      geo: answers.locations.map((l: string) => `#${l.replace(/\s+/g, "")}`),
    };
  }
}
