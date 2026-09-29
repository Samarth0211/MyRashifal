export const metadata = {
  title: 'Kundli Matching | Gun Milan for Marriage Compatibility',
  description:
    'Check Kundli matching (Gun Milan) for marriage compatibility. Ashtakoot matching with 36-point system, Manglik Dosha check & detailed compatibility report based on Vedic astrology.',
  keywords: 'kundli matching, gun milan, marriage compatibility, kundli milan, manglik check, horoscope matching, gun milan online free, कुंडली मिलान, गुण मिलान, विवाह जुळणी, लग्न जुळवणी',
  alternates: { canonical: 'https://myrashifal.in/matching' },
  openGraph: {
    title: 'Kundli Matching - Gun Milan for Marriage | MyRashifal+',
    description: 'Check marriage compatibility with Ashtakoot Gun Milan. 36-point system & Manglik Dosha check.',
    url: 'https://myrashifal.in/matching',
  },
};

export default function MatchingLayout({ children }) {
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
              { '@type': 'ListItem', position: 2, name: 'Kundli Matching', item: 'https://myrashifal.in/matching' },
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
