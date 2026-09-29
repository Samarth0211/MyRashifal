'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import PaymentButton from '@/components/PaymentButton';
import LoadingScreen from '@/components/LoadingScreen';
import { PRICING } from '@/lib/constants';
import { savePurchase } from '@/lib/storage';
import AdBanner from '@/components/AdBanner';
import InArticleAd from '@/components/InArticleAd';
import { useLanguage } from '@/contexts/LanguageContext';

export default function TransitsPage() {
  const { data: session, status } = useSession();
  const { t, lang } = useLanguage();
  const [kundliData, setKundliData] = useState(null);
  const [transitData, setTransitData] = useState(null);
  const [interpretation, setInterpretation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transitLoading, setTransitLoading] = useState(false);
  const [interpretLoading, setInterpretLoading] = useState(false);

  // Load kundli from DB
  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user) {
      setLoading(false);
      return;
    }
    fetch('/api/user/data')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.kundli) setKundliData(data.kundli);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session, status]);

  const handleGetTransits = async () => {
    setTransitLoading(true);
    try {
      const res = await fetch('/api/transits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kundliData, lang }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setTransitData(data);
    } catch {
      // silently fail
    } finally {
      setTransitLoading(false);
    }
  };

  const handleInterpretationPayment = async (paymentId) => {
    savePurchase('transits', paymentId);
    setInterpretLoading(true);
    try {
      const res = await fetch('/api/transits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kundliData, lang, detailed: true }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setTransitData(data);
      setInterpretation(data.interpretation);
    } catch {
      // silently fail
    } finally {
      setInterpretLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingScreen message={t('common.loading')} />
      </div>
    );
  }

  if (!session?.user || !kundliData) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-heading font-bold mb-4">{t('transits.title')}</h1>
        <p className="text-text-secondary mb-6">{t('transits.needsKundli')}</p>
        <Link href="/kundli" className="btn-gold no-underline inline-block">
          {t('reports.generateFree')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-3">
          {t('transits.title')}
        </h1>
        <p className="text-text-secondary">{t('transits.subtitle')}</p>
        <p className="text-text-secondary text-sm mt-1">
          {kundliData.birthDetails?.name} | Moon: {kundliData.moonSign?.sign} | Lagna: {kundliData.lagna?.sign}
        </p>
      </div>

      {/* Get Transits Button */}
      {!transitData && !transitLoading && (
        <div className="text-center">
          <button onClick={handleGetTransits} className="btn-gold">
            {t('transits.currentPositions')}
          </button>
        </div>
      )}

      {transitLoading && (
        <div className="py-12">
          <LoadingScreen message={t('transits.analyzing')} />
        </div>
      )}

      {/* Transit Results */}
      {transitData && (
        <div className="animate-fade-in">
          {/* Transit Position Table */}
          <div className="card-mystical overflow-x-auto mb-6">
            <h2 className="font-heading text-xl font-bold text-gold-primary mb-4">
              {t('transits.currentPositions')}
            </h2>
            <p className="text-text-secondary text-xs mb-3">
              {transitData.date} | Ayanamsa: {transitData.ayanamsa}°
            </p>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-text-secondary text-xs border-b border-white/10">
                  <th className="text-left py-2 pr-3">{t('transits.planet')}</th>
                  <th className="text-left py-2 pr-3">{t('transits.sign')}</th>
                  <th className="text-center py-2 pr-3">{t('transits.house')}</th>
                  <th className="text-center py-2">{t('transits.houseFromLagna')}</th>
                </tr>
              </thead>
              <tbody>
                {transitData.transitPlanets?.map((tp) => (
                  <tr key={tp.id} className="border-b border-white/5">
                    <td className="py-2 pr-3 font-medium text-text-primary">{tp.name}</td>
                    <td className="py-2 pr-3 text-text-secondary">{tp.sign}</td>
                    <td className="py-2 pr-3 text-center text-gold-light">{tp.houseFromMoon}</td>
                    <td className="py-2 text-center text-text-secondary">{tp.houseFromLagna}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Sade Sati Alert */}
          {transitData.sadeSati?.active && (
            <div className="card-mystical border-l-4 border-l-amber-500/60 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-amber-400 font-heading font-bold">Sade Sati Active</span>
                <span className="text-xs bg-amber-400/10 text-amber-300 px-2 py-0.5 rounded">
                  {transitData.sadeSati.phase}
                </span>
              </div>
              <p className="text-text-secondary text-sm">
                Saturn is transiting near your natal Moon sign ({transitData.natalMoonSign}).
                This 7.5 year period brings challenges that ultimately lead to maturity and growth.
              </p>
            </div>
          )}

          <InArticleAd className="max-w-4xl mx-auto" />

          {/* Major Transits */}
          {transitData.majorTransits?.length > 0 && (
            <div className="space-y-3 mb-8">
              <h2 className="font-heading text-xl font-bold text-gold-primary">
                {t('transits.majorTransits')}
              </h2>
              {transitData.majorTransits.map((mt, i) => (
                <div
                  key={i}
                  className={`card-mystical border-l-4 ${
                    mt.impact === 'benefic'
                      ? 'border-l-green-500/40'
                      : mt.impact === 'challenging'
                        ? 'border-l-red-500/40'
                        : 'border-l-blue-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-heading font-bold text-text-primary">{mt.planet}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        mt.impact === 'benefic'
                          ? 'bg-green-400/10 text-green-400'
                          : mt.impact === 'challenging'
                            ? 'bg-red-400/10 text-red-400'
                            : 'bg-blue-400/10 text-blue-400'
                      }`}
                    >
                      {mt.impact}
                    </span>
                  </div>
                  <p className="text-text-secondary text-sm">{mt.description}</p>
                </div>
              ))}
            </div>
          )}

          <AdBanner format="auto" className="max-w-4xl mx-auto mt-4" />

          {/* AI Interpretation CTA */}
          {!interpretation && !interpretLoading && (
            <div className="card-mystical p-6 text-center">
              <h3 className="font-heading text-lg font-bold text-gold-primary mb-2">
                {t('transits.detailedTitle')}
              </h3>
              <p className="text-text-secondary text-sm mb-4">
                {t('transits.detailedDesc')}
              </p>
              <PaymentButton
                amount={PRICING.transits.price}
                reportType="transits"
                onSuccess={handleInterpretationPayment}
              />
            </div>
          )}

          {interpretLoading && (
            <div className="py-8">
              <LoadingScreen message={t('transits.generatingDetailed')} />
            </div>
          )}

          {/* Detailed Interpretation */}
          {interpretation && (
            <div className="mt-8 space-y-6 animate-fade-in">
              <h2 className="font-heading text-xl font-bold text-gold-primary text-center">
                {t('transits.detailedTitle')}
              </h2>

              {/* Overall Effect */}
              {interpretation.overallEffect && (
                <div className="highlight-box text-center">
                  <p className="text-text-secondary text-xs mb-1">{t('transits.overallEffect')}</p>
                  <p className="text-gold-light text-sm">{interpretation.overallEffect}</p>
                </div>
              )}

              {/* Per-planet transit effects */}
              {interpretation.transitEffects?.map((te, i) => (
                <div
                  key={i}
                  className={`card-mystical border-l-4 ${
                    te.impact === 'benefic'
                      ? 'border-l-green-500/40'
                      : te.impact === 'challenging'
                        ? 'border-l-red-500/40'
                        : 'border-l-blue-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-heading font-bold text-text-primary">
                      {te.planet} in {te.sign}
                    </h3>
                    <span className="text-xs text-text-secondary">
                      {te.houseFromMoon && `${te.houseFromMoon}H from Moon`}
                    </span>
                  </div>
                  <p className="text-text-secondary text-sm">{te.effect}</p>
                </div>
              ))}

              {/* Sade Sati interpretation */}
              {interpretation.sadeSati?.active && interpretation.sadeSati?.effect && (
                <div className="card-mystical border-l-4 border-l-amber-500/40">
                  <h3 className="font-heading font-bold text-amber-400 mb-2">Sade Sati Effect</h3>
                  <p className="text-text-secondary text-sm">{interpretation.sadeSati.effect}</p>
                </div>
              )}

              {/* Life Areas */}
              <div className="grid sm:grid-cols-3 gap-4">
                {interpretation.careerFinance && (
                  <div className="card-mystical">
                    <p className="text-text-secondary text-xs mb-1">{t('transits.careerEffect')}</p>
                    <p className="text-text-primary text-sm">{interpretation.careerFinance}</p>
                  </div>
                )}
                {interpretation.relationships && (
                  <div className="card-mystical">
                    <p className="text-text-secondary text-xs mb-1">{t('transits.relationshipEffect')}</p>
                    <p className="text-text-primary text-sm">{interpretation.relationships}</p>
                  </div>
                )}
                {interpretation.healthWellness && (
                  <div className="card-mystical">
                    <p className="text-text-secondary text-xs mb-1">{t('transits.healthEffect')}</p>
                    <p className="text-text-primary text-sm">{interpretation.healthWellness}</p>
                  </div>
                )}
              </div>

              {/* Advice */}
              {interpretation.advice && (
                <div className="highlight-box text-center">
                  <p className="text-text-secondary text-xs mb-1">{t('transits.advice')}</p>
                  <p className="text-gold-light text-sm">{interpretation.advice}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
