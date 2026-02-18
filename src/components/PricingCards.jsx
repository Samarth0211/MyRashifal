'use client';

import Link from 'next/link';

const FREE_FEATURES = [
  { feature: 'Birth Chart & Kundli', free: true, premium: true },
  { feature: 'Daily Rashifal', free: true, premium: true },
  { feature: 'Basic Personality', free: true, premium: true },
  { feature: 'Career Report', free: false, premium: true },
  { feature: 'Marriage Report', free: false, premium: true },
  { feature: 'Kundli Matching', free: false, premium: true },
  { feature: 'Ask Questions', free: false, premium: true },
  { feature: 'Varshphal Report', free: false, premium: true },
  { feature: 'Shubh Muhurat', free: false, premium: true },
];

export default function PricingCards() {
  return (
    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {/* Free Plan */}
      <div className="card-mystical flex flex-col">
        <div className="text-center mb-6">
          <h3 className="font-heading text-2xl font-bold mb-2">Free</h3>
          <p className="text-3xl font-bold text-gold-light">₹0</p>
          <p className="text-text-secondary text-sm">Forever free</p>
        </div>
        <ul className="space-y-3 flex-grow mb-6">
          {FREE_FEATURES.map((f) => (
            <li key={f.feature} className="flex items-center gap-3 text-sm">
              {f.free ? (
                <span className="text-accent-green">✓</span>
              ) : (
                <span className="text-text-secondary opacity-40">✗</span>
              )}
              <span className={f.free ? 'text-text-primary' : 'text-text-secondary opacity-40'}>
                {f.feature}
              </span>
            </li>
          ))}
        </ul>
        <Link href="/kundli" className="btn-outline-gold text-center no-underline block">
          Get Started Free
        </Link>
      </div>

      {/* Premium Plan */}
      <div className="card-mystical relative flex flex-col border-gold-primary/50">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold-gradient text-bg-primary text-xs font-bold px-4 py-1 rounded-full">
          Most Popular
        </div>
        <div className="text-center mb-6">
          <h3 className="font-heading text-2xl font-bold mb-2">Premium</h3>
          <p className="text-3xl font-bold text-gold-light">₹199<span className="text-base font-normal text-text-secondary">/mo</span></p>
          <p className="text-text-secondary text-sm">All features unlocked</p>
        </div>
        <ul className="space-y-3 flex-grow mb-6">
          {FREE_FEATURES.map((f) => (
            <li key={f.feature} className="flex items-center gap-3 text-sm">
              <span className="text-accent-green">✓</span>
              <span className="text-text-primary">{f.feature}</span>
              {!f.free && (
                <span className="text-gold-primary text-xs ml-auto">Premium</span>
              )}
            </li>
          ))}
        </ul>
        <Link href="/reports" className="btn-gold text-center no-underline block">
          Upgrade to Premium
        </Link>
        <p className="text-center text-text-secondary text-xs mt-3">
          Or buy individual reports from ₹29
        </p>
      </div>
    </div>
  );
}
