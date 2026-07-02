# Open-Source vs Paid API — Full Comparison

## How to read this

| Metric | What it means |
|--------|---------------|
| **Quality** | Output quality relative to paid option |
| **Cost at 70 agencies** | Monthly cost at scale |
| **Setup** | How hard to deploy and maintain |
| **Reliability** | Uptime, rate limits, support |
| **Verdict** | SWITCH / KEEP / HYBRID |

---

## 1. AI TEXT GENERATION

| | DeepSeek V4 Flash (paid) | Llama 4 (open, via Groq/Ollama) | Mistral Large 2 (open-weight) |
|---|---|---|---|
| **Quality** | ★★★★★ Best reasoning | ★★★★☆ Very good, slightly worse on structured output | ★★★★☆ Strong, better at creative writing |
| **Cost/1M tokens** | $0.14 in / $0.28 out | $0 (self-host) / $0.09 Groq | $0 (self-host) / $2-$8 via API |
| **Latency** | ~2s for blog | ~0.5s on Groq, ~8s self-hosted | ~3s |
| **Setup** | 1 API key | Docker + GPU or Groq API | Docker + GPU or Mistral API |
| **Reliability** | 99.9% uptime | Self-host: your problem. Groq: 99.5% | Self-host: your problem |
| **Verdict** | **KEEP** — Too cheap to replace, best quality | **FALLBACK** — Use as backup when DeepSeek is down | **SKIP** — Not worth the infra |

**Recommendation:** Keep DeepSeek. It costs $2/month at 70 agencies. Not worth a GPU server.

---

## 2. AI IMAGE GENERATION

### 2A. Photorealistic (replaces FLUX.2 Pro)

| | FLUX.2 Pro via Fal.ai | FLUX.1 Schnell (open-weight) | Stable Diffusion XL (open) | SD 3.5 Large (open-weight) |
|---|---|---|---|---|
| **Quality** | ★★★★★ | ★★★☆☆ (4-step, less detail) | ★★★☆☆ | ★★★★☆ (close to Pro) |
| **Cost/image** | $0.03 | $0.003 (Fal) / $0 (self-host) | $0 (self-host) | $0.002 (Fal) / $0 (self-host) |
| **Speed** | 2-4 seconds | ~1 second | 3-5 seconds | 5-10 seconds |
| **Setup** | 1 API key | Docker + RTX 4090 ($0.50/hr rented) | Docker + RTX 4090 or ComfyUI | Docker + RTX 4090 |
| **Reliability** | 99.9% | Self-host risks | Self-host risks | Self-host risks |
| **Verdict** | **HYBRID** — Pro for client posts, Schnell for drafts | **USE** as draft/preview tier | **SKIP** — SD 3.5 is better | **HYBRID** — Good free alt |

**Recommendation:** Two-tier system:
- **Draft/preview images:** FLUX Schnell via Fal.ai ($0.003/image)
- **Final published images:** FLUX.2 Pro via Fal.ai ($0.03/image)
- **Self-host only above 15,000 images/month** (breakeven on GPU rental)
- At 70 agencies × 30 images = 2,100 images/month: stay on Fal.ai

### 2B. Text-in-image (replaces Ideogram)

| | Ideogram 3.0 | SD 3.5 Medium (open) + Canva API | FLUX Dev + ControlNet |
|---|---|---|---|
| **Quality** | ★★★★★ Best text rendering | ★★★☆☆ Text often garbled | ★★★★☆ Good with ControlNet |
| **Cost/image** | $0.03-$0.06 | $0 (Canva free tier: 50 designs/mo) | $0.012 (Fal) |
| **Setup** | API key | Canva API (free) + SD for base image | Complex ControlNet pipeline |
| **Verdict** | **KEEP** — Nothing matches Ideogram on text | **HYBRID** — Simple text overlays go to Canva | **SKIP** — Too complex |

**Recommendation:** Use Canva API for simple text overlays (50 free/month), Ideogram only when AI text rendering is critical.

### 2C. UGC/Brand Assets (replaces Seedream + Imagen)

