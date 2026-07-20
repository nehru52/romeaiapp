import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { getUserByEmail, verifyUserCredentials, createUser, isOnboardingComplete } from "@/lib/auth/user-store";
import { AuthService } from "@/lib/saas-core/services/auth-service";

const authService = new AuthService();

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
        },
      },
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;
        if (!email || !password) {
          console.error("[authorize] Missing email or password");
          return null;
        }
        console.log("[authorize] Attempting login for:", email);
        try {
          const user = await verifyUserCredentials(email, password);
          if (!user) {
            console.error("[authorize] Invalid credentials for:", email);
            return null;
          }
          console.log("[authorize] Login success for:", email, "onboardingComplete:", user.onboardingComplete);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            onboardingComplete: user.onboardingComplete,
          };
        } catch (err: any) {
          console.error("[authorize] Error:", err.message, err.stack);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    async signIn({ user, account }) {
      // For Google sign-in: create user in our store if new
      if (account?.provider === "google" && user.email) {
        const existing = await getUserByEmail(user.email);
        if (!existing) {
          await createUser({
            email: user.email,
            password: crypto.randomUUID() + crypto.randomUUID(), // random unusable password
            name: user.name ?? user.email.split("@")[0]!,
          });
        }
        // Ensure AuthService has a session for onboarding tracking
        const googleUser = { googleId: account.providerAccountId, email: user.email!, name: user.name ?? "", picture: user.image ?? "" };
        const result = await authService.handleGoogleUser(googleUser);
        // Store the auth-service userId on the token for consistency
        (user as any).authServiceUserId = result.session.userId;
      }
      return true;
    },

    async jwt({ token, user, account, trigger, session }) {
      // On first sign-in, persist user info to token
      if (user) {
        token.userId = (user as any).authServiceUserId ?? user.id!;
        token.email = user.email!;
        token.name = user.name!;
        // Carry onboarding status from authorize result (no Supabase query needed)
        if ((user as any).onboardingComplete !== undefined) {
          token.onboardingComplete = (user as any).onboardingComplete;
        }
      }

      // On update(), refresh onboarding status from session data
      // (passed by completeOnboarding via update({ onboardingComplete: true }))
      // or from the authorize() result already in the token.
      // NEVER query Supabase here — the authorize() result is authoritative.
      if (token.userId && trigger === "update") {
        if (session?.onboardingComplete !== undefined) {
          token.onboardingComplete = session.onboardingComplete;
        }
        // If session didn't provide onboardingComplete, keep the token's existing value.
        // This avoids overwriting a correct authorize() result with a stale/failed Supabase query.
      }

      // Fallback: if token still has no onboardingComplete after all paths,
      // query Supabase ONCE as a last resort.
      if (token.userId && token.onboardingComplete === undefined) {
        try {
          token.onboardingComplete = await isOnboardingComplete(token.email as string);
        } catch { token.onboardingComplete = false; }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        (session as any).userId = token.userId as string;
        (session as any).onboardingComplete = token.onboardingComplete ?? false;
      }
      return session;
    },
  },
});
