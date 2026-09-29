export const metadata = {
  title: 'Shubh Muhurat | Auspicious Timing Calculator',
  description:
    'Find the most auspicious Muhurat (timing) for important events - marriage, griha pravesh, business start, travel & more. Based on Vedic Panchang calculations.',
  keywords: 'shubh muhurat, auspicious time, muhurat today, vivah muhurat, griha pravesh muhurat, panchang, shubh samay, शुभ मुहूर्त, विवाह मुहूर्त, गृहप्रवेश मुहूर्त',
  alternates: { canonical: 'https://myrashifal.in/muhurat' },
  openGraph: {
    title: 'Shubh Muhurat - Auspicious Timing Calculator | MyRashifal+',
    description: 'Find auspicious Muhurat for marriage, business, travel & more based on Vedic Panchang.',
    url: 'https://myrashifal.in/muhurat',
  },
};

export default function MuhuratLayout({ children }) {
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
              { '@type': 'ListItem', position: 2, name: 'Shubh Muhurat', item: 'https://myrashifal.in/muhurat' },
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
