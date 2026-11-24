/**
 * AWS Lambda Handler: Favourite Locations API
 * GET /api/favorites?userId=...
 * POST /api/favorites (body: { userId, city, country, latitude, longitude, cityId })
 * DELETE /api/favorites/{cityId}?userId=...
 */

const favoritesRepository = require('../repositories/favoritesRepository');
const weatherService = require('../services/weatherService');
const { successResponse, errorResponse } = require('../utils/response');
const { isValidCity, normalizeCity } = require('../utils/validation');

async function handler(event) {
  const method = event.httpMethod || 'GET';
  const queryParams = event.queryStringParameters || {};
  const pathParams = event.pathParameters || {};
  const userId = queryParams.userId || event.headers?.['x-user-id'] || 'weatherly-default-user';

  try {
    // 1. GET /api/favorites
    if (method === 'GET') {
      const favorites = await favoritesRepository.getFavorites(userId);

      // Enrich favorites with current live weather metrics
      const enriched = await Promise.all(
        favorites.map(async (fav) => {
          try {
            const weather = await weatherService.getWeather(fav.city || fav.cityId);
            return {
              ...fav,
              current: {
                tempC: weather.current.tempC,
                condition: weather.current.condition,
                icon: weather.current.icon,
                humidity: weather.current.humidity,
                windSpeedKmh: weather.current.windSpeedKmh
              }
            };
          } catch {
            return fav;
          }
        })
      );

      return successResponse({
        userId,
        count: enriched.length,
        favorites: enriched
      });
    }

    // 2. POST /api/favorites
    if (method === 'POST') {
      let body = {};
      try {
        body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : (event.body || {});
      } catch {
        return errorResponse('Invalid JSON body.', 400, 'BAD_REQUEST');
      }

      const cityName = body.city || body.name || body.cityId;
      if (!cityName || !isValidCity(cityName)) {
        return errorResponse('Valid city name is required to add favourite.', 400, 'INVALID_CITY');
      }

      // Resolve city info if coords not provided
      let lat = body.latitude || body.lat;
      let lon = body.longitude || body.lon;
      let country = body.country;

      if (!lat || !lon) {
        try {
          const resolved = await weatherService.geocodeCity(cityName);
          lat = resolved.lat;
          lon = resolved.lon;
          country = resolved.country;
        } catch {
          // Defaults if geocoding fails
          lat = 0;
          lon = 0;
          country = 'Global';
        }
      }

      const newFavorite = await favoritesRepository.addFavorite(body.userId || userId, {
        cityId: body.cityId || normalizeCity(cityName),
        city: cityName,
        country: country || 'Global',
        latitude: lat,
        longitude: lon
      });

      return successResponse(newFavorite, 201);
    }

    // 3. DELETE /api/favorites/{cityId}
    if (method === 'DELETE') {
      const cityId = pathParams.cityId || queryParams.cityId || queryParams.city;
      if (!cityId) {
        return errorResponse('City identifier is required in path or query.', 400, 'MISSING_CITY_ID');
      }

      await favoritesRepository.removeFavorite(userId, cityId);
      return successResponse({ message: `Successfully removed ${cityId} from favourites.` });
    }

    return errorResponse(`Unsupported method ${method}`, 405, 'METHOD_NOT_ALLOWED');
  } catch (err) {
    console.error('[FavoritesHandler] Error:', err);
    const statusCode = err.statusCode || (err.message.includes('already in') ? 409 : 500);
    return errorResponse(err.message, statusCode, err.code || 'FAVORITES_ERROR');
  }
}

module.exports = { handler };
