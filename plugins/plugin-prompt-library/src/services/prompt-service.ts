/**
 * PromptService — manages a comprehensive library of AI prompt templates.
 *
 * Provides 12+ prompt templates for all models used in the Rome Travel
 * Agency system: DeepSeek V4, FLUX.2 Pro, Ideogram 3.0, Veo 3.1, etc.
 */

import { type IAgentRuntime, Service } from "@elizaos/core";
import {
  PROMPT_LIBRARY_SERVICE_TYPE,
  type PromptCategory,
  type PromptModel,
  type PromptTemplate,
  type RenderedPrompt,
} from "../types.js";

/**
 * Built-in prompt templates for the Rome Travel Agency system.
 */
const PROMPT_TEMPLATES: PromptTemplate[] = [
  // ── Content Strategy ─────────────────────────────────────────────
  {
    id: "deepseek-content-strategy",
    name: "Weekly Content Strategy",
    model: "deepseek-v4-pro",
    category: "content-strategy",
    description:
      "Generate a weekly content strategy for Rome travel social media",
    template: `You are a senior social media strategist for a Rome travel agency. Analyze the following trends and create a weekly content strategy.

Trends: {{trends}}
Target platforms: {{platforms}}
Content mix: 60% inspirational, 30% educational, 10% promotional

Output a day-by-day content plan with:
- Platform and format for each post
- Hook angle for each post
- Recommended hashtags
- Best posting time

Focus on Rome and Italy travel content that converts viewers into consultation bookings.`,
    variables: ["trends", "platforms"],
    example:
      "Weekly strategy for Instagram + TikTok focusing on hidden Rome gems",
    tags: ["strategy", "weekly", "content-plan"],
  },

  // ── Image Generation ─────────────────────────────────────────────
  {
    id: "flux-photoreal-rome",
    name: "FLUX Photoreal Rome Scene",
    model: "flux-2-pro",
    category: "image-generation",
    description: "Generate a photorealistic Rome travel image",
    template: `Photorealistic shot of {{scene}} in Rome, Italy. {{style_details}}. Golden hour lighting, ultra-high resolution, travel photography, National Geographic quality. Shot on Sony A7R IV, 24mm wide angle. No text, no watermarks.`,
    variables: ["scene", "style_details"],
    example:
      "Photorealistic shot of the Colosseum at golden hour with dramatic clouds",
    tags: ["photoreal", "rome", "travel"],
  },
  {
    id: "ideogram-carousel-rome",
    name: "Ideogram Text-Heavy Carousel",
    model: "ideogram-3",
    category: "image-generation",
    description: "Generate text-heavy carousel slides for Rome travel tips",
    template: `Clean, modern travel infographic slide. Title: "{{title}}". Body text: "{{body_text}}". Color palette: warm terracotta (#C85A3C), cream (#FFF8F0), olive (#5C6B3C). Minimalist Italian design aesthetic. High readability, sans-serif typography. {{visual_element}} as background element.`,
    variables: ["title", "body_text", "visual_element"],
    example:
      "5 Things to Know Before Visiting Rome — carousel slide with terracotta palette",
    tags: ["carousel", "text-heavy", "infographic"],
  },

  // ── Video Generation ─────────────────────────────────────────────
  {
    id: "veo-hero-rome",
    name: "Veo Hero Rome Cinematic",
    model: "veo-3.1",
    category: "video-generation",
    description: "Generate cinematic hero video of Rome",
    template: `Cinematic {{duration}} video of {{scene}} in Rome. {{camera_movement}}. Warm color grading, film grain, anamorphic lens flare. Ambient Italian street sounds. No dialogue. 4K resolution, 24fps.`,
    variables: ["scene", "duration", "camera_movement"],
    example:
      "Cinematic 15-second drone shot flying over the Roman Forum at sunrise",
    tags: ["hero", "cinematic", "drone"],
  },
  {
    id: "kling-standard-rome",
    name: "Kling Standard Rome Content",
    model: "kling-3",
    category: "video-generation",
    description: "Generate standard Rome travel video content",
    template: `{{duration}} video: {{subject}} in Rome. {{style}}. Smooth transitions, professional color grade. Suitable for Instagram Reels and TikTok. Vertical 9:16 format.`,
    variables: ["subject", "duration", "style"],
    example:
      "8-second video of making fresh pasta in a Roman trattoria kitchen",
    tags: ["standard", "reels", "tiktok"],
  },

  // ── Copywriting ──────────────────────────────────────────────────
  {
    id: "deepseek-caption-rome",
    name: "DeepSeek Rome Caption Writer",
    model: "deepseek-v4-flash",
    category: "copywriting",
    description: "Write engaging Rome travel captions",
    template: `Write an engaging {{platform}} caption for a {{format}} about {{topic}} in Rome.

Requirements:
- Hook must stop the scroll in 3 seconds
- Use the "{{hook_formula}}" formula
- Include 5-7 relevant hashtags
- End with a clear CTA
- Tone: {{tone}}
- Max 150 characters for the hook`,
    variables: ["platform", "format", "topic", "hook_formula", "tone"],
    example:
      "Instagram reel caption about Trastevere food tour with 'I wish I knew' hook",
    tags: ["caption", "copywriting", "social"],
  },
  {
    id: "deepseek-hook-generator",
    name: "Viral Hook Generator",
    model: "deepseek-v4-flash",
    category: "hook",
    description: "Generate viral hook lines for Rome travel content",
    template: `Generate 5 viral hook lines for {{platform}} content about {{topic}} in Rome.

Use these proven formulas:
1. "I wish I knew this before..."
2. "This vs That comparison"
3. "POV: You are..."
4. "Stop doing X, do Y instead"
5. "The real reason..."

Each hook must be under 100 characters and create immediate curiosity.`,
    variables: ["platform", "topic"],
    example: "5 viral hooks for TikTok about Rome on a budget",
    tags: ["hook", "viral", "copywriting"],
  },

  // ── Email Nurture ────────────────────────────────────────────────
  {
    id: "deepseek-nurture-email",
    name: "Email Nurture Sequence Writer",
    model: "deepseek-v4-pro",
    category: "email-nurture",
    description: "Write nurture sequence emails for Rome travel leads",
    template: `Write nurture email #{{step_number}} for a Rome travel lead.

Lead name: {{lead_name}}
Lead source: {{lead_source}}
Previous interactions: {{previous_interactions}}

Email goal: {{email_goal}}
Tone: Warm, personal, insider knowledge
CTA: {{cta}}

Keep it under 200 words. Use the lead's name. Include one insider tip that makes them feel special.`,
    variables: [
      "step_number",
      "lead_name",
      "lead_source",
      "previous_interactions",
      "email_goal",
      "cta",
    ],
    example:
      "Nurture email #3 for a lead who downloaded the Rome itinerary — focus on local experiences",
    tags: ["email", "nurture", "conversion"],
  },

  // ── Trend Analysis ───────────────────────────────────────────────
  {
    id: "deepseek-trend-analysis",
    name: "Trend Analysis Prompt",
    model: "deepseek-v4-pro",
    category: "trend-analysis",
    description: "Analyze social media trends for Rome travel",
    template: `Analyze the following social media data for Rome/Italy travel trends.

Data: {{trend_data}}

Identify:
1. Top 5 trending topics and their engagement rates
2. Content gaps — what is not being covered well
3. Rising hashtags with growth velocity
4. Competitor content performing well
5. Recommended content angles for this week

Output as structured JSON.`,
    variables: ["trend_data"],
    example:
      "Analyze TikTok and Instagram data for #RomeTravel trends this week",
    tags: ["trends", "analysis", "data"],
  },

  // ── Hashtags ─────────────────────────────────────────────────────
  {
    id: "deepseek-hashtag-strategy",
    name: "Hashtag Strategy",
    model: "deepseek-v4-flash",
    category: "hashtag",
    description: "Generate optimal hashtag sets for Rome travel posts",
    template: `Generate an optimal hashtag set for a {{platform}} {{format}} about {{topic}} in Rome.

Include:
- 3 high-volume hashtags (100k+ posts)
- 5 medium-volume hashtags (10k-100k posts)
- 5 niche/branded hashtags (under 10k posts)
- 2 trending/timely hashtags

Total: 15-20 hashtags. Mix of English and Italian.`,
    variables: ["platform", "format", "topic"],
    example: "Hashtag set for Instagram reel about Rome street food tour",
    tags: ["hashtags", "strategy", "reach"],
  },

  // ── Storytelling ─────────────────────────────────────────────────
  {
    id: "deepseek-storytelling",
    name: "Rome Storytelling Framework",
    model: "deepseek-v4-pro",
    category: "storytelling",
    description: "Create compelling Rome travel stories",
    template: `Tell a compelling story about {{experience}} in Rome for {{platform}}.

Story structure:
1. Hook: Start with a surprising or emotional moment
2. Context: Set the scene with sensory details
3. Conflict/Discovery: The twist or realization
4. Resolution: How it changed the traveler's perspective
5. CTA: Invite the audience to share their own experience

Tone: {{tone}}
Length: {{length}}
Include: Specific Roman locations, local names, sensory details`,
    variables: ["experience", "platform", "tone", "length"],
    example:
      "Story about getting lost in Trastevere and finding the best carbonara of your life",
    tags: ["storytelling", "engagement", "emotion"],
  },
];

