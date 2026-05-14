export interface WeatherData {
  city: string;
  lat: number;
  lon: number;
  current: NormalizedWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  sources: SourceComparison[];
  confidence: number;
  shortTermRain: ShortTermRain;
}

export interface NormalizedWeather {
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  precipitationProbability: number;
  precipitationAmount: number;
  condition: string;
  icon: string;
  timestamp: number;
}

export interface HourlyForecast {
  time: string;
  hour: number; // 0-23
  temp: number;
  precipitationProbability: number;
  condition: string;
  windSpeed: number;
  humidity: number;
}

export interface DailyForecast {
  date: string;
  dayLabel: string; // "Mon", "Tue" etc.
  maxTemp: number;
  minTemp: number;
  precipitationProbability: number;
  condition: string;
  sunset: string;
  sunrise: string;
  hourly: HourlyForecast[]; // breakdown for that day
}

export interface SourceComparison {
  name: string;
  temp: number;
  precipitationProbability: number;
  weight: number;
}

export interface ShortTermRain {
  next1h: number;   // probability %
  next2h: number;
  next3to6h: number;
  hourly: { label: string; prob: number }[]; // first 6 hours
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface FavoriteLocation {
  name: string;
  lat: number;
  lon: number;
}

export type RainIntensity = 'none' | 'light' | 'moderate' | 'heavy' | 'violent';
