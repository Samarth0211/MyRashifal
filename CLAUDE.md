# CLAUDE.md — MyRashifal+ Project Guide

## Project Overview
MyRashifal+ is a premium personalized Vedic astrology web app. Users input birth details and receive accurate Kundli charts, daily Rashifal, premium reports, Kundli matching, Shubh Muhurat, and ask-a-question features. Payments are handled via Razorpay.

## Tech Stack
- **Framework:** Next.js 14 (App Router) with `src/` directory
- **Styling:** Tailwind CSS (dark mystical theme: navy `#0a0a2e` + gold `#d4a017`)
- **Fonts:** Playfair Display (headings), Lato (body), Tiro Devanagari Hindi (Sanskrit)
- **AI:** Claude Sonnet 4 API — called ONLY from server-side API routes, NEVER from client
- **Astronomy:** `astronomy-engine` npm package for real ephemeris calculations
- **Payments:** Razorpay (server-side SDK for order creation + signature verification)
- **Auth:** NextAuth.js v5 (Auth.js) with Google OAuth + JWT sessions
- **Database:** MongoDB Atlas (serverless free tier) via `mongodb` driver + `@auth/mongodb-adapter`
- **Storage:** MongoDB (logged-in users) + ephemeral React state (anonymous users)
- **i18n:** Custom React Context + translation dictionaries (EN/HI/MR) — no heavy library
- **Deployment:** Hostinger KVM VPS (`82.25.110.57`) — Next.js via systemd (`myrashifal.service`) behind Nginx, HTTPS via certbot. Self-hosted MongoDB 8.0. See `deploy/` and the Deployment section below. (Migrated off Vercel 2026-09-29.)

## Critical Architecture Rule
**Never use Claude (or any LLM) to calculate astronomical positions.** LLMs hallucinate numbers. All planetary positions, house placements, nakshatras, dashas, and ascendant are computed mathematically using `astronomy-engine` with Lahiri ayanamsa. Claude is used ONLY for **interpretation** of pre-calculated data.

### Calculation Pipeline
1. `findCity()` in `src/lib/cities.js` → geocode birth place to lat/lon/timezone
2. `calculateKundli()` in `src/lib/astro-calc.js` → astronomy-engine computes tropical longitudes for Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Rahu/Ketu, and Ascendant
3. Lahiri ayanamsa applied → tropical converted to sidereal positions
4. Sidereal positions → signs, nakshatras, padas, house numbers (Equal house from Lagna)
5. Vimshottari Dasha calculated from Moon's nakshatra position
6. Manglik Dosha checked from Mars house placement
7. Pre-calculated data sent to Claude → structured interpretation (6 personality sections, yogas, dasha interpretation)

