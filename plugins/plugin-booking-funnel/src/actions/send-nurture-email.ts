/**
 * SEND_NURTURE_EMAIL action — sends the next email in the
 * 5-email nurture sequence to a lead.
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
import { FUNNEL_LOG_PREFIX, NURTURE_SEQUENCE } from "../types.js";

export const sendNurtureEmailAction: Action = {
  name: "SEND_NURTURE_EMAIL",
  description: "Send the next nurture email in the 5-email sequence to a lead",
  similes: [
    "SEND_EMAIL",
    "NURTURE_EMAIL",
    "EMAIL_SEQUENCE",
    "FOLLOW_UP",
    "EMAIL_LEAD",
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
      `${FUNNEL_LOG_PREFIX} SEND_NURTURE_EMAIL handler called`,
    );

    const text = message.content.text ?? "";

    // Extract lead ID or email from message.
    const idMatch = text.match(/lead[:\s]+(\S+)/i);
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    const leadId = idMatch?.[1] ?? emailMatch?.[0] ?? "lead@example.com";

    const service = runtime.getService<FunnelService>(
      FunnelService.serviceType,
    );

    if (!service) {
      const errorMsg = "FunnelService not registered";
      logger.error(`${FUNNEL_LOG_PREFIX} ${errorMsg}`);
      return { success: false, text: errorMsg };
    }

    // If email was provided, look up the lead.
    const lead = service.getLead(leadId) ?? service.getLeadByEmail(leadId);
    if (!lead) {
      const errorMsg = `Lead not found: ${leadId}`;
      logger.error(`${FUNNEL_LOG_PREFIX} ${errorMsg}`);
      return { success: false, text: errorMsg };
    }

    const email = await service.sendNurtureEmail(lead.id);

    if (!email) {
      const responseText = `Lead ${lead.name} has completed the nurture sequence (${NURTURE_SEQUENCE.length}/${NURTURE_SEQUENCE.length} emails sent). Use BOOK_CONSULTATION to close the deal.`;
      await callback?.({ text: responseText });
      return { success: true, text: responseText, data: { completed: true } };
    }

    const responseText = [
      `Nurture email #${email.step + 1}/${NURTURE_SEQUENCE.length} sent!`,
      "",
      `To: ${lead.name} <${lead.email}>`,
      `Subject: ${email.subject}`,
      `Status: ${email.status}`,
      `Sent at: ${email.sentAt}`,
      "",
      `Progress: ${lead.nurtureStep}/${NURTURE_SEQUENCE.length} emails sent`,
      lead.nurtureStep < NURTURE_SEQUENCE.length
        ? `Next email will be: "${NURTURE_SEQUENCE[lead.nurtureStep]}"`
        : "Sequence complete! Use BOOK_CONSULTATION to close.",
    ].join("\n");

    await callback?.({ text: responseText });

    return {
      success: true,
      text: responseText,
      data: { email, lead },
    };
  },
};
