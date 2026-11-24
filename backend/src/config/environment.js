require('dotenv').config();

const environment = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  
  // AWS Configuration
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
  DYNAMODB_ENDPOINT: process.env.DYNAMODB_ENDPOINT || '',

  // DynamoDB Tables
  TABLES: {
    WEATHER_HISTORY: process.env.DYNAMODB_WEATHER_HISTORY_TABLE || 'Weatherly_WeatherHistory',
    FAVORITES: process.env.DYNAMODB_FAVORITES_TABLE || 'Weatherly_FavouriteLocations',
    PREFERENCES: process.env.DYNAMODB_PREFERENCES_TABLE || 'Weatherly_UserPreferences',
    CACHE: process.env.DYNAMODB_CACHE_TABLE || 'Weatherly_WeatherCache'
  },

  // OpenWeatherMap API
  OPENWEATHER: {
    API_KEY: process.env.OPENWEATHER_API_KEY || '',
    BASE_URL: process.env.OPENWEATHER_BASE_URL || 'https://api.openweathermap.org/data/2.5',
    GEO_URL: process.env.OPENWEATHER_GEO_URL || 'https://api.openweathermap.org/geo/1.0'
  },

  // Cache TTLs in seconds
  CACHE_TTL: {
    CURRENT: parseInt(process.env.CACHE_TTL_CURRENT, 10) || 900, // 15 mins
    FORECAST: parseInt(process.env.CACHE_TTL_FORECAST, 10) || 3600, // 1 hour
    ANALYTICS: parseInt(process.env.CACHE_TTL_ANALYTICS, 10) || 1800 // 30 mins
  },

  // Default Monitored Cities for automated collection
  MONITORED_CITIES: ['Pune', 'Mumbai', 'Bengaluru', 'Delhi', 'London', 'Tokyo', 'New York', 'Paris', 'Singapore', 'Sydney'],

  // Default User ID fallback for single-user/anonymous frontend state
  DEFAULT_USER_ID: 'weatherly-default-user'
};

module.exports = environment;
