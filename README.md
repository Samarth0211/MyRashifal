# MyRashifal+

A premium Vedic astrology web app that generates personalized Kundli charts, daily horoscopes, compatibility matching, and AI-powered astrological reports — powered by real astronomical calculations and Claude AI interpretation.

**Live:** [my-rashifal.vercel.app](https://my-rashifal.vercel.app)

---

## Features

| Feature | Description |
|---------|-------------|
| **Janam Kundli** | North Indian style birth chart with accurate planetary positions using real ephemeris data |
| **Daily Rashifal** | Free daily horoscope for all 12 zodiac signs |
| **Premium Reports** | Career, Marriage, Health, Education, and Varshphal reports with deep AI interpretation |
| **Kundli Matching** | Gun Milan compatibility scoring for two birth charts |
| **Shubh Muhurat** | Auspicious date/time finder for events |
| **Ask Astrologer** | Chart-aware Q&A — first 5 questions free, then pay-per-question |
| **Multi-Language** | Full support for English, Hindi, and Marathi (Devanagari) |

## Architecture

```
User Input (birth details)
       │
       ▼
┌─────────────────────┐
│  astronomy-engine    │  ← Real ephemeris calculations (NOT AI-generated)
│  + Lahiri ayanamsa   │     Tropical → Sidereal conversion
│  + Equal house system│     Vimshottari Dasha from Moon's nakshatra
└────────┬────────────┘
         │ Pre-calculated planetary data
         ▼
┌─────────────────────┐
│  Claude AI (Sonnet)  │  ← Interprets pre-calculated positions only
│  Structured output   │     Never calculates astronomical data
└────────┬────────────┘
         │ Structured JSON (6 personality sections, yogas, dasha)
         ▼
┌─────────────────────┐
│  React Frontend      │  ← Renders sectioned report with North Indian chart
│  Dark mystical theme │
└─────────────────────┘
```

**Key design decision:** LLMs hallucinate numbers — all planetary positions, nakshatras, dashas, and ascendants are computed mathematically using the `astronomy-engine` library. Claude is used *only* for interpreting pre-calculated data.

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14 (App Router), React 18, Tailwind CSS |
| **Backend** | Next.js API Routes (server-side only) |
| **AI** | Claude Sonnet (reports) + Claude Haiku (Q&A) via Anthropic API |
| **Astronomy** | `astronomy-engine` — real ephemeris with Lahiri ayanamsa |
| **Auth** | NextAuth.js v5 with Google OAuth + JWT sessions |
| **Database** | MongoDB Atlas with Row Level Security |
| **Payments** | Razorpay (order creation + HMAC signature verification) |
| **Security** | AES-256 (Fernet) encryption for cloud credentials |
| **Deployment** | Vercel (frontend) + MongoDB Atlas (database) |

## Calculations

- **Planetary positions:** Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Rahu/Ketu via `astronomy-engine`
- **Ayanamsa:** Lahiri (23.85306° at J2000.0 + 50.2888"/year precession)
- **House system:** Equal house from Lagna (Ascendant)
- **Dasha:** Vimshottari from Moon's nakshatra lord + balance calculation
- **Manglik check:** Mars placement in houses 1, 2, 4, 7, 8, 12
- **Geocoding:** 100+ Indian cities with lat/lon/timezone + fuzzy matching

## Getting Started

```bash
# Clone and install
git clone https://github.com/Samarth0211/MyRashifal.git
cd MyRashifal
npm install

# Configure environment
cp .env.example .env.local
# Fill in: CLAUDE_API_KEY, MONGODB_URI, Google OAuth, Razorpay keys

# Run
npm run dev
```

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `CLAUDE_API_KEY` | Anthropic API key (server-only) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth credentials |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Razorpay payment keys |
| `NEXTAUTH_SECRET` | NextAuth encryption key (random 32+ chars) |
| `NEXTAUTH_URL` | App base URL |

## License

MIT
