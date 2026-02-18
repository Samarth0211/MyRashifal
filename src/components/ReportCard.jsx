'use client';

import PaymentButton from './PaymentButton';

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
  reportType,
  badge,
}) {
  return (
    <div className="card-mystical relative flex flex-col h-full">
      {/* Badge */}
      {badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold-gradient text-bg-primary text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
          {badge}
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

      {/* Price */}
      <div className="text-center mb-4">
        {originalPrice && (
          <span className="text-text-secondary line-through text-sm mr-2">₹{originalPrice}</span>
        )}
        <span className="text-gold-light text-2xl font-bold">₹{price}</span>
      </div>

      {/* Action Button */}
      {purchased ? (
        <button
          onClick={onViewReport}
          className="btn-outline-gold w-full text-center"
        >
          View Report
        </button>
      ) : (
        <PaymentButton
          amount={price}
          reportType={reportType}
          reportName={title}
          onPaymentSuccess={onPaymentSuccess}
        />
      )}
    </div>
  );
}
