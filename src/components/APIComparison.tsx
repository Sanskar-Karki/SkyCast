'use client';

import { motion } from 'framer-motion';
import { WeatherData } from '@/types/weather';
import { ShieldCheck } from 'lucide-react';
import { formatTemp } from '@/lib/utils';
import { useWeatherStore } from '@/store/use-weather-store';

interface APIComparisonProps {
  data: WeatherData;
}

const SOURCE_META: Record<string, { color: string; dot: string }> = {
  'Open-Meteo': { color: '#10b981', dot: 'bg-emerald-400' },
  OpenWeatherMap: { color: '#3b82f6', dot: 'bg-blue-400' },
  WeatherAPI: { color: '#8b5cf6', dot: 'bg-violet-400' },
};

export default function APIComparison({ data }: APIComparisonProps) {
  const maxWeight = Math.max(...data.sources.map((s) => s.weight));
  const unit = useWeatherStore((state) => state.unit);

  return (
    <div className="glass-card relative overflow-hidden">
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-500/[0.06] blur-3xl pointer-events-none" />

      <div className="relative p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <p className="section-label">Source Comparison</p>
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-emerald-400">
            <ShieldCheck size={12} />
            Smart Aggregation
          </div>
        </div>

        <div className="space-y-3">
          {data.sources.map((source, i) => {
            const meta = SOURCE_META[source.name] ?? { color: '#94a3b8', dot: 'bg-slate-400' };
            const isPrimary = source.weight === maxWeight;
            return (
              <motion.div
                key={source.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl border p-3.5 transition-all"
                style={{
                  background: isPrimary ? `${meta.color}08` : 'rgba(255,255,255,0.02)',
                  borderColor: isPrimary ? `${meta.color}25` : 'rgba(255,255,255,0.05)',
                }}
              >
                <div className="mb-2.5 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ background: meta.color, boxShadow: `0 0 6px ${meta.color}` }} />
                    <span className="truncate text-sm font-bold text-white">{source.name}</span>
                    {isPrimary && (
                      <span
                        className="rounded-full px-1.5 py-0.5 text-[9px] font-black uppercase"
                        style={{ background: `${meta.color}20`, color: meta.color }}
                      >
                        Primary
                      </span>
                    )}
                  </div>
                  <span className="section-label whitespace-nowrap">wt: {Math.round(source.weight * 100)}%</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div
                    className="rounded-xl px-3 py-2 text-center"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <p className="mb-0.5 text-[9px] font-bold uppercase text-white/30">Temperature</p>
                    <p className="font-mono text-sm font-bold" style={{ color: meta.color }}>
                      {formatTemp(source.temp, unit)}
                    </p>
                  </div>
                  <div
                    className="rounded-xl px-3 py-2 text-center"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <p className="mb-0.5 text-[9px] font-bold uppercase text-white/30">Rain Prob.</p>
                    <p className="font-mono text-sm font-bold" style={{ color: meta.color }}>
                      {Math.round(source.precipitationProbability)}%
                    </p>
                  </div>
                </div>

                <div className="mt-2.5 h-1 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: meta.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${source.weight * 100}%` }}
                    transition={{ duration: 0.9, ease: 'easeOut', delay: i * 0.1 }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        <div
          className="mt-4 rounded-xl px-4 py-2.5 text-center"
          style={{ background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.15)' }}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
            AI-weighted prediction active · variance-adjusted
          </p>
        </div>
      </div>
    </div>
  );
}
