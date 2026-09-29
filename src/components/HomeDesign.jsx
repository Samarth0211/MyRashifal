'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { designCopy } from '@/translations/design';
import { RASHIS } from '@/lib/constants';
import CelestialWheel from './CelestialWheel';
import DesignIcon from './DesignIcon';

export default function HomeDesign() {
  const { lang, t } = useLanguage();
  const c = designCopy[lang] || designCopy.en;
  const [panchang, setPanchang] = useState(null);
  const [dailyStatus, setDailyStatus] = useState('loading');
  const [date, setDate] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    setDate(new Date().toLocaleDateString(lang === 'en' ? 'en-IN' : `${lang}-IN`, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' }));
    fetch(`/api/panchang?date=${today}&city=Delhi`, { signal: controller.signal }).then(r => { if (!r.ok) throw new Error(); return r.json(); }).then(data => { setPanchang(data); setDailyStatus('ready'); }).catch(error => { if (error.name !== 'AbortError') setDailyStatus('error'); });
    return () => controller.abort();
  }, [lang]);
  return <div className="redesign-home" lang={lang}>
    <section className="home-hero design-container"><div className="hero-copy">
      <p className="eyebrow"><span/> {c.eyebrow}</p><h1>{c.title[0]}<br/>{c.title[1]}<br/><em>{c.title[2]}</em></h1><p className="hero-description">{c.intro}</p>
      <div className="hero-actions"><Link className="design-button" href="/kundli">{c.primary}<DesignIcon name="arrow" size={18}/></Link><Link className="text-link" href="#your-rashi">{c.secondary}<span>↗</span></Link></div>
      <div className="hero-reassurance"><span><DesignIcon name="check" size={15}/>{c.free}</span><span><DesignIcon name="check" size={15}/>{c.signup}</span></div>
    </div><div className="hero-art"><div className="art-topline"><span>EST. IN THE STARS</span><DesignIcon name="star" size={17}/><span>ROOTED IN YOU</span></div><CelestialWheel/><div className="art-caption"><span>{c.wheel}</span><p>{c.wheelSub}</p></div></div></section>
    <div className="principles"><div className="design-container">{c.strip.map((label,i) => <span key={label}><DesignIcon name={['chart','sun','star'][i]} size={20}/>{label}</span>)}</div></div>
    <section id="your-rashi" className="zodiac-section design-container"><div className="section-heading centered"><p className="eyebrow">{c.zodiacLabel}</p><h2>{c.zodiacTitle}</h2><p>{c.zodiacDesc}</p></div>
      <div className="zodiac-grid">{RASHIS.map((rashi,i) => <Link key={rashi.id} href={`/rashifal/${rashi.id}`} className="zodiac-item"><span className="zodiac-glyph">{['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'][i]}</span><strong>{lang === 'en' ? rashi.nameEn : (lang === 'mr' ? rashi.nameMr : rashi.nameHi)?.split('(')[0]}</strong><small>{lang === 'en' ? rashi.nameHi.split('(')[0] : rashi.nameEn}</small></Link>)}</div>
      <p className="zodiac-help">{c.zodiacHelp} <Link href="/kundli">{c.find} ↗</Link></p></section>
    <section className="services-section"><div className="design-container"><div className="section-heading"><p className="eyebrow">{c.serviceLabel}</p><h2>{c.serviceTitle}</h2><p>{c.serviceDesc}</p></div>
      <div className="service-grid">{c.cards.map(([title,description,action],i) => <article className={`service-card service-${i}`} key={title}><div className="service-icon"><DesignIcon name={['chart','heart','book'][i]} size={28}/></div><span className="service-index">0{i+1}</span><h3>{title}</h3><p>{description}</p><Link href={['/kundli','/matching','/reports'][i]}>{action}<DesignIcon name="arrow" size={19}/></Link></article>)}</div>
      <div className="tools-row">{[['/numerology','nav.numerology'],['/muhurat','nav.muhurat'],['/transits','nav.transits'],['/remedies','nav.remedies']].map(([href,key]) => <Link key={href} href={href}>{t(key)}<span>↗</span></Link>)}</div></div></section>
    <section className="daily-section design-container"><div className="section-heading"><p className="eyebrow">{c.dailyLabel}</p><h2>{c.dailyTitle}</h2><p>{c.dailyDesc}</p><Link className="text-link" href="/panchang">{c.dailyLink}<DesignIcon name="arrow" size={18}/></Link></div>
      <div className="panchang-preview"><div className="panchang-top"><span className="daily-sun"><DesignIcon name="sun" size={30}/></span><div><p>{date || 'Panchang'}</p><small>{c.location}</small></div><span className="live-dot"/></div>{dailyStatus === 'ready' && panchang ? <dl>{[[c.tithi,panchang.tithi?.name],[c.nakshatra,panchang.nakshatra?.name],[c.yoga,panchang.yoga]].map(([label,value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl> : <p className="daily-status" aria-live="polite">{dailyStatus === 'loading' ? c.loading : c.unavailable}</p>}<Link href="/panchang">{t('nav.panchang')}<DesignIcon name="arrow" size={17}/></Link></div></section>
    <section className="journey-section design-container"><div className="section-heading centered"><p className="eyebrow">{c.howLabel}</p><h2>{c.howTitle}</h2></div><div className="journey-grid">{c.steps.map(([title,desc],i) => <div key={title}><span className="step-number">0{i+1}</span><h3>{title}</h3><p>{desc}</p></div>)}</div></section>
    <section className="faq-section design-container"><div className="section-heading"><p className="eyebrow">{c.faqLabel}</p><h2>{c.faqTitle}</h2><DesignIcon name="star" size={48}/></div><div className="faq-list">{c.faqs.map(([q,a]) => <details key={q}><summary>{q}<span aria-hidden="true">+</span></summary><p>{a}</p></details>)}</div></section>
    <section className="closing-section design-container"><div className="closing-inner"><DesignIcon name="sun" size={38}/><p className="eyebrow">{c.ctaLabel}</p><h2>{c.ctaTitle}</h2><p>{c.ctaDesc}</p><Link href="/kundli" className="design-button light-button">{c.primary}<DesignIcon name="arrow" size={18}/></Link><span className="closing-ring ring-one"/><span className="closing-ring ring-two"/></div></section>
  </div>;
}
