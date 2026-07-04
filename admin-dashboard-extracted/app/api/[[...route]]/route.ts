/**
 * Vercel serverless API route handler.
 * Proxies all /api/* requests to the saas-core Hono router.
 *
 * This replaces the standalone Bun.serve() server for Vercel deployment.
 */

import { Hono } from "hono";

// Dynamic import to avoid Bun-specific server.ts code
// We import the router directly, not the server entry point
const { saasRouter } = await import(
  "@/lib/saas-core/api/router"
);

// Initialize the user store on first request (cold start)
let initialized = false;
async function ensureInit() {
  if (initialized) return;
  const { initUserStore } = await import("@/lib/saas-core/api/router");
  await initUserStore();
  initialized = true;
}

const app = new Hono();

// Health check (shorter path for Vercel)
app.get("/api/health", (c) => {
  return c.json({
    success: true,
    data: {
      status: "healthy",
      version: "1.0.0-beta.0",
      runtime: "vercel-serverless",
    },
  });
});

// Mount the saas-core router
app.route("/", saasRouter);

// Vercel HTTP handler
export const GET = async (req: Request) => {
  await ensureInit();
  return app.fetch(req);
};
export const POST = async (req: Request) => {
  await ensureInit();
  return app.fetch(req);
};
export const PATCH = async (req: Request) => {
  await ensureInit();
  return app.fetch(req);
};
export const DELETE = async (req: Request) => {
  await ensureInit();
  return app.fetch(req);
};
export const PUT = async (req: Request) => {
  await ensureInit();
  return app.fetch(req);
};
export const OPTIONS = async (req: Request) => {
  return app.fetch(req);
};