| | Seedream 4 (Fal) | FLUX.2 Dev (open-weight) + LoRA | SD 3.5 + IP-Adapter |
|---|---|---|---|
| **Quality** | ★★★★★ Best character consistency | ★★★★☆ With trained LoRA | ★★★☆☆ Less consistent |
| **Cost** | $0.03/image | $0.012/image (Fal) or self-host | Self-host |
| **Setup** | API key | Train LoRA per client (30 min, one-time) | Complex face-matching pipeline |
| **Verdict** | **HYBRID** — Seedream for new clients, LoRA for repeat | **GOOD** — One-time LoRA training saves ongoing costs | **SKIP** |

---

## 3. AI VIDEO GENERATION

| | Kling V3 (Fal.ai) | Stable Video Diffusion (open) | CogVideoX (open) | AnimateDiff (open) |
|---|---|---|---|---|
| **Quality** | ★★★★★ | ★★★☆☆ (4 sec max) | ★★★★☆ | ★★☆☆☆ |
| **Cost/video** | $0.84 (10 sec) | $0 (self-host, GPU cost ~$0.05) | $0 (self-host, GPU cost ~$0.08) | $0 (self-host) |
| **Length** | Up to 2 min | 4 seconds | 6 seconds | Variable |
| **Setup** | API key | Docker + RTX 4090 | Docker + RTX 4090 | ComfyUI + workflow |
| **Verdict** | **KEEP** but as add-on, not included | **SKIP** — Too limited | **MAYBE** — Promising but immature | **SKIP** |

**Recommendation:** Video costs dominate. Make it a paid add-on (charge $29/mo extra for video), not included in base tiers.

---

## 4. TREND DETECTION (replaces Apify)

| | Apify ($29-199/mo) | Firecrawl (open-core) | Crawlee (open-source) | Your own scraper |
|---|---|---|---|---|
| **Quality** | ★★★★★ | ★★★★☆ | ★★★☆☆ | ★★☆☆☆ (needs maintenance) |
| **Cost/mo** | $29-199 | $0 (self-host) / $19 (cloud) | $0 (self-host) | $0 (just proxy costs) |
| **Proxies** | Built-in, rotating | None (bring your own) | None (bring your own) | You buy proxies ($30/mo min) |
| **Setup** | 1 API key | Docker + Redis | npm install + proxy config | Build scraping infra |
| **Reliability** | Managed, no bans | You handle bans | You handle everything | You handle everything |
| **Verdict** | **KEEP** — Proxy infra alone costs more | **HYBRID** — Firecrawl for website analysis | **SKIP** — Too much maintenance | **NO** — Will eat your time |

**Recommendation:** Stick with Apify Free ($5 credit) for light use. Only upgrade when hitting limits. For website analysis during onboarding, use Firecrawl free tier (500 credits).

---

## 5. SOCIAL MEDIA SCHEDULING (replaces Zernio)

| | Zernio | Postiz (open-source) | n8n + platform APIs | Custom scheduler |
|---|---|---|---|---|
| **Quality** | ★★★★★ 15 platforms | ★★★☆☆ 6 platforms | ★★★☆☆ DIY workflows | ★★☆☆☆ |
| **Cost/account** | $1-6/mo | $0 (self-host) | $0 (self-host n8n) | $0 + dev time |
| **Setup** | API key | Docker + Postgres + Redis + config per platform | Docker + build workflows per platform | Weeks of dev |
| **Reliability** | Managed, 99.9% | You maintain it | You maintain it | You maintain it |
| **Maintenance** | Zero | High (platform API changes break things) | Very high | Nightmare |
| **Verdict** | **KEEP** — $1/account at scale is a steal | **SKIP** — Maintenance will kill you | **SKIP** — Not a scheduler | **NO** |

**Recommendation:** Zernio at $1/account (101+ tier) is the best deal in this stack. Do not build your own scheduler. Every platform API change will break it, and you will spend all your time fixing integrations instead of selling.

---

## 6. TEXT-TO-SPEECH (replaces ElevenLabs)

