/**
 * AWS Lambda Handler: Current Weather API
 * GET /api/weather/current?city=Pune
 */

const weatherService = require('../services/weatherService');
const weatherRepository = require('../repositories/weatherRepository');
const environment = require('../config/environment');
const { successResponse, errorResponse } = require('../utils/response');
const { isValidCity, normalizeCity } = require('../utils/validation');

async function handler(event) {
  try {
    const queryParams = event.queryStringParameters || {};
    const city = queryParams.city || 'Pune';
    const lat = queryParams.lat ? Number(queryParams.lat) : null;
    const lon = queryParams.lon ? Number(queryParams.lon) : null;

    if (!lat && !isValidCity(city)) {
      return errorResponse('Invalid city parameter provided. City name must be between 2 and 100 characters.', 400, 'INVALID_CITY');
    }

    const cacheKey = `current:${normalizeCity(city)}`;
    
    // Check Cache first
    const cachedData = await weatherRepository.getCache(cacheKey);
    if (cachedData) {
      return successResponse(cachedData, 200, { 'X-Cache': 'HIT' });
    }

    // Fetch from weather service
    const fullWeather = await weatherService.getWeather(city, lat, lon);
    const cur = fullWeather.current;

    const normalizedCurrent = {
      city: fullWeather.name,
      country: fullWeather.country,
      coordinates: {
        lat: fullWeather.lat,
        lon: fullWeather.lon
      },
      temperature: cur.tempC,
      feelsLike: cur.feelsLikeC,
      minTemp: cur.minTempC,
      maxTemp: cur.maxTempC,
      condition: cur.condition,
      description: cur.description,
      icon: cur.icon,
      humidity: cur.humidity,
      dewPoint: cur.dewPointC,
      windSpeed: cur.windSpeedKmh,
      windGust: cur.windGustKmh,
      windDirection: cur.windDirection,
      rainfall: cur.rainfallMm,
      rainProbability: cur.rainProbability,
      pressure: cur.pressureHpa,
      visibility: cur.visibilityKm,
      uvIndex: cur.uvIndex,
      sunrise: cur.sunrise,
      sunset: cur.sunset,
      daylightProgress: cur.daylightProgress,
      recordedAt: fullWeather.lastUpdated
    };

    // Save to Cache (TTL 15m)
    await weatherRepository.setCache(cacheKey, normalizedCurrent, environment.CACHE_TTL.CURRENT);

    // Save historical snapshot in background
    weatherRepository.saveWeatherSnapshot(fullWeather).catch(err => {
      console.warn('[CurrentWeatherHandler] History snapshot write warning:', err.message);
    });

    return successResponse(normalizedCurrent, 200, { 'X-Cache': 'MISS' });
  } catch (err) {
    console.error('[CurrentWeatherHandler] Error:', err);
    const statusCode = err.statusCode || (err.message.includes('not found') ? 404 : 500);
    const errorCode = err.code || (statusCode === 404 ? 'CITY_NOT_FOUND' : 'WEATHER_SERVICE_ERROR');
    return errorResponse(err.message, statusCode, errorCode);
  }
}

module.exports = { handler };
