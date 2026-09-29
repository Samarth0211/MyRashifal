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

export default function RemediesPage() {
  const { data: session, status } = useSession();
  const { t, lang } = useLanguage();
  const [kundliData, setKundliData] = useState(null);
  const [freeRemedies, setFreeRemedies] = useState(null);
  const [detailedRemedies, setDetailedRemedies] = useState(null);
  const [loading, setLoading] = useState(true);
  const [freeLoading, setFreeLoading] = useState(false);
  const [detailedLoading, setDetailedLoading] = useState(false);

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

  const handleGetFreeRemedies = async () => {
    setFreeLoading(true);
    try {
      const res = await fetch('/api/remedies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kundliData, lang }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setFreeRemedies(data);
    } catch {
      // silently fail
    } finally {
      setFreeLoading(false);
    }
  };

  const handleDetailedPayment = async (paymentId) => {
    savePurchase('remedies', paymentId);
    setDetailedLoading(true);
    try {
      const res = await fetch('/api/remedies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kundliData, lang, detailed: true }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setDetailedRemedies(data);
    } catch {
      // silently fail
    } finally {
      setDetailedLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingScreen message={t('common.loading')} />
      </div>
    );
  }

  // No kundli — prompt to generate one
  if (!session?.user || !kundliData) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-heading font-bold mb-4">{t('remedies.title')}</h1>
        <p className="text-text-secondary mb-6">{t('remedies.needsKundli')}</p>
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
          {t('remedies.title')}
        </h1>
        <p className="text-text-secondary">{t('remedies.subtitle')}</p>
        <p className="text-text-secondary text-sm mt-1">
          {kundliData.birthDetails?.name} | {kundliData.birthDetails?.dob}
        </p>
      </div>

      {/* Get Free Remedies */}
      {!freeRemedies && !freeLoading && (
        <div className="text-center">
          <button onClick={handleGetFreeRemedies} className="btn-gold">
            {t('remedies.getBasic')}
          </button>
        </div>
      )}

      {freeLoading && (
        <div className="py-12">
          <LoadingScreen message={t('remedies.analyzing')} />
        </div>
      )}

      {/* Free Results */}
      {freeRemedies && (
        <div className="animate-fade-in">
          {/* Weak Planets */}
          <div className="space-y-4 mb-8">
            <h2 className="font-heading text-xl font-bold text-gold-primary">{t('remedies.weakPlanets')}</h2>
            {freeRemedies.weakPlanets?.map((wp, i) => (
              <div key={i} className="card-mystical border-l-4 border-l-red-500/40">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-red-400 font-heading font-bold text-lg">{wp.planet}</span>
                </div>
                <p className="text-text-secondary text-sm mb-2">{wp.issue}</p>
                <p className="text-text-primary text-sm">{wp.basicRemedy}</p>
              </div>
            ))}
          </div>

          <InArticleAd className="max-w-4xl mx-auto" />

          {/* General Advice */}
          {freeRemedies.generalAdvice && (
            <div className="highlight-box text-center mb-8">
              <p className="text-gold-light text-sm">{freeRemedies.generalAdvice}</p>
            </div>
          )}

          <AdBanner format="auto" className="max-w-4xl mx-auto mt-4" />

          {/* Detailed Remedies CTA */}
          {!detailedRemedies && !detailedLoading && (
            <div className="card-mystical p-6 text-center">
              <h3 className="font-heading text-lg font-bold text-gold-primary mb-2">
                {t('remedies.detailedTitle')}
              </h3>
              <p className="text-text-secondary text-sm mb-4">
                {t('remedies.detailedDesc')}
              </p>
              <PaymentButton
                amount={PRICING.remedies.price}
                reportType="remedies"
                onSuccess={handleDetailedPayment}
              />
            </div>
          )}

          {detailedLoading && (
            <div className="py-8">
              <LoadingScreen message={t('remedies.generatingDetailed')} />
            </div>
          )}

          {/* Detailed Results */}
          {detailedRemedies && (
            <div className="mt-8 space-y-6 animate-fade-in">
              <h2 className="font-heading text-xl font-bold text-gold-primary text-center">
                {t('remedies.detailedTitle')}
              </h2>

              {/* Priority Order */}
              {detailedRemedies.priorityOrder && (
                <div className="highlight-box">
                  <p className="text-text-secondary text-xs mb-1">{t('remedies.priority')}</p>
                  <p className="text-gold-light text-sm">{detailedRemedies.priorityOrder}</p>
                </div>
              )}

              {/* Planetary Remedies */}
              {detailedRemedies.planetaryRemedies?.map((pr, i) => (
                <div key={i} className="card-mystical">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-heading text-lg font-bold text-gold-primary">{pr.planet}</h3>
                    <span className="text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded">{pr.status}</span>
                  </div>

                  {pr.gemstone && (
                    <div className="mb-3">
                      <p className="text-text-secondary text-xs mb-1">{t('remedies.gemstone')}</p>
                      <p className="text-text-primary text-sm">
                        <strong>{pr.gemstone.name}</strong> — {pr.gemstone.weight} in {pr.gemstone.metal}, {pr.gemstone.finger}. Wear on {pr.gemstone.day}.
                      </p>
                    </div>
                  )}

                  {pr.mantra && (
                    <div className="mb-3">
                      <p className="text-text-secondary text-xs mb-1">{t('remedies.mantra')}</p>
                      <p className="text-gold-light text-sm font-hindi">{pr.mantra.text}</p>
                      <p className="text-text-secondary text-xs">{pr.mantra.count} — {pr.mantra.bestTime}</p>
                    </div>
                  )}

                  {pr.charity && (
                    <div className="mb-3">
                      <p className="text-text-secondary text-xs mb-1">{t('remedies.charity')}</p>
                      <p className="text-text-primary text-sm">{pr.charity}</p>
                    </div>
                  )}

                  {pr.fasting && (
                    <div className="mb-3">
                      <p className="text-text-secondary text-xs mb-1">{t('remedies.fasting')}</p>
                      <p className="text-text-primary text-sm">{pr.fasting}</p>
                    </div>
                  )}

                  {pr.otherRemedies && (
                    <div>
                      <p className="text-text-secondary text-xs mb-1">{t('remedies.other')}</p>
                      <p className="text-text-primary text-sm">{pr.otherRemedies}</p>
                    </div>
                  )}
                </div>
              ))}

              {/* General Remedies */}
              {detailedRemedies.generalRemedies && (
                <div className="card-mystical">
                  <h3 className="font-heading text-lg font-bold text-gold-primary mb-4">{t('remedies.generalRemedies')}</h3>
                  <div className="space-y-3">
                    {Object.entries(detailedRemedies.generalRemedies).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-text-secondary text-xs mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                        <p className="text-text-primary text-sm">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Overall Guidance */}
              {detailedRemedies.overallGuidance && (
                <div className="highlight-box text-center">
                  <p className="text-gold-light text-sm">{detailedRemedies.overallGuidance}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
