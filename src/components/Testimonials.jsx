'use client';

import { useState, useEffect } from 'react';

const TESTIMONIALS = [
  {
    name: 'Priya S.',
    location: 'Bangalore',
    text: 'The career report was spot-on. It predicted my job change within the exact dasha period mentioned. Highly recommended!',
    rating: 5,
  },
  {
    name: 'Rahul M.',
    location: 'Jaipur',
    text: "Gun Milan score matched exactly what our family pandit calculated. Saved us ₹2000! The detailed compatibility analysis was very helpful.",
    rating: 5,
  },
  {
    name: 'Anita K.',
    location: 'Mumbai',
    text: 'I check my personalized rashifal every morning. Much better than generic newspaper horoscopes. The predictions feel personal.',
    rating: 4,
  },
  {
    name: 'Deepak T.',
    location: 'Delhi',
    text: 'The Varshphal report gave me confidence about my business decision. Worth every rupee. Very detailed month-by-month analysis.',
    rating: 5,
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % TESTIMONIALS.length);
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
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="w-full flex-shrink-0 px-4">
              <div className="card-mystical text-center">
                {/* Stars */}
                <div className="text-gold-primary mb-3">
                  {'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}
                </div>
                {/* Quote */}
                <p className="text-text-primary italic mb-4 leading-relaxed">
                  &ldquo;{t.text}&rdquo;
                </p>
                {/* Author */}
                <p className="text-gold-light font-medium">{t.name}</p>
                <p className="text-text-secondary text-sm">{t.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {TESTIMONIALS.map((_, i) => (
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
