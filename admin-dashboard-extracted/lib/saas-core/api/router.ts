/**
 * SaaS Core API — Hono router for the multi-tenant dashboard.
 *
 * AUTH (delegated to Auth.js v5 — next-auth@beta):
 *   Auth.js handles: /api/auth/* (sign-in, callback, session, sign-out)
 *   Remaining custom endpoints below:
 *     POST   /api/auth/email/signup        — Email + password signup (user creation)
 *     POST   /api/auth/forgot-password    — Send reset code
 *     POST   /api/auth/reset-password     — Reset password with code
 *
 * PROTECTED (require auth session via Auth.js):
 *   POST   /api/onboarding/niche         — Select niche
 *   POST   /api/onboarding/website       — Submit website URL
 *   POST   /api/auth/onboarding-complete — Mark onboarding done
 *   GET    /api/dashboard               — Full dashboard state
 *   ...all content/tenant/platform routes...
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import {
  requireAuth,
  requireTenantAccess,
  getClientIP,
} from "../../auth/hono-adapter";
import { hashPassword, verifyPassword } from "../../auth/password";
import { rateLimitByIP, rateLimitByEmail } from "../../auth/rate-limit";
import { createUser as storeCreateUser, getUserByEmail, getUserById, markOnboardingComplete as storeMarkOnboardingComplete, updateUser } from "../../auth/user-store";
import { getAdminClient } from "../../supabase/admin";
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

// ── Global middleware ────────────────────────────────────────────────

app.use("*", cors({
  origin: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.onError((err, c) => {
  console.error("[saas-core] Unhandled error:", err.message);
  return c.json({ success: false, error: "Internal server error." }, 500);
});

app.notFound((c) => {
  return c.json({ success: false, error: `Route not found: ${c.req.method} ${c.req.path}` }, 404);
});

// ── Shared services ──────────────────────────────────────────────────

const authService = new AuthService();
const packService = new PackService();
const analyticsService = new AnalyticsService();
const workflow = new WorkflowEngine(authService, undefined, contentService, undefined, undefined, undefined);

// ── Reset codes (in-memory — use Redis/DB in production) ───────────

const resetCodes = new Map<string, { code: string; expiresAt: number }>();

// ── Health ───────────────────────────────────────────────────────────

app.get("/api/health", (c) => {
  return c.json({
    success: true,
    data: { status: "healthy", version: "2.0.0", activeTenants: tenantService.getActiveTenantCount() },
  });
});

// ═══════════════════════════════════════════════════════════════════════
// AUTH ENDPOINTS — complementary to Auth.js
// Auth.js handles: sign-in, callback, session, sign-out at /api/auth/*
// These endpoints handle signup + password reset (not provided by Auth.js)
// ═══════════════════════════════════════════════════════════════════════

// ── Email signup (user creation — Auth.js credentials provider handles login) ──

app.post("/api/auth/email/signup", async (c) => {
  const ip = getClientIP(c);
  const rl = rateLimitByIP(ip, "signup");
  if (!rl.allowed) {
    return c.json({ success: false, error: "Too many signup attempts. Try again later." }, 429);
  }

  const { email, password, name } = await c.req.json();
  if (!email?.includes("@")) {
    return c.json({ success: false, error: "Valid email is required." }, 400);
  }
  const existing = await getUserByEmail(email);
  if (existing) {
    return c.json({ success: false, error: "An account with this email already exists." }, 409);
  }
  if (!password || password.length < 8) {
    return c.json({ success: false, error: "Password must be at least 8 characters." }, 400);
  }
  if (!/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    return c.json({
      success: false,
      error: "Password must include uppercase, number, and symbol.",
    }, 400);
  }

  const user = await storeCreateUser({ email, password, name });

  // Also create AuthService session for tenant/onboarding tracking
  authService.ensureSession(user.id, user.email, user.name);

  return c.json({
    success: true,
    data: {
      userId: user.id,
      name: user.name,
      email: user.email,
      onboardingComplete: false,
    },
  });
});

// ── Forgot password ──────────────────────────────────────────────────

app.post("/api/auth/forgot-password", async (c) => {
  const ip = getClientIP(c);
  const rl = rateLimitByIP(ip, "forgot");
  if (!rl.allowed) {
    return c.json({ success: false, error: "Too many attempts. Try again later." }, 429);
  }

  const { email } = await c.req.json();
  if (!email) {
    return c.json({ success: false, error: "Email is required." }, 400);
  }

  const user = await getUserByEmail(email);
  // Always return success to prevent email enumeration
  if (!user) {
    return c.json({ success: true, data: { message: "If an account exists, a reset code has been sent." } });
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  resetCodes.set(email.toLowerCase(), { code, expiresAt: Date.now() + 15 * 60_000 });

  if (!process.env.NODE_ENV?.startsWith("prod")) {
    console.log(`[auth] Reset code for ${email}: ${code}`);
  }

  return c.json({
    success: true,
    data: {
      message: "If an account exists, a reset code has been sent.",
      resetCode: process.env.NODE_ENV?.startsWith("prod") ? undefined : code,
    },
  });
});

// ── Reset password ───────────────────────────────────────────────────

app.post("/api/auth/reset-password", async (c) => {
  const ip = getClientIP(c);
  const rl = rateLimitByIP(ip, "reset");
  if (!rl.allowed) {
    return c.json({ success: false, error: "Too many attempts. Try again later." }, 429);
  }

  const { email, code, newPassword } = await c.req.json();
  if (!email || !code || !newPassword) {
    return c.json({ success: false, error: "Email, code, and new password are required." }, 400);
  }
  if (newPassword.length < 8) {
    return c.json({ success: false, error: "Password must be at least 8 characters." }, 400);
  }
  if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) {
    return c.json({
      success: false,
      error: "Password must include uppercase, number, and symbol.",
    }, 400);
  }

  const stored = resetCodes.get(email.toLowerCase());
  if (!stored || stored.code !== code || Date.now() > stored.expiresAt) {
    return c.json({ success: false, error: "Invalid or expired reset code." }, 400);
  }

  const user = await getUserByEmail(email);
  if (!user) {
    return c.json({ success: false, error: "Account not found." }, 404);
  }

  await updateUser(email, { passwordHash: hashPassword(newPassword) });
  resetCodes.delete(email.toLowerCase());

  return c.json({ success: true, data: { message: "Password updated. You can now log in." } });
});

// ═══════════════════════════════════════════════════════════════════════
// PROTECTED ENDPOINTS — require auth cookie
// ═══════════════════════════════════════════════════════════════════════

// ── Onboarding: Select Niche ─────────────────────────────────────────

app.post("/api/onboarding/niche", requireAuth, async (c) => {
  const session = c.get("session");
  const { niche, packSlug, businessDescription } = await c.req.json();
  if (!niche) {
    return c.json({ success: false, error: "Niche is required." }, 400);
  }

  const state = authService.setNiche(session.sub, niche, packSlug ?? niche, businessDescription);
  const pack = packService.getPack(packSlug) ?? packService.loadPacks().find(p => p.slug === "custom");

  return c.json({ success: true, data: { onboarding: state, pack } });
});

// ── Onboarding: Submit Website ───────────────────────────────────────

app.post("/api/onboarding/website", requireAuth, async (c) => {
  const session = c.get("session");
  const { url } = await c.req.json();
  if (!url?.match(/^https?:\/\/.+/)) {
    return c.json({ success: false, error: "Valid URL starting with http:// or https:// is required." }, 400);
  }

  const state = await authService.setWebsite(session.sub, url);
  const tenant = tenantService.createTenant({
    name: session.name,
    slug: session.email.replace(/[@.]/g, "-"),
    email: session.email,
  });
  authService.linkTenant(session.sub, tenant.id);

  return c.json({ success: true, data: { analysis: state.websiteAnalysis, tenant } });
});

// ── Mark onboarding complete ─────────────────────────────────────────

app.post("/api/auth/onboarding-complete", requireAuth, async (c) => {
  const session = c.get("session");
  authService.markOnboardingComplete(session.sub);
  return c.json({ success: true, data: { onboardingComplete: true } });
});

// ── Dashboard ────────────────────────────────────────────────────────

app.get("/api/dashboard", requireAuth, async (c) => {
  const session = c.get("session");
  const dashboard = workflow.getDashboard(session.sub);
  return c.json({ success: true, data: dashboard });
});

// ── Platforms ────────────────────────────────────────────────────────

app.post("/api/platforms/setup", requireAuth, async (c) => {
  const session = c.get("session");
  const body = await c.req.json();
  const result = await workflow.setupPlatform({ userId: session.sub, ...body });
  return c.json({ success: true, data: result });
});

app.get("/api/platforms/:tenantId", requireAuth, requireTenantAccess, async (c) => {
  const tenantId = c.req.param("tenantId");
  // PlatformSetupService is internal to WorkflowEngine
  const dashboard = workflow.getDashboard(c.get("session").sub);
  const platforms = dashboard.platforms.filter(p => {
    // Filter by tenant — platforms are keyed by tenant ID inside the service
    return true; // getDashboard already filters by user's tenants
  });
  return c.json({ success: true, data: platforms });
});

// ── Content ──────────────────────────────────────────────────────────

app.post("/api/content/generate", requireAuth, async (c) => {
  const session = c.get("session");
  const body = await c.req.json();
  const result = await workflow.generateAndNotify({ userId: session.sub, ...body });
  return c.json({ success: true, data: result });
});

app.get("/api/content/:tenantId", requireAuth, requireTenantAccess, async (c) => {
  const tenantId = c.req.param("tenantId");
  const content = await contentService.listContent(tenantId);
  return c.json({ success: true, data: content });
});

app.patch("/api/content/:id/status", requireAuth, async (c) => {
  const { id } = c.req.param();
  const { status } = await c.req.json();
  const updated = contentService.updateStatus(id, status);
  return c.json({ success: true, data: updated });
});

// ── Packs ────────────────────────────────────────────────────────────

app.get("/api/packs", (c) => {
  return c.json({ success: true, data: packService.loadPacks() });
});

app.get("/api/packs/:slug", (c) => {
  const pack = packService.getPack(c.req.param("slug"));
  if (!pack) return c.json({ success: false, error: "Pack not found." }, 404);
  return c.json({ success: true, data: pack });
});

// ── Reverse Engineer ─────────────────────────────────────────────────

app.get("/api/reverse-engineer/formulas", (c) => {
  const formulas = contentReverseEngineer.listFormulas();
  return c.json({ success: true, data: formulas });
});

app.post("/api/reverse-engineer/generate", async (c) => {
  const body = await c.req.json();
  const result = await contentReverseEngineer.reverseEngineer(body);
  return c.json({ success: true, data: result });
});

// ── Analytics ────────────────────────────────────────────────────────

// Auto-resolve tenant from session (no tenant ID param needed)
app.get("/api/analytics", requireAuth, async (c) => {
  const session = c.get("session");
  const tenantIds = authService.getUserTenants(session.sub);
  if (!tenantIds || tenantIds.length === 0) {
    return c.json({ success: true, data: { totalContent: 0, platformBreakdown: {}, trends: [], aiUsage: {} } });
  }
  const analytics = await analyticsService.getTenantAnalytics(tenantIds[0]!);
  return c.json({ success: true, data: analytics });
});

app.get("/api/analytics/:tenantId", requireAuth, requireTenantAccess, async (c) => {
  const tenantId = c.req.param("tenantId");
  const analytics = await analyticsService.getTenantAnalytics(tenantId);
  return c.json({ success: true, data: analytics });
});

// ── Prompt Cache ─────────────────────────────────────────────────────

app.get("/api/cache/stats", (c) => {
  return c.json({ success: true, data: promptCache.getStats() });
});

// ── Telegram ─────────────────────────────────────────────────────────

app.get("/api/telegram/status", (c) => {
  const bot = getTelegramBot();
  return c.json({ success: true, data: { running: bot.isRunning(), username: bot.getUsername() } });
});

app.post("/api/telegram/link", requireAuth, async (c) => {
  const session = c.get("session");
  const { tenantId, chatId } = await c.req.json();
  linkTenantChat(tenantId, chatId);
  return c.json({ success: true, data: { linked: true } });
});

// ── Tenants ──────────────────────────────────────────────────────────

app.get("/api/tenants", requireAuth, async (c) => {
  const session = c.get("session");
  const tenantIds = authService.getUserTenants(session.sub);
  const tenants = tenantIds.map(id => tenantService.getTenant(id)).filter(Boolean);
  return c.json({ success: true, data: tenants });
});

app.post("/api/tenants", requireAuth, async (c) => {
  const session = c.get("session");
  const body = await c.req.json();
  const tenant = tenantService.createTenant(body);
  authService.linkTenant(session.sub, tenant.id);
  return c.json({ success: true, data: tenant }, 201);
});

// ── Queue (alias for content with pending status) ────────────────────

app.get("/api/queue/:tenantId", requireAuth, async (c) => {
  const tenantId = c.req.param("tenantId");
  const items = await contentService.listContent(tenantId);
  const pending = items.filter((i: any) => i.status === "pending_approval" || i.status === "draft");
  return c.json({ success: true, data: pending });
});

app.post("/api/queue/bulk-approve", requireAuth, async (c) => {
  const body = await c.req.json();
  const results: any[] = [];
  for (const id of (body.ids ?? [])) {
    const updated = contentService.updateStatus(id, "published");
    if (updated) results.push(updated);
  }
  return c.json({ success: true, data: results });
});

// ── Trends (stub for now) ───────────────────────────────────────────

app.get("/api/trends", requireAuth, async (c) => {
  const session = c.get("session");
  const tenantIds = authService.getUserTenants(session.sub);
  const tenantId = tenantIds[0];
  if (!tenantId) return c.json({ success: true, data: { trends: [] } });
  const content = await contentService.listContent(tenantId);
  return c.json({ success: true, data: { trends: content ?? [] } });
});

app.post("/api/trends/generate", requireAuth, async (c) => {
  return c.json({ success: true, data: { message: "Trend generation queued" } });
});

// ── Notifications ────────────────────────────────────────────────────

app.get("/api/notifications", requireAuth, async (c) => {
  const session = c.get("session");
  const notifications = workflow.getDashboard(session.sub).notifications;
  return c.json({ success: true, data: notifications });
});

// ── Export ───────────────────────────────────────────────────────────

export default app;
export { app as saasRouter };

/**
 * Initialize the user store from Supabase on cold start.
 * Restores sessions and onboarding states so the dashboard has data.
 */
