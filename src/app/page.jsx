'use client';

import Link from 'next/link';
import PricingCards from '@/components/PricingCards';
import Testimonials from '@/components/Testimonials';
import { useLanguage } from '@/contexts/LanguageContext';

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <>
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-4 overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-gold-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gold-light/5 rounded-full blur-3xl" />

        <div className="text-center max-w-4xl mx-auto relative z-10 animate-fade-in">
          {/* Badge */}
          <div className="inline-block bg-gold-primary/10 border border-gold-primary/30 rounded-full px-4 py-1.5 text-gold-light text-sm mb-6">
            {t('home.badge')}
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-heading font-bold mb-6 leading-tight">
            <span className="text-gold-gradient">MyRashifal+</span>
          </h1>

          {/* Tagline */}
          <p className="text-xl sm:text-2xl text-text-secondary font-light mb-8 max-w-2xl mx-auto text-balance">
            {t('home.tagline')}
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/kundli" className="btn-gold text-lg no-underline inline-block">
              {t('home.ctaFreeKundli')}
            </Link>
            <Link href="/rashifal" className="btn-outline-gold text-lg no-underline inline-block">
              {t('home.ctaDailyRashifal')}
            </Link>
          </div>

          {/* Social Proof */}
          <p className="text-text-secondary text-sm mt-8">
            {t('home.socialProof')}
          </p>
        </div>
      </section>

      {/* ===== VALUE PROPS ===== */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-center mb-4">
            {t('home.whyTitle')}
          </h2>
          <p className="text-text-secondary text-center mb-12 max-w-xl mx-auto">
            {t('home.whySubtitle')}
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="card-mystical text-center">
              <div className="w-16 h-16 bg-gold-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔭</span>
              </div>
              <h3 className="font-heading text-xl font-bold mb-3">{t('home.preciseTitle')}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                {t('home.preciseDesc')}
              </p>
            </div>

            {/* Card 2 */}
            <div className="card-mystical text-center">
              <div className="w-16 h-16 bg-gold-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📜</span>
              </div>
              <h3 className="font-heading text-xl font-bold mb-3">{t('home.classicalTitle')}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                {t('home.classicalDesc')}
              </p>
            </div>

            {/* Card 3 */}
            <div className="card-mystical text-center">
              <div className="w-16 h-16 bg-gold-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="font-heading text-xl font-bold mb-3">{t('home.personalTitle')}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                {t('home.personalDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-20 px-4 bg-bg-secondary/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-center mb-12">
            {t('home.howTitle')}
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                titleKey: 'home.step1Title',
                descKey: 'home.step1Desc',
                icon: '📝',
              },
              {
                step: '02',
                titleKey: 'home.step2Title',
                descKey: 'home.step2Desc',
                icon: '☉',
              },
              {
                step: '03',
                titleKey: 'home.step3Title',
                descKey: 'home.step3Desc',
                icon: '✨',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="relative inline-block mb-6">
                  <span className="text-6xl">{item.icon}</span>
                  <span className="absolute -top-2 -right-4 text-gold-primary font-heading text-lg font-bold">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-heading text-xl font-bold mb-3">{t(item.titleKey)}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{t(item.descKey)}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/kundli" className="btn-gold text-lg no-underline inline-block">
              {t('home.startNow')}
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FEATURES OVERVIEW ===== */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-center mb-4">
            {t('home.featuresTitle')}
          </h2>
          <p className="text-text-secondary text-center mb-12 max-w-xl mx-auto">
            {t('home.featuresSubtitle')}
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '☉', titleKey: 'home.featureJanamKundli', descKey: 'home.featureJanamKundliDesc', href: '/kundli', free: true },
              { icon: '📰', titleKey: 'home.featureDailyRashifal', descKey: 'home.featureDailyRashifalDesc', href: '/rashifal', free: true },
              { icon: '💼', titleKey: 'home.featureCareer', descKey: 'home.featureCareerDesc', href: '/reports', free: false },
              { icon: '💍', titleKey: 'home.featureMatching', descKey: 'home.featureMatchingDesc', href: '/matching', free: false },
              { icon: '🕐', titleKey: 'home.featureMuhurat', descKey: 'home.featureMuhuratDesc', href: '/muhurat', free: false },
              { icon: '❓', titleKey: 'home.featureAsk', descKey: 'home.featureAskDesc', href: '/ask', free: false },
            ].map((item) => (
              <Link
                key={item.titleKey}
                href={item.href}
                className="card-mystical no-underline group"
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{item.icon}</span>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-heading text-lg font-bold group-hover:text-gold-primary transition-colors">
                        {t(item.titleKey)}
                      </h3>
                      {item.free && (
                        <span className="text-accent-green text-xs bg-accent-green/10 px-2 py-0.5 rounded-full">
                          {t('home.free')}
                        </span>
                      )}
                    </div>
                    <p className="text-text-secondary text-sm">{t(item.descKey)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section className="py-20 px-4 bg-bg-secondary/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-center mb-4">
            {t('home.pricingTitle')}
          </h2>
          <p className="text-text-secondary text-center mb-12 max-w-xl mx-auto">
            {t('home.pricingSubtitle')}
          </p>
          <PricingCards />
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-center mb-4">
            {t('home.testimonialsTitle')}
          </h2>
          <p className="text-text-secondary text-center mb-12">
            {t('home.testimonialsSubtitle')}
          </p>
          <Testimonials />
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-6">
            {t('home.ctaTitle')}
          </h2>
          <p className="text-text-secondary mb-8">
            {t('home.ctaDesc')}
          </p>
          <Link href="/kundli" className="btn-gold text-lg no-underline inline-block">
            {t('home.ctaButton')}
          </Link>
        </div>
      </section>
    </>
  );
}
