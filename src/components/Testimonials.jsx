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
    <div className="max-w-3xl mx-auto">
      {/* Cards */}
      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {TESTIMONIAL_IDS.map((item, i) => (
            <div key={i} className="w-full flex-shrink-0 px-4">
              <div className="card-mystical text-center">
                {/* Stars */}
                <div className="text-gold-primary mb-3">
                  {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
                </div>
                {/* Quote */}
                <p className="text-text-primary italic mb-4 leading-relaxed">
                  &ldquo;{t(`testimonial.${item.id}.text`)}&rdquo;
                </p>
                {/* Author */}
                <p className="text-gold-light font-medium">{t(`testimonial.${item.id}.name`)}</p>
                <p className="text-text-secondary text-sm">{t(`testimonial.${item.id}.location`)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {TESTIMONIAL_IDS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              i === current ? 'bg-gold-primary w-6' : 'bg-border-custom'
            }`}
            aria-label={`Go to testimonial ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
