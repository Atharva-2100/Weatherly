/**
 * AWS Lambda Handler: Weather Recommendations API
 * GET /api/weather/recommendations?city=Pune
 */

const weatherService = require('../services/weatherService');
const recommendationService = require('../services/recommendationService');
const { successResponse, errorResponse } = require('../utils/response');
const { isValidCity } = require('../utils/validation');

async function handler(event) {
  try {
    const queryParams = event.queryStringParameters || {};
    const city = queryParams.city || 'Pune';

    if (!isValidCity(city)) {
      return errorResponse('Invalid city parameter.', 400, 'INVALID_CITY');
    }

    const weatherData = await weatherService.getWeather(city);
    const recommendations = recommendationService.generateRecommendations(
      weatherData.current,
      weatherData.hourly
    );

    return successResponse({
      city: weatherData.name,
      country: weatherData.country,
      recommendations
    });
  } catch (err) {
    console.error('[RecommendationsHandler] Error:', err);
    return errorResponse(err.message, 500, 'RECOMMENDATION_ERROR');
  }
}

module.exports = { handler };
