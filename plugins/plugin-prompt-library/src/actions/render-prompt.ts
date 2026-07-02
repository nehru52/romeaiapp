/**
 * RENDER_PROMPT action — renders a prompt template with
 * provided variables to produce a ready-to-use prompt.
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

export const renderPromptAction: Action = {
  name: "RENDER_PROMPT",
  description:
    "Render a prompt template with provided variables to produce a ready-to-use prompt for the target AI model",
  similes: [
    "RENDER_PROMPT",
    "FILL_PROMPT",
    "CUSTOMIZE_PROMPT",
    "PROMPT_WITH_VARIABLES",
    "GENERATE_PROMPT",
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
      `${PROMPT_LOG_PREFIX} RENDER_PROMPT handler called`,
    );

    const text = message.content.text ?? "";

    // Extract prompt ID.
    const idMatch = text.match(/prompt[:\s]+(.+?)(?:\s+|$)/i);
    const templateId = idMatch?.[1]?.trim() ?? "deepseek-content-strategy";

    // Extract variables from message in key:value format.
    const variables: Record<string, string> = {};
    const varPattern = /(\w+)[:\s]+([^,\n]+)/g;
    let match: RegExpExecArray | null;
    while ((match = varPattern.exec(text)) !== null) {
      const key = match[1]?.toLowerCase();
      if (key !== "prompt" && key !== "id") {
        variables[key] = match[2]?.trim();
      }
    }

    // Apply defaults if no variables provided.
    if (Object.keys(variables).length === 0) {
      if (templateId === "deepseek-content-strategy") {
        variables.trends = "Hidden Rome gems, budget travel tips, food tours";
        variables.platforms = "instagram, tiktok";
      } else if (templateId === "flux-photoreal-rome") {
        variables.scene = "The Colosseum at golden hour with dramatic clouds";
        variables.style_details =
          "Wide-angle lens, warm tones, cinematic composition";
      } else if (templateId === "deepseek-caption-rome") {
        variables.platform = "instagram";
        variables.format = "reel";
        variables.topic = "Trastevere food tour";
        variables.hook_formula = "I wish I knew this before...";
        variables.tone = "warm, enthusiastic, insider knowledge";
      }
    }

    const service = runtime.getService<PromptService>(
      PromptService.serviceType,
    );

    if (!service) {
      const errorMsg = "PromptService not registered";
      logger.error(`${PROMPT_LOG_PREFIX} ${errorMsg}`);
      return { success: false, text: errorMsg };
    }

    const rendered = service.renderPrompt(templateId, variables);

    if (!rendered) {
      const errorMsg = `Template not found: ${templateId}. Use LIST_PROMPTS to see available templates.`;
      logger.error(`${PROMPT_LOG_PREFIX} ${errorMsg}`);
      return { success: false, text: errorMsg };
    }

    const responseText = [
      `Rendered Prompt — ${rendered.templateId}`,
      `Target model: ${rendered.model}`,
      `Variables used: ${Object.keys(rendered.variables).join(", ")}`,
      "",
      "═".repeat(50),
      rendered.renderedText,
      "═".repeat(50),
      "",
      `Rendered at: ${rendered.timestamp}`,
    ].join("\n");

    await callback?.({ text: responseText });

    return {
      success: true,
      text: responseText,
      data: { rendered },
    };
  },
};
