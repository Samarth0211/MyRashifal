import Script from 'next/script';
import { RASHIS } from '@/lib/constants';

const SLUG_MAP = {
  mesh: 'Aries', vrishabh: 'Taurus', mithun: 'Gemini', kark: 'Cancer',
  singh: 'Leo', kanya: 'Virgo', tula: 'Libra', vrishchik: 'Scorpio',
  dhanu: 'Sagittarius', makar: 'Capricorn', kumbh: 'Aquarius', meen: 'Pisces',
  aries: 'Aries', taurus: 'Taurus', gemini: 'Gemini', cancer: 'Cancer',
  leo: 'Leo', virgo: 'Virgo', libra: 'Libra', scorpio: 'Scorpio',
  sagittarius: 'Sagittarius', capricorn: 'Capricorn', aquarius: 'Aquarius', pisces: 'Pisces',
};

function getRashi(slug) {
  const nameEn = SLUG_MAP[slug?.toLowerCase()];
  if (!nameEn) return null;
  return RASHIS.find((r) => r.nameEn === nameEn);
}

export async function generateMetadata({ params }) {
  const { rashi: slug } = await params;
  const rashi = getRashi(slug);
  if (!rashi) return { title: 'Rashifal Not Found' };

  const hindiName = rashi.nameHi.split('(')[0].trim();
  const hindiSlug = rashi.nameHi.match(/\(([^)]+)\)/)?.[1]?.toLowerCase() || rashi.id;
  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  return {
    title: `${rashi.nameEn} Rashifal Today (${hindiName} राशिफल) — ${today}`,
    description: `Today's ${rashi.nameEn} (${hindiName}) Rashifal: daily horoscope predictions for career, love, health & finance. Free ${rashi.nameEn} horoscope based on Vedic astrology. ${rashi.dateRange}.`,
    keywords: `${rashi.nameEn.toLowerCase()} rashifal, ${hindiSlug} rashifal, ${rashi.nameEn.toLowerCase()} horoscope today, ${hindiName} राशिफल, ${rashi.nameEn.toLowerCase()} daily horoscope, aaj ka ${hindiSlug} rashifal, ${hindiSlug} rashi, ${rashi.nameEn.toLowerCase()} zodiac predictions`,
    alternates: { canonical: `https://myrashifal.in/rashifal/${hindiSlug}` },
    openGraph: {
      title: `${rashi.nameEn} (${hindiName}) Rashifal Today — Free Daily Horoscope`,
      description: `Free daily ${rashi.nameEn} rashifal with career, love, health & finance predictions. Based on Vedic astrology.`,
      url: `https://myrashifal.in/rashifal/${hindiSlug}`,
      type: 'article',
      siteName: 'MyRashifal+',
    },
    twitter: {
      card: 'summary',
      title: `${rashi.nameEn} Rashifal Today — ${hindiName} राशिफल`,
      description: `Daily ${rashi.nameEn} horoscope: career, love, health & finance predictions.`,
    },
  };
}

export default async function RashiLayout({ children, params }) {
  const { rashi: slug } = await params;
  const rashi = getRashi(slug);
  if (!rashi) return children;

  const hindiName = rashi.nameHi.split('(')[0].trim();
  const hindiSlug = rashi.nameHi.match(/\(([^)]+)\)/)?.[1]?.toLowerCase() || rashi.id;
  const today = new Date().toISOString().split('T')[0];

  const horoscopeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${rashi.nameEn} (${hindiName}) Rashifal Today`,
    description: `Daily horoscope predictions for ${rashi.nameEn} (${hindiName} Rashi) — career, love, health, and finance.`,
    datePublished: today,
    dateModified: today,
    author: { '@type': 'Organization', name: 'MyRashifal+', url: 'https://myrashifal.in' },
    publisher: {
      '@type': 'Organization',
      name: 'MyRashifal+',
      logo: { '@type': 'ImageObject', url: 'https://myrashifal.in/icon-512.png' },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://myrashifal.in/rashifal/${hindiSlug}` },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://myrashifal.in' },
      { '@type': 'ListItem', position: 2, name: 'Rashifal', item: 'https://myrashifal.in/rashifal' },
      { '@type': 'ListItem', position: 3, name: `${rashi.nameEn} Rashifal`, item: `https://myrashifal.in/rashifal/${hindiSlug}` },
    ],
  };

  return (
    <>
      <Script id="horoscope-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(horoscopeJsonLd) }} />
      <Script id="breadcrumb-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {children}
    </>
  );
}
