/**
 * SCHEDULE_WEEK action — auto-schedules a full week of content
 * across platforms with optimal posting times.
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

export const scheduleWeekAction: Action = {
  name: "SCHEDULE_WEEK",
  description:
    "Auto-schedule a full week of Rome travel content across platforms with optimal posting times",
  similes: [
    "SCHEDULE_WEEK",
    "PLAN_CONTENT",
    "SCHEDULE_POSTS",
    "WEEKLY_PLAN",
    "CONTENT_PLAN",
  ],
  validate: async (_runtime: IAgentRuntime): Promise<boolean> => true,
  handler: async (
    runtime: IAgentRuntime,
    _message: Memory,
    _state?: State,
    _options?: HandlerOptions,
    callback?: HandlerCallback,
  ): Promise<ActionResult> => {
    logger.info(
      { agentId: runtime.agentId },
      `${CALENDAR_LOG_PREFIX} SCHEDULE_WEEK handler called`,
    );

    const service = runtime.getService<CalendarService>(
      CalendarService.serviceType,
    );

    if (!service) {
      const errorMsg = "CalendarService not registered";
      logger.error(`${CALENDAR_LOG_PREFIX} ${errorMsg}`);
      return { success: false, text: errorMsg };
    }

    // Create calendar.
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysUntilMonday = (8 - dayOfWeek) % 7 || 7;
    const nextMonday = new Date(now.getTime() + daysUntilMonday * 86400000);
    nextMonday.setHours(0, 0, 0, 0);
    const weekStart = nextMonday.toISOString().split("T")[0]!;

    const calendar = service.createWeeklyCalendar(
      weekStart,
      "Rome Travel Auto-Schedule",
    );
    const optimalSlots = service.getOptimalSlots("instagram");

    // Mark all entries as scheduled.
    for (const entry of calendar.entries) {
      service.updateEntry(calendar.id, entry.id, { status: "scheduled" });
    }

    const responseText = [
      `Week scheduled: ${calendar.id}`,
      `Week starting: ${weekStart}`,
      `Total posts: ${calendar.entries.length}`,
      "",
      "Scheduled entries:",
      ...calendar.entries.map(
        (e, i) =>
          `  ${i + 1}. [${e.platform}] ${e.title}\n     Format: ${e.format} | Category: ${e.category}\n     Time: ${e.scheduledTime}`,
      ),
      "",
      `Optimal Instagram slots used: ${optimalSlots.length}`,
      "All entries marked as 'scheduled'.",
    ].join("\n");

    await callback?.({ text: responseText });

    return {
      success: true,
      text: responseText,
      data: { calendar, optimalSlots },
    };
  },
};