## Project Structure
```
myrashifal/
├── src/
│   ├── app/
│   │   ├── layout.jsx            # Root layout, fonts, Razorpay script, AuthProvider wrapper
│   │   ├── page.jsx              # Landing page (hero, pricing, testimonials)
│   │   ├── globals.css           # Theme colors, animations, report-section styles, print styles
│   │   ├── kundli/page.jsx       # Birth form → Kundli dashboard (structured sections, legacy normalization)
│   │   ├── reports/page.jsx      # Premium reports marketplace (loads from DB + localStorage)
│   │   ├── matching/page.jsx     # Kundli matching (Gun Milan)
│   │   ├── muhurat/page.jsx      # Shubh Muhurat finder
│   │   ├── rashifal/page.jsx     # Daily free rashifal for 12 signs
│   │   ├── ask/page.jsx          # Ask a question (paid)
│   │   ├── auth/signin/page.jsx  # Custom Google sign-in page
│   │   ├── blog/
│   │   │   ├── posts.js           # Blog post data (4 SEO articles — content + metadata)
│   │   │   ├── page.jsx           # Blog listing page (card grid)
│   │   │   ├── layout.js          # Blog listing SEO metadata
│   │   │   └── [slug]/
│   │   │       ├── page.jsx       # Dynamic blog post page (markdown-like renderer)
│   │   │       └── layout.js      # Dynamic SEO metadata via generateMetadata()
│   │   ├── sitemap.js             # Dynamic XML sitemap (static routes + blog posts)
│   │   ├── robots.js              # Dynamic robots.txt (allow /, disallow /api/ /auth/)
│   │   └── api/
│   │       ├── auth/[...nextauth]/ # NextAuth API route (Google OAuth)
│   │       ├── generate-kundli/  # Real calculations + Claude interpretation + DB save
│   │       ├── generate-report/  # Premium report generation + DB caching
│   │       ├── kundli-matching/  # Both charts calculated, Claude scores gun milan
│   │       ├── muhurat/          # Claude finds auspicious dates
│   │       ├── daily-rashifal/   # Daily horoscope with in-memory cache
│   │       ├── ask-question/     # Chart-based Q&A
│   │       ├── create-order/     # Razorpay order creation
│   │       ├── verify-payment/   # Razorpay HMAC signature verification + DB purchase save
│   │       ├── user/data/        # GET: fetch user's kundli, purchases, reports, questionCount from DB
│   │       ├── cron/daily-rashifal/ # Vercel cron job — sends daily rashifal emails via Resend
│   │       ├── newsletter/       # POST: subscribe/unsubscribe to daily email newsletter
│   │       └── notify/           # Push notification API
│   ├── translations/
│   │   ├── index.js              # Registry: { en, hi, mr } + SUPPORTED_LANGS list
│   │   ├── en.js                 # English strings (~380 keys, dot-notation)
│   │   ├── hi.js                 # Hindi translations (Devanagari)
│   │   └── mr.js                 # Marathi translations (Devanagari)
│   ├── contexts/
│   │   └── LanguageContext.jsx   # LanguageProvider + useLanguage() hook + t() function
│   ├── components/
│   │   ├── Navbar.jsx            # Fixed top nav, mobile hamburger, UserMenu, LanguageToggle
│   │   ├── Footer.jsx            # Links, disclaimer (uses t() for all strings)
│   │   ├── LanguageToggle.jsx    # Compact EN|हिं|मर toggle (in Navbar + mobile menu)
│   │   ├── TestModeBadge.jsx     # Floating test mode badge (only when rzp_test_ key)
│   │   ├── BirthForm.jsx         # Birth form with user-scoped profile save/load (auth-gated)
│   │   ├── KundliChart.jsx       # North Indian style SVG birth chart
│   │   ├── PlanetTable.jsx       # Planet positions table with dignity colors
│   │   ├── PaymentButton.jsx     # Full Razorpay checkout flow + auth gate + test mode hint
│   │   ├── ReportCard.jsx        # Report card with payment integration
│   │   ├── RashiCard.jsx         # Zodiac sign card
│   │   ├── PricingCards.jsx      # Free vs Premium comparison
│   │   ├── Testimonials.jsx      # Auto-rotating testimonial carousel
│   │   ├── LoadingScreen.jsx     # Zodiac spinner with cycling messages
│   │   ├── AuthProvider.jsx      # NextAuth SessionProvider wrapper (client component)
│   │   └── UserMenu.jsx          # Signed-in user avatar + dropdown menu
│   ├── Route-level layout.js files (SEO metadata for client component pages):
│   │   ask/, blog/, blog/[slug]/, download/, kundli/, matching/, muhurat/, rashifal/, reports/
│   └── lib/
│       ├── astro-calc.js         # Real astronomical calculations (astronomy-engine)
│       ├── cities.js             # 100+ Indian cities with lat/lon/timezone
│       ├── claude.js             # Server-side Claude API helper + JSON parser
│       ├── prompts.js            # All prompt templates (interpretation-only)
│       ├── razorpay.js           # Server-side Razorpay instance
│       ├── constants.js          # Rashis, planets, pricing, nakshatras
│       ├── storage.js            # localStorage helpers (profiles: user-scoped, kundli: no-op)
│       ├── mongodb.js            # MongoDB connection singleton (HMR-safe)
│       ├── auth.js               # NextAuth v5 config (Google provider, MongoDB adapter, JWT)
│       └── db.js                 # MongoDB CRUD helpers (kundlis, purchases, reports)
```

