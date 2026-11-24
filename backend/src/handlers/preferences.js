/**
 * AWS Lambda Handler: User Preferences API
 * GET /api/preferences?userId=...
 * POST /api/preferences
 */

const preferencesRepository = require('../repositories/preferencesRepository');
const { successResponse, errorResponse } = require('../utils/response');
const { isValidTemperatureUnit } = require('../utils/validation');

async function handler(event) {
  const method = event.httpMethod || 'GET';
  const queryParams = event.queryStringParameters || {};
  const userId = queryParams.userId || event.headers?.['x-user-id'] || 'weatherly-default-user';

  try {
    if (method === 'GET') {
      const preferences = await preferencesRepository.getPreferences(userId);
      return successResponse(preferences);
    }

    if (method === 'POST') {
      let body = {};
      try {
        body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : (event.body || {});
      } catch {
        return errorResponse('Invalid JSON payload.', 400, 'BAD_REQUEST');
      }

      if (body.temperatureUnit && !isValidTemperatureUnit(body.temperatureUnit)) {
        return errorResponse('Invalid temperature unit. Must be "C" or "F".', 400, 'INVALID_UNIT');
      }

      const updated = await preferencesRepository.savePreferences(body.userId || userId, {
        temperatureUnit: body.temperatureUnit,
        defaultCity: body.defaultCity,
        theme: body.theme
      });

      return successResponse(updated, 200);
    }

    return errorResponse(`Unsupported method ${method}`, 405, 'METHOD_NOT_ALLOWED');
  } catch (err) {
    console.error('[PreferencesHandler] Error:', err);
    return errorResponse(err.message, 500, 'PREFERENCES_ERROR');
  }
}

module.exports = { handler };
