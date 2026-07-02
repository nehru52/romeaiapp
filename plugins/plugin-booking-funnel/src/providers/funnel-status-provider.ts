/**
 * FUNNEL_STATUS provider — injects current funnel metrics and
 * lead pipeline status into agent context.
 */

import type {
  IAgentRuntime,
  Memory,
  Provider,
  ProviderResult,
  State,
} from "@elizaos/core";

const FUNNEL_STATUS_TEXT = `
Rome Travel — Booking Funnel Status

## Conversion Funnel Stages
1. AWARENESS — Viral social media content (reels, carousels, stories)
2. INTEREST — Profile visits, saves, follows, link clicks
3. CAPTURE — Lead magnet download (7-Day Rome Itinerary PDF)
4. NURTURE — 5-email sequence (automated)
5. CONVERSION — Free 30-min consultation call (Calendly)

## 5-Email Nurture Sequence
Email 1: "Your 7-Day Rome Itinerary is here! 🇮🇹" (Delivery + excitement)
Email 2: "The #1 mistake Rome visitors make" (Problem awareness)
Email 3: "How to experience Rome like a local" (Solution education)
Email 4: "Your personalized Rome travel plan is ready" (Personalization)
Email 5: "Last chance: Free 30-min consultation" (Urgency + CTA)

## Key Metrics to Track
- Lead capture rate: target >5% of link clicks
- Email open rate: target >40%
- Email click rate: target >8%
- Consultation booking rate: target >15% of leads
- Consultation show rate: target >70%
- Booking conversion: target >30% of consultations

## Lead Scoring Signals
+10 points: Opened 3+ emails
+15 points: Clicked Calendly link
+20 points: Booked consultation
+5 points:  Replied to email
+5 points:  Visited pricing page
-10 points: No email opens in 14 days
`.trim();

export const funnelStatusProvider: Provider = {
  name: "FUNNEL_STATUS",
  description:
    "Injects current funnel metrics and lead pipeline status into agent context",
  dynamic: true,
  contexts: ["FUNNEL_STATUS"],
  contextGate: { anyOf: ["FUNNEL_STATUS"] },
  cacheStable: false,
  cacheScope: "agent",
  async get(
    _runtime: IAgentRuntime,
    _message: Memory,
    _state: State,
  ): Promise<ProviderResult> {
    return {
      text: FUNNEL_STATUS_TEXT,
      values: {
        stages: 5,
        nurtureEmails: 5,
        targetCaptureRate: 5,
        targetOpenRate: 40,
        targetShowRate: 70,
      },
      data: {
        sequence: [
          "Delivery + excitement",
          "Problem awareness",
          "Solution education",
          "Personalization",
          "Urgency + CTA",
        ],
        scoringSignals: {
          opened3Emails: 10,
          clickedCalendly: 15,
          bookedConsultation: 20,
          repliedToEmail: 5,
          visitedPricing: 5,
          noOpens14Days: -10,
        },
      },
    };
  },
};
