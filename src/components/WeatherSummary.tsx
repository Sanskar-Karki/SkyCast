'use client';

import { motion } from 'framer-motion';
import { CloudRain, Wind, Droplets, Thermometer, MapPin, Eye } from 'lucide-react';
import { WeatherData } from '@/types/weather';
import { formatTemp, formatWindSpeed } from '@/lib/utils';
import { useWeatherStore } from '@/store/use-weather-store';

interface WeatherSummaryProps {
  data: WeatherData;
}

function StatPill({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 transition-all hover:bg-white/[0.05]">
      <div
        className="flex-shrink-0 rounded-xl p-2"
        style={{ background: `${color}18`, border: `1px solid ${color}30` }}
      >
        <div style={{ color }}>{icon}</div>
      </div>
      <div className="min-w-0">
        <p className="section-label mb-0.5">{label}</p>
        <p className="truncate text-sm font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

export default function WeatherSummary({ data }: WeatherSummaryProps) {
  const unit = useWeatherStore((state) => state.unit);
  const rainLevel =
    data.current.precipitationProbability >= 70
      ? { label: 'Heavy rain likely', color: '#3b82f6' }
      : data.current.precipitationProbability >= 40
      ? { label: 'Moderate rain possible', color: '#06b6d4' }
      : data.current.precipitationProbability >= 15
      ? { label: 'Light drizzle possible', color: '#8b5cf6' }
      : { label: 'Clear skies expected', color: '#10b981' };

  return (
    <div className="glass-card relative overflow-hidden">
      <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-blue-500/[0.07] blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-cyan-500/[0.06] blur-3xl pointer-events-none" />

      <div className="relative p-6 sm:p-7">
        <div className="flex justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex items-center gap-1.5">
              <MapPin size={13} className="flex-shrink-0 text-blue-400" />
              <span className="truncate text-sm font-semibold text-blue-400">{data.city}</span>
              <span className="ml-1 hidden text-xs text-white/20 sm:inline">
                {data.lat.toFixed(2)}°, {data.lon.toFixed(2)}°
              </span>
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-6xl font-black leading-none tracking-normal text-gradient-blue sm:text-[5rem]"
            >
              {formatTemp(data.current.temp, unit)}
            </motion.h2>

            <p className="mt-2 text-lg font-medium text-white/60">{data.current.condition}</p>
          </div>

          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, type: 'spring', bounce: 0.3 }}
            className="hidden flex-shrink-0 animate-float sm:block"
          >
            <div
              className="rounded-3xl p-5"
              style={{
                background: 'rgba(59,130,246,0.10)',
                border: '1px solid rgba(59,130,246,0.20)',
                boxShadow: '0 0 40px rgba(59,130,246,0.15)',
              }}
            >
              <CloudRain size={56} className="text-blue-400" />
            </div>
          </motion.div>
        </div>

        <div
          className="mt-5 flex items-center gap-2.5 rounded-xl px-4 py-2.5"
          style={{
            background: `${rainLevel.color}12`,
            border: `1px solid ${rainLevel.color}25`,
          }}
        >
          <div className="h-2 w-2 rounded-full animate-pulse" style={{ background: rainLevel.color }} />
          <span className="text-sm font-semibold" style={{ color: rainLevel.color }}>
            {rainLevel.label}
          </span>
          <span className="ml-auto whitespace-nowrap text-xs font-bold font-mono" style={{ color: `${rainLevel.color}99` }}>
            {Math.round(data.current.precipitationProbability)}%
          </span>
        </div>

        <div className="divider my-5" />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatPill icon={<Droplets size={16} />} label="Humidity" value={`${data.current.humidity}%`} color="#06b6d4" />
          <StatPill icon={<Wind size={16} />} label="Wind" value={formatWindSpeed(data.current.windSpeed, unit)} color="#8b5cf6" />
          <StatPill icon={<Thermometer size={16} />} label="Feels Like" value={formatTemp(data.current.feelsLike, unit)} color="#f97316" />
          <StatPill icon={<Eye size={16} />} label="Precip." value={`${data.current.precipitationAmount.toFixed(1)} mm`} color="#10b981" />
        </div>
      </div>
    </div>
  );
}
