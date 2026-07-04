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
  businessDescription: string | null;
  websiteUrl: string | null;
  websiteAnalysis: WebsiteAnalysis | null;
}

export interface UxuIFlaw {
  category: "performance" | "seo" | "mobile" | "accessibility" | "design" | "ux";
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  recommendation: string;
}

export interface ContentCalendarDay {
  date: string;
  dayOfWeek: string;
  platform: string;
  contentType: string;
  category: "inspirational" | "educational" | "promotional";
  topic: string;
  hook: string;
  hashtags: string[];
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
  /** UI/UX audit findings */
  uxFlaws: UxuIFlaw[];
  uxScore: number;
  /** Auto-generated 30-day content calendar */
  contentCalendar: ContentCalendarDay[];
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
      businessDescription: null,
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

  /** Ensure a user has an onboarding state (creates one if missing — serverless resilience). */
  private ensureOnboardingState(userId: string): OnboardingState {
    const existing = this.onboardingStates.get(userId);
    if (existing) return existing;
    // Create a fresh state — handles Vercel cold starts where in-memory data is lost
    const state: OnboardingState = {
      userId,
      step: "niche",
      selectedNiche: null,
      packSlug: null,
      businessDescription: null,
      websiteUrl: null,
      websiteAnalysis: null,
    };
    this.onboardingStates.set(userId, state);
    return state;
  }

  /** Set the user's niche during onboarding. */
  setNiche(
    userId: string,
    niche: string,
    packSlug: string,
    businessDescription?: string,
  ): OnboardingState {
    const state = this.ensureOnboardingState(userId);
    state.selectedNiche = niche;
    state.packSlug = packSlug;
    state.businessDescription = businessDescription ?? null;
    state.step = "website";
    return { ...state };
  }

