import Link from 'next/link';
import { RASHIS } from '@/lib/constants';
import { callClaude, parseClaudeJSON, HAIKU_MODEL } from '@/lib/claude';
import { getDailyRashifalPrompt } from '@/lib/prompts';
import { notFound } from 'next/navigation';
import RashifalClientSection from './RashifalClientSection';
import AdBanner from '@/components/AdBanner';
import InArticleAd from '@/components/InArticleAd';

// Revalidate every 12 hours — Claude called once per rashi per cycle
export const revalidate = 43200;

// Hindi transliterated slugs for SEO
const SLUG_MAP = {
  mesh: 'Aries', vrishabh: 'Taurus', mithun: 'Gemini', kark: 'Cancer',
  singh: 'Leo', kanya: 'Virgo', tula: 'Libra', vrishchik: 'Scorpio',
  dhanu: 'Sagittarius', makar: 'Capricorn', kumbh: 'Aquarius', meen: 'Pisces',
  // English slugs also work
  aries: 'Aries', taurus: 'Taurus', gemini: 'Gemini', cancer: 'Cancer',
  leo: 'Leo', virgo: 'Virgo', libra: 'Libra', scorpio: 'Scorpio',
  sagittarius: 'Sagittarius', capricorn: 'Capricorn', aquarius: 'Aquarius', pisces: 'Pisces',
};

function getRashi(slug) {
  const nameEn = SLUG_MAP[slug.toLowerCase()];
  if (!nameEn) return null;
  return RASHIS.find((r) => r.nameEn === nameEn);
}

export async function generateStaticParams() {
  // Generate both Hindi and English slugs
  const hindiSlugs = ['mesh', 'vrishabh', 'mithun', 'kark', 'singh', 'kanya', 'tula', 'vrishchik', 'dhanu', 'makar', 'kumbh', 'meen'];
  const englishSlugs = RASHIS.map((r) => r.id);
  return [...hindiSlugs, ...englishSlugs].map((rashi) => ({ rashi }));
}

async function fetchDailyRashifal(rashiName) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { system, user } = getDailyRashifalPrompt(rashiName, today, 'en');
    const response = await callClaude(system, user, 2000, HAIKU_MODEL);
    return parseClaudeJSON(response);
  } catch (error) {
    console.error(`Failed to fetch rashifal for ${rashiName}:`, error);
    return null;
  }
}

