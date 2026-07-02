/**
 * AuthService — Google OAuth + session management.
 */

export interface AuthSession {
  userId: string;
  email: string;
  name: string;
  avatar: string;
  provider: "google";
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  createdAt: string;
}

export interface OnboardingState {
  userId: string;
  step: "niche" | "website" | "done";
  selectedNiche: string | null;
  packSlug: string | null;
  websiteUrl: string | null;
  websiteAnalysis: WebsiteAnalysis | null;
}

export interface WebsiteAnalysis {
  url: string;
  title: string;
  description: string;
  industry: string;
  keywords: string[];
  products: string[];
  socialLinks: Record<string, string>;
  suggestedPack: string;
  confidence: number;
}

export class AuthService {
  private sessions: Map<string, AuthSession> = new Map();
  private onboardingStates: Map<string, OnboardingState> = new Map();
  // Map of userId → tenants created for them
  private userTenants: Map<string, string[]> = new Map();

  /** Create a session from Google OAuth callback. */
  async handleGoogleCallback(params: {
    code: string;
    redirectUri: string;
  }): Promise<AuthSession> {
    // In production: exchange code for tokens via Google OAuth API
    // For now: create a mock session
    const session: AuthSession = {
      userId: `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      email: params.code.includes("@")
        ? params.code
        : `user_${Date.now()}@gmail.com`,
      name: "Travel Agent",
      avatar: "https://ui-avatars.com/api/?name=TA&background=random",
      provider: "google",
      accessToken: `tok_${Date.now()}`,
      refreshToken: `ref_${Date.now()}`,
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
      createdAt: new Date().toISOString(),
    };
    this.sessions.set(session.userId, session);

    // Initialize onboarding for new users
    this.onboardingStates.set(session.userId, {
      userId: session.userId,
      step: "niche",
      selectedNiche: null,
      packSlug: null,
      websiteUrl: null,
      websiteAnalysis: null,
    });

    return session;
  }

  /** Get session by user ID. */
  getSession(userId: string): AuthSession | undefined {
    return this.sessions.get(userId);
  }

  /** Get session by access token. */
  getSessionByToken(token: string): AuthSession | undefined {
    for (const s of this.sessions.values()) {
      if (s.accessToken === token) return s;
    }
    return undefined;
  }

  /** Get onboarding state. */
  getOnboardingState(userId: string): OnboardingState | undefined {
    return this.onboardingStates.get(userId);
  }

  /** Set the user's niche during onboarding. */
  setNiche(
    userId: string,
    niche: string,
    packSlug: string,
  ): OnboardingState | null {
    const state = this.onboardingStates.get(userId);
    if (!state) return null;
    state.selectedNiche = niche;
    state.packSlug = packSlug;
    state.step = "website";
    return { ...state };
  }

  /** Set the user's website URL and analysis. */
  async setWebsite(
    userId: string,
    url: string,
  ): Promise<OnboardingState | null> {
    const state = this.onboardingStates.get(userId);
    if (!state) return null;
    state.websiteUrl = url;
    state.websiteAnalysis = await this.analyzeWebsite(url);
    state.step = "done";
    return { ...state };
  }

  /** Check if onboarding is complete. */
  isOnboardingComplete(userId: string): boolean {
    const state = this.onboardingStates.get(userId);
    return state?.step === "done";
  }

  /** Link a tenant to a user. */
  linkTenant(userId: string, tenantId: string): void {
    const tenants = this.userTenants.get(userId) ?? [];
    tenants.push(tenantId);
    this.userTenants.set(userId, tenants);
  }

  /** Get all tenants for a user. */
  getUserTenants(userId: string): string[] {
    return this.userTenants.get(userId) ?? [];
  }

  // ── Private ──────────────────────────────────────────────────────

  private async analyzeWebsite(url: string): Promise<WebsiteAnalysis> {
    // In production: fetch + parse the website HTML
    // Extract title, meta description, OG tags, structured data
    // Use Apify or Firecrawl for deeper analysis
    const normalized = url.replace(/https?:\/\//, "").replace(/\/$/, "");

    // Mock analysis — in production this would actually scrape
    const domain = normalized.split(".")[0] ?? "business";
    return {
      url: `https://${normalized}`,
      title: `${domain.charAt(0).toUpperCase() + domain.slice(1)} — Official Site`,
      description: "Travel experiences, tours, and packages in Italy",
      industry: "travel",
      keywords: ["tours", "travel", "italy", "rome", "vacation"],
      products: ["Tours", "Packages", "Transfers"],
      socialLinks: {
        instagram: `https://instagram.com/${domain.replace(/\s+/g, "")}`,
        facebook: `https://facebook.com/${domain.replace(/\s+/g, "")}`,
      },
      suggestedPack: "travel-agency",
      confidence: 0.87,
    };
  }
}
