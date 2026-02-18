'use client';

import { PLANETS } from '@/lib/constants';

export default function PlanetTable({ planets }) {
  if (!planets || planets.length === 0) return null;

  const getPlanetDisplay = (planetId) => {
    const p = PLANETS.find((pl) => pl.id === planetId);
    return p ? `${p.symbol} ${p.nameEn}` : planetId;
  };

  const getDignityColor = (dignity) => {
    switch (dignity) {
      case 'exalted': return 'text-accent-green';
      case 'own': return 'text-gold-light';
      case 'friendly': return 'text-blue-400';
      case 'neutral': return 'text-text-secondary';
      case 'enemy': return 'text-orange-400';
      case 'debilitated': return 'text-accent-red';
      default: return 'text-text-secondary';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-custom">
            <th className="text-left py-3 px-2 text-gold-primary font-heading">Planet</th>
            <th className="text-left py-3 px-2 text-gold-primary font-heading">Sign</th>
            <th className="text-center py-3 px-2 text-gold-primary font-heading">House</th>
            <th className="text-left py-3 px-2 text-gold-primary font-heading hidden sm:table-cell">Nakshatra</th>
            <th className="text-center py-3 px-2 text-gold-primary font-heading">Degree</th>
            <th className="text-center py-3 px-2 text-gold-primary font-heading hidden sm:table-cell">Dignity</th>
            <th className="text-center py-3 px-2 text-gold-primary font-heading">R</th>
          </tr>
        </thead>
        <tbody>
          {planets.map((planet) => (
            <tr
              key={planet.id}
              className="border-b border-border-custom/50 hover:bg-white/5 transition-colors"
            >
              <td className="py-2.5 px-2 font-medium">{getPlanetDisplay(planet.id)}</td>
              <td className="py-2.5 px-2">{planet.sign}</td>
              <td className="py-2.5 px-2 text-center">{planet.house}</td>
              <td className="py-2.5 px-2 hidden sm:table-cell">{planet.nakshatra}</td>
              <td className="py-2.5 px-2 text-center font-mono text-xs">{planet.degree}</td>
              <td className={`py-2.5 px-2 text-center hidden sm:table-cell capitalize text-xs ${getDignityColor(planet.dignity)}`}>
                {planet.dignity || '-'}
              </td>
              <td className="py-2.5 px-2 text-center">
                {planet.retrograde ? (
                  <span className="text-accent-red font-bold">(R)</span>
                ) : (
                  <span className="text-text-secondary">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
