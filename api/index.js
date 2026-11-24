/**
 * Vercel Serverless Function entry point
 * Mounts the Weatherly Express REST API routes
 */

const express = require('express');
const cors = require('cors');
const routes = require('../backend/src/routes/routes');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-user-id']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount routes at /api
app.use('/api', routes);

// Fallback health check
app.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Weatherly Vercel Serverless API',
    endpoints: '/api/health'
  });
});

module.exports = app;
