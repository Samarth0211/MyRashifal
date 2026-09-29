export const metadata = {
  title: 'Numerology Calculator — Life Path, Expression & Soul Urge Numbers',
  description:
    'Free numerology calculator. Discover your Life Path Number, Expression Number, Soul Urge Number and more using Pythagorean numerology. Get personalized interpretations.',
  keywords: 'numerology, life path number, expression number, soul urge, pythagorean numerology, name numerology, numerology calculator, अंकशास्त्र, मूलांक, नामांक',
  alternates: {
    canonical: 'https://myrashifal.in/numerology',
  },
};

export default function NumerologyLayout({ children }) {
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
              { '@type': 'ListItem', position: 2, name: 'Numerology', item: 'https://myrashifal.in/numerology' },
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
