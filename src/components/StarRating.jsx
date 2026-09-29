'use client';

import { useState } from 'react';

export default function StarRating({ value = 0, onChange, size = 'text-2xl', readonly = false }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="inline-flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => setHover(0)}
          className={`${size} transition-colors ${
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          } ${
            star <= (hover || value) ? 'text-gold-primary' : 'text-gray-600'
          }`}
        >
          {star <= (hover || value) ? '★' : '☆'}
        </button>
      ))}
    </div>
  );
}
