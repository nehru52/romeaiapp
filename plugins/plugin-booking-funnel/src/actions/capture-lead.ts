/**
 * CAPTURE_LEAD action — captures a new lead from social media
 * into the booking funnel.
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

export const captureLeadAction: Action = {
  name: "CAPTURE_LEAD",
  description: "Capture a new lead from social media into the booking funnel",
  similes: [
    "CAPTURE_LEAD",
    "NEW_LEAD",
    "SIGN_UP",
    "DOWNLOAD_LEAD_MAGNET",
    "GET_LEAD",
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
      `${FUNNEL_LOG_PREFIX} CAPTURE_LEAD handler called`,
    );

    const text = message.content.text ?? "";

    // Extract email from message (simple pattern).
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    const email = emailMatch?.[0] ?? "lead@example.com";

    // Extract name — look for "name:" or "called" patterns.
    const nameMatch = text.match(/(?:name|called|for)\s+(\w+)/i);
    const name = nameMatch?.[1] ?? "Valued Lead";

    // Extract source from message.
    const sourceMatch = text.match(/(?:from|via|source[:\s]+)(\w+)/i);
    const source = sourceMatch?.[1] ?? "organic";

    const service = runtime.getService<FunnelService>(
      FunnelService.serviceType,
    );

    if (!service) {
      const errorMsg = "FunnelService not registered";
      logger.error(`${FUNNEL_LOG_PREFIX} ${errorMsg}`);
      return { success: false, text: errorMsg };
    }

    const lead = service.captureLead(email, name, source);

    const isNew = lead.status === "new";
    const responseText = [
      `Lead ${isNew ? "captured" : "updated"}: ${lead.name} <${lead.email}>`,
      `Source: ${lead.source}`,
      `Stage: ${lead.stage}`,
      `Status: ${lead.status}`,
      `Nurture step: ${lead.nurtureStep}/5`,
      "",
      isNew
        ? "Next step: Send the first nurture email with SEND_NURTURE_EMAIL"
        : "Lead already in sequence — use SEND_NURTURE_EMAIL to continue",
    ].join("\n");

    await callback?.({ text: responseText });

    return {
      success: true,
      text: responseText,
      data: { lead, isNew },
    };
  },
};
