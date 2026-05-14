import axios from 'axios';
import {
  NormalizedWeather,
  WeatherData,
  SourceComparison,
  HourlyForecast,
  DailyForecast,
  ShortTermRain,
} from '@/types/weather';

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';
const OPEN_WEATHER_MAP_URL = 'https://api.openweathermap.org/data/2.5';
const WEATHER_API_URL = 'https://api.weatherapi.com/v1';

const WMO_CODES: Record<number, string> = {
  0: 'Clear Sky', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Depositing Fog',
  51: 'Light Drizzle', 53: 'Moderate Drizzle', 55: 'Dense Drizzle',
  61: 'Slight Rain', 63: 'Moderate Rain', 65: 'Heavy Rain',
  71: 'Slight Snowfall', 73: 'Moderate Snow', 75: 'Heavy Snow',
  77: 'Snow Grains',
  80: 'Slight Showers', 81: 'Moderate Showers', 82: 'Violent Showers',
  85: 'Slight Snow Showers', 86: 'Heavy Snow Showers',
  95: 'Thunderstorm', 96: 'Thunderstorm w/ Hail', 99: 'Thunderstorm w/ Heavy Hail',
};

function wmoToCondition(code: number): string {
  return WMO_CODES[code] ?? 'Unknown';
}

const weatherCache: Record<string, { data: WeatherData; expiry: number }> = {};
const CACHE_TTL = 10 * 60 * 1000;

type OpenMeteoBundle = {
  current: NormalizedWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  shortTermRain: ShortTermRain;
};

export async function fetchWeatherAggregation(lat: number, lon: number): Promise<WeatherData> {
  const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  const now = Date.now();

  if (weatherCache[cacheKey] && weatherCache[cacheKey].expiry > now) {
    return weatherCache[cacheKey].data;
  }

  // Pure dynamic fetching - no mocks
  const [openMeteoRes, openWeatherRes, weatherApiRes] = await Promise.allSettled([
    fetchOpenMeteoFull(lat, lon),
    fetchOpenWeather(lat, lon),
    fetchWeatherApi(lat, lon),
  ]);

  const sources: SourceComparison[] = [];
  const normalizedSources: NormalizedWeather[] = [];
  let openMeteoData: OpenMeteoBundle | null = null;

  if (openMeteoRes.status === 'fulfilled') {
    openMeteoData = openMeteoRes.value;
    normalizedSources.push(openMeteoData.current);
    sources.push({ name: 'Open-Meteo', temp: openMeteoData.current.temp, precipitationProbability: openMeteoData.current.precipitationProbability, weight: 0.4 });
  }

  if (openWeatherRes.status === 'fulfilled') {
    normalizedSources.push(openWeatherRes.value);
    sources.push({ name: 'OpenWeatherMap', temp: openWeatherRes.value.temp, precipitationProbability: openWeatherRes.value.precipitationProbability, weight: 0.3 });
  }

  if (weatherApiRes.status === 'fulfilled') {
    normalizedSources.push(weatherApiRes.value);
    sources.push({ name: 'WeatherAPI', temp: weatherApiRes.value.temp, precipitationProbability: weatherApiRes.value.precipitationProbability, weight: 0.3 });
  }

  // Critical: If no real data can be fetched, we throw an error instead of using hardcoded mock data
  if (normalizedSources.length === 0 || !openMeteoData) {
    throw new Error('Real-time weather data unavailable. Please check your internet connection or API keys.');
  }

  const totalWeight = sources.reduce((a, s) => a + s.weight, 0);
  const avgTemp = sources.reduce((a, s) => a + s.temp * s.weight, 0) / totalWeight;
  const weightedRainProb = sources.reduce((a, s) => a + s.precipitationProbability * s.weight, 0) / totalWeight;

  const rainProbs = sources.map(s => s.precipitationProbability);
  const rainVariance = Math.sqrt(rainProbs.reduce((a, p) => a + Math.pow(p - weightedRainProb, 2), 0) / rainProbs.length);
  const confidence = Math.max(0, Math.min(100, 100 - rainVariance * 2));

  const result: WeatherData = {
    city: 'Detecting Location...',
    lat,
    lon,
    current: {
      ...normalizedSources[0],
      temp: avgTemp,
      precipitationProbability: weightedRainProb,
    },
    hourly: openMeteoData.hourly,
    daily: openMeteoData.daily,
    sources,
    confidence,
    shortTermRain: openMeteoData.shortTermRain,
  };

  weatherCache[cacheKey] = { data: result, expiry: now + CACHE_TTL };
  return result;
}

