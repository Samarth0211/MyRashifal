'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';
import BirthForm from '@/components/BirthForm';
import KundliChart from '@/components/KundliChart';
import PlanetTable from '@/components/PlanetTable';
import LoadingScreen from '@/components/LoadingScreen';
import ShareButtons from '@/components/ShareButtons';
import { saveProfile, clearOldKundliCache } from '@/lib/storage';
import { saveTempKundli, getTempKundli } from '@/lib/temp-kundli';
import { PRICING } from '@/lib/constants';
import AdBanner from '@/components/AdBanner';
import InArticleAd from '@/components/InArticleAd';
import KundliSelector from '@/components/KundliSelector';
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
  const [allKundlis, setAllKundlis] = useState([]);
  const [selectedKundliId, setSelectedKundliId] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingFromDb, setLoadingFromDb] = useState(true);
  const [error, setError] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const dashboardRef = useRef(null);

  // Normalize data (cleans up old cached formats)
  const kundli = useMemo(() => normalizeKundliData(rawKundli), [rawKundli]);

  // Clear stale shared localStorage kundli on mount
  useEffect(() => {
    clearOldKundliCache();
  }, []);

  // Load kundlis from DB for logged-in users, or sessionStorage for anonymous
  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user) {
      const temp = getTempKundli();
      if (temp) setRawKundli(temp);
      setLoadingFromDb(false);
      return;
    }
    fetch('/api/user/data')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.kundlis && data.kundlis.length > 0) {
          setAllKundlis(data.kundlis);
          const primary = data.kundlis.find((k) => k.isPrimary) || data.kundlis[0];
          setSelectedKundliId(primary.kundliId);
          setRawKundli(primary);
        } else if (data?.kundli) {
          setRawKundli(data.kundli);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingFromDb(false));
  }, [session, status]);

  // Switch kundli when selector changes
  const handleSelectKundli = (kundliId) => {
    setSelectedKundliId(kundliId);
    const k = allKundlis.find((k) => k.kundliId === kundliId);
    if (k) setRawKundli(k);
    setShowNewForm(false);
  };

  const handleAddNew = () => {
    setShowNewForm(true);
    setRawKundli(null);
    setNewLabel('');
  };

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError('');
    try {
      const payload = { ...formData, lang };
      // If adding a new kundli (not the first), pass label
      if (showNewForm && session?.user?.id) {
        payload.label = newLabel || formData.name;
      }
      // If editing existing kundli, pass kundliId
      if (selectedKundliId && !showNewForm && session?.user?.id) {
        payload.kundliId = selectedKundliId;
      }

      const res = await fetch('/api/generate-kundli', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to generate kundli');
      const data = await res.json();

      if (session?.user?.id) {
        saveProfile(formData, session.user.id);
        // Refresh kundli list
        if (data.kundliId) {
          const refreshRes = await fetch('/api/user/data');
          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            if (refreshData.kundlis) {
              setAllKundlis(refreshData.kundlis);
              setSelectedKundliId(data.kundliId);
            }
          }
        }
      } else {
        saveTempKundli(data);
      }
      setRawKundli(data);
      setShowNewForm(false);
    } catch (err) {
      setError(t('kundli.errorMsg'));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRawKundli(null);
  };

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      const { generateKundliPDF } = await import('@/lib/pdf-generator');
      await generateKundliPDF(dashboardRef, kundli.birthDetails);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setPdfLoading(false);
    }
  };

  // Loading State (DB fetch or generation)
  if (loading || loadingFromDb) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <LoadingScreen />
      </div>
    );
  }

  // Form State (no kundli selected, or adding new)
  if (!kundli || showNewForm) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-3 text-gold-gradient">
            {showNewForm ? t('selector.addNew') : t('kundli.title')}
          </h1>
          <p className="text-text-secondary">
            {t('kundli.subtitle')}
          </p>
        </div>

        {/* Show kundli selector if user has existing kundlis and is adding new */}
        {showNewForm && allKundlis.length > 0 && (
          <div className="mb-6">
            <button
              onClick={() => {
                setShowNewForm(false);
                const k = allKundlis.find((k) => k.kundliId === selectedKundliId);
                if (k) setRawKundli(k);
              }}
              className="text-gold-primary text-sm hover:underline"
            >
              ← {t('reports.backToAll')}
            </button>
          </div>
        )}

        {/* Label prompt when adding new kundli for logged-in users */}
        {showNewForm && session?.user && (
          <div className="card-mystical mb-6">
            <label className="block text-text-secondary text-sm mb-2">
              {t('selector.whoIsFor')}
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {['self', 'spouse', 'child', 'parent', 'friend'].map((s) => (
                <button
                  key={s}
                  onClick={() => setNewLabel(t(`selector.${s}`))}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                    newLabel === t(`selector.${s}`)
                      ? 'border-gold-primary text-gold-primary bg-gold-primary/10'
                      : 'border-white/[0.08] text-text-secondary hover:border-gold-primary/30'
                  }`}
                >
                  {t(`selector.${s}`)}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder={t('selector.labelPlaceholder')}
              className="input-field w-full"
            />
          </div>
        )}

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
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in" ref={dashboardRef}>
      {/* Kundli Selector — only for logged-in users with multiple kundlis */}
      {session?.user && allKundlis.length > 1 && (
        <div className="mb-6">
          <KundliSelector
            kundlis={allKundlis}
            selectedId={selectedKundliId}
            onSelect={handleSelectKundli}
            onAddNew={handleAddNew}
          />
        </div>
      )}

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
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleDownloadPDF}
            disabled={pdfLoading}
            className="btn-outline-gold text-sm py-2 px-4 flex items-center gap-2"
          >
            {pdfLoading ? t('kundli.generatingPdf') : t('kundli.downloadPdf')}
          </button>
          {session?.user && (
            <button onClick={handleAddNew} className="btn-outline-gold text-sm py-2 px-4">
              {t('selector.addNew')}
            </button>
          )}
          <button onClick={handleReset} className="btn-outline-gold text-sm py-2 px-4">
            {t('kundli.newKundli')}
          </button>
        </div>
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

      {/* Sign-in banner for anonymous users */}
      {!session?.user && (
        <div className="relative overflow-hidden rounded-2xl border border-gold-primary/30 bg-gradient-to-br from-gold-primary/10 via-bg-card to-gold-primary/5 p-6 sm:p-8 mt-8">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 text-center">
            <h3 className="font-heading text-xl sm:text-2xl font-bold text-gold-light mb-2">
              {t('signInBanner.title')}
            </h3>
            <p className="text-text-secondary text-sm mb-5 max-w-md mx-auto">
              {t('signInBanner.desc')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-5 text-sm">
              <span className="flex items-center gap-1.5 text-text-secondary">
                <span className="text-gold-primary">&#10003;</span> {t('signInBanner.benefits1')}
              </span>
              <span className="hidden sm:inline text-white/20">|</span>
              <span className="flex items-center gap-1.5 text-text-secondary">
                <span className="text-gold-primary">&#10003;</span> {t('signInBanner.benefits2')}
              </span>
              <span className="hidden sm:inline text-white/20">|</span>
              <span className="flex items-center gap-1.5 text-text-secondary">
                <span className="text-gold-primary">&#10003;</span> {t('signInBanner.benefits3')}
              </span>
            </div>
            <button
              onClick={() => signIn('google')}
              className="btn-gold text-base px-8 py-3 inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {t('signInBanner.cta')}
            </button>
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

      {/* Share */}
      <div className="mt-8">
        <ShareButtons
          text={`${kundli.birthDetails?.name || 'My'} Vedic Kundli\n\nLagna: ${kundli.positions?.find(p => p.planet === 'Ascendant')?.sign || ''} | Moon: ${kundli.positions?.find(p => p.planet === 'Moon')?.sign || ''} | Nakshatra: ${kundli.positions?.find(p => p.planet === 'Moon')?.nakshatra || ''}\n\nGenerate yours free at myrashifal.in`}
        />
      </div>

      {/* Ad — after kundli results */}
      <AdBanner format="auto" className="max-w-2xl mx-auto mt-4" />

      {/* Disclaimer */}
      <div className="text-text-secondary text-xs text-center mt-8 max-w-3xl mx-auto leading-relaxed">
        {t('kundli.disclaimer')}
      </div>

      <InArticleAd className="max-w-3xl mx-auto" />

      {/* FAQ Section — visible to Google crawlers for SEO */}
      {!kundli && (
        <section className="mt-16 max-w-3xl mx-auto">
          <h2 className="font-heading text-2xl font-bold text-gold-primary mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: 'How accurate is online kundli generation?',
                a: 'MyRashifal+ uses the astronomy-engine library (same class of calculations as Swiss Ephemeris) to compute real astronomical planetary positions with Lahiri Ayanamsa. This gives accuracy within 1-2 arc-minutes — matching professional astrology software. The key factors for accuracy are: precise birth time (even 4-5 minutes matter for Lagna), correct birth city (determines timezone and Ascendant), and proper ayanamsa (Lahiri is the Indian government standard).',
              },
              {
                q: 'Which is the best free kundli software online?',
                a: 'MyRashifal+ provides a complete free Janam Kundli with all 9 planets, 12 houses, Nakshatras, Vimshottari Dasha periods (Mahadasha + Antardasha), Manglik Dosha check, and AI-powered personality analysis. Unlike most sites that use generic lookup tables, it computes planetary positions using real astronomical ephemeris data. No sign-up needed. Available in English, Hindi, and Marathi.',
              },
              {
                q: 'What is Janam Kundli (Birth Chart)?',
                a: 'Janam Kundli is a map of the sky at the exact moment and location of your birth. It shows the positions of the Sun, Moon, and all planets across 12 houses and 27 Nakshatras. In Vedic astrology, the Kundli is used to understand personality, predict life events, check marriage compatibility (Gun Milan), and determine auspicious timings (Muhurat).',
              },
              {
                q: 'What is Lahiri Ayanamsa and why does it matter?',
                a: 'Lahiri Ayanamsa is the angular difference between the tropical zodiac (Western astrology) and the sidereal zodiac (Vedic astrology). It is the official ayanamsa adopted by the Indian government. Using the correct ayanamsa is crucial because it determines which zodiac sign each planet falls in — an incorrect ayanamsa can shift planet positions by an entire sign.',
              },
              {
                q: 'Is online kundli matching reliable for marriage?',
                a: 'Online Ashtakoot Gun Milan (36-point matching) is reliable when based on accurate planetary calculations. MyRashifal+ computes both charts using real astronomical data, then checks all 8 compatibility factors. A score of 18+ out of 36 is considered favorable. However, Gun Milan is just one part — Manglik Dosha, 7th house strength, and Dasha periods should also be checked.',
              },
            ].map(({ q, a }) => (
              <details key={q} className="card-mystical group">
                <summary className="cursor-pointer font-heading font-bold text-text-primary text-sm list-none flex items-center justify-between">
                  {q}
                  <span className="text-gold-primary ml-2 group-open:rotate-45 transition-transform text-lg">+</span>
                </summary>
                <p className="text-text-secondary text-sm leading-relaxed mt-3">{a}</p>
              </details>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