  /** Set the user's website URL and analysis. */
  async setWebsite(
    userId: string,
    url: string,
  ): Promise<OnboardingState> {
    const state = this.ensureOnboardingState(userId);
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

  private generateContentCalendar(niche: string, packSlug: string): ContentCalendarDay[] {
    const calendar: ContentCalendarDay[] = [];
    const today = new Date();

    const nicheTopics: Record<string, { topics: string[]; hooks: string[]; hashtags: string[] }> = {
      "travel-agency": {
        topics: ["Hidden gems in {location}", "Top 5 {location} experiences", "Best time to visit {location}", "Local food guide", "Budget travel tips", "Luxury vs budget comparison", "Packing guide for {location}", "Cultural etiquette tips", "Off-season advantages", "Solo travel guide", "Family-friendly spots", "Romantic getaways", "Adventure activities", "Wellness retreats", "Photography spots", "Local secrets", "Weekend itinerary", "Day trip ideas", "Seasonal highlights", "Travel hacks", "Must-try experiences", "Before you go checklist", "Sustainable travel tips", "Digital nomad guide", "Road trip routes", "Travel mistakes to avoid", "Insider deals", "Festival calendar", "Food tour guide", "Sunset spots"],
        hooks: ["I wish I knew this before visiting {location}", "Stop overpaying for {location} trips", "The real reason {location} is trending", "3 things nobody tells you about {location}", "POV: You found the perfect {location} itinerary", "What $100 vs $1000 gets you in {location}", "This {location} view will stop your scroll", "Ranking {location} experiences from worst to best"],
        hashtags: ["#Travel", "#Wanderlust", "#TravelGram", "#Explore", "#Adventure", "#TravelTips", "#HiddenGems", "#BucketList", "#TravelPhotography", "#LocalGuide"],
      },
      "real-estate": {
        topics: ["Market trends update", "Home buying guide", "Selling tips", "Neighborhood spotlight", "Investment properties", "First-time buyer guide", "Luxury home tour", "Staging secrets", "Mortgage tips", "Property valuation", "Renovation ROI", "Rental market insights", "New listings alert", "Open house virtual tour", "Downsizing guide", "Commercial property tips", "Sustainable homes", "Smart home features", "Location deep dive", "Price negotiation tips", "Closing process explained", "Home inspection guide", "Moving checklist", "Interior design trends", "Curb appeal tips", "Real estate myths", "Tax benefits", "Vacation homes", "New developments", "Market comparison"],
        hooks: ["This neighborhood is about to explode", "What your realtor won't tell you", "The $0 mistake most homebuyers make", "Stop looking at Zillow — here's why", "This home sold in 24 hours. Here's how.", "POV: You just found your dream home", "The truth about interest rates right now"],
        hashtags: ["#RealEstate", "#DreamHome", "#HomeBuying", "#PropertyTips", "#HouseHunting", "#RealEstateAgent", "#InvestmentProperty", "#NewHome", "#OpenHouse", "#LuxuryRealEstate"],
      },
      restaurant: {
        topics: ["Chef's special reveal", "Behind the kitchen", "Ingredient spotlight", "Customer favorite", "Seasonal menu launch", "Wine pairing guide", "Quick recipe demo", "Staff picks", "Local supplier story", "Health-conscious options", "Date night special", "Brunch highlights", "Happy hour deals", "Private dining experience", "Food photography tips", "Cooking technique", "Cultural dish story", "Vegan alternatives", "Kids menu favorites", "Weekend specials", "New dish teaser", "Dessert showcase", "Cocktail recipe", "Food and mood", "Farm-to-table story", "Celebrity visit", "Community event", "Limited-time offer", "Review roundup", "Holiday special"],
        hooks: ["This dish changed everything", "You're ordering wrong at {restaurant_type} restaurants", "The secret ingredient our chef won't share", "POV: First bite of our new menu item", "This is what 20 years of cooking looks like", "Why this simple dish outsells everything else", "Our most-ordered item might surprise you"],
        hashtags: ["#Foodie", "#InstaFood", "#RestaurantLife", "#ChefSpecial", "#FoodPhotography", "#MenuTasting", "#LocalEats", "#FoodLover", "#DiningOut", "#Yummy"],
      },
      "fitness-coaching": {
        topics: ["Quick home workout", "Form check guide", "Nutrition myth busting", "Client transformation", "Morning routine", "Recovery tips", "Meal prep ideas", "Motivation Monday", "Strength training basics", "Cardio vs weights", "Stretching guide", "Progress tracking", "Gym etiquette", "Supplement truth", "Sleep and fitness", "Mindset coaching", "Group class preview", "Personal training offer", "HIIT vs steady state", "Beginner mistakes", "Advanced techniques", "Injury prevention", "Bodyweight workout", "Equipment guide", "Goal setting framework", "Accountability tips", "Wellness habits", "Weekly challenge", "Member spotlight", "Fitness trends 2026"],
        hooks: ["I tried this workout for 30 days", "Stop doing crunches — do this instead", "The fitness industry is lying to you", "What actually works for fat loss", "My client's 90-day transformation", "This 5-minute habit changed everything", "Why you're not seeing results"],
        hashtags: ["#Fitness", "#Workout", "#GymLife", "#PersonalTrainer", "#FitTips", "#Nutrition", "#StrengthTraining", "#HealthyLifestyle", "#FitnessMotivation", "#Transformation"],
      },
      "dental-clinic": {
        topics: ["Oral hygiene tips", "Cosmetic dentistry showcase", "Patient smile reveal", "Kids dental care", "Myths about dentists", "Emergency dental guide", "Teeth whitening facts", "Implant explained", "Preventive care tips", "Braces vs aligners", "Gum health guide", "Dental anxiety help", "Technology spotlight", "Insurance explained", "Checkup importance", "Bad breath causes", "Flossing guide", "Diet and teeth", "Senior dental care", "New patient welcome", "Procedure walkthrough", "Cost transparency", "Same-day treatments", "Sedation options", "Family dentistry", "Holiday smile tips", "Sensitivity solutions", "Root canal facts", "Crown and bridge", "Smile makeover"],
        hooks: ["What your dentist wishes you knew", "This before & after will shock you", "Stop making this brushing mistake", "The real cost of skipping checkups", "Why this patient cried happy tears", "Your teeth are trying to tell you something", "The truth about teeth whitening"],
        hashtags: ["#DentalCare", "#HealthySmile", "#Dentist", "#OralHealth", "#SmileMakeover", "#TeethWhitening", "#DentalTips", "#CosmeticDentistry", "#FamilyDentist", "#PatientCare"],
      },
      custom: {
        topics: ["Industry insights", "Behind the business", "Customer success story", "Product spotlight", "How it works", "Expert interview", "Trend report", "Tips and tricks", "Before and after", "Getting started guide", "Common mistakes", "FAQ session", "Community highlight", "Seasonal promotion", "New feature launch", "Comparison guide", "Myth busting", "Resource roundup", "Case study", "Quick wins", "Deep dive", "Challenge", "Behind the scenes", "Team spotlight", "Industry news", "Tool recommendation", "Framework share", "Data insights", "Customer Q&A", "Year in review"],
        hooks: ["The #1 mistake in this industry", "How we grew by 300% in 6 months", "What our customers wish they knew sooner", "This strategy changed everything for us", "Stop doing X — do Y instead", "The framework that saved us 20 hours/week", "Why our competitors are worried"],
        hashtags: ["#BusinessGrowth", "#SmallBusiness", "#EntrepreneurTips", "#MarketingStrategy", "#ContentMarketing", "#BusinessOwner", "#StartupLife", "#GrowthHacking", "#BrandBuilding", "#DigitalMarketing"],
      },
    };

    const config = nicheTopics[packSlug] ?? nicheTopics["custom"]!;

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][date.getDay()]!;

      // Vary content by day of week
      let category: ContentCalendarDay["category"] = "educational";
      let contentType = "carousel";
      let platform = "instagram";

      if (dayOfWeek === "Monday" || dayOfWeek === "Thursday") { category = "educational"; contentType = "carousel"; }
      else if (dayOfWeek === "Tuesday" || dayOfWeek === "Friday") { category = "inspirational"; contentType = "reel"; platform = "tiktok"; }
      else if (dayOfWeek === "Wednesday") { category = "promotional"; contentType = "reel"; }
      else if (dayOfWeek === "Saturday") { category = "inspirational"; contentType = "story"; }
      else { category = "educational"; contentType = "feed_post"; platform = "facebook"; }

      const topicIdx = i % config.topics.length;
      const hookIdx = i % config.hooks.length;
      const tagSlice = config.hashtags.slice(0, 5 + (i % 5));

      calendar.push({
        date: date.toISOString().split("T")[0]!,
        dayOfWeek,
        platform,
        contentType,
        category,
        topic: config.topics[topicIdx]!,
        hook: config.hooks[hookIdx]!,
        hashtags: tagSlice,
      });
    }

