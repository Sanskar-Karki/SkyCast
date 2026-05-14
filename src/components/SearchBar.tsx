'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, Navigation } from 'lucide-react';
import { useWeatherStore } from '@/store/use-weather-store';
import { motion, AnimatePresence } from 'framer-motion';

type SearchResult = {
  place_id?: number;
  display_name: string;
  lat: string;
  lon: string;
};

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const fetchWeather = useWeatherStore((state) => state.fetchWeather);
  const searchRef = useRef<HTMLDivElement>(null);

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

  // Debounced search
  useEffect(() => {
    if (query.length < 3) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`);
        const data = await res.json() as SearchResult[];
        setResults(data);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    const name = result.display_name.split(',')[0];
    fetchWeather(parseFloat(result.lat), parseFloat(result.lon), name);
    setQuery(name);
    setShowResults(false);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md group">
      {/* Glow Effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>

      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
           {isLoading ? (
             <Loader2 size={18} className="animate-spin text-blue-500" />
           ) : (
             <Search className="text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
           )}
        </div>
        <input 
          type="text"
          value={query}
          onChange={(e) => {
            const nextQuery = e.target.value;
            setQuery(nextQuery);
            if (nextQuery.length < 3) setResults([]);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder="Enter city, region or country..."
          className="w-full pl-12 pr-4 py-4 bg-slate-900 border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-md transition-all font-medium text-white shadow-2xl"
        />
      </div>

      <AnimatePresence>
        {showResults && (query.length >= 3 || results.length > 0) && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-3 bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 backdrop-blur-3xl"
          >
            {results.length > 0 ? (
              <div className="p-2 space-y-1">
                {results.map((r, i) => (
                  <button
                    key={r.place_id || i}
                    onClick={() => handleSelect(r)}
                    className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-white/[0.05] text-left transition-all rounded-xl group/item"
                  >
                    <div className="p-2 rounded-lg bg-blue-500/5 text-blue-500 group-hover/item:bg-blue-500 group-hover/item:text-white transition-all">
                      <MapPin size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-white text-sm block truncate">{r.display_name.split(',')[0]}</span>
                      <span className="text-[10px] text-slate-500 font-medium block truncate uppercase tracking-wider">
                        {r.display_name.split(',').slice(1, 3).join(',')}
                      </span>
                    </div>
                    <div className="text-slate-700">
                       <Navigation size={12} />
                    </div>
                  </button>
                ))}
              </div>
            ) : query.length >= 3 && !isLoading ? (
              <div className="px-6 py-8 text-center">
                 <div className="p-3 bg-slate-800/50 rounded-full w-fit mx-auto mb-3">
                    <Search size={20} className="text-slate-600" />
                 </div>
                 <p className="text-slate-500 text-sm font-medium">No locations found</p>
                 <p className="text-[10px] text-slate-600 uppercase font-bold mt-1 tracking-widest">Try a broader search</p>
              </div>
            ) : null}

            {/* Hint */}
            <div className="px-4 py-2 border-t border-white/5 bg-slate-900/50">
               <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest text-center">OpenStreetMap Nominatim API</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
