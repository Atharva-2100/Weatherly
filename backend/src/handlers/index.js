/**
 * Handlers Index
 * Export all AWS Lambda handlers for serverless deployment
 */

const currentWeather = require('./currentWeather');
const forecast = require('./forecast');
const citySearch = require('./citySearch');
const weatherHistory = require('./weatherHistory');
const weatherAnalytics = require('./weatherAnalytics');
const favorites = require('./favorites');
const recommendations = require('./recommendations');
const preferences = require('./preferences');
const weatherCollector = require('./weatherCollector');
const fullWeather = require('./fullWeather');

module.exports = {
  currentWeatherHandler: currentWeather.handler,
  forecastHandler: forecast.handler,
  citySearchHandler: citySearch.handler,
  weatherHistoryHandler: weatherHistory.handler,
  weatherAnalyticsHandler: weatherAnalytics.handler,
  favoritesHandler: favorites.handler,
  recommendationsHandler: recommendations.handler,
  preferencesHandler: preferences.handler,
  weatherCollectorHandler: weatherCollector.handler,
  fullWeatherHandler: fullWeather.handler
};
