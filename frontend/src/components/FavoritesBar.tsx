import React from 'react';
import { Plus, Star, X } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { formatTemp } from '../utils/weatherUtils';
import { WeatherIcon } from './WeatherIcon';

export const FavoritesBar: React.FC = () => {
  const {
    allCities,
    favorites,
    selectedCityId,
    selectCity,
    toggleFavorite,
    restoreDefaultFavorites,
    unit,
  } = useWeather();

  const favoriteCities = favorites
    .map((id) => allCities.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <section aria-label="Favourite locations" className="mb-6">
      <div className="mb-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-500" fill="currentColor" aria-hidden="true" />
          <h2 className="font-display text-sm font-semibold text-slate-800 dark:text-slate-200">
            Favourite Locations
          </h2>
          <span className="text-xs text-slate-400 dark:text-slate-500" aria-hidden="true">
            ·
          </span>
          <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
            {favoriteCities.length} saved
          </span>
        </div>

        {favoriteCities.length === 0 && (
          <button
            type="button"
            onClick={restoreDefaultFavorites}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-sky-400 dark:hover:text-sky-300"
          >
            <Plus className="h-3.5 w-3.5" />
            Add popular cities
          </button>
        )}
      </div>

      {favoriteCities.length === 0 ? (
        <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-dashed border-slate-300 bg-white/70 px-5 py-4 sm:flex-row sm:items-center dark:border-slate-700 dark:bg-slate-900/50">
          <div>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
              No favourite cities pinned yet
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Star any city from the weather header or search results for one-click monitoring.
            </p>
          </div>
          <button
            type="button"
            onClick={restoreDefaultFavorites}
            className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-sky-600 dark:hover:bg-sky-500"
          >
            <Plus className="h-3.5 w-3.5" />
            Pin Popular Cities
          </button>
        </div>
      ) : (
        <div className="weather-scroll flex items-center gap-2.5 overflow-x-auto pb-1">
          {favoriteCities.map((city) => {
            const isActive = city.id === selectedCityId;
            return (
              <div
                key={city.id}
                className={`group flex shrink-0 items-center rounded-xl border transition-all duration-150 ${
                  isActive
                    ? 'border-blue-500/80 bg-blue-50/90 shadow-sm shadow-blue-500/10 dark:border-sky-500/70 dark:bg-sky-950/60'
                    : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-800/80'
                }`}
              >
                <button
                  type="button"
                  onClick={() => selectCity(city.id)}
                  className="flex min-h-[44px] items-center gap-2.5 pl-3 pr-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-l-xl"
                >
                  <WeatherIcon condition={city.current.icon} size={24} />
                  <div className="whitespace-nowrap">
                    <span
                      className={`block text-xs font-semibold leading-tight ${
                        isActive
                          ? 'text-blue-800 dark:text-sky-200'
                          : 'text-slate-800 dark:text-slate-100'
                      }`}
                    >
                      {city.name}
                    </span>
                    <span className="block text-[11px] leading-tight text-slate-500 dark:text-slate-400">
                      {city.current.condition}
                    </span>
                  </div>
                  <span
                    className={`ml-1 font-mono text-sm font-semibold tabular-nums ${
                      isActive
                        ? 'text-blue-700 dark:text-sky-300'
                        : 'text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {formatTemp(city.current.tempC, unit)}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleFavorite(city.id)}
                  aria-label={`Remove ${city.name} from favourites`}
                  title={`Remove ${city.name}`}
                  className="mr-1.5 flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 opacity-70 transition-all hover:bg-slate-200/70 hover:text-slate-700 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
