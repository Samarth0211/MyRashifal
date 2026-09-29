'use client';
import { useLanguage } from '@/contexts/LanguageContext';
export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  return <label className="language-select"><span className="sr-only">Language</span><select value={lang} onChange={e => setLang(e.target.value)} aria-label="Language"><option value="en">EN</option><option value="hi">हिंदी</option><option value="mr">मराठी</option></select></label>;
}
