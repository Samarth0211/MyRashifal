'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import PaymentButton from './PaymentButton';
import LoyaltyProgress from './LoyaltyProgress';

export default function ReportCard({
  icon,
  title,
  description,
  price,
  originalPrice,
  features,
  purchased,
  onPaymentSuccess,
  onViewReport,
  onClaimFree,
  reportType,
  kundliId,
  badge,
  loyaltyCount = 0,
  festivalOffer,
}) {
  const { t } = useLanguage();
  const isLoyaltyFree = loyaltyCount >= 3 && !purchased;
  const festivalPrice = festivalOffer?.active
    ? Math.round(price * (1 - festivalOffer.discount / 100))
    : null;

  return (
    <div className="card-mystical relative flex flex-col h-full">
      {/* Badge */}
      {badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold-gradient text-bg-primary text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
          {badge}
        </div>
      )}

      {/* Loyalty free badge */}
      {isLoyaltyFree && !badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent-green text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
          {t('loyalty.freeAvailable')}
        </div>
      )}

      {/* Icon & Title */}
      <div className="text-center mb-4">
        <span className="text-4xl block mb-2">{icon}</span>
        <h3 className="font-heading text-xl font-bold text-text-primary">{title}</h3>
      </div>

      {/* Description */}
      <p className="text-text-secondary text-sm text-center mb-4 flex-grow">
        {description}
      </p>

      {/* Features */}
      {features && features.length > 0 && (
        <ul className="text-sm text-text-secondary space-y-1.5 mb-6">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-gold-primary mt-0.5">✦</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Loyalty Progress (if has any paid purchases for this type) */}
      {loyaltyCount > 0 && !purchased && !isLoyaltyFree && (
        <div className="mb-4">
          <LoyaltyProgress reportType={reportType} paidCount={loyaltyCount} compact />
        </div>
      )}

      {/* Price */}
      <div className="text-center mb-4">
        {isLoyaltyFree ? (
          <>
            <span className="text-text-secondary line-through text-sm mr-2">₹{price}</span>
            <span className="text-accent-green text-2xl font-bold">{t('loyalty.free')}</span>
          </>
        ) : festivalPrice && !purchased ? (
          <>
            <span className="text-text-secondary line-through text-sm mr-2">₹{price}</span>
            <span className="text-gold-light text-2xl font-bold">₹{festivalPrice}</span>
            <span className="ml-2 text-accent-green text-xs font-semibold">{festivalOffer.discount}% off</span>
          </>
        ) : (
          <>
            {originalPrice && (
              <span className="text-text-secondary line-through text-sm mr-2">₹{originalPrice}</span>
            )}
            <span className="text-gold-light text-2xl font-bold">₹{price}</span>
          </>
        )}
      </div>

      {/* Action Button */}
      {purchased ? (
        <button
          onClick={onViewReport}
          className="btn-outline-gold w-full text-center"
        >
          {t('reports.viewReport')}
        </button>
      ) : isLoyaltyFree ? (
        <button
          onClick={onClaimFree}
          className="btn-gold w-full text-center"
        >
          {t('loyalty.claimFreeReport')}
        </button>
      ) : (
        <PaymentButton
          amount={festivalPrice || price}
          reportType={reportType}
          reportName={title}
          kundliId={kundliId}
          onPaymentSuccess={onPaymentSuccess}
        />
      )}
    </div>
  );
}