| | ElevenLabs | Piper TTS (open-source) | Coqui TTS (open-source) | Bark (open-source) |
|---|---|---|---|---|
| **Quality** | ★★★★★ | ★★★☆☆ (robotic) | ★★★★☆ (good, needs GPU) | ★★★☆☆ |
| **Cost** | $5-22/mo | $0 (CPU only) | $0 (needs GPU) | $0 (needs GPU) |
| **Latency** | <1 second | <0.5 second | 3-5 seconds | 10-30 seconds |
| **Voices** | 100+ cloned | 30+ pre-trained | Custom trainable | Few |
| **Verdict** | **KEEP** — $5/mo is less than the GPU cost for self-hosting | **BACKUP** — For basic voiceovers where quality does not matter | **SKIP** | **SKIP** |

**Recommendation:** Keep ElevenLabs Starter ($5/mo = 30K chars). Use Piper only for internal/testing.

---

## 7. DATABASE (replaces Supabase Pro)

| | Supabase Pro ($25) | Self-hosted Supabase (open-source) | PocketBase (open) | SQLite + Turso |
|---|---|---|---|---|
| **Quality** | ★★★★★ | ★★★★★ (same software) | ★★★☆☆ | ★★★☆☆ |
| **Cost** | $25/mo | $20-40/mo (VPS) | $5-10/mo VPS | $0 (Turso free: 9GB) |
| **Setup** | 2 minutes | Docker + config + backups + SSL + monitoring | Single binary, easy | Turso is managed |
| **Backups** | Automatic point-in-time | You set up and test | You set up | Managed |
| **Verdict** | **KEEP** — Free tier is enough for 70 agencies | **LATER** — At 500+ agencies consider self-hosting | **SKIP** — Not Postgres-compatible | **SKIP** — Not Postgres |

**Recommendation:** Stay on Supabase Free (500MB) until you hit the limit. At 70 agencies × 3-5MB each = 210-350MB — you are within free tier.

---

## 8. HOSTING

### Frontend (Vercel vs alternatives)

| | Vercel Pro ($20) | Cloudflare Pages (free) | Netlify (free) | Self-hosted Nginx |
|---|---|---|---|---|
| **Quality** | ★★★★★ | ★★★★☆ | ★★★★☆ | ★★★☆☆ |
| **Cost** | $20/mo | $0 (unlimited) | $0 (100GB bandwidth) | $5-20 VPS |
| **Setup** | Git push | Git push | Git push | Manual deploy |
| **Edge** | Global | Global (best) | Global | Single region |
| **Verdict** | **SWITCH** — Cloudflare Pages is free + faster CDN | **BEST** — Try this first | **OK** — Good fallback | **NO** |

**Recommendation:** Deploy to Cloudflare Pages first (free, faster CDN, unlimited bandwidth). Only switch to Vercel if you need ISR or serverless functions that Cloudflare Workers cannot handle.

### Backend (Fly.io vs alternatives)

| | Fly.io ($5-15) | Railway ($5-20) | Hetzner VPS ($4) | Cloudflare Workers ($0-5) |
|---|---|---|---|---|
| **Quality** | ★★★★☆ | ★★★★☆ | ★★★☆☆ | ★★★★☆ |
| **Cost** | $5-15/mo | $5-20/mo | $4/mo (fixed) | $0-5/mo |
| **Setup** | `fly deploy` | Git push | Manual (Docker + Nginx + SSL + ...) | `wrangler deploy` |
| **Scale to zero** | Yes (saves $) | No | No | Yes (automatic) |
| **Regions** | 35+ | 4 | 4 | Global (best) |
| **Verdict** | **KEEP** — Best balance of cost and DX | **OK** | **LATER** — At steady high load, Hetzner is cheapest | **MAYBE** — If you rewrite API for Workers |

**Recommendation:** Fly.io for now. At 70+ agencies with steady traffic, move to Hetzner VPS ($4-8/mo for 4GB RAM, no scale-to-zero needed because it is always on).

---

## 9. PAYMENTS (Stripe vs alternatives)

