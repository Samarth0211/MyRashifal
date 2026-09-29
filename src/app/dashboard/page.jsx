'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';
import LoadingScreen from '@/components/LoadingScreen';
import LoyaltyProgress from '@/components/LoyaltyProgress';
import { PRICING } from '@/lib/constants';
import { useLanguage } from '@/contexts/LanguageContext';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const { t } = useLanguage();
  const [kundlis, setKundlis] = useState([]);
  const [reportsByKundli, setReportsByKundli] = useState({});
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [purchaseCounts, setPurchaseCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingLabel, setEditingLabel] = useState(null);
  const [editLabelValue, setEditLabelValue] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user) {
      setLoading(false);
      return;
    }

    fetch('/api/user/data')
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (!data) return;
        if (data.kundlis) setKundlis(data.kundlis);
        if (data.reportsByKundli) setReportsByKundli(data.reportsByKundli);
        if (data.purchaseHistory) setPurchaseHistory(data.purchaseHistory);
        if (data.purchaseCounts) setPurchaseCounts(data.purchaseCounts);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session, status]);

  const handleDeleteKundli = async (kundliId) => {
    if (!confirm(t('dashboard.confirmDelete'))) return;
    try {
      const res = await fetch(`/api/kundli/${kundliId}`, { method: 'DELETE' });
      if (res.ok) {
        setKundlis((prev) => prev.filter((k) => k.kundliId !== kundliId));
        const newReports = { ...reportsByKundli };
        delete newReports[kundliId];
        setReportsByKundli(newReports);
      }
    } catch {}
  };

  const handleSaveLabel = async (kundliId) => {
    if (!editLabelValue.trim()) return;
    try {
      const res = await fetch(`/api/kundli/${kundliId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: editLabelValue.trim() }),
      });
      if (res.ok) {
        setKundlis((prev) =>
          prev.map((k) =>
            k.kundliId === kundliId ? { ...k, label: editLabelValue.trim() } : k
          )
        );
        setEditingLabel(null);
      }
    } catch {}
  };

  // Not logged in
  if (status !== 'loading' && !session?.user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <span className="text-6xl block mb-6">📊</span>
        <h1 className="text-3xl font-heading font-bold mb-4">{t('dashboard.title')}</h1>
        <p className="text-text-secondary mb-8">
          Sign in to view your kundlis, reports, and purchase history.
        </p>
        <button onClick={() => signIn('google')} className="btn-gold">
          {t('common.signInGoogle')}
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingScreen message={t('reports.loadingData')} />
      </div>
    );
  }

  // Report type names for display
  const reportTypeNames = {};
  Object.keys(PRICING).forEach((key) => {
    reportTypeNames[key] = PRICING[key].name;
  });

  // Unique report types that have purchases (for loyalty section)
  const reportTypesWithPurchases = Object.keys(purchaseCounts).filter(
    (type) => purchaseCounts[type] > 0
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-3">
          <span className="text-gold-gradient">{t('dashboard.title')}</span>
        </h1>
      </div>

      {/* ── My Kundlis ── */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-xl font-bold text-gold-primary">
            {t('dashboard.myKundlis')}
          </h2>
          <Link href="/kundli" className="btn-outline-gold text-sm py-2 px-4 no-underline">
            {t('dashboard.addKundli')}
          </Link>
        </div>

        {kundlis.length === 0 ? (
          <div className="card-mystical text-center py-8">
            <p className="text-text-secondary">{t('dashboard.noKundlis')}</p>
            <Link href="/kundli" className="btn-gold mt-4 inline-block no-underline">
              {t('reports.generateFree')}
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {kundlis.map((k) => (
              <div key={k.kundliId} className="card-mystical relative">
                {k.isPrimary && (
                  <span className="absolute top-3 right-3 text-[10px] text-gold-primary bg-gold-primary/10 px-2 py-0.5 rounded-full">
                    {t('selector.primary')}
                  </span>
                )}

                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gold-primary/10 flex items-center justify-center text-gold-primary font-bold">
                    {(k.label || k.birthDetails?.name || '?')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-grow">
                    {editingLabel === k.kundliId ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editLabelValue}
                          onChange={(e) => setEditLabelValue(e.target.value)}
                          className="input-field text-sm flex-grow"
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveLabel(k.kundliId)}
                        />
                        <button
                          onClick={() => handleSaveLabel(k.kundliId)}
                          className="text-gold-primary text-sm hover:underline"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <p className="font-heading font-bold text-text-primary truncate">
                        {k.label || k.birthDetails?.name}
                      </p>
                    )}
                    <p className="text-text-secondary text-xs truncate">
                      {k.birthDetails?.dob} &middot; {k.birthDetails?.pob}
                    </p>
                  </div>
                </div>

                {k.lagna && (
                  <p className="text-text-secondary/70 text-xs mb-3">
                    Lagna: {k.lagna.sign} &middot; Moon: {k.moonSign?.sign}
                  </p>
                )}

                {/* Reports count for this kundli */}
                {reportsByKundli[k.kundliId] && (
                  <p className="text-text-secondary text-xs mb-3">
                    {Object.keys(reportsByKundli[k.kundliId]).length} report(s) generated
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mt-auto pt-2 border-t border-white/[0.06]">
                  <Link
                    href="/kundli"
                    className="text-gold-primary text-xs hover:underline no-underline"
                  >
                    {t('dashboard.viewKundli')}
                  </Link>
                  <Link
                    href="/reports"
                    className="text-gold-primary text-xs hover:underline no-underline"
                  >
                    {t('dashboard.viewReports')}
                  </Link>
                  <button
                    onClick={() => {
                      setEditingLabel(k.kundliId);
                      setEditLabelValue(k.label || k.birthDetails?.name || '');
                    }}
                    className="text-text-secondary text-xs hover:text-text-primary"
                  >
                    {t('dashboard.editLabel')}
                  </button>
                  {!k.isPrimary && (
                    <button
                      onClick={() => handleDeleteKundli(k.kundliId)}
                      className="text-accent-red/70 text-xs hover:text-accent-red"
                    >
                      {t('dashboard.deleteKundli')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Loyalty Rewards ── */}
      {reportTypesWithPurchases.length > 0 && (
        <section className="mb-12">
          <h2 className="font-heading text-xl font-bold text-gold-primary mb-6">
            {t('dashboard.loyaltyProgress')}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTypesWithPurchases.map((type) => (
              <div key={type} className="flex items-center gap-3 p-3">
                <span className="text-2xl">{PRICING[type]?.icon}</span>
                <div className="flex-grow">
                  <p className="text-text-primary text-sm font-medium mb-1">
                    {PRICING[type]?.name || type}
                  </p>
                  <LoyaltyProgress reportType={type} paidCount={purchaseCounts[type]} compact />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── My Reports ── */}
      <section className="mb-12">
        <h2 className="font-heading text-xl font-bold text-gold-primary mb-6">
          {t('dashboard.myReports')}
        </h2>

        {Object.keys(reportsByKundli).length === 0 ? (
          <div className="card-mystical text-center py-8">
            <p className="text-text-secondary">{t('dashboard.noReports')}</p>
            <Link href="/reports" className="btn-gold mt-4 inline-block no-underline">
              {t('dashboard.viewReports')}
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {kundlis.map((k) => {
              const reports = reportsByKundli[k.kundliId];
              if (!reports || Object.keys(reports).length === 0) return null;
              return (
                <div key={k.kundliId}>
                  <p className="text-text-secondary text-sm mb-3 font-medium">
                    {k.label || k.birthDetails?.name}
                  </p>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.keys(reports).map((reportType) => (
                      <Link
                        key={reportType}
                        href="/reports"
                        className="card-mystical flex items-center gap-3 no-underline group"
                      >
                        <span className="text-2xl">{PRICING[reportType]?.icon}</span>
                        <div>
                          <p className="text-text-primary text-sm font-medium group-hover:text-gold-primary transition-colors">
                            {PRICING[reportType]?.name || reportType}
                          </p>
                          <p className="text-text-secondary text-xs">{t('reports.viewReport')}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Purchase History ── */}
      <section>
        <h2 className="font-heading text-xl font-bold text-gold-primary mb-6">
          {t('dashboard.purchaseHistory')}
        </h2>

        {purchaseHistory.length === 0 ? (
          <div className="card-mystical text-center py-8">
            <p className="text-text-secondary">{t('dashboard.noPurchases')}</p>
          </div>
        ) : (
          <div className="card-mystical overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left text-text-secondary font-medium py-3 px-3">{t('dashboard.date')}</th>
                  <th className="text-left text-text-secondary font-medium py-3 px-3">{t('dashboard.report')}</th>
                  <th className="text-left text-text-secondary font-medium py-3 px-3">{t('dashboard.amount')}</th>
                </tr>
              </thead>
              <tbody>
                {purchaseHistory.slice(0, 20).map((p, i) => {
                  const kundliName = kundlis.find((k) => k.kundliId === p.kundliId)?.label
                    || kundlis.find((k) => k.kundliId === p.kundliId)?.birthDetails?.name
                    || '';
                  return (
                    <tr key={i} className="border-b border-white/[0.04]">
                      <td className="py-2.5 px-3 text-text-secondary text-xs">
                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-text-primary">
                          {PRICING[p.reportType]?.icon} {PRICING[p.reportType]?.name || p.reportType}
                        </span>
                        {kundliName && (
                          <span className="text-text-secondary text-xs ml-1">({kundliName})</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        {p.isFree ? (
                          <span className="text-accent-green text-xs font-bold">
                            {t('dashboard.loyaltyFree')}
                          </span>
                        ) : (
                          <span className="text-text-primary">
                            ₹{p.amount ? (p.amount / 100) : PRICING[p.reportType]?.price || '—'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
