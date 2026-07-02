/**
 * API client for saas-core backend.
 * All dashboard pages call this to interact with the workflow engine.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

let offlineMode = false;
let lastHealthCheck = 0;
const HEALTH_CHECK_INTERVAL = 30_000; // Retry every 30 seconds

async function tryReconnect(): Promise<boolean> {
  const now = Date.now();
  if (now - lastHealthCheck < HEALTH_CHECK_INTERVAL) return false;
  lastHealthCheck = now;
  try {
    const res = await fetch(`${API_BASE}/api/health`, {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.success) {
        console.log("[api] Backend reconnected! Switching to live mode.");
        offlineMode = false;
        return true;
      }
    }
  } catch {
    /* still offline */
  }
  return false;
}

async function request<T>(
  path: string,
  options?: { method?: string; body?: unknown; token?: string },
): Promise<T | null> {
  // If offline, try to reconnect before giving up
  if (offlineMode) {
    const reconnected = await tryReconnect();
    if (!reconnected) return null;
  }

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: options?.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...(options?.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error((err as { error?: string }).error ?? "Request failed");
    }
    return res.json() as Promise<T>;
  } catch (_e) {
    // Backend not running — switch to demo mode silently
    if (!offlineMode)
      console.log("[demo] API unavailable, running in demo mode");
    offlineMode = true;
    return null;
  }
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: { total: number; page: number; limit: number };
}

// ── Auth ──────────────────────────────────────────────────────────

export async function loginWithGoogle(code: string, redirectUri: string) {
  return request<
    ApiResponse<{
      session: { userId: string; email: string; name: string; avatar: string };
      isNewUser: boolean;
      nextStep: string;
    }>
  >("/api/auth/google", {
    method: "POST",
    body: { code, redirectUri },
  });
}

// ── Onboarding ────────────────────────────────────────────────────

export async function selectNiche(
  userId: string,
  niche: string,
  packSlug?: string,
) {
  return request<
    ApiResponse<{
      onboarding: unknown;
      pack: unknown;
      nextStep: string;
    }>
  >("/api/onboarding/niche", {
    method: "POST",
    body: { userId, niche, packSlug },
  });
}

export async function submitWebsite(userId: string, url: string) {
  return request<
    ApiResponse<{
      analysis: unknown;
      tenant: unknown;
      nextStep: string;
    }>
  >("/api/onboarding/website", {
    method: "POST",
    body: { userId, url },
  });
}

// ── Dashboard ─────────────────────────────────────────────────────

export async function getDashboard(userId: string) {
  return request<
    ApiResponse<{
      session: unknown;
      onboarding: unknown;
      tenants: Array<{ id: string; name: string; slug: string; tier: string }>;
      platforms: Array<{
        id: string;
        platform: string;
        postsPerDay: number;
        duration: string;
        status: string;
        totalPosts: number;
      }>;
      notifications: unknown[];
      pendingNotifications: number;
    }>
  >(`/api/dashboard/${userId}`);
}

// ── Platforms ─────────────────────────────────────────────────────

export async function setupPlatform(params: {
  userId: string;
  tenantId: string;
  platform: string;
  postsPerDay: number;
  duration: string;
  startDate: string;
  apiKey: string;
}) {
  return request<ApiResponse<unknown>>("/api/platforms/setup", {
    method: "POST",
    body: params,
  });
}

export async function getPlatformSetups(tenantId: string) {
  return request<ApiResponse<unknown[]>>(`/api/platforms/${tenantId}`);
}

// ── Packs ─────────────────────────────────────────────────────────

export async function getPacks() {
  return request<
    ApiResponse<
      Array<{
        slug: string;
        name: string;
        description: string;
        icon: string;
        exampleBusinesses: string[];
        featured: boolean;
      }>
    >
  >("/api/packs");
}

// ── Content ───────────────────────────────────────────────────────

export async function generateContent(params: {
  userId: string;
  tenantId: string;
  platform: string;
  count: number;
  topic?: string;
}) {
  return request<ApiResponse<unknown>>("/api/content/generate", {
    method: "POST",
    body: params,
  });
}

export async function getContent(
  tenantId: string,
  filter?: { status?: string },
) {
  const query = filter?.status ? `?status=${filter.status}` : "";
  return request<ApiResponse<unknown[]>>(`/api/content/${tenantId}${query}`);
}

// ── Notifications ────────────────────────────────────────────────

export async function setNotificationPrefs(params: {
  userId: string;
  channels: string;
  email?: string;
  phone?: string;
}) {
  return request<ApiResponse<unknown>>("/api/notifications/prefs", {
    method: "POST",
    body: params,
  });
}

export async function getContentById(id: string) {
  return request<
    ApiResponse<{
      id: string;
      tenantId: string;
      type: string;
      title: string;
      body: string;
      excerpt: string;
      platform: string;
      category: string;
      status: string;
      imageUrls: string[];
      scheduledAt: string | null;
      publishedAt: string | null;
      createdAt: string;
      generatedBy: string;
    }>
  >(`/api/content/item/${id}`);
}

export async function updateContentStatus(id: string, status: string) {
  return request<ApiResponse<unknown>>(`/api/content/${id}/status`, {
    method: "PATCH",
    body: { status },
  });
}

export async function approveContent(userId: string, contentId: string) {
  return request<ApiResponse<unknown>>("/api/notifications/approve", {
    method: "POST",
    body: { userId, contentId },
  });
}
