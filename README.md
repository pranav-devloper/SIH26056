# AirIndex India 🇮🇳
### Development of a Real-Time Airfare Price Index for India through Automated Web Scraping of Permitted Airline and Online Travel Sources

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![Database](https://img.shields.io/badge/Database-SQL%20Only%20(PostgreSQL%2FSQLite)-336791.svg)](https://www.postgresql.org/)
[![No-Redis](https://img.shields.io/badge/Redis-None%20Required-success.svg)](#no-redis-database)
[![License](https://img.shields.io/badge/License-Proprietary-slate.svg)]()

---

## 1. Executive Summary & Problem Statement

Indian domestic civil aviation is one of the fastest-growing aviation markets globally. However, dynamic revenue management algorithms cause dramatic intra-day and horizon-dependent price fluctuations. 

**AirIndex India** is a full-stack aviation price intelligence platform designed to collect, clean, normalize, and monitor domestic airfare data across key corridors. It calculates a weighted **Real-Time Airfare Price Index (APIx)** using the classical **Laspeyres Index Formula**, stratified across 5 critical advance-booking horizons:

* **T+1**: Emergency / Next-Day Travel (Peak Surge)
* **T+7**: Short-Horizon Travel (7-Day Lead)
* **T+15**: Standard Travel Horizon (15-Day Lead)
* **T+30**: Planned Domestic Travel (30-Day Lead)
* **T+45**: Advance Discount Baseline (45-Day Lead)

> **Regulatory & Statistical Notice:** AirIndex India is an independent research platform and statistical intelligence benchmark. It does **NOT** represent or replace the official Consumer Price Index (CPI) issued by the Ministry of Statistics and Programme Implementation (MoSPI). Synthetic test data is labeled as `DEMO DATA`.

---

## 2. Key Architecture & Features

* **Strict SQL Persistence (No NoSQL, Zero Redis)**:
  * Persistent storage implemented strictly via **SQLAlchemy ORM** and **PostgreSQL** (with zero-configuration SQLite for local offline development).
  * No MongoDB, no Firebase, no DynamoDB, and **no Redis database**.
  * Background tasks and recurrent index calculation managed via **APScheduler**.
* **Authentication & Role-Based Access (RBAC)**:
  * **Google OAuth 2.0 / OpenID Connect** authentication.
  * **Email OTP Verification** (cryptographically hashed 6-digit tokens, 5-minute expiration, 5-attempt limits, 60s cooldown).
  * **Forgot Password Recovery via Email OTP**.
  * **JWT Stateless Bearer Tokens** (HS256) with role tiers: `Admin`, `Analyst`, `Viewer`.
* **Laspeyres Index Engine**:
  * $$\text{API}_x(t) = \sum \left( W_i \times \frac{P_{i,t}}{P_{i,\text{base}}} \right) \times 100$$
  * Route weights ($W_i$) dynamically managed in SQL database tables (`routes.weight`).
  * Base period normalized to `2026-01 = 100.0`.
* **Responsible Data Collection Architecture**:
  * Extensible `BaseScraper` class with rate limiting, randomized request throttling, exponential backoff, retry limits, and status auditing (`ACTIVE`, `RATE LIMITED`, `UNAVAILABLE`, `PARSER ERROR`, `DEMO MODE`).
  * Dedicated airline adapters for IndiGo, Air India, Air India Express, Akasa Air, SpiceJet, and OTAs (MakeMyTrip, EaseMyTrip, Yatra).
  * Seamless fallback to `DemoAirfareAdapter` for safe evaluation without website scraping blocks.
* **Statistical Backtesting Engine**:
  * Comparative 30-day index validation computing **MAE** (Mean Absolute Error), **RMSE** (Root Mean Squared Error), **MAPE**, and **Pearson Correlation ($r$)**.
* **Data Quality & Anomaly Isolation**:
  * Interquartile Range (IQR) outlier trimming ($< 0.35\times$ or $> 3.5\times$ median).
  * 4-hour duplicate suppression and `Total = Base + Taxes + Fees` mathematical validation.

---

## 3. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, React Router v7, Recharts, Lucide Icons, Axios |
| **Backend** | Python 3.11, FastAPI, Pydantic v2, SQLAlchemy ORM, APScheduler, Passlib/Bcrypt, PyJWT |
| **Database** | PostgreSQL (Production/Docker) / SQLite (Zero-Setup Local Dev) — **SQL ONLY** |
| **Testing** | PyTest (AsyncIO), Node.js Native Test Runner |
| **Deployment**| Docker, Docker Compose, Nginx Multi-stage build |

---

## 4. Project Directory Structure

```text
SIH26056/
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI routers (auth, index_routes, airfare)
│   │   ├── auth/            # Security, JWT tokens, RBAC dependencies
│   │   ├── core/            # Configuration & environment variables
│   │   ├── database/        # SQLAlchemy session & Base
│   │   ├── email/           # SMTP email dispatcher with dev fallback
│   │   ├── index_engine/    # Laspeyres formula calculator & weights
│   │   ├── models/          # Relational SQL models (10 tables)
│   │   ├── schemas/         # Pydantic request/response schemas
│   │   ├── scrapers/        # Pipeline adapters & base scraper classes
│   │   ├── services/        # 35-day synthetic seeder & aggregators
│   │   ├── workers/         # APScheduler background tasks (No Redis)
│   │   └── main.py          # FastAPI application entrypoint
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # ProtectedRoute, DemoBanner
│   │   ├── contexts/        # AuthContext (login, register, OTP, Google)
│   │   ├── layouts/         # MainLayout, PublicLayout
│   │   ├── pages/           # Dashboard, Index, Routes, Airlines, Heatmap, etc.
│   │   ├── services/        # Axios API client bindings
│   │   ├── App.jsx          # Route configuration
│   │   ├── index.css        # Typography and styling resets
│   │   └── main.jsx
│   ├── index.html           # Tailwind CDN & Inter font shell
│   └── package.json
├── scrapers/
│   ├── airlines/            # IndiGo, Air India, Akasa, SpiceJet scrapers
│   ├── ota/                 # MakeMyTrip, EaseMyTrip, Yatra scrapers
│   └── common/              # Common scraper interfaces
├── tests/
│   ├── backend/             # test_auth.py, test_index.py
│   ├── frontend/            # app.test.mjs
│   └── conftest.py          # Database session fixtures
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── nginx.conf
├── .env.example
├── docker-compose.yml
├── pytest.ini
└── README.md
```

---

## 5. Getting Started (Local Development)

### Prerequisites
* Python 3.11+
* Node.js 18+ and npm

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install Python requirements
pip install -r requirements.txt

# Run FastAPI development server with automatic database initialization and seeding
uvicorn app.main:app --reload --port 8000
```
* **Swagger API Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)
* **ReDoc Specifications:** [http://localhost:8000/redoc](http://localhost:8000/redoc)
* **Health Check:** [http://localhost:8000/health](http://localhost:8000/health)

### 2. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 6. Pre-Seeded Demo Credentials

The platform initializes with pre-calibrated role accounts for immediate testing:

| Role | Email | Password | Privileges |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@airindex.in` | `Admin@AirIndex2026` | Full administrative control, index recalculation, pipeline trigger |
| **Analyst** | `analyst@airindex.in` | `Analyst@AirIndex2026` | Deep data explorer, historical CSV/JSON exports |
| **Viewer** | `viewer@airindex.in` | `Viewer@AirIndex2026` | Standard dashboard and index views |

* **Google Login:** Click **"Continue with Google"** on the Login or Register page for instant single-click OAuth authentication.

---

## 7. Running with Docker Compose (PostgreSQL Included)

To run the complete production environment containing PostgreSQL, the FastAPI backend, and the Nginx-served React frontend:

```bash
docker compose up --build
```

Services exposed:
* **Frontend Application:** `http://localhost` (or `http://localhost:5173`)
* **Backend API & Swagger:** `http://localhost:8000/docs`
* **PostgreSQL Database:** `localhost:5432`

---

## 8. Verification & Test Suite

### Backend PyTest Suite
Runs 10 comprehensive tests covering registration, email OTP hashing, Google authentication, password recovery, Laspeyres math, route analytics, booking windows, and outlier validation:

```bash
pytest tests/backend/ -v
```

### Frontend Tests
Runs mathematical unit tests validating the client-side Laspeyres aggregation and advance booking lead-time order:

```bash
node --test tests/frontend/app.test.mjs
```

---

## 9. Key API Endpoints Summary

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/index/current` | GET | Current Laspeyres airfare price index and daily/weekly shifts |
| `/api/index/daily` | GET | Daily index time-series (up to 45 days) |
| `/api/index/recalculate` | POST | Recalculate historical index values (Admin only) |
| `/api/routes` | GET | List all active domestic routes and weights |
| `/api/routes/{code}/prices`| GET | Statistical price summary for a corridor (e.g. `DEL-BOM`) |
| `/api/booking-windows` | GET | Advance booking window price metrics (T+1 to T+45) |
| `/api/airlines` | GET | Carrier benchmark statistics (IndiGo, Air India, SpiceJet, etc.) |
| `/api/heatmap` | GET | Origin-Destination pricing matrix with base-period deviation |
| `/api/historical` | GET | Searchable SQL observations with pagination and filters |
| `/api/historical/export/csv` | GET | Stream observations as CSV |
| `/api/backtesting` | GET | 30-Day AirIndex vs Benchmark validation (MAE, RMSE, MAPE, $r$) |
| `/api/data-quality` | GET | Record validity rates and anomaly suppression counts |
| `/api/sources/status` | GET | Status of permitted scraper adapters |
| `/api/auth/register` | POST | Register new user and dispatch 6-digit OTP |
| `/api/auth/verify-otp` | POST | Verify email OTP and issue JWT access token |
| `/api/auth/login` | POST | Email/Password login |
| `/api/auth/google` | POST | Google OAuth 2.0 credential verification |

---

## 10. License

Developed for the **Smart India Hackathon (SIH26056)** — Real-Time Airfare Price Index for India.
All rights reserved.
#   S I H 2 6 0 5 6  
 #   S I H 2 6 0 5 6  
 #   S I H 2 6 0 5 6  
 