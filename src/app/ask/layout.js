export const metadata = {
  title: 'Ask Astrologer | AI-Powered Vedic Astrology Q&A',
  description:
    'Ask any astrology question and get personalized answers based on your Vedic birth chart. AI-powered astrologer analyzes your planetary positions to give accurate guidance.',
  keywords: 'ask astrologer, astrology question, online jyotish, vedic astrology consultation, free astrology advice, ज्योतिषाला प्रश्न विचारा, ज्योतिष सल्ला, ज्योतिषी से पूछें',
  alternates: { canonical: 'https://myrashifal.in/ask' },
  openGraph: {
    title: 'Ask Astrologer - AI Vedic Astrology Q&A | MyRashifal+',
    description: 'Get personalized astrology answers based on your Vedic birth chart.',
    url: 'https://myrashifal.in/ask',
  },
};

export default function AskLayout({ children }) {
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
                  { '@type': 'ListItem', position: 2, name: 'Ask Astrologer', item: 'https://myrashifal.in/ask' },
                ],
              },
              {
                '@type': 'FAQPage',
                mainEntity: [
                  {
                    '@type': 'Question',
                    name: 'How does the AI Astrologer answer my questions?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'Our AI Astrologer analyzes your Vedic birth chart — including planetary positions, houses, nakshatras, and dasha periods — to provide personalized answers based on classical Jyotish principles.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'How many free questions can I ask?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'You can ask up to 5 questions for free after signing in and generating your kundli. After that, each question costs just ₹29.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'Do I need to generate my kundli first?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'Yes, you need to generate your free Vedic kundli first so the AI Astrologer can analyze your birth chart to give personalized, accurate answers.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'What kind of questions can I ask?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'You can ask about career, marriage, finances, health, travel, education, property, and any life topic. The AI analyzes your chart to give specific guidance with remedies.',
                    },
                  },
                ],
              },
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
