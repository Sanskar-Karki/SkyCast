'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { CloudRain, Clock, Umbrella } from 'lucide-react';
import { ShortTermRain } from '@/types/weather';

interface ShortTermRainProps {
  data: ShortTermRain;
}

type Tab = '1h' | '2h' | '3-6h';

const TABS: { id: Tab; label: string; key: keyof Pick<ShortTermRain, 'next1h' | 'next2h' | 'next3to6h'> }[] = [
  { id: '1h',   label: 'Next 1h',   key: 'next1h'    },
  { id: '2h',   label: 'Next 2h',   key: 'next2h'    },
  { id: '3-6h', label: 'Next 3-6h', key: 'next3to6h' },
];

function getRainMeta(prob: number) {
  if (prob < 15) return { label: 'Very Unlikely', color: '#10b981', bg: '#10b98112', bar: '#10b981' };
  if (prob < 35) return { label: 'Low Chance',    color: '#06b6d4', bg: '#06b6d412', bar: '#06b6d4' };
  if (prob < 60) return { label: 'Possible',      color: '#f59e0b', bg: '#f59e0b12', bar: '#f59e0b' };
  if (prob < 80) return { label: 'Likely',         color: '#3b82f6', bg: '#3b82f612', bar: '#3b82f6' };
  return               { label: 'Almost Certain', color: '#ef4444', bg: '#ef444412', bar: '#ef4444' };
}

type RainTooltipProps = {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
};

const CustomTooltip = ({ active, payload, label }: RainTooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-xl text-xs" style={{ background: 'rgba(13,21,38,0.96)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <p className="text-white/40 font-bold mb-1">{label}</p>
      <p className="text-blue-400 font-bold">{Math.round(payload[0].value)}% rain chance</p>
    </div>
  );
};

export default function ShortTermRainModule({ data }: ShortTermRainProps) {
  const [activeTab, setActiveTab] = useState<Tab>('1h');

  const activeTabDef = TABS.find(t => t.id === activeTab)!;
  const prob = Math.round(data[activeTabDef.key]);
  const meta = getRainMeta(prob);
  const needsUmbrella = prob >= 40;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card relative overflow-hidden"
    >
      {/* Ambient glow */}
      <div
        className="absolute -top-12 -left-12 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-colors duration-500"
        style={{ background: meta.bg.replace('12', '20') }}
      />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl" style={{ background: `${meta.color}18`, border: `1px solid ${meta.color}30` }}>
              <CloudRain size={16} style={{ color: meta.color }} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Short-Term Rain</h3>
              <p className="text-[10px] text-white/30 uppercase tracking-widest">Prediction Window</p>
            </div>
          </div>

          {/* Umbrella badge */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wide"
            style={{
              background: needsUmbrella ? '#3b82f618' : '#10b98118',
              color: needsUmbrella ? '#3b82f6' : '#10b981',
              border: `1px solid ${needsUmbrella ? '#3b82f630' : '#10b98130'}`,
            }}
          >
            <Umbrella size={11} />
            {needsUmbrella ? 'Bring Umbrella' : 'No Umbrella'}
          </div>
        </div>

        {/* Tab selector */}
        <div className="flex gap-1 p-1 rounded-2xl mb-5" style={{ background: 'rgba(255,255,255,0.04)' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 py-2 rounded-xl text-xs font-bold transition-all relative"
              style={activeTab === tab.id
                ? { background: meta.color, color: '#fff', boxShadow: `0 4px 12px ${meta.color}40` }
                : { color: 'rgba(255,255,255,0.4)' }
              }
            >
              <Clock size={10} className="inline mr-1" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main probability display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
          >
            {/* Big % */}
            <div className="flex items-end gap-3 mb-4">
              <motion.span
                className="text-6xl font-black leading-none"
                style={{ color: meta.color }}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.4 }}
              >
                {prob}
              </motion.span>
              <div className="pb-2">
                <span className="text-2xl font-bold text-white/40">%</span>
                <p className="text-xs font-bold mt-0" style={{ color: meta.color }}>{meta.label}</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-2 rounded-full overflow-hidden mb-5" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${meta.color}aa, ${meta.color})` }}
                initial={{ width: 0 }}
                animate={{ width: `${prob}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>

            {/* 6-hour sparkline */}
            <div style={{ height: 90 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.hourly} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={meta.color} stopOpacity={0.5} />
                      <stop offset="100%" stopColor={meta.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} hide />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={40} stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                  <Area
                    type="monotone"
                    dataKey="prob"
                    stroke={meta.color}
                    strokeWidth={2}
                    fill="url(#rainGrad)"
                    dot={{ fill: meta.color, r: 3, stroke: 'transparent' }}
                    activeDot={{ r: 5, fill: meta.color }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
