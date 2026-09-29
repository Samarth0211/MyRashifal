'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export default function AstrologerCard({ astrologer, onChatNow }) {
  const { t } = useLanguage();

  return (
    <div className="card-mystical p-5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-heading text-lg font-bold text-text-primary">
            {astrologer.name}
          </h3>
          <p className="text-text-secondary text-xs">
            {astrologer.experience} {t('astrologer.yearsExp')}
          </p>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full font-semibold ${
            astrologer.isOnline
              ? 'bg-green-500/20 text-green-400'
              : 'bg-gray-500/20 text-gray-400'
          }`}
        >
          {astrologer.isOnline ? t('astrologer.online') : t('astrologer.offline')}
        </span>
      </div>

      {/* Specializations */}
      <div className="flex flex-wrap gap-1.5">
        {astrologer.specializations?.slice(0, 3).map((spec) => (
          <span
            key={spec}
            className="text-xs px-2 py-0.5 rounded-full bg-gold-primary/10 text-gold-light border border-gold-primary/20"
          >
            {spec}
          </span>
        ))}
        {astrologer.specializations?.length > 3 && (
          <span className="text-xs text-text-secondary">
            +{astrologer.specializations.length - 3}
          </span>
        )}
      </div>

      {/* Bio */}
      {astrologer.bio && (
        <p className="text-text-secondary text-sm line-clamp-2">{astrologer.bio}</p>
      )}

      {/* Rating + Price */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/[0.06]">
        <div className="flex items-center gap-1">
          <span className="text-gold-primary text-sm">
            {'★'.repeat(Math.round(astrologer.rating?.average || 0))}
            {'☆'.repeat(5 - Math.round(astrologer.rating?.average || 0))}
          </span>
          <span className="text-text-secondary text-xs">
            ({astrologer.rating?.count || 0})
          </span>
        </div>
        <span className="text-gold-light font-bold">
          ₹{astrologer.pricePerSession}
          <span className="text-text-secondary text-xs font-normal"> /2min</span>
        </span>
      </div>

      {/* Languages */}
      <div className="flex gap-1.5">
        {astrologer.languages?.map((lang) => (
          <span key={lang} className="text-xs text-text-secondary">
            {lang === 'en' ? 'EN' : lang === 'hi' ? 'HI' : 'MR'}
          </span>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={() => onChatNow(astrologer)}
        disabled={!astrologer.isOnline}
        className="btn-gold w-full text-sm disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {astrologer.isOnline ? t('astrologer.chatNow') : t('astrologer.offline')}
      </button>
    </div>
  );
}
