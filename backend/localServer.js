/**
 * Weatherly Backend Local Server
 * Runs an Express server on port 5000 with CORS and request logging
 * for local development and integration testing.
 */

const express = require('express');
const cors = require('cors');
const environment = require('./src/config/environment');
const routes = require('./src/routes/routes');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-user-id']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Mount API routes at /api
app.use('/api', routes);

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'Weatherly - Cloud-Based Weather Monitoring System Backend',
    version: '1.0.0',
    documentation: '/api/health',
    endpoints: [
      'GET /api/weather/current?city=Pune',
      'GET /api/weather/forecast?city=Pune',
      'GET /api/weather/search?city=Pune',
      'GET /api/weather/history?city=Pune',
      'GET /api/weather/analytics?city=Pune',
      'GET /api/weather/recommendations?city=Pune',
      'GET /api/weather/full?city=Pune',
      'GET /api/favorites',
      'POST /api/favorites',
      'DELETE /api/favorites/:cityId',
      'GET /api/preferences',
      'POST /api/preferences',
      'POST /api/weather/collect'
    ]
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found.`
    }
  });
});

// Start server
const PORT = process.env.PORT || environment.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`  Weatherly Backend API Server`);
  console.log(`  Running on: http://localhost:${PORT}`);
  console.log(`  Health Check: http://localhost:${PORT}/api/health`);
  console.log(`  Environment: ${environment.NODE_ENV}`);
  console.log(`=======================================================`);
});

module.exports = { app, server };
