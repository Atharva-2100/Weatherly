const { describe, it } = require('node:test');
const assert = require('node:assert');

const weatherService = require('../src/services/weatherService');
const recommendationService = require('../src/services/recommendationService');
const { currentWeatherHandler, forecastHandler, citySearchHandler } = require('../src/handlers');

describe('Weather Service & Handlers Unit Tests', () => {
  it('should normalize and return real weather data for Pune', async () => {
    const data = await weatherService.getWeather('Pune');
    assert.strictEqual(data.name, 'Pune');
    assert.strictEqual(data.country, 'India');
    assert.ok(typeof data.current.tempC === 'number');
    assert.ok(typeof data.current.humidity === 'number');
    assert.ok(Array.isArray(data.hourly));
    assert.ok(data.hourly.length > 0);
    assert.ok(Array.isArray(data.daily));
    assert.ok(data.daily.length > 0);
  });

  it('should search matching cities by query string', async () => {
    const event = {
      queryStringParameters: { city: 'Pune' }
    };
    const response = await citySearchHandler(event);
    assert.strictEqual(response.statusCode, 200);
    const body = JSON.parse(response.body);
    assert.strictEqual(body.success, true);
    assert.ok(body.data.locations.length > 0);
    assert.strictEqual(body.data.locations[0].name, 'Pune');
  });

  it('should handle invalid city names gracefully with 400 error', async () => {
    const event = {
      queryStringParameters: { city: 'x' }
    };
    const response = await currentWeatherHandler(event);
    assert.strictEqual(response.statusCode, 400);
    const body = JSON.parse(response.body);
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, 'INVALID_CITY');
  });

  it('should generate sensible weather recommendations based on thresholds', () => {
    // High heat scenario
    const hotWeather = {
      temperature: 36,
      feelsLike: 39,
      humidity: 50,
      windSpeed: 10,
      rainfall: 0,
      uvIndex: 8,
      condition: 'Sunny'
    };
    const recs = recommendationService.generateRecommendations(hotWeather, []);
    assert.ok(recs.some(r => r.category === 'Heat'));
    assert.ok(recs.some(r => r.category === 'UV'));

    // Rain scenario
    const rainWeather = {
      temperature: 24,
      feelsLike: 24,
      humidity: 85,
      windSpeed: 15,
      rainfall: 8,
      uvIndex: 3,
      condition: 'Heavy Rain'
    };
    const rainRecs = recommendationService.generateRecommendations(rainWeather, []);
    assert.ok(rainRecs.some(r => r.category === 'Rain'));
  });
});
