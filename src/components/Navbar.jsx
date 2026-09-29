'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import UserMenu from './UserMenu';
import LanguageToggle from './LanguageToggle';
import Brand from './Brand';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useLanguage();
  const { data: session } = useSession();
  const moreRef = useRef(null);
  const toggleRef = useRef(null);
  const primary = [['/','nav.home'],['/kundli','nav.myKundli'],['/rashifal','nav.dailyRashifal'],['/reports','nav.reports']];
  const more = [['/matching','nav.matching'],['/astrologers','nav.astrologers'],['/ask','nav.askAstrologer'],['/panchang','nav.panchang'],['/numerology','nav.numerology'],['/muhurat','nav.muhurat'],['/transits','nav.transits'],['/remedies','nav.remedies'],['/blog','nav.blog'],['/feedback','nav.feedback'],...(session?.user ? [['/dashboard','nav.dashboard']] : [])];
  useEffect(() => { setMoreOpen(false); setMobileOpen(false); }, [pathname]);
  useEffect(() => {
    const click = e => { if (!moreRef.current?.contains(e.target)) setMoreOpen(false); };
    const key = e => { if(e.key === 'Escape') { setMoreOpen(false); setMobileOpen(false); toggleRef.current?.focus(); } };
    document.addEventListener('mousedown',click); document.addEventListener('keydown',key);
    return () => { document.removeEventListener('mousedown',click); document.removeEventListener('keydown',key); };
  }, []);
  const navLink = ([href,key]) => <Link key={href} href={href} className={pathname === href ? 'active' : ''} aria-current={pathname === href ? 'page' : undefined} onClick={() => { setMobileOpen(false); setMoreOpen(false); }}>{t(key)}</Link>;
  return <header className="site-header"><div className="design-container header-inner"><Brand/>
    <nav aria-label="Main navigation" className="desktop-nav">{primary.map(navLink)}<div className="nav-more" ref={moreRef}><button onClick={() => setMoreOpen(!moreOpen)} aria-expanded={moreOpen} aria-controls="more-navigation">{t('nav.more')} <span aria-hidden="true">⌄</span></button>{moreOpen && <div id="more-navigation" className="nav-dropdown">{more.map(navLink)}</div>}</div></nav>
    <div className="header-actions"><LanguageToggle/><UserMenu/><Link href="/kundli" className="design-button header-cta">{t('nav.freeKundli')}<span>↗</span></Link></div>
    <button ref={toggleRef} className="mobile-toggle" aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileOpen} aria-controls="mobile-navigation" onClick={() => setMobileOpen(!mobileOpen)}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d={mobileOpen ? 'M5 5l14 14M5 19 19 5' : 'M4 7h16M4 12h16M4 17h16'}/></svg></button>
  </div>{mobileOpen && <nav id="mobile-navigation" className="mobile-navigation" aria-label="Mobile navigation"><div className="mobile-preferences"><LanguageToggle/><UserMenu/></div><div className="mobile-link-grid">{[...primary,...more].map(navLink)}</div><Link href="/kundli" onClick={() => setMobileOpen(false)} className="design-button">{t('nav.freeKundli')}<span>↗</span></Link></nav>}</header>;
}
