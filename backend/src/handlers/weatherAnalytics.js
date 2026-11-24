/**
 * AWS Lambda Handler: Weather Analytics API
 * GET /api/weather/analytics?city=Pune&timeframe=daily|weekly
 */

const weatherService = require('../services/weatherService');
const weatherRepository = require('../repositories/weatherRepository');
const { successResponse, errorResponse } = require('../utils/response');
const { isValidCity, normalizeCity } = require('../utils/validation');

async function handler(event) {
  try {
    const queryParams = event.queryStringParameters || {};
    const city = queryParams.city || 'Pune';
    const timeframe = (queryParams.timeframe || 'daily').toLowerCase() === 'weekly' ? 'weekly' : 'daily';

    if (!isValidCity(city)) {
      return errorResponse('Invalid city parameter.', 400, 'INVALID_CITY');
    }

    // Fetch full weather data (cached)
    const weatherData = await weatherService.getWeather(city);
    
    // Also retrieve recent recorded history from DynamoDB if present
    const historyRecords = await weatherRepository.getHistory(city, null, null, 14);

    let chartData = [];
    if (timeframe === 'daily') {
      // 24-hour hourly trend
      chartData = weatherData.hourly.map(h => ({
        label: h.hourLabel,
        fullTime: h.fullTime,
        temp: h.tempC,
        secondaryTemp: h.feelsLikeC,
        humidity: h.humidity,
        rainfall: h.rainfallMm,
        rainProb: h.rainProbability,
        wind: h.windSpeedKmh
      }));
    } else {
      // 7-day weekly outlook / historical trend
      chartData = weatherData.daily.map(d => ({
        label: d.dayName,
        dateLabel: d.dateLabel,
        temp: d.maxTempC,
        secondaryTemp: d.minTempC,
        humidity: d.humidity,
        rainfall: d.rainfallMm,
        rainProb: d.rainProbability,
        wind: d.windSpeedKmh
      }));
    }

    // Compute meteorological KPI summaries
    const peakTemp = Math.max(...chartData.map(c => c.temp));
    const lowestTemp = Math.min(...chartData.map(c => c.secondaryTemp || c.temp));
    const avgHumidity = Math.round(chartData.reduce((acc, c) => acc + c.humidity, 0) / (chartData.length || 1));
    const totalRainfall = Number(chartData.reduce((acc, c) => acc + c.rainfall, 0).toFixed(1));
    const peakWind = Math.max(...chartData.map(c => c.wind));

    return successResponse({
      city: weatherData.name,
      country: weatherData.country,
      stationCode: weatherData.stationCode,
      timeframe,
      summary: {
        peakTemp,
        lowestTemp,
        avgHumidity,
        totalRainfall,
        peakWind,
        currentTemp: weatherData.current.tempC,
        currentHumidity: weatherData.current.humidity,
        dewPoint: weatherData.current.dewPointC
      },
      chartData,
      historyCount: historyRecords.length
    });
  } catch (err) {
    console.error('[WeatherAnalyticsHandler] Error:', err);
    return errorResponse(err.message, 500, 'ANALYTICS_ERROR');
  }
}

module.exports = { handler };
