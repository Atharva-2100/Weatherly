import React, { useMemo } from 'react';
import {
  BarChart3,
  CloudRain,
  Droplets,
  Thermometer,
  Wind,
} from 'lucide-react';
import { CityQuickSwitcher } from '../components/CityQuickSwitcher';
import { DashboardSkeleton, WeatherErrorState } from '../components/LoadingSkeleton';
import { WeatherAnalyticsCharts } from '../components/WeatherAnalyticsCharts';
import { useWeather } from '../context/WeatherContext';
import { formatTemp } from '../utils/weatherUtils';

export const AnalyticsPage: React.FC = () => {
  const { weatherData, isLoading, error, retryFetch, unit, setUnit } = useWeather();

  const summary = useMemo(() => {
    if (!weatherData) return null;
    const peakTempC = Math.max(...weatherData.daily.map((d) => d.maxTempC));
    const lowestTempC = Math.min(...weatherData.daily.map((d) => d.minTempC));
    const avgHumidity = Math.round(
      weatherData.daily.reduce((sum, d) => sum + d.humidity, 0) / weatherData.daily.length
    );
    const totalRainfall = Number(
      weatherData.daily.reduce((sum, d) => sum + d.rainfallMm, 0).toFixed(1)
    );
    const peakWind = Math.max(...weatherData.daily.map((d) => d.windSpeedKmh));
    return { peakTempC, lowestTempC, avgHumidity, totalRainfall, peakWind };
  }, [weatherData]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1380px] px-4 py-6 sm:px-6 lg:px-8">
        <DashboardSkeleton />
      </div>
    );
  }

  if (error || !weatherData || !summary) {
    return (
      <div className="mx-auto max-w-[1380px] px-4 py-6 sm:px-6 lg:px-8">
        <WeatherErrorState
          message={error ?? 'No station selected.'}
          onRetry={retryFetch}
        />
      </div>
    );
  }

  const kpis = [
    {
      label: '7-Day Peak / Low',
      value: `${formatTemp(summary.peakTempC, unit)} / ${formatTemp(summary.lowestTempC, unit, true)}`,
      sub: `Current: ${formatTemp(weatherData.current.tempC, unit, true)}`,
      icon: Thermometer,
      accent: 'bg-blue-50 text-blue-600 dark:bg-blue-950/70 dark:text-sky-400',
    },
    {
      label: 'Average Humidity',
      value: `${summary.avgHumidity}%`,
      sub: `Dew point ${formatTemp(weatherData.current.dewPointC, unit, true)}`,
      icon: Droplets,
      accent: 'bg-sky-50 text-sky-600 dark:bg-sky-950/70 dark:text-sky-400',
    },
    {
      label: '7-Day Total Rainfall',
      value: `${summary.totalRainfall.toFixed(1)} mm`,
      sub: `Today: ${weatherData.current.rainfallMm.toFixed(1)} mm`,
      icon: CloudRain,
      accent: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400',
    },
    {
      label: 'Peak Wind Velocity',
      value: `${summary.peakWind} km/h`,
      sub: `Gusts up to ${weatherData.current.windGustKmh} km/h`,
      icon: Wind,
      accent: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/70 dark:text-cyan-400',
    },
  ];

  return (
    <div className="mx-auto max-w-[1380px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200/80 pb-5 md:flex-row md:items-end dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-sky-400">
            <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Meteorological Insights</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">{weatherData.stationCode}</span>
          </div>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            {weatherData.name} Weather Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Interactive temperature, humidity, precipitation, and wind trend charts.
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

      {/* 4-Column KPI Summary Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((item) => {
          const Icon = item.icon;
          return (
            <article
              key={item.label}
              className="rounded-2xl border border-slate-200/90 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {item.label}
                </span>
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${item.accent}`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>
              <p className="mt-3 font-mono text-2xl font-bold tracking-tight tabular-nums text-slate-900 dark:text-white">
                {item.value}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.sub}</p>
            </article>
          );
        })}
      </div>

      {/* Interactive Recharts Suite */}
      <WeatherAnalyticsCharts data={weatherData} compact={false} />

      {/* Compact Daily Tabular Data Ledger */}
      <section className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4">
          <h2 className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            7-Day Meteorological Log
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Structured daily breakdown for {weatherData.name}, {weatherData.country}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="py-3 pr-4">Day</th>
                <th className="py-3 px-4">Condition</th>
                <th className="py-3 px-4 text-right">High / Low</th>
                <th className="py-3 px-4 text-right">Humidity</th>
                <th className="py-3 px-4 text-right">Rainfall</th>
                <th className="py-3 px-4 text-right">Wind</th>
                <th className="py-3 pl-4 text-right">UV Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {weatherData.daily.map((day) => (
                <tr
                  key={`${day.dayName}-${day.dateLabel}`}
                  className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <td className="py-3 pr-4 font-medium text-slate-900 dark:text-white">
                    {day.dayName}{' '}
                    <span className="font-normal text-slate-500 dark:text-slate-400">
                      · {day.dateLabel}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    {day.condition}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-900 dark:text-white">
                    {formatTemp(day.maxTempC, unit)} /{' '}
                    <span className="text-slate-500 dark:text-slate-400">
                      {formatTemp(day.minTempC, unit)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                    {day.humidity}%
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                    {day.rainfallMm.toFixed(1)} mm ({day.rainProbability}%)
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                    {day.windSpeedKmh} km/h
                  </td>
                  <td className="py-3 pl-4 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                    {day.uvIndex}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
