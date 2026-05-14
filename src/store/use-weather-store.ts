import { create } from 'zustand';
import { WeatherData } from '@/types/weather';
import { fetchWeatherAggregation } from '@/lib/weather-engine';

interface WeatherState {
  data: WeatherData | null;
  loading: boolean;
  error: string | null;
  unit: 'metric' | 'imperial';
  searchLocation: { lat: number, lon: number, name: string } | null;
  
  fetchWeather: (lat: number, lon: number, name: string) => Promise<void>;
  setUnit: (unit: 'metric' | 'imperial') => void;
}

export const useWeatherStore = create<WeatherState>((set) => ({
  data: null,
  loading: false,
  error: null,
  unit: 'metric',
  searchLocation: null,

  fetchWeather: async (lat, lon, name) => {
    set({ loading: true, error: null });
    try {
      const data = await fetchWeatherAggregation(lat, lon);
      set({ data: { ...data, city: name }, searchLocation: { lat, lon, name }, loading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch weather data';
      set({ error: message, loading: false });
    }
  },

  setUnit: (unit) => set({ unit }),
}));
