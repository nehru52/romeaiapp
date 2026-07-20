# Next Session Continuation Guide

**Date:** 2026-07-19
**Project:** Rome AI App (romeaiapp)
**What changed:** Complete auth refactor + Agent-Reach OpenCLI stabilization + SaaS extraction

---

## What Was Done This Session

### 1. Auth System Complete Rewrite
- Replaced mock Google OAuth with **real token exchange** (`lib/auth/google.ts`)
- Added **JWT httpOnly session cookies** — XSS-proof (`lib/auth/jwt.ts`, `lib/auth/session.ts`)
- Added **scrypt password hashing** with configurable cost parameter (`lib/auth/password.ts`)
- Added **rate limiting** on all auth endpoints (`lib/auth/rate-limit.ts`)
- Added **requireAuth + requireTenantAccess** middleware (`lib/auth/middleware.ts`)
- All env vars required — **no hardcoded values** (`lib/auth/env.ts`)
- Frontend switched from localStorage to **httpOnly cookie** session (`lib/auth-context.tsx`)

### 2. API Router Rewritten
- All `/api/auth/*` endpoints use real auth
- Protected routes use `requireAuth` middleware
- `requireTenantAccess` verifies tenant ownership
- CORS configured for credentials

### 3. Agent-Reach Bridge Enhanced
- OpenCLI probe/wake/ensure chain added
- Auto-detects Chrome extension state (ready/sleeping/missing)
- Auto-wakes sleeping extension on first scrape
- 4 channels promoted from mock to real when OpenCLI is ready

### 4. SaaS Package Extracted
- Created standalone `rome-saas/` package at `/home/abiilesh/Documents/social media/rome-saas/`
- Depends on `@elizaos/core` as npm peer dependency
- 49 files, 15 services, 6 industry packs
- Migration guide in `rome-saas/MIGRATION.md`

---

## What To Do Next Session

### Step 1: Install New Dependencies

```bash
cd "/home/abiilesh/Documents/social media/romeaiapp/admin-dashboard-extracted"
bun add jose
```

### Step 2: Generate Secrets

```bash
# Generate JWT secret
openssl rand -hex 32
# Copy the output — this is your AUTH_JWT_SECRET

# Generate a random session cookie name (optional, default is fine)
```

### Step 3: Set Up Google OAuth (if using Google login)

1. Go to https://console.cloud.google.com
2. Create a project (or use existing)
3. APIs & Services > Credentials > Create Credentials > OAuth client ID
4. Application type: **Web application**
5. Name: "Rome AI App (dev)"
6. Authorized redirect URIs:
   - `http://localhost:3000/auth/callback`
   - `https://yourdomain.com/auth/callback` (production)
7. Copy the **Client ID** and **Client Secret**

### Step 4: Fill In .env.local

```bash
cd "/home/abiilesh/Documents/social media/romeaiapp/admin-dashboard-extracted"
cp .env.example .env.local
# Edit .env.local — fill in all values
```

Minimum required for local dev:
```
AUTH_JWT_SECRET=<output from step 2>
AUTH_GOOGLE_CLIENT_ID=<from step 3>
AUTH_GOOGLE_CLIENT_SECRET=<from step 3>
AUTH_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback
NEXT_PUBLIC_AUTH_GOOGLE_CLIENT_ID=<same as AUTH_GOOGLE_CLIENT_ID>
NEXT_PUBLIC_APP_URL=http://localhost:3000
DEEPSEEK_API_KEY=<your DeepSeek API key>
```

### Step 5: Run the App

```bash
cd "/home/abiilesh/Documents/social media/romeaiapp/admin-dashboard-extracted"
bun run dev
```

Visit http://localhost:3000

### Step 6: Verify Auth Works

1. **Email signup:** Create an account with email + password
2. **Email login:** Log out and log back in
3. **Google login:** Click "Login with Gmail" (requires Google OAuth setup from step 3)
4. **Protected routes:** Try accessing `/dashboard` while logged out — should redirect to `/login`
5. **API protection:** Try `curl http://localhost:3000/api/dashboard` without cookie — should get 401
6. **Rate limiting:** Submit wrong password 10+ times — should get 429

---

## Known Gaps (Still TODO)

### Immediate
- [ ] **Website analysis is still mock** — wire up `WebsiteScraper` (Firecrawl) in `auth-service.ts:analyzeWebsite()`
- [ ] **In-memory user store** — replace with Supabase persistence. Users/sessions lost on restart
- [ ] **Email delivery** — reset codes currently logged to console. Wire up Resend/SendGrid
- [ ] **Password confirmation field** — add to signup form

