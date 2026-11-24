import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Droplets, Wind } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { HourlyForecastItem } from '../types/weather';
import { formatTemp } from '../utils/weatherUtils';
import { WeatherIcon } from './WeatherIcon';

interface HourlyForecastProps {
  hourly: HourlyForecastItem[];
  showExpandedInspector?: boolean;
}

export const HourlyForecast: React.FC<HourlyForecastProps> = ({
  hourly,
  showExpandedInspector = false,
}) => {
  const { unit } = useWeather();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const selectedHour = hourly[selectedIndex] ?? hourly[0];

  const scrollByAmount = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const distance = direction === 'left' ? -320 : 320;
    scrollRef.current.scrollBy({ left: distance, behavior: 'smooth' });
  };

  return (
    <section
      aria-label="24-hour hourly forecast"
      className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Hourly Forecast
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Next 24 hours · Select any hour to inspect conditions
          </p>
        </div>

        <div className="hidden items-center gap-1.5 sm:flex">
          <button
            type="button"
            onClick={() => scrollByAmount('left')}
            aria-label="Scroll hourly forecast left"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollByAmount('right')}
            aria-label="Scroll hourly forecast right"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Track */}
      <div
        ref={scrollRef}
        className="weather-scroll flex gap-3 overflow-x-auto pb-2.5 pt-1"
      >
        {hourly.map((item, index) => {
          const isSelected = index === selectedIndex;
          return (
            <button
              key={`${item.fullTime}-${index}`}
              type="button"
              onClick={() => setSelectedIndex(index)}
              aria-pressed={isSelected}
              className={`flex w-[92px] shrink-0 flex-col items-center justify-between gap-2.5 rounded-2xl border px-3 py-3.5 text-center transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                isSelected
                  ? 'border-blue-500 bg-blue-600 text-white shadow-md shadow-blue-600/20 dark:border-sky-500 dark:bg-sky-600'
                  : 'border-slate-200/80 bg-slate-50/70 text-slate-800 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-white dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-100 dark:hover:border-slate-700 dark:hover:bg-slate-800'
              }`}
            >
              <span
                className={`whitespace-nowrap text-xs font-semibold ${
                  isSelected ? 'text-sky-100' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {item.hourLabel}
              </span>

              <WeatherIcon condition={item.icon} size={34} />

              <span className="font-mono text-base font-bold tabular-nums">
                {formatTemp(item.tempC, unit)}
              </span>

              <span
                className={`inline-flex items-center gap-1 font-mono text-[11px] font-medium tabular-nums ${
                  isSelected
                    ? 'text-sky-100'
                    : item.rainProbability >= 45
                      ? 'text-blue-600 dark:text-sky-400'
                      : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Droplets className="h-3 w-3" aria-hidden="true" />
                {item.rainProbability}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Hour Detail Strip */}
      {selectedHour && (
        <div
          className={`mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-slate-100 pt-3.5 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-300 ${
            showExpandedInspector ? 'sm:text-sm' : ''
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="font-semibold text-slate-900 dark:text-white">
              {selectedHour.hourLabel === 'Now' ? 'Current hour' : selectedHour.hourLabel}
            </span>
            <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">
              ·
            </span>
            <span>{selectedHour.condition}</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 font-mono tabular-nums">
            <span>
              Feels like{' '}
              <strong className="font-semibold text-slate-900 dark:text-white">
                {formatTemp(selectedHour.feelsLikeC, unit, true)}
              </strong>
            </span>
            <span>
              Humidity{' '}
              <strong className="font-semibold text-slate-900 dark:text-white">
                {selectedHour.humidity}%
              </strong>
            </span>
            <span className="inline-flex items-center gap-1">
              <Wind className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              <strong className="font-semibold text-slate-900 dark:text-white">
                {selectedHour.windSpeedKmh} km/h
              </strong>
            </span>
            <span>
              Rain{' '}
              <strong className="font-semibold text-slate-900 dark:text-white">
                {selectedHour.rainfallMm.toFixed(1)} mm
              </strong>
            </span>
          </div>
        </div>
      )}
    </section>
  );
};
