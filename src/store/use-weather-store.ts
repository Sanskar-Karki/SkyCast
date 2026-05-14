import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { WeatherData } from '@/types/weather';
import { fetchWeatherAggregation } from '@/lib/weather-engine';

interface WeatherState {
  data: WeatherData | null;
  loading: boolean;
  error: string | null;
  unit: 'metric' | 'imperial';
  searchLocation: { lat: number, lon: number, name: string } | null;
  lastFetched: number | null;
  
  fetchWeather: (lat: number, lon: number, name: string) => Promise<void>;
  setUnit: (unit: 'metric' | 'imperial') => void;
}

export const useWeatherStore = create<WeatherState>()(
  persist(
    (set, get) => ({
      data: null,
      loading: false,
      error: null,
      unit: 'metric',
      searchLocation: null,
      lastFetched: null,

      fetchWeather: async (lat, lon, name) => {
        // Only show loader if we don't have fresh data (less than 15 mins old)
        const isDataFresh = get().data && get().lastFetched && (Date.now() - get().lastFetched! < 15 * 60 * 1000);
        
        if (!isDataFresh) {
          set({ loading: true, error: null });
        }

        try {
          const data = await fetchWeatherAggregation(lat, lon);
          set({ 
            data: { ...data, city: name }, 
            searchLocation: { lat, lon, name }, 
            loading: false,
            lastFetched: Date.now() 
          });
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Failed to fetch weather data';
          set({ error: message, loading: false });
        }
      },

      setUnit: (unit) => set({ unit }),
    }),
    {
      name: 'skycast-weather-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        data: state.data, 
        unit: state.unit, 
        searchLocation: state.searchLocation,
        lastFetched: state.lastFetched 
      }),
    }
  )
);

