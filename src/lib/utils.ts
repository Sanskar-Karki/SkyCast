import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type TemperatureUnit = 'metric' | 'imperial';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTemp(temp: number, unit: TemperatureUnit = 'metric'): string {
  const value = unit === 'imperial' ? temp * 9 / 5 + 32 : temp;
  return `${Math.round(value)}°${unit === 'imperial' ? 'F' : 'C'}`;
}

export function formatWindSpeed(speedKph: number, unit: TemperatureUnit = 'metric'): string {
  const value = unit === 'imperial' ? speedKph * 0.621371 : speedKph;
  return `${Math.round(value)} ${unit === 'imperial' ? 'mph' : 'km/h'}`;
}

export function getRainIntensity(prob: number): string {
  if (prob < 10) return 'No rain expected';
  if (prob < 40) return 'Light drizzle possible';
  if (prob < 70) return 'Moderate rain expected';
  return 'Heavy rain likely';
}
