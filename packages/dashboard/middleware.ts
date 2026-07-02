import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Route protection middleware.
 * Redirects unauthenticated users from /dashboard/* to /auth.
 * Public routes (/, /auth, /auth/callback, /login, /niche, /website) are always allowed.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes that don't need authentication
  const publicPaths = [
    "/",
    "/auth",
    "/auth/callback",
    "/login",
    "/niche",
    "/website",
    "/_next",
    "/favicon.ico",
  ];
  if (
    publicPaths.some(
      (p) =>
        pathname === p ||
        pathname.startsWith(`${p}/`) ||
        pathname.startsWith("/_next"),
    )
  ) {
    return NextResponse.next();
  }

  // Allow static assets
  if (pathname.includes(".")) return NextResponse.next();

  // Dashboard and other protected routes require a session cookie
  const sessionCookie = request.cookies.get("userId")?.value;
  if (!sessionCookie) {
    // In demo mode, localStorage handles auth — allow pass-through
    // In production, redirect to /auth
    const isProduction = process.env.NODE_ENV === "production";
    if (isProduction) {
      const authUrl = new URL("/auth", request.url);
      authUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(authUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
