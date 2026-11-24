/**
 * AWS Lambda Handler: Automated Weather Collector
 * Triggered by Amazon EventBridge (e.g. rate(1 hour)) or on-demand via POST /api/weather/collect
 * Responsibilities:
 * - Iterates across configured monitored cities
 * - Fetches real-time weather information
 * - Saves weather snapshot in DynamoDB WeatherHistory
 * - Refreshes cache with latest conditions
 * - Handles and logs external API failures gracefully
 */

const weatherService = require('../services/weatherService');
const weatherRepository = require('../repositories/weatherRepository');
const environment = require('../config/environment');
const { successResponse, errorResponse } = require('../utils/response');

async function handler(event = {}) {
  console.log('[WeatherCollector] Commencing automated weather collection cycle...');
  const cities = environment.MONITORED_CITIES;
  const results = {
    total: cities.length,
    successful: 0,
    failed: 0,
    snapshots: [],
    errors: []
  };

  for (const city of cities) {
    try {
      console.log(`[WeatherCollector] Collecting weather snapshot for: ${city}`);
      const weatherData = await weatherService.getWeather(city);
      
      // Store snapshot in DynamoDB
      const snapshot = await weatherRepository.saveWeatherSnapshot(weatherData);

      // Pre-warm Cache for both current and full weather
      const currentCacheKey = `current:${city.toLowerCase()}`;
      await weatherRepository.setCache(currentCacheKey, {
        city: weatherData.name,
        country: weatherData.country,
        temperature: weatherData.current.tempC,
        feelsLike: weatherData.current.feelsLikeC,
        condition: weatherData.current.condition,
        humidity: weatherData.current.humidity,
        windSpeed: weatherData.current.windSpeedKmh,
        rainfall: weatherData.current.rainfallMm,
        pressure: weatherData.current.pressureHpa,
        recordedAt: snapshot.recordedAt
      }, environment.CACHE_TTL.CURRENT);

      results.successful++;
      results.snapshots.push({
        city,
        tempC: weatherData.current.tempC,
        condition: weatherData.current.condition,
        recordedAt: snapshot.recordedAt
      });
    } catch (err) {
      console.error(`[WeatherCollector] Error collecting weather for ${city}:`, err.message);
      results.failed++;
      results.errors.push({ city, error: err.message });
    }
  }

  console.log(`[WeatherCollector] Cycle completed. Succeeded: ${results.successful}, Failed: ${results.failed}`);
  return successResponse(results);
}

module.exports = { handler };
