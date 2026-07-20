/**
 * Hono middleware adapter for Auth.js v5.
 *
 * Replaces the old manual JWT/cookie parsing middleware.
 * Uses Auth.js's `auth()` to read the encrypted session cookie.
 *
 * Usage:
 *   import { requireAuth, optionalAuth, requireTenantAccess } from "@/lib/auth/hono-adapter";
 *   app.get("/api/dashboard", requireAuth, (c) => {
 *     const session = c.get("session"); // { sub, email, name }
 *   });
 */

import type { Context, Next } from "hono";
import { auth } from "@/auth";
import { AuthService } from "@/lib/saas-core/services/auth-service";

// Extend Hono's ContextVariableMap for type safety
declare module "hono" {
  interface ContextVariableMap {
    session: SessionPayload;
  }
}

export interface SessionPayload {
  sub: string;
  email: string;
  name: string;
}

// Shared AuthService instance — created once, not per request
const authService = new AuthService();

/**
 * requireAuth — rejects unauthenticated requests with 401.
 * Reads session from Auth.js encrypted cookie via `auth()`.
 */
export async function requireAuth(c: Context, next: Next): Promise<Response | void> {
  const session = await auth();

  if (!session?.user?.email) {
    return c.json(
      { success: false, error: "Authentication required. Please log in." },
      401,
    );
  }

  const userId = (session as any).userId as string ?? session.user.id!;

  c.set("session", {
    sub: userId,
    email: session.user.email!,
    name: session.user.name ?? "",
  });

  await next();
}

/**
 * Optional auth — sets session if user is logged in, but doesn't reject.
 * For routes that work both authenticated and unauthenticated.
 */
export async function optionalAuth(c: Context, next: Next): Promise<void> {
  const session = await auth();

  if (session?.user?.email) {
    const userId = (session as any).userId as string ?? session.user.id!;
    c.set("session", {
      sub: userId,
      email: session.user.email!,
      name: session.user.name ?? "",
    });
  }

  await next();
}

/**
 * requireTenantAccess — verifies the authenticated user owns the tenant.
 * Must be used AFTER requireAuth.
 */
export async function requireTenantAccess(c: Context, next: Next): Promise<Response | void> {
  const session = c.get("session");
  const tenantId = c.req.param("tenantId") ?? c.req.query("tenantId");

  if (!tenantId) {
    return c.json(
      { success: false, error: "Tenant ID is required." },
      400,
    );
  }

  // Check in-memory first, then Supabase
  let userTenants = authService.getUserTenants(session.sub);
  if (!userTenants.includes(tenantId)) {
    // Fall back to DB (handles server restarts, multiple instances)
    const dbTenants = await authService.getUserTenantsFromDB(session.sub);
    if (dbTenants.length > 0) {
      userTenants = dbTenants;
      // Sync back to memory
      for (const tid of dbTenants) {
        authService.linkTenant(session.sub, tid);
      }
    }
  }

  if (!userTenants.includes(tenantId)) {
    return c.json(
      { success: false, error: "Access denied. You do not own this tenant." },
      403,
    );
  }

  await next();
}

/**
 * Get the client IP for rate limiting.
 * Respects X-Forwarded-For for proxied deployments (Vercel, Cloudflare).
 */
export function getClientIP(c: Context): string {
  const forwarded = c.req.header("X-Forwarded-For");
  if (forwarded) {
    return forwarded.split(",")[0]!.trim();
  }
  return c.req.header("X-Real-IP") ?? "127.0.0.1";
}