## Environment Variables
```
CLAUDE_API_KEY            — Anthropic API key (server-only, NEVER expose to client)
RAZORPAY_KEY_SECRET       — Razorpay secret (server-only, NEVER expose to client)
NEXT_PUBLIC_RAZORPAY_KEY_ID — Razorpay key ID (safe for client, needed for checkout popup)
NEXT_PUBLIC_APP_NAME      — App display name
NEXT_PUBLIC_MERCHANT_NAME — Merchant name for Razorpay popup
MONGODB_URI               — MongoDB Atlas connection string (server-only)
GOOGLE_CLIENT_ID          — Google OAuth client ID (server-only)
GOOGLE_CLIENT_SECRET      — Google OAuth client secret (server-only)
NEXTAUTH_SECRET           — NextAuth encryption key (server-only, random 32+ char string)
NEXTAUTH_URL              — App base URL (http://localhost:3000 in dev)
RESEND_API_KEY            — Resend email service API key (server-only, for newsletter cron)
CRON_SECRET               — Vercel cron job auth token (server-only, must match vercel.json)
RESEND_FROM_EMAIL         — Sender email for newsletter (default: MyRashifal+ <rashifal@myrashifal.in>)
NEXT_PUBLIC_GA_ID         — Google Analytics 4 measurement ID (e.g. G-3XMMCWHB7Q)
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION — Google Search Console verification tag
```

## Key Commands
```bash
npm run dev      # Start dev server on localhost:3000
npm run build    # Production build
npm start        # Start production server
```

## Important Implementation Details

### Authentication (NextAuth.js v5)
- Google OAuth sign-in via `next-auth@beta` with `@auth/mongodb-adapter`
- JWT session strategy (no server-side session storage needed)
- `src/lib/auth.js` exports `{ handlers, auth, signIn, signOut }`
- Session callback injects `userId` into session object
- Custom sign-in page at `/auth/signin` with themed Google button
- **Auth gate:** `PaymentButton` checks session before initiating payment — this is the single enforcement point for all paid features. If not signed in, clicking "Unlock" triggers `signIn('google')` instead of payment.
- Free features (kundli generation, daily rashifal) work without sign-in

### MongoDB Collections
```
users          — { _id, name, email, image, emailVerified }    (managed by NextAuth)
accounts       — { userId, provider, providerAccountId, ... }  (managed by NextAuth)
sessions       — { sessionToken, userId, expires }             (managed by NextAuth)
kundlis        — { userId, birthDetails, planets, houses, ... } (upserted per user)
purchases      — { userId, reportType, paymentId, amount, ... } (one per purchase)
reports        — { userId, reportType, reportData, ... }        (upserted per user+type)
questions      — { userId, question, answer, isFree, paymentId, createdAt } (ask astrologer)
subscribers    — { email, name, rashi, lang, token, active, createdAt } (newsletter)
```
- `src/lib/db.js` provides CRUD functions: `saveKundliToDB`, `getKundliFromDB`, `savePurchaseToDB`, `getPurchasesFromDB`, `hasPurchase`, `saveReportToDB`, `getReportFromDB`, `getAllReportsFromDB`, `saveQuestionToDB`, `countUserQuestions`, `getUserQuestionHistory`, `getActiveSubscribers`, `updateLastEmailSent`
- `src/lib/mongodb.js` provides `clientPromise` singleton with HMR-safe global caching
- `GET /api/user/data` returns user's kundli, purchases, reports, and questionCount from DB (requires auth)

### Data Persistence Strategy
- **Logged-in users:** All data (kundli, purchases, reports) stored in MongoDB only. No localStorage for kundli.
- **Anonymous users:** Kundli exists only in React state (ephemeral — gone on page refresh). No persistence at all.
- **Saved profiles:** User-scoped localStorage keys (`myrashifal_profiles_<userId>`). Only available to logged-in users. Profile save/load UI is hidden for anonymous users.
- **Old data cleanup:** `clearOldKundliCache()` and `clearOldProfilesCache()` run on mount to remove stale shared localStorage entries from before per-user isolation was added.
- Reports page loads kundli, purchases, and reports from `/api/user/data` for logged-in users.
- `generate-report` API checks DB for cached report before calling Claude (saves API costs).

### Razorpay Payment Flow
1. Client clicks "Unlock" → calls `POST /api/create-order` with amount in paise
2. Backend creates Razorpay order → returns `orderId`
3. Client opens Razorpay checkout popup with `orderId`
4. User pays (UPI/card/netbanking) → Razorpay returns payment details
5. Client calls `POST /api/verify-payment` with `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`
6. Backend verifies HMAC SHA256 signature → returns `verified: true/false`
7. On success → report is generated and displayed

### Claude API Usage
- Default model: `claude-sonnet-4-20250514` (for reports, kundli, matching, muhurat)
- Ask Astrologer uses `claude-haiku-4-5-20251001` (cheaper per question)
- `callClaude(systemPrompt, userPrompt, maxTokens, model)` — 4th param overrides model
- All calls go through `src/lib/claude.js` `callClaude()` function
- JSON responses are parsed with `parseClaudeJSON()` which handles markdown wrapping and truncated JSON
- System prompt tells Claude to INTERPRET pre-calculated data, never recalculate

