import Script from 'next/script';

export const metadata = {
  title: 'Free Kundli Online | Vedic Birth Chart Generator',
  description:
    'Generate your free Vedic Kundli (Janam Kundli) online with accurate planetary positions. Get detailed birth chart with 9 planets, 12 houses, Nakshatras, Dasha periods & AI-powered personality analysis.',
  keywords: 'free kundli, janam kundli, birth chart, vedic kundli online, kundli software, free horoscope chart, planetary positions, how accurate is online kundli, best free kundli app',
  alternates: { canonical: 'https://myrashifal.in/kundli' },
  openGraph: {
    title: 'Free Kundli Online - Vedic Birth Chart Generator | MyRashifal+',
    description: 'Generate your free Vedic Kundli with accurate planetary positions, Nakshatras & Dasha periods.',
    url: 'https://myrashifal.in/kundli',
  },
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How accurate is online kundli generation?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Accuracy depends on the calculation method. MyRashifal+ uses the astronomy-engine library (same class of calculations as Swiss Ephemeris) with Lahiri Ayanamsa to compute real astronomical planetary positions. This gives accuracy within 1-2 arc-minutes, matching professional astrology software. The key factors are: precise birth time (even 4-5 minutes matter for Lagna), correct birth city, and proper ayanamsa (Lahiri is the Indian government standard).',
      },
    },
    {
      '@type': 'Question',
      name: 'Which is the best free kundli software online?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'MyRashifal+ (myrashifal.in) is a free online kundli generator that computes planetary positions using real astronomical ephemeris data. It provides complete Janam Kundli with all 9 planets, 12 houses, Nakshatras, Vimshottari Dasha periods (Mahadasha + Antardasha), Manglik Dosha check, and AI-powered personality analysis. No sign-up needed for basic features. Available in English, Hindi, and Marathi.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is Janam Kundli?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Janam Kundli (birth chart) is a map of the sky at the exact moment and location of your birth. It shows the positions of the Sun, Moon, and planets across 12 houses and 27 Nakshatras. In Vedic astrology, the Kundli is used to understand personality traits, predict life events, check marriage compatibility (Gun Milan), and determine auspicious timings (Muhurat).',
      },
    },
    {
      '@type': 'Question',
      name: 'What is Lahiri Ayanamsa and why does it matter for kundli?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Lahiri Ayanamsa is the angular difference between the tropical zodiac (used in Western astrology) and the sidereal zodiac (used in Vedic/Indian astrology). It is the official ayanamsa adopted by the Indian government. In 2026, it is approximately 24.2 degrees. Using the correct ayanamsa is crucial because it determines which zodiac sign each planet falls in. An incorrect ayanamsa can shift planet positions by an entire sign.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is online kundli matching reliable for marriage?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Online Ashtakoot Gun Milan (36-point matching) is reliable when based on accurate planetary calculations. MyRashifal+ computes both charts using real astronomical data, then checks all 8 compatibility factors (Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, Nadi). A score of 18+ out of 36 is considered favorable. However, Gun Milan is just one part of compatibility analysis — Manglik Dosha, 7th house strength, and Dasha periods should also be checked.',
      },
    },
  ],
};

export default function KundliLayout({ children }) {
  return (
    <>
      <Script id="faq-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      {children}
    </>
  );
}
