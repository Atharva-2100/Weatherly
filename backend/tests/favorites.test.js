const { describe, it } = require('node:test');
const assert = require('node:assert');

const { favoritesHandler } = require('../src/handlers');

describe('Favourite Locations API Unit Tests', () => {
  const testUserId = `test-user-${Date.now()}`;

  it('should return empty favorites list for new user', async () => {
    const event = {
      httpMethod: 'GET',
      queryStringParameters: { userId: testUserId }
    };
    const response = await favoritesHandler(event);
    assert.strictEqual(response.statusCode, 200);
    const body = JSON.parse(response.body);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.count, 0);
  });

  it('should add a favorite city and prevent duplicate entry', async () => {
    // Add Pune
    const addEvent = {
      httpMethod: 'POST',
      queryStringParameters: { userId: testUserId },
      body: JSON.stringify({
        userId: testUserId,
        city: 'Pune',
        country: 'India',
        latitude: 18.5204,
        longitude: 73.8567
      })
    };
    const addResponse = await favoritesHandler(addEvent);
    assert.strictEqual(addResponse.statusCode, 201);
    const addBody = JSON.parse(addResponse.body);
    assert.strictEqual(addBody.success, true);
    assert.strictEqual(addBody.data.city, 'Pune');

    // Attempt duplicate add
    const dupResponse = await favoritesHandler(addEvent);
    assert.strictEqual(dupResponse.statusCode, 409);
    const dupBody = JSON.parse(dupResponse.body);
    assert.strictEqual(dupBody.success, false);
    assert.strictEqual(dupBody.error.code, 'CONFLICT');
  });

  it('should retrieve enriched favorite cities with live weather', async () => {
    const event = {
      httpMethod: 'GET',
      queryStringParameters: { userId: testUserId }
    };
    const response = await favoritesHandler(event);
    assert.strictEqual(response.statusCode, 200);
    const body = JSON.parse(response.body);
    assert.strictEqual(body.data.count, 1);
    assert.strictEqual(body.data.favorites[0].city, 'Pune');
    assert.ok(body.data.favorites[0].current);
  });

  it('should remove a favorite city', async () => {
    const deleteEvent = {
      httpMethod: 'DELETE',
      queryStringParameters: { userId: testUserId, cityId: 'pune' },
      pathParameters: { cityId: 'pune' }
    };
    const deleteResponse = await favoritesHandler(deleteEvent);
    assert.strictEqual(deleteResponse.statusCode, 200);

    // Verify deletion
    const verifyEvent = {
      httpMethod: 'GET',
      queryStringParameters: { userId: testUserId }
    };
    const verifyResponse = await favoritesHandler(verifyEvent);
    const body = JSON.parse(verifyResponse.body);
    assert.strictEqual(body.data.count, 0);
  });
});
