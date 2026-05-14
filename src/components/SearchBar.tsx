'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, Navigation, X } from 'lucide-react';
import { useWeatherStore } from '@/store/use-weather-store';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

type SearchResult = {
  place_id?: number;
  display_name: string;
  lat: string;
  lon: string;
};

export default function SearchBar() {
  const searchLocation = useWeatherStore((state) => state.searchLocation);
  const fetchWeather = useWeatherStore((state) => state.fetchWeather);
  const [query, setQuery] = useState(searchLocation?.name || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLocating, setIsLocating] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Sync query with store location name
  useEffect(() => {
    if (searchLocation?.name && !isLocating) {
      setQuery(searchLocation.name);
    }
  }, [searchLocation?.name, isLocating]);

  const popularCities = [
    { name: 'Kathmandu', lat: 27.7172, lon: 85.3240 },
    { name: 'Pokhara', lat: 28.2096, lon: 83.9856 },
    { name: 'Dharan', lat: 26.8123, lon: 87.2831 },
    { name: 'Nepalgunj', lat: 28.0500, lon: 81.6167 },
    { name: 'Chitwan', lat: 27.6833, lon: 84.4333 }
  ];

  // Close search on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      handleSelect(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowResults(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=6&addressdetails=1`);
        const data = await res.json() as SearchResult[];
        setResults(data);
        setSelectedIndex(-1);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = async (result: SearchResult | { name: string, lat: number, lon: number }) => {
    let name, lat, lon;

    if ('display_name' in result) {
      name = result.display_name.split(',')[0];
      lat = parseFloat(result.lat);
      lon = parseFloat(result.lon);
    } else {
      name = result.name;
      lat = result.lat;
      lon = result.lon;
    }

    setIsLocating(true);
    setShowResults(false);

    try {
      await fetchWeather(lat, lon, name);
      setQuery(name);
    } finally {
      setIsLocating(false);
      setSelectedIndex(-1);
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-lg group z-[3000]">
      {/* Premium Glow Border */}
      <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-[1.5rem] opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />

      <div className="relative">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-3">
          {isLoading || isLocating ? (
            <Loader2 size={20} className="animate-spin text-blue-400" />
          ) : (
            <Search className="text-slate-400 group-focus-within:text-blue-400 transition-colors" size={20} />
          )}
        </div>
        <input
          type="text"
          value={isLocating ? 'Locating destination...' : query}
          onChange={(e) => {
            if (isLocating) return;
            setQuery(e.target.value);
            setShowResults(true);
          }}
          readOnly={isLocating}
          onFocus={() => !isLocating && setShowResults(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search city or location..."
          className={cn(
            "w-[400px] pl-12 pr-6 py-4.5 bg-[#0a0f1d]/80 border border-white/5 rounded-[1.5rem] focus:outline-none focus:ring-1 focus:ring-blue-500/30 backdrop-blur-2xl transition-all font-semibold shadow-[0_10px_40px_rgba(0,0,0,0.4)]",
            isLocating ? "text-blue-400 animate-pulse" : "text-white"
          )}
        />

        {query && !isLoading && !isLocating && (
          <button
            onClick={() => { setQuery(''); setResults([]); }}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white cursor-pointer"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="absolute top-full left-0 right-0 mt-3 bg-[#0a0f1d]/95 border border-white/10 rounded-[1.5rem] overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.6)] z-[3001] backdrop-blur-3xl"
          >
            {/* Quick Suggestions when input is empty */}
            {query.length === 0 && (
              <div className="p-4 border-b border-white/5">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3 ml-1">Popular Destinations</p>
                <div className="flex flex-wrap gap-2">
                  {popularCities.map(city => (
                    <button
                      key={city.name}
                      onClick={() => handleSelect(city)}
                      className="px-3 py-1.5 rounded-full bg-blue-500/5 border border-blue-500/10 text-xs font-bold text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all cursor-pointer"
                    >
                      {city.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {results.length > 0 ? (
              <div className="p-2.5">
                {results.map((r, i) => (
                  <button
                    key={r.place_id || i}
                    onClick={() => handleSelect(r)}
                    onMouseEnter={() => setSelectedIndex(i)}
                    className={cn(
                      "w-full flex items-center gap-4 px-4 py-3.5 text-left transition-all rounded-xl group/item cursor-pointer",
                      selectedIndex === i ? "bg-white/[0.08]" : "hover:bg-white/[0.04]"
                    )}
                  >
                    <div className={cn(
                      "p-2.5 rounded-xl transition-all",
                      selectedIndex === i ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"
                    )}>
                      <MapPin size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-white text-sm block truncate">
                        {r.display_name.split(',')[0]}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium block truncate uppercase tracking-wide mt-0.5">
                        {r.display_name.split(',').slice(1, 4).join(',')}
                      </span>
                    </div>
                    <Navigation size={14} className={cn(
                      "transition-all",
                      selectedIndex === i ? "text-blue-500 opacity-100" : "text-slate-800 opacity-0"
                    )} />
                  </button>
                ))}
              </div>
            ) : query.length >= 3 && !isLoading ? (
              <div className="px-6 py-12 text-center">
                <div className="p-4 bg-slate-800/30 rounded-2xl w-fit mx-auto mb-4 border border-white/5">
                  <Search size={24} className="text-slate-600" />
                </div>
                <p className="text-slate-400 text-sm font-bold">No locations found for &quot;{query}&quot;</p>
                <p className="text-[10px] text-slate-600 uppercase font-black mt-2 tracking-[0.2em]">Try checking the spelling</p>
              </div>
            ) : query.length > 0 && query.length < 3 && (
              <div className="px-6 py-6 text-center">
                <p className="text-xs text-slate-500 font-bold">Type at least 3 characters...</p>
              </div>
            )}

            <div className="px-5 py-3 border-t border-white/5 bg-[#050811]/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-[9px] text-slate-600 font-bold">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-white/5 text-slate-400">↑↓</kbd> to navigate
                </span>
                <span className="flex items-center gap-1 text-[9px] text-slate-600 font-bold">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-white/5 text-slate-400">↵</kbd> to select
                </span>
              </div>
              <p className="text-[9px] text-slate-700 font-black uppercase tracking-widest">Global Data</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
