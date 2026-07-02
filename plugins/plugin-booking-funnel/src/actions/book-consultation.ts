/**
 * BOOK_CONSULTATION action — books a consultation call with a lead
 * via Calendly integration.
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
import { FunnelService } from "../services/funnel-service.ts";
import { FUNNEL_LOG_PREFIX } from "../types.js";

export const bookConsultationAction: Action = {
  name: "BOOK_CONSULTATION",
  description:
    "Book a free 30-minute Rome travel consultation call with a lead via Calendly",
  similes: [
    "BOOK_CALL",
    "SCHEDULE_CONSULTATION",
    "BOOK_MEETING",
    "CONSULTATION",
    "FREE_CALL",
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
      `${FUNNEL_LOG_PREFIX} BOOK_CONSULTATION handler called`,
    );

    const text = message.content.text ?? "";

    // Extract lead ID or email from message.
    const idMatch = text.match(/lead[:\s]+(\S+)/i);
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    const leadId = idMatch?.[1] ?? emailMatch?.[0] ?? "lead@example.com";

    // Extract scheduled time (default to tomorrow 10am).
    const timeMatch = text.match(/(?:at|on|for)\s+(.+?)(?:\s+|$)/i);
    const scheduledTime = timeMatch?.[1]
      ? new Date(timeMatch[1]).toISOString()
      : new Date(Date.now() + 86400000).toISOString();

    const service = runtime.getService<FunnelService>(
      FunnelService.serviceType,
    );

    if (!service) {
      const errorMsg = "FunnelService not registered";
      logger.error(`${FUNNEL_LOG_PREFIX} ${errorMsg}`);
      return { success: false, text: errorMsg };
    }

    // Look up the lead.
    const lead = service.getLead(leadId) ?? service.getLeadByEmail(leadId);
    if (!lead) {
      const errorMsg = `Lead not found: ${leadId}. Capture the lead first with CAPTURE_LEAD.`;
      logger.error(`${FUNNEL_LOG_PREFIX} ${errorMsg}`);
      return { success: false, text: errorMsg };
    }

    const consultation = await service.bookConsultation(lead.id, scheduledTime);

    const responseText = [
      "Consultation booked!",
      "",
      `Lead: ${lead.name} <${lead.email}>`,
      `Status: ${consultation.status}`,
      `Scheduled: ${consultation.scheduledAt}`,
      `Calendly: ${consultation.calendlyEventUrl}`,
      "",
      `Funnel progress: ${lead.stage} → conversion`,
      "Send a confirmation email with the Calendly link.",
    ].join("\n");

    await callback?.({ text: responseText });

    return {
      success: true,
      text: responseText,
      data: { consultation, lead },
    };
  },
};