### Medium-term
- [ ] **Database-backed sessions** — store sessions in Postgres, not memory Maps
- [ ] **Email verification** — send verification email on signup, require before login
- [ ] **2FA** — add TOTP-based two-factor auth
- [ ] **OAuth providers** — add GitHub, Microsoft, Apple
- [ ] **Session revocation** — ability to log out specific devices

### Integration
- [ ] **OpenCLI install** — follow steps in the analysis above to unlock 4 real data channels
- [ ] **OpenMontage CLI calls** — replace duplicated video/image workflow code with actual OpenMontage tool calls
- [ ] **pixovid face swap** — add endpoint to call pixovid backend for personalized content
- [ ] **elizaOS extraction** — finish extracting SaaS layer from fork per `rome-saas/MIGRATION.md`

---

## File Map — Where Everything Is

```
romeaiapp/admin-dashboard-extracted/
├── lib/auth/                     ← NEW — complete auth module
│   ├── env.ts                    # All env vars, validated, no hardcoded
│   ├── jwt.ts                    # JWT sign/verify with jose
│   ├── password.ts               # scrypt hash/verify
│   ├── google.ts                 # REAL Google OAuth token exchange
│   ├── middleware.ts             # requireAuth, requireTenantAccess
│   ├── session.ts                # httpOnly cookie set/clear
│   ├── rate-limit.ts             # Token bucket rate limiter
│   └── index.ts                  # Barrel export
├── lib/auth-context.tsx           ← REWRITTEN — httpOnly cookies
├── lib/saas-core/
│   ├── api/router.ts             ← REWRITTEN — protected endpoints
│   ├── services/auth-service.ts  ← REWRITTEN — real auth
│   └── services/agent-reach-bridge.ts ← ENHANCED — OpenCLI probe
├── app/login/page.tsx            ← FIXED — no hardcoded client ID
└── .env.example                  ← NEW — all required vars

rome-saas/                         ← NEW — extracted SaaS package
├── MIGRATION.md                   # Guide for removing fork dependency
├── README.md
├── package.json
├── tsconfig.json
└── src/                           # 49 files, 15 services, 6 packs
```

---

## Quick Reference: Auth Architecture

```
User → Login Page → Google OAuth URL
         │                │
         │                ▼
         │         Google Consent Screen
         │                │
         │                ▼
         │         /auth/callback?code=...
         │                │
         │                ▼
         │         POST /api/auth/google
         │                │
         │         ┌──────┴──────┐
         │         │  exchangeCode() │ ← REAL fetch to oauth2.googleapis.com
         │         │  decodeIdToken()│ ← Validate aud, iss, exp
         │         └──────┬──────┘
         │                │
         │         ┌──────┴──────┐
         │         │  AuthService  │
         │         │  .handleGoogleUser()
         │         └──────┬──────┘
         │                │
         │         ┌──────┴──────┐
         │         │  signSessionToken()│ ← JWT with jose
         │         │  setSessionCookie()│ ← httpOnly, Secure, SameSite=Lax
         │         └──────┬──────┘
         │                │
         ▼                ▼
    Email/Password → POST /api/auth/email/login
         │                │
         ▼                ▼
    ┌──────────────────────────────┐
    │  Response:                   │
    │  Set-Cookie: session=<jwt>   │
    │  Body: { userId, name, ... } │
    └──────────────────────────────┘
                │
                ▼
         Frontend stores nothing
         Browser sends cookie on every request
                │
                ▼
         requireAuth middleware
         → reads cookie
         → verifySessionToken()
         → injects c.set("session", payload)
         → route handler uses c.get("session").sub as userId
```

---

## Agent-Reach: Quick OpenCLI Setup

To switch 4 channels (Instagram, Reddit, Twitter, Facebook) from mock to real data:

```bash
# 1. Install OpenCLI
npm install -g @jackwener/opencli

# 2. Install Chrome extension
# Open: https://chromewebstore.google.com/detail/opencli/ildkmabpimmkaediidaifkhjpohdnifk

# 3. Log into these sites in Chrome:
#    instagram.com, reddit.com, x.com, facebook.com

# 4. Verify
opencli daemon status
# Expected: Daemon: running | Extension: connected

# 5. Restart dashboard — bridge auto-detects OpenCLI
cd admin-dashboard-extracted && bun run dev
```

After this, `agentReachBridge.getOpenCLIChannelCount()` returns 4, and all
Instagram/Reddit/Twitter/Facebook scrapes produce real data.
