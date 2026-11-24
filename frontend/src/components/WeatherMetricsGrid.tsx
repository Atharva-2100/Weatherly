import React from 'react';
import {
  CloudRain,
  Droplets,
  Eye,
  Gauge,
  Sun,
  Wind,
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { CurrentWeatherMetrics } from '../types/weather';
import {
  formatTemp,
  getHumidityComfort,
  getUvRisk,
  getVisibilityStatus,
  getWindStatus,
} from '../utils/weatherUtils';

interface WeatherMetricsGridProps {
  current: CurrentWeatherMetrics;
}

export const WeatherMetricsGrid: React.FC<WeatherMetricsGridProps> = ({ current }) => {
  const { unit } = useWeather();
  const uv = getUvRisk(current.uvIndex);

  const cards = [
    {
      id: 'humidity',
      label: 'Humidity',
      value: `${current.humidity}%`,
      detail: `${getHumidityComfort(current.humidity)} · Dew point ${formatTemp(current.dewPointC, unit)}`,
      icon: Droplets,
      iconBg: 'bg-sky-50 text-sky-600 dark:bg-sky-950/70 dark:text-sky-400',
      progress: current.humidity,
      progressColor: 'bg-sky-500',
    },
    {
      id: 'wind',
      label: 'Wind Speed',
      value: `${current.windSpeedKmh} km/h`,
      detail: `${getWindStatus(current.windSpeedKmh)} · ${current.windDirection} (gusts ${current.windGustKmh} km/h)`,
      icon: Wind,
      iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400',
      progress: Math.min(100, Math.round((current.windSpeedKmh / 50) * 100)),
      progressColor: 'bg-blue-500',
    },
    {
      id: 'rainfall',
      label: 'Rainfall',
      value: `${current.rainfallMm.toFixed(1)} mm`,
      detail:
        current.rainfallMm > 0
          ? `${current.rainProbability}% chance · Last 24h volume`
          : `${current.rainProbability}% chance · Dry conditions`,
      icon: CloudRain,
      iconBg: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400',
      progress: Math.min(100, Math.round((current.rainfallMm / 35) * 100)),
      progressColor: 'bg-indigo-500',
    },
    {
      id: 'pressure',
      label: 'Atmospheric Pressure',
      value: `${current.pressureHpa} hPa`,
      detail: `${current.pressureTrend} barometric trend`,
      icon: Gauge,
      iconBg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      progress: Math.min(100, Math.max(8, Math.round(((current.pressureHpa - 990) / 45) * 100))),
      progressColor: 'bg-slate-500 dark:bg-slate-400',
    },
    {
      id: 'visibility',
      label: 'Visibility',
      value: `${current.visibilityKm} km`,
      detail: getVisibilityStatus(current.visibilityKm),
      icon: Eye,
      iconBg: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/70 dark:text-cyan-400',
      progress: Math.min(100, Math.round((current.visibilityKm / 16) * 100)),
      progressColor: 'bg-cyan-500',
    },
    {
      id: 'uv',
      label: 'UV Index',
      value: `${current.uvIndex}`,
      valueSub: uv.label,
      valueSubColor: uv.textColor,
      detail: uv.description,
      icon: Sun,
      iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
      progress: Math.min(100, Math.round((current.uvIndex / 11) * 100)),
      progressColor: uv.barColor,
    },
  ];

  return (
    <section aria-label="Atmospheric weather metrics">
      <div className="mb-3.5 flex items-baseline justify-between">
        <h2 className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white">
          Atmospheric Metrics
        </h2>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Surface telemetry overview
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article
              key={card.id}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 transition-transform duration-150 ease-out hover:-translate-y-0.5 hover:border-blue-200 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {card.label}
                </span>
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-150 group-hover:scale-105 ${card.iconBg}`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>

              <div className="mt-4">
                <div className="flex items-baseline gap-2">
                  <p className="font-mono text-2xl font-semibold tracking-tight tabular-nums text-slate-900 dark:text-white">
                    {card.value}
                  </p>
                  {card.valueSub && (
                    <span className={`text-xs font-semibold ${card.valueSubColor}`}>
                      {card.valueSub}
                    </span>
                  )}
                </div>

                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${card.progressColor}`}
                    style={{ width: `${Math.max(4, card.progress)}%` }}
                  />
                </div>

                <p className="mt-2.5 text-xs leading-snug text-slate-500 dark:text-slate-400">
                  {card.detail}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
