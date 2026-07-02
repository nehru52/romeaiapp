/**
 * Configuration helpers for @elizaos/plugin-content-calendar.
 *
 * Reads scheduling settings from environment variables.
 */

/** Get the timezone for scheduling. */
export function getTimezone(): string {
  return process.env.TIMEZONE ?? "Europe/Rome";
}

/** Get the target number of posts per week. */
export function getPostsPerWeek(): number {
  const raw = process.env.POSTS_PER_WEEK;
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : 10;
}
