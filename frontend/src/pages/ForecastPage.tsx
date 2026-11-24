import React from 'react';
import { CalendarDays, Droplets, MapPin, Sun, Wind } from 'lucide-react';
import { CityQuickSwitcher } from '../components/CityQuickSwitcher';
import { HourlyForecast } from '../components/HourlyForecast';
import { DashboardSkeleton, WeatherErrorState } from '../components/LoadingSkeleton';
import { WeatherIcon } from '../components/WeatherIcon';
import { WeatherRecommendations } from '../components/WeatherRecommendations';
import { WeeklyForecast } from '../components/WeeklyForecast';
import { useWeather } from '../context/WeatherContext';
import { formatTemp, getUvRisk } from '../utils/weatherUtils';

export const ForecastPage: React.FC = () => {
  const { weatherData, isLoading, error, retryFetch, unit, setUnit } = useWeather();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1380px] px-4 py-6 sm:px-6 lg:px-8">
        <DashboardSkeleton />
      </div>
    );
  }

  if (error || !weatherData) {
    return (
      <div className="mx-auto max-w-[1380px] px-4 py-6 sm:px-6 lg:px-8">
        <WeatherErrorState
          message={error ?? 'No station selected.'}
          onRetry={retryFetch}
        />
      </div>
    );
  }

  const uvInfo = getUvRisk(weatherData.current.uvIndex);

  return (
    <div className="mx-auto max-w-[1380px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Page Header & City Quick Switcher */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200/80 pb-5 md:flex-row md:items-end dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-sky-400">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Extended Projection</span>
            <span aria-hidden="true">·</span>
            <span>24-Hour &amp; 7-Day Outlook</span>
          </div>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            {weatherData.name} Weather Forecast
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {weatherData.region}, {weatherData.country}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <CityQuickSwitcher />
          <div
            role="group"
            aria-label="Temperature unit"
            className="inline-flex items-center rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900"
          >
            <button
              type="button"
              onClick={() => setUnit('C')}
              aria-pressed={unit === 'C'}
              className={`rounded-lg px-2.5 py-1 font-mono text-xs font-semibold transition-colors ${
                unit === 'C'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              °C
            </button>
            <button
              type="button"
              onClick={() => setUnit('F')}
              aria-pressed={unit === 'F'}
              className={`rounded-lg px-2.5 py-1 font-mono text-xs font-semibold transition-colors ${
                unit === 'F'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              °F
            </button>
          </div>
        </div>
      </div>

      {/* Compact Current Snapshot Strip */}
      <div className="grid grid-cols-1 gap-4 rounded-3xl border border-slate-200/90 bg-white p-5 sm:grid-cols-2 lg:grid-cols-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3.5">
          <WeatherIcon condition={weatherData.current.icon} size={46} />
          <div>
            <p className="font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              {formatTemp(weatherData.current.tempC, unit, true)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {weatherData.current.condition} · Feels like{' '}
              {formatTemp(weatherData.current.feelsLikeC, unit)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-slate-100 pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0 dark:border-slate-800">
          <Droplets className="h-5 w-5 text-sky-500" aria-hidden="true" />
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Rain &amp; Humidity</p>
            <p className="font-mono text-sm font-semibold tabular-nums text-slate-900 dark:text-white">
              {weatherData.current.rainProbability}% chance · {weatherData.current.humidity}% RH
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-slate-100 pt-3 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0 dark:border-slate-800">
          <Wind className="h-5 w-5 text-blue-500" aria-hidden="true" />
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Wind &amp; Gusts</p>
            <p className="font-mono text-sm font-semibold tabular-nums text-slate-900 dark:text-white">
              {weatherData.current.windSpeedKmh} km/h {weatherData.current.windDirection} · Gusts{' '}
              {weatherData.current.windGustKmh}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-slate-100 pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0 dark:border-slate-800">
          <Sun className="h-5 w-5 text-amber-500" aria-hidden="true" />
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">UV Exposure</p>
            <p className="font-mono text-sm font-semibold tabular-nums text-slate-900 dark:text-white">
              Index {weatherData.current.uvIndex}{' '}
              <span className={`font-sans text-xs font-semibold ${uvInfo.textColor}`}>
                ({uvInfo.label})
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Full 24-Hour Interactive Timeline */}
      <HourlyForecast hourly={weatherData.hourly} showExpandedInspector={true} />

      {/* 7-Day Detailed Forecast + Contextual Advice */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <WeeklyForecast daily={weatherData.daily} expandable={true} />
        </div>
        <div className="lg:col-span-4">
          <WeatherRecommendations data={weatherData} />
        </div>
      </div>
    </div>
  );
};
