/**
 * Favorites Repository
 * Interacts with DynamoDB FavouriteLocations table.
 * Table schema:
 * - Partition Key: userId (String)
 * - Sort Key: cityId (String)
 * Automatic duplicate prevention and O(1) lookups per user.
 */

const { v4: uuidv4 } = require('uuid');
const dynamodbService = require('../services/dynamodbService');
const environment = require('../config/environment');
const { ConflictError, NotFoundError } = require('../utils/errorHandler');
const { normalizeCity } = require('../utils/validation');

class FavoritesRepository {
  /**
   * Get all favorite cities for a user
   */
  async getFavorites(userId) {
    const effectiveUserId = userId || environment.DEFAULT_USER_ID;
    const params = {
      TableName: environment.TABLES.FAVORITES,
      KeyConditionExpression: 'userId = :uid',
      ExpressionAttributeValues: {
        ':uid': effectiveUserId
      }
    };

    const items = await dynamodbService.query(params);
    return items;
  }

  /**
   * Add a city to user favorites
   */
  async addFavorite(userId, favoriteData) {
    const effectiveUserId = userId || environment.DEFAULT_USER_ID;
    const cityId = favoriteData.cityId || normalizeCity(favoriteData.city);

    // Check if duplicate exists
    const existing = await dynamodbService.get(environment.TABLES.FAVORITES, {
      userId: effectiveUserId,
      cityId
    });

    if (existing) {
      throw new ConflictError(`City "${favoriteData.city || cityId}" is already in favourites.`);
    }

    const item = {
      favoriteId: uuidv4(),
      userId: effectiveUserId,
      cityId,
      city: favoriteData.city,
      country: favoriteData.country || 'Global',
      latitude: Number(favoriteData.latitude) || 0,
      longitude: Number(favoriteData.longitude) || 0,
      createdAt: new Date().toISOString()
    };

    await dynamodbService.put(environment.TABLES.FAVORITES, item);
    return item;
  }

  /**
   * Remove a favorite city for a user
   */
  async removeFavorite(userId, cityId) {
    const effectiveUserId = userId || environment.DEFAULT_USER_ID;
    const normalizedCityId = normalizeCity(cityId);

    const key = {
      userId: effectiveUserId,
      cityId: normalizedCityId
    };

    const existing = await dynamodbService.get(environment.TABLES.FAVORITES, key);
    if (!existing) {
      throw new NotFoundError(`Favorite city "${cityId}" not found for this user.`);
    }

    await dynamodbService.delete(environment.TABLES.FAVORITES, key);
    return true;
  }
}

module.exports = new FavoritesRepository();
