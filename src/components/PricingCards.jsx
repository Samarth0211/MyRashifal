'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

const FEATURE_KEYS = [
  { key: 'pricingCards.birthChart', free: true, premium: true },
  { key: 'pricingCards.dailyRashifal', free: true, premium: true },
  { key: 'pricingCards.basicPersonality', free: true, premium: true },
  { key: 'pricingCards.careerReport', free: false, premium: true },
  { key: 'pricingCards.marriageReport', free: false, premium: true },
  { key: 'pricingCards.kundliMatching', free: false, premium: true },
  { key: 'pricingCards.askQuestions', free: false, premium: true },
  { key: 'pricingCards.varshphalReport', free: false, premium: true },
  { key: 'pricingCards.shubhMuhurat', free: false, premium: true },
];

export default function PricingCards() {
  const { t } = useLanguage();
  return (
    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {/* Free Plan */}
      <div className="card-mystical flex flex-col">
        <div className="text-center mb-6">
          <h3 className="font-heading text-2xl font-bold mb-2">{t('pricingCards.free')}</h3>
          <p className="text-3xl font-bold text-gold-light">₹0</p>
          <p className="text-text-secondary text-sm">{t('pricingCards.freeForever')}</p>
        </div>
        <ul className="space-y-3 flex-grow mb-6">
          {FEATURE_KEYS.map((f) => (
            <li key={f.key} className="flex items-center gap-3 text-sm">
              {f.free ? (
                <span className="text-accent-green">✓</span>
              ) : (
                <span className="text-text-secondary opacity-40">✗</span>
              )}
              <span className={f.free ? 'text-text-primary' : 'text-text-secondary opacity-40'}>
                {t(f.key)}
              </span>
            </li>
          ))}
        </ul>
        <Link href="/kundli" className="btn-outline-gold text-center no-underline block">
          {t('pricingCards.getStarted')}
        </Link>
      </div>

      {/* Premium Plan */}
      <div className="card-mystical relative flex flex-col border-gold-primary/50">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold-gradient text-bg-primary text-xs font-bold px-4 py-1 rounded-full">
          {t('pricingCards.mostPopular')}
        </div>
        <div className="text-center mb-6">
          <h3 className="font-heading text-2xl font-bold mb-2">{t('pricingCards.premium')}</h3>
          <p className="text-3xl font-bold text-gold-light">₹199<span className="text-base font-normal text-text-secondary">{t('pricingCards.perMonth')}</span></p>
          <p className="text-text-secondary text-sm">{t('pricingCards.allFeatures')}</p>
        </div>
        <ul className="space-y-3 flex-grow mb-6">
          {FEATURE_KEYS.map((f) => (
            <li key={f.key} className="flex items-center gap-3 text-sm">
              <span className="text-accent-green">✓</span>
              <span className="text-text-primary">{t(f.key)}</span>
              {!f.free && (
                <span className="text-gold-primary text-xs ml-auto">{t('pricingCards.premium')}</span>
              )}
            </li>
          ))}
        </ul>
        <Link href="/reports" className="btn-gold text-center no-underline block">
          {t('pricingCards.upgrade')}
        </Link>
        <p className="text-center text-text-secondary text-xs mt-3">
          {t('pricingCards.buyIndividual')}
        </p>
      </div>
    </div>
  );
}
