# Weatherly – Backend & Cloud Architecture

Weatherly is an enterprise-grade, cloud-native weather monitoring system backend engineered with **Node.js**, **AWS Lambda**, **Amazon API Gateway**, **Amazon DynamoDB**, and **Amazon EventBridge**.

---

## 1. Project Overview

Weatherly delivers real-time weather observations, hyper-local hourly & 7-day forecasts, persistent meteorological history snapshots, user-specific favourite locations, customizable user preferences, and intelligent contextual recommendations.

### Key Capabilities:
- **Serverless REST APIs**: High-throughput, auto-scaling AWS Lambda endpoints managed by API Gateway.
- **Resilient Multi-Provider Meteorological Engine**: Primary OpenWeatherMap integration with automated live fallback to Open-Meteo for 100% availability worldwide without hard API dependencies.
- **DynamoDB Database**: Single-digit millisecond latency query performance with partition/sort key design, secondary indexes, and automated Time-To-Live (TTL) expiration.
- **Automated Weather Collector**: Amazon EventBridge scheduled Lambda function storing periodic atmospheric snapshots for historical analytics without manual polling.
- **Multi-Tier Caching**: Intelligent DynamoDB caching with configurable TTLs (Current: 15 min, Forecast: 60 min, Analytics: 30 min) to optimize external API quota consumption.

---

## 2. Backend Architecture

```
                                  +-----------------------+
                                  | React Frontend (Vite) |
                                  +-----------+-----------+
                                              | HTTPS / REST
                                              v
                                  +-----------------------+
                                  |   Amazon API Gateway  |
                                  +-----------+-----------+
                                              | Proxy Integration
                                              v
                    +----------------------------------------------------+
                    |                AWS Lambda Functions                |
                    |                                                    |
                    |  * CurrentWeather   * Forecast    * CitySearch     |
                    |  * WeatherHistory   * Analytics   * Favorites      |
                    |  * Preferences      * Recommendations              |
                    |  * FullWeather      * WeatherCollector             |
                    +---------+--------------------+---------------------+
                              |                    |
                 Cache & Read |                    | Scheduled (Cron 1h)
                              v                    v
                   +--------------------+    +--------------------+
                   |  Amazon DynamoDB   |    |  Amazon EventBridge|
                   |                    |    +--------------------+
                   | * WeatherHistory   |
                   | * FavouriteLocations
                   | * UserPreferences  |
                   | * WeatherCache     |
                   +--------------------+
                              |
                              v (Cache Miss)
                   +--------------------+
                   | External Providers |
                   | * OpenWeatherMap   |
                   | * Open-Meteo       |
                   +--------------------+
```

---

## 3. Technology Stack

- **Runtime**: Node.js (v18.x / v20.x / v22.x / v24.x)
- **Cloud Architecture**: AWS Serverless (Lambda, API Gateway, DynamoDB, EventBridge, CloudWatch)
- **Database**: Amazon DynamoDB
- **Infrastructure as Code**: Serverless Framework (`serverless.yml`) & AWS SAM compatible
- **External Providers**: OpenWeatherMap API & Open-Meteo API
- **Testing**: Node.js Built-in Test Runner (`node --test`) & HTTP End-to-End Suite

---