async function fetchOpenMeteoFull(lat: number, lon: number) {
  const res = await axios.get(`${OPEN_METEO_URL}?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,precipitation_probability,weathercode,windspeed_10m,relativehumidity_2m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode,sunrise,sunset&timezone=auto&forecast_days=14`);
  const d = res.data;

  const nowHour = new Date().getHours();
  const allHourly: HourlyForecast[] = d.hourly.time.map((iso: string, i: number) => ({
    time: new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    hour: new Date(iso).getHours(),
    temp: d.hourly.temperature_2m[i],
    precipitationProbability: d.hourly.precipitation_probability[i],
    condition: wmoToCondition(d.hourly.weathercode[i]),
    windSpeed: d.hourly.windspeed_10m[i],
    humidity: d.hourly.relativehumidity_2m[i],
  }));

  const startIdx = allHourly.findIndex(h => h.hour === nowHour);
  const hourly24 = allHourly.slice(startIdx, startIdx + 24);
  const next6 = allHourly.slice(startIdx, startIdx + 6);

  const daily: DailyForecast[] = d.daily.time.map((dateStr: string, i: number) => ({
    date: dateStr,
    dayLabel: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(new Date(dateStr)),
    maxTemp: d.daily.temperature_2m_max[i],
    minTemp: d.daily.temperature_2m_min[i],
    precipitationProbability: d.daily.precipitation_probability_max[i],
    condition: wmoToCondition(d.daily.weathercode[i]),
    sunrise: new Date(d.daily.sunrise[i]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    sunset: new Date(d.daily.sunset[i]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    hourly: allHourly.slice(i * 24, (i + 1) * 24),
  }));

  const shortTermRain: ShortTermRain = {
    next1h: next6[0]?.precipitationProbability || 0,
    next2h: (next6[0]?.precipitationProbability + next6[1]?.precipitationProbability) / 2 || 0,
    next3to6h: (next6[2]?.precipitationProbability + next6[5]?.precipitationProbability) / 2 || 0,
    hourly: next6.map((h, i) => ({ label: i === 0 ? 'Now' : `+${i}h`, prob: h.precipitationProbability })),
  };

  return {
    current: {
      temp: d.current_weather.temperature,
      feelsLike: d.current_weather.temperature,
      humidity: allHourly[startIdx]?.humidity || 0,
      windSpeed: d.current_weather.windspeed,
      precipitationProbability: allHourly[startIdx]?.precipitationProbability || 0,
      precipitationAmount: 0,
      condition: wmoToCondition(d.current_weather.weathercode),
      icon: '01d',
      timestamp: Date.now(),
    },
    hourly: hourly24,
    daily,
    shortTermRain
  };
}

// Fixed OpenWeather & WeatherAPI - No more hardcoded mock fallbacks
async function fetchOpenWeather(lat: number, lon: number): Promise<NormalizedWeather> {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_KEY;
  if (!apiKey || apiKey.includes('your_')) throw new Error('OpenWeather key missing');
  
  const res = await axios.get(`${OPEN_WEATHER_MAP_URL}/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`, {
    timeout: 5000 // 5 second timeout
  });
  
  return {
    temp: res.data.main.temp,
    feelsLike: res.data.main.feels_like,
    humidity: res.data.main.humidity,
    windSpeed: res.data.wind.speed * 3.6,
    precipitationProbability: res.data.rain ? 80 : 0,
    precipitationAmount: res.data.rain ? res.data.rain['1h'] || 0 : 0,
    condition: res.data.weather[0].main,
    icon: res.data.weather[0].icon,
    timestamp: res.data.dt * 1000,
  };
}

async function fetchWeatherApi(lat: number, lon: number): Promise<NormalizedWeather> {
  const apiKey = process.env.NEXT_PUBLIC_WEATHERAPI_KEY;
  if (!apiKey || apiKey.includes('your_')) throw new Error('WeatherAPI key missing');
  
  const res = await axios.get(`${WEATHER_API_URL}/current.json?key=${apiKey}&q=${lat},${lon}`, {
    timeout: 5000 // 5 second timeout
  });
  
  return {
    temp: res.data.current.temp_c,
    feelsLike: res.data.current.feelslike_c,
    humidity: res.data.current.humidity,
    windSpeed: res.data.current.wind_kph,
    precipitationProbability: res.data.current.precip_mm > 0 ? 80 : 10,
    precipitationAmount: res.data.current.precip_mm,
    condition: res.data.current.condition.text,
    icon: '01d',
    timestamp: Date.now(),
  };
}

