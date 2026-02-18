import Link from 'next/link';

const FOOTER_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/kundli', label: 'Kundli' },
  { href: '/reports', label: 'Reports' },
  { href: '/matching', label: 'Matching' },
  { href: '/muhurat', label: 'Muhurat' },
  { href: '/rashifal', label: 'Daily Rashifal' },
];

export default function Footer() {
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
          MyRashifal+ provides astrological analysis based on classical Vedic astrology principles.
          For spiritual guidance and entertainment purposes only. Not a substitute for professional advice.
        </p>

        {/* Bottom Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-text-secondary text-xs">
          <p>Made with ♋ in India</p>
          <p>&copy; {new Date().getFullYear()} MyRashifal+. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
