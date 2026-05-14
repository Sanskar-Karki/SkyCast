'use client';

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
import { HourlyForecast } from '@/types/weather';
import { formatTemp, TemperatureUnit } from '@/lib/utils';
import { useWeatherStore } from '@/store/use-weather-store';

interface ForecastChartProps {
  data: HourlyForecast[];
}

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
          <span className="text-xs text-white/60">{entry.name}:</span>
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

export default function ForecastChart({ data }: ForecastChartProps) {
  const unit = useWeatherStore((state) => state.unit);

  return (
    <div className="glass-card relative overflow-hidden">
      <div className="absolute right-0 top-0 h-32 w-64 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

      <div className="p-6 pb-2">
        <div className="mb-1 flex items-center justify-between gap-4">
          <p className="section-label">24-Hour Forecast</p>
          <div className="flex items-center gap-4 text-[10px] font-bold uppercase">
            <span className="flex items-center gap-1.5 text-purple-400">
              <span className="inline-block h-0.5 w-3 rounded-full bg-purple-400" />
              Temp
            </span>
            <span className="flex items-center gap-1.5 text-blue-400">
              <span className="inline-block h-0.5 w-3 rounded-full bg-blue-400" />
              Rain %
            </span>
          </div>
        </div>
      </div>

      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="gTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gRain" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="2 6" vertical={false} stroke="rgba(255,255,255,0.04)" />

            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 11, fontWeight: 600 }}
              interval={3}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 11 }}
              width={30}
            />

            <Tooltip content={<CustomTooltip unit={unit} />} />

            <ReferenceLine y={50} stroke="#3b82f620" strokeDasharray="4 4" />

            <Area
              type="monotone"
              dataKey="temp"
              name="Temp"
              stroke="#8b5cf6"
              strokeWidth={2.5}
              fill="url(#gTemp)"
              dot={false}
              activeDot={{ r: 5, fill: '#8b5cf6', stroke: '#1e1b4b', strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="precipitationProbability"
              name="Rain Prob"
              stroke="#3b82f6"
              strokeWidth={2.5}
              fill="url(#gRain)"
              dot={false}
              activeDot={{ r: 5, fill: '#3b82f6', stroke: '#1e3a8a', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
