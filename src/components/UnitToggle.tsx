'use client';

import { Thermometer } from 'lucide-react';
import { useWeatherStore } from '@/store/use-weather-store';

export default function UnitToggle() {
  const { unit, setUnit } = useWeatherStore();

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/80 p-1 shadow-2xl">
      <div className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] text-slate-400">
        <Thermometer size={16} />
      </div>
      {(['metric', 'imperial'] as const).map((nextUnit) => (
        <button
          key={nextUnit}
          type="button"
          onClick={() => setUnit(nextUnit)}
          aria-pressed={unit === nextUnit}
          className={`h-9 min-w-11 rounded-xl px-3 text-sm font-black transition-all ${
            unit === nextUnit
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
              : 'text-slate-500 hover:bg-white/[0.05] hover:text-white'
          }`}
        >
          °{nextUnit === 'metric' ? 'C' : 'F'}
        </button>
      ))}
    </div>
  );
}
