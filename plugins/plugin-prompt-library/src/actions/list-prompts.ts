/**
 * LIST_PROMPTS action — lists all available prompts,
 * optionally filtered by category or model.
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
import { PromptService } from "../services/prompt-service.ts";
import { PROMPT_LOG_PREFIX } from "../types.js";

export const listPromptsAction: Action = {
  name: "LIST_PROMPTS",
  description:
    "List all available prompt templates, optionally filtered by category or model",
  similes: [
    "LIST_PROMPTS",
    "ALL_PROMPTS",
    "PROMPT_LIBRARY",
    "BROWSE_PROMPTS",
    "PROMPT_CATEGORIES",
  ],
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
      `${PROMPT_LOG_PREFIX} LIST_PROMPTS handler called`,
    );

    const text = message.content.text ?? "";
    const lowerText = text.toLowerCase();

    // Extract optional category filter.
    const categories = [
      "content-strategy",
      "image-generation",
      "video-generation",
      "copywriting",
      "email-nurture",
      "trend-analysis",
      "caption",
      "hashtag",
      "hook",
      "storytelling",
    ];
    const category = categories.find((c) => lowerText.includes(c));

    // Extract optional model filter.
    const models = [
      "deepseek-v4-pro",
      "deepseek-v4-flash",
      "flux-2-pro",
      "ideogram-3",
      "veo-3.1",
      "kling-3",
    ];
    const model = models.find((m) => lowerText.includes(m));

    const service = runtime.getService<PromptService>(
      PromptService.serviceType,
    );

    if (!service) {
      const errorMsg = "PromptService not registered";
      logger.error(`${PROMPT_LOG_PREFIX} ${errorMsg}`);
      return { success: false, text: errorMsg };
    }

    const prompts = service.listPrompts(category as never, model as never);
    const allCategories = service.getCategories();
    const allModels = service.getModels();

    const responseText = [
      `Prompt Library — ${prompts.length} templates`,
      category ? `Filtered by category: ${category}` : "",
      model ? `Filtered by model: ${model}` : "",
      "",
      "Available categories:",
      `  ${allCategories.join(", ")}`,
      "",
      "Available models:",
      `  ${allModels.join(", ")}`,
      "",
      "─".repeat(50),
      ...prompts.map(
        (p, i) =>
          `${i + 1}. [${p.category}] ${p.name}\n   Model: ${p.model} | ID: ${p.id}\n   ${p.description}`,
      ),
      "─".repeat(50),
      "",
      "Use GET_PROMPT <id> to view a specific template.",
      "Use RENDER_PROMPT <id> with variables to generate a ready-to-use prompt.",
    ]
      .filter(Boolean)
      .join("\n");

    await callback?.({ text: responseText });

    return {
      success: true,
      text: responseText,
      data: { prompts, total: prompts.length },
    };
  },
};
