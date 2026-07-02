/**
 * @elizaos/plugin-content-calendar
 *
 * Weekly content calendar with platform playbooks and optimal posting times.
 *
 * Provides:
 *   Actions:
 *     CREATE_CALENDAR     — create a new weekly content calendar
 *     SCHEDULE_WEEK       — auto-schedule a full week of content
 *     GET_OPTIMAL_TIMES   — get optimal posting times per platform
 *
 *   Providers:
 *     CALENDAR_OVERVIEW   — injects current week's calendar and status
 *
 *   Services:
 *     CalendarService     — calendar creation, scheduling, playbooks
 *
 *   Evaluators:
 *     SCHEDULE_QUALITY    — scores calendar for 60/30/10 compliance
 */

import {
  type IAgentRuntime,
  logger,
  type Plugin,
  type RegisteredEvaluator,
} from "@elizaos/core";
import { createCalendarAction } from "./actions/create-calendar.ts";
import { getOptimalTimesAction } from "./actions/get-optimal-times.ts";
import { scheduleWeekAction } from "./actions/schedule-week.ts";
import { scheduleQualityEvaluator } from "./evaluators/schedule-quality-evaluator.ts";
import { calendarOverviewProvider } from "./providers/calendar-overview-provider.ts";
import { CalendarService } from "./services/calendar-service.ts";
import { CALENDAR_LOG_PREFIX } from "./types.ts";

export { createCalendarAction } from "./actions/create-calendar.ts";
export { getOptimalTimesAction } from "./actions/get-optimal-times.ts";
export { scheduleWeekAction } from "./actions/schedule-week.ts";
export { scheduleQualityEvaluator } from "./evaluators/schedule-quality-evaluator.ts";
export { calendarOverviewProvider } from "./providers/calendar-overview-provider.ts";
export { CalendarService } from "./services/calendar-service.ts";
// Re-export all public types and utilities.
export * from "./types.ts";
export * from "./utils/config.ts";

export const contentCalendarPlugin: Plugin = {
  name: "content-calendar",
  description:
    "Weekly content calendar with platform playbooks and optimal posting times",

  actions: [createCalendarAction, scheduleWeekAction, getOptimalTimesAction],

  providers: [calendarOverviewProvider],

  services: [CalendarService],

  evaluators: [scheduleQualityEvaluator as unknown as RegisteredEvaluator],

  async init(
    _config: Record<string, string>,
    runtime: IAgentRuntime,
  ): Promise<void> {
    logger.info(
      { agentId: runtime.agentId },
      `${CALENDAR_LOG_PREFIX} plugin initialised`,
    );
  },

  tests: [
    {
      name: "content-calendar-smoke",
      tests: [
        {
          name: "Types are importable",
          fn: async (_runtime: IAgentRuntime) => {
            const { WEEKLY_CONTENT_CALENDAR, PLATFORM_PLAYBOOKS } =
              await import("./types.ts");
            if (!WEEKLY_CONTENT_CALENDAR.monday) {
              throw new Error("WEEKLY_CONTENT_CALENDAR missing monday");
            }
            if (PLATFORM_PLAYBOOKS.length < 4) {
              throw new Error("PLATFORM_PLAYBOOKS too short");
            }
            logger.success("Types smoke test passed");
          },
        },
        {
          name: "CalendarService create and schedule",
          fn: async (runtime: IAgentRuntime) => {
            const service = runtime.getService<CalendarService>(
              CalendarService.serviceType,
            );
            if (!service) {
              logger.warn("CalendarService not registered — skipping");
              return;
            }
            const cal = service.createWeeklyCalendar("2026-06-23");
            if (cal.entries.length !== 7) {
              throw new Error(`Expected 7 entries, got ${cal.entries.length}`);
            }
            const mix = service.getWeeklyMix(cal);
            const total = mix.inspirational + mix.educational + mix.promotional;
            if (total !== 7) {
              throw new Error(`Mix total expected 7, got ${total}`);
            }
            const slots = service.getOptimalSlots("instagram");
            if (slots.length === 0) {
              throw new Error("getOptimalSlots returned empty");
            }
            logger.success("CalendarService create/schedule test passed");
          },
        },
      ],
    },
  ],
};

export default contentCalendarPlugin;
