/**
 * User Preferences Repository
 * Interacts with DynamoDB UserPreferences table.
 * Table schema:
 * - Partition Key: userId (String)
 */

const dynamodbService = require('../services/dynamodbService');
const environment = require('../config/environment');

class PreferencesRepository {
  /**
   * Get user preferences or default fallback
   */
  async getPreferences(userId) {
    const effectiveUserId = userId || environment.DEFAULT_USER_ID;
    const item = await dynamodbService.get(environment.TABLES.PREFERENCES, {
      userId: effectiveUserId
    });

    if (!item) {
      return {
        userId: effectiveUserId,
        temperatureUnit: 'C',
        defaultCity: 'Pune',
        theme: 'light',
        isDefault: true
      };
    }

    return item;
  }

  /**
   * Save or update user preferences
   */
  async savePreferences(userId, preferences) {
    const effectiveUserId = userId || environment.DEFAULT_USER_ID;
    const nowIso = new Date().toISOString();

    const existing = await dynamodbService.get(environment.TABLES.PREFERENCES, {
      userId: effectiveUserId
    });

    const item = {
      userId: effectiveUserId,
      temperatureUnit: preferences.temperatureUnit || (existing?.temperatureUnit || 'C'),
      defaultCity: preferences.defaultCity || (existing?.defaultCity || 'Pune'),
      theme: preferences.theme || (existing?.theme || 'light'),
      createdAt: existing?.createdAt || nowIso,
      updatedAt: nowIso
    };

    await dynamodbService.put(environment.TABLES.PREFERENCES, item);
    return item;
  }
}

module.exports = new PreferencesRepository();
