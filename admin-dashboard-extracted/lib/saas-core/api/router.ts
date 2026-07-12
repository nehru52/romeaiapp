/**
 * SaaS Core API — Hono router for the multi-tenant dashboard (37 endpoints).
 *
 * AUTH & ONBOARDING:
 *   POST   /api/auth/google              — Google OAuth callback
 *   GET    /api/auth/session/:userId     — Get session
 *   GET    /api/auth/onboarding/:userId  — Get onboarding state
 *
 * ONBOARDING STEPS:
 *   POST   /api/onboarding/niche         — Select niche (step 1)
 *   POST   /api/onboarding/website       — Submit website URL (step 2)
 *
 * PLATFORMS:
 *   POST   /api/platforms/setup          — Set up a platform
 *   GET    /api/platforms/:tenantId      — Get platform setups
 *
 * DASHBOARD:
 *   GET    /api/dashboard/:userId        — Full dashboard state
 *
 * TENANTS:
 *   POST   /api/tenants                   — create tenant
 *   GET    /api/tenants                   — list tenants
 *   GET    /api/tenants/:id               — get tenant
 *   PATCH  /api/tenants/:id               — update tenant
 *   DELETE /api/tenants/:id               — delete tenant
 *
 * PACKS:
 *   GET    /api/packs                     — list available packs
 *   GET    /api/packs/:slug               — get pack details
 *   POST   /api/packs/generate            — auto-generate pack
 *
 * CONTENT:
 *   POST   /api/content/generate          — generate content batch
 *   GET    /api/content/:tenantId         — list tenant content
 *   PATCH  /api/content/:id/status        — update content status
 *
 * NOTIFICATIONS:
 *   POST   /api/notifications/prefs       — set notification preferences
 *   GET    /api/notifications/:userId     — get notifications
 *   POST   /api/notifications/approve     — approve + publish content
 *
 * ANALYTICS:
 *   GET    /api/analytics/:tenantId       — get tenant analytics
 *   GET    /api/analytics                 — get aggregated analytics
 *
 * PROMPT CACHE:
 *   GET    /api/cache/stats               — cache hit rate, savings, entries
 *   DELETE /api/cache?tier=hot            — evict tier or clear all
 *
 * VIRAL CONTENT REVERSE-ENGINEER:
 *   GET    /api/reverse-engineer/formulas     — list viral formulas
 *   GET    /api/reverse-engineer/formulas/:id — get one formula
 *   POST   /api/reverse-engineer/generate     — generate using viral formula
 *   POST   /api/reverse-engineer/scrape       — scrape + extract patterns
 *
 * TELEGRAM BOT:
 *   GET    /api/telegram/status            — bot status and username
 *   POST   /api/telegram/link              — link tenant to Telegram chat
 *   POST   /api/telegram/test              — send test approval notification
 */

import { Hono } from "hono";
import { AnalyticsService } from "../services/analytics-service";
import { AuthService } from "../services/auth-service";
import { contentReverseEngineer } from "../services/content-reverse-engineer";
import { contentService } from "../services/content-service";
import { PackService } from "../services/pack-service";
import { promptCache } from "../services/prompt-cache";
import { getTelegramBot, linkTenantChat } from "../services/telegram-bot";
import { tenantService } from "../services/tenant-service";
import { websiteScraper } from "../services/website-scraper";
import { WorkflowEngine } from "../services/workflow-engine";
import type { ApiResponse } from "../types";

const app = new Hono();

// Always return JSON, never text/HTML
app.onError((err, c) => {
  console.error("[saas-core] Unhandled error:", err.message);
  return c.json({ success: false, error: err.message ?? "Internal server error." }, 500);
});
app.notFound((c) => {
  return c.json({ success: false, error: `Route not found: ${c.req.method} ${c.req.path}` }, 404);
});

// ── Shared services (single instances used by both router and workflow) ──
const authService = new AuthService();
const packService = new PackService();
const analyticsService = new AnalyticsService();
const workflow = new WorkflowEngine(
  authService,          // shared auth — onboarding/sessions kept in sync
  undefined,            // tenants — uses singleton tenantService
  contentService,       // content — shared instance with DB persistence
  undefined,            // packs
  undefined,            // notifications
  undefined,            // platforms
);

// ── CORS ────────────────────────────────────────────────────────────
app.use("*", async (c, next) => {
  c.res.headers.set("Access-Control-Allow-Origin", "*");
  c.res.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS",
  );
  c.res.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );
  if (c.req.method === "OPTIONS")
    return new Response(null, { status: 204, headers: c.res.headers });
  await next();
});

