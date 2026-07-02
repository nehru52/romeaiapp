/**
 * @elizaos/plugin-booking-funnel
 *
 * Booking conversion funnel — lead capture, email nurture, consultation booking.
 *
 * Provides:
 *   Actions:
 *     CAPTURE_LEAD        — capture a new lead from social media
 *     SEND_NURTURE_EMAIL  — send the next email in the 5-email sequence
 *     BOOK_CONSULTATION   — book a consultation call via Calendly
 *
 *   Providers:
 *     FUNNEL_STATUS       — injects funnel metrics and pipeline status
 *
 *   Services:
 *     FunnelService       — lead management, nurture sequence, booking
 *
 *   Evaluators:
 *     LEAD_QUALITY        — scores lead quality and funnel progression
 */

import {
  type IAgentRuntime,
  logger,
  type Plugin,
  type RegisteredEvaluator,
} from "@elizaos/core";
import { bookConsultationAction } from "./actions/book-consultation.ts";
import { captureLeadAction } from "./actions/capture-lead.ts";
import { sendNurtureEmailAction } from "./actions/send-nurture-email.ts";
import { leadQualityEvaluator } from "./evaluators/lead-quality-evaluator.ts";
import { funnelStatusProvider } from "./providers/funnel-status-provider.ts";
import { FunnelService } from "./services/funnel-service.ts";
import { FUNNEL_LOG_PREFIX } from "./types.ts";

export { bookConsultationAction } from "./actions/book-consultation.ts";
export { captureLeadAction } from "./actions/capture-lead.ts";
export { sendNurtureEmailAction } from "./actions/send-nurture-email.ts";
export { leadQualityEvaluator } from "./evaluators/lead-quality-evaluator.ts";
export { funnelStatusProvider } from "./providers/funnel-status-provider.ts";
export { FunnelService } from "./services/funnel-service.ts";
// Re-export all public types and utilities.
export * from "./types.ts";
export * from "./utils/config.ts";

export const bookingFunnelPlugin: Plugin = {
  name: "booking-funnel",
  description:
    "Booking conversion funnel — lead capture, email nurture, consultation booking",

  actions: [captureLeadAction, sendNurtureEmailAction, bookConsultationAction],

  providers: [funnelStatusProvider],

  services: [FunnelService],

  evaluators: [leadQualityEvaluator as unknown as RegisteredEvaluator],

  async init(
    _config: Record<string, string>,
    runtime: IAgentRuntime,
  ): Promise<void> {
    logger.info(
      { agentId: runtime.agentId },
      `${FUNNEL_LOG_PREFIX} plugin initialised`,
    );
  },

  tests: [
    {
      name: "booking-funnel-smoke",
      tests: [
        {
          name: "Types are importable",
          fn: async (_runtime: IAgentRuntime) => {
            const { NURTURE_SEQUENCE } = await import("./types.ts");
            if (NURTURE_SEQUENCE.length !== 5) {
              throw new Error(
                `Expected 5 nurture emails, got ${NURTURE_SEQUENCE.length}`,
              );
            }
            logger.success("Types smoke test passed");
          },
        },
        {
          name: "FunnelService capture and nurture",
          fn: async (runtime: IAgentRuntime) => {
            const service = runtime.getService<FunnelService>(
              FunnelService.serviceType,
            );
            if (!service) {
              logger.warn("FunnelService not registered — skipping");
              return;
            }
            const lead = service.captureLead(
              "test@example.com",
              "Test User",
              "instagram",
            );
            if (lead.email !== "test@example.com") {
              throw new Error("Lead capture failed");
            }
            const email = await service.sendNurtureEmail(lead.id);
            if (!email) {
              throw new Error("sendNurtureEmail returned null");
            }
            if (email.step !== 0) {
              throw new Error(`Expected step 0, got ${email.step}`);
            }
            const metrics = service.getFunnelMetrics();
            if (metrics.totalLeads !== 1) {
              throw new Error(`Expected 1 lead, got ${metrics.totalLeads}`);
            }
            logger.success("FunnelService capture/nurture test passed");
          },
        },
        {
          name: "FunnelService consultation booking",
          fn: async (runtime: IAgentRuntime) => {
            const service = runtime.getService<FunnelService>(
              FunnelService.serviceType,
            );
            if (!service) {
              logger.warn("FunnelService not registered — skipping");
              return;
            }
            const lead = service.captureLead(
              "book@example.com",
              "Book User",
              "tiktok",
            );
            const consultation = await service.bookConsultation(
              lead.id,
              new Date().toISOString(),
            );
            if (consultation.status !== "scheduled") {
              throw new Error("Consultation not scheduled");
            }
            const updatedLead = service.getLead(lead.id);
            if (updatedLead?.status !== "booked") {
              throw new Error("Lead status not updated to booked");
            }
            logger.success("FunnelService consultation booking test passed");
          },
        },
      ],
    },
  ],
};

export default bookingFunnelPlugin;
