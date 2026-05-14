'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, BrainCircuit, Umbrella } from 'lucide-react';
import { WeatherData } from '@/types/weather';

interface AISuggestionProps {
  data: WeatherData;
}

function useTypewriter(text: string, speed = 18) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    const resetTimer = window.setTimeout(() => {
      setDisplayed('');
      setDone(false);
    }, 0);
    if (!text) {
      return () => window.clearTimeout(resetTimer);
    }
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);
    return () => {
      window.clearTimeout(resetTimer);
      clearInterval(interval);
    };
  }, [text, speed]);

  return { displayed, done };
}

export default function AISuggestion({ data }: AISuggestionProps) {
  const [suggestion, setSuggestion] = useState('');
  const [model, setModel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const prevCityRef = useRef('');
  const { displayed, done } = useTypewriter(suggestion, 16);

  async function fetchSuggestion() {
    setLoading(true);
    setError('');
    setSuggestion('');
    try {
      const res = await fetch('/api/ai-suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weatherData: data }),
      });
      if (!res.ok) throw new Error('Failed to get AI suggestion');
      const json = await res.json();
      setSuggestion(json.suggestion);
      setModel(json.model);
    } catch {
      setError('Could not load AI suggestion. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Auto-fetch when city/location changes
  useEffect(() => {
    const key = `${data.city}-${data.lat.toFixed(2)}-${data.lon.toFixed(2)}`;
    if (prevCityRef.current !== key) {
      prevCityRef.current = key;
      fetchSuggestion();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.city, data.lat, data.lon]);

  const rainProb = Math.round(data.current.precipitationProbability);
  const needsUmbrella = rainProb >= 40;
  const accentColor = needsUmbrella ? '#3b82f6' : '#10b981';
  const umbrellaGlow = needsUmbrella ? 'rgba(59,130,246,0.15)' : 'rgba(16,185,129,0.12)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card relative overflow-hidden"
    >
      {/* Ambient glow */}
      <div
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl pointer-events-none transition-colors duration-700"
        style={{ background: umbrellaGlow }}
      />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div
              className="p-2 rounded-xl"
              style={{
                background: `${accentColor}18`,
                border: `1px solid ${accentColor}30`,
              }}
            >
              <BrainCircuit size={18} style={{ color: accentColor }} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">AI Weather Advisor</h3>
              <p className="text-[10px] text-white/30 uppercase tracking-widest font-medium">
                {model === 'gemini-2.0-flash' ? 'Gemini 2.0 Flash' : model === 'fallback-heuristic' ? 'Smart Heuristic' : 'Powered by AI'}
              </p>
            </div>
          </div>
          <button
            onClick={fetchSuggestion}
            disabled={loading}
            title="Refresh AI suggestion"
            className="p-2 rounded-xl text-white/30 hover:text-white/70 hover:bg-white/[0.05] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Umbrella decision pill */}
        <AnimatePresence mode="wait">
          {!loading && suggestion && (
            <motion.div
              key={`pill-${data.city}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-3 mb-4 px-4 py-3 rounded-2xl"
              style={{
                background: `${accentColor}12`,
                border: `1px solid ${accentColor}25`,
              }}
            >
              <div
                className="p-2 rounded-xl flex-shrink-0"
                style={{ background: `${accentColor}20` }}
              >
                <Umbrella size={20} style={{ color: accentColor }} />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-widest font-bold" style={{ color: `${accentColor}99` }}>
                  Umbrella Advice
                </p>
                <p className="text-sm font-bold text-white">
                  {needsUmbrella ? `Yes - ${rainProb}% rain chance` : `No - only ${rainProb}% rain chance`}
                </p>
              </div>
              <div
                className="ml-auto w-2.5 h-2.5 rounded-full animate-pulse flex-shrink-0"
                style={{ background: accentColor }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Suggestion text area */}
        <div
          className="rounded-2xl p-4 min-h-[90px] flex items-start"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 w-full"
              >
                <Sparkles size={16} className="text-blue-400 animate-pulse flex-shrink-0" />
                <div className="flex flex-col gap-2 flex-1">
                  <div className="h-3 rounded-full bg-white/[0.06] animate-pulse w-3/4" />
                  <div className="h-3 rounded-full bg-white/[0.04] animate-pulse w-1/2" />
                  <div className="h-3 rounded-full bg-white/[0.03] animate-pulse w-2/3" />
                </div>
              </motion.div>
            ) : error ? (
              <motion.p
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-sm"
              >
                {error}
              </motion.p>
            ) : suggestion ? (
              <motion.div
                key={`suggestion-${data.city}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative"
              >
                <p className="text-sm text-white/80 leading-relaxed">
                  {displayed}
                  {!done && (
                    <span className="inline-block w-0.5 h-4 bg-blue-400 ml-0.5 animate-pulse align-middle" />
                  )}
                </p>
              </motion.div>
            ) : (
              <motion.p
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                className="text-sm text-white/40 italic"
              >
                Waiting for weather data...
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Footer badge */}
        {model && !loading && (
          <p className="mt-3 text-[10px] text-white/20 text-right font-mono">
            {model === 'gemini-2.0-flash' ? '* Google Gemini AI' : '* Local heuristic model'}
          </p>
        )}
      </div>
    </motion.div>
  );
}
