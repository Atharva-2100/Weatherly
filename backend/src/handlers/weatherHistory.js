/**
 * AWS Lambda Handler: Weather History API
 * GET /api/weather/history?city=Pune&startDate=...&endDate=...&limit=20
 */

const weatherRepository = require('../repositories/weatherRepository');
const weatherService = require('../services/weatherService');
const { successResponse, errorResponse } = require('../utils/response');
const { isValidCity, parsePaginationLimit } = require('../utils/validation');

async function handler(event) {
  try {
    const queryParams = event.queryStringParameters || {};
    const city = queryParams.city || 'Pune';
    const startDate = queryParams.startDate || null;
    const endDate = queryParams.endDate || null;
    const limit = parsePaginationLimit(queryParams.limit, 30, 100);

    if (!isValidCity(city)) {
      return errorResponse('Invalid city parameter.', 400, 'INVALID_CITY');
    }

    let records = await weatherRepository.getHistory(city, startDate, endDate, limit);

    // If history is currently empty (e.g. freshly started system), take a live snapshot now
    if (!records || records.length === 0) {
      try {
        const live = await weatherService.getWeather(city);
        const snapshot = await weatherRepository.saveWeatherSnapshot(live);
        records = [snapshot];
      } catch (e) {
        console.warn('[WeatherHistoryHandler] Unable to auto-seed initial snapshot:', e.message);
        records = [];
      }
    }

    return successResponse({
      city,
      count: records.length,
      records
    });
  } catch (err) {
    console.error('[WeatherHistoryHandler] Error:', err);
    return errorResponse(err.message, 500, 'HISTORY_ERROR');
  }
}

module.exports = { handler };
