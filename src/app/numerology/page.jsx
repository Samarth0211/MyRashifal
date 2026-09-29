'use client';

import { useState } from 'react';
import PaymentButton from '@/components/PaymentButton';
import LoadingScreen from '@/components/LoadingScreen';
import ShareButtons from '@/components/ShareButtons';
import { PRICING } from '@/lib/constants';
import { savePurchase } from '@/lib/storage';
import AdBanner from '@/components/AdBanner';
import InArticleAd from '@/components/InArticleAd';
import { useLanguage } from '@/contexts/LanguageContext';

export default function NumerologyPage() {
  const { t, lang } = useLanguage();
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [result, setResult] = useState(null);
  const [detailedResult, setDetailedResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailedLoading, setDetailedLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCalculate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setResult(null);
    setDetailedResult(null);

    try {
      const res = await fetch('/api/numerology', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, dob, lang }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setResult(data);
    } catch {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDetailedPayment = async (paymentId) => {
    savePurchase('numerology', paymentId);
    setDetailedLoading(true);
    try {
      const res = await fetch('/api/numerology', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, dob, lang, detailed: true }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setDetailedResult(data);
    } catch {
      setError(t('common.error'));
    } finally {
      setDetailedLoading(false);
    }
  };

  const NumberCard = ({ label, number, meaning }) => (
    <div className="card-mystical">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-heading text-sm font-bold text-gold-primary">{label}</h3>
        <span className="text-3xl font-bold text-gold-light">{number}</span>
      </div>
      {meaning && <p className="text-text-primary text-sm leading-relaxed">{meaning}</p>}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-3">
          {t('numerology.title')}
        </h1>
        <p className="text-text-secondary">{t('numerology.subtitle')}</p>
      </div>

      {/* Form */}
      {!result && !loading && (
        <form onSubmit={handleCalculate} className="max-w-md mx-auto card-mystical p-6 space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">{t('numerology.fullName')}</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('form.namePlaceholder')}
              className="w-full px-4 py-2 rounded-lg bg-white/[0.06] border border-white/[0.08] text-text-primary focus:outline-none focus:border-gold-primary/40"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">{t('numerology.dob')}</label>
            <input
              type="date"
              required
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/[0.06] border border-white/[0.08] text-text-primary focus:outline-none focus:border-gold-primary/40"
            />
          </div>
          {error && <p className="text-accent-red text-sm">{error}</p>}
          <button type="submit" className="btn-gold w-full">
            {t('numerology.calculate')}
          </button>
        </form>
      )}

      {/* Loading */}
      {loading && (
        <div className="min-h-[40vh] flex items-center justify-center">
          <LoadingScreen message={t('numerology.calculating')} />
        </div>
      )}

      {/* Free Results */}
      {result && !loading && (
        <div className="animate-fade-in">
          <button onClick={() => { setResult(null); setDetailedResult(null); }} className="text-gold-primary text-sm mb-6 hover:underline">
            {t('numerology.newCalculation')}
          </button>

          <div className="text-center mb-8">
            <h2 className="font-heading text-2xl font-bold text-gold-gradient">{name}</h2>
            <p className="text-text-secondary text-sm">{new Date(dob + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <NumberCard
              label={t('numerology.lifePathNumber')}
              number={result.numbers.lifePath}
              meaning={result.meanings?.lifePath}
            />
            <NumberCard
              label={t('numerology.expressionNumber')}
              number={result.numbers.expression}
              meaning={result.meanings?.expression}
            />
            <NumberCard
              label={t('numerology.soulUrge')}
              number={result.numbers.soulUrge}
              meaning={result.meanings?.soulUrge}
            />
            <NumberCard
              label={t('numerology.personalityNumber')}
              number={result.numbers.personality}
              meaning={result.meanings?.personality}
            />
            <NumberCard
              label={t('numerology.birthdayNumber')}
              number={result.numbers.birthday}
              meaning={result.meanings?.birthday}
            />
          </div>

          <InArticleAd className="max-w-4xl mx-auto" />

          {/* Share */}
          <div className="mb-8">
            <ShareButtons
              text={`My Numerology Numbers:\n\nLife Path: ${result.numbers.lifePath}\nExpression: ${result.numbers.expression}\nSoul Urge: ${result.numbers.soulUrge}\n\n${result.meanings?.lifePath?.split('.')[0] || ''}\n\nDiscover yours free at myrashifal.in/numerology`}
            />
          </div>

          <AdBanner format="auto" className="max-w-4xl mx-auto mt-4" />

          {/* Detailed Report CTA */}
          {!detailedResult && !detailedLoading && (
            <div className="card-mystical p-6 text-center">
              <h3 className="font-heading text-lg font-bold text-gold-primary mb-2">
                {t('numerology.detailedTitle')}
              </h3>
              <p className="text-text-secondary text-sm mb-4">
                {t('numerology.detailedDesc')}
              </p>
              <PaymentButton
                amount={PRICING.numerology.price}
                reportType="numerology"
                onSuccess={handleDetailedPayment}
              />
            </div>
          )}

          {/* Detailed Loading */}
          {detailedLoading && (
            <div className="text-center py-8">
              <LoadingScreen message={t('numerology.generatingDetailed')} />
            </div>
          )}

          {/* Detailed Results */}
          {detailedResult && (
            <div className="mt-8 space-y-6 animate-fade-in">
              <h2 className="font-heading text-xl font-bold text-gold-primary text-center">
                {t('numerology.detailedTitle')}
              </h2>
              {detailedResult.sections?.map((section, i) => (
                <div key={i} className="report-section">
                  <h3 className="text-lg font-heading font-bold text-gold-primary mb-2">{section.heading}</h3>
                  <p className="text-text-primary text-sm leading-relaxed whitespace-pre-line">{section.content}</p>
                </div>
              ))}
              {detailedResult.luckyInfo && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {detailedResult.luckyInfo.numbers && (
                    <div className="card-mystical text-center">
                      <p className="text-text-secondary text-xs mb-1">{t('rashifal.luckyNumber')}</p>
                      <p className="text-gold-light font-bold">{detailedResult.luckyInfo.numbers}</p>
                    </div>
                  )}
                  {detailedResult.luckyInfo.colors && (
                    <div className="card-mystical text-center">
                      <p className="text-text-secondary text-xs mb-1">{t('rashifal.luckyColor')}</p>
                      <p className="text-gold-light font-bold">{detailedResult.luckyInfo.colors}</p>
                    </div>
                  )}
                  {detailedResult.luckyInfo.days && (
                    <div className="card-mystical text-center">
                      <p className="text-text-secondary text-xs mb-1">{t('numerology.luckyDays')}</p>
                      <p className="text-gold-light font-bold">{detailedResult.luckyInfo.days}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
