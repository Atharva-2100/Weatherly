/**
 * Weather Repository
 * Interacts with DynamoDB WeatherHistory and WeatherCache tables
 */

const { v4: uuidv4 } = require('uuid');
const dynamodbService = require('../services/dynamodbService');
const environment = require('../config/environment');
const { normalizeCity } = require('../utils/validation');

class WeatherRepository {
  /**
   * Save a historical snapshot of current weather conditions
   */
  async saveWeatherSnapshot(weatherData) {
    const cityKey = normalizeCity(weatherData.name);
    const nowIso = new Date().toISOString();
    const ttlTimestamp = Math.floor(Date.now() / 1000) + (90 * 24 * 3600); // 90 days retention

    const record = {
      recordId: uuidv4(),
      city: cityKey,
      cityName: weatherData.name,
      country: weatherData.country,
      temperature: weatherData.current.tempC,
      feelsLike: weatherData.current.feelsLikeC,
      humidity: weatherData.current.humidity,
      rainfall: weatherData.current.rainfallMm,
      windSpeed: weatherData.current.windSpeedKmh,
      pressure: weatherData.current.pressureHpa,
      weatherCondition: weatherData.current.condition,
      icon: weatherData.current.icon,
      uvIndex: weatherData.current.uvIndex,
      recordedAt: nowIso,
      ttl: ttlTimestamp
    };

    await dynamodbService.put(environment.TABLES.WEATHER_HISTORY, record);
    return record;
  }

  /**
   * Query historical weather records for a city
   * Uses Partition Key `city` and Sort Key `recordedAt`
   */
  async getHistory(city, startDate = null, endDate = null, limit = 50) {
    const cityKey = normalizeCity(city);
    const params = {
      TableName: environment.TABLES.WEATHER_HISTORY,
      KeyConditionExpression: 'city = :city',
      ExpressionAttributeValues: {
        ':city': cityKey
      },
      ScanIndexForward: false, // Descending order (newest first)
      Limit: limit
    };

    if (startDate && endDate) {
      params.KeyConditionExpression += ' AND recordedAt BETWEEN :startDate AND :endDate';
      params.ExpressionAttributeValues[':startDate'] = startDate;
      params.ExpressionAttributeValues[':endDate'] = endDate;
    } else if (startDate) {
      params.KeyConditionExpression += ' AND recordedAt >= :startDate';
      params.ExpressionAttributeValues[':startDate'] = startDate;
    }

    const items = await dynamodbService.query(params);
    return items;
  }

  /**
   * Retrieve cached data if not expired
   */
  async getCache(cacheKey) {
    const item = await dynamodbService.get(environment.TABLES.CACHE, { cacheKey });
    if (!item) return null;

    const nowEpoch = Math.floor(Date.now() / 1000);
    if (item.ttl && item.ttl < nowEpoch) {
      // Expired
      return null;
    }

    try {
      return typeof item.data === 'string' ? JSON.parse(item.data) : item.data;
    } catch {
      return item.data;
    }
  }

  /**
   * Store data in DynamoDB cache with TTL
   */
  async setCache(cacheKey, data, ttlSeconds = 900) {
    const nowEpoch = Math.floor(Date.now() / 1000);
    const item = {
      cacheKey,
      data: JSON.stringify(data),
      cachedAt: new Date().toISOString(),
      ttl: nowEpoch + ttlSeconds
    };

    await dynamodbService.put(environment.TABLES.CACHE, item);
  }
}

module.exports = new WeatherRepository();
