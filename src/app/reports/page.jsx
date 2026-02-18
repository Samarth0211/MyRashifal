'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import ReportCard from '@/components/ReportCard';
import LoadingScreen from '@/components/LoadingScreen';
import { savePurchase, hasPurchased, saveReport, getReport } from '@/lib/storage';
import { PRICING } from '@/lib/constants';

const REPORT_DETAILS = {
  career: {
    description: 'Comprehensive career guidance based on your 10th house, Dashamsa chart, Dhana Yogas, and current dasha impact.',
    features: [
      '10th house lord analysis & career indications',
      'Dhana Yoga (wealth combinations) analysis',
      'Best career fields for your chart',
      'Next 12 months career forecast',
      'Remedies for career obstacles',
    ],
  },
  marriage: {
    description: 'Deep analysis of your 7th house, Manglik status, Venus placement, and marriage timing based on dasha periods.',
    features: [
      '7th house analysis & spouse characteristics',
      'Manglik Dosha check with severity & remedies',
      'Marriage timing prediction (dasha-based)',
      'Relationship strengths & challenges',
      'Remedies for relationship harmony',
    ],
  },
  health: {
    description: 'Health insights based on 6th and 8th house analysis, vulnerable areas, mental health indicators, and Ayurvedic constitution.',
    features: [
      '6th & 8th house health analysis',
      'Vulnerable body areas identification',
      'Mental health indicators',
      'Ayurvedic constitution (Prakriti)',
      'Periods requiring extra health caution',
    ],
  },
  varshphal: {
    description: 'Complete annual forecast with Solar Return chart analysis, Muntha position, and month-by-month predictions.',
    features: [
      'Varsha Kundli (Solar Return) analysis',
      'Month-by-month forecast for all 12 months',
      'Best months for career & relationships',
      'Challenging periods with remedies',
      'Year-end summary & key takeaway',
    ],
  },
  education: {
    description: 'Education prospects based on 4th and 5th house analysis, Mercury/Jupiter strength, and competitive exam indicators.',
    features: [
      '4th & 5th house analysis',
      'Mercury & Jupiter strength assessment',
      'Best periods for studies & exams',
      'Foreign education prospects',
      'Competitive exam success indicators',
    ],
  },
  complete: {
    description: 'ALL reports combined plus bonus: past life karma analysis and spiritual growth indicators. Best value!',
    features: [
      'All 5 individual reports included',
      'Past life karma analysis (bonus)',
      'Spiritual growth indicators (bonus)',
      'Comprehensive life overview',
      'Save ₹167 vs buying individually',
    ],
  },
};

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const [kundli, setKundli] = useState(null);
  const [activeReport, setActiveReport] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [dbPurchases, setDbPurchases] = useState({});
  const [dbReports, setDbReports] = useState({});

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
        body: JSON.stringify({ kundliData: kundli, reportType }),
      });
      if (!res.ok) throw new Error('Failed to generate report');
      const data = await res.json();
      saveReport(reportType, data);
      setReportData(data);
      setActiveReport(reportType);
    } catch {
      setError('Failed to generate report. Please try again.');
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
        <LoadingScreen message="Loading your data..." />
      </div>
    );
  }

  // No kundli yet
  if (!kundli) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <span className="text-6xl block mb-6">☉</span>
        <h1 className="text-3xl font-heading font-bold mb-4">
          Generate Your Kundli First
        </h1>
        <p className="text-text-secondary mb-8">
          {session?.user
            ? "We need your birth chart to generate personalized reports. It's free and takes less than a minute."
            : "Sign in and generate your birth chart to access personalized premium reports."}
        </p>
        <Link href="/kundli" className="btn-gold no-underline inline-block">
          Generate Free Kundli →
        </Link>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingScreen message="Generating your detailed report..." />
      </div>
    );
  }

  // View Report
  if (activeReport && reportData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
        <button onClick={handleBack} className="text-gold-primary text-sm mb-6 hover:underline">
          ← Back to all reports
        </button>

        {/* Report Header */}
        <div className="text-center mb-8">
          <span className="text-5xl block mb-3">{PRICING[activeReport]?.icon}</span>
          <h1 className="text-3xl font-heading font-bold text-gold-gradient mb-2">
            {reportData.title || PRICING[activeReport]?.name}
          </h1>
          <p className="text-text-secondary text-sm">
            Generated for {kundli.birthDetails?.name} | {kundli.birthDetails?.dob}
          </p>
        </div>

        {/* Disclaimer */}
        <div className="highlight-box text-xs text-text-secondary leading-relaxed mb-8">
          This report is generated using classical Vedic astrology principles from Brihat Parashara
          Hora Shastra and other authoritative Jyotish texts. These insights are intended for spiritual
          guidance and self-reflection purposes only. They should not be used as a substitute for
          professional medical, legal, financial, or psychological advice.
        </div>

        {/* Highlights */}
        {reportData.highlights && reportData.highlights.length > 0 && (
          <div className="card-mystical mb-8">
            <h2 className="font-heading text-lg font-bold text-gold-primary mb-3">Key Highlights</h2>
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
            <div className="text-text-primary text-sm leading-relaxed whitespace-pre-line">
              {section.content}
            </div>
          </div>
        ))}

        {/* Overall Outlook */}
        {reportData.overallOutlook && (
          <div className="highlight-box mt-8">
            <h3 className="font-heading text-lg font-bold text-gold-primary mb-2">Overall Outlook</h3>
            <p className="text-text-primary text-sm leading-relaxed">{reportData.overallOutlook}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10 no-print">
          <button
            onClick={() => window.print()}
            className="btn-outline-gold"
          >
            Download as PDF
          </button>
          <button onClick={handleBack} className="btn-outline-gold">
            View Other Reports
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
          Premium <span className="text-gold-gradient">Reports</span>
        </h1>
        <p className="text-text-secondary">
          Unlock detailed life insights based on {kundli.birthDetails?.name}&apos;s birth chart
        </p>
      </div>

      {error && (
        <div className="bg-accent-red/10 border border-accent-red/30 rounded-lg p-4 mb-6 text-center">
          <p className="text-accent-red text-sm">{error}</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(REPORT_DETAILS).map(([type, details]) => {
          const pricing = PRICING[type];
          return (
            <ReportCard
              key={type}
              icon={pricing.icon}
              title={pricing.name}
              description={details.description}
              price={pricing.price}
              originalPrice={pricing.originalPrice}
              features={details.features}
              purchased={isPurchased(type)}
              reportType={type}
              onPaymentSuccess={(paymentId) => handlePaymentSuccess(type, paymentId)}
              onViewReport={() => handleViewReport(type)}
              badge={type === 'complete' ? 'Best Value — Save ₹167' : null}
            />
          );
        })}
      </div>
    </div>
  );
}