// ── User store (in-memory + Supabase persistence) ──
import { dbInsert, dbQuery, dbUpdate } from "../db/adapter";

const userStore = new Map<
  string,
  {
    email: string;
    hash: string;
    userId: string;
    onboardingComplete: boolean;
    name: string;
  }
>();
const onboardingStore = new Map<string, boolean>();
const resetCodes = new Map<string, { code: string; expiresAt: number }>();

// Load existing users from Supabase on startup
async function loadUsersFromDB(): Promise<void> {
  try {
    const users = await dbQuery<{
      id: string;
      email: string;
      password_hash: string;
      name: string | null;
      auth_provider: string;
      onboarding_complete: boolean;
    }>("users");
    for (const u of users) {
      userStore.set(u.id, {
        email: u.email,
        hash: u.password_hash,
        userId: u.id,
        onboardingComplete: u.onboarding_complete,
        name: u.name ?? u.email.split("@")[0]!,
      });
      if (u.onboarding_complete) onboardingStore.set(u.id, true);
    }
    console.log(`[saas-core] Loaded ${users.length} users from Supabase`);
  } catch (_e) {
    console.log(
      "[saas-core] Could not load users from Supabase — starting with empty store",
    );
  }
}
// Called from server.ts after env is loaded
export async function initUserStore(): Promise<void> {
  await loadUsersFromDB();
}

import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

function hashPassword(pw: string): string {
  const salt = randomBytes(16).toString("hex");
  const key = scryptSync(pw, salt, 64);
  return `${salt}:${key.toString("hex")}`;
}

function verifyPassword(pw: string, hash: string): boolean {
  // Handle legacy hashes from Bun or older versions
  if (hash.startsWith("hashed:")) {
    return hash === `hashed:${pw}`;
  }
  const [salt, keyHex] = hash.split(":");
  if (!salt || !keyHex) return false;
  try {
    const key = scryptSync(pw, salt, 64);
    const storedKey = Buffer.from(keyHex, "hex");
    return timingSafeEqual(key, storedKey);
  } catch {
    return false;
  }
}

async function persistUser(user: {
  email: string;
  hash: string;
  userId: string;
  onboardingComplete: boolean;
  name: string;
}): Promise<void> {
  dbInsert("users", {
    id: user.userId,
    email: user.email,
    password_hash: user.hash,
    name: user.name,
    auth_provider: "email",
    onboarding_complete: user.onboardingComplete,
  }).catch(() => {}); // fire and forget
}

async function persistOnboarding(userId: string): Promise<void> {
  dbUpdate("users", userId, { onboarding_complete: true }).catch(() => {});
}

function findUserByEmail(email: string) {
  for (const [, u] of userStore) {
    if (u.email === email) return u;
  }
  return null;
}

function isUserOnboarded(userId: string): boolean {
  return onboardingStore.get(userId) === true;
}

// ── Health ───────────────────────────────────────────────────────────

app.get("/api/health", (c) => {
  return c.json({
    success: true,
    data: {
      status: "healthy",
      version: "1.0.0-beta.0",
      activeTenants: tenantService.getActiveTenantCount(),
    },
  } satisfies ApiResponse<unknown>);
});

// ── Auth & Onboarding ────────────────────────────────────────────────

