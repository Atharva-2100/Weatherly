/**
 * Express REST API Routes
 * Adapts AWS Lambda handlers into Express router routes
 */

const express = require('express');
const router = express.Router();
const { adaptLambdaToExpress } = require('../utils/response');

const {
  currentWeatherHandler,
  forecastHandler,
  citySearchHandler,
  weatherHistoryHandler,
  weatherAnalyticsHandler,
  favoritesHandler,
  recommendationsHandler,
  preferencesHandler,
  weatherCollectorHandler,
  fullWeatherHandler
} = require('../handlers');

// Health Check
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Weatherly API',
    timestamp: new Date().toISOString()
  });
});

// A. Current Weather API: GET /api/weather/current?city=Pune
router.get('/weather/current', adaptLambdaToExpress(currentWeatherHandler));

// B. Weather Forecast API: GET /api/weather/forecast?city=Pune
router.get('/weather/forecast', adaptLambdaToExpress(forecastHandler));

// C. City Search API: GET /api/weather/search?city=Pune
router.get('/weather/search', adaptLambdaToExpress(citySearchHandler));

// D. Weather History API: GET /api/weather/history?city=Pune
router.get('/weather/history', adaptLambdaToExpress(weatherHistoryHandler));

// E. Weather Analytics API: GET /api/weather/analytics?city=Pune
router.get('/weather/analytics', adaptLambdaToExpress(weatherAnalyticsHandler));

// F. Favourite Locations API: GET, POST, DELETE /api/favorites
router.get('/favorites', adaptLambdaToExpress(favoritesHandler));
router.post('/favorites', adaptLambdaToExpress(favoritesHandler));
router.delete('/favorites/:cityId', adaptLambdaToExpress(favoritesHandler));
router.delete('/favorites', adaptLambdaToExpress(favoritesHandler));

// G. Weather Recommendations API: GET /api/weather/recommendations?city=Pune
router.get('/weather/recommendations', adaptLambdaToExpress(recommendationsHandler));

// H. User Preferences API: GET, POST /api/preferences
router.get('/preferences', adaptLambdaToExpress(preferencesHandler));
router.post('/preferences', adaptLambdaToExpress(preferencesHandler));

// Automated Weather Collector Trigger: POST /api/weather/collect
router.post('/weather/collect', adaptLambdaToExpress(weatherCollectorHandler));

// Full Composite Weather API: GET /api/weather/full?city=Pune
router.get('/weather/full', adaptLambdaToExpress(fullWeatherHandler));

module.exports = router;
