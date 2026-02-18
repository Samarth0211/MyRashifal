'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import UserMenu from './UserMenu';
import LanguageToggle from './LanguageToggle';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useLanguage();

  const NAV_LINKS = [
    { href: '/', label: t('nav.home') },
    { href: '/kundli', label: t('nav.myKundli') },
    { href: '/reports', label: t('nav.reports') },
    { href: '/matching', label: t('nav.matching') },
    { href: '/muhurat', label: t('nav.muhurat') },
    { href: '/rashifal', label: t('nav.dailyRashifal') },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-bg-primary/90 backdrop-blur-md border-b border-border-custom">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 no-underline">
              <span className="text-2xl">☉</span>
              <span className="text-xl font-heading font-bold text-gold-gradient">
                MyRashifal+
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all no-underline ${
                      isActive
                        ? 'text-gold-primary bg-gold-primary/10 border-b-2 border-gold-primary'
                        : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Auth + CTA + Language (Desktop) */}
            <div className="hidden md:flex items-center gap-3">
              <LanguageToggle />
              <Link
                href="/kundli"
                className="btn-gold text-sm no-underline inline-block"
              >
                {t('nav.freeKundli')}
              </Link>
              <UserMenu />
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-text-primary p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Nav — rendered OUTSIDE <nav> so backdrop-filter doesn't trap the overlay */}
      {mobileOpen && (
        <div className="nav-overlay md:hidden">
          <div className="flex flex-col pt-20 px-6 gap-2">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-4 rounded-lg text-lg font-medium no-underline transition-all min-h-[48px] flex items-center ${
                    isActive
                      ? 'text-gold-primary bg-gold-primary/10'
                      : 'text-text-primary hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/kundli"
              onClick={() => setMobileOpen(false)}
              className="btn-gold text-center mt-4 no-underline"
            >
              {t('nav.freeKundli')}
            </Link>
            <div className="mt-4 flex items-center justify-center gap-4">
              <LanguageToggle />
              <UserMenu />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
