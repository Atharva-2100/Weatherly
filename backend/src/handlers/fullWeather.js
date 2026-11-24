/**
 * AWS Lambda Handler: Full Weather Composite API
 * GET /api/weather/full?city=Pune
 * Returns the complete normalized CityWeatherData matching the React frontend's state structure:
 * - CitySummary attributes (id, name, region, country, lat, lon, timezone, stationCode)
 * - CurrentWeatherMetrics
 * - HourlyForecastItem[]
 * - DailyForecastItem[]
 * - Recommendations
 */

const weatherService = require('../services/weatherService');
const weatherRepository = require('../repositories/weatherRepository');
const recommendationService = require('../services/recommendationService');
const environment = require('../config/environment');
const { successResponse, errorResponse } = require('../utils/response');
const { isValidCity, normalizeCity } = require('../utils/validation');

async function handler(event) {
  try {
    const queryParams = event.queryStringParameters || {};
    const city = queryParams.city || queryParams.cityId || 'Pune';
    const lat = queryParams.lat ? Number(queryParams.lat) : null;
    const lon = queryParams.lon ? Number(queryParams.lon) : null;

    if (!lat && !isValidCity(city)) {
      return errorResponse('Invalid city parameter provided.', 400, 'INVALID_CITY');
    }

    const cacheKey = `full:${normalizeCity(city)}`;

    // Check Cache
    const cachedData = await weatherRepository.getCache(cacheKey);
    if (cachedData) {
      return successResponse(cachedData, 200, { 'X-Cache': 'HIT' });
    }

    // Fetch live weather data
    const weatherData = await weatherService.getWeather(city, lat, lon);

    // Compute tailored recommendations
    const recommendations = recommendationService.generateRecommendations(
      weatherData.current,
      weatherData.hourly
    );

    const payload = {
      ...weatherData,
      recommendations
    };

    // Cache full composite result
    await weatherRepository.setCache(cacheKey, payload, environment.CACHE_TTL.CURRENT);

    // Store historical snapshot in DynamoDB
    weatherRepository.saveWeatherSnapshot(weatherData).catch(err => {
      console.warn('[FullWeatherHandler] Background history snapshot warning:', err.message);
    });

    return successResponse(payload, 200, { 'X-Cache': 'MISS' });
  } catch (err) {
    console.error('[FullWeatherHandler] Error:', err);
    const statusCode = err.statusCode || (err.message.includes('not found') ? 404 : 500);
    return errorResponse(err.message, statusCode, err.code || 'WEATHER_ERROR');
  }
}

module.exports = { handler };
