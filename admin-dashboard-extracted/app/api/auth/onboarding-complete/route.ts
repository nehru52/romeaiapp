/**
 * POST /api/auth/onboarding-complete — Mark onboarding as done.
 * Explicit route to shadow Auth.js [...nextauth] catch-all.
 */
import { markOnboardingComplete } from "@/lib/auth/user-store";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Not authenticated." },
      { status: 401 },
    );
  }

  const ok = await markOnboardingComplete(session.user.id);
  if (!ok) {
    return NextResponse.json(
      { success: false, error: "Failed to update onboarding." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, data: { onboardingComplete: true } });
}
