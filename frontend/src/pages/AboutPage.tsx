import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  CloudSun,
  Compass,
  Gauge,
  Layers,
  ShieldCheck,
  Sun,
} from 'lucide-react';
import { WeatherIcon } from '../components/WeatherIcon';
import { useWeather } from '../context/WeatherContext';
import { formatTemp } from '../utils/weatherUtils';

const METRIC_GUIDES = [
  {
    icon: Sun,
    title: 'UV Index Scale',
    description:
      'Quantifies solar ultraviolet radiation intensity from 0 to 11+. Readings at 6 or above trigger automatic sun protection recommendations.',
  },
  {
    icon: Gauge,
    title: 'Atmospheric Pressure (hPa)',
    description:
      'Measures air column weight at sea level. Standard pressure sits near 1013 hPa; falling pressure often signals incoming rain or coastal squalls.',
  },
  {
    icon: Compass,
    title: 'Feels-Like Temperature',
    description:
      'Combines ambient air temperature with relative humidity and wind velocity to reflect how conditions physically feel outdoors.',
  },
  {
    icon: Layers,
    title: 'API-Ready Architecture',
    description:
      'All meteorological views consume a clean async weatherService abstraction, allowing live REST providers like OpenWeatherMap or Open-Meteo to plug in directly.',
  },
];

export const AboutPage: React.FC = () => {
  const { allCities, selectCity, unit, selectedCityId } = useWeather();
  const navigate = useNavigate();

  const handleOpenCity = (cityId: string) => {
    selectCity(cityId);
    navigate('/');
  };

  return (
    <div className="mx-auto max-w-[1380px] space-y-10 px-4 py-8 sm:px-6 lg:px-8">
      {/* Intro Section */}
      <section className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 dark:border-slate-800 dark:bg-slate-900">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-sky-400">
            <CloudSun className="h-4 w-4" aria-hidden="true" />
            <span>About Weatherly</span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Clear atmospheric visibility, designed for everyday decisions
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
            Weatherly is a modern, cloud-ready frontend weather monitoring dashboard built with
            React, Tailwind CSS, Lucide icons, and interactive Recharts visualizations. It brings
            together instant city search, favourite location pinning, hourly and 7-day projections,
            and context-aware weather recommendations in a responsive interface across desktop,
            tablet, and mobile screens.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 border-t border-slate-100 pt-8 sm:grid-cols-2 lg:grid-cols-4 dark:border-slate-800">
          {METRIC_GUIDES.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="space-y-2">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-blue-600 dark:bg-sky-950/70 dark:text-sky-400">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                  {item.title}
                </h2>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Supported Monitoring Stations Directory */}
      <section aria-label="Supported monitoring stations">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Monitoring Stations Directory
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Select any city below to open its full live dashboard and trend charts.
            </p>
          </div>
          <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
            {allCities.length} stations available
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {allCities.map((city) => {
            const active = city.id === selectedCityId;
            return (
              <button
                key={city.id}
                type="button"
                onClick={() => handleOpenCity(city.id)}
                className={`group flex items-center justify-between rounded-2xl border p-4 text-left transition-all duration-150 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  active
                    ? 'border-blue-500 bg-sky-50/70 dark:border-sky-500 dark:bg-sky-950/40'
                    : 'border-slate-200/90 bg-white hover:border-blue-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <WeatherIcon condition={city.current.icon} size={36} />
                  <div className="min-w-0">
                    <p className="truncate font-display text-sm font-bold text-slate-900 dark:text-white">
                      {city.name}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {city.region}, {city.country}
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] tabular-nums text-slate-400 dark:text-slate-500">
                      {city.stationCode} · {city.elevationM}m elev
                    </p>
                  </div>
                </div>

                <div className="ml-3 flex shrink-0 flex-col items-end gap-1">
                  <span className="font-mono text-lg font-bold tabular-nums text-slate-900 dark:text-white">
                    {formatTemp(city.current.tempC, unit)}
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-slate-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-blue-600 dark:group-hover:text-sky-400" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Frontend Demonstration Note */}
      <section className="flex items-start gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
            Privacy &amp; Local Preferences
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Weatherly runs entirely in your browser. Your favourite cities, selected temperature
            scale (°C / °F), and Light/Dark theme preference are saved strictly in browser
            localStorage with no external account or server storage required.
          </p>
        </div>
      </section>
    </div>
  );
};
