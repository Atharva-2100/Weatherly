/**
 * Weather Service Layer
 * Coordinates fetching live weather data:
 * 1. Primary provider: OpenWeatherMap (if OPENWEATHER_API_KEY is configured)
 * 2. High-precision fallback: Open-Meteo (Real meteorological data across the globe, zero key required)
 * 3. Normalizes all responses into the exact JSON schema required by the React frontend & REST spec.
 */

const environment = require('../config/environment');
const { ExternalApiError, NotFoundError } = require('../utils/errorHandler');

// Map weather condition text / codes to frontend WeatherConditionType
function mapWeatherConditionToIcon(conditionText, isNight = false) {
  const text = (conditionText || '').toLowerCase();
  
  if (text.includes('thunder') || text.includes('lightning')) return 'thunderstorm';
  if (text.includes('heavy rain') || text.includes('downpour') || text.includes('torrential')) return 'heavy-rain';
  if (text.includes('rain') || text.includes('drizzle') || text.includes('shower')) return 'rainy';
  if (text.includes('mist') || text.includes('fog') || text.includes('haze') || text.includes('smoke')) return 'mist';
  if (text.includes('wind') || text.includes('breez') || text.includes('gale')) return 'breezy';
  if (text.includes('overcast') || text.includes('cloudy')) return 'cloudy';
  if (text.includes('partly') || text.includes('few clouds') || text.includes('scattered clouds')) return 'partly-cloudy';
  if (text.includes('clear') || text.includes('sun')) {
    return isNight ? 'clear-night' : 'sunny';
  }

  return isNight ? 'clear-night' : 'partly-cloudy';
}

function calculateDewPoint(tempC, humidity) {
  const a = 17.27;
  const b = 237.7;
  const alpha = ((a * tempC) / (b + tempC)) + Math.log(humidity / 100.0);
  return Math.round((b * alpha) / (a - alpha));
}

function degreesToDirection(deg) {
  if (deg === undefined || deg === null) return 'NNE';
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(deg / 22.5) % 16;
  return dirs[index];
}

function formatTime(dateObj, timezone = 'UTC') {
  try {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: timezone
    }).format(dateObj);
  } catch {
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}

// Known cities coordinates map for instantaneous Geocoding resolution
const KNOWN_CITIES = {
  'pune': { name: 'Pune', region: 'Maharashtra', country: 'India', countryCode: 'IN', lat: 18.5204, lon: 73.8567, timezone: 'Asia/Kolkata', stationCode: 'VAPO' },
  'mumbai': { name: 'Mumbai', region: 'Maharashtra', country: 'India', countryCode: 'IN', lat: 19.0760, lon: 72.8777, timezone: 'Asia/Kolkata', stationCode: 'VABB' },
  'bengaluru': { name: 'Bengaluru', region: 'Karnataka', country: 'India', countryCode: 'IN', lat: 12.9716, lon: 77.5946, timezone: 'Asia/Kolkata', stationCode: 'VOBL' },
  'delhi': { name: 'Delhi', region: 'National Capital Region', country: 'India', countryCode: 'IN', lat: 28.6139, lon: 77.2090, timezone: 'Asia/Kolkata', stationCode: 'VIDP' },
  'london': { name: 'London', region: 'Greater London', country: 'United Kingdom', countryCode: 'GB', lat: 51.5074, lon: -0.1278, timezone: 'Europe/London', stationCode: 'EGLL' },
  'tokyo': { name: 'Tokyo', region: 'Kanto', country: 'Japan', countryCode: 'JP', lat: 35.6762, lon: 139.6503, timezone: 'Asia/Tokyo', stationCode: 'RJTT' },
  'new york': { name: 'New York', region: 'New York', country: 'United States', countryCode: 'US', lat: 40.7128, lon: -74.0060, timezone: 'America/New_York', stationCode: 'KJFK' },
  'paris': { name: 'Paris', region: 'Île-de-France', country: 'France', countryCode: 'FR', lat: 48.8566, lon: 2.3522, timezone: 'Europe/Paris', stationCode: 'LFPG' },
  'singapore': { name: 'Singapore', region: 'Central Region', country: 'Singapore', countryCode: 'SG', lat: 1.3521, lon: 103.8198, timezone: 'Asia/Singapore', stationCode: 'WSSS' },
  'sydney': { name: 'Sydney', region: 'New South Wales', country: 'Australia', countryCode: 'AU', lat: -33.8688, lon: 151.2093, timezone: 'Australia/Sydney', stationCode: 'YSSY' }
};

