'use client';

import { useLanguage } from '@/contexts/LanguageContext';

const THRESHOLD = 3;

export default function LoyaltyProgress({ reportType, paidCount, compact = false }) {
  const { t } = useLanguage();
  const progress = Math.min(paidCount, THRESHOLD);
  const isEligible = paidCount >= THRESHOLD;
  const pct = (progress / THRESHOLD) * 100;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex gap-0.5">
          {Array.from({ length: THRESHOLD }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i < progress ? 'bg-gold-primary' : 'bg-white/[0.1]'
              }`}
            />
          ))}
        </div>
        {isEligible ? (
          <span className="text-[10px] font-bold text-accent-green">
            {t('loyalty.freeAvailable')}
          </span>
        ) : (
          <span className="text-[10px] text-text-secondary">
            {progress}/{THRESHOLD}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-bg-card border border-white/[0.06] rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-text-primary text-sm font-medium">
          {t('loyalty.progress')}
        </p>
        <span className={`text-xs font-bold ${isEligible ? 'text-accent-green' : 'text-gold-primary'}`}>
          {progress}/{THRESHOLD}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isEligible ? 'bg-accent-green' : 'bg-gold-gradient'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="text-text-secondary text-xs">
        {isEligible
          ? t('loyalty.claimFree')
          : t('loyalty.nextFree', { remaining: THRESHOLD - progress })
        }
      </p>
    </div>
  );
}