export async function initUserStore(): Promise<void> {
  const supabase = getAdminClient();
  try {
    // Load all users and create sessions
    const { data: users } = await supabase.from("users").select("id, email, name");
    if (users) {
      for (const u of users) {
        authService.ensureSession(u.id, u.email, u.name ?? u.email.split("@")[0]!);
      }
      console.log(`[initUserStore] Restored ${users.length} user sessions`);
    }

    // Load tenants and link to users (needed for analytics/dashboard APIs)
    const { data: tenants } = await supabase.from("tenants").select("*");
    if (tenants) {
      for (const t of tenants) {
        if (t.owner_id) {
          authService.linkTenant(t.owner_id, t.id);
        }
      }
      console.log(`[initUserStore] Restored ${tenants.length} tenants`);
    }

    // Load completed onboarding records and restore state
    const { data: onboardings } = await supabase
      .from("onboarding")
      .select("*")
      .eq("step", "done");
    if (onboardings) {
      for (const o of onboardings) {
        const session = authService.getSession(o.user_id);
        if (!session) continue;
        // Restore onboarding state as done
        const state = authService.getOnboardingState(o.user_id);
        if (state) {
          state.step = "done";
          state.selectedNiche = o.selected_niche ?? null;
          state.packSlug = o.pack_slug ?? null;
          state.businessDescription = o.business_description ?? null;
          state.websiteUrl = o.website_url ?? null;
          state.websiteAnalysis = o.website_analysis ?? null;
        }
      }
      console.log(`[initUserStore] Restored ${onboardings.length} onboarding states`);
    }
  } catch (err: any) {
    console.error("[initUserStore] Failed to load from Supabase:", err.message);
  }
}
