'use client';

import { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

export default function GlowCard({ children, className = '', as = 'div', ...props }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Tilt: max 8 degrees
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    setTilt({ rotateX, rotateY });
    setGlowPos({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  }, []);

  const handleMouseEnter = useCallback(() => setIsHovering(true), []);
  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    setTilt({ rotateX: 0, rotateY: 0 });
  }, []);

  const Component = motion[as] || motion.div;

  return (
    <Component
      ref={cardRef}
      className={`glow-card-wrapper ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: tilt.rotateX,
        rotateY: tilt.rotateY,
        scale: isHovering ? 1.02 : 1,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{ transformStyle: 'preserve-3d', perspective: 800 }}
      {...props}
    >
      {/* Glow overlay */}
      <div
        className="glow-card-glow"
        style={{
          opacity: isHovering ? 1 : 0,
          background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, rgba(201, 149, 26, 0.15) 0%, transparent 60%)`,
        }}
      />
      {/* Border glow */}
      <div
        className="glow-card-border"
        style={{
          opacity: isHovering ? 1 : 0,
          background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, rgba(232, 191, 75, 0.4) 0%, transparent 50%)`,
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </Component>
  );
}
