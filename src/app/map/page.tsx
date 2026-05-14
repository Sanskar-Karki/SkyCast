'use client';

import dynamic from 'next/dynamic';
import { useWeatherStore } from '@/store/use-weather-store';
import WeatherShell from '@/components/WeatherShell';

const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), {
  ssr: false,
  loading: () => <div className="h-[600px] w-full glass-card animate-pulse bg-slate-800/50" />,
});

export default function MapPage() {
  const { data, fetchWeather } = useWeatherStore();

  return (
    <WeatherShell>
      {data && (
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-black tracking-tight text-white">Interactive Weather Map</h1>
            <p className="text-sm text-slate-400">Explore live precipitation and temperature layers for {data.city}.</p>
          </div>
          
          <div className="h-[650px] w-full relative">
            <InteractiveMap
              lat={data.lat}
              lon={data.lon}
              onLocationSelect={(lat, lon) => fetchWeather(lat, lon, 'Selected Region')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
             <div className="glass-card p-5 bg-blue-600/5 border-blue-500/20">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2">Pro Tip</h4>
                <p className="text-xs text-slate-400">Click anywhere on the map to instantly switch the forecast to that specific location.</p>
             </div>
             <div className="glass-card p-5 bg-purple-600/5 border-purple-500/20">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-400 mb-2">Layers</h4>
                <p className="text-xs text-slate-400">Use the layer icon in the top right to switch between Precipitation and Temperature views.</p>
             </div>
             <div className="glass-card p-5 bg-cyan-600/5 border-cyan-500/20">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-2">Data Source</h4>
                <p className="text-xs text-slate-400">Live satellite and radar data provided by OpenWeatherMap Global Tile Server.</p>
             </div>
          </div>
        </div>
      )}
    </WeatherShell>
  );
}