### Kundli Interpretation Format
The generate-kundli API returns **structured sections** (not a single wall of text):
```json
{
  "personalitySections": [
    { "title": "Lagna & Core Personality", "content": "..." },
    { "title": "Moon Sign & Emotional Nature", "content": "..." },
    { "title": "Key Planetary Influences", "content": "..." },
    { "title": "Career & Wealth Indicators", "content": "..." },
    { "title": "Relationships & Marriage", "content": "..." },
    { "title": "Strengths & Life Challenges", "content": "..." }
  ],
  "dashaInterpretation": "...",
  "yogas": [{ "name": "...", "present": true, "description": "..." }]
}
```
The kundli page uses `report-section` CSS class with gold left borders and astronomical symbol icons per section. A `normalizeKundliData()` function handles backward compatibility with old cached data that used a single `personality` string.

### JSON Parser Robustness
The `parseClaudeJSON()` function handles:
- Markdown ` ```json ``` ` wrapping
- Truncated JSON (when max_tokens is hit) via bracket/brace repair
- Regex-based field extraction from raw text as last resort (extracts personality, dashaInterpretation separately)
- Falls back to a minimal valid object rather than crashing

### Astronomy Calculations (`astro-calc.js`)
- Tropical longitudes from `astronomy-engine` (Sun, Moon, 5 planets)
- Rahu/Ketu from mean lunar node formula
- Lahiri ayanamsa: 23.85306° at J2000.0 + 50.2888"/year precession
- Ascendant from local sidereal time + birth latitude
- Equal house system (house N = Lagna sign + N-1)
- Vimshottari Dasha from Moon's nakshatra lord + balance calculation
- Manglik check: Mars in houses 1, 2, 4, 7, 8, 12

### City Geocoding (`cities.js`)
- 100+ Indian cities with coordinates and IST timezone
- Alias support (Bombay→Mumbai, Madras→Chennai, etc.)
- Fuzzy matching (exact → starts-with → contains)
- Falls back to center of India (22°N, 78°E) if city not found

## Pricing
| Feature | Price |
|---------|-------|
| Kundli + Personality | Free |
| Daily Rashifal | Free |
| Career Report | ₹49 |
| Marriage Report | ₹79 |
| Health Report | ₹49 |
| Varshphal Report | ₹149 |
| Education Report | ₹49 |
| Complete Bundle | ₹299 |
| Kundli Matching | ₹79 |
| Shubh Muhurat | ₹29 |
| Ask a Question | First 5 free, then ₹29 |

### Ask Astrologer Feature
- **Free tier:** First 5 questions free for logged-in users (tracked in `questions` collection)
- **Paid tier:** ₹29 per question after free limit (Razorpay payment required)
- **Model:** Claude Haiku 4.5 (`claude-haiku-4-5-20251001`) — cheaper than Sonnet for Q&A
- **Auth required:** Users must sign in to ask questions (server-side enforcement)
- **Kundli required:** Loads from DB via `/api/user/data` (not localStorage)
- **Flow:** Sign in → Form → (free: direct submit / paid: PaymentButton) → Loading → Answer
- **Server-side validation:** `POST /api/ask-question` checks auth, counts questions, enforces free limit
- **Question history:** Saved to MongoDB `questions` collection with `isFree` flag
- **UI:** Green badge showing "{count} free questions remaining", transitions to price display at 0

## SEO & Analytics

### Metadata & Structured Data
- Root `layout.jsx` has comprehensive Next.js metadata: `metadataBase`, title template (`%s | MyRashifal+`), OG tags, Twitter cards, robots directives, canonical URL
- JSON-LD schemas in `<head>`: WebSite, Organization, SoftwareApplication, FAQPage (6 Q&As)
- Route-level `layout.js` files export unique metadata for each page (needed because all `page.jsx` are client components)
- Blog posts have dynamic metadata via `generateMetadata()` in `blog/[slug]/layout.js`

### Sitemap & Robots
- `src/app/sitemap.js` — Dynamic sitemap with 9 static routes + all blog posts from `posts.js`
- `src/app/robots.js` — Allows `/`, disallows `/api/`, `/auth/`, `/unsubscribe`
- Both are Next.js dynamic route handlers (no static files needed)

