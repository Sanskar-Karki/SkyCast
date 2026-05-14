'use client';

import { useWeatherStore } from '@/store/use-weather-store';
import WeatherShell from '@/components/WeatherShell';
import DailyForecastSection from '@/components/DailyForecastSection';
import ForecastChart from '@/components/ForecastChart';
import APIComparison from '@/components/APIComparison';

export default function ForecastPage() {
  const { data } = useWeatherStore();

  return (
    <WeatherShell>
      {data && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Detailed Charts Column */}
          <div className="flex flex-col gap-8 lg:col-span-8">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-black tracking-tight text-white">Future Outlook</h1>
              <p className="text-sm text-slate-400">Hourly and 7-day detailed weather projections for {data.city}.</p>
            </div>
            
            <ForecastChart hourly={data.hourly} daily={data.daily} />
            
            <div className="hidden lg:block">
              <APIComparison data={data} />
            </div>
          </div>

          {/* Daily List Column */}
          <div className="flex flex-col gap-8 lg:col-span-4">
            <DailyForecastSection data={data.daily} />
            
            <div className="lg:hidden">
              <APIComparison data={data} />
            </div>

            <div className="glass-card p-6 border-white/5 bg-white/[0.02]">
              <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Forecast Confidence</h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>Signal Strength</span>
                    <span>{Math.floor(data.confidence)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: `${data.confidence}%` }} 
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed italic">
                  Confidence score is calculated based on agreement between OpenWeather, Open-Meteo, and WeatherAPI.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </WeatherShell>
  );
}