class WeatherService {
  /**
   * Geocode a city name into coordinates
   */
  async geocodeCity(cityName) {
    const norm = cityName.trim().toLowerCase();
    if (KNOWN_CITIES[norm]) {
      return KNOWN_CITIES[norm];
    }

    // Try OpenWeatherMap Geocoding if API key is set
    if (environment.OPENWEATHER.API_KEY) {
      try {
        const geoUrl = `${environment.OPENWEATHER.GEO_URL}/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${environment.OPENWEATHER.API_KEY}`;
        const res = await fetch(geoUrl);
        if (res.ok) {
          const list = await res.json();
          if (list && list.length > 0) {
            const item = list[0];
            return {
              name: item.name,
              region: item.state || item.name,
              country: item.country,
              countryCode: item.country,
              lat: item.lat,
              lon: item.lon,
              timezone: 'UTC',
              stationCode: `${item.name.substring(0, 2).toUpperCase()}${item.country}`
            };
          }
        }
      } catch (err) {
        console.warn('[WeatherService] OpenWeatherMap geocoding failed, trying Open-Meteo geocoder:', err.message);
      }
    }

    // High-reliability fallback geocoding via Open-Meteo Geocoding API
    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
      const res = await fetch(geoUrl);
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const item = data.results[0];
          return {
            name: item.name,
            region: item.admin1 || item.country,
            country: item.country,
            countryCode: item.country_code ? item.country_code.toUpperCase() : 'IN',
            lat: item.latitude,
            lon: item.longitude,
            timezone: item.timezone || 'UTC',
            stationCode: `${item.name.substring(0, 2).toUpperCase()}${item.country_code ? item.country_code.toUpperCase() : 'ST'}`
          };
        }
      }
    } catch (err) {
      console.error('[WeatherService] Geocoding network error:', err);
    }

    throw new NotFoundError(`Location "${cityName}" could not be found.`);
  }

  /**
   * Search matching cities
   */
  async searchCities(query) {
    const q = (query || '').trim().toLowerCase();
    const results = [];

    // Check known cities first
    for (const [key, city] of Object.entries(KNOWN_CITIES)) {
      if (
        key.includes(q) ||
        city.name.toLowerCase().includes(q) ||
        city.country.toLowerCase().includes(q) ||
        city.region.toLowerCase().includes(q)
      ) {
        results.push({
          id: key,
          name: city.name,
          region: city.region,
          country: city.country,
          lat: city.lat,
          lon: city.lon,
          timezone: city.timezone,
          stationCode: city.stationCode
        });
      }
    }

    // If query is substantial and OpenWeatherMap has API key
    if (results.length < 5 && environment.OPENWEATHER.API_KEY && q.length >= 2) {
      try {
        const geoUrl = `${environment.OPENWEATHER.GEO_URL}/direct?q=${encodeURIComponent(query)}&limit=5&appid=${environment.OPENWEATHER.API_KEY}`;
        const res = await fetch(geoUrl);
        if (res.ok) {
          const list = await res.json();
          for (const item of list) {
            const id = `${item.name.toLowerCase().replace(/\s+/g, '-')}-${item.country.toLowerCase()}`;
            if (!results.some(r => r.name.toLowerCase() === item.name.toLowerCase())) {
              results.push({
                id,
                name: item.name,
                region: item.state || item.name,
                country: item.country,
                lat: item.lat,
                lon: item.lon,
                timezone: 'UTC',
                stationCode: `${item.name.substring(0, 2).toUpperCase()}${item.country}`
              });
            }
          }
        }
      } catch (err) {
        console.warn('[WeatherService] Search geocoding warning:', err.message);
      }
    }

    // Also query Open-Meteo geocoding to support any global city search
    if (results.length === 0 && q.length >= 2) {
      try {
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`;
        const res = await fetch(geoUrl);
        if (res.ok) {
          const data = await res.json();
          if (data.results) {
            for (const item of data.results) {
              const id = `${item.name.toLowerCase().replace(/\s+/g, '-')}-${(item.country_code || 'loc').toLowerCase()}`;
              results.push({
                id,
                name: item.name,
                region: item.admin1 || item.country,
                country: item.country,
                lat: item.latitude,
                lon: item.longitude,
                timezone: item.timezone || 'UTC',
                stationCode: `${item.name.substring(0, 2).toUpperCase()}${item.country_code ? item.country_code.toUpperCase() : 'ST'}`
              });
            }
          }
        }
      } catch (err) {
        console.warn('[WeatherService] Open-Meteo search warning:', err.message);
      }
    }

    return results;
  }

  /**
   * Fetch Live Weather Data from OpenWeatherMap
   */
  async fetchFromOpenWeatherMap(location) {
    const { lat, lon, name, country } = location;
    const apiKey = environment.OPENWEATHER.API_KEY;

    // Current weather
    const currentUrl = `${environment.OPENWEATHER.BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    const forecastUrl = `${environment.OPENWEATHER.BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

    const [currentRes, forecastRes] = await Promise.all([
      fetch(currentUrl),
      fetch(forecastUrl)
    ]);

    if (!currentRes.ok) {
      throw new Error(`OpenWeatherMap error: ${currentRes.status} ${currentRes.statusText}`);
    }

    const currentData = await currentRes.json();
    const forecastData = forecastRes.ok ? await forecastRes.json() : null;

    return this.normalizeOpenWeatherData(location, currentData, forecastData);
  }

  /**
   * Normalizes OpenWeatherMap payloads
   */
  normalizeOpenWeatherData(location, current, forecast) {
    const now = new Date();
    const isNight = current.weather[0]?.icon?.includes('n');
    const mainCondition = current.weather[0]?.main || 'Clear';
    const conditionDesc = current.weather[0]?.description ? 
      current.weather[0].description.charAt(0).toUpperCase() + current.weather[0].description.slice(1) : 
      mainCondition;
    
    const icon = mapWeatherConditionToIcon(current.weather[0]?.description || mainCondition, isNight);
    const tempC = Math.round(current.main.temp);
    const feelsLikeC = Math.round(current.main.feels_like);
    const minTempC = Math.round(current.main.temp_min);
    const maxTempC = Math.round(current.main.temp_max);
    const humidity = current.main.humidity;
    const pressureHpa = current.main.pressure;
    const windSpeedKmh = Math.round((current.wind?.speed || 0) * 3.6);
    const windGustKmh = Math.round((current.wind?.gust || current.wind?.speed || 0) * 3.6);
    const windDirection = degreesToDirection(current.wind?.deg);
    const rainfallMm = Number((current.rain?.['1h'] || current.rain?.['3h'] || 0).toFixed(1));
    const visibilityKm = Math.round((current.visibility || 10000) / 1000);
    const dewPointC = calculateDewPoint(tempC, humidity);

    // Sunrise / Sunset format
    const sunrise = current.sys?.sunrise ? formatTime(new Date(current.sys.sunrise * 1000), location.timezone) : '06:30 AM';
    const sunset = current.sys?.sunset ? formatTime(new Date(current.sys.sunset * 1000), location.timezone) : '06:15 PM';

    // Daylight progress %
    let daylightProgress = 50;
    if (current.sys?.sunrise && current.sys?.sunset) {
      const nowSec = Math.floor(now.getTime() / 1000);
      if (nowSec <= current.sys.sunrise) daylightProgress = 0;
      else if (nowSec >= current.sys.sunset) daylightProgress = 100;
      else daylightProgress = Math.round(((nowSec - current.sys.sunrise) / (current.sys.sunset - current.sys.sunrise)) * 100);
    }

    // Hourly Forecast normalization (from 3-hour list)
    const hourly = [];
    if (forecast && forecast.list) {
      forecast.list.slice(0, 12).forEach((item, index) => {
        const itemDate = new Date(item.dt * 1000);
        const hourStr = index === 0 ? 'Now' : itemDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        const hCondition = item.weather[0]?.main || 'Clear';
        const hIsNight = item.weather[0]?.icon?.includes('n');
        const hRainProb = Math.round((item.pop || 0) * 100);
        const hRainfall = Number((item.rain?.['3h'] ? item.rain['3h'] / 3 : 0).toFixed(1));

        hourly.push({
          hourLabel: hourStr,
          fullTime: itemDate.toISOString(),
          tempC: Math.round(item.main.temp),
          feelsLikeC: Math.round(item.main.feels_like),
          condition: hCondition,
          icon: mapWeatherConditionToIcon(item.weather[0]?.description || hCondition, hIsNight),
          rainProbability: hRainProb,
          rainfallMm: hRainfall,
          humidity: item.main.humidity,
          windSpeedKmh: Math.round((item.wind?.speed || 0) * 3.6)
        });
      });
    }

    // Daily Forecast aggregation (5-day grouping)
    const daily = [];
    if (forecast && forecast.list) {
      const daysMap = {};
      forecast.list.forEach(item => {
        const dateKey = new Date(item.dt * 1000).toDateString();
        if (!daysMap[dateKey]) daysMap[dateKey] = [];
        daysMap[dateKey].push(item);
      });

      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      let dIdx = 0;
      for (const [dateKey, items] of Object.entries(daysMap)) {
        if (dIdx >= 7) break;
        const dDate = new Date(items[0].dt * 1000);
        const dayName = dIdx === 0 ? 'Today' : dayNames[dDate.getDay()];
        const dateLabel = dDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const temps = items.map(i => i.main.temp);
        const maxTemp = Math.round(Math.max(...temps));
        const minTemp = Math.round(Math.min(...temps));
        const representative = items[Math.floor(items.length / 2)] || items[0];
        const dCond = representative.weather[0]?.main || 'Clear';
        const maxRainProb = Math.round(Math.max(...items.map(i => i.pop || 0)) * 100);
        const totalRain = Number(items.reduce((acc, i) => acc + (i.rain?.['3h'] || 0), 0).toFixed(1));
        const avgHumidity = Math.round(items.reduce((acc, i) => acc + i.main.humidity, 0) / items.length);
        const maxWind = Math.round(Math.max(...items.map(i => (i.wind?.speed || 0) * 3.6)));

        daily.push({
          dayName,
          dateLabel,
          condition: dCond,
          icon: mapWeatherConditionToIcon(representative.weather[0]?.description || dCond, false),
          maxTempC: maxTemp,
          minTempC: minTemp,
          rainProbability: maxRainProb,
          rainfallMm: totalRain,
          humidity: avgHumidity,
          windSpeedKmh: maxWind,
          uvIndex: 5,
          sunrise,
          sunset
        });
        dIdx++;
      }
    }

    return {
      id: location.name.toLowerCase().replace(/\s+/g, '-'),
      name: location.name,
      region: location.region,
      country: location.country,
      lat: location.lat,
      lon: location.lon,
      timezone: location.timezone,
      utcOffsetHours: current.timezone ? current.timezone / 3600 : 5.5,
      stationCode: location.stationCode,
      elevationM: 560,
      current: {
        tempC,
        feelsLikeC,
        minTempC,
        maxTempC,
        condition: mainCondition,
        description: conditionDesc,
        icon,
        humidity,
        dewPointC,
        windSpeedKmh,
        windGustKmh,
        windDirection,
        rainfallMm,
        rainProbability: hourly[0]?.rainProbability || 0,
        pressureHpa,
        pressureTrend: 'Steady',
        visibilityKm,
        uvIndex: 5,
        sunrise,
        sunset,
        daylightProgress
      },
      hourly,
      daily,
      lastUpdated: now.toISOString()
    };
  }

  /**
   * High-Precision Live Fallback using Open-Meteo
   * Free, zero-key required, returns live hourly and 7-day forecast data.
   */
  async fetchFromOpenMeteo(location) {
    const { lat, lon, name } = location;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,is_day&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new ExternalApiError(`Open-Meteo forecast failed with status ${res.status}`);
    }

    const data = await res.json();
    return this.normalizeOpenMeteoData(location, data);
  }

  /**
   * Normalizes Open-Meteo meteorological data
   */
  normalizeOpenMeteoData(location, data) {
    const now = new Date();
    const cur = data.current || {};
    const daily = data.daily || {};
    const hourly = data.hourly || {};

    const isDay = cur.is_day !== 0;
    const weatherCode = cur.weather_code || 0;
    const { condition, icon } = this.interpretWmoCode(weatherCode, !isDay);

    const tempC = Math.round(cur.temperature_2m ?? 26);
    const feelsLikeC = Math.round(cur.apparent_temperature ?? tempC);
    const humidity = Math.round(cur.relative_humidity_2m ?? 50);
    const rainfallMm = Number((cur.precipitation || cur.rain || 0).toFixed(1));
    const pressureHpa = Math.round(cur.surface_pressure ?? 1012);
    const windSpeedKmh = Math.round(cur.wind_speed_10m ?? 12);
    const windGustKmh = Math.round(cur.wind_gusts_10m ?? windSpeedKmh * 1.3);
    const windDirection = degreesToDirection(cur.wind_direction_10m);
    const dewPointC = calculateDewPoint(tempC, humidity);

    // Sunrise / Sunset
    let sunrise = '06:30 AM';
    let sunset = '06:15 PM';
    if (daily.sunrise && daily.sunrise[0]) {
      sunrise = formatTime(new Date(daily.sunrise[0]), data.timezone || location.timezone);
    }
    if (daily.sunset && daily.sunset[0]) {
      sunset = formatTime(new Date(daily.sunset[0]), data.timezone || location.timezone);
    }

    const minTempC = daily.temperature_2m_min ? Math.round(daily.temperature_2m_min[0]) : tempC - 4;
    const maxTempC = daily.temperature_2m_max ? Math.round(daily.temperature_2m_max[0]) : tempC + 4;
    const uvIndex = daily.uv_index_max ? Math.round(daily.uv_index_max[0]) : 5;

    // Daylight progress
    let daylightProgress = 50;
    if (daily.sunrise && daily.sunset && daily.sunrise[0] && daily.sunset[0]) {
      const riseMs = new Date(daily.sunrise[0]).getTime();
      const setMs = new Date(daily.sunset[0]).getTime();
      const nowMs = now.getTime();
      if (nowMs <= riseMs) daylightProgress = 0;
      else if (nowMs >= setMs) daylightProgress = 100;
      else daylightProgress = Math.round(((nowMs - riseMs) / (setMs - riseMs)) * 100);
    }

    // Build 24 Hourly items
    const hourlyItems = [];
    if (hourly.time) {
      const curHourIsoPrefix = now.toISOString().substring(0, 13);
      let startIdx = hourly.time.findIndex(t => t.startsWith(curHourIsoPrefix));
      if (startIdx < 0) startIdx = 0;

      for (let i = 0; i < 24 && (startIdx + i) < hourly.time.length; i++) {
        const idx = startIdx + i;
        const timeStr = hourly.time[idx];
        const hDate = new Date(timeStr);
        const hour = hDate.getHours();
        const isNightHour = hour < 6 || hour >= 19;
        const hWmo = hourly.weather_code ? hourly.weather_code[idx] : 0;
        const hInfo = this.interpretWmoCode(hWmo, isNightHour);
        const hTemp = Math.round(hourly.temperature_2m[idx]);
        const hFeels = Math.round(hourly.apparent_temperature ? hourly.apparent_temperature[idx] : hTemp);

        hourlyItems.push({
          hourLabel: i === 0 ? 'Now' : `${String(hour).padStart(2, '0')}:00`,
          fullTime: timeStr,
          tempC: hTemp,
          feelsLikeC: hFeels,
          condition: hInfo.condition,
          icon: hInfo.icon,
          rainProbability: hourly.precipitation_probability ? hourly.precipitation_probability[idx] : 0,
          rainfallMm: Number((hourly.precipitation ? hourly.precipitation[idx] : 0).toFixed(1)),
          humidity: Math.round(hourly.relative_humidity_2m ? hourly.relative_humidity_2m[idx] : 50),
          windSpeedKmh: Math.round(hourly.wind_speed_10m ? hourly.wind_speed_10m[idx] : 10)
        });
      }
    }

    // Build 7 Daily items
    const dailyItems = [];
    if (daily.time) {
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (let i = 0; i < Math.min(7, daily.time.length); i++) {
        const dDate = new Date(daily.time[i]);
        const dayName = i === 0 ? 'Today' : dayNames[dDate.getDay()];
        const dateLabel = dDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const dWmo = daily.weather_code ? daily.weather_code[i] : 0;
        const dInfo = this.interpretWmoCode(dWmo, false);

        dailyItems.push({
          dayName,
          dateLabel,
          condition: dInfo.condition,
          icon: dInfo.icon,
          maxTempC: Math.round(daily.temperature_2m_max[i]),
          minTempC: Math.round(daily.temperature_2m_min[i]),
          rainProbability: daily.precipitation_probability_max ? daily.precipitation_probability_max[i] : 0,
          rainfallMm: Number((daily.precipitation_sum ? daily.precipitation_sum[i] : 0).toFixed(1)),
          humidity,
          windSpeedKmh: Math.round(daily.wind_speed_10m_max ? daily.wind_speed_10m_max[i] : 14),
          uvIndex: daily.uv_index_max ? Math.round(daily.uv_index_max[i]) : 5,
          sunrise: daily.sunrise && daily.sunrise[i] ? formatTime(new Date(daily.sunrise[i]), data.timezone || location.timezone) : sunrise,
          sunset: daily.sunset && daily.sunset[i] ? formatTime(new Date(daily.sunset[i]), data.timezone || location.timezone) : sunset
        });
      }
    }

    return {
      id: location.name.toLowerCase().replace(/\s+/g, '-'),
      name: location.name,
      region: location.region,
      country: location.country,
      lat: location.lat,
      lon: location.lon,
      timezone: data.timezone || location.timezone,
      utcOffsetHours: data.utc_offset_seconds ? data.utc_offset_seconds / 3600 : 5.5,
      stationCode: location.stationCode,
      elevationM: Math.round(data.elevation || 560),
      current: {
        tempC,
        feelsLikeC,
        minTempC,
        maxTempC,
        condition,
        description: condition,
        icon,
        humidity,
        dewPointC,
        windSpeedKmh,
        windGustKmh,
        windDirection,
        rainfallMm,
        rainProbability: hourlyItems[0]?.rainProbability || (dailyItems[0]?.rainProbability ?? 10),
        pressureHpa,
        pressureTrend: 'Steady',
        visibilityKm: 10,
        uvIndex,
        sunrise,
        sunset,
        daylightProgress
      },
      hourly: hourlyItems,
      daily: dailyItems,
      lastUpdated: now.toISOString()
    };
  }

  interpretWmoCode(code, isNight = false) {
    switch (code) {
      case 0:
        return { condition: isNight ? 'Clear Night' : 'Sunny', icon: isNight ? 'clear-night' : 'sunny' };
      case 1:
      case 2:
        return { condition: 'Partly Cloudy', icon: 'partly-cloudy' };
      case 3:
        return { condition: 'Overcast', icon: 'cloudy' };
      case 45:
      case 48:
        return { condition: 'Fog & Mist', icon: 'mist' };
      case 51:
      case 53:
      case 55:
        return { condition: 'Light Drizzle', icon: 'rainy' };
      case 61:
      case 63:
      case 65:
        return { condition: 'Rain', icon: 'rainy' };
      case 66:
      case 67:
      case 80:
      case 81:
      case 82:
        return { condition: 'Heavy Rain', icon: 'heavy-rain' };
      case 95:
      case 96:
      case 99:
        return { condition: 'Thunderstorm', icon: 'thunderstorm' };
      default:
        return { condition: isNight ? 'Clear Night' : 'Partly Cloudy', icon: isNight ? 'clear-night' : 'partly-cloudy' };
    }
  }

  /**
   * Unified Get Weather for a City Name or Coordinates
   */
  async getWeather(cityOrQuery, lat = null, lon = null) {
    let location = null;

    if (lat !== null && lon !== null) {
      location = {
        name: cityOrQuery || 'Custom Location',
        region: 'Local Region',
        country: 'Global',
        lat: Number(lat),
        lon: Number(lon),
        timezone: 'UTC',
        stationCode: 'LOC1'
      };
    } else {
      location = await this.geocodeCity(cityOrQuery);
    }

    // Try OpenWeatherMap first if key exists
    if (environment.OPENWEATHER.API_KEY) {
      try {
        return await this.fetchFromOpenWeatherMap(location);
      } catch (err) {
        console.warn('[WeatherService] OpenWeatherMap request failed, falling back to Open-Meteo:', err.message);
      }
    }

    // Fallback to Open-Meteo (Real Meteorological Live API)
    return await this.fetchFromOpenMeteo(location);
  }
}

module.exports = new WeatherService();
