'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import NewsletterSignup from '@/components/NewsletterSignup';

const FEATURES = [
  { key: 'download.feature1', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
    </svg>
  )},
  { key: 'download.feature2', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  )},
  { key: 'download.feature3', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  )},
  { key: 'download.feature4', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
    </svg>
  )},
];

export default function DownloadPage() {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleNotify = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    } catch { /* ignore */ }
    setSubmitted(true);
  };

  return (
    <div className="relative min-h-[90vh] overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-gold-primary/[0.06] to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-radial from-gold-primary/[0.03] to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-16 sm:py-24">
        {/* Two-column hero on desktop */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">

          {/* Left: Content */}
          <div className={`transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Coming Soon pill */}
            <div className="inline-flex items-center gap-2 bg-gold-primary/10 border border-gold-primary/20 rounded-full px-4 py-1.5 mb-6">
              <span className="dl-live-dot" />
              <span className="text-gold-light text-sm font-medium tracking-wide">{t('download.comingSoon')}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold leading-tight mb-5">
              <span className="text-gold-gradient">{t('download.title')}</span>
            </h1>

            <p className="text-text-secondary text-lg sm:text-xl leading-relaxed mb-8 max-w-lg">
              {t('download.subtitle')}
            </p>

            {/* Google Play badge */}
            <div className="dl-play-badge mb-8">
              <svg viewBox="0 0 24 24" className="w-7 h-7 flex-shrink-0" fill="none">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92z" fill="#4285F4"/>
                <path d="M17.556 8.222L14.852 12l2.704 3.778 3.146-1.85a1 1 0 000-1.742l-3.146-1.964z" fill="#FBBC04"/>
                <path d="M3.61 1.814L14.85 12l-3.06-3.06L6.07.674a1.003 1.003 0 00-2.46 1.14z" fill="#34A853"/>
                <path d="M3.61 22.186l8.18-8.18L14.85 12l-3.06 3.06-5.72 5.28a1 1 0 01-2.46-1.154v3z" fill="#EA4335"/>
              </svg>
              <div>
                <p className="text-[11px] text-text-secondary uppercase tracking-widest leading-none">{t('download.comingSoon')}</p>
                <p className="text-text-primary font-semibold text-base leading-tight mt-0.5">Google Play</p>
              </div>
            </div>

            {/* Feature list */}
            <div className="space-y-3">
              {FEATURES.map((f, i) => (
                <div
                  key={f.key}
                  className={`dl-feature-row transition-all duration-500 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                  style={{ transitionDelay: `${300 + i * 100}ms` }}
                >
                  <span className="text-gold-primary">{f.icon}</span>
                  <span className="text-text-primary text-sm">{t(f.key)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Phone mockup */}
          <div className={`flex justify-center lg:justify-end transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <div className="dl-phone">
              <div className="dl-phone-notch" />
              <div className="dl-phone-screen">
                <div className="dl-phone-status">
                  <span className="text-[10px] text-text-secondary/60">9:41</span>
                  <div className="flex gap-1">
                    <div className="w-3.5 h-1.5 rounded-sm bg-text-secondary/40" />
                    <div className="w-1.5 h-1.5 rounded-full bg-text-secondary/40" />
                  </div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center gap-3">
                  <div className="dl-app-icon-wrapper">
                    <Image
                      src="/icon-512-maskable.png"
                      alt="MyRashifal+"
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-[22px]"
                    />
                  </div>
                  <p className="text-gold-light font-heading font-bold text-base">MyRashifal+</p>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(s => (
                      <svg key={s} className="w-3 h-3 text-gold-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-text-secondary text-[10px] ml-1">5.0</span>
                  </div>
                  <span className="text-[10px] text-text-secondary/50 tracking-wider uppercase">Vedic Astrology</span>
                </div>
                <div className="dl-phone-nav">
                  <div className="w-8 h-0.5 rounded-full bg-text-secondary/30" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notify section */}
        <div className={`max-w-xl mx-auto transition-all duration-700 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="dl-notify-card">
            {!submitted ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-gold-primary/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-gold-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-heading text-base font-bold text-text-primary leading-tight">
                      {t('download.notifyTitle')}
                    </h2>
                    <p className="text-text-secondary text-xs mt-0.5">
                      {t('download.notifyDesc')}
                    </p>
                  </div>
                </div>
                <form onSubmit={handleNotify} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('download.emailPlaceholder')}
                    required
                    className="input-mystical flex-1 text-sm !py-2.5"
                  />
                  <button type="submit" className="btn-gold whitespace-nowrap text-sm px-5 !py-2.5">
                    {t('download.notifyBtn')}
                  </button>
                </form>
              </>
            ) : (
              <div className="flex items-center gap-3 py-1">
                <div className="w-10 h-10 rounded-full bg-accent-green/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-text-primary font-semibold">{t('download.notifySuccess')}</p>
                  <p className="text-text-secondary text-sm">{t('download.notifySuccessDesc')}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className={`max-w-md mx-auto mt-12 transition-all duration-700 delay-600 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <NewsletterSignup />
        </div>

        {/* Divider */}
        <div className="h-px bg-border/50 max-w-xs mx-auto my-12" />

        {/* CTA to web version */}
        <div className={`text-center transition-all duration-700 delay-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <p className="text-text-secondary text-sm mb-4">{t('download.meanwhile')}</p>
          <Link href="/kundli" className="btn-outline-gold text-base no-underline inline-block">
            {t('download.useWeb')}
          </Link>
        </div>
      </div>
    </div>
  );
}
