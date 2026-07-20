/**
 * GET /api/auth/session — returns the current Supabase session.
 * Used by the client to check auth state from Supabase directly.
 */
import { createServerSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session) {
    return NextResponse.json({ session: null, user: null }, { status: 200 });
  }

  return NextResponse.json({
    session: {
      access_token: data.session.access_token,
      expires_at: data.session.expires_at,
    },
    user: {
      id: data.session.user.id,
      email: data.session.user.email,
    },
  });
}
