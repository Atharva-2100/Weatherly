import { MOCK_WEATHER_DATABASE, POPULAR_CITY_IDS } from '../data/mockWeatherData';
import { CitySummary, CityWeatherData, WeatherRecommendation } from '../types/weather';
import { calculateDistanceKm } from '../utils/weatherUtils';

/**
 * Weather Service Layer
 * ---------------------
 * Connected to the Weatherly AWS Lambda & DynamoDB REST Backend API.
 * Seamlessly integrates live weather, forecasts, history, favorites, and preferences,
 * with automatic fallback to local offline cache when the backend is unreachable.
 */

const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  (typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1'
    ? '/api'
    : 'http://localhost:5000/api');

const DEFAULT_USER_ID = 'weatherly-default-user';

export function getAllCitySummaries(): CitySummary[] {
  return MOCK_WEATHER_DATABASE.map(
    ({
      id,
      name,
      region,
      country,
      lat,
      lon,
      timezone,
      utcOffsetHours,
      stationCode,
      elevationM,
    }) => ({
      id,
      name,
      region,
      country,
      lat,
      lon,
      timezone,
      utcOffsetHours,
      stationCode,
      elevationM,
    })
  );
}

export function getAllCitiesWeatherSync(): CityWeatherData[] {
  return MOCK_WEATHER_DATABASE;
}

export function getPopularCityIds(): string[] {
  return POPULAR_CITY_IDS;
}

export function searchCities(query: string): CityWeatherData[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return MOCK_WEATHER_DATABASE.filter((c) => POPULAR_CITY_IDS.includes(c.id));
  }
  return MOCK_WEATHER_DATABASE.filter(
    (city) =>
      city.name.toLowerCase().includes(normalized) ||
      city.region.toLowerCase().includes(normalized) ||
      city.country.toLowerCase().includes(normalized)
  );
}

/**
 * Live City Search via Backend REST API
 */
export async function searchCitiesAsync(query: string): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/weather/search?city=${encodeURIComponent(query)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data?.locations) {
        return json.data.locations;
      }
    }
  } catch {
    // Backend unreachable, fallback to local search
  }
  return searchCities(query);
}

/**
 * Fetch Full Weather for City from Backend REST API
 * (Current Conditions + Hourly Forecast + 7-Day Forecast + Atmospheric Metrics)
 */
export async function fetchCityWeather(cityId: string): Promise<CityWeatherData> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${API_BASE_URL}/weather/full?city=${encodeURIComponent(cityId)}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data as CityWeatherData;
      }
    }
  } catch (err) {
    console.warn(
      `[WeatherService] Live backend unreachable for "${cityId}". Falling back to resilient local database:`,
      err instanceof Error ? err.message : err
    );
  }

  // Fallback to local database match
  const match = MOCK_WEATHER_DATABASE.find(
    (c) => c.id.toLowerCase() === cityId.toLowerCase() || c.name.toLowerCase() === cityId.toLowerCase()
  );
  if (match) {
    return match;
  }

  return MOCK_WEATHER_DATABASE[0];
}

/**
 * Find Nearest City by Lat / Lon Coordinates
 */
export function findNearestCityByCoords(lat: number, lon: number): CityWeatherData {
  let nearest = MOCK_WEATHER_DATABASE[0];
  let shortest = Number.POSITIVE_INFINITY;

  for (const city of MOCK_WEATHER_DATABASE) {
    const dist = calculateDistanceKm(lat, lon, city.lat, city.lon);
    if (dist < shortest) {
      shortest = dist;
      nearest = city;
    }
  }
  return nearest;
}

/**
 * Fetch Weather Analytics from Backend REST API
 */
export async function fetchWeatherAnalytics(
  city: string,
  timeframe: 'daily' | 'weekly' = 'daily'
): Promise<any> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/weather/analytics?city=${encodeURIComponent(city)}&timeframe=${timeframe}`
    );
    if (res.ok) {
      const json = await res.json();
      if (json.success) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn('[WeatherService] Analytics API call failed:', err);
  }
  return null;
}

/**
 * Fetch Weather History from Backend REST API
 */
export async function fetchWeatherHistory(city: string, limit = 20): Promise<any> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/weather/history?city=${encodeURIComponent(city)}&limit=${limit}`
    );
    if (res.ok) {
      const json = await res.json();
      if (json.success) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn('[WeatherService] History API call failed:', err);
  }
  return null;
}

/**
 * Fetch Saved Favorites from Backend DynamoDB
 */
export async function fetchBackendFavorites(userId: string = DEFAULT_USER_ID): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/favorites?userId=${encodeURIComponent(userId)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data?.favorites)) {
        return json.data.favorites.map((f: any) => f.cityId || f.city.toLowerCase());
      }
    }
  } catch (err) {
    console.warn('[WeatherService] Fetch favorites API failed:', err);
  }
  return [];
}

/**
 * Save Favorite to Backend DynamoDB
 */
export async function saveBackendFavorite(
  cityName: string,
  userId: string = DEFAULT_USER_ID
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/favorites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        city: cityName,
        cityId: cityName.toLowerCase().replace(/\s+/g, '-'),
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Remove Favorite from Backend DynamoDB
 */
export async function removeBackendFavorite(
  cityId: string,
  userId: string = DEFAULT_USER_ID
): Promise<boolean> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/favorites/${encodeURIComponent(cityId)}?userId=${encodeURIComponent(userId)}`,
      {
        method: 'DELETE',
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Fetch User Preferences from Backend DynamoDB
 */
export async function fetchBackendPreferences(userId: string = DEFAULT_USER_ID): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/preferences?userId=${encodeURIComponent(userId)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success) {
        return json.data;
      }
    }
  } catch {
    // Fallback
  }
  return null;
}

/**
 * Save User Preferences to Backend DynamoDB
 */
export async function saveBackendPreferences(
  preferences: { temperatureUnit?: string; defaultCity?: string; theme?: string },
  userId: string = DEFAULT_USER_ID
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/preferences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        ...preferences,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
