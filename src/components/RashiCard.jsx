'use client';

export default function RashiCard({ rashi, onClick, selected }) {
  return (
    <button
      onClick={() => onClick(rashi)}
      className={`card-mystical text-center cursor-pointer w-full transition-all ${
        selected
          ? 'border-gold-primary bg-gold-primary/10 shadow-lg shadow-gold-primary/10'
          : ''
      }`}
    >
      <span className="text-4xl block mb-2">{rashi.symbol}</span>
      <h3 className="font-heading text-base font-bold text-text-primary mb-0.5">
        {rashi.nameEn}
      </h3>
      <p className="text-text-secondary text-xs font-hindi">{rashi.nameHi}</p>
      <p className="text-text-secondary text-xs mt-1">{rashi.dateRange}</p>
    </button>
  );
}