// Email signup
app.post("/api/auth/email/signup", async (c) => {
  const { email, password, name } = await c.req.json();
  if (!email?.includes("@"))
    return c.json(
      {
        success: false,
        error: "Invalid email address",
      } satisfies ApiResponse<unknown>,
      400,
    );

  // Check duplicate BEFORE validating password — better UX
  if (findUserByEmail(email))
    return c.json(
      {
        success: false,
        error:
          "An account with this email already exists. Please log in instead.",
      } satisfies ApiResponse<unknown>,
      409,
    );

  if (!password)
    return c.json(
      {
        success: false,
        error: "Password is required.",
      } satisfies ApiResponse<unknown>,
      400,
    );

  const passwordErrors: string[] = [];
  if (password.length < 8) passwordErrors.push("at least 8 characters");
  if (!/[A-Z]/.test(password)) passwordErrors.push("one uppercase letter");
  if (!/[0-9]/.test(password)) passwordErrors.push("one number");
  if (!/[^A-Za-z0-9]/.test(password)) passwordErrors.push("one symbol (e.g. !@#$%)");

  if (passwordErrors.length > 0) {
    return c.json(
      {
        success: false,
        error: `Password must include: ${passwordErrors.join(", ")}.`,
      } satisfies ApiResponse<unknown>,
      400,
    );
  }

  const userId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const hash = await hashPassword(password);
  const displayName = name ?? email.split("@")[0]!;
  const user = {
    email,
    hash,
    userId,
    onboardingComplete: false,
    name: displayName,
  };
  userStore.set(userId, user);
  persistUser(user);

  // Sync with shared AuthService so onboarding/session endpoints work
  authService.onboardingStates.set(userId, {
    userId,
    step: "niche",
    selectedNiche: null,
    packSlug: null,
    businessDescription: null,
    websiteUrl: null,
    websiteAnalysis: null,
  });
  // Create a session for email-based users (required by workflow.submitWebsite)
  authService.sessions.set(userId, {
    userId,
    email,
    name: displayName,
    avatar: "",
    provider: "google", // treated as "email" internally
    accessToken: `tok_${userId}`,
    refreshToken: `ref_${userId}`,
    expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
  });

  return c.json(
    {
      success: true,
      data: { userId, name: displayName, onboardingComplete: false },
    } satisfies ApiResponse<unknown>,
    201,
  );
});

// Forgot password — verify email and return reset token
app.post("/api/auth/forgot-password", async (c) => {
  const { email } = await c.req.json();
  if (!email)
    return c.json(
      { success: false, error: "Email is required" } satisfies ApiResponse<unknown>,
      400,
    );

  const found = findUserByEmail(email);
  if (!found)
    return c.json(
      { success: false, error: "No account found with that email." } satisfies ApiResponse<unknown>,
      404,
    );

  // Generate a 6-digit reset code (valid for 15 minutes)
  const resetCode = String(Math.floor(100000 + Math.random() * 900000));
  resetCodes.set(email, {
    code: resetCode,
    expiresAt: Date.now() + 15 * 60 * 1000,
  });

  return c.json(
    { success: true, data: { resetCode } } satisfies ApiResponse<unknown>,
    200,
  );
});

// Reset password — verify code and update password
app.post("/api/auth/reset-password", async (c) => {
  const { email, code, newPassword } = await c.req.json();
  if (!email || !code || !newPassword)
    return c.json(
      { success: false, error: "Email, reset code, and new password are required" } satisfies ApiResponse<unknown>,
      400,
    );

  if (newPassword.length < 8)
    return c.json(
      { success: false, error: "Password must be at least 8 characters" } satisfies ApiResponse<unknown>,
      400,
    );

  const stored = resetCodes.get(email);
  if (!stored || stored.code !== code || Date.now() > stored.expiresAt) {
    resetCodes.delete(email);
    return c.json(
      { success: false, error: "Invalid or expired reset code. Please request a new one." } satisfies ApiResponse<unknown>,
      400,
    );
  }

  const found = findUserByEmail(email);
  if (!found)
    return c.json(
      { success: false, error: "Account not found" } satisfies ApiResponse<unknown>,
      404,
    );

  // Update password
  const newHash = await hashPassword(newPassword);
  found.hash = newHash;
  userStore.set(found.userId, found);
  persistUser(found);
  resetCodes.delete(email);

  return c.json(
    { success: true, data: { message: "Password updated successfully" } } satisfies ApiResponse<unknown>,
    200,
  );
});

// Email login
app.post("/api/auth/email/login", async (c) => {
  const { email, password } = await c.req.json();
  if (!email || !password)
    return c.json(
      {
        success: false,
        error: "Email and password are required",
      } satisfies ApiResponse<unknown>,
      400,
    );

  const found = findUserByEmail(email);
  if (!found)
    return c.json(
      {
        success: false,
        error:
          "Invalid email or password. If you don't have an account, please sign up.",
      } satisfies ApiResponse<unknown>,
      401,
    );

  const valid = await verifyPassword(password, found.hash);
  if (!valid)
    return c.json(
      {
        success: false,
        error:
          "Invalid email or password. If you don't have an account, please sign up.",
      } satisfies ApiResponse<unknown>,
      401,
    );

  const onboarded = found.onboardingComplete || isUserOnboarded(found.userId);

  // Ensure onboarding state exists in shared AuthService for returning users
  if (!authService.getOnboardingState(found.userId)) {
    authService.onboardingStates.set(found.userId, {
      userId: found.userId,
      step: onboarded ? "done" : "niche",
      selectedNiche: null,
      packSlug: null,
      businessDescription: null,
      websiteUrl: null,
      websiteAnalysis: null,
    });
  }
  // Ensure session exists for workflow methods
  if (!authService.getSession(found.userId)) {
    authService.sessions.set(found.userId, {
      userId: found.userId,
      email: found.email,
      name: found.name ?? email.split("@")[0],
      avatar: "",
      provider: "google",
      accessToken: `tok_${found.userId}`,
      refreshToken: `ref_${found.userId}`,
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      createdAt: new Date().toISOString(),
    });
  }

  return c.json(
    {
      success: true,
      data: {
        userId: found.userId,
        name: found.name ?? email.split("@")[0],
        onboardingComplete: onboarded,
      },
    } satisfies ApiResponse<unknown>,
    200,
  );
});

