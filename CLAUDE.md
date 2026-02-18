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
│   │       └── user/data/        # GET: fetch user's kundli, purchases, reports from DB
│   ├── components/
│   │   ├── Navbar.jsx            # Fixed top nav, mobile hamburger, UserMenu
│   │   ├── Footer.jsx            # Links, disclaimer
│   │   ├── BirthForm.jsx         # Birth form with user-scoped profile save/load (auth-gated)
│   │   ├── KundliChart.jsx       # North Indian style SVG birth chart
│   │   ├── PlanetTable.jsx       # Planet positions table with dignity colors
│   │   ├── PaymentButton.jsx     # Full Razorpay checkout flow + auth gate
│   │   ├── ReportCard.jsx        # Report card with payment integration
│   │   ├── RashiCard.jsx         # Zodiac sign card
│   │   ├── PricingCards.jsx      # Free vs Premium comparison
│   │   ├── Testimonials.jsx      # Auto-rotating testimonial carousel
│   │   ├── LoadingScreen.jsx     # Zodiac spinner with cycling messages
│   │   ├── AuthProvider.jsx      # NextAuth SessionProvider wrapper (client component)
│   │   └── UserMenu.jsx          # Signed-in user avatar + dropdown menu
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
```
- `src/lib/db.js` provides CRUD functions: `saveKundliToDB`, `getKundliFromDB`, `savePurchaseToDB`, `getPurchasesFromDB`, `hasPurchase`, `saveReportToDB`, `getReportFromDB`, `getAllReportsFromDB`
- `src/lib/mongodb.js` provides `clientPromise` singleton with HMR-safe global caching
- `GET /api/user/data` returns user's kundli, purchases, and reports from DB (requires auth)

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
- Model: `claude-sonnet-4-20250514`
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
| Ask a Question | ₹29 |

## UI Design Notes
- Kundli results page inspired by AstroSage/AstroTalk — clean sectioned layout, not a wall of text
- Each personality section has a gold left border (`report-section` class), astronomical icon, and Playfair Display heading
- Yogas rendered as individual cards with gold left accent borders
- Dasha period uses side-by-side Mahadasha/Antardasha cards with separate interpretation section
- Manglik status uses color-coded indicator (red = present, green = absent)

## Disclaimer
Every report page includes the legal disclaimer that this is for spiritual guidance and entertainment purposes only, not a substitute for professional advice.
