'use client';

const SIGN_LABELS = [
  'Ari', 'Tau', 'Gem', 'Can', 'Leo', 'Vir',
  'Lib', 'Sco', 'Sag', 'Cap', 'Aqu', 'Pis',
];

// North Indian chart house coordinates
// The classic diamond pattern: outer square with inner diamond forming 12 houses
const HOUSE_PATHS = [
  // House 1 (Top center - Lagna, diamond top)
  'M 200,10 L 390,200 L 200,200 Z',
  // House 2 (Top-left upper)
  'M 200,10 L 200,200 L 10,200 Z',
  // House 3 (Top-left, left side upper)
  'M 10,10 L 200,10 L 10,200 Z',
  // House 4 (Left center)
  'M 10,200 L 200,200 L 10,390 Z',
  // House 5 (Bottom-left, left side lower)
  'M 10,390 L 10,200 L 10,390 Z',
  // House 6 (Bottom-left lower)
  'M 10,390 L 200,200 L 200,390 Z',
  // House 7 (Bottom center - opposite Lagna)
  'M 200,390 L 200,200 L 390,200 Z',
  // House 8 (Bottom-right lower)
  'M 200,390 L 390,200 L 390,390 Z',
  // House 9 (Bottom-right, right side lower)
  'M 390,390 L 390,200 L 390,390 Z',
  // House 10 (Right center)
  'M 390,200 L 200,200 L 390,10 Z',
  // House 11 (Top-right, right side upper)
  'M 390,10 L 390,200 L 390,10 Z',
  // House 12 (Top-right upper)
  'M 200,10 L 390,200 L 390,10 Z',
];

// Center positions for text in each house
const HOUSE_CENTERS = [
  { x: 200, y: 100 },  // House 1
  { x: 110, y: 100 },  // House 2
  { x: 55, y: 55 },    // House 3
  { x: 55, y: 200 },   // House 4
  { x: 55, y: 345 },   // House 5
  { x: 110, y: 305 },  // House 6
  { x: 200, y: 305 },  // House 7
  { x: 290, y: 305 },  // House 8
  { x: 345, y: 345 },  // House 9
  { x: 345, y: 200 },  // House 10
  { x: 345, y: 55 },   // House 11
  { x: 290, y: 100 },  // House 12
];

export default function KundliChart({ houses }) {
  if (!houses || houses.length === 0) return null;

  // Find the lagna sign index
  const lagnaSign = houses[0]?.sign;

  return (
    <div className="flex justify-center">
      <svg
        viewBox="0 0 400 400"
        className="w-full max-w-md"
        style={{ filter: 'drop-shadow(0 0 10px rgba(212, 160, 23, 0.2))' }}
      >
        {/* Background */}
        <rect x="0" y="0" width="400" height="400" fill="#0a0a2e" rx="8" />

        {/* Outer square */}
        <rect
          x="10" y="10" width="380" height="380"
          fill="none" stroke="#d4a017" strokeWidth="2"
        />

        {/* Diamond (inner lines) */}
        <line x1="200" y1="10" x2="10" y2="200" stroke="#d4a017" strokeWidth="1.5" />
        <line x1="200" y1="10" x2="390" y2="200" stroke="#d4a017" strokeWidth="1.5" />
        <line x1="10" y1="200" x2="200" y2="390" stroke="#d4a017" strokeWidth="1.5" />
        <line x1="390" y1="200" x2="200" y2="390" stroke="#d4a017" strokeWidth="1.5" />

        {/* Horizontal and vertical center lines */}
        <line x1="10" y1="200" x2="390" y2="200" stroke="#d4a017" strokeWidth="1" opacity="0.5" />
        <line x1="200" y1="10" x2="200" y2="390" stroke="#d4a017" strokeWidth="1" opacity="0.5" />

        {/* House numbers and planets */}
        {houses.map((house, i) => {
          const center = HOUSE_CENTERS[i];
          const planets = house.planets || [];
          const signLabel = house.sign ? house.sign.substring(0, 3) : '';

          return (
            <g key={i}>
              {/* Sign abbreviation */}
              <text
                x={center.x}
                y={center.y - 15}
                textAnchor="middle"
                fill="#9999bb"
                fontSize="10"
                fontFamily="Lato, sans-serif"
              >
                {signLabel}
              </text>

              {/* House number */}
              {i === 0 && (
                <text
                  x={center.x}
                  y={center.y - 28}
                  textAnchor="middle"
                  fill="#d4a017"
                  fontSize="9"
                  fontWeight="bold"
                >
                  Lagna
                </text>
              )}

              {/* Planets */}
              {planets.map((planet, pi) => (
                <text
                  key={pi}
                  x={center.x + (pi % 3 - 1) * 28}
                  y={center.y + 5 + Math.floor(pi / 3) * 16}
                  textAnchor="middle"
                  fill="#f5c542"
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="Lato, sans-serif"
                >
                  {planet}
                </text>
              ))}
            </g>
          );
        })}

        {/* Center label */}
        <text
          x="200" y="200"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#d4a017"
          fontSize="11"
          fontFamily="Playfair Display, serif"
          opacity="0.6"
        >
          Rashi Chart
        </text>
      </svg>
    </div>
  );
}
