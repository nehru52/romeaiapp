/**
 * GET_PROMPT action — retrieves a prompt template by ID.
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

export const getPromptAction: Action = {
  name: "GET_PROMPT",
  description:
    "Retrieve a prompt template by ID from the Rome Travel Agency prompt library",
  similes: [
    "GET_PROMPT",
    "PROMPT_TEMPLATE",
    "FIND_PROMPT",
    "LOAD_PROMPT",
    "PROMPT_BY_ID",
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
      `${PROMPT_LOG_PREFIX} GET_PROMPT handler called`,
    );

    const text = message.content.text ?? "";

    // Extract prompt ID from message.
    const idMatch = text.match(/prompt[:\s]+(.+?)(?:\s+|$)/i);
    const promptId = idMatch?.[1]?.trim() ?? "deepseek-content-strategy";

    const service = runtime.getService<PromptService>(
      PromptService.serviceType,
    );

    if (!service) {
      const errorMsg = "PromptService not registered";
      logger.error(`${PROMPT_LOG_PREFIX} ${errorMsg}`);
      return { success: false, text: errorMsg };
    }

    const prompt = service.getPrompt(promptId);

    if (!prompt) {
      const errorMsg = `Prompt not found: ${promptId}`;
      logger.error(`${PROMPT_LOG_PREFIX} ${errorMsg}`);
      return { success: false, text: errorMsg };
    }

    const responseText = [
      `Prompt: ${prompt.name} (${prompt.id})`,
      `Model: ${prompt.model}`,
      `Category: ${prompt.category}`,
      `Description: ${prompt.description}`,
      `Variables: ${prompt.variables.join(", ")}`,
      `Tags: ${prompt.tags.join(", ")}`,
      "",
      "Template:",
      "─".repeat(40),
      prompt.template,
      "─".repeat(40),
      "",
      `Example: ${prompt.example}`,
    ].join("\n");

    await callback?.({ text: responseText });

    return {
      success: true,
      text: responseText,
      data: { prompt },
    };
  },
};
