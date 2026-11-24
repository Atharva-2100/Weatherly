import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  fetchCityWeather,
  findNearestCityByCoords,
  getAllCitiesWeatherSync,
  fetchBackendFavorites,
  saveBackendFavorite,
  removeBackendFavorite,
  saveBackendPreferences,
} from '../services/weatherService';
import { CityWeatherData, TemperatureUnit } from '../types/weather';

type ThemeMode = 'light' | 'dark';

interface ToastMessage {
  id: number;
  text: string;
}

interface WeatherContextValue {
  selectedCityId: string;
  weatherData: CityWeatherData | null;
  allCities: CityWeatherData[];
  isLoading: boolean;
  error: string | null;
  unit: TemperatureUnit;
  theme: ThemeMode;
  favorites: string[];
  isLocating: boolean;
  toast: ToastMessage | null;
  selectCity: (cityId: string) => void;
  setUnit: (unit: TemperatureUnit) => void;
  toggleUnit: () => void;
  toggleTheme: () => void;
  toggleFavorite: (cityId: string) => void;
  isFavorite: (cityId: string) => boolean;
  restoreDefaultFavorites: () => void;
  detectCurrentLocation: () => void;
  retryFetch: () => void;
  dismissToast: () => void;
}

const STORAGE_KEYS = {
  CITY: 'weatherly_selected_city',
  UNIT: 'weatherly_unit',
  THEME: 'weatherly_theme',
  FAVORITES: 'weatherly_favorites',
};

const DEFAULT_FAVORITES = ['pune', 'mumbai', 'bengaluru', 'delhi'];

const WeatherContext = createContext<WeatherContextValue | undefined>(undefined);

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export const WeatherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const allCities = getAllCitiesWeatherSync();

  const [selectedCityId, setSelectedCityId] = useState<string>(() => {
    const stored = readStorage<string>(STORAGE_KEYS.CITY, 'pune');
    return allCities.some((c) => c.id === stored) ? stored : 'pune';
  });

  const [weatherData, setWeatherData] = useState<CityWeatherData | null>(
    () => allCities.find((c) => c.id === selectedCityId) ?? allCities[0]
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const [unit, setUnitState] = useState<TemperatureUnit>(() => {
    const stored = readStorage<TemperatureUnit>(STORAGE_KEYS.UNIT, 'C');
    return stored === 'F' ? 'F' : 'C';
  });

  const [theme, setTheme] = useState<ThemeMode>(() => {
    const stored = readStorage<ThemeMode | null>(STORAGE_KEYS.THEME, null);
    if (stored === 'dark' || stored === 'light') return stored;
    return 'light';
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    const stored = readStorage<string[]>(STORAGE_KEYS.FAVORITES, DEFAULT_FAVORITES);
    return Array.isArray(stored)
      ? stored.filter((id) => allCities.some((c) => c.id === id))
      : DEFAULT_FAVORITES;
  });

  const showToast = useCallback((text: string) => {
    setToast({ id: Date.now(), text });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // Sync Tailwind v4 `.dark` class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      window.localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(theme));
    } catch {
      // Ignore storage quota errors
    }
  }, [theme]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.UNIT, JSON.stringify(unit));
    } catch {
      // Ignore
    }
  }, [unit]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    } catch {
      // Ignore
    }
  }, [favorites]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.CITY, JSON.stringify(selectedCityId));
    } catch {
      // Ignore
    }
  }, [selectedCityId]);

  const loadCity = useCallback(async (cityId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchCityWeather(cityId);
      setWeatherData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load weather conditions.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectCity = useCallback(
    (cityId: string) => {
      if (cityId === selectedCityId && weatherData) return;
      setSelectedCityId(cityId);
      loadCity(cityId);
    },
    [loadCity, selectedCityId, weatherData]
  );

  const setUnit = useCallback((nextUnit: TemperatureUnit) => {
    setUnitState(nextUnit);
  }, []);

  const toggleUnit = useCallback(() => {
    setUnitState((prev) => (prev === 'C' ? 'F' : 'C'));
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  // Initial sync with backend DynamoDB favorites
  useEffect(() => {
    fetchBackendFavorites()
      .then((backendFavs) => {
        if (backendFavs && backendFavs.length > 0) {
          setFavorites(backendFavs);
        }
      })
      .catch(() => {});
  }, []);

  const toggleFavorite = useCallback(
    (cityId: string) => {
      const city = allCities.find((c) => c.id === cityId);
      setFavorites((prev) => {
        const exists = prev.includes(cityId);
        if (exists) {
          if (city) showToast(`Removed ${city.name} from favourites`);
          removeBackendFavorite(cityId).catch(() => {});
          return prev.filter((id) => id !== cityId);
        }
        if (city) showToast(`Saved ${city.name} to favourites`);
        saveBackendFavorite(city ? city.name : cityId).catch(() => {});
        return [...prev, cityId];
      });
    },
    [allCities, showToast]
  );

  const isFavorite = useCallback(
    (cityId: string) => favorites.includes(cityId),
    [favorites]
  );

  const restoreDefaultFavorites = useCallback(() => {
    setFavorites(DEFAULT_FAVORITES);
    showToast('Restored popular cities to favourites');
  }, [showToast]);

  const detectCurrentLocation = useCallback(() => {
    setIsLocating(true);
    if (!('geolocation' in navigator)) {
      setIsLocating(false);
      selectCity('pune');
      showToast('Location unavailable — showing Pune monitoring station');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const nearest = findNearestCityByCoords(latitude, longitude);
        setIsLocating(false);
        setSelectedCityId(nearest.id);
        loadCity(nearest.id);
        showToast(`Located nearest station: ${nearest.name}, ${nearest.country}`);
      },
      () => {
        setIsLocating(false);
        setSelectedCityId('pune');
        loadCity('pune');
        showToast('Location access declined — showing Pune station');
      },
      { timeout: 6000, maximumAge: 60000 }
    );
  }, [loadCity, selectCity, showToast]);

  const retryFetch = useCallback(() => {
    loadCity(selectedCityId);
  }, [loadCity, selectedCityId]);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  return (
    <WeatherContext.Provider
      value={{
        selectedCityId,
        weatherData,
        allCities,
        isLoading,
        error,
        unit,
        theme,
        favorites,
        isLocating,
        toast,
        selectCity,
        setUnit,
        toggleUnit,
        toggleTheme,
        toggleFavorite,
        isFavorite,
        restoreDefaultFavorites,
        detectCurrentLocation,
        retryFetch,
        dismissToast,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
};

export function useWeather(): WeatherContextValue {
  const ctx = useContext(WeatherContext);
  if (!ctx) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return ctx;
}
