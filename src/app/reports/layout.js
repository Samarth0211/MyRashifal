export const metadata = {
  title: 'Astrology Reports | Career, Wealth & Life Predictions',
  description:
    'Get personalized Vedic astrology reports - Career & Wealth analysis, Relationship insights, Health predictions & Annual forecast. Based on your birth chart with AI-powered interpretation.',
  keywords: 'astrology report, career report, vedic astrology predictions, life report, kundli report, birth chart analysis, wealth prediction, ज्योतिष अहवाल, कुंडली रिपोर्ट, फलादेश',
  alternates: { canonical: 'https://myrashifal.in/reports' },
  openGraph: {
    title: 'Vedic Astrology Reports - Career, Wealth & Life | MyRashifal+',
    description: 'Personalized astrology reports based on your Vedic birth chart. Career, wealth & life predictions.',
    url: 'https://myrashifal.in/reports',
  },
};

export default function ReportsLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://myrashifal.in' },
                  { '@type': 'ListItem', position: 2, name: 'Astrology Reports', item: 'https://myrashifal.in/reports' },
                ],
              },
              {
                '@type': 'Product',
                name: 'Vedic Astrology Reports',
                description: 'Personalized astrology reports based on your Vedic birth chart — Career, Marriage, Health, Annual & more.',
                brand: { '@type': 'Organization', name: 'MyRashifal+' },
                url: 'https://myrashifal.in/reports',
                offers: {
                  '@type': 'AggregateOffer',
                  lowPrice: '29',
                  highPrice: '399',
                  priceCurrency: 'INR',
                  offerCount: 11,
                  availability: 'https://schema.org/InStock',
                },
              },
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