| | Stripe | Lemonsqueezy | Paddle | Open-source (Medusa/Vendure) |
|---|---|---|---|---|
| **Quality** | ★★★★★ | ★★★★☆ | ★★★★☆ | ★★★☆☆ |
| **Fees** | 2.9% + $0.30 | 5% + $0.50 | 5% + $0.50 | 0% (just payment processor fee) |
| **Tax handling** | Stripe Tax (extra) | Built-in (MoR) | Built-in (MoR) | You handle it |
| **Setup** | 2 hours | 30 minutes | 30 minutes | Days to weeks |
| **Verdict** | **KEEP** — Best API, lowest fees | **MAYBE** — If you want MoR (no tax headache) | **MAYBE** | **NO** |

**Recommendation:** Stripe. Lowest fees. The tax handling is worth learning.

---

## 10. EMAIL (SMTP/Resend vs alternatives)

| | Resend ($20/mo) | SendGrid (free 100/day) | Postmark ($15/mo) | Postal (open-source) |
|---|---|---|---|---|
| **Quality** | ★★★★★ | ★★★★☆ | ★★★★★ | ★★★☆☆ |
| **Cost** | $20/mo (50K emails) | $0 (100/day) | $15/mo (10K emails) | $0 + VPS ($5-10) |
| **Deliverability** | Excellent | Good (shared IPs) | Best in class | Your problem |
| **Setup** | DNS records | DNS records | DNS records | Docker + DNS + IP warmup |
| **Verdict** | **HYBRID** — SendGrid free for transactional, Resend for marketing | **USE** — Free tier for transactional | **SKIP** — Overkill at this scale | **LATER** — At 100K+ emails/month |

---

## SUMMARY — What To Switch To Open-Source

| Service | Current | Switch To | Savings/Month | When |
|---------|---------|-----------|---------------|------|
| Frontend hosting | Vercel $20 | **Cloudflare Pages $0** | $20 | Now |
| Blog thumbnails | FLUX Pro $0.03 | **Pollinations.ai $0** | $10 | Now |
| Text overlays | Ideogram $0.03 | **Canva API $0** (50 free) | $15 | Now |
| Image drafts | FLUX Pro $0.03 | **FLUX Schnell $0.003** | $45 | Now |
| Video | Kling included | **Kling as add-on $29** | $60 revenue | Now |
| Website scraping | Apify $29 | **Firecrawl free $0** | $29 | Now |
| Database | Supabase Pro $25 | **Supabase Free $0** | $25 | Keep until 500MB |
| Backend | Fly.io $15 | **Fly.io (keep)** | $0 | Revisit at 500+ agencies |
| TTS | ElevenLabs $22 | **ElevenLabs Starter $5** | $17 | Downgrade plan |
| Email | Resend $20 | **SendGrid free $0** | $20 | Now |

---

## WHAT TO NEVER SELF-HOST (no matter the scale)

1. **Social media scheduler** — Zernio's $1/account is cheaper than your dev time maintaining platform API integrations
2. **AI models (LLMs)** — DeepSeek costs $2/month. A GPU server costs $250/month minimum
3. **Payment processing** — Stripe's 2.9% is the cost of not handling PCI compliance yourself
4. **Email delivery** — IP reputation management is a full-time job. Use SendGrid/Resend
5. **OAuth/SSO** — Google OAuth is free and unlimited. Never build your own auth protocol

---

## THE $100/MONTH STACK (70 agencies, all optimized)

| Service | Cost |
|---------|------|
| DeepSeek V4 Flash (text) | $2 |
| FLUX Schnell (draft images) + Pro (finals) | $30 |
| Ideogram (critical text-in-image only) | $10 |
| Kling video (client-paid add-on) | $0 |
| ElevenLabs Starter | $5 |
| Apify Free + Firecrawl Free | $0 |
| Zernio (280 accounts at tiered pricing) | $240 |
| Supabase Free | $0 |
| Cloudflare Pages | $0 |
| Fly.io micro | $5 |
| SendGrid Free (transactional) | $0 |
| Google OAuth | $0 |
| Stripe (on revenue, not fixed) | ~$40 |
| **TOTAL** | **$332/month** |
| **Per agency** | **$4.74/month** |

This is the fully optimized stack. $4.74 per agency per month. Your lowest tier is $199/month. That is a **4,200% margin**.