## 4. Backend Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── aws.js                 # AWS DynamoDB client & DocumentClient setup
│   │   └── environment.js         # Centralized environment variables & defaults
│   ├── handlers/
│   │   ├── currentWeather.js      # GET /api/weather/current
│   │   ├── forecast.js            # GET /api/weather/forecast
│   │   ├── citySearch.js          # GET /api/weather/search
│   │   ├── weatherHistory.js      # GET /api/weather/history
│   │   ├── weatherAnalytics.js    # GET /api/weather/analytics
│   │   ├── favorites.js           # GET, POST, DELETE /api/favorites
│   │   ├── preferences.js         # GET, POST /api/preferences
│   │   ├── recommendations.js     # GET /api/weather/recommendations
│   │   ├── weatherCollector.js    # Automated collector & EventBridge cron
│   │   ├── fullWeather.js         # Composite /api/weather/full endpoint
│   │   └── index.js               # Handler entry point
│   ├── repositories/
│   │   ├── weatherRepository.js   # DynamoDB WeatherHistory & WeatherCache access
│   │   ├── favoritesRepository.js # DynamoDB FavouriteLocations access
│   │   └── preferencesRepository.js # DynamoDB UserPreferences access
│   ├── services/
│   │   ├── weatherService.js      # Multi-provider fetching & schema normalization
│   │   ├── dynamodbService.js     # DynamoDB client wrapper + local memory fallback
│   │   └── recommendationService.js # Weather advisory rule engine
│   ├── utils/
│   │   ├── response.js            # Unified JSON response & CORS formatter
│   │   ├── validation.js          # Input validation & sanitization
│   │   └── errorHandler.js        # Standardized error definitions
│   └── routes/
│       └── routes.js              # Express route definitions
├── scripts/
│   ├── createTables.js            # DynamoDB table migration script
│   ├── seedData.js                # Database seeder script
│   └── testEndpoints.js           # End-to-end HTTP integration test suite
├── tests/
│   ├── weather.test.js            # Weather fetching & normalization tests
│   ├── favorites.test.js          # Favorites CRUD & duplicate prevention tests
│   └── analytics.test.js          # Analytics trends & preferences tests
├── localServer.js                 # Local Express server (port 5000)
├── serverless.yml                 # Serverless Framework AWS IaC deployment
├── package.json                   # Dependencies and scripts
├── .env.example                   # Environment variable template
└── README.md                      # Documentation
```

---

## 5. DynamoDB Table Structure

### Table 1: `Weatherly_WeatherHistory`
Stores periodic snapshots of atmospheric observations for meteorological trends and historical analytics.
- **Partition Key (PK)**: `city` (String, normalized lowercase e.g., `"pune"`)
- **Sort Key (SK)**: `recordedAt` (String, ISO-8601 timestamp e.g., `"2026-11-24T12:00:00.000Z"`)
- **Global Secondary Index (GSI1)**:
  - `RecordIdIndex` (PK: `recordId` String)
- **Time To Live (TTL)**: `ttl` (Unix epoch seconds, default 90 days retention)
- **Attributes**: `recordId`, `cityName`, `country`, `temperature`, `feelsLike`, `humidity`, `rainfall`, `windSpeed`, `pressure`, `weatherCondition`, `icon`, `uvIndex`.

### Table 2: `Weatherly_FavouriteLocations`
Stores user-pinned cities with zero scan overhead.
- **Partition Key (PK)**: `userId` (String)
- **Sort Key (SK)**: `cityId` (String, normalized lowercase)
- **Attributes**: `favoriteId`, `city`, `country`, `latitude`, `longitude`, `createdAt`.
- **Duplicate Prevention**: Compound key `(userId, cityId)` ensures duplicate insertions are rejected with HTTP 409 Conflict.

### Table 3: `Weatherly_UserPreferences`
Stores user dashboard customization settings.
- **Partition Key (PK)**: `userId` (String)
- **Attributes**: `temperatureUnit` (`'C'` | `'F'`), `defaultCity`, `theme` (`'light'` | `'dark'`), `createdAt`, `updatedAt`.

### Table 4: `Weatherly_WeatherCache`
Stores serialized weather payloads to prevent excessive third-party API queries.
- **Partition Key (PK)**: `cacheKey` (String, e.g., `"current:pune"`, `"forecast:pune"`, `"full:pune"`)
- **Time To Live (TTL)**: `ttl` (Unix epoch seconds)
- **Attributes**: `data`, `cachedAt`.

---

## 6. Weather API Configuration

The backend supports:
1. **OpenWeatherMap API**:
   - Geocoding API: `/geo/1.0/direct?q={city}&limit=5`
   - Current Weather: `/data/2.5/weather?lat={lat}&lon={lon}&units=metric`
   - 5-Day / 3-Hour Forecast: `/data/2.5/forecast?lat={lat}&lon={lon}&units=metric`
2. **Open-Meteo Meteorological API (Automatic Live Fallback)**:
   - High-precision live hourly and daily forecast model.
   - Requires zero API key, ensuring the backend runs out-of-the-box in development and testing environments.

---

## 7. Environment Variables

Create a `.env` file in the `backend/` directory based on `.env.example`:

```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

# Local DynamoDB (Set to http://localhost:8000 for DynamoDB Local, or leave empty for AWS / in-memory fallback)
DYNAMODB_ENDPOINT=

# DynamoDB Table Names
DYNAMODB_WEATHER_HISTORY_TABLE=Weatherly_WeatherHistory
DYNAMODB_FAVORITES_TABLE=Weatherly_FavouriteLocations
DYNAMODB_PREFERENCES_TABLE=Weatherly_UserPreferences
DYNAMODB_CACHE_TABLE=Weatherly_WeatherCache

# Weather API Configuration (OpenWeatherMap)
# Get a free key at https://openweathermap.org/api
OPENWEATHER_API_KEY=
OPENWEATHER_BASE_URL=https://api.openweathermap.org/data/2.5
OPENWEATHER_GEO_URL=https://api.openweathermap.org/geo/1.0

