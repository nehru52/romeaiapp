/**
 * FunnelService — manages the booking conversion funnel.
 *
 * Handles lead capture, the 5-email nurture sequence, and
 * consultation booking via Calendly integration.
 */

import { type IAgentRuntime, Service } from "@elizaos/core";
import {
  type Consultation,
  FUNNEL_SERVICE_TYPE,
  type FunnelMetrics,
  type FunnelStage,
  type Lead,
  NURTURE_SEQUENCE,
  type NurtureEmail,
} from "../types.js";

export class FunnelService extends Service {
  static override readonly serviceType = FUNNEL_SERVICE_TYPE;
  override capabilityDescription =
    "Manages the booking conversion funnel: lead capture, email nurture sequence, and consultation booking";

  private leads: Lead[] = [];
  private emails: NurtureEmail[] = [];
  private consultations: Consultation[] = [];

  static override async start(_runtime: IAgentRuntime): Promise<FunnelService> {
    return new FunnelService();
  }

  override async stop(): Promise<void> {
    // no-op
  }

  /**
   * Capture a new lead into the funnel.
   * If the email already exists, updates last contact time.
   */
  captureLead(
    email: string,
    name: string,
    source: string,
    metadata?: Record<string, string>,
  ): Lead {
    const existing = this.leads.find((l) => l.email === email);
    if (existing) {
      return {
        ...existing,
        lastContactAt: new Date().toISOString(),
      };
    }

    const lead: Lead = {
      id: `lead_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      email,
      name,
      source: source as Lead["source"],
      status: "new",
      stage: "capture",
      capturedAt: new Date().toISOString(),
      lastContactAt: new Date().toISOString(),
      nurtureStep: 0,
      metadata: metadata ?? {},
    };

    this.leads.push(lead);
    return { ...lead };
  }

  /** Get a lead by ID. */
  getLead(id: string): Lead | undefined {
    return this.leads.find((l) => l.id === id);
  }

  /** Get a lead by email. */
  getLeadByEmail(email: string): Lead | undefined {
    return this.leads.find((l) => l.email === email);
  }

  /** Update a lead's funnel stage. */
  updateLeadStage(id: string, stage: FunnelStage): Lead | undefined {
    const lead = this.leads.find((l) => l.id === id);
    if (!lead) return undefined;

    lead.stage = stage;
    lead.lastContactAt = new Date().toISOString();

    if (stage === "nurture") lead.status = "nurturing";
    if (stage === "conversion") lead.status = "qualified";

    return { ...lead };
  }

  /**
   * Send the next nurture email in the 5-email sequence.
   * Returns null if the lead has completed the sequence.
   */
  async sendNurtureEmail(leadId: string): Promise<NurtureEmail | null> {
    const lead = this.leads.find((l) => l.id === leadId);
    if (!lead) return null;

    const step = lead.nurtureStep;
    if (step >= NURTURE_SEQUENCE.length) return null;

    const email: NurtureEmail = {
      id: `email_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      leadId,
      step,
      subject: NURTURE_SEQUENCE[step]!,
      body: this.generateEmailBody(step, lead.name),
      sentAt: new Date().toISOString(),
      status: "sent",
    };

    this.emails.push(email);
    lead.nurtureStep = step + 1;
    lead.lastContactAt = email.sentAt;

    return { ...email };
  }

  /**
   * Book a consultation call with a lead.
   * In production, this would call the Calendly API.
   */
  async bookConsultation(
    leadId: string,
    scheduledAt: string,
  ): Promise<Consultation> {
    const lead = this.leads.find((l) => l.id === leadId);
    if (!lead) throw new Error(`Lead ${leadId} not found`);

    const consultation: Consultation = {
      id: `cons_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      leadId,
      calendlyEventUrl: `https://calendly.com/rome-travel-consultation/${Date.now()}`,
      scheduledAt,
      status: "scheduled",
      notes: "",
    };

    this.consultations.push(consultation);
    lead.stage = "conversion";
    lead.status = "booked";
    lead.lastContactAt = new Date().toISOString();

    return { ...consultation };
  }

  /** Get aggregated funnel metrics. */
  getFunnelMetrics(): FunnelMetrics {
    const leadsByStage: Record<FunnelStage, number> = {
      awareness: 0,
      interest: 0,
      capture: 0,
      nurture: 0,
      conversion: 0,
    };

    for (const lead of this.leads) {
      leadsByStage[lead.stage]++;
    }

    const booked = this.leads.filter((l) => l.status === "booked").length;

    return {
      totalLeads: this.leads.length,
      leadsByStage,
      conversionRate: this.leads.length > 0 ? booked / this.leads.length : 0,
      avgTimeToBooking: 0,
      consultationsBooked: this.consultations.length,
      consultationsCompleted: this.consultations.filter(
        (c) => c.status === "completed",
      ).length,
    };
  }

  // ── Private helpers ──────────────────────────────────────────────

  private generateEmailBody(step: number, name: string): string {
    const bodies = [
      `Ciao ${name}!\n\nYour 7-Day Rome Itinerary is ready. Download it here and start planning your dream trip.\n\nInside you will find:\n- Day-by-day itinerary with insider tips\n- Budget breakdown (€800-1200 total)\n- Restaurant recommendations from locals\n- Skip-the-line secrets\n\nDownload now and let me know if you have any questions!\n\n— Aura`,

      `Hi ${name},\n\nI wanted to share the #1 mistake I see Rome visitors make...\n\nThey try to do everything in 3 days and end up exhausted.\n\nHere is what I recommend instead: slow down. Pick 2-3 experiences per day. Leave room for spontaneous discoveries — that is where the magic happens.\n\nWant me to build you a personalized itinerary? Just reply to this email.\n\n— Aura`,

      `Hey ${name},\n\nWant to experience Rome like a local? Here are my top 3 tips:\n\n1. Eat where Italians eat — away from the main squares\n2. Visit churches early morning (free, quiet, stunning)\n3. Take the bus, not the metro — you will see the city\n\nThese small changes make a huge difference.\n\nCurious about what else I recommend? Let us chat.\n\n— Aura`,

      `Hi ${name},\n\nBased on what I know about your travel style, I have put together a few personalized recommendations for your Rome trip.\n\nI would love to walk you through them in a free 30-minute consultation.\n\nBook a time that works for you here: [Calendly Link]\n\nLooking forward to helping you plan an unforgettable trip!\n\n— Aura`,

      `Last chance, ${name}!\n\nI have 2 spots left this month for free Rome travel consultations.\n\nIf you are serious about planning your trip, let us talk.\n\nBook your free call here: [Calendly Link]\n\nAfter this, I will be fully booked for the next 6 weeks.\n\n— Aura`,
    ];

    return bodies[Math.min(step, bodies.length - 1)]!;
  }
}
