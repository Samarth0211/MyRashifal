'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  const FOOTER_LINKS = [
    { href: '/', label: t('nav.home') },
    { href: '/kundli', label: t('nav.kundli') },
    { href: '/reports', label: t('nav.reports') },
    { href: '/matching', label: t('nav.matching') },
    { href: '/muhurat', label: t('nav.muhurat') },
    { href: '/rashifal', label: t('nav.dailyRashifal') },
  ];

  return (
    <footer className="bg-bg-secondary border-t border-border-custom mt-auto no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Links Row */}
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-text-secondary hover:text-gold-primary transition-colors text-sm no-underline"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Divider */}
        <div className="gold-divider" />

        {/* Disclaimer */}
        <p className="text-text-secondary text-xs text-center max-w-3xl mx-auto leading-relaxed mb-6">
          {t('footer.disclaimer')}
        </p>

        {/* Bottom Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-text-secondary text-xs">
          <p>{t('footer.madeIn')}</p>
          <p>{t('footer.rights', { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
}
