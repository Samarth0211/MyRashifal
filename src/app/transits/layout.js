export const metadata = {
  title: 'Current Transits (Gochar) | MyRashifal+',
  description:
    'See how current planetary transits affect your Vedic birth chart. Free transit positions + paid AI interpretation. Sade Sati check, major transit alerts, and personalized remedies.',
  keywords: 'transits, gochar, planetary transit, saturn transit, jupiter transit, rahu transit, sade sati, grah gochar, ग्रह गोचर, शनि गोचर, साडेसाती',
  alternates: { canonical: 'https://myrashifal.in/transits' },
  openGraph: {
    title: 'Current Transits (Gochar) — MyRashifal+',
    description:
      'Track planetary transits and their impact on your life. Saturn, Jupiter, Rahu transits analyzed against your birth chart.',
    url: 'https://myrashifal.in/transits',
  },
};

export default function TransitsLayout({ children }) {
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
              { '@type': 'ListItem', position: 2, name: 'Current Transits', item: 'https://myrashifal.in/transits' },
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
