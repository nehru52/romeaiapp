/**
 * CalendarService — manages weekly content calendars with platform playbooks.
 *
 * Creates weekly schedules following the 60/30/10 content mix rule
 * and provides optimal posting time recommendations.
 */

import { type IAgentRuntime, Service } from "@elizaos/core";
import {
  CALENDAR_SERVICE_TYPE,
  type CalendarEntry,
  type ContentCategory,
  type ContentFormat,
  type DayOfWeek,
  type OptimalSlot,
  PLATFORM_PLAYBOOKS,
  type Platform,
  type PlatformPlaybook,
  WEEKLY_CONTENT_CALENDAR,
  type WeeklyCalendar,
} from "../types.js";

export class CalendarService extends Service {
  static override readonly serviceType = CALENDAR_SERVICE_TYPE;
  override capabilityDescription =
    "Manages weekly content calendar with platform playbooks and optimal posting times for Rome travel content";

  private calendars: WeeklyCalendar[] = [];

  static override async start(
    _runtime: IAgentRuntime,
  ): Promise<CalendarService> {
    return new CalendarService();
  }

  override async stop(): Promise<void> {
    // no-op
  }

  /**
   * Create a new weekly content calendar from the default template.
   * Applies the 60/30/10 mix across 7 days.
   */
  createWeeklyCalendar(weekStart: string, theme?: string): WeeklyCalendar {
    const entries: CalendarEntry[] = (
      Object.entries(WEEKLY_CONTENT_CALENDAR) as [
        DayOfWeek,
        { format: ContentFormat; category: ContentCategory; title: string },
      ][]
    ).map(([day, config], i) => ({
      id: `entry_${weekStart}_${day}`,
      platform: i % 2 === 0 ? "instagram" : "tiktok",
      format: config.format,
      category: config.category,
      title: config.title,
      description: `Auto-generated ${config.category} content for ${day}`,
      hashtags: ["#RomeTravel", "#VisitRome", "#ItalyTravel"],
      scheduledTime: this.computeScheduledTime(
        weekStart,
        day,
        i % 2 === 0 ? "instagram" : "tiktok",
      ),
      status: "draft",
    }));

    const calendar: WeeklyCalendar = {
      id: `cal_${weekStart}`,
      weekStart,
      entries,
      theme: theme ?? "Rome Travel Weekly",
      status: "draft",
    };

    this.calendars.push(calendar);
    return { ...calendar, entries: [...calendar.entries] };
  }

  /** Get a calendar by ID. */
  getCalendar(id: string): WeeklyCalendar | undefined {
    return this.calendars.find((c) => c.id === id);
  }

  /** Get all calendars. */
  getCalendars(): WeeklyCalendar[] {
    return [...this.calendars];
  }

  /** Update a specific entry in a calendar. */
  updateEntry(
    calendarId: string,
    entryId: string,
    updates: Partial<CalendarEntry>,
  ): CalendarEntry | undefined {
    const calendar = this.calendars.find((c) => c.id === calendarId);
    if (!calendar) return undefined;

    const entry = calendar.entries.find((e) => e.id === entryId);
    if (!entry) return undefined;

    Object.assign(entry, updates);
    return { ...entry };
  }

  /** Get optimal posting slots for a platform. */
  getOptimalSlots(platform: Platform): OptimalSlot[] {
    const playbook = PLATFORM_PLAYBOOKS.find((p) => p.platform === platform);
    if (!playbook) return [];

    const days: DayOfWeek[] = ["tuesday", "wednesday", "thursday", "friday"];

    return days.map((day, i) => ({
      platform,
      dayOfWeek: day,
      timeSlot: playbook.bestTimes[i % playbook.bestTimes.length]!,
      format: playbook.bestFormats[i % playbook.bestFormats.length]!,
      category:
        i === 0
          ? "inspirational"
          : i === 1
            ? "educational"
            : i === 2
              ? "promotional"
              : "inspirational",
      reason: `${playbook.platform} peak engagement window`,
    }));
  }

  /** Get all platform playbooks. */
  getPlaybooks(): PlatformPlaybook[] {
    return [...PLATFORM_PLAYBOOKS];
  }

  /** Get the 60/30/10 mix for a calendar. */
  getWeeklyMix(calendar: WeeklyCalendar): {
    inspirational: number;
    educational: number;
    promotional: number;
  } {
    const mix = { inspirational: 0, educational: 0, promotional: 0 };
    for (const entry of calendar.entries) {
      mix[entry.category]++;
    }
    return mix;
  }

  // ── Private helpers ──────────────────────────────────────────────

  private computeScheduledTime(
    weekStart: string,
    day: DayOfWeek,
    platform: Platform,
  ): string {
    const dayOffsets: Record<DayOfWeek, number> = {
      monday: 0,
      tuesday: 1,
      wednesday: 2,
      thursday: 3,
      friday: 4,
      saturday: 5,
      sunday: 6,
    };

    const base = new Date(weekStart);
    base.setDate(base.getDate() + dayOffsets[day]);

    const hour =
      platform === "instagram" ? 11 : platform === "tiktok" ? 14 : 10;
    base.setHours(hour, 0, 0, 0);

    return base.toISOString();
  }
}
