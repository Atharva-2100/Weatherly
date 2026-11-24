import React, { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  Clock,
  MapPin,
  Star,
  Sunrise,
  Sunset,
  Thermometer,
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { CityWeatherData } from '../types/weather';
import {
  formatCityDateTime,
  formatTemp,
  getHeroGradient,
} from '../utils/weatherUtils';
import { WeatherIcon } from './WeatherIcon';

interface CurrentWeatherCardProps {
  data: CityWeatherData;
}

export const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({ data }) => {
  const { unit, setUnit, isFavorite, toggleFavorite } = useWeather();
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(interval);
  }, []);

  const { dateStr, timeStr } = formatCityDateTime(data.timezone, now);
  const { current } = data;
  const gradientClass = getHeroGradient(current.icon);
  const fav = isFavorite(data.id);

  return (
    <section
      aria-label={`Current weather in ${data.name}`}
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradientClass} p-6 text-white shadow-lg shadow-blue-950/15 sm:p-8`}
    >
      {/* Subtle atmospheric glow orbs (non-distracting radial light) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-sky-300/15 blur-3xl"
      />

      <div className="relative z-10 flex h-full flex-col justify-between gap-6">
        {/* Top Row: Location, Date/Time & Unit/Favourite Controls */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-sky-200" aria-hidden="true" />
              <h1 className="font-display truncate text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {data.name}, {data.country}
              </h1>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-medium text-sky-100/90 sm:text-sm">
              <span>{data.region}</span>
              <span aria-hidden="true" className="text-sky-200/60">
                ·
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-sky-200/80" aria-hidden="true" />
                {dateStr}
              </span>
              <span aria-hidden="true" className="text-sky-200/60">
                ·
              </span>
              <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                <Clock className="h-3.5 w-3.5 text-sky-200/80" aria-hidden="true" />
                {timeStr}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {/* Favourite Toggle Button */}
            <button
              type="button"
              onClick={() => toggleFavorite(data.id)}
              aria-label={
                fav
                  ? `Remove ${data.name} from favourites`
                  : `Add ${data.name} to favourites`
              }
              className={`inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-xl border px-3 text-xs font-semibold backdrop-blur-md transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                fav
                  ? 'border-amber-300/60 bg-amber-400/20 text-amber-100 hover:bg-amber-400/30'
                  : 'border-white/20 bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Star
                className={`h-4 w-4 ${fav ? 'text-amber-300' : 'text-white'}`}
                fill={fav ? 'currentColor' : 'none'}
              />
              <span>{fav ? 'Saved' : 'Save'}</span>
            </button>

            {/* Celsius / Fahrenheit Segmented Switcher */}
            <div
              role="group"
              aria-label="Temperature unit"
              className="flex h-10 items-center rounded-xl border border-white/20 bg-white/10 p-1 backdrop-blur-md"
            >
              <button
                type="button"
                onClick={() => setUnit('C')}
                aria-pressed={unit === 'C'}
                className={`h-8 rounded-lg px-2.5 font-mono text-xs font-semibold transition-colors ${
                  unit === 'C'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-sky-100 hover:text-white'
                }`}
              >
                °C
              </button>
              <button
                type="button"
                onClick={() => setUnit('F')}
                aria-pressed={unit === 'F'}
                className={`h-8 rounded-lg px-2.5 font-mono text-xs font-semibold transition-colors ${
                  unit === 'F'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-sky-100 hover:text-white'
                }`}
              >
                °F
              </button>
            </div>
          </div>
        </div>

        {/* Middle Row: Primary Temperature & Weather Illustration */}
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-5">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md sm:h-28 sm:w-28">
              <WeatherIcon condition={current.icon} size={82} />
            </div>
            <div>
              <div className="font-display text-6xl font-bold leading-none tracking-tight tabular-nums text-white sm:text-7xl">
                {formatTemp(current.tempC, unit)}
              </div>
              <p className="mt-2 text-lg font-semibold text-white sm:text-xl">
                {current.condition}
              </p>
              <p className="mt-1 max-w-md text-xs leading-relaxed text-sky-100/90 sm:text-sm">
                {current.description}
              </p>
            </div>
          </div>

          {/* Feels-like & Min/Max Summary */}
          <div className="flex w-full flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/15 pt-4 sm:w-auto sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
            <div className="flex items-center gap-2 text-sm text-sky-100">
              <Thermometer className="h-4 w-4 text-sky-200" aria-hidden="true" />
              <span>Feels like</span>
              <span className="font-mono text-base font-semibold tabular-nums text-white">
                {formatTemp(current.feelsLikeC, unit, true)}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-sky-100">
              <span className="inline-flex items-center gap-1">
                <ArrowUp className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
                High
                <strong className="font-mono font-semibold tabular-nums text-white">
                  {formatTemp(current.maxTempC, unit)}
                </strong>
              </span>
              <span className="inline-flex items-center gap-1">
                <ArrowDown className="h-3.5 w-3.5 text-sky-200" aria-hidden="true" />
                Low
                <strong className="font-mono font-semibold tabular-nums text-white">
                  {formatTemp(current.minTempC, unit)}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Glassmorphic Strip: Sunrise, Daylight Progress & Sunset */}
        <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3.5 backdrop-blur-md sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Sunrise className="h-4 w-4 text-amber-300" aria-hidden="true" />
              <div>
                <p className="text-[11px] font-medium text-sky-100/80">Sunrise</p>
                <p className="font-mono text-sm font-semibold tabular-nums text-white">
                  {current.sunrise}
                </p>
              </div>
            </div>

            <div className="hidden flex-1 flex-col gap-1.5 px-4 sm:flex">
              <div className="flex items-center justify-between text-[11px] text-sky-100/80">
                <span>Daylight progress</span>
                <span className="font-mono tabular-nums">{current.daylightProgress}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-300 via-yellow-200 to-sky-200"
                  style={{ width: `${current.daylightProgress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-right">
              <div>
                <p className="text-[11px] font-medium text-sky-100/80">Sunset</p>
                <p className="font-mono text-sm font-semibold tabular-nums text-white">
                  {current.sunset}
                </p>
              </div>
              <Sunset className="h-4 w-4 text-orange-300" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