### Google Analytics 4
- GA4 tag conditionally rendered in root layout when `NEXT_PUBLIC_GA_ID` env var is set
- Uses `next/script` with `strategy="afterInteractive"`
- Measurement ID: `G-3XMMCWHB7Q`

### Google Search Console
- Verification via `<meta name="google-site-verification">` tag from `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` env var
- Sitemap submitted at `https://myrashifal.in/sitemap.xml`

### IndexNow
- Key file at `public/782382e11cd1b9d7624cf9051b49d951.txt` for Bing/Yandex URL submission
- Used for instant indexing of new blog posts and pages

## Blog Section

### Architecture
- Static blog with content in `src/app/blog/posts.js` (no CMS, no markdown files)
- Each post is a JS object: `{ slug, title, description, date, readTime, keywords, content }`
- Blog listing at `/blog`, individual posts at `/blog/[slug]`
- Custom `renderContent()` in `page.jsx` handles markdown-like syntax: `##` headings, `|` tables, `>` blockquotes, `**bold**`, `[links](url)`, numbered/bulleted lists

### Current Articles (4)
1. "What is Kundli?" — targets "what is kundli", "how to read kundli"
2. "Aaj Ka Rashifal Kaise Padhe" — Hindi search terms, Hinglish content
3. "Kundli Matching Gun Milan Guide" — targets "gun milan", "kundli matching"
4. "27 Nakshatras Explained" — targets "nakshatras", "birth star"

### Adding New Posts
Add a new object to the `posts` array in `posts.js`. It will automatically appear on the blog listing page, get its own `/blog/<slug>` URL with full SEO metadata, and be included in `sitemap.xml`.

## Newsletter & Email (Cron)

### Daily Rashifal Email
- Vercel cron job at `api/cron/daily-rashifal` runs at `30 1 * * *` UTC (7:00 AM IST)
- Configured in `vercel.json` with `CRON_SECRET` for auth
- Uses **Resend** email service (`resend` npm package) with lazy init via `getResend()`
- Groups subscribers by rashi+lang to minimize Claude API calls
- Generates rashifal per group, sends personalized HTML emails
- Env checks: returns 500 early if `RESEND_API_KEY` or `CRON_SECRET` missing

### Newsletter Subscribe/Unsubscribe
- `POST /api/newsletter` — subscribe with email, name, rashi, lang
- Unsubscribe link in every email with unique token
- Subscribers stored in MongoDB `subscribers` collection

## UI Design Notes
- Kundli results page inspired by AstroSage/AstroTalk — clean sectioned layout, not a wall of text
- Each personality section has a gold left border (`report-section` class), astronomical icon, and Playfair Display heading
- Yogas rendered as individual cards with gold left accent borders
- Dasha period uses side-by-side Mahadasha/Antardasha cards with separate interpretation section
- Manglik status uses color-coded indicator (red = present, green = absent)

## Multi-Language Support (EN / HI / MR)

### Translation System
- Simple React Context + flat key-value dictionaries (no next-intl or i18next)
- `t('nav.home')` → "Home" / "होम" / "मुख्यपृष्ठ"
- `t('reports.subtitle', { name: 'Priya' })` → interpolation with `{param}` placeholders
- Falls back to English if key missing; console warning in dev
- Language persisted to `localStorage` under `myrashifal_lang`, defaults to `en`

### Translation Keys
- ~380 keys in dot-notation: `nav.home`, `kundli.title`, `form.fullName`, `pricing.career`
- Files: `src/translations/en.js`, `hi.js`, `mr.js`, `index.js`
- Astrological terms (Rashi, Nakshatra, Dasha, Yoga) stay in Sanskrit/Hindi across all languages

### AI Content Language
- Each API route accepts `lang` from the client request body/query
- `src/lib/prompts.js` has `LANG_INSTRUCTIONS` and `getLangInstruction(lang)` helper
- All prompt functions accept `lang = 'en'` param, prepend "Respond entirely in Hindi/Marathi (Devanagari)" instruction
- Constants: `RASHIS` and `PLANETS` have `nameMr` field; `getRashiName(rashi, lang)` and `getPlanetName(planet, lang)` helpers

### Language Toggle UI
- Compact button group in Navbar: `[EN] [हिं] [मर]`
- Active language highlighted with gold accent
- In both desktop nav and mobile hamburger menu

