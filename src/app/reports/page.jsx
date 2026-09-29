'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ReportCard from '@/components/ReportCard';
import ShareButtons from '@/components/ShareButtons';
import LoadingScreen from '@/components/LoadingScreen';
import KundliSelector from '@/components/KundliSelector';
import { savePurchase, hasPurchased, saveReport, getReport, clearLocalPurchasesAndReports } from '@/lib/storage';
import { getTempKundli, clearTempKundli } from '@/lib/temp-kundli';
import TempKundliBanner from '@/components/TempKundliBanner';
import { PRICING } from '@/lib/constants';
import FestivalBanner from '@/components/FestivalBanner';
import AdBanner from '@/components/AdBanner';
import InArticleAd from '@/components/InArticleAd';
import { useLanguage } from '@/contexts/LanguageContext';

const REPORT_TYPES = ['career', 'marriage', 'health', 'varshphal', 'education', 'gemstone', 'child', 'property', 'foreign', 'sadesati', 'complete'];

function getReportDetails(t) {
  return {
    career: {
      description: t('reports.career.desc'),
      features: [t('reports.career.f1'), t('reports.career.f2'), t('reports.career.f3'), t('reports.career.f4'), t('reports.career.f5')],
    },
    marriage: {
      description: t('reports.marriage.desc'),
      features: [t('reports.marriage.f1'), t('reports.marriage.f2'), t('reports.marriage.f3'), t('reports.marriage.f4'), t('reports.marriage.f5')],
    },
    health: {
      description: t('reports.health.desc'),
      features: [t('reports.health.f1'), t('reports.health.f2'), t('reports.health.f3'), t('reports.health.f4'), t('reports.health.f5')],
    },
    varshphal: {
      description: t('reports.varshphal.desc'),
      features: [t('reports.varshphal.f1'), t('reports.varshphal.f2'), t('reports.varshphal.f3'), t('reports.varshphal.f4'), t('reports.varshphal.f5')],
    },
    education: {
      description: t('reports.education.desc'),
      features: [t('reports.education.f1'), t('reports.education.f2'), t('reports.education.f3'), t('reports.education.f4'), t('reports.education.f5')],
    },
    gemstone: {
      description: t('reports.gemstone.desc'),
      features: [t('reports.gemstone.f1'), t('reports.gemstone.f2'), t('reports.gemstone.f3'), t('reports.gemstone.f4'), t('reports.gemstone.f5')],
    },
    child: {
      description: t('reports.child.desc'),
      features: [t('reports.child.f1'), t('reports.child.f2'), t('reports.child.f3'), t('reports.child.f4'), t('reports.child.f5')],
    },
    property: {
      description: t('reports.property.desc'),
      features: [t('reports.property.f1'), t('reports.property.f2'), t('reports.property.f3'), t('reports.property.f4'), t('reports.property.f5')],
    },
    foreign: {
      description: t('reports.foreign.desc'),
      features: [t('reports.foreign.f1'), t('reports.foreign.f2'), t('reports.foreign.f3'), t('reports.foreign.f4'), t('reports.foreign.f5')],
    },
    sadesati: {
      description: t('reports.sadesati.desc'),
      features: [t('reports.sadesati.f1'), t('reports.sadesati.f2'), t('reports.sadesati.f3'), t('reports.sadesati.f4'), t('reports.sadesati.f5')],
    },
    complete: {
      description: t('reports.complete.desc'),
      features: [t('reports.complete.f1'), t('reports.complete.f2'), t('reports.complete.f3'), t('reports.complete.f4'), t('reports.complete.f5')],
    },
  };
}

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const { t, lang } = useLanguage();
  const [kundli, setKundli] = useState(null);
  const [allKundlis, setAllKundlis] = useState([]);
  const [selectedKundliId, setSelectedKundliId] = useState(null);
  const [tempKundli, setTempKundli] = useState(null);
  const [savingTemp, setSavingTemp] = useState(false);
  const [activeReport, setActiveReport] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [dbPurchasesByKundli, setDbPurchasesByKundli] = useState({});
  const [dbReportsByKundli, setDbReportsByKundli] = useState({});
  const [purchaseCounts, setPurchaseCounts] = useState({});
  const [festivalOffer, setFestivalOffer] = useState(null);

  const reportDetails = getReportDetails(t);

  // Fetch festival offer on mount
  useEffect(() => {
    fetch('/api/festival-offer')
      .then((r) => r.json())
      .then((data) => { if (data.active) setFestivalOffer(data); })
      .catch(() => {});
  }, []);

  // Load data from DB for logged-in users; check sessionStorage for temp kundli
  useEffect(() => {
    if (status === 'loading') return;

    const temp = getTempKundli();
    if (temp) setTempKundli(temp);

    if (!session?.user) {
      setLoadingData(false);
      return;
    }

    fetch('/api/user/data')
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (!data) return;
        clearLocalPurchasesAndReports();

        if (data.kundlis && data.kundlis.length > 0) {
          setAllKundlis(data.kundlis);
          const primary = data.kundlis.find((k) => k.isPrimary) || data.kundlis[0];
          setSelectedKundliId(primary.kundliId);
          setKundli(primary);

          if (temp) {
            clearTempKundli();
            setTempKundli(null);
          }
        } else if (data.kundli) {
          setKundli(data.kundli);
          if (temp) {
            clearTempKundli();
            setTempKundli(null);
          }
        }

        if (data.purchasesByKundli) setDbPurchasesByKundli(data.purchasesByKundli);
        if (data.reportsByKundli) setDbReportsByKundli(data.reportsByKundli);
        if (data.purchaseCounts) setPurchaseCounts(data.purchaseCounts);
      })
      .catch(() => {})
      .finally(() => setLoadingData(false));
  }, [session, status]);

  // Switch kundli
  const handleSelectKundli = (kundliId) => {
    setSelectedKundliId(kundliId);
    const k = allKundlis.find((k) => k.kundliId === kundliId);
    if (k) setKundli(k);
    setActiveReport(null);
    setReportData(null);
  };

  // Save temp kundli to DB after sign-in
  const handleSaveTempKundli = async () => {
    setSavingTemp(true);
    setError('');
    try {
      const res = await fetch('/api/save-kundli', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tempKundli),
      });
      if (!res.ok) throw new Error('Failed to save');
      const { kundliId } = await res.json();
      const savedKundli = { ...tempKundli, kundliId };
      setKundli(savedKundli);
      setSelectedKundliId(kundliId);
      setAllKundlis((prev) => [...prev, savedKundli]);
      clearTempKundli();
      setTempKundli(null);
    } catch {
      setError(t('tempKundli.saveError'));
    } finally {
      setSavingTemp(false);
    }
  };

  const handleDiscardTempKundli = () => {
    clearTempKundli();
    setTempKundli(null);
  };

  // Check if a report type is purchased for the selected kundli
  const isPurchased = (reportType) => {
    if (!selectedKundliId) {
      return hasPurchased(reportType);
    }
    return !!(dbPurchasesByKundli[selectedKundliId]?.[reportType]);
  };

  // Get cached report for selected kundli
  const getCachedReport = (reportType) => {
    if (selectedKundliId && dbReportsByKundli[selectedKundliId]?.[reportType]) {
      return dbReportsByKundli[selectedKundliId][reportType];
    }
    return getReport(reportType);
  };

  const handlePaymentSuccess = async (reportType, paymentId) => {
    savePurchase(reportType, paymentId);

    // Generate report
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kundliData: kundli,
          reportType,
          kundliId: selectedKundliId || undefined,
          lang,
        }),
      });
      if (!res.ok) throw new Error('Failed to generate report');
      const data = await res.json();
      saveReport(reportType, data);

      // Update local state
      if (selectedKundliId) {
        setDbPurchasesByKundli((prev) => ({
          ...prev,
          [selectedKundliId]: { ...(prev[selectedKundliId] || {}), [reportType]: true },
        }));
        setDbReportsByKundli((prev) => ({
          ...prev,
          [selectedKundliId]: { ...(prev[selectedKundliId] || {}), [reportType]: data },
        }));
        setPurchaseCounts((prev) => ({
          ...prev,
          [reportType]: (prev[reportType] || 0) + 1,
        }));
      }

      setReportData(data);
      setActiveReport(reportType);
    } catch {
      setError(t('reports.error'));
    } finally {
      setLoading(false);
    }
  };

  // Claim free loyalty report
  const handleClaimFree = async (reportType) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/claim-loyalty-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType,
          kundliId: selectedKundliId,
          lang,
        }),
      });
      if (!res.ok) throw new Error('Failed to claim');
      const data = await res.json();

      if (selectedKundliId) {
        setDbPurchasesByKundli((prev) => ({
          ...prev,
          [selectedKundliId]: { ...(prev[selectedKundliId] || {}), [reportType]: true },
        }));
        setDbReportsByKundli((prev) => ({
          ...prev,
          [selectedKundliId]: { ...(prev[selectedKundliId] || {}), [reportType]: data },
        }));
      }

      setReportData(data);
      setActiveReport(reportType);
    } catch {
      setError(t('reports.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (reportType) => {
    const cached = getCachedReport(reportType);
    if (cached) {
      setReportData(cached);
      setActiveReport(reportType);
    }
  };

  const handleBack = () => {
    setActiveReport(null);
    setReportData(null);
  };

  // Still loading
  if (loadingData) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingScreen message={t('reports.loadingData')} />
      </div>
    );
  }

  // No kundli yet
  if (!kundli) {
    if (tempKundli) {
      return (
        <div className="max-w-lg mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-3">
              <span className="text-gold-gradient">{t('reports.title')}</span>
            </h1>
          </div>
          <TempKundliBanner
            kundli={tempKundli}
            isAuthenticated={!!session?.user}
            onSave={handleSaveTempKundli}
            onDiscard={handleDiscardTempKundli}
            saving={savingTemp}
          />
          {error && (
            <div className="bg-accent-red/10 border border-accent-red/30 rounded-lg p-4 text-center">
              <p className="text-accent-red text-sm">{error}</p>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <span className="text-6xl block mb-6">☉</span>
        <h1 className="text-3xl font-heading font-bold mb-4">
          {t('reports.generateFirst')}
        </h1>
        <p className="text-text-secondary mb-8">
          {session?.user ? t('reports.noKundliAuth') : t('reports.noKundliAnon')}
        </p>
        <Link href="/kundli" className="btn-gold no-underline inline-block">
          {t('reports.generateFree')}
        </Link>
      </div>
    );
  }

  // Loading report generation
  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingScreen message={t('reports.generating')} />
      </div>
    );
  }

  // View Report
  if (activeReport && reportData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
        <button onClick={handleBack} className="text-gold-primary text-sm mb-6 hover:underline">
          {t('reports.backToAll')}
        </button>

        <div className="text-center mb-8">
          <span className="text-5xl block mb-3">{PRICING[activeReport]?.icon}</span>
          <h1 className="text-3xl font-heading font-bold text-gold-gradient mb-2">
            {reportData.title || t(`pricing.${activeReport}`)}
          </h1>
          <p className="text-text-secondary text-sm">
            {t('reports.generatedFor', { name: kundli.birthDetails?.name, dob: kundli.birthDetails?.dob })}
          </p>
        </div>

        <div className="highlight-box text-xs text-text-secondary leading-relaxed mb-8">
          {t('reports.disclaimer')}
        </div>

        {reportData.highlights && reportData.highlights.length > 0 && (
          <div className="card-mystical mb-8">
            <h2 className="font-heading text-lg font-bold text-gold-primary mb-3">{t('reports.keyHighlights')}</h2>
            <ul className="space-y-2">
              {reportData.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-text-primary">
                  <span className="text-gold-primary mt-0.5">✦</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {reportData.sections?.map((section, i) => (
          <div key={i} className="report-section">
            <h3 className="text-xl">{section.heading}</h3>
            <div className="report-markdown">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {section.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}

        {reportData.overallOutlook && (
          <div className="highlight-box mt-8">
            <h3 className="font-heading text-lg font-bold text-gold-primary mb-2">{t('reports.overallOutlook')}</h3>
            <p className="text-text-primary text-sm leading-relaxed">{reportData.overallOutlook}</p>
          </div>
        )}

        <InArticleAd className="max-w-4xl mx-auto" />

        <div className="mt-8">
          <ShareButtons
            text={`My ${activeReport ? activeReport.charAt(0).toUpperCase() + activeReport.slice(1) : ''} Report from MyRashifal+\n\n${reportData.overallOutlook ? reportData.overallOutlook.slice(0, 150) + '...' : ''}\n\nGet your report at myrashifal.in`}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6 no-print">
          <button onClick={() => window.print()} className="btn-outline-gold">
            {t('reports.downloadPdf')}
          </button>
          <button onClick={handleBack} className="btn-outline-gold">
            {t('reports.viewOther')}
          </button>
        </div>
      </div>
    );
  }

  // Reports Marketplace
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-3">
          <span className="text-gold-gradient">{t('reports.title')}</span>
        </h1>
        <p className="text-text-secondary">
          {t('reports.subtitle', { name: kundli.birthDetails?.name })}
        </p>
      </div>

      {/* Kundli Selector */}
      {session?.user && allKundlis.length > 0 && (
        <div className="flex justify-center mb-8">
          <KundliSelector
            kundlis={allKundlis}
            selectedId={selectedKundliId}
            onSelect={handleSelectKundli}
            onAddNew={() => window.location.href = '/kundli'}
          />
        </div>
      )}

      {/* Festival Offer Banner */}
      <FestivalBanner />

      {error && (
        <div className="bg-accent-red/10 border border-accent-red/30 rounded-lg p-4 mb-6 text-center">
          <p className="text-accent-red text-sm">{error}</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {REPORT_TYPES.map((type) => {
          const pricing = PRICING[type];
          const details = reportDetails[type];
          return (
            <ReportCard
              key={type}
              icon={pricing.icon}
              title={t(`pricing.${type}`)}
              description={details.description}
              price={pricing.price}
              originalPrice={pricing.originalPrice}
              features={details.features}
              purchased={isPurchased(type)}
              reportType={type}
              kundliId={selectedKundliId}
              loyaltyCount={purchaseCounts[type] || 0}
              onPaymentSuccess={(paymentId) => handlePaymentSuccess(type, paymentId)}
              onViewReport={() => handleViewReport(type)}
              onClaimFree={() => handleClaimFree(type)}
              badge={type === 'complete' ? t('reports.bestValue') : null}
              festivalOffer={festivalOffer}
            />
          );
        })}
      </div>

      <AdBanner format="auto" className="max-w-6xl mx-auto mt-4" />
    </div>
  );
}
