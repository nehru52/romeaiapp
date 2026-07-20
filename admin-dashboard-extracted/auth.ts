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
      console.log("[jwt] trigger:", trigger, "hasUser:", !!user, "token.onboardingComplete:", token.onboardingComplete, "session?.onboardingComplete:", session?.onboardingComplete);
      // On first sign-in, persist user info to token
      if (user) {
        token.userId = (user as any).authServiceUserId ?? user.id!;
        token.email = user.email!;
        token.name = user.name!;
        console.log("[jwt] user.id:", user.id, "user.onboardingComplete:", (user as any).onboardingComplete);
        // Carry onboarding status from authorize result (no Supabase query needed)
        if ((user as any).onboardingComplete !== undefined) {
          token.onboardingComplete = (user as any).onboardingComplete;
          console.log("[jwt] set token.onboardingComplete from user:", token.onboardingComplete);
        } else {
          console.log("[jwt] user.onboardingComplete is undefined — Auth.js may have stripped it");
        }
      }

      // On update(), refresh onboarding status from session data
      if (token.userId && trigger === "update") {
        if (session?.onboardingComplete !== undefined) {
          token.onboardingComplete = session.onboardingComplete;
          console.log("[jwt] update: set token.onboardingComplete from session:", token.onboardingComplete);
        } else {
          console.log("[jwt] update: no session data, keeping existing:", token.onboardingComplete);
        }
      }

      // Fallback: if token still has no onboardingComplete after all paths
      if (token.userId && token.onboardingComplete === undefined) {
        console.log("[jwt] fallback: token.onboardingComplete undefined, querying Supabase");
        try {
          token.onboardingComplete = await isOnboardingComplete(token.email as string);
          console.log("[jwt] fallback: Supabase returned:", token.onboardingComplete);
        } catch { console.log("[jwt] fallback: Supabase query failed"); token.onboardingComplete = false; }
      }

      console.log("[jwt] returning token.onboardingComplete:", token.onboardingComplete);
      return token;
    },

    async session({ session, token }) {
      console.log("[session] token.onboardingComplete:", token.onboardingComplete);
      if (session.user) {
        session.user.id = token.userId as string;
        (session as any).userId = token.userId as string;
        (session as any).onboardingComplete = token.onboardingComplete ?? false;
      }
      console.log("[session] session.onboardingComplete:", (session as any).onboardingComplete);
      return session;
    },
  },
});
