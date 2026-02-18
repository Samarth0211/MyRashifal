'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import BirthForm from '@/components/BirthForm';
import KundliChart from '@/components/KundliChart';
import PlanetTable from '@/components/PlanetTable';
import LoadingScreen from '@/components/LoadingScreen';
import { saveProfile, clearOldKundliCache } from '@/lib/storage';
import { PRICING } from '@/lib/constants';
import { useLanguage } from '@/contexts/LanguageContext';

// Normalize old cached data where JSON parsing failed and everything
// was dumped into the `personality` field as raw text with labels
function normalizeKundliData(raw) {
  if (!raw) return raw;

  // Already has structured sections — nothing to fix
  if (raw.personalitySections && Array.isArray(raw.personalitySections) && raw.personalitySections.length > 0) {
    return raw;
  }

  const text = raw.personality || '';

  // Check if old broken format (raw text contains "dashaInterpretation:" or "yogas:")
  const hasBrokenFormat = /dashaInterpretation\s*:/i.test(text) || /yogas\s*:\s*name\s*:/i.test(text);
  if (!hasBrokenFormat) return raw;

  // Extract personality text (before dashaInterpretation or yogas)
  const personalityMatch = text.match(/^(?:personality\s*:\s*)?([\s\S]*?)(?=\s*dashaInterpretation\s*:|yogas\s*:\s*name\s*:|$)/i);
  const personalityText = personalityMatch ? personalityMatch[1].trim() : '';

  // Extract dasha interpretation
  const dashaMatch = text.match(/dashaInterpretation\s*:\s*([\s\S]*?)(?=\s*yogas\s*:\s*name\s*:|$)/i);
  const dashaText = dashaMatch ? dashaMatch[1].trim() : '';

  // Extract yogas from raw text like: "name: X, present: true, description: Y. , name: Z..."
  const yogasSection = text.match(/yogas\s*:\s*([\s\S]*$)/i);
  const yogas = [];
  if (yogasSection) {
    const yogaEntries = yogasSection[1].split(/\s*,\s*name\s*:\s*/);
    for (const entry of yogaEntries) {
      const nameMatch = entry.match(/(?:name\s*:\s*)?(.*?)(?:,\s*present\s*:)/i);
      const descMatch = entry.match(/description\s*:\s*([\s\S]*?)(?:\s*\.\s*$|\s*$)/i);
      const presentMatch = entry.match(/present\s*:\s*(true|false)/i);
      if (nameMatch && descMatch) {
        const isPresent = presentMatch ? presentMatch[1].toLowerCase() === 'true' : true;
        if (isPresent) {
          yogas.push({
            name: nameMatch[1].trim().replace(/,\s*$/, ''),
            present: true,
            description: descMatch[1].trim().replace(/\s*\.\s*$/, '.'),
          });
        }
      }
    }
  }

  // Split personality into sections by paragraph breaks
  const paragraphs = personalityText
    .replace(/\\n/g, '\n')
    .split(/\n\n+/)
    .map(p => p.replace(/\n/g, ' ').trim())
    .filter(p => p.length > 20);

  // Create structured sections from paragraphs
  const sectionTitles = [
    'Lagna & Core Personality',
    'Moon Sign & Emotional Nature',
    'Key Planetary Influences',
    'Career & Wealth Indicators',
    'Relationships & Marriage',
    'Strengths & Life Challenges',
  ];

  let sections = null;
  if (paragraphs.length >= 3) {
    sections = paragraphs.map((content, i) => ({
      title: sectionTitles[i] || `Analysis (${i + 1})`,
      content,
    }));
  }

  return {
    ...raw,
    personality: personalityText,
    personalitySections: sections,
    yogas: yogas.length > 0 ? yogas : raw.yogas,
    currentDasha: {
      ...raw.currentDasha,
      interpretation: dashaText || raw.currentDasha?.interpretation || '',
    },
  };
}

