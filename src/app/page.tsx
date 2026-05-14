'use client';

import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useWeatherStore } from '@/store/use-weather-store';
import WeatherSummary from '@/components/WeatherSummary';
import RainProbabilityMeter from '@/components/RainProbabilityMeter';
import ForecastChart from '@/components/ForecastChart';
import APIComparison from '@/components/APIComparison';
import SearchBar from '@/components/SearchBar';
import AISuggestion from '@/components/AISuggestion';
import ShortTermRain from '@/components/ShortTermRain';
import DailyForecastSection from '@/components/DailyForecastSection';
import UnitToggle from '@/components/UnitToggle';
import { CloudRain, AlertTriangle, Loader2, MapPin } from 'lucide-react';
import { useGeolocation } from '@/hooks/use-geolocation';

const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), {
  ssr: false,
  loading: () => <div className="h-[480px] w-full glass-card animate-pulse bg-slate-800/50" />,
});

export default function Home() {
  const { data, loading, error, fetchWeather } = useWeatherStore();
  const { error: geoError } = useGeolocation();
  const locationUnavailable = Boolean((error || geoError) && !data && !loading);

  if (locationUnavailable) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-4 py-12 text-center">
        <div className="glass-card w-full max-w-2xl overflow-hidden border-amber-500/20">
          <div className="relative p-6 sm:p-10">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-blue-500 to-cyan-400" />
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/25 bg-amber-500/10 text-amber-400">
              <AlertTriangle size={28} />
            </div>
            <h1 className="mb-3 text-3xl font-black tracking-normal text-white">Choose a forecast location</h1>
            <p className="mx-auto mb-8 max-w-xl text-sm leading-6 text-slate-400">
              Location access was not available, so SkyCast is ready for a manual search instead.
              Search for any city or region to load the live dashboard.
            </p>
            <div className="mx-auto max-w-md">
              <SearchBar />
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 text-xs font-bold uppercase tracking-widest text-slate-500 transition-colors hover:text-white"
            >
              Try device location again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 pb-20 md:px-8">
      <header className="flex flex-col items-center justify-between gap-6 py-8 sm:py-10 md:flex-row">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-600 p-3 shadow-lg shadow-blue-600/25">
            <CloudRain className="text-white" size={28} />
          </div>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-black tracking-normal">
              SkyCast AI
              <span className="rounded border border-blue-500/30 bg-blue-500/20 px-1.5 py-0.5 text-[10px] text-blue-400">2.0</span>
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">Live multi-source forecast</p>
          </div>
        </div>

        <div className="flex w-full flex-col items-stretch gap-3 md:w-auto md:flex-row md:items-center">
          <SearchBar />
          <UnitToggle />
        </div>
      </header>

      <AnimatePresence mode="wait">
        {!data || loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex min-h-[60vh] items-center justify-center"
          >
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <Loader2 className="animate-spin text-blue-500" size={64} strokeWidth={1} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <MapPin className="text-blue-500/40" size={24} />
                </div>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold tracking-normal text-white">
                  {loading ? 'Loading Forecast' : 'Acquiring Location'}
                </p>
                <p className="mt-1 animate-pulse text-sm text-slate-500">
                  {loading ? 'Comparing weather sources...' : 'Use search if your browser asks for location permission.'}
                </p>
                {!loading && (
                  <div className="mt-8 w-[min(28rem,calc(100vw-2rem))]">
                    <SearchBar />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 gap-8 lg:grid-cols-12"
          >
            <div className="flex flex-col gap-8 lg:col-span-8">
              <WeatherSummary data={data} />
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <ShortTermRain data={data.shortTermRain} />
                <AISuggestion data={data} />
              </div>
              <ForecastChart data={data.hourly} />
              <InteractiveMap
                lat={data.lat}
                lon={data.lon}
                onLocationSelect={(lat, lon) => fetchWeather(lat, lon, 'Selected Region')}
              />
            </div>

            <div className="flex flex-col gap-8 lg:col-span-4">
              <RainProbabilityMeter probability={data.current.precipitationProbability} confidence={data.confidence} />
              <DailyForecastSection data={data.daily} />
              <APIComparison data={data} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && data && (
        <div className="fixed bottom-6 left-1/2 z-[2100] flex -translate-x-1/2 items-center gap-2 rounded-2xl border border-red-500/25 bg-red-950/90 px-4 py-3 text-sm font-semibold text-red-100 shadow-2xl backdrop-blur">
          <AlertTriangle size={16} className="text-red-300" />
          {error}
        </div>
      )}

      <footer className="mt-20 border-t border-white/5 py-12 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-30">Live data stream · search and location aware</p>
      </footer>
    </main>
  );
}
