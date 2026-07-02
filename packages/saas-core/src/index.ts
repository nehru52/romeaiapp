/**
 * @elizaos/saas-core
 *
 * Multi-tenant SaaS platform for social media automation.
 * Any business, any niche — drop in a pack, add API keys, and go.
 *
 * Architecture:
 *   Engine (7 plugins)     — content gen, image, video, trends, funnel, calendar, prompts
 *   Packs (6 industries)   — travel, real estate, restaurant, fitness, dental, custom
 *   Tenants (N businesses) — isolated .env + character + products per client
 *   Dashboard API           — Hono router (37 endpoints + cache + reverse-engineer + telegram)
 *   Dashboard UI            — React components for the full user workflow
 *
 * User Flow:
 *   Login → Niche → Website URL → Loading/Analysis → Dashboard →
 *   Select Platform → Posts/Day → Duration → API Key →
 *   Notifications Setup → Content Generated → Notification Sent →
 *   User Approves → Published
 */

// ── API Router ───────────────────────────────────────────────────────
export { default as app, saasRouter } from "./api/router.js";
export * from "./db/adapter.js";
// ── DB ───────────────────────────────────────────────────────────────
export * from "./db/schema.js";
export { AnalyticsService } from "./services/analytics-service.js";
export type {
  AuthSession,
  OnboardingState,
  WebsiteAnalysis,
} from "./services/auth-service.js";
// ── Services ─────────────────────────────────────────────────────────
export { AuthService } from "./services/auth-service.js";
// ── Content Reverse-Engineer ─────────────────────────────────────────
export {
  ContentReverseEngineer,
  contentReverseEngineer,
} from "./services/content-reverse-engineer.js";
export type {
  ExtractedPattern,
  ReverseEngineeredContent,
  ScrapedTopPost,
  ViralContentRequest,
  ViralFormula,
} from "./services/content-reverse-engineer-types.js";
export { ContentService } from "./services/content-service.js";
export type {
  Notification,
  NotificationChannel,
  NotificationPreferences,
} from "./services/notification-service.js";
export { NotificationService } from "./services/notification-service.js";
export { PackService } from "./services/pack-service.js";
export type { PlatformSetup } from "./services/platform-setup-service.js";
export { PlatformSetupService } from "./services/platform-setup-service.js";
export type {
  CacheEntry,
  CacheStats,
  CacheTier,
} from "./services/prompt-cache.js";
// ── Prompt Cache ────────────────────────────────────────────────────
export { PromptCache, promptCache } from "./services/prompt-cache.js";
export type {
  ApprovalAction,
  ContentNotification,
  TelegramConfig,
} from "./services/telegram-bot.js";

// ── Telegram Bot ─────────────────────────────────────────────────────
export {
  getTelegramBot,
  getTenantChat,
  linkTenantChat,
  TelegramBot,
} from "./services/telegram-bot.js";
export { TenantService } from "./services/tenant-service.js";
export { WorkflowEngine } from "./services/workflow-engine.js";
// ── Types ────────────────────────────────────────────────────────────
export * from "./types.js";

// ── Dashboard UI Components ──────────────────────────────────────────
// UI components live in src/ui/ and are imported directly by the
// frontend consumer package. See the frontend's tsconfig for JSX support.
