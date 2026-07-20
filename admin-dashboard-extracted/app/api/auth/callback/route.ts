/**
 * GET/POST /api/auth/callback — Supabase Auth callback handler.
 * Exchanges the auth code for a session and syncs with Auth.js.
 */
import { createServerSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no-code`);
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] Exchange error:", error.message);
    return NextResponse.redirect(`${origin}/login?error=auth-failed`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
