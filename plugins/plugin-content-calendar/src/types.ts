/**
 * Core type definitions for @elizaos/plugin-content-calendar.
 *
 * Covers weekly content scheduling, platform playbooks,
 * and optimal posting times for Rome travel agencies.
 */

/** Supported social media platforms. */
export type Platform =
  | "instagram"
  | "tiktok"
  | "pinterest"
  | "youtube"
  | "facebook"
  | "linkedin";

/** Content format variants across platforms. */
export type ContentFormat =
  | "reel"
  | "carousel"
  | "story"
  | "feed_post"
  | "short"
  | "long_form"
  | "pin";

/** Content category following the 60/30/10 content mix rule. */
export type ContentCategory = "inspirational" | "educational" | "promotional";

/** Days of the week for scheduling. */
export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

/** A single entry in the content calendar. */
export interface CalendarEntry {
  /** Unique identifier. */
  id: string;
  /** Target platform. */
  platform: Platform;
  /** Content format. */
  format: ContentFormat;
  /** Content category (60/30/10 mix). */
  category: ContentCategory;
  /** Title or headline for the post. */
  title: string;
  /** Description or brief. */
  description: string;
  /** Recommended hashtags. */
  hashtags: string[];
  /** ISO 8601 scheduled publish time. */
  scheduledTime: string;
  /** Current status. */
  status: "draft" | "scheduled" | "published";
  /** AI model assigned for asset generation, if any. */
  assignedModel?: string | undefined;
}

/** A weekly content calendar. */
export interface WeeklyCalendar {
  /** Unique identifier. */
  id: string;
  /** ISO 8601 date of the Monday starting this week. */
  weekStart: string;
  /** Entries scheduled for this week. */
  entries: CalendarEntry[];
  /** Optional weekly theme. */
  theme?: string | undefined;
  /** Current status. */
  status: "draft" | "active" | "completed";
}

/** Platform-specific playbook. */
export interface PlatformPlaybook {
  /** Target platform. */
  platform: Platform;
  /** Best posting times for this platform. */
  bestTimes: string[];
  /** Best content formats for this platform. */
  bestFormats: ContentFormat[];
  /** Recommended posting frequency. */
  frequency: string;
  /** Platform-specific tips. */
  tips: string[];
}

/** An optimal posting time slot. */
export interface OptimalSlot {
  /** Target platform. */
  platform: Platform;
  /** Day of the week. */
  dayOfWeek: DayOfWeek;
  /** Time slot (e.g. "11am-1pm"). */
  timeSlot: string;
  /** Best format for this slot. */
  format: ContentFormat;
  /** Best category for this slot. */
  category: ContentCategory;
  /** Reason this slot is optimal. */
  reason: string;
}

/** Service type constant for the content calendar service registry. */
export const CALENDAR_SERVICE_TYPE = "CONTENT_CALENDAR" as const;

/** Log prefix used across all modules in this plugin. */
export const CALENDAR_LOG_PREFIX = "[plugin-content-calendar]" as const;

/**
 * Default weekly content calendar template.
 * Applies the 60/30/10 mix across 7 days.
 */
export const WEEKLY_CONTENT_CALENDAR: Record<
  DayOfWeek,
  { format: ContentFormat; category: ContentCategory; title: string }
> = {
  monday: {
    format: "carousel",
    category: "inspirational",
    title: "Monday Inspiration — Rome Aesthetic",
  },
  tuesday: {
    format: "reel",
    category: "educational",
    title: "Tuesday Tips — Rome Travel Hack",
  },
  wednesday: {
    format: "story",
    category: "inspirational",
    title: "Wednesday Wanderlust — Hidden Rome",
  },
  thursday: {
    format: "reel",
    category: "educational",
    title: "Thursday Throwback — Roman History",
  },
  friday: {
    format: "carousel",
    category: "promotional",
    title: "Friday Feature — Package Spotlight",
  },
  saturday: {
    format: "story",
    category: "inspirational",
    title: "Saturday Vibes — Weekend in Rome",
  },
  sunday: {
    format: "feed_post",
    category: "educational",
    title: "Sunday Planning — Week Ahead Tips",
  },
} as const;

/**
 * Platform-specific playbooks with best practices.
 */
export const PLATFORM_PLAYBOOKS: PlatformPlaybook[] = [
  {
    platform: "instagram",
    bestTimes: ["Tue 11am", "Thu 1pm", "Wed 7pm", "Fri 11am"],
    bestFormats: ["reel", "carousel", "story"],
    frequency: "5-7 posts/week",
    tips: [
      "Reels get 2x more reach than static posts",
      "Use 3-tier hashtag strategy (3 high, 5 mid, 5 niche)",
      "Carousel posts have highest save rate",
    ],
  },
  {
    platform: "tiktok",
    bestTimes: ["Tue 2pm", "Thu 5pm", "Fri 7pm", "Sat 11am"],
    bestFormats: ["short", "reel"],
    frequency: "3-5 posts/week",
    tips: [
      "First 3 seconds determine retention",
      "Use trending sounds for 2x reach",
      "Reply to comments with video for algorithm boost",
    ],
  },
  {
    platform: "pinterest",
    bestTimes: ["Sat 8pm", "Sun 7pm", "Fri 9pm"],
    bestFormats: ["pin"],
    frequency: "5-10 pins/week",
    tips: [
      "Vertical 2:3 ratio performs best",
      "Rich pins drive 2x more clicks",
      "SEO descriptions are critical for discoverability",
    ],
  },
  {
    platform: "youtube",
    bestTimes: ["Thu 2pm", "Fri 4pm", "Sat 10am"],
    bestFormats: ["long_form", "short"],
    frequency: "1-2 videos/week",
    tips: [
      "Thumbnail is 80% of click-through",
      "First 30 seconds must deliver on title promise",
      "End screens drive subscription rate",
    ],
  },
  {
    platform: "facebook",
    bestTimes: ["Tue 9am", "Thu 1pm", "Fri 11am"],
    bestFormats: ["feed_post", "reel"],
    frequency: "3-5 posts/week",
    tips: [
      "Native video outperforms shared links",
      "Ask questions to drive comments",
      "Local group sharing amplifies reach",
    ],
  },
  {
    platform: "linkedin",
    bestTimes: ["Tue 7am", "Thu 12pm", "Wed 8am"],
    bestFormats: ["feed_post", "carousel"],
    frequency: "2-3 posts/week",
    tips: [
      "Travel industry insights perform well",
      "Case studies drive engagement",
      "Tag relevant tourism boards and partners",
    ],
  },
] as const;