# Cache TTLs (in seconds)
CACHE_TTL_CURRENT=900
CACHE_TTL_FORECAST=3600
CACHE_TTL_ANALYTICS=1800

# Server Configuration
PORT=5000
NODE_ENV=development
```

---

## 8. API Endpoint Documentation

All endpoints return a uniform JSON envelope:
```json
// Success
{
  "success": true,
  "data": { ... }
}

// Error
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

### A. Current Weather API
`GET /api/weather/current?city=Pune`
```json
{
  "success": true,
  "data": {
    "city": "Pune",
    "country": "India",
    "coordinates": { "lat": 18.5204, "lon": 73.8567 },
    "temperature": 29,
    "feelsLike": 31,
    "minTemp": 22,
    "maxTemp": 32,
    "condition": "Partly Cloudy",
    "description": "Partly Cloudy",
    "icon": "partly-cloudy",
    "humidity": 65,
    "dewPoint": 21,
    "windSpeed": 14,
    "windGust": 18,
    "windDirection": "WNW",
    "rainfall": 2,
    "rainProbability": 20,
    "pressure": 1012,
    "visibility": 10,
    "uvIndex": 6,
    "sunrise": "06:30 AM",
    "sunset": "06:15 PM",
    "daylightProgress": 62,
    "recordedAt": "2026-11-24T12:00:00.000Z"
  }
}
```

### B. Weather Forecast API
`GET /api/weather/forecast?city=Pune`
Returns:
- `hourly`: 24 items with `hourLabel`, `tempC`, `feelsLikeC`, `condition`, `icon`, `rainProbability`, `rainfallMm`, `humidity`, `windSpeedKmh`.
- `daily`: 7 items with `dayName`, `dateLabel`, `condition`, `icon`, `maxTempC`, `minTempC`, `rainProbability`, `rainfallMm`, `uvIndex`, `sunrise`, `sunset`.

### C. City Search API
`GET /api/weather/search?city=Pune`
Returns matching cities with coordinates, country, region, and station codes.

### D. Weather History API
`GET /api/weather/history?city=Pune&startDate=...&endDate=...&limit=20`
Returns historical snapshot records from DynamoDB with date filtering.

### E. Weather Analytics API
`GET /api/weather/analytics?city=Pune&timeframe=daily|weekly`
Returns structured chart data points (temperature, humidity, rainfall, wind speed) and KPI metrics (`peakTemp`, `lowestTemp`, `avgHumidity`, `totalRainfall`, `peakWind`).

### F. Favourite Locations API
- `GET /api/favorites?userId=...`: Returns user favorites enriched with live weather.
- `POST /api/favorites`: Body `{ "userId": "...", "city": "Pune", "country": "India" }`. Returns HTTP 201 or 409 Conflict if duplicate.
- `DELETE /api/favorites/:cityId?userId=...`: Deletes favorite location.

### G. Weather Recommendations API
`GET /api/weather/recommendations?city=Pune`
Returns rule-based guidance (e.g. umbrella recommendations, UV warnings, hydration advice, wind warnings, outdoor activity windows).

### H. User Preferences API
- `GET /api/preferences?userId=...`: Retrieves unit preference (`'C'` or `'F'`), default city, and theme.
- `POST /api/preferences`: Updates unit preference and default city.

### I. Automated Weather Collector API
`POST /api/weather/collect`
Simulates or triggers the EventBridge hourly batch collection across all monitored cities.

### J. Composite Full Weather API
`GET /api/weather/full?city=Pune`
Returns the complete payload for single-call React dashboard hydration.

---

## 9. Local Development Instructions

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
npm install

# 3. Create .env configuration
copy .env.example .env

# 4. (Optional) Run initial table creation & seeder
npm run init-tables
npm run seed

# 5. Start development server (port 5000)
npm run dev
```

---

## 10. Testing Instructions

```bash
# Run unit tests (11 passing tests)
npm test

# Run end-to-end integration test suite (15 passing endpoints)
node scripts/testEndpoints.js
```

---

## 11. AWS Deployment Instructions

Deploy serverless infrastructure using Serverless Framework:

```bash
# Prerequisites
npm install -g serverless
aws configure   # Configure AWS credentials

# Deploy to AWS (dev stage)
serverless deploy --stage dev

# Deploy to production stage
serverless deploy --stage prod
```

The Serverless deployment automatically creates:
1. 10 AWS Lambda functions
2. Amazon API Gateway HTTP endpoints with CORS
3. 4 Amazon DynamoDB tables (PAY_PER_REQUEST billing mode, GSI, and TTL)
4. Amazon EventBridge 1-hour cron rule for automated collection
5. CloudWatch Log Groups with 14-day log retention
6. Least-privilege IAM execution roles