## Razorpay Test Mode
- When `NEXT_PUBLIC_RAZORPAY_KEY_ID` starts with `rzp_test_`:
  - **TestModeBadge**: Floating blue "Test Mode" badge in bottom-left corner with expandable test card details
  - **PaymentButton**: Inline "Test mode" hint below each payment button with card details
- Test card: `4111 1111 1111 1111`, any future expiry, any 3-digit CVV
- Test UPI: `success@razorpay`
- Both auto-hide when live Razorpay keys are used

## Mobile Responsiveness
- `@media (hover: none)` disables card/button hover transforms on touch devices (prevents tap-jump)
- `@media (max-width: 640px)` tighter card padding (1rem), report-section padding (1rem), highlight-box padding
- Devanagari text: `word-break: break-word; overflow-wrap: break-word` on `.font-hindi`, `[lang="hi"]`, `[lang="mr"]`
- Touch targets: LanguageToggle min 44px, Navbar mobile links min 48px height, Testimonials dots larger
- PlanetTable: hides Nakshatra/Dignity columns on mobile (`hidden sm:table-cell`), has `overflow-x-auto`
- Responsive grids: Rashifal lucky section `grid-cols-1 sm:grid-cols-3`, hero title `text-4xl sm:text-5xl md:text-7xl`
- Footer links `gap-3 sm:gap-6` for mobile spacing

## Public Assets
- `public/og-image.png` — OpenGraph image (1200x630) used in social sharing
- `public/782382e11cd1b9d7624cf9051b49d951.txt` — IndexNow key file for Bing/Yandex
- `public/logo.ico`, `public/icon-512.png` — Favicon and PWA icon
- `public/manifest.json` — PWA manifest
- `public/sw.js` — Service worker (registered via Script tag in root layout)

## Deployment (Hostinger VPS)
Migrated off Vercel to a Hostinger KVM VPS on 2026-09-29. Full runbook and templates live in `deploy/` (see `deploy/README.md`).

- **Host:** Hostinger VPS `srv1610377.hstgr.cloud` (`82.25.110.57`), Ubuntu + systemd, Node.js 22 at `/usr/bin/node`.
- **Domain:** `https://myrashifal.in` (apex + www), HTTPS via Let's Encrypt/certbot with auto-renewal. Nginx reverse-proxies to the app.
- **App runtime:** systemd service `myrashifal.service` runs `next start --hostname 127.0.0.1 --port 3100` as the `myrashifal` user. **Not PM2.**
  - Restart: `sudo systemctl restart myrashifal`
  - Status/logs: `systemctl status myrashifal` · `journalctl -u myrashifal`
- **Releases:** each release lives at `/opt/myrashifal/releases/<release-id>`; `/opt/myrashifal/current` symlinks the active one.
- **Deploy flow:** transfer the working tree (incl. untracked app files; exclude `.git`, `.next`, `node_modules`, `.vercel`, local env files, ad media) to a new release dir → `npm ci` → `npm run build` (needs prod env present; `NEXT_PUBLIC_*` are embedded at build time) → repoint `current` → `sudo systemctl restart myrashifal`. Rollback = repoint `current` to the previous release + restart.
- **Env:** production env at `/opt/myrashifal/shared/.env.production.local` (mode 600, owned by `myrashifal`), symlinked into the release. `NEXTAUTH_URL`/`AUTH_URL` = `https://myrashifal.in`. Do NOT transfer `VERCEL_OIDC_TOKEN`.
- **Database:** MongoDB 8.0 runs on the VPS, bound to `127.0.0.1:27017` with auth (app user has read/write on `myrashifal` only). Launched fresh on 2026-09-29 — old Atlas data was not migrated. Daily local backups at 20:30 UTC (retain 14) in `/var/backups/myrashifal` (`deploy/backup.cjs` + backup timer); an off-server copy is still needed.
- **Scheduled jobs:** the former Vercel crons run as systemd timers (`deploy/generate-timers.cjs` builds them from `vercel.json`, in UTC). Timers are installed but the eight outbound automation timers are disabled by default — enable only when their outbound behavior (email/push/Instagram) is approved.
- **Smoke check:** `node deploy/smoke.cjs` verifies local pages, built assets, DB auth, public auth URLs, Panchang, and rejected unauthenticated API requests — without sending outbound communications.

## Disclaimer
Every report page includes the legal disclaimer that this is for spiritual guidance and entertainment purposes only, not a substitute for professional advice.
