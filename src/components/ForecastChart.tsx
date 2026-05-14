import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { HourlyForecast, DailyForecast } from '@/types/weather';
import { formatTemp, TemperatureUnit } from '@/lib/utils';
import { useWeatherStore } from '@/store/use-weather-store';
import { cn } from '@/lib/utils';

interface ForecastChartProps {
  hourly: HourlyForecast[];
  daily: DailyForecast[];
}

type Timeframe = 'day' | 'week' | 'month';

type ChartPayload = {
  name: string;
  value: number;
  stroke?: string;
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: ChartPayload[];
  label?: string;
  unit: TemperatureUnit;
};

const CustomTooltip = ({ active, payload, label, unit }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-2xl px-4 py-3 text-sm"
      style={{
        background: 'rgba(13,21,38,0.95)',
        border: '1px solid rgba(255,255,255,0.10)',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
      <p className="mb-2 text-xs font-bold uppercase text-white/40">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ background: entry.stroke ?? '#94a3b8' }} />
          <span className="text-[10px] text-white/60 font-bold uppercase tracking-tighter">{entry.name}:</span>
          <span className="text-xs font-bold text-white">
            {entry.name.includes('Temp')
              ? formatTemp(entry.value, unit)
              : `${Math.round(entry.value)}%`}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function ForecastChart({ hourly, daily }: ForecastChartProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>('day');
  const unit = useWeatherStore((state) => state.unit);

  const chartData = useMemo(() => {
    if (timeframe === 'day') {
      return hourly.map(h => ({
        label: h.time,
        temp: h.temp,
        rain: h.precipitationProbability
      }));
    }
    
    // For week/month, use daily data
    const daysToShow = timeframe === 'week' ? 7 : 14;
    return daily.slice(0, daysToShow).map(d => ({
      label: d.dayLabel,
      temp: d.maxTemp,
      rain: d.precipitationProbability
    }));
  }, [timeframe, hourly, daily]);

  return (
    <div className="glass-card relative overflow-hidden">
      <div className="absolute right-0 top-0 h-32 w-64 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

      <div className="p-6 pb-2">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1">
            <p className="section-label">Future Outlook</p>
            <h3 className="text-lg font-black text-white">Weather Trends</h3>
          </div>

          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
            {(['day', 'week', 'month'] as Timeframe[]).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer",
                  timeframe === t 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" 
                    : "text-slate-500 hover:text-slate-300"
                )}
              >
                {t === 'day' ? '24 Hours' : t === 'week' ? '7 Days' : '14 Days'}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 text-[10px] font-bold uppercase">
          <span className="flex items-center gap-1.5 text-purple-400">
            <span className="inline-block h-0.5 w-3 rounded-full bg-purple-400" />
            Temperature
          </span>
          <span className="flex items-center gap-1.5 text-blue-400">
            <span className="inline-block h-0.5 w-3 rounded-full bg-blue-400" />
            Rain Chance
          </span>
        </div>
      </div>

      <div className="h-64 px-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gRain" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="2 6" vertical={false} stroke="rgba(255,255,255,0.03)" />

            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 700 }}
              interval={timeframe === 'day' ? 3 : 0}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }}
              width={40}
            />

            <Tooltip content={<CustomTooltip unit={unit} />} />

            <ReferenceLine y={50} stroke="#3b82f615" strokeDasharray="4 4" />

            <Area
              type="monotone"
              dataKey="temp"
              name="Temperature"
              stroke="#8b5cf6"
              strokeWidth={3}
              fill="url(#gTemp)"
              dot={timeframe !== 'day'}
              activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#060c1a', strokeWidth: 3 }}
            />
            <Area
              type="monotone"
              dataKey="rain"
              name="Rain Probability"
              stroke="#3b82f6"
              strokeWidth={3}
              fill="url(#gRain)"
              dot={timeframe !== 'day'}
              activeDot={{ r: 6, fill: '#3b82f6', stroke: '#060c1a', strokeWidth: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

