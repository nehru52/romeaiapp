/**
 * CREATE_CALENDAR action — creates a new weekly content calendar
 * with the 60/30/10 content mix.
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

export const createCalendarAction: Action = {
  name: "CREATE_CALENDAR",
  description:
    "Create a new weekly content calendar with the 60/30/10 content mix for Rome travel",
  similes: [
    "CREATE_CALENDAR",
    "NEW_CALENDAR",
    "WEEKLY_CALENDAR",
    "CONTENT_CALENDAR",
    "PLAN_WEEK",
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
      `${CALENDAR_LOG_PREFIX} CREATE_CALENDAR handler called`,
    );

    const text = message.content.text ?? "";

    // Extract week start date (default to next Monday).
    const dateMatch = text.match(/week[:\s]+(.+?)(?:\s+|$)/i);
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysUntilMonday = (8 - dayOfWeek) % 7 || 7;
    const nextMonday = new Date(now.getTime() + daysUntilMonday * 86400000);
    nextMonday.setHours(0, 0, 0, 0);

    const weekStart = dateMatch?.[1]
      ? new Date(dateMatch[1]!).toISOString().split("T")[0]!
      : nextMonday.toISOString().split("T")[0]!;

    // Extract optional theme.
    const themeMatch = text.match(/(?:theme|about|for)[:\s]+(.+?)(?:\s+|$)/i);
    const theme = themeMatch?.[1]?.trim();

    const service = runtime.getService<CalendarService>(
      CalendarService.serviceType,
    );

    if (!service) {
      const errorMsg = "CalendarService not registered";
      logger.error(`${CALENDAR_LOG_PREFIX} ${errorMsg}`);
      return { success: false, text: errorMsg };
    }

    const calendar = service.createWeeklyCalendar(weekStart, theme);
    const mix = service.getWeeklyMix(calendar);

    const responseText = [
      `Weekly calendar created: ${calendar.id}`,
      `Week starting: ${calendar.weekStart}`,
      `Theme: ${calendar.theme}`,
      `Entries: ${calendar.entries.length}`,
      "",
      "60/30/10 Mix:",
      `  Inspirational: ${mix.inspirational} (${Math.round((mix.inspirational / calendar.entries.length) * 100)}%)`,
      `  Educational: ${mix.educational} (${Math.round((mix.educational / calendar.entries.length) * 100)}%)`,
      `  Promotional: ${mix.promotional} (${Math.round((mix.promotional / calendar.entries.length) * 100)}%)`,
      "",
      "Use SCHEDULE_WEEK to auto-schedule with optimal times.",
    ].join("\n");

    await callback?.({ text: responseText });

    return {
      success: true,
      text: responseText,
      data: { calendar, mix },
    };
  },
};