// Mark user as onboarded (called after completing niche + website)
app.post("/api/auth/onboarding-complete", async (c) => {
  const { userId } = await c.req.json();
  if (!userId)
    return c.json(
      {
        success: false,
        error: "userId required",
      } satisfies ApiResponse<unknown>,
      400,
    );
  onboardingStore.set(userId, true);
  const user = userStore.get(userId);
  if (user) {
    user.onboardingComplete = true;
    userStore.set(userId, user);
  }
  // Sync with shared AuthService
  const state = authService.getOnboardingState(userId);
  if (state) {
    state.step = "done";
    authService.onboardingStates.set(userId, state);
  }
  persistOnboarding(userId);
  return c.json({ success: true } satisfies ApiResponse<unknown>, 200);
});

app.post("/api/auth/google", async (c) => {
  const { code, redirectUri, intent } = await c.req.json();

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  let googleEmail = "";
  let googleName = "";

  // Attempt real Google token exchange if credentials are configured
  if (clientId && clientSecret) {
    try {
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri ?? "http://localhost:3000/auth/callback",
          grant_type: "authorization_code",
        }).toString(),
      });

      if (tokenRes.ok) {
        const tokens = (await tokenRes.json()) as {
          id_token?: string;
          access_token?: string;
        };
        if (tokens.id_token) {
          const payload = JSON.parse(
            Buffer.from(tokens.id_token.split(".")[1]!, "base64").toString(),
          );
          googleEmail = payload.email ?? "";
          googleName =
            payload.name ?? payload.email?.split("@")[0] ?? "Google User";
        }
      }
    } catch {
      // Token exchange failed — fall through to mock
    }
  }

  // Fallback: if no client secret, use mock
  const email = googleEmail || `google-${code.slice(0, 8)}@gmail.com`;
  const name = googleName || "Google User";

  // Check if this email already exists
  const existing = findUserByEmail(email);

  if (existing) {
    // Ensure onboarding state exists for returning users
    if (!authService.getOnboardingState(existing.userId)) {
      authService.onboardingStates.set(existing.userId, {
        userId: existing.userId,
        step: existing.onboardingComplete ? "done" : "niche",
        selectedNiche: null,
        packSlug: null,
        businessDescription: null,
        websiteUrl: null,
        websiteAnalysis: null,
      });
    }
    return c.json(
      {
        success: true,
        data: {
          userId: existing.userId,
          name: existing.name ?? name,
          email: existing.email,
          isNewUser: false,
          onboardingComplete:
            existing.onboardingComplete || isUserOnboarded(existing.userId),
        },
      } satisfies ApiResponse<unknown>,
      200,
    );
  }

  // Email not found. If user clicked from LOGIN tab, reject — they need to sign up first.
  if (intent === "login") {
    return c.json(
      {
        success: false,
        error: `No account found for ${email}. Please sign up first.`,
      } satisfies ApiResponse<unknown>,
      404,
    );
  }

  // Signup tab — create new account
  const userId = `google_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const hash = await hashPassword(`google_${userId}`);
  const user = { email, hash, userId, onboardingComplete: false, name };
  userStore.set(userId, user);
  persistUser(user);

  // Sync with shared AuthService
  authService.onboardingStates.set(userId, {
    userId,
    step: "niche",
    selectedNiche: null,
    packSlug: null,
    businessDescription: null,
    websiteUrl: null,
    websiteAnalysis: null,
  });
  // Create session for Google users
  authService.sessions.set(userId, {
    userId,
    email,
    name,
    avatar: "",
    provider: "google",
    accessToken: `tok_${userId}`,
    refreshToken: `ref_${userId}`,
    expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
  });

  return c.json(
    {
      success: true,
      data: { userId, name, email, isNewUser: true, onboardingComplete: false },
    } satisfies ApiResponse<unknown>,
    201,
  );
});

app.get("/api/auth/session/:userId", (c) => {
  const session = workflow.auth.getSession(c.req.param("userId"));
  if (!session)
    return c.json(
      {
        success: false,
        error: "Session not found",
      } satisfies ApiResponse<unknown>,
      404,
    );
  return c.json({
    success: true,
    data: session,
  } satisfies ApiResponse<unknown>);
});

app.get("/api/auth/onboarding/:userId", (c) => {
  const state = workflow.auth.getOnboardingState(c.req.param("userId"));
  if (!state)
    return c.json(
      {
        success: false,
        error: "User not found",
      } satisfies ApiResponse<unknown>,
      404,
    );
  return c.json({ success: true, data: state } satisfies ApiResponse<unknown>);
});

// ── Onboarding Steps ─────────────────────────────────────────────────

app.post("/api/onboarding/niche", async (c) => {
  const { userId, niche, packSlug, businessDescription } = await c.req.json();
  try {
    const result = await workflow.selectNiche(userId, niche, packSlug, businessDescription);
    return c.json(
      {
        success: true,
        data: {
          onboarding: result.onboarding,
          pack: result.pack,
          nextStep: "website",
        },
      } satisfies ApiResponse<unknown>,
      200,
    );
  } catch (e: any) {
    return c.json(
      { success: false, error: e.message } satisfies ApiResponse<unknown>,
      400,
    );
  }
});

app.post("/api/onboarding/website", async (c) => {
  const { userId, url } = await c.req.json();
  if (!userId || !url) {
    return c.json(
      { success: false, error: "userId and url are required" } satisfies ApiResponse<unknown>,
      400,
    );
  }

  try {
    // Always use the workflow's built-in mock analysis first (works without any API keys)
    const result = await workflow.submitWebsite(userId, url);
    let analysis = result.analysis;

    // If Firecrawl is configured, try to enrich with real data (with timeout)
    if (websiteScraper.isConfigured()) {
      try {
        const enriched = await Promise.race([
          websiteScraper.analyze(url),
          new Promise<null>((_, reject) => setTimeout(() => reject(new Error("timeout")), 25000)),
        ]);
        if (enriched && enriched.title && enriched.confidence > 0) {
          analysis = enriched;
        }
      } catch {
        // Keep the mock analysis — real scraping timed out or failed
        console.log("[saas-core] Firecrawl scrape timed out or failed, using mock analysis");
      }
    }

    // Create tenant using the analysis data
    const tenant = workflow.tenants.createTenant({
      name: analysis.title ?? url.replace(/https?:\/\//, "").split("/")[0]!,
      slug:
        (analysis.title ?? "business").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      email: `${userId}@optimus.ai`,
    });

    // Link tenant to user
    workflow.auth.linkTenant(userId, tenant.id);

    return c.json(
      {
        success: true,
        data: {
          analysis,
          tenant,
          nextStep: "dashboard",
          scraperUsed: websiteScraper.isConfigured() ? "firecrawl" : "mock",
        },
      } satisfies ApiResponse<unknown>,
      200,
    );
  } catch (e: any) {
    return c.json(
      { success: false, error: e.message ?? "Website analysis failed" } satisfies ApiResponse<unknown>,
      400,
    );
  }
});

// ── Platform Setup ───────────────────────────────────────────────────

app.post("/api/platforms/setup", async (c) => {
  const body = await c.req.json();
  try {
    const result = await workflow.setupPlatform({
      userId: body.userId,
      tenantId: body.tenantId,
      platform: body.platform,
      postsPerDay: body.postsPerDay,
      duration: body.duration,
      startDate: body.startDate ?? new Date().toISOString().split("T")[0],
      apiKey: body.apiKey,
    });
    return c.json(
      { success: true, data: result } satisfies ApiResponse<unknown>,
      201,
    );
  } catch (e: any) {
    return c.json(
      { success: false, error: e.message } satisfies ApiResponse<unknown>,
      400,
    );
  }
});

app.get("/api/platforms/:tenantId", (c) => {
  const setups = workflow.platforms.getSetupsByTenant(c.req.param("tenantId"));
  return c.json({ success: true, data: setups } satisfies ApiResponse<unknown>);
});

// ── Dashboard ────────────────────────────────────────────────────────

app.get("/api/dashboard/:userId", (c) => {
  const state = workflow.getDashboard(c.req.param("userId"));
  return c.json({ success: true, data: state } satisfies ApiResponse<unknown>);
});

// ── Tenants (admin) ──────────────────────────────────────────────────

app.post("/api/tenants", async (c) => {
  const body = await c.req.json();
  const tenant = tenantService.createTenant({
    name: body.name,
    slug: body.slug ?? body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    email: body.email,
    tier: body.tier,
  });
  return c.json(
    { success: true, data: tenant } satisfies ApiResponse<unknown>,
    201,
  );
});

app.get("/api/tenants", (c) => {
  const filter: { status?: string; tier?: string } = {};
  const s = c.req.query("status");
  const t = c.req.query("tier");
  if (s) filter.status = s;
  if (t) filter.tier = t;
  const tenants = tenantService.listTenants(filter);
  return c.json({
    success: true,
    data: tenants,
    meta: { total: tenants.length, page: 1, limit: 50 },
  } satisfies ApiResponse<unknown>);
});

app.get("/api/tenants/:id", (c) => {
  const tenant = tenantService.getTenant(c.req.param("id"));
  if (!tenant)
    return c.json(
      {
        success: false,
        error: "Tenant not found",
      } satisfies ApiResponse<unknown>,
      404,
    );
  return c.json({ success: true, data: tenant } satisfies ApiResponse<unknown>);
});

app.patch("/api/tenants/:id", async (c) => {
  const body = await c.req.json();
  const id = c.req.param("id");
  if (body.tier) {
    const updated = tenantService.updateTier(id, body.tier);
    if (!updated)
      return c.json(
        {
          success: false,
          error: "Tenant not found",
        } satisfies ApiResponse<unknown>,
        404,
      );
    return c.json({
      success: true,
      data: updated,
    } satisfies ApiResponse<unknown>);
  }
  if (body.status) {
    const updated = tenantService.updateStatus(id, body.status);
    if (!updated)
      return c.json(
        {
          success: false,
          error: "Tenant not found",
        } satisfies ApiResponse<unknown>,
        404,
      );
    return c.json({
      success: true,
      data: updated,
    } satisfies ApiResponse<unknown>);
  }
  // General settings update (name, email, metadata like approvalGate, autoPublish)
  const metadata: Record<string, string> = {};
  if (body.approvalGate !== undefined)
    metadata.approvalGate = String(body.approvalGate);
  if (body.autoPublish !== undefined)
    metadata.autoPublish = String(body.autoPublish);
  if (body.theme !== undefined) metadata.theme = String(body.theme);
  if (body.industry !== undefined) metadata.industry = String(body.industry);

  const tenant = tenantService.getTenant(id);
  if (!tenant)
    return c.json(
      {
        success: false,
        error: "Tenant not found",
      } satisfies ApiResponse<unknown>,
      404,
    );

  // Update name and email on the tenant directly
  if (body.name) tenantService.updateMetadata(id, { displayName: body.name });
  if (body.email)
    tenantService.updateMetadata(id, { contactEmail: body.email });
  if (Object.keys(metadata).length > 0)
    tenantService.updateMetadata(id, metadata);

  const updated = tenantService.getTenant(id);
  return c.json({
    success: true,
    data: updated,
  } satisfies ApiResponse<unknown>);
});

app.delete("/api/tenants/:id", (c) => {
  const deleted = tenantService.deleteTenant(c.req.param("id"));
  if (!deleted)
    return c.json(
      {
        success: false,
        error: "Tenant not found",
      } satisfies ApiResponse<unknown>,
      404,
    );
  return c.json({ success: true } satisfies ApiResponse<unknown>);
});

// ── Packs ────────────────────────────────────────────────────────────

app.get("/api/packs", (c) => {
  const packs = packService.loadPacks();
  return c.json({
    success: true,
    data: packs,
    meta: { total: packs.length, page: 1, limit: 50 },
  } satisfies ApiResponse<unknown>);
});

app.get("/api/packs/:slug", (c) => {
  const pack = packService.getPack(c.req.param("slug"));
  if (!pack)
    return c.json(
      {
        success: false,
        error: "Pack not found",
      } satisfies ApiResponse<unknown>,
      404,
    );
  const config = packService.loadPackConfig(pack.slug);
  return c.json({
    success: true,
    data: { pack, config },
  } satisfies ApiResponse<unknown>);
});

app.post("/api/packs/generate", async (c) => {
  const body = await c.req.json();
  const generated = await packService.generatePack(body);
  return c.json(
    { success: true, data: generated } satisfies ApiResponse<unknown>,
    201,
  );
});

// ── Content ──────────────────────────────────────────────────────────

app.post("/api/content/generate", async (c) => {
  const body = await c.req.json();
  // Full workflow: generate → notify
  const result = await workflow.generateAndNotify({
    userId: body.userId,
    tenantId: body.tenantId,
    platform: body.platform,
    count: body.count ?? 1,
    topic: body.topic,
  });
  return c.json(
    { success: true, data: result } satisfies ApiResponse<unknown>,
    201,
  );
});

app.get("/api/content/:tenantId", (c) => {
  const status = c.req.query("status") as any;
  const type = c.req.query("type");
  const platform = c.req.query("platform");
  const page = Number(c.req.query("page") ?? "1");
  const limit = Number(c.req.query("limit") ?? "20");
  const items = contentService.listContent(
    c.req.param("tenantId"),
    { status, type: type || undefined, platform: platform || undefined },
    { page, limit },
  );
  return c.json({
    success: true,
    data: items,
    meta: { total: items.length, page, limit },
  } satisfies ApiResponse<unknown>);
});

// Get a single content item by ID
app.get("/api/content/item/:id", (c) => {
  const item = contentService.getContent(c.req.param("id"));
  if (!item)
    return c.json(
      {
        success: false,
        error: "Content not found",
      } satisfies ApiResponse<unknown>,
      404,
    );
  return c.json({ success: true, data: item } satisfies ApiResponse<unknown>);
});

app.patch("/api/content/:id/status", async (c) => {
  const body = await c.req.json();
  const updated = contentService.updateStatus(c.req.param("id"), body.status);
  if (!updated)
    return c.json(
      {
        success: false,
        error: "Content not found",
      } satisfies ApiResponse<unknown>,
      404,
    );
  return c.json({
    success: true,
    data: updated,
  } satisfies ApiResponse<unknown>);
});

// ── Notifications ────────────────────────────────────────────────────

app.post("/api/notifications/prefs", async (c) => {
  const body = await c.req.json();
  const prefs = await workflow.setNotifications({
    userId: body.userId,
    channels: body.channels,
    email: body.email,
    phone: body.phone,
    approvalOnly: body.approvalOnly ?? true,
  });
  return c.json(
    { success: true, data: prefs } satisfies ApiResponse<unknown>,
    200,
  );
});

app.get("/api/notifications/:userId", (c) => {
  const limit = Number(c.req.query("limit") ?? "20");
  const notifications = workflow.notifications.getNotifications(
    c.req.param("userId"),
    limit,
  );
  const pending = workflow.notifications.getPendingCount(c.req.param("userId"));
  return c.json({
    success: true,
    data: { notifications, pending },
  } satisfies ApiResponse<unknown>);
});

app.post("/api/notifications/approve", async (c) => {
  const { userId, contentId } = await c.req.json();
  try {
    const result = await workflow.approveAndPublish(userId, contentId);
    return c.json(
      {
        success: true,
        data: {
          content: result.content,
          notification: result.notification,
          message: "Content approved and published",
        },
      } satisfies ApiResponse<unknown>,
      200,
    );
  } catch (e: any) {
    return c.json(
      { success: false, error: e.message } satisfies ApiResponse<unknown>,
      400,
    );
  }
});

// ── Analytics ────────────────────────────────────────────────────────

app.get("/api/analytics/:tenantId", (c) => {
  const analytics = analyticsService.getTenantAnalytics(
    c.req.param("tenantId"),
  );
  return c.json({
    success: true,
    data: analytics,
  } satisfies ApiResponse<unknown>);
});

app.get("/api/analytics", (c) => {
  const aggregated = analyticsService.getAggregatedAnalytics();
  return c.json({
    success: true,
    data: aggregated,
  } satisfies ApiResponse<unknown>);
});

// ── Prompt Cache ──────────────────────────────────────────────────────

app.get("/api/cache/stats", (c) => {
  const stats = promptCache.getStats();
  return c.json({ success: true, data: stats } satisfies ApiResponse<unknown>);
});

app.delete("/api/cache", (c) => {
  const tier = c.req.query("tier") as "hot" | "warm" | "cold" | undefined;
  if (tier) {
    const count = promptCache.evictTier(tier);
    return c.json({
      success: true,
      data: { evicted: count, tier },
    } satisfies ApiResponse<unknown>);
  }
  promptCache.clear();
  return c.json({
    success: true,
    data: { cleared: true },
  } satisfies ApiResponse<unknown>);
});

// ── Viral Content Reverse-Engineer ────────────────────────────────────

app.get("/api/reverse-engineer/formulas", (c) => {
  const niche = c.req.query("niche");
  const formulas = contentReverseEngineer.listFormulas(niche ?? undefined);
  return c.json({
    success: true,
    data: formulas,
    meta: { total: formulas.length, page: 1, limit: 100 },
  } satisfies ApiResponse<unknown>);
});

app.get("/api/reverse-engineer/formulas/:id", (c) => {
  const formula = contentReverseEngineer.getFormula(c.req.param("id"));
  if (!formula)
    return c.json(
      {
        success: false,
        error: "Formula not found",
      } satisfies ApiResponse<unknown>,
      404,
    );
  return c.json({
    success: true,
    data: formula,
  } satisfies ApiResponse<unknown>);
});

app.post("/api/reverse-engineer/generate", async (c) => {
  const body = await c.req.json();
  try {
    let result;
    if (body.formulaId) {
      const gen = contentReverseEngineer.quickGenerate(body.formulaId, body);
      if (!gen)
        return c.json(
          {
            success: false,
            error: "Formula not found",
          } satisfies ApiResponse<unknown>,
          404,
        );
      result = gen;
    } else {
      result = await contentReverseEngineer.reverseEngineer(body);
    }
    return c.json(
      { success: true, data: result } satisfies ApiResponse<unknown>,
      201,
    );
  } catch (e: any) {
    return c.json(
      { success: false, error: e.message } satisfies ApiResponse<unknown>,
      400,
    );
  }
});

app.post("/api/reverse-engineer/scrape", async (c) => {
  const body = await c.req.json();
  try {
    const posts = await contentReverseEngineer.scrapeTopContent(body);
    const patterns = contentReverseEngineer.extractPatterns(posts);
    const formula = contentReverseEngineer.matchFormula(body, patterns);
    return c.json(
      {
        success: true,
        data: { posts, patterns, matchedFormula: formula },
        meta: { total: posts.length, page: 1, limit: 50 },
      } satisfies ApiResponse<unknown>,
      200,
    );
  } catch (e: any) {
    return c.json(
      { success: false, error: e.message } satisfies ApiResponse<unknown>,
      400,
    );
  }
});

// ── Telegram Bot ──────────────────────────────────────────────────────

app.get("/api/telegram/status", (c) => {
  const _bot = getTelegramBot();
  return c.json({
    success: true,
    data: {
      enabled: !!process.env.TELEGRAM_BOT_TOKEN,
      botUsername: process.env.TELEGRAM_BOT_USERNAME ?? "not configured",
    },
  } satisfies ApiResponse<unknown>);
});

app.post("/api/telegram/link", async (c) => {
  const { tenantId, chatId } = await c.req.json();
  if (!tenantId || !chatId) {
    return c.json(
      {
        success: false,
        error: "tenantId and chatId required",
      } satisfies ApiResponse<unknown>,
      400,
    );
  }
  linkTenantChat(tenantId, String(chatId));
  return c.json(
    {
      success: true,
      data: { linked: true, tenantId, chatId },
    } satisfies ApiResponse<unknown>,
    200,
  );
});

app.post("/api/telegram/test", async (c) => {
  const { tenantId, contentId, title, excerpt, platform, contentType } =
    await c.req.json();
  const bot = getTelegramBot();
  const chatId = (bot as any).config.tenantChats.get(tenantId);
  if (!chatId) {
    return c.json(
      {
        success: false,
        error: "Tenant not linked to Telegram. Send /start to the bot first.",
      } satisfies ApiResponse<unknown>,
      400,
    );
  }
  const msgId = await bot.sendContentForApproval(chatId, {
    contentId: contentId ?? "test_001",
    tenantId,
    tenantName: "Test Agency",
    title: title ?? "Test Content",
    excerpt: excerpt ?? "This is a test content preview...",
    platform: platform ?? "instagram",
    contentType: contentType ?? "carousel",
  });
  return c.json(
    {
      success: true,
      data: { messageId: msgId, chatId },
    } satisfies ApiResponse<unknown>,
    200,
  );
});

export { app as saasRouter };
export default app;
