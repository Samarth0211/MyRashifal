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
        <div className="mb-6">
          <h3 className="font-heading text-xl font-bold mb-1">{t('pricingCards.free')}</h3>
          <p className="text-2xl font-bold text-text-primary">
            ₹0
          </p>
          <p className="text-text-secondary text-sm">{t('pricingCards.freeForever')}</p>
        </div>
        <ul className="space-y-3 flex-grow mb-6">
          {FEATURE_KEYS.map((f) => (
            <li key={f.key} className="flex items-center gap-3 text-sm">
              {f.free ? (
                <svg className="w-4 h-4 text-accent-green flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-text-secondary/20 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <span className={f.free ? 'text-text-primary' : 'text-text-secondary/40'}>
                {t(f.key)}
              </span>
            </li>
          ))}
        </ul>
        <Link href="/kundli" className="btn-outline-gold text-center no-underline block text-sm">
          {t('pricingCards.getStarted')}
        </Link>
      </div>

      {/* Premium Plan */}
      <div className="card-mystical relative flex flex-col !border-gold-primary/20">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-gold-gradient text-bg-primary text-[11px] font-semibold px-3 py-1 rounded-full">
            {t('pricingCards.mostPopular')}
          </span>
        </div>
        <div className="mb-6">
          <h3 className="font-heading text-xl font-bold mb-1">{t('pricingCards.premium')}</h3>
          <p className="text-2xl font-bold text-gold-light">
            ₹199<span className="text-sm font-normal text-text-secondary ml-0.5">{t('pricingCards.perMonth')}</span>
          </p>
          <p className="text-text-secondary text-sm">{t('pricingCards.allFeatures')}</p>
        </div>
        <ul className="space-y-3 flex-grow mb-6">
          {FEATURE_KEYS.map((f) => (
            <li key={f.key} className="flex items-center gap-3 text-sm">
              <svg className="w-4 h-4 text-accent-green flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span className="text-text-primary">{t(f.key)}</span>
            </li>
          ))}
        </ul>
        <Link href="/reports" className="btn-gold text-center no-underline block text-sm">
          {t('pricingCards.upgrade')}
        </Link>
        <p className="text-center text-text-secondary/60 text-xs mt-3">
          {t('pricingCards.buyIndividual')}
        </p>
      </div>
    </div>
  );
}
