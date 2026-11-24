import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  CloudSun,
  Loader2,
  MapPin,
  Menu,
  Moon,
  Search,
  Star,
  Sun,
  X,
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { searchCities } from '../services/weatherService';
import { formatTemp } from '../utils/weatherUtils';
import { WeatherIcon } from './WeatherIcon';

const NAV_LINKS = [
  { label: 'Dashboard', to: '/' },
  { label: 'Forecast', to: '/forecast' },
  { label: 'Weather Analytics', to: '/analytics' },
  { label: 'About', to: '/about' },
];

export const Navbar: React.FC = () => {
  const {
    selectedCityId,
    selectCity,
    unit,
    theme,
    toggleTheme,
    detectCurrentLocation,
    isLocating,
    isFavorite,
    toggleFavorite,
  } = useWeather();

  const location = useLocation();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const desktopInputRef = useRef<HTMLInputElement>(null);

  const suggestions = searchCities(query);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        searchWrapperRef.current &&
        !searchWrapperRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSelectSuggestion = (cityId: string) => {
    selectCity(cityId);
    setQuery('');
    setIsSearchOpen(false);
    setMobileMenuOpen(false);
    if (location.pathname === '/about') {
      navigate('/');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isSearchOpen) setIsSearchOpen(true);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (suggestions.length ? (prev + 1) % suggestions.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) =>
        suggestions.length ? (prev - 1 + suggestions.length) % suggestions.length : 0
      );
    } else if (e.key === 'Enter' && suggestions[activeIndex]) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[activeIndex].id);
    } else if (e.key === 'Escape') {
      setIsSearchOpen(false);
      desktopInputRef.current?.blur();
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-md transition-colors duration-200 dark:border-slate-800/80 dark:bg-slate-950/85">
      <div className="mx-auto flex h-16 max-w-[1380px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand Zone */}
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2.5 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-sm shadow-blue-500/20">
            <CloudSun className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Weatherly
          </span>
        </Link>

        {/* Primary Navigation Links */}
        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-7 lg:flex"
        >
          {NAV_LINKS.map((item) => {
            const isActive =
              item.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`relative whitespace-nowrap shrink-0 py-1 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded ${
                  isActive
                    ? 'text-blue-600 dark:text-sky-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute inset-x-0 -bottom-[21px] h-0.5 rounded-full bg-blue-600 dark:bg-sky-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Search & Utility Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Desktop / Tablet City Search */}
          <div ref={searchWrapperRef} className="relative hidden sm:block">
            <div className="relative flex items-center">
              <Search
                className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400 dark:text-slate-500"
                aria-hidden="true"
              />
              <input
                ref={desktopInputRef}
                type="text"
                value={query}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search city..."
                aria-label="Search weather by city"
                aria-expanded={isSearchOpen}
                aria-autocomplete="list"
                className="h-10 w-48 rounded-xl border border-slate-200 bg-slate-100/70 pl-9 pr-8 text-sm text-slate-900 placeholder:text-slate-500 transition-all duration-150 focus:w-64 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-sky-500 dark:focus:bg-slate-900 md:w-56 lg:w-60 lg:focus:w-72"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    desktopInputRef.current?.focus();
                  }}
                  aria-label="Clear search"
                  className="absolute right-2.5 rounded-md p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {isSearchOpen && (
              <div
                role="listbox"
                className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/40"
              >
                <div className="flex items-center justify-between border-b border-slate-100 px-3.5 py-2 text-xs font-medium text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <span>{query.trim() ? 'Matching Cities' : 'Popular Cities'}</span>
                  <span className="font-mono tabular-nums">{suggestions.length} found</span>
                </div>

                {suggestions.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      No cities matched &ldquo;{query}&rdquo;
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Try Pune, Mumbai, Delhi, Bengaluru, Hyderabad, or Chennai.
                    </p>
                  </div>
                ) : (
                  <ul className="max-h-72 overflow-y-auto py-1.5">
                    {suggestions.map((city, idx) => {
                      const fav = isFavorite(city.id);
                      const selected = city.id === selectedCityId;
                      return (
                        <li key={city.id} role="option" aria-selected={selected}>
                          <div
                            className={`flex items-center justify-between px-3 py-2 transition-colors ${
                              idx === activeIndex
                                ? 'bg-sky-50 dark:bg-slate-800/80'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => handleSelectSuggestion(city.id)}
                              className="flex min-w-0 flex-1 items-center gap-3 text-left"
                            >
                              <WeatherIcon condition={city.current.icon} size={28} />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                                  {city.name}
                                  {selected && (
                                    <span className="ml-1.5 text-xs font-normal text-blue-600 dark:text-sky-400">
                                      · Active
                                    </span>
                                  )}
                                </p>
                                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                  {city.region}, {city.country}
                                </p>
                              </div>
                            </button>
                            <div className="ml-2 flex shrink-0 items-center gap-2">
                              <span className="font-mono text-sm font-semibold tabular-nums text-slate-800 dark:text-slate-100">
                                {formatTemp(city.current.tempC, unit)}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(city.id);
                                }}
                                aria-label={
                                  fav
                                    ? `Remove ${city.name} from favourites`
                                    : `Add ${city.name} to favourites`
                                }
                                className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                                  fav
                                    ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10'
                                    : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200'
                                }`}
                              >
                                <Star
                                  className="h-4 w-4"
                                  fill={fav ? 'currentColor' : 'none'}
                                />
                              </button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Current Location Button */}
          <button
            type="button"
            onClick={detectCurrentLocation}
            disabled={isLocating}
            title="Detect nearest monitoring station"
            aria-label="Use current location"
            className="inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition-colors duration-150 hover:border-blue-300 hover:bg-sky-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-sky-700 dark:hover:bg-slate-800 dark:hover:text-sky-300"
          >
            {isLocating ? (
              <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-sky-400" />
            ) : (
              <MapPin className="h-4 w-4 text-blue-600 dark:text-sky-400" />
            )}
            <span className="hidden xl:inline">Locate</span>
          </button>

          {/* Light / Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-colors duration-150 hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-600" />
            )}
          </button>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 lg:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 pb-5 pt-4 shadow-lg dark:border-slate-800 dark:bg-slate-950 lg:hidden">
          {/* Mobile Search Input */}
          <div className="mb-4 sm:hidden">
            <div className="relative flex items-center">
              <Search
                className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Pune, Mumbai, Delhi..."
                aria-label="Search city on mobile"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-100/80 pl-9 pr-9 text-sm text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Clear mobile search"
                  className="absolute right-3 text-slate-400"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {query.trim() && (
              <div className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                {suggestions.length === 0 ? (
                  <p className="px-3.5 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
                    No matching cities found.
                  </p>
                ) : (
                  suggestions.map((city) => (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => handleSelectSuggestion(city.id)}
                      className="flex w-full items-center justify-between border-b border-slate-100 px-3.5 py-2.5 text-left last:border-b-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
                    >
                      <span className="flex items-center gap-2.5">
                        <WeatherIcon condition={city.current.icon} size={24} />
                        <span>
                          <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {city.name}
                          </span>
                          <span className="block text-xs text-slate-500 dark:text-slate-400">
                            {city.region}, {city.country}
                          </span>
                        </span>
                      </span>
                      <span className="font-mono text-sm font-semibold tabular-nums text-slate-800 dark:text-slate-100">
                        {formatTemp(city.current.tempC, unit)}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
            {NAV_LINKS.map((item) => {
              const isActive =
                item.to === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex min-h-[44px] items-center rounded-xl px-3.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sky-50 text-blue-700 dark:bg-sky-950/60 dark:text-sky-300'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
};
