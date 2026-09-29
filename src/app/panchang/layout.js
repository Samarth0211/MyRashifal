export const metadata = {
  title: 'Daily Panchang — Tithi, Nakshatra, Yoga, Karana & Rahu Kaal',
  description:
    'Check today\'s Panchang with accurate Tithi, Nakshatra, Yoga, Karana, Rahu Kaal, Sunrise and Sunset times. Free Vedic Panchang calendar for any city in India.',
  keywords: 'panchang, panchang today, tithi today, nakshatra today, rahu kaal, shubh muhurat, hindu calendar, vedic calendar, पंचांग, आजचे पंचांग, तिथी, राहुकाल',
  alternates: {
    canonical: 'https://myrashifal.in/panchang',
  },
};

export default function PanchangLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://myrashifal.in' },
              { '@type': 'ListItem', position: 2, name: 'Panchang', item: 'https://myrashifal.in/panchang' },
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
