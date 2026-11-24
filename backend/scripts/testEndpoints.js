/**
 * End-to-End API Integration Verification Script
 * Starts the local server and tests every required REST API endpoint.
 * Run: node scripts/testEndpoints.js
 */

const { app } = require('../localServer');
const http = require('http');

async function testEndpoint(name, url, options = {}) {
  const start = Date.now();
  try {
    const res = await fetch(url, options);
    const duration = Date.now() - start;
    const body = await res.json().catch(() => null);

    if (res.ok && body && (body.success || body.status === 'healthy')) {
      console.log(`  [PASS] ${name} -> ${res.status} OK (${duration}ms)`);
      return { pass: true, body };
    } else {
      console.error(`  [FAIL] ${name} -> ${res.status} Error:`, body?.error || body);
      return { pass: false, error: body };
    }
  } catch (err) {
    console.error(`  [FAIL] ${name} -> Network error:`, err.message);
    return { pass: false, error: err.message };
  }
}

async function runAllTests() {
  const port = 5005;
  const server = http.createServer(app);

  await new Promise((resolve) => server.listen(port, resolve));
  const baseUrl = `http://localhost:${port}/api`;

  console.log('====================================================');
  console.log(` Running Weatherly Backend End-to-End API Test Suite`);
  console.log(` Base URL: ${baseUrl}`);
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  async function check(name, url, options) {
    total++;
    const res = await testEndpoint(name, url, options);
    if (res.pass) passed++;
    return res;
  }

  // 1. Health check
  await check('Health Check', `${baseUrl}/health`);

  // 2. Current Weather API
  await check('Current Weather (Pune)', `${baseUrl}/weather/current?city=Pune`);

  // 3. Forecast API
  await check('Weather Forecast (Pune)', `${baseUrl}/weather/forecast?city=Pune`);

  // 4. City Search API
  await check('City Search (Pune)', `${baseUrl}/weather/search?city=Pune`);

  // 5. Weather History API
  await check('Weather History (Pune)', `${baseUrl}/weather/history?city=Pune&limit=10`);

  // 6. Weather Analytics API (Daily)
  await check('Weather Analytics Daily (Pune)', `${baseUrl}/weather/analytics?city=Pune&timeframe=daily`);

  // 7. Weather Analytics API (Weekly)
  await check('Weather Analytics Weekly (Pune)', `${baseUrl}/weather/analytics?city=Pune&timeframe=weekly`);

  // 8. Weather Recommendations API
  await check('Weather Recommendations (Pune)', `${baseUrl}/weather/recommendations?city=Pune`);

  // 9. Composite Full Weather API
  await check('Full Weather Composite (Pune)', `${baseUrl}/weather/full?city=Pune`);

  // 10. User Preferences POST
  const testUserId = `e2e-user-${Date.now()}`;
  await check('Set User Preferences', `${baseUrl}/preferences`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: testUserId,
      temperatureUnit: 'C',
      defaultCity: 'Pune',
      theme: 'dark'
    })
  });

  // 11. User Preferences GET
  await check('Get User Preferences', `${baseUrl}/preferences?userId=${testUserId}`);

  // 12. Favourite Locations POST
  await check('Add Favourite Location', `${baseUrl}/favorites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: testUserId,
      city: 'Pune',
      country: 'India',
      latitude: 18.5204,
      longitude: 73.8567
    })
  });

  // 13. Favourite Locations GET
  await check('Get Favourite Locations', `${baseUrl}/favorites?userId=${testUserId}`);

  // 14. Favourite Locations DELETE
  await check('Delete Favourite Location', `${baseUrl}/favorites/pune?userId=${testUserId}`, {
    method: 'DELETE'
  });

  // 15. Automated Weather Collector Trigger POST
  await check('Automated Weather Collector (EventBridge simulation)', `${baseUrl}/weather/collect`, {
    method: 'POST'
  });

  console.log('\n====================================================');
  console.log(` Test Summary: ${passed} / ${total} Endpoints Verified Successfully`);
  console.log('====================================================\n');

  server.close();
  process.exit(passed === total ? 0 : 1);
}

runAllTests().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
