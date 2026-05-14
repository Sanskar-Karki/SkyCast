'use client';

import { useWeatherStore } from '@/store/use-weather-store';
import WeatherSummary from '@/components/WeatherSummary';
import RainProbabilityMeter from '@/components/RainProbabilityMeter';
import AISuggestion from '@/components/AISuggestion';
import ShortTermRain from '@/components/ShortTermRain';
import WeatherShell from '@/components/WeatherShell';
import APIComparison from '@/components/APIComparison';

export default function Home() {
  const { data } = useWeatherStore();

  return (
    <WeatherShell>
      {data && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Main Quick Info Column */}
          <div className="flex flex-col gap-8 lg:col-span-8">
            <WeatherSummary data={data} />
            
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <ShortTermRain data={data.shortTermRain} />
              <AISuggestion data={data} />
            </div>
          </div>

          {/* Sidebar Metrics */}
          <div className="flex flex-col gap-8 lg:col-span-4">
            <RainProbabilityMeter 
              probability={data.current.precipitationProbability} 
              confidence={data.confidence} 
            />
            <APIComparison data={data} />
            
            <div className="glass-card p-6 bg-blue-600/5 border-blue-500/20">
              <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-wider">Quick Insights</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                SkyCast is currently analyzing data from 3 sources. Use the 
                <strong> Heat Map</strong> tab for spatial views or 
                <strong> Forecast</strong> for the full 7-day outlook.
              </p>
            </div>
          </div>
        </div>
      )}
    </WeatherShell>
  );
}

