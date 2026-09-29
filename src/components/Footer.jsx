'use client';
import Link from 'next/link';
import Brand from './Brand';
import { useLanguage } from '@/contexts/LanguageContext';
import { designCopy } from '@/translations/design';
export default function Footer() {
  const { lang, t } = useLanguage();
  const c = designCopy[lang] || designCopy.en;
  const groups = [[c.explore,[['/kundli',t('nav.kundli')],['/rashifal',t('nav.dailyRashifal')],['/matching',t('nav.matching')],['/reports',t('nav.reports')]]],[c.discover,[['/panchang',t('nav.panchang')],['/numerology',t('nav.numerology')],['/transits',t('nav.transits')],['/muhurat',t('nav.muhurat')]]],[c.connect,[['/blog',c.journal],['/astrologers',t('nav.astrologers')],['/feedback',c.feedback],['/remedies',t('nav.remedies')]]]];
  return <footer className="site-footer no-print"><div className="design-container"><div className="footer-grid"><div className="footer-brand"><Brand/><p>{c.footerDesc}</p><span>English · हिंदी · मराठी</span></div>{groups.map(([heading,links]) => <div key={heading}><h2>{heading}</h2>{links.map(([href,label]) => <Link key={href} href={href}>{label}</Link>)}</div>)}</div><div className="footer-bottom"><p>© {new Date().getFullYear()} MyRashifal+. {t('footer.madeIn')}</p><p>{t('footer.disclaimer')}</p></div></div></footer>;
}
