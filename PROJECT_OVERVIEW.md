# 🌱 Pione AI-Blockchain-IoT Project Overview

## Project Summary
**Pione_AIBlockchainIoT-WAGTeam** is an intelligent agricultural IoT system that:
- Collects **11 soil & weather parameters** from ESP8266/ESP32 sensors
- Stores data in PostgreSQL with automatic blockchain anchoring
- Provides AI-powered crop recommendations and soil health analysis
- Offers a web dashboard with real-time monitoring and Zalo integration

---

## 🏗️ System Architecture

```
IoT Device (ESP8266/ESP32)
    ↓ POST 11 parameters
Flask API (unified_backend.py:8080)
    ├─ Data Ingest (/api/data)
    ├─ Auth Routes (Passkey + PIN)
    └─ Dashboard Routes
    ↓
PostgreSQL (36.50.134.107:6000)
    ├─ sensor_readings (raw IoT data)
    ├─ daily_insights (AI analysis)
    ├─ users (authentication)
    └─ zalo_link_sessions (Zalo integration)
    ↓
Node.js Bridge (server.js:3000)
    ↓ Blockchain callback
Smart Contract (SoilDataStore.sol)
    ↓ Zeroscan blockchain
Frontend (Next.js:3001)
    ├─ Dashboard
    ├─ AI Chat
    └─ Wallet Integration
```

---

## 📊 11 Sensor Parameters

### Soil Indicators (8):
1. **Soil Temperature** (°C)
2. **Soil Moisture** (%)
3. **Electrical Conductivity** (µS/cm)
4. **pH Value**
5. **Nitrogen** (mg/kg)
6. **Phosphorus** (mg/kg)
7. **Potassium** (mg/kg)
8. **Salinity** (mg/L)

### Air/Weather Indicators (3):
9. **Air Temperature** (°C)
10. **Air Humidity** (%)
11. **Rain Status** (boolean)

---

## 🔧 Core Components

### 1. **Backend Services**

#### `unified_backend.py` (Port 8080)
- **Flask API** for data ingestion and authentication
- **FastAPI** integration for AI service
- **Key Routes:**
  - `POST /api/data` - Receive sensor data from IoT devices
  - `GET /api/latest` - Latest sensor reading
  - `GET /api/history` - Historical data (limit 1000)
  - `POST /api/auth/register-passkey` - User registration
  - `POST /api/auth/login-passkey` - Passkey authentication
  - `POST /api/auth/zalo/link-account` - Zalo account linking
  - `POST /api/ai/chat` - AI chat with Gemini fallback
  - `GET /api/dashboard/*` - Dashboard endpoints

#### `server.js` (Port 3000)
- **Node.js blockchain bridge**
- Processes pending sensor records
- Pushes data to Zeroscan blockchain
- Handles smart contract interactions

#### `ai_service/` (Port 8000)
- **FastAPI** AI analysis service
- 4 ML models for soil analysis
- Daily aggregation and insights
- Crop recommendations

### 2. **Database Schema**

**Key Tables:**
- `sensor_readings` - Raw IoT data (11 parameters)
- `daily_insights` - AI-generated daily analysis
- `users` - User profiles with Passkey/PIN auth
- `zalo_link_sessions` - Zalo account linking tokens

### 3. **Smart Contract** (`SoilDataStore.sol`)

**Functions:**
- `storeSensorReading()` - Store raw sensor data on-chain
- `storeDailyInsight()` - Store daily AI insights
- `getRecordsByTimeRange()` - Query historical data
- `getDailyInsightsByDateRange()` - Query insights by date

**Data Scaling:**
- Temperature: °C × 10 (24.5°C → 245)
- Moisture: % × 10 (45.2% → 452)
- pH: × 10 (6.8 → 68)
- Confidence: % × 100 (98.5% → 9850)

### 4. **Frontend** (Next.js, Port 3001)

**Key Features:**
- Real-time sensor dashboard
- AI chat interface (Gemini integration)
- Crop recommendations
- Blockchain verification
- Passkey authentication
- Zalo account linking

---

## 🚀 Key Features

### ✅ Multi-Method Authentication
- **Passkey (WebAuthn)** - Biometric/PIN on device
- **PIN-based** - Traditional PIN authentication
- **Zalo Integration** - Link Zalo account for notifications

### ✅ AI Analysis
- **Soil Health Scoring** (0-100)
- **Crop Recommendations** - Based on current conditions
- **Anomaly Detection** - Identify unusual patterns
- **Gemini AI** - Natural language responses with fallback

### ✅ Blockchain Integration
- **Immutable Records** - All data hashed and anchored
- **Zeroscan Explorer** - Public verification
- **Daily Insights** - Aggregated analysis on-chain

### ✅ Real-time Dashboard
- Latest sensor readings
- 24-hour trend analysis
- Daily AI insights history
- Blockchain status tracking

---

## 📁 Project Structure

```
/root/Pione_AIBlockchainIoT-WAGTeam/
├── unified_backend.py          # Main Flask API (Port 8080)
├── server.js                   # Blockchain bridge (Port 3000)
├── auth_routes.py              # Authentication endpoints
├── dashboard_routes.py         # Dashboard endpoints
├── contracts/
│   └── SoilDataStore.sol       # Smart contract
├── ai_service/
│   ├── main.py                 # FastAPI app
│   ├── inference.py            # ML model inference
│   ├── daily_aggregator.py     # Daily analysis
│   └── models_loader.py        # Model management
├── Dapp/
│   ├── frontend/               # Next.js dashboard
│   ├── backend/                # Express API
│   └── smartContract/          # Hardhat deployment
├── migrations/                 # Database migrations
├── ai_module/                  # ML model training
└── dataset/                    # Training datasets
```

---

## 🔌 Environment Variables

**Key .env settings:**
```
# Database
PGHOST=36.50.134.107
PGPORT=6000
PGDATABASE=db_iot_sensor
PGUSER=admin
PGPASSWORD=admin123

# Blockchain
RPC_URL=https://rpc.zeroscan.org
PRIVATE_KEY=0x...
CONTRACT_ADDRESS=0x55313657185bd745917a7eD22fe9B827fC1AAC48

# AI
GEMINI_API_KEY=AIzaSyAeE5mtJWbCa9JiL-rxB78c4HU7Bx7yOvM
GEMINI_MODEL_NAME=gemini-2.5-pro

# Services
NODE_BRIDGE_URL=http://127.0.0.1:3000/bridgePending
```

---

## 🧪 Testing

**Send test data:**
```bash
curl -X POST http://localhost:8080/api/data \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": 24.5,
    "humidity": 45.2,
    "conductivity": 1250,
    "ph": 6.8,
    "nitrogen": 45,
    "phosphorus": 30,
    "potassium": 180,
    "salt": 850,
    "air_temperature": 27.1,
    "air_humidity": 65.0,
    "is_raining": false
  }'
```

---

## 📚 Technology Stack

- **Backend:** Python (Flask, FastAPI), Node.js (Express)
- **Database:** PostgreSQL
- **Blockchain:** Solidity, Ethers.js, Zeroscan
- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **AI/ML:** TensorFlow, Scikit-learn, Google Gemini
- **Auth:** WebAuthn (Passkey), bcrypt
- **Integration:** Zalo API, n8n workflows

---

## 🎯 Next Steps

1. **Deploy** - Use `START_UNIFIED.sh` to start all services
2. **Configure** - Set environment variables in `.env`
3. **Monitor** - Check logs in `/logs` directory
4. **Integrate** - Connect IoT devices to `/api/data` endpoint
5. **Analyze** - View dashboard at `http://localhost:3001`