export class PromptService extends Service {
  static override readonly serviceType = PROMPT_LIBRARY_SERVICE_TYPE;
  override capabilityDescription =
    "Provides a comprehensive library of AI prompts for all models used in the Rome Travel Agency system";

  private prompts: PromptTemplate[] = [...PROMPT_TEMPLATES];

  static override async start(_runtime: IAgentRuntime): Promise<PromptService> {
    return new PromptService();
  }

  override async stop(): Promise<void> {
    // no-op
  }

  /** Get a prompt template by ID. */
  getPrompt(id: string): PromptTemplate | undefined {
    return this.prompts.find((p) => p.id === id);
  }

  /** List prompts, optionally filtered by category or model. */
  listPrompts(
    category?: PromptCategory,
    model?: PromptModel,
  ): PromptTemplate[] {
    return this.prompts.filter(
      (p) =>
        (!category || p.category === category) && (!model || p.model === model),
    );
  }

  /**
   * Render a prompt template with provided variables.
   * Replaces {{variable}} placeholders with actual values.
   */
  renderPrompt(
    templateId: string,
    variables: Record<string, string>,
  ): RenderedPrompt | null {
    const template = this.prompts.find((p) => p.id === templateId);
    if (!template) return null;

    let renderedText = template.template;
    for (const [key, value] of Object.entries(variables)) {
      renderedText = renderedText.replace(
        new RegExp(`\\{\\{${key}\\}\\}`, "g"),
        value,
      );
    }

    return {
      templateId,
      model: template.model,
      renderedText,
      variables,
      timestamp: new Date().toISOString(),
    };
  }

  /** Add a custom prompt to the library. */
  addPrompt(prompt: PromptTemplate): PromptTemplate {
    this.prompts.push(prompt);
    return { ...prompt };
  }

  /** Get all available categories. */
  getCategories(): PromptCategory[] {
    return [...new Set(this.prompts.map((p) => p.category))];
  }

  /** Get all available models. */
  getModels(): PromptModel[] {
    return [...new Set(this.prompts.map((p) => p.model))];
  }
}