    return calendar;
  }

  private generateUxAudit(url: string, domain: string): { flaws: UxuIFlaw[]; score: number } {
    const normalizedDomain = domain.toLowerCase().replace(/\s+/g, "");
    const hasHttps = url.startsWith("https://");
    const hasWww = url.includes("www.");
    const isLong = domain.length > 15;

    const flaws: UxuIFlaw[] = [];

    if (!hasHttps) {
      flaws.push({ category: "security", severity: "critical", title: "No HTTPS", description: "Your site doesn't use HTTPS. Visitors see a 'Not Secure' warning.", recommendation: "Install an SSL certificate immediately — it's free with Let's Encrypt." });
    }
    if (isLong) {
      flaws.push({ category: "ux", severity: "medium", title: "Long domain name", description: `"${domain}" is ${domain.length} characters — harder to type and remember.`, recommendation: "Consider a shorter domain or branded URL shortener for social media." });
    }
    if (hasWww) {
      flaws.push({ category: "seo", severity: "low", title: "WWW subdomain redirect", description: "Your site uses www — ensure non-www redirects correctly to avoid duplicate content.", recommendation: "Set up a 301 redirect from non-www to www (or vice versa)." });
    }

    // Always add actionable UX improvements
    flaws.push(
      { category: "mobile", severity: "high", title: "Mobile responsiveness check", description: "Over 60% of social media traffic comes from mobile. Ensure your site is fully responsive.", recommendation: "Test your site on Google's Mobile-Friendly Test tool. Ensure text is readable without zooming and buttons are at least 48px touch targets." },
      { category: "performance", severity: "high", title: "Page load speed", description: "53% of mobile users leave a page that takes over 3 seconds to load. Slow sites lose customers.", recommendation: "Compress images (use WebP format), enable browser caching, use a CDN, and minify CSS/JS. Target under 2 seconds load time." },
      { category: "seo", severity: "high", title: "Meta tags optimization", description: "Missing or poorly written meta titles and descriptions hurt your search and social rankings.", recommendation: "Every page needs a unique title tag (50-60 chars) and meta description (150-160 chars). Include primary keywords and a clear value proposition." },
      { category: "design", severity: "medium", title: "Visual hierarchy & CTAs", description: "Visitors make snap judgments. Clear visual hierarchy and prominent CTAs increase conversions.", recommendation: "Use one primary CTA per page, contrast it visually (color, size), and place it above the fold. Remove competing calls-to-action." },
      { category: "accessibility", severity: "medium", title: "Accessibility compliance", description: "1 in 4 adults has a disability. Inaccessible sites lose customers and risk legal issues.", recommendation: "Add alt text to all images, ensure proper heading structure (H1→H2→H3), use sufficient color contrast (4.5:1 minimum), and make the site keyboard-navigable." },
      { category: "ux", severity: "low", title: "Social proof placement", description: "Testimonials, reviews, and trust badges build credibility — but only if visitors see them.", recommendation: "Place testimonials near CTAs, show review ratings in the header, and display trust badges on checkout/booking pages." },
    );

    const score = Math.max(30, 85 - (flaws.filter(f => f.severity === "critical").length * 15) - (flaws.filter(f => f.severity === "high").length * 8) - (flaws.filter(f => f.severity === "medium").length * 4) - (flaws.filter(f => f.severity === "low").length * 2));

    return { flaws, score };
  }

  private async analyzeWebsite(url: string): Promise<WebsiteAnalysis> {
    const normalized = url.replace(/https?:\/\//, "").replace(/\/$/, "");
    const domain = normalized.split(".")[0] ?? "business";
    const displayDomain = domain.charAt(0).toUpperCase() + domain.slice(1);

    const { flaws, score } = this.generateUxAudit(url, domain);
    const industry = "travel";
    const packSlug = "travel-agency";

    return {
      url: `https://${normalized}`,
      title: `${displayDomain} — Official Site`,
      description: `${displayDomain} offers premium services and experiences for discerning clients.`,
      industry,
      keywords: ["tours", "travel", "italy", "rome", "vacation", "experiences", "premium"],
      products: ["Tours", "Packages", "Transfers", "Experiences", "Concierge"],
      socialLinks: {
        instagram: `https://instagram.com/${domain.replace(/\s+/g, "")}`,
        facebook: `https://facebook.com/${domain.replace(/\s+/g, "")}`,
      },
      suggestedPack: packSlug,
      confidence: 0.87,
      uxFlaws: flaws,
      uxScore: score,
      contentCalendar: this.generateContentCalendar(industry, packSlug),
    };
  }
}
