/**
 * Input Validation & Sanitization Helpers
 */

function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str.trim();
}

function normalizeCity(city) {
  return sanitizeString(city).toLowerCase();
}

function isValidCity(city) {
  const sanitized = sanitizeString(city);
  return sanitized.length >= 2 && sanitized.length <= 100 && /^[\p{L}\s\-,\.]+$/u.test(sanitized);
}

function isValidCoordinate(lat, lon) {
  const nLat = Number(lat);
  const nLon = Number(lon);
  return !isNaN(nLat) && !isNaN(nLon) && nLat >= -90 && nLat <= 90 && nLon >= -180 && nLon <= 180;
}

function isValidTemperatureUnit(unit) {
  return unit === 'C' || unit === 'F';
}

function parsePaginationLimit(limit, defaultVal = 20, maxVal = 100) {
  const n = parseInt(limit, 10);
  if (isNaN(n) || n <= 0) return defaultVal;
  return Math.min(n, maxVal);
}

module.exports = {
  sanitizeString,
  normalizeCity,
  isValidCity,
  isValidCoordinate,
  isValidTemperatureUnit,
  parsePaginationLimit
};
