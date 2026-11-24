/**
 * AWS Lambda Handler: Weather Forecast API
 * GET /api/weather/forecast?city=Pune
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
      return errorResponse('Invalid city parameter provided.', 400, 'INVALID_CITY');
    }

    const cacheKey = `forecast:${normalizeCity(city)}`;

    // Check Cache
    const cachedData = await weatherRepository.getCache(cacheKey);
    if (cachedData) {
      return successResponse(cachedData, 200, { 'X-Cache': 'HIT' });
    }

    const fullWeather = await weatherService.getWeather(city, lat, lon);

    const forecastPayload = {
      city: fullWeather.name,
      country: fullWeather.country,
      coordinates: {
        lat: fullWeather.lat,
        lon: fullWeather.lon
      },
      hourly: fullWeather.hourly,
      daily: fullWeather.daily,
      lastUpdated: fullWeather.lastUpdated
    };

    // Save to Cache (TTL 1 hour)
    await weatherRepository.setCache(cacheKey, forecastPayload, environment.CACHE_TTL.FORECAST);

    return successResponse(forecastPayload, 200, { 'X-Cache': 'MISS' });
  } catch (err) {
    console.error('[ForecastHandler] Error:', err);
    const statusCode = err.statusCode || (err.message.includes('not found') ? 404 : 500);
    return errorResponse(err.message, statusCode, err.code || 'FORECAST_ERROR');
  }
}

module.exports = { handler };
