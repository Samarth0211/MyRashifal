'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const TESTIMONIAL_IDS = [
  { id: 1, rating: 5 },
  { id: 2, rating: 5 },
  { id: 3, rating: 4 },
  { id: 4, rating: 5 },
];

export default function Testimonials() {
  const { t } = useLanguage();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % TESTIMONIAL_IDS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {TESTIMONIAL_IDS.map((item, i) => (
            <div key={i} className="w-full flex-shrink-0 px-4">
              <div className="text-center py-4">
                {/* Stars */}
                <div className="flex items-center justify-center gap-1 mb-5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <svg
                      key={s}
                      className={`w-4 h-4 ${s < item.rating ? 'text-gold-primary' : 'text-text-secondary/20'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                {/* Quote */}
                <p className="text-text-primary text-base leading-relaxed mb-6 max-w-lg mx-auto">
                  &ldquo;{t(`testimonial.${item.id}.text`)}&rdquo;
                </p>
                {/* Author */}
                <p className="text-text-primary font-medium text-sm">{t(`testimonial.${item.id}.name`)}</p>
                <p className="text-text-secondary text-xs mt-0.5">{t(`testimonial.${item.id}.location`)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-6">
        {TESTIMONIAL_IDS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === current ? 'bg-gold-primary w-6' : 'bg-white/10 w-1.5'
            }`}
            style={{ touchAction: 'manipulation' }}
            aria-label={`Go to testimonial ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
