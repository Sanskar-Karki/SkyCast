'use client';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports */

import { useEffect, useRef, useState } from 'react';

// Layer definitions using OpenWeatherMap free tile API
const LAYERS = [
  {
    id: 'precipitation_new',
    label: 'Rain',
    icon: '🌧️',
    color: '#3b82f6',
    description: 'Live precipitation intensity',
  },
  {
    id: 'wind_new',
    label: 'Wind',
    icon: '💨',
    color: '#8b5cf6',
    description: 'Wind speed & direction',
  },
  {
    id: 'temp_new',
    label: 'Temperature',
    icon: '🌡️',
    color: '#f97316',
    description: 'Surface temperature',
  },
  {
    id: 'clouds_new',
    label: 'Clouds',
    icon: '☁️',
    color: '#94a3b8',
    description: 'Cloud coverage',
  },
  {
    id: 'pressure_new',
    label: 'Pressure',
    icon: '📊',
    color: '#10b981',
    description: 'Sea-level pressure',
  },
];

interface InteractiveMapProps {
  lat: number;
  lon: number;
  onLocationSelect: (lat: number, lon: number) => void;
}

export default function InteractiveMap({ lat, lon, onLocationSelect }: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const overlayLayerRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [mounted, setMounted] = useState(false);
  const [activeLayer, setActiveLayer] = useState('precipitation_new');
  const [opacity, setOpacity] = useState(0.7);
  const [showLegend, setShowLegend] = useState(true);

  const OWM_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_KEY || '';

  // Initialize map once
  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current || leafletMapRef.current) return;

    const L = require('leaflet');

    // Fix marker icons
    const markerIcon = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
    const markerShadow = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';
    L.Marker.prototype.options.icon = L.icon({
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });

    // Create map
    const map = L.map(mapRef.current, {
      center: [lat, lon],
      zoom: 5,
      zoomControl: true,
    });

    leafletMapRef.current = map;

    // Dark base tile layer using CartoDB
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    // Add OWM overlay
    if (OWM_KEY && !OWM_KEY.includes('your_')) {
      const overlayUrl = `https://tile.openweathermap.org/map/${activeLayer}/{z}/{x}/{y}.png?appid=${OWM_KEY}`;
      const overlay = L.tileLayer(overlayUrl, { opacity, maxZoom: 19 });
      overlay.addTo(map);
      overlayLayerRef.current = overlay;
    }

    // Marker at position
    const marker = L.marker([lat, lon]).addTo(map).bindPopup(`
      <div style="font-family:sans-serif;padding:4px">
        <b>📍 Prediction Zone</b><br/>
        <span style="color:#60a5fa">${lat.toFixed(4)}°, ${lon.toFixed(4)}°</span>
      </div>
    `);
    markerRef.current = marker;

    // Click handler
    map.on('click', (e: any) => {
      const { lat: clickLat, lng: clickLon } = e.latlng;
      onLocationSelect(clickLat, clickLon);
      marker.setLatLng([clickLat, clickLon]);
      marker.openPopup();
    });

    setMounted(true);

    return () => {
      map.remove();
      leafletMapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update marker when lat/lon changes
  useEffect(() => {
    if (!leafletMapRef.current || !markerRef.current) return;
    markerRef.current.setLatLng([lat, lon]);
    leafletMapRef.current.setView([lat, lon], leafletMapRef.current.getZoom());
  }, [lat, lon]);

  // Swap OWM overlay layer when activeLayer changes
  useEffect(() => {
    if (!leafletMapRef.current || !mounted) return;
    if (!OWM_KEY || OWM_KEY.includes('your_')) return;

    const L = require('leaflet');

    if (overlayLayerRef.current) {
      leafletMapRef.current.removeLayer(overlayLayerRef.current);
    }

    const overlayUrl = `https://tile.openweathermap.org/map/${activeLayer}/{z}/{x}/{y}.png?appid=${OWM_KEY}`;
    const newOverlay = L.tileLayer(overlayUrl, { opacity, maxZoom: 19 });
    newOverlay.addTo(leafletMapRef.current);
    overlayLayerRef.current = newOverlay;
  }, [activeLayer, opacity, mounted]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeLayerInfo = LAYERS.find((l) => l.id === activeLayer)!;
  const hasOWMKey = OWM_KEY && !OWM_KEY.includes('your_');

  return (
    <div className="glass-card overflow-hidden relative" style={{ borderRadius: '1.5rem' }}>
      {/* Layer Selector Toolbar */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-white/5 flex-wrap">
        <span className="text-xs text-slate-500 uppercase font-bold tracking-widest mr-2">Layers</span>
        {LAYERS.map((layer) => (
          <button
            key={layer.id}
            onClick={() => setActiveLayer(layer.id)}
            title={layer.description}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              activeLayer === layer.id
                ? 'text-white border-transparent shadow-lg scale-105'
                : 'text-slate-400 border-white/10 hover:border-white/20 hover:text-white'
            }`}
            style={
              activeLayer === layer.id
                ? { background: layer.color, boxShadow: `0 4px 15px ${layer.color}60` }
                : {}
            }
          >
            <span>{layer.icon}</span>
            {layer.label}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-3">
          <label className="text-xs text-slate-500 uppercase font-bold">Opacity</label>
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.05}
            value={opacity}
            onChange={(e) => setOpacity(parseFloat(e.target.value))}
            className="w-24 accent-blue-500"
          />
          <span className="text-xs font-mono text-slate-400 w-8">{Math.round(opacity * 100)}%</span>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative" style={{ height: '480px' }}>
        <div ref={mapRef} style={{ height: '100%', width: '100%', background: '#0f172a' }} />

        {/* No OWM key warning overlay */}
        {!hasOWMKey && mounted && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[900]">
            <div className="bg-slate-900/90 backdrop-blur-md border border-amber-500/40 rounded-2xl px-6 py-4 text-center max-w-xs">
              <p className="text-amber-400 text-sm font-bold mb-1">🗝️ API Key Required for Heat Maps</p>
              <p className="text-slate-400 text-xs">
                Add <code className="bg-slate-800 px-1 rounded text-blue-400">NEXT_PUBLIC_OPENWEATHER_KEY</code> to{' '}
                <code className="bg-slate-800 px-1 rounded">.env.local</code> to enable live weather overlays.
              </p>
            </div>
          </div>
        )}

        {/* Click hint */}
        {mounted && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-slate-900/80 backdrop-blur-sm text-white px-4 py-2 rounded-full text-xs font-medium border border-white/10 pointer-events-none">
            📍 Click anywhere on the map to get weather prediction
          </div>
        )}

        {/* Active layer badge */}
        {mounted && (
          <div
            className="absolute top-4 left-4 z-[1000] flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg border border-white/10 backdrop-blur-md"
            style={{ background: activeLayerInfo.color + '30', color: activeLayerInfo.color, borderColor: activeLayerInfo.color + '40' }}
          >
            <span>{activeLayerInfo.icon}</span>
            {activeLayerInfo.label} Map
          </div>
        )}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="px-5 py-3 flex items-center justify-between border-t border-white/5 text-xs">
          <div className="flex items-center gap-4">
            {activeLayer === 'precipitation_new' && (
              <>
                <span className="text-slate-500">Low</span>
                <div className="flex h-3 w-32 rounded-full overflow-hidden">
                  {['#00d4ff','#00a0ff','#0050ff','#5000ff','#9000ff'].map((c, i) => (
                    <div key={i} className="flex-1" style={{ background: c }} />
                  ))}
                </div>
                <span className="text-slate-500">High Rain</span>
              </>
            )}
            {activeLayer === 'wind_new' && (
              <>
                <span className="text-slate-500">Calm</span>
                <div className="flex h-3 w-32 rounded-full overflow-hidden">
                  {['#d4f7a8','#a8f7d4','#a8d4f7','#a88ff7','#f78fa8'].map((c, i) => (
                    <div key={i} className="flex-1" style={{ background: c }} />
                  ))}
                </div>
                <span className="text-slate-500">Gale</span>
              </>
            )}
            {activeLayer === 'temp_new' && (
              <>
                <span className="text-slate-500">-40°C</span>
                <div className="flex h-3 w-32 rounded-full overflow-hidden">
                  {['#6600cc','#003399','#0099ff','#00ff99','#ffcc00','#ff3300'].map((c, i) => (
                    <div key={i} className="flex-1" style={{ background: c }} />
                  ))}
                </div>
                <span className="text-slate-500">+40°C</span>
              </>
            )}
            {activeLayer === 'clouds_new' && (
              <>
                <span className="text-slate-500">Clear</span>
                <div className="flex h-3 w-32 rounded-full overflow-hidden">
                  {['#ffffff10','#ffffff40','#ffffff80','#ffffffb0','#ffffffd0'].map((c, i) => (
                    <div key={i} className="flex-1 border border-white/10" style={{ background: c }} />
                  ))}
                </div>
                <span className="text-slate-500">Overcast</span>
              </>
            )}
            {activeLayer === 'pressure_new' && (
              <>
                <span className="text-slate-500">Low</span>
                <div className="flex h-3 w-32 rounded-full overflow-hidden">
                  {['#ff0000','#ffaa00','#ffff00','#aaff00','#00ff00'].map((c, i) => (
                    <div key={i} className="flex-1" style={{ background: c }} />
                  ))}
                </div>
                <span className="text-slate-500">High</span>
              </>
            )}
          </div>
          <button
            onClick={() => setShowLegend(false)}
            className="text-slate-600 hover:text-slate-400 transition-colors ml-4"
          >
            ✕
          </button>
        </div>
      )}
      {!showLegend && (
        <button
          onClick={() => setShowLegend(true)}
          className="w-full py-2 text-xs text-slate-600 hover:text-slate-400 transition-colors border-t border-white/5"
        >
          Show legend
        </button>
      )}
    </div>
  );
}
