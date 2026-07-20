/**
 * Combined middleware — Auth.js session check + Supabase session refresh.
 *
 * 1. Auth.js middleware guards /dashboard/* and /onboarding routes.
 * 2. Supabase session refresh keeps the Supabase auth cookie fresh.
 */
import { auth } from "@/auth";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // ── Supabase session refresh ────────────────────────────────────────
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // Refresh the Supabase session (no-op if no session exists)
  await supabase.auth.getSession();

  // ── Auth.js route guard ──────────────────────────────────────────────
  const session = await auth();

  // Protected routes
  const isProtected =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/onboarding");

  if (isProtected && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding",
    // Also run on auth callback to refresh Supabase session
    "/api/auth/callback",
  ],
};
