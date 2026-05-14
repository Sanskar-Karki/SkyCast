'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  CloudRain, 
  Sun, 
  Sunrise, 
  Sunset
} from 'lucide-react';
import { DailyForecast } from '@/types/weather';
import { formatTemp } from '@/lib/utils';
import { useWeatherStore } from '@/store/use-weather-store';

interface DailyForecastSectionProps {
  data: DailyForecast[];
}

export default function DailyForecastSection({ data }: DailyForecastSectionProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const unit = useWeatherStore((state) => state.unit);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="section-label">7-Day Forecast</h3>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Expand for details</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {data.map((day, idx) => (
          <DayCard 
            key={day.date} 
            day={day} 
            unit={unit}
            isExpanded={expandedIndex === idx} 
            onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
          />
        ))}
      </div>
    </div>
  );
}

function DayCard({ day, unit, isExpanded, onClick }: { 
  day: DailyForecast; 
  unit: 'metric' | 'imperial';
  isExpanded: boolean; 
  onClick: () => void;
}) {
  return (
    <div 
      className={`glass-card overflow-hidden transition-all duration-300 ${isExpanded ? 'border-blue-500/30' : ''}`}
    >
      <button 
        onClick={onClick}
        className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4 flex-1">
          <div className="w-12">
            <p className="text-sm font-bold text-white">{day.dayLabel}</p>
            <p className="text-[10px] text-slate-500 font-medium">{new Date(day.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</p>
          </div>

          <div className="flex items-center gap-3 flex-1">
             <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <WeatherIcon condition={day.condition} size={20} />
             </div>
             <div>
                <p className="text-sm font-semibold text-white/90">{day.condition}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex items-center gap-1">
                    <CloudRain size={10} className="text-blue-400" />
                    <span className="text-[10px] font-bold text-blue-400">{Math.round(day.precipitationProbability)}%</span>
                  </div>
                </div>
             </div>
          </div>

          <div className="text-right">
            <div className="flex items-center justify-end gap-2">
              <span className="text-base font-black text-white">{formatTemp(day.maxTemp, unit)}</span>
              <span className="text-xs font-bold text-slate-500">{formatTemp(day.minTemp, unit)}</span>
            </div>
          </div>
        </div>

        <motion.div 
          animate={{ rotate: isExpanded ? 180 : 0 }}
          className="text-slate-600"
        >
          <ChevronDown size={20} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="px-5 pb-6 border-t border-white/[0.04]">
              {/* Sun Info Row */}
              <div className="flex items-center justify-center gap-8 py-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-amber-500/10 border border-amber-500/20">
                    <Sunrise size={16} className="text-amber-500" />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Sunrise</p>
                    <p className="text-xs font-bold text-white">{day.sunrise}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-purple-500/10 border border-purple-500/20">
                    <Sunset size={16} className="text-purple-500" />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Sunset</p>
                    <p className="text-xs font-bold text-white">{day.sunset}</p>
                  </div>
                </div>
              </div>

              {/* Hourly breakdown scroll */}
              <div className="mt-2">
                <p className="section-label mb-3">Hourly Breakdown</p>
                <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                  {day.hourly.filter((_, i) => i % 2 === 0).map((hour, hidx) => (
                    <div 
                      key={hidx}
                      className="flex-shrink-0 w-20 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex flex-col items-center gap-2"
                    >
                      <span className="text-[10px] font-bold text-slate-400">{hour.time}</span>
                      <WeatherIcon condition={hour.condition} size={16} />
                      <span className="text-xs font-bold text-white">{formatTemp(hour.temp, unit)}</span>
                      <div className="flex items-center gap-1">
                         <CloudRain size={8} className="text-blue-500" />
                         <span className="text-[8px] font-black text-blue-500">{hour.precipitationProbability}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function WeatherIcon({ condition, size = 20 }: { condition: string, size?: number }) {
  const cond = condition.toLowerCase();
  if (cond.includes('clear') || cond.includes('sunny')) return <Sun size={size} className="text-amber-400" />;
  if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('showers')) return <CloudRain size={size} className="text-blue-400" />;
  if (cond.includes('storm')) return <CloudRain size={size} className="text-purple-400" />;
  return <Sun size={size} className="text-slate-400" />; // Fallback to partly cloudy look
}