export default function KundliPage() {
  const { data: session, status } = useSession();
  const { t, lang } = useLanguage();
  const [rawKundli, setRawKundli] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingFromDb, setLoadingFromDb] = useState(true);
  const [error, setError] = useState('');

  // Normalize data (cleans up old cached formats)
  const kundli = useMemo(() => normalizeKundliData(rawKundli), [rawKundli]);

  // Clear stale shared localStorage kundli on mount
  useEffect(() => {
    clearOldKundliCache();
  }, []);

  // Load kundli from DB for logged-in users
  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user) {
      setLoadingFromDb(false);
      return;
    }
    fetch('/api/user/data')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.kundli) setRawKundli(data.kundli);
      })
      .catch(() => {})
      .finally(() => setLoadingFromDb(false));
  }, [session, status]);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/generate-kundli', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, lang }),
      });

      if (!res.ok) throw new Error('Failed to generate kundli');
      const data = await res.json();

      // Kundli is saved to MongoDB by the API if user is logged in.
      // For anonymous users, it only lives in React state (no persistence).
      if (session?.user?.id) {
        saveProfile(formData, session.user.id);
      }
      setRawKundli(data);
    } catch (err) {
      setError(t('kundli.errorMsg'));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRawKundli(null);
  };

  // Loading State (DB fetch or generation)
  if (loading || loadingFromDb) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <LoadingScreen />
      </div>
    );
  }

  // Form State
  if (!kundli) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-3 text-gold-gradient">
            {t('kundli.title')}
          </h1>
          <p className="text-text-secondary">
            {t('kundli.subtitle')}
          </p>
        </div>

        {error && (
          <div className="bg-accent-red/10 border border-accent-red/30 rounded-lg p-4 mb-6 text-center">
            <p className="text-accent-red text-sm">{error}</p>
            <button
              onClick={() => setError('')}
              className="text-gold-primary text-sm mt-2 underline"
            >
              {t('kundli.tryAgain')}
            </button>
          </div>
        )}

        <div className="card-mystical">
          <BirthForm onSubmit={handleSubmit} loading={loading} />
        </div>
      </div>
    );
  }

  // Helper: split text into readable paragraphs
  const formatParagraphs = (text) => {
    if (!text) return [];
    return text
      .replace(/\\n/g, '\n')
      .split(/\n\n+|\n(?=[A-Z])/)
      .map(p => p.replace(/\n/g, ' ').trim())
      .filter(p => p.length > 0);
  };

  // Section icons mapping for structured personality sections
  const sectionIcons = {
    'Lagna & Core Personality': '☉',
    'Moon Sign & Emotional Nature': '☽',
    'Key Planetary Influences': '☿',
    'Career & Wealth Indicators': '♃',
    'Relationships & Marriage': '♀',
    'Strengths & Life Challenges': '⚖',
  };

  // Check if we have new structured format or old format
  const hasStructuredSections = kundli.personalitySections && Array.isArray(kundli.personalitySections) && kundli.personalitySections.length > 0;

  // Dashboard State
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gold-gradient">
            {t('kundli.kundliOf', { name: kundli.birthDetails?.name || 'Your' })}
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            {kundli.birthDetails?.dob} | {kundli.birthDetails?.tob} | {kundli.birthDetails?.pob}
          </p>
        </div>
        <button onClick={handleReset} className="btn-outline-gold text-sm py-2 px-4">
          {t('kundli.newKundli')}
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="card-mystical text-center">
          <p className="text-text-secondary text-xs mb-1">{t('kundli.lagna')}</p>
          <p className="text-gold-light font-heading text-lg font-bold">{kundli.lagna?.sign}</p>
          <p className="text-text-secondary text-xs">{kundli.lagna?.degree}</p>
        </div>
        <div className="card-mystical text-center">
          <p className="text-text-secondary text-xs mb-1">{t('kundli.moonSign')}</p>
          <p className="text-gold-light font-heading text-lg font-bold">{kundli.moonSign?.sign}</p>
          <p className="text-text-secondary text-xs">{kundli.moonSign?.degree}</p>
        </div>
        <div className="card-mystical text-center">
          <p className="text-text-secondary text-xs mb-1">{t('kundli.nakshatra')}</p>
          <p className="text-gold-light font-heading text-lg font-bold">{kundli.moonSign?.nakshatra}</p>
          <p className="text-text-secondary text-xs">{t('kundli.pada')} {kundli.moonSign?.pada}</p>
        </div>
        <div className="card-mystical text-center">
          <p className="text-text-secondary text-xs mb-1">{t('kundli.currentDasha')}</p>
          <p className="text-gold-light font-heading text-lg font-bold">
            {kundli.currentDasha?.mahadasha?.planet}
          </p>
          <p className="text-text-secondary text-xs">
            {kundli.currentDasha?.antardasha?.planet} {t('kundli.antardasha')}
          </p>
        </div>
      </div>

      {/* Chart & Planet Positions */}
      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        <div>
          <h2 className="font-heading text-xl font-bold mb-4 text-gold-primary">
            {t('kundli.birthChart')}
          </h2>
          <div className="card-mystical">
            <KundliChart houses={kundli.houses} />
          </div>
        </div>
        <div>
          <h2 className="font-heading text-xl font-bold mb-4 text-gold-primary">
            {t('kundli.planetaryPositions')}
          </h2>
          <div className="card-mystical">
            <PlanetTable planets={kundli.planets} />
          </div>
        </div>
      </div>

      {/* ── Section Divider ── */}
      <div className="gold-divider" />

      {/* ── DETAILED ANALYSIS ── */}
      <div className="mt-10 mb-6">
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-center">
          <span className="text-gold-gradient">{t('kundli.detailedAnalysis')}</span>
        </h2>
        <p className="text-text-secondary text-center text-sm mt-2">
          {t('kundli.analysisSubtitle')}
        </p>
      </div>

      {/* Personality Sections — NEW structured format */}
      {hasStructuredSections ? (
        <div className="space-y-6 mt-8">
          {kundli.personalitySections.map((section, i) => (
            <div key={i} className="report-section">
              <h3 className="flex items-center gap-2">
                <span className="text-gold-primary text-xl">
                  {sectionIcons[section.title] || '●'}
                </span>
                {section.title}
              </h3>
              <div className="space-y-3">
                {formatParagraphs(section.content).map((para, j) => (
                  <p key={j} className="text-text-primary text-[15px] leading-[1.8]">
                    {para}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : kundli.personality ? (
        /* OLD format fallback — split wall of text into readable sections */
        <div className="space-y-6 mt-8">
          <div className="report-section">
            <h3 className="flex items-center gap-2">
              <span className="text-gold-primary text-xl">☉</span>
              {t('kundli.detailedAnalysis')}
            </h3>
            <div className="space-y-3">
              {formatParagraphs(kundli.personality).map((para, i) => (
                <p key={i} className="text-text-primary text-[15px] leading-[1.8]">
                  {para}
                </p>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* Yogas */}
      {kundli.yogas && kundli.yogas.length > 0 && (
        <div className="mt-10">
          <div className="report-section" style={{ borderLeft: 'none', paddingLeft: 0 }}>
            <h3 className="flex items-center gap-2" style={{ paddingLeft: 0 }}>
              <span className="text-gold-primary text-xl">✦</span>
              {t('kundli.yogasTitle')}
            </h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            {kundli.yogas.filter(y => y.present !== false).map((yoga, i) => (
              <div
                key={i}
                className="bg-bg-card rounded-xl p-5 border-l-4 border-l-gold-primary border border-[#2a2a5e]"
              >
                <h4 className="text-gold-light font-heading font-bold text-lg mb-2 flex items-center gap-2">
                  <span className="text-gold-primary text-sm">◈</span>
                  {yoga.name}
                </h4>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {yoga.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Dasha */}
      <div className="mt-12">
        <div className="report-section" style={{ borderLeft: 'none', paddingLeft: 0 }}>
          <h3 className="flex items-center gap-2" style={{ paddingLeft: 0 }}>
            <span className="text-gold-primary text-xl">⏳</span>
            {t('kundli.currentDashaPeriod')}
          </h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <div className="bg-bg-card rounded-xl p-5 border border-[#2a2a5e]">
            <p className="text-text-secondary text-xs uppercase tracking-widest mb-2">{t('kundli.mahadasha')}</p>
            <p className="text-gold-light font-heading font-bold text-2xl">
              {kundli.currentDasha?.mahadasha?.planet}
            </p>
            <p className="text-text-secondary text-sm mt-2">
              {kundli.currentDasha?.mahadasha?.startDate} — {kundli.currentDasha?.mahadasha?.endDate}
            </p>
          </div>
          <div className="bg-bg-card rounded-xl p-5 border border-[#2a2a5e]">
            <p className="text-text-secondary text-xs uppercase tracking-widest mb-2">{t('kundli.antardasha')}</p>
            <p className="text-gold-light font-heading font-bold text-2xl">
              {kundli.currentDasha?.antardasha?.planet}
            </p>
            <p className="text-text-secondary text-sm mt-2">
              {kundli.currentDasha?.antardasha?.startDate} — {kundli.currentDasha?.antardasha?.endDate}
            </p>
          </div>
        </div>
        {kundli.currentDasha?.interpretation && (
          <div className="report-section mt-6">
            <h3 className="flex items-center gap-2">
              <span className="text-gold-primary text-xl">☍</span>
              {t('kundli.dashaInterpretation')}
            </h3>
            <div className="space-y-3">
              {formatParagraphs(kundli.currentDasha.interpretation).map((para, i) => (
                <p key={i} className="text-text-primary text-[15px] leading-[1.8]">
                  {para}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Manglik Status */}
      {kundli.manglikStatus && (
        <div className="mt-10">
          <div className="report-section" style={{ borderLeft: 'none', paddingLeft: 0 }}>
            <h3 className="flex items-center gap-2" style={{ paddingLeft: 0 }}>
              <span className="text-gold-primary text-xl">♂</span>
              {t('kundli.manglikAnalysis')}
            </h3>
          </div>
          <div className={`bg-bg-card rounded-xl p-5 border border-[#2a2a5e] border-l-4 mt-4 ${
            kundli.manglikStatus.isManglik ? 'border-l-accent-red' : 'border-l-accent-green'
          }`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                kundli.manglikStatus.isManglik
                  ? 'bg-accent-red/20 text-accent-red'
                  : 'bg-accent-green/20 text-accent-green'
              }`}>
                {kundli.manglikStatus.isManglik ? '!' : '✓'}
              </div>
              <div>
                <p className="font-heading font-bold text-lg">
                  {kundli.manglikStatus.isManglik ? t('kundli.manglikPresent') : t('kundli.manglikAbsent')}
                </p>
                {kundli.manglikStatus.severity && kundli.manglikStatus.severity !== 'none' && (
                  <p className="text-text-secondary text-sm capitalize">
                    {t('kundli.severity')}: {kundli.manglikStatus.severity}
                  </p>
                )}
              </div>
            </div>
            <p className="text-text-secondary text-[15px] leading-relaxed mt-2">
              {kundli.manglikStatus.details}
            </p>
          </div>
        </div>
      )}

      {/* ── Upsell ── */}
      <div className="mt-14 mb-8">
        <div className="gold-divider" />
        <h2 className="font-heading text-2xl font-bold text-center mb-2 mt-8">
          {t('kundli.unlockTitle')}
        </h2>
        <p className="text-text-secondary text-center mb-8">
          {t('kundli.unlockSubtitle')}
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {['career', 'marriage', 'health', 'varshphal', 'education'].map((type) => {
            const info = PRICING[type];
            return (
              <Link
                key={type}
                href="/reports"
                className="card-mystical no-underline flex items-center gap-4 group"
              >
                <span className="text-3xl">{info.icon}</span>
                <div className="flex-grow">
                  <h3 className="font-heading font-bold text-sm group-hover:text-gold-primary transition-colors">
                    {info.name}
                  </h3>
                  <p className="text-gold-light text-sm font-bold">₹{info.price}</p>
                </div>
                <span className="text-text-secondary group-hover:text-gold-primary transition-colors">→</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="text-text-secondary text-xs text-center mt-8 max-w-3xl mx-auto leading-relaxed">
        {t('kundli.disclaimer')}
      </div>
    </div>
  );
}
