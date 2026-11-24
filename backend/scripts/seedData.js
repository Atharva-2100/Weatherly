/**
 * Seed Script: Seeds initial weather history and default preferences
 * Run: node scripts/seedData.js
 */

const weatherRepository = require('../src/repositories/weatherRepository');
const preferencesRepository = require('../src/repositories/preferencesRepository');
const favoritesRepository = require('../src/repositories/favoritesRepository');
const weatherService = require('../src/services/weatherService');

async function seed() {
  console.log('====================================================');
  console.log(' Seeding Weatherly Initial Data...');
  console.log('====================================================');

  // 1. Seed User Preferences
  const defaultUser = 'weatherly-default-user';
  console.log(`[Seed] Seeding preferences for ${defaultUser}...`);
  await preferencesRepository.savePreferences(defaultUser, {
    temperatureUnit: 'C',
    defaultCity: 'Pune',
    theme: 'light'
  });

  // 2. Seed Default Favorites (Pune, Mumbai, Bengaluru, Delhi)
  const defaultCities = [
    { city: 'Pune', country: 'India', lat: 18.5204, lon: 73.8567 },
    { city: 'Mumbai', country: 'India', lat: 19.0760, lon: 72.8777 },
    { city: 'Bengaluru', country: 'India', lat: 12.9716, lon: 77.5946 },
    { city: 'Delhi', country: 'India', lat: 28.6139, lon: 77.2090 }
  ];

  for (const item of defaultCities) {
    try {
      console.log(`[Seed] Adding favorite: ${item.city}...`);
      await favoritesRepository.addFavorite(defaultUser, {
        cityId: item.city.toLowerCase(),
        city: item.city,
        country: item.country,
        latitude: item.lat,
        longitude: item.lon
      });
    } catch (e) {
      console.log(`[Seed] Notice: ${e.message}`);
    }
  }

  // 3. Seed historical records for Pune, Mumbai, Delhi
  for (const city of ['Pune', 'Mumbai', 'Delhi']) {
    try {
      console.log(`[Seed] Fetching weather & writing historical snapshot for ${city}...`);
      const weather = await weatherService.getWeather(city);
      await weatherRepository.saveWeatherSnapshot(weather);
    } catch (e) {
      console.warn(`[Seed] Snapshot warning for ${city}:`, e.message);
    }
  }

  console.log('Seeding completed successfully!');
}

if (require.main === module) {
  seed().catch(err => {
    console.error('Seeding error:', err);
    process.exit(1);
  });
}

module.exports = { seed };
