/**
 * AWS Lambda Handler: City Search API
 * GET /api/weather/search?city=Pune
 */

const weatherService = require('../services/weatherService');
const { successResponse, errorResponse } = require('../utils/response');
const { sanitizeString } = require('../utils/validation');

async function handler(event) {
  try {
    const queryParams = event.queryStringParameters || {};
    const query = sanitizeString(queryParams.city || queryParams.q || '');

    const results = await weatherService.searchCities(query);

    return successResponse({
      query,
      count: results.length,
      locations: results
    });
  } catch (err) {
    console.error('[CitySearchHandler] Error:', err);
    return errorResponse(err.message, 500, 'SEARCH_ERROR');
  }
}

module.exports = { handler };
