const { describe, it } = require('node:test');
const assert = require('node:assert');

const { weatherAnalyticsHandler, preferencesHandler } = require('../src/handlers');

describe('Weather Analytics & Preferences API Unit Tests', () => {
  it('should compute daily trends and meteorological KPI summaries', async () => {
    const event = {
      queryStringParameters: { city: 'Pune', timeframe: 'daily' }
    };
    const response = await weatherAnalyticsHandler(event);
    assert.strictEqual(response.statusCode, 200);
    const body = JSON.parse(response.body);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.timeframe, 'daily');
    assert.ok(body.data.summary);
    assert.ok(typeof body.data.summary.peakTemp === 'number');
    assert.ok(typeof body.data.summary.lowestTemp === 'number');
    assert.ok(typeof body.data.summary.avgHumidity === 'number');
    assert.ok(Array.isArray(body.data.chartData));
  });

  it('should compute weekly trends for 7-day outlook', async () => {
    const event = {
      queryStringParameters: { city: 'Pune', timeframe: 'weekly' }
    };
    const response = await weatherAnalyticsHandler(event);
    assert.strictEqual(response.statusCode, 200);
    const body = JSON.parse(response.body);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.timeframe, 'weekly');
    assert.ok(body.data.chartData.length > 0);
  });

  it('should save and retrieve user temperature and default city preferences', async () => {
    const testUserId = `pref-user-${Date.now()}`;

    // 1. Get default preferences
    const getEvent = {
      httpMethod: 'GET',
      queryStringParameters: { userId: testUserId }
    };
    const getRes = await preferencesHandler(getEvent);
    assert.strictEqual(getRes.statusCode, 200);
    const initial = JSON.parse(getRes.body).data;
    assert.strictEqual(initial.temperatureUnit, 'C');

    // 2. Update to Fahrenheit and Mumbai
    const postEvent = {
      httpMethod: 'POST',
      queryStringParameters: { userId: testUserId },
      body: JSON.stringify({
        userId: testUserId,
        temperatureUnit: 'F',
        defaultCity: 'Mumbai',
        theme: 'dark'
      })
    };
    const postRes = await preferencesHandler(postEvent);
    assert.strictEqual(postRes.statusCode, 200);
    const updated = JSON.parse(postRes.body).data;
    assert.strictEqual(updated.temperatureUnit, 'F');
    assert.strictEqual(updated.defaultCity, 'Mumbai');
    assert.strictEqual(updated.theme, 'dark');
  });
});
