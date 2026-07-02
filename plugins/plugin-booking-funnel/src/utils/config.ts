/**
 * Configuration helpers for @elizaos/plugin-booking-funnel.
 *
 * Reads SMTP, Calendly, and lead magnet settings from environment variables.
 */

/** Get the SMTP server hostname. */
export function getSmtpHost(): string {
  return process.env.SMTP_HOST ?? "smtp.gmail.com";
}

/** Get the SMTP server port. */
export function getSmtpPort(): number {
  const raw = process.env.SMTP_PORT;
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : 587;
}

/** Get the SMTP username. */
export function getSmtpUser(): string | undefined {
  return process.env.SMTP_USER || undefined;
}

/** Get the SMTP password. */
export function getSmtpPass(): string | undefined {
  return process.env.SMTP_PASS || undefined;
}

/** Get the Calendly API key. */
export function getCalendlyApiKey(): string | undefined {
  return process.env.CALENDLY_API_KEY || undefined;
}

/** Get the Calendly event type ID. */
export function getCalendlyEventTypeId(): string | undefined {
  return process.env.CALENDLY_EVENT_TYPE_ID || undefined;
}

/** Get the lead magnet landing page URL. */
export function getLeadMagnetUrl(): string {
  return process.env.LEAD_MAGNET_URL ?? "https://romeagency.it/lead-magnet";
}
