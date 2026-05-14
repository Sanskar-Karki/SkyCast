'use client';

import { motion } from 'framer-motion';
import { Droplets } from 'lucide-react';

interface RainProbabilityMeterProps {
  probability: number;
  confidence: number;
}

const getRainLabel = (p: number) => {
  if (p < 10) return { text: 'No Rain', color: '#10b981' };
  if (p < 35) return { text: 'Light Drizzle', color: '#06b6d4' };
  if (p < 65) return { text: 'Moderate Rain', color: '#3b82f6' };
  if (p < 85) return { text: 'Heavy Rain', color: '#8b5cf6' };
  return { text: 'Severe Rain', color: '#ef4444' };
};

const getConfidenceLabel = (c: number) => {
  if (c >= 80) return { text: 'High confidence', color: '#10b981' };
  if (c >= 50) return { text: 'Moderate confidence', color: '#f59e0b' };
  return { text: 'Low confidence', color: '#ef4444' };
};

export default function RainProbabilityMeter({ probability, confidence }: RainProbabilityMeterProps) {
  const SIZE = 200;
  const STROKE = 14;
  const R = (SIZE - STROKE) / 2;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const circumference = 2 * Math.PI * R;
  const offset = circumference - (Math.min(probability, 100) / 100) * circumference;

  const rainInfo = getRainLabel(probability);
  const confInfo = getConfidenceLabel(confidence);

  return (
    <div className="glass-card relative overflow-hidden">
      {/* Glow */}
      <div
        className="absolute -bottom-12 -right-12 w-40 h-40 rounded-full blur-3xl pointer-events-none"
        style={{ background: `${rainInfo.color}15` }}
      />

      <div className="relative p-6 flex flex-col items-center">
        <p className="section-label mb-5">Rain Probability</p>

        {/* Gauge */}
        <div className="relative" style={{ width: SIZE, height: SIZE }}>
          <svg width={SIZE} height={SIZE} className="-rotate-90">
            {/* Track */}
            <circle
              cx={CX} cy={CY} r={R}
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={STROKE}
            />
            {/* Progress */}
            <motion.circle
              cx={CX} cy={CY} r={R}
              fill="none"
              stroke={rainInfo.color}
              strokeWidth={STROKE}
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.4, ease: 'easeOut' }}
              strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 8px ${rainInfo.color}80)` }}
            />
          </svg>

          {/* Centre Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
            <Droplets size={18} style={{ color: rainInfo.color }} />
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-black leading-none"
              style={{ color: rainInfo.color }}
            >
              {Math.round(probability)}%
            </motion.span>
            <span className="text-[10px] font-bold uppercase" style={{ color: `${rainInfo.color}90` }}>
              Chance
            </span>
          </div>
        </div>

        {/* Rain label */}
        <div
          className="mt-4 px-4 py-1.5 rounded-full text-xs font-bold"
          style={{ background: `${rainInfo.color}15`, color: rainInfo.color, border: `1px solid ${rainInfo.color}30` }}
        >
          {rainInfo.text}
        </div>

        {/* Confidence */}
        <div className="w-full mt-5 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="section-label">Model Confidence</span>
            <span className="font-semibold" style={{ color: confInfo.color }}>
              {confInfo.text}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: confInfo.color }}
              initial={{ width: 0 }}
              animate={{ width: `${confidence}%` }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-white/25">
            <span>0%</span>
            <span className="font-mono font-bold text-white/50">{Math.round(confidence)}%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
