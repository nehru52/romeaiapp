/**
 * Core type definitions for @elizaos/plugin-booking-funnel.
 *
 * Covers the booking conversion funnel: lead capture, email nurture,
 * and consultation booking for Rome travel agencies.
 */

/** Source where the lead was captured. */
export type LeadSource =
  | "instagram"
  | "tiktok"
  | "pinterest"
  | "youtube"
  | "facebook"
  | "organic"
  | "referral";

/** Current status of a lead in the funnel. */
export type LeadStatus =
  | "new"
  | "contacted"
  | "nurturing"
  | "qualified"
  | "booked"
  | "lost";

/** Funnel stage a lead is currently in. */
export type FunnelStage =
  | "awareness"
  | "interest"
  | "capture"
  | "nurture"
  | "conversion";

/** A captured lead. */
export interface Lead {
  /** Unique identifier. */
  id: string;
  /** Lead email address. */
  email: string;
  /** Lead name. */
  name: string;
  /** Source where the lead was captured. */
  source: LeadSource;
  /** Current status. */
  status: LeadStatus;
  /** Current funnel stage. */
  stage: FunnelStage;
  /** ISO 8601 timestamp when captured. */
  capturedAt: string;
  /** ISO 8601 timestamp of last contact. */
  lastContactAt: string;
  /** Current nurture step (0-5). */
  nurtureStep: number;
  /** Additional metadata. */
  metadata: Record<string, string>;
}

/** A nurture email in the sequence. */
export interface NurtureEmail {
  /** Unique identifier. */
  id: string;
  /** ID of the lead this email belongs to. */
  leadId: string;
  /** Step in the nurture sequence (0-4). */
  step: number;
  /** Email subject line. */
  subject: string;
  /** Email body text. */
  body: string;
  /** ISO 8601 timestamp when sent. */
  sentAt: string;
  /** ISO 8601 timestamp when opened, if applicable. */
  openedAt?: string | undefined;
  /** ISO 8601 timestamp when clicked, if applicable. */
  clickedAt?: string | undefined;
  /** Current status. */
  status: "pending" | "sent" | "opened" | "clicked" | "bounced";
}

/** A booked consultation. */
export interface Consultation {
  /** Unique identifier. */
  id: string;
  /** ID of the lead. */
  leadId: string;
  /** Calendly event URL. */
  calendlyEventUrl: string;
  /** ISO 8601 timestamp of the consultation. */
  scheduledAt: string;
  /** Current status. */
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  /** Notes about the consultation. */
  notes: string;
}

/** Aggregated funnel metrics. */
export interface FunnelMetrics {
  /** Total leads captured. */
  totalLeads: number;
  /** Leads broken down by funnel stage. */
  leadsByStage: Record<FunnelStage, number>;
  /** Conversion rate (booked / total). */
  conversionRate: number;
  /** Average days from capture to booking. */
  avgTimeToBooking: number;
  /** Total consultations booked. */
  consultationsBooked: number;
  /** Total consultations completed. */
  consultationsCompleted: number;
}

/** Service type constant for the booking funnel service registry. */
export const FUNNEL_SERVICE_TYPE = "BOOKING_FUNNEL" as const;

/** Log prefix used across all modules in this plugin. */
export const FUNNEL_LOG_PREFIX = "[plugin-booking-funnel]" as const;

/**
 * The 5-email nurture sequence subjects.
 * Each email has a specific goal in the conversion funnel.
 */
export const NURTURE_SEQUENCE = [
  "Your 7-Day Rome Itinerary is here! 🇮🇹",
  "The #1 mistake Rome visitors make (and how to avoid it)",
  "How to experience Rome like a local — not a tourist",
  "Your personalized Rome travel plan is ready",
  "Last chance: Free 30-min Rome travel consultation",
] as const;
