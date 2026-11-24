import React from 'react';
import { useWeather } from '../context/WeatherContext';
import { getPopularCityIds } from '../services/weatherService';

export const CityQuickSwitcher: React.FC = () => {
  const { allCities, selectedCityId, selectCity } = useWeather();
  const popularIds = getPopularCityIds();
  const popularCities = popularIds
    .map((id) => allCities.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <div
      role="group"
      aria-label="Quick city switcher"
      className="weather-scroll flex items-center gap-1.5 overflow-x-auto pb-1"
    >
      {popularCities.map((city) => {
        const active = city.id === selectedCityId;
        return (
          <button
            key={city.id}
            type="button"
            onClick={() => selectCity(city.id)}
            aria-pressed={active}
            className={`shrink-0 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              active
                ? 'bg-blue-600 text-white shadow-sm dark:bg-sky-600'
                : 'border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:text-white'
            }`}
          >
            {city.name}
          </button>
        );
      })}
    </div>
  );
};