export default async function RashiPage({ params }) {
  const { rashi: slug } = await params;
  const rashi = getRashi(slug);
  if (!rashi) notFound();

  const rashifal = await fetchDailyRashifal(rashi.nameEn);
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  // Extract Hindi name without parentheses for display
  const hindiName = rashi.nameHi.split('(')[0].trim();

  // Other rashis for navigation
  const otherRashis = RASHIS.filter((r) => r.id !== rashi.id);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Breadcrumbs */}
      <nav className="text-sm mb-8 text-text-secondary">
        <Link href="/" className="hover:text-gold-primary no-underline">Home</Link>
        <span className="mx-2">›</span>
        <Link href="/rashifal" className="hover:text-gold-primary no-underline">Rashifal</Link>
        <span className="mx-2">›</span>
        <span className="text-text-primary">{rashi.nameEn}</span>
      </nav>

      {/* Header */}
      <header className="text-center mb-10">
        <span className="text-7xl block mb-4">{rashi.symbol}</span>
        <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-2">
          {rashi.nameEn} Rashifal Today — {hindiName} राशिफल
        </h1>
        <p className="text-text-secondary text-lg">{today}</p>
        <p className="text-text-secondary text-sm mt-1">
          {rashi.dateRange} · Ruler: {rashi.ruler} · Element: {rashi.element}
        </p>
      </header>

      {/* SSR Rashifal Content — this is what Google will crawl */}
      {rashifal ? (
        <article>
          {/* Overall Rating */}
          <div className="text-center mb-8">
            <p className="text-text-secondary text-sm mb-1">Overall Rating</p>
            <div className="text-gold-primary text-2xl" aria-label={`${rashifal.overallRating} out of 5 stars`}>
              {'★'.repeat(rashifal.overallRating || 3)}
              {'☆'.repeat(5 - (rashifal.overallRating || 3))}
            </div>
          </div>

          {/* General Prediction */}
          {rashifal.general && (
            <section className="card-mystical mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">☉</span>
                <h2 className="font-heading text-lg font-bold text-gold-primary">
                  Today&apos;s {rashi.nameEn} Horoscope
                </h2>
              </div>
              <p className="text-text-primary text-sm leading-relaxed">{rashifal.general}</p>
            </section>
          )}

          {/* Detailed Sections */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {[
              { title: 'Career & Work', content: rashifal.career, icon: '💼', h: `${rashi.nameEn} Career Horoscope` },
              { title: 'Love & Relationships', content: rashifal.love, icon: '❤️', h: `${rashi.nameEn} Love Horoscope` },
              { title: 'Health & Wellness', content: rashifal.health, icon: '🏥', h: `${rashi.nameEn} Health Horoscope` },
              { title: 'Finance & Money', content: rashifal.finance, icon: '💰', h: `${rashi.nameEn} Finance Horoscope` },
            ].map((section) => (
              <section key={section.title} className="card-mystical">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{section.icon}</span>
                  <h2 className="font-heading text-lg font-bold text-gold-primary">{section.h}</h2>
                </div>
                <p className="text-text-primary text-sm leading-relaxed">{section.content}</p>
              </section>
            ))}
          </div>

          {/* Lucky Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="card-mystical text-center">
              <p className="text-text-secondary text-xs mb-1">Lucky Number</p>
              <p className="text-gold-light text-2xl font-bold">{rashifal.luckyNumber}</p>
            </div>
            <div className="card-mystical text-center">
              <p className="text-text-secondary text-xs mb-1">Lucky Color</p>
              <p className="text-gold-light text-lg font-bold">{rashifal.luckyColor}</p>
            </div>
            <div className="card-mystical text-center">
              <p className="text-text-secondary text-xs mb-1">Lucky Time</p>
              <p className="text-gold-light text-sm font-bold">{rashifal.luckyTime}</p>
            </div>
          </div>

          {/* Tip */}
          {rashifal.tip && (
            <div className="highlight-box text-center mb-8">
              <p className="text-text-secondary text-xs mb-1">Tip of the Day</p>
              <p className="text-gold-light text-sm">{rashifal.tip}</p>
            </div>
          )}
        </article>
      ) : (
        <div className="card-mystical text-center py-12 mb-8">
          <p className="text-text-secondary">Today&apos;s rashifal is being prepared. Please check back shortly.</p>
        </div>
      )}

      <InArticleAd className="max-w-2xl mx-auto" />

      {/* Ad — between daily content and period switcher */}
      <AdBanner format="auto" className="max-w-2xl mx-auto" />

      {/* Client-side period switcher for weekly/monthly/yearly */}
      <RashifalClientSection rashiNameEn={rashi.nameEn} rashiSymbol={rashi.symbol} />

      {/* SEO Content Block — static text Google will index */}
      <section className="mt-12 mb-8">
        <h2 className="font-heading text-xl font-bold text-gold-primary mb-4">
          About {rashi.nameEn} ({hindiName}) Rashi
        </h2>
        <div className="text-text-secondary text-sm leading-relaxed space-y-3">
          <p>
            <strong>{rashi.nameEn}</strong> ({hindiName} राशि) is the {RASHIS.indexOf(rashi) + 1}{['st','nd','rd'][RASHIS.indexOf(rashi)] || 'th'} sign of the Vedic zodiac, spanning the dates {rashi.dateRange}. It is a {rashi.element} sign ruled by <strong>{rashi.ruler}</strong>.
          </p>
          <p>
            The daily {rashi.nameEn} rashifal on MyRashifal+ is generated using AI-powered analysis that considers current planetary transits. Unlike generic horoscopes, our predictions factor in the actual astronomical positions of all 9 Vedic planets (Navagraha) including Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, and Ketu.
          </p>
          <p>
            For a more personalized prediction based on your exact birth chart, try our free <Link href="/kundli" className="text-gold-primary hover:underline">Janam Kundli</Link> generator which computes your Ascendant (Lagna), Nakshatra, Vimshottari Dasha periods, and Manglik status using real astronomical ephemeris data.
          </p>
        </div>
      </section>

      {/* CTA */}
      <div className="text-center p-6 card-mystical mb-10">
        <p className="text-text-secondary text-sm mb-3">
          Want deeper insights based on your exact birth chart?
        </p>
        <Link href="/kundli" className="btn-gold no-underline inline-block">
          Generate Free Kundli
        </Link>
      </div>

      {/* Other Rashis Navigation — internal links for SEO */}
      <nav className="mt-8">
        <h2 className="font-heading text-lg font-bold text-gold-primary mb-4 text-center">
          Rashifal for Other Signs
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {otherRashis.map((r) => {
            const hindiSlug = r.nameHi.match(/\(([^)]+)\)/)?.[1]?.toLowerCase();
            return (
              <Link
                key={r.id}
                href={`/rashifal/${hindiSlug || r.id}`}
                className="card-mystical text-center py-3 px-2 hover:border-gold-primary/30 transition-colors no-underline"
              >
                <span className="text-2xl block mb-1">{r.symbol}</span>
                <span className="text-text-primary text-xs font-medium block">{r.nameEn}</span>
                <span className="text-text-secondary text-[10px] block">{r.nameHi.split('(')[0].trim()}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
