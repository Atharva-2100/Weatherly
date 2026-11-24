export type WeatherConditionType =
  | 'sunny'
  | 'clear-night'
  | 'partly-cloudy'
  | 'cloudy'
  | 'rainy'
  | 'heavy-rain'
  | 'thunderstorm'
  | 'breezy'
  | 'mist';

export type TemperatureUnit = 'C' | 'F';

export type AnalyticsTimeframe = 'daily' | 'weekly';

export interface HourlyForecastItem {
  hourLabel: string; // e.g., "Now", "14:00"
  fullTime: string;
  tempC: number;
  feelsLikeC: number;
  condition: string;
  icon: WeatherConditionType;
  rainProbability: number; // 0 - 100
  rainfallMm: number;
  humidity: number; // 0 - 100
  windSpeedKmh: number;
}

export interface DailyForecastItem {
  dayName: string; // e.g., "Today", "Wed"
  dateLabel: string; // e.g., "Nov 24"
  condition: string;
  icon: WeatherConditionType;
  maxTempC: number;
  minTempC: number;
  rainProbability: number; // 0 - 100
  rainfallMm: number;
  humidity: number; // 0 - 100
  windSpeedKmh: number;
  uvIndex: number;
  sunrise: string;
  sunset: string;
}

export interface CurrentWeatherMetrics {
  tempC: number;
  feelsLikeC: number;
  minTempC: number;
  maxTempC: number;
  condition: string;
  description: string;
  icon: WeatherConditionType;
  humidity: number; // %
  dewPointC: number;
  windSpeedKmh: number;
  windGustKmh: number;
  windDirection: string;
  rainfallMm: number; // last 24h mm
  rainProbability: number; // %
  pressureHpa: number;
  pressureTrend: 'Rising' | 'Steady' | 'Falling';
  visibilityKm: number;
  uvIndex: number;
  sunrise: string; // "06:42 AM"
  sunset: string; // "05:58 PM"
  daylightProgress: number; // 0 - 100
}

export interface CitySummary {
  id: string;
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  timezone: string;
  utcOffsetHours: number;
  stationCode: string;
  elevationM: number;
}

export interface CityWeatherData extends CitySummary {
  current: CurrentWeatherMetrics;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  lastUpdated: string;
}

export interface WeatherRecommendation {
  id: string;
  category: 'Rain' | 'Heat' | 'UV' | 'Wind' | 'Humidity' | 'Visibility' | 'Outdoor';
  severity: 'advisory' | 'caution' | 'favorable';
  title: string;
  advice: string;
  metricContext: string;
}
