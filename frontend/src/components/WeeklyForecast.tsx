import React, { useState } from 'react';
import {
  ChevronDown,
  CloudRain,
  Droplets,
  Sun,
  Sunrise,
  Sunset,
  Wind,
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { DailyForecastItem } from '../types/weather';
import { formatTemp, getUvRisk } from '../utils/weatherUtils';
import { WeatherIcon } from './WeatherIcon';

interface WeeklyForecastProps {
  daily: DailyForecastItem[];
  expandable?: boolean;
}

export const WeeklyForecast: React.FC<WeeklyForecastProps> = ({
  daily,
  expandable = true,
}) => {
  const { unit } = useWeather();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(expandable ? 0 : null);

  const weekMin = Math.min(...daily.map((d) => d.minTempC));
  const weekMax = Math.max(...daily.map((d) => d.maxTempC));
  const span = Math.max(1, weekMax - weekMin);

  return (
    <section
      aria-label="7-day weather forecast"
      className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            7-Day Forecast
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Daily temperature range and precipitation outlook
          </p>
        </div>
        <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
          {formatTemp(weekMin, unit)} – {formatTemp(weekMax, unit, true)}
        </span>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
        {daily.map((day, idx) => {
          const isOpen = expandable && expandedIndex === idx;
          const leftPct = ((day.minTempC - weekMin) / span) * 100;
          const widthPct = Math.max(12, ((day.maxTempC - day.minTempC) / span) * 100);
          const uvInfo = getUvRisk(day.uvIndex);

          return (
            <div key={`${day.dayName}-${day.dateLabel}`} className="py-1 first:pt-0 last:pb-0">
              <button
                type="button"
                onClick={() =>
                  expandable && setExpandedIndex((prev) => (prev === idx ? null : idx))
                }
                aria-expanded={isOpen}
                className="grid w-full grid-cols-[96px_40px_1fr_auto] items-center gap-2 rounded-2xl px-2.5 py-3 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:grid-cols-[120px_44px_130px_1fr_auto] sm:gap-4 dark:hover:bg-slate-800/60"
              >
                {/* Day & Date */}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {day.dayName}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {day.dateLabel}
                  </p>
                </div>

                {/* Weather Icon */}
                <div className="flex items-center justify-center">
                  <WeatherIcon condition={day.icon} size={32} />
                </div>

                {/* Condition & Rain Probability */}
                <div className="hidden min-w-0 sm:block">
                  <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                    {day.condition}
                  </p>
                  <p className="inline-flex items-center gap-1 font-mono text-xs tabular-nums text-blue-600 dark:text-sky-400">
                    <Droplets className="h-3 w-3" aria-hidden="true" />
                    {day.rainProbability}% rain
                  </p>
                </div>

                {/* Temperature Range Bar */}
                <div className="flex items-center gap-2.5">
                  <span className="w-8 text-right font-mono text-xs font-medium tabular-nums text-slate-500 dark:text-slate-400">
                    {formatTemp(day.minTempC, unit)}
                  </span>
                  <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="absolute inset-y-0 rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-amber-400"
                      style={{
                        left: `${leftPct}%`,
                        width: `${Math.min(100 - leftPct, widthPct)}%`,
                      }}
                    />
                  </div>
                  <span className="w-8 font-mono text-xs font-semibold tabular-nums text-slate-900 dark:text-white">
                    {formatTemp(day.maxTempC, unit)}
                  </span>
                </div>

                {/* Rain Prob (mobile) + Expand Chevron */}
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-0.5 font-mono text-xs tabular-nums text-blue-600 sm:hidden dark:text-sky-400">
                    <Droplets className="h-3 w-3" aria-hidden="true" />
                    {day.rainProbability}%
                  </span>
                  {expandable && (
                    <ChevronDown
                      className={`h-4 w-4 text-slate-400 transition-transform duration-150 ${
                        isOpen ? 'rotate-180 text-blue-600 dark:text-sky-400' : ''
                      }`}
                      aria-hidden="true"
                    />
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="mx-2.5 mb-2 mt-1 grid grid-cols-2 gap-3 rounded-xl bg-slate-50/90 px-4 py-3 text-xs sm:grid-cols-5 dark:bg-slate-800/50">
                  <div>
                    <span className="block text-slate-500 dark:text-slate-400">Condition</span>
                    <span className="mt-0.5 block font-semibold text-slate-800 dark:text-slate-100">
                      {day.condition}
                    </span>
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
                      <CloudRain className="h-3 w-3" aria-hidden="true" />
                      Rainfall
                    </span>
                    <span className="mt-0.5 block font-mono font-semibold tabular-nums text-slate-800 dark:text-slate-100">
                      {day.rainfallMm.toFixed(1)} mm ({day.rainProbability}%)
                    </span>
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
                      <Droplets className="h-3 w-3" aria-hidden="true" />
                      Humidity
                    </span>
                    <span className="mt-0.5 block font-mono font-semibold tabular-nums text-slate-800 dark:text-slate-100">
                      {day.humidity}%
                    </span>
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
                      <Wind className="h-3 w-3" aria-hidden="true" />
                      Wind
                    </span>
                    <span className="mt-0.5 block font-mono font-semibold tabular-nums text-slate-800 dark:text-slate-100">
                      {day.windSpeedKmh} km/h
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center justify-between sm:col-span-1 sm:block">
                    <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
                      <Sun className="h-3 w-3" aria-hidden="true" />
                      UV Index
                    </span>
                    <span className={`mt-0.5 block font-mono font-semibold tabular-nums ${uvInfo.textColor}`}>
                      {day.uvIndex} · {uvInfo.label}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center gap-5 border-t border-slate-200/70 pt-2 text-[11px] text-slate-500 sm:col-span-5 dark:border-slate-700/70 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                      <Sunrise className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
                      Sunrise {day.sunrise}
                    </span>
                    <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                      <Sunset className="h-3.5 w-3.5 text-orange-500" aria-hidden="true" />
                      Sunset {day.sunset}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
