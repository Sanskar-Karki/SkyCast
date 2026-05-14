'use client';

import { useState, useEffect } from 'react';
import { useWeatherStore } from '@/store/use-weather-store';

export function useGeolocation() {
  const [error, setError] = useState<string | null>(null);
  const fetchWeather = useWeatherStore((state) => state.fetchWeather);

  useEffect(() => {
    if (!navigator.geolocation) {
      const timer = window.setTimeout(() => {
        setError('Geolocation is not supported by your browser');
      }, 0);
      return () => window.clearTimeout(timer);
    }

    const handleSuccess = async (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      
      try {
        // PURE DYNAMIC: Use Nominatim to get the real city name for the user's coordinates
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        const cityName = data.address.city || data.address.town || data.address.village || data.address.suburb || 'My Location';
        
        fetchWeather(latitude, longitude, cityName);
      } catch {
        fetchWeather(latitude, longitude, 'Local Station');
      }
    };

    const handleError = (error: GeolocationPositionError) => {
      setError(error.message);
    };

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    });
  }, [fetchWeather]);

  return { error };
}
