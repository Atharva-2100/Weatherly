# Weatherly – Cloud-Based Weather Monitoring System

Weatherly is a modern, enterprise-grade cloud-based weather monitoring application featuring a high-performance **React.js** frontend and a robust **AWS Serverless (Node.js, Lambda, API Gateway, DynamoDB, EventBridge)** backend.

---

## 1. System Architecture

```
                                  +-----------------------+
                                  | React Frontend (Vite) |
                                  |     (Port 3000)       |
                                  +-----------+-----------+
                                              |
                                              v  REST / JSON
                                  +-----------------------+
                                  |  Amazon API Gateway   |
                                  | (or Local Server:5000)|
                                  +-----------+-----------+
                                              |
                        +---------------------+---------------------+
                        |                                           |
                        v                                           v
         +-----------------------------+             +-----------------------------+
         |     AWS Lambda Handlers     |             |    Amazon EventBridge Cron  |
         |                             |             |        (Hourly Batch)       |
         | * Current Weather           |             +--------------+--------------+
         | * Hourly & 7-Day Forecast   |                            |
         | * City Search & Geocoding   |                            v
         | * Historical Snapshots      |             +-----------------------------+
         | * Meteorological Analytics  |             |      Weather Collector      |
         | * Favourite Locations       |             |           Lambda            |
         | * User Preferences          |             +--------------+--------------+
         | * Weather Recommendations   |                            |
         +--------------+--------------+                            |
                        |                                           |
                        +---------------------+---------------------+
                                              |
                                              v
                                 +-------------------------+
                                 |     Amazon DynamoDB     |
                                 |                         |
                                 | * WeatherHistory        |
                                 | * FavouriteLocations    |
                                 | * UserPreferences       |
                                 | * WeatherCache          |
                                 +-------------------------+
```

---

## 2. Directory Structure

```
Weatherly/
├── frontend/                   # React.js Frontend Application
│   ├── src/
│   │   ├── components/         # UI Components (Cards, Charts, Forecasts)
│   │   ├── context/            # React Context (Weather, Favorites, Preferences)
│   │   ├── pages/              # Dashboard, Forecast, Analytics, About
│   │   ├── services/           # Service layer connected to Backend REST API
│   │   ├── types/              # TypeScript interfaces
│   │   └── utils/              # Weather formatting and calculations
│   └── package.json
│
├── backend/                    # AWS Serverless Backend & Database
│   ├── src/
│   │   ├── config/             # AWS SDK & Environment Configuration
│   │   ├── handlers/           # 10 AWS Lambda Function Handlers
│   │   ├── repositories/       # DynamoDB Data Access Layer
│   │   ├── services/           # Meteorological Service & Recommendation Engine
│   │   ├── utils/              # Response, Validation, and Error Handling
│   │   └── routes/             # Express Route Adapter
│   ├── scripts/
│   │   ├── createTables.js     # DynamoDB Table Creator
│   │   ├── seedData.js         # Initial Database Seeder
│   │   └── testEndpoints.js    # End-to-End API Integration Suite (15/15 passed)
│   ├── tests/                  # Unit Test Suite (11/11 passed)
│   ├── localServer.js          # Standalone Local Express Server (Port 5000)
│   ├── serverless.yml          # AWS Serverless Framework IaC
│   └── package.json
│
└── README.md                   # System Documentation
```

---

## 3. Quick Start (Local Development)

### Step 1: Start the Backend Server

```bash
cd backend
npm install
npm run dev
```
> The backend server starts at **`http://localhost:5000`** with real-time weather integration and resilient in-memory / DynamoDB data storage.

### Step 2: Start the Frontend Application

```bash
cd ../frontend
npm install --legacy-peer-deps
npm run dev
```
> The frontend application launches at **`http://localhost:3000`**.

---

## 4. Testing the System

### Backend Unit Tests
```bash
cd backend
npm test
```
*Result: 11 / 11 tests passing.*

### Backend End-to-End API Verification
```bash
cd backend
node scripts/testEndpoints.js
```
*Result: 15 / 15 endpoints verified (Health, Current, Forecast, Search, History, Analytics, Favorites, Preferences, Recommendations, Automated Collector).*

### Frontend Typecheck & Build
```bash
cd frontend
npm run lint
npm run build
```
*Result: Production build compiled successfully.*

---

## 5. AWS Cloud Deployment

Deploy the entire serverless infrastructure to AWS with a single command:

```bash
cd backend
npm install -g serverless
aws configure
serverless deploy --stage prod
```

This deploys:
1. **10 AWS Lambda functions**
2. **Amazon API Gateway HTTP REST API** with CORS enabled
3. **4 Amazon DynamoDB tables** with PAY_PER_REQUEST on-demand billing, GSI, and automated TTL cleanup
4. **Amazon EventBridge cron rule** (`rate(1 hour)`) triggering automated snapshot collection
5. **Amazon CloudWatch log groups** with 14-day retention
6. **IAM roles** enforcing least-privilege security
