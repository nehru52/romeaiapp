/**
 * POST /api/auth/email/signup — Email + password user creation.
 * Explicit route to shadow Auth.js [...nextauth] catch-all.
 */
import { createUser, getUserByEmail } from "@/lib/auth/user-store";
import { rateLimitByIP } from "@/lib/auth/rate-limit";
import { AuthService } from "@/lib/saas-core/services/auth-service";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

const authService = new AuthService();

export async function POST(request: Request) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? headersList.get("x-real-ip")
    ?? "127.0.0.1";
  const rl = rateLimitByIP(ip, "signup");
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many signup attempts. Try again later." },
      { status: 429 },
    );
  }

  try {
    const { email, password, name } = await request.json();

    if (!email?.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Valid email is required." },
        { status: 400 },
      );
    }
    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists." },
        { status: 409 },
      );
    }
    if (!password || password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters." },
        { status: 400 },
      );
    }
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      return NextResponse.json({
        success: false,
        error: "Password must include uppercase, number, and symbol.",
      }, { status: 400 });
    }

    const user = await createUser({ email, password, name });
    authService.ensureSession(user.id, user.email, user.name);

    return NextResponse.json({
      success: true,
      data: {
        userId: user.id,
        name: user.name,
        email: user.email,
        onboardingComplete: false,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message ?? "Signup failed." },
      { status: 400 },
    );
  }
}
