'use client';

import { ReactNode, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWeatherStore } from '@/store/use-weather-store';
import { useGeolocation } from '@/hooks/use-geolocation';
import SearchBar from '@/components/SearchBar';
import PageHeader from '@/components/PageHeader';
import { Loader2, MapPin, AlertTriangle, CloudRain } from 'lucide-react';

interface WeatherShellProps {
  children: ReactNode;
}

export default function WeatherShell({ children }: WeatherShellProps) {
  const { data, loading, error } = useWeatherStore();
  const { error: geoError } = useGeolocation();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    
    // Sync state across tabs
    const syncTabs = (e: StorageEvent) => {
      if (e.key === 'skycast-weather-storage') {
        useWeatherStore.persist.rehydrate();
      }
    };
    
    window.addEventListener('storage', syncTabs);
    return () => window.removeEventListener('storage', syncTabs);
  }, []);

  const locationUnavailable = Boolean((error || geoError) && !data && !loading);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 pb-32 md:px-8">
      <PageHeader />

      <AnimatePresence mode="wait">
        {locationUnavailable ? (
          <motion.div
            key="no-location"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex min-h-[60vh] items-center justify-center"
          >
            <div className="glass-card w-full max-w-2xl overflow-hidden border-amber-500/20 text-center p-10">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/25 bg-amber-500/10 text-amber-400">
                <AlertTriangle size={28} />
              </div>
              <h1 className="mb-3 text-3xl font-black tracking-normal text-white">Choose a forecast location</h1>
              <p className="mx-auto mb-8 max-w-xl text-sm leading-6 text-slate-400">
                Location access was not available. Search for any city to load the dashboard.
              </p>
              <div className="mx-auto max-w-md">
                <SearchBar />
              </div>
            </div>
          </motion.div>
        ) : !data || loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[3000] flex flex-col items-center justify-center bg-[#060c1a]"
          >
            {/* Immersive Background Radar Effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-blue-500/5 rounded-full animate-ping" style={{ animationDuration: '4s' }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-blue-500/10 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-blue-500/20 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
            </div>

            <div className="relative z-10 flex flex-col items-center">
              {/* Custom Animated Weather Icon */}
              <motion.div 
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative mb-12"
              >
                <div className="absolute inset-0 bg-blue-600/20 blur-3xl rounded-full" />
                <div className="relative w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-[0_20px_50px_rgba(59,130,246,0.4)] border border-white/20">
                  <CloudRain className="text-white" size={64} strokeWidth={1.5} />
                  
                  {/* Small orbiting satellite */}
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-[-15px]"
                  >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] border-2 border-blue-600" />
                  </motion.div>
                </div>
              </motion.div>

              <div className="text-center space-y-4">
                <div className="flex flex-col items-center gap-1">
                  <h2 className="text-3xl font-black tracking-tighter text-white">Initializing SkyCast</h2>
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-24 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="h-full bg-blue-500"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="h-6 flex items-center justify-center">
                  <LoadingTextSequence />
                </div>
              </div>
            </div>

            <p className="fixed bottom-12 text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">
              Multi-Source Weather Engine v2.0
            </p>
          </motion.div>
        ) : (

          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function LoadingTextSequence() {
  const [index, setIndex] = useState(0);
  const steps = [
    "Analyzing satellite telemetry...",
    "Aggregating multi-source data...",
    "Calibrating AI prediction models...",
    "Optimizing local conditions...",
    "Generating precision forecast..."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % steps.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.p
      key={index}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="text-xs font-bold text-slate-500 uppercase tracking-widest"
    >
      {steps[index]}
    </motion.p>
  );
}

