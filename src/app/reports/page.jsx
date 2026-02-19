'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ReportCard from '@/components/ReportCard';
import LoadingScreen from '@/components/LoadingScreen';
import { savePurchase, hasPurchased, saveReport, getReport } from '@/lib/storage';
import { PRICING } from '@/lib/constants';
import { useLanguage } from '@/contexts/LanguageContext';

const REPORT_TYPES = ['career', 'marriage', 'health', 'varshphal', 'education', 'complete'];

function getReportDetails(t) {
  return {
    career: {
      description: t('reports.career.desc'),
      features: [
        t('reports.career.f1'),
        t('reports.career.f2'),
        t('reports.career.f3'),
        t('reports.career.f4'),
        t('reports.career.f5'),
      ],
    },
    marriage: {
      description: t('reports.marriage.desc'),
      features: [
        t('reports.marriage.f1'),
        t('reports.marriage.f2'),
        t('reports.marriage.f3'),
        t('reports.marriage.f4'),
        t('reports.marriage.f5'),
      ],
    },
    health: {
      description: t('reports.health.desc'),
      features: [
        t('reports.health.f1'),
        t('reports.health.f2'),
        t('reports.health.f3'),
        t('reports.health.f4'),
        t('reports.health.f5'),
      ],
    },
    varshphal: {
      description: t('reports.varshphal.desc'),
      features: [
        t('reports.varshphal.f1'),
        t('reports.varshphal.f2'),
        t('reports.varshphal.f3'),
        t('reports.varshphal.f4'),
        t('reports.varshphal.f5'),
      ],
    },
    education: {
      description: t('reports.education.desc'),
      features: [
        t('reports.education.f1'),
        t('reports.education.f2'),
        t('reports.education.f3'),
        t('reports.education.f4'),
        t('reports.education.f5'),
      ],
    },
    complete: {
      description: t('reports.complete.desc'),
      features: [
        t('reports.complete.f1'),
        t('reports.complete.f2'),
        t('reports.complete.f3'),
        t('reports.complete.f4'),
        t('reports.complete.f5'),
      ],
    },
  };
}

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const { t, lang } = useLanguage();
  const [kundli, setKundli] = useState(null);
  const [activeReport, setActiveReport] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [dbPurchases, setDbPurchases] = useState({});
  const [dbReports, setDbReports] = useState({});

  const reportDetails = getReportDetails(t);

  // Load kundli, purchases & reports from DB for logged-in users
  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user) {
      setLoadingData(false);
      return;
    }
    fetch('/api/user/data')
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (!data) return;
        if (data.kundli) setKundli(data.kundli);
        if (data.purchases) setDbPurchases(data.purchases);
        if (data.reports) setDbReports(data.reports);
      })
      .catch(() => {})
      .finally(() => setLoadingData(false));
  }, [session, status]);

  const handlePaymentSuccess = async (reportType, paymentId) => {
    savePurchase(reportType, paymentId);

    // Check if report is already cached
    const cached = getReport(reportType);
    if (cached) {
      setReportData(cached);
      setActiveReport(reportType);
      return;
    }

    // Generate report
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kundliData: kundli, reportType, lang }),
      });
      if (!res.ok) throw new Error('Failed to generate report');
      const data = await res.json();
      saveReport(reportType, data);
      setReportData(data);
      setActiveReport(reportType);
    } catch {
      setError(t('reports.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (reportType) => {
    // Check localStorage first, then DB
    const cached = getReport(reportType) || dbReports[reportType];
    if (cached) {
      setReportData(cached);
      setActiveReport(reportType);
    }
  };

  // Unified purchased check: localStorage OR DB
  const isPurchased = (reportType) => {
    return hasPurchased(reportType) || !!dbPurchases[reportType];
  };

  const handleBack = () => {
    setActiveReport(null);
    setReportData(null);
  };

  // Still loading data from DB
  if (loadingData) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingScreen message={t('reports.loadingData')} />
      </div>
    );
  }

  // No kundli yet
  if (!kundli) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <span className="text-6xl block mb-6">☉</span>
        <h1 className="text-3xl font-heading font-bold mb-4">
          {t('reports.generateFirst')}
        </h1>
        <p className="text-text-secondary mb-8">
          {session?.user
            ? t('reports.noKundliAuth')
            : t('reports.noKundliAnon')}
        </p>
        <Link href="/kundli" className="btn-gold no-underline inline-block">
          {t('reports.generateFree')}
        </Link>
      </div>
    );
  }

  // Loading
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

        {/* Report Header */}
        <div className="text-center mb-8">
          <span className="text-5xl block mb-3">{PRICING[activeReport]?.icon}</span>
          <h1 className="text-3xl font-heading font-bold text-gold-gradient mb-2">
            {reportData.title || t(`pricing.${activeReport}`)}
          </h1>
          <p className="text-text-secondary text-sm">
            {t('reports.generatedFor', { name: kundli.birthDetails?.name, dob: kundli.birthDetails?.dob })}
          </p>
        </div>

        {/* Disclaimer */}
        <div className="highlight-box text-xs text-text-secondary leading-relaxed mb-8">
          {t('reports.disclaimer')}
        </div>

        {/* Highlights */}
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

        {/* Report Sections */}
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

        {/* Overall Outlook */}
        {reportData.overallOutlook && (
          <div className="highlight-box mt-8">
            <h3 className="font-heading text-lg font-bold text-gold-primary mb-2">{t('reports.overallOutlook')}</h3>
            <p className="text-text-primary text-sm leading-relaxed">{reportData.overallOutlook}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10 no-print">
          <button
            onClick={() => window.print()}
            className="btn-outline-gold"
          >
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
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-3">
          <span className="text-gold-gradient">{t('reports.title')}</span>
        </h1>
        <p className="text-text-secondary">
          {t('reports.subtitle', { name: kundli.birthDetails?.name })}
        </p>
      </div>

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
              onPaymentSuccess={(paymentId) => handlePaymentSuccess(type, paymentId)}
              onViewReport={() => handleViewReport(type)}
              badge={type === 'complete' ? t('reports.bestValue') : null}
            />
          );
        })}
      </div>
    </div>
  );
}
