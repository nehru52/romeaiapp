/**
 * GET_OPTIMAL_TIMES action — retrieves optimal posting times
 * for each social media platform.
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
import { CalendarService } from "../services/calendar-service.ts";
import { CALENDAR_LOG_PREFIX } from "../types.js";

export const getOptimalTimesAction: Action = {
  name: "GET_OPTIMAL_TIMES",
  description:
    "Get optimal posting times for each social media platform based on Rome travel audience data",
  similes: [
    "BEST_TIME_TO_POST",
    "OPTIMAL_POSTING_TIME",
    "WHEN_TO_POST",
    "POSTING_SCHEDULE",
    "BEST_POSTING_TIME",
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
      `${CALENDAR_LOG_PREFIX} GET_OPTIMAL_TIMES handler called`,
    );

    const text = message.content.text ?? "";
    const lowerText = text.toLowerCase();

    // Extract platform from message.
    const platform =
      [
        "instagram",
        "tiktok",
        "pinterest",
        "youtube",
        "facebook",
        "linkedin",
      ].find((p) => lowerText.includes(p)) ?? "instagram";

    const service = runtime.getService<CalendarService>(
      CalendarService.serviceType,
    );

    if (!service) {
      const errorMsg = "CalendarService not registered";
      logger.error(`${CALENDAR_LOG_PREFIX} ${errorMsg}`);
      return { success: false, text: errorMsg };
    }

    const slots = service.getOptimalSlots(
      platform as
        | "instagram"
        | "tiktok"
        | "pinterest"
        | "youtube"
        | "facebook"
        | "linkedin",
    );
    const playbooks = service.getPlaybooks();
    const playbook = playbooks.find((p) => p.platform === platform);

    const responseText = [
      `Optimal Posting Times — ${platform.toUpperCase()}`,
      "═══════════════════════════════════════",
      "",
      playbook ? `Frequency: ${playbook.frequency}` : "",
      "",
      "Best time slots:",
      ...slots.map(
        (s, i) =>
          `  ${i + 1}. ${s.dayOfWeek.charAt(0).toUpperCase() + s.dayOfWeek.slice(1)} ${s.timeSlot} — ${s.format} (${s.category})\n     Reason: ${s.reason}`,
      ),
      "",
      playbook ? "Pro tips:" : "",
      ...(playbook?.tips.map((t: string) => `  ✦ ${t}`) ?? []),
    ]
      .filter(Boolean)
      .join("\n");

    await callback?.({ text: responseText });

    return {
      success: true,
      text: responseText,
      data: { slots, playbook },
    };
  },
};
