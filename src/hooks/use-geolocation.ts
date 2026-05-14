'use client';

import { useState, useEffect } from 'react';
import { useWeatherStore } from '@/store/use-weather-store';

export function useGeolocation() {
  const [error, setError] = useState<string | null>(null);
  const { fetchWeather, data: cachedData, lastFetched } = useWeatherStore();

  useEffect(() => {
    // If we have fresh data (less than 15 mins), don't re-trigger geolocation logic immediately
    const isDataFresh = cachedData && lastFetched && (Date.now() - lastFetched < 15 * 60 * 1000);
    if (isDataFresh) return;

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    const handleSuccess = async (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      
      try {
        // Only reverse geocode if coordinates changed significantly or no city name
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        const cityName = data.address.city || data.address.town || data.address.village || data.address.suburb || 'My Location';
        
        fetchWeather(latitude, longitude, cityName);
      } catch {
        fetchWeather(latitude, longitude, 'Local Station');
      }
    };

    const handleError = (error: GeolocationPositionError) => {
      // Don't show error if we have cached data to fall back on
      if (!cachedData) {
        setError(error.message);
      }
    };

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: false, // Faster
      timeout: 10000,
      maximumAge: 600000 // 10 minutes cache for coordinates
    });
  }, [fetchWeather, cachedData, lastFetched]);

  return { error };
}

