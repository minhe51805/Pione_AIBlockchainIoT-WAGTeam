# 🌱 Pione AI-Blockchain-IoT Platform

> **Intelligent Agricultural IoT System with AI Analysis & Blockchain Verification**

A comprehensive smart farming platform combining IoT sensor data collection, AI-powered analysis, and blockchain-based data verification for sustainable agriculture.

---

## 📋 Quick Links

- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running Services](#running-services)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)

---

## 📖 Overview

**Pione AI-Blockchain-IoT** is an end-to-end agricultural intelligence platform that:

- **Collects** 11 soil & weather parameters from IoT sensors (ESP8266/ESP32)
- **Analyzes** data using 4 ML models + Google Gemini AI (LLM WITH FACT mode)
- **Stores** immutable records on Zeroscan blockchain
- **Provides** real-time dashboard with crop recommendations & soil health insights
- **Supports** multi-method authentication (Passkey, PIN, Zalo integration)

### Use Cases

✅ **Precision Farming** - Real-time soil monitoring & irrigation optimization
✅ **Crop Planning** - AI-powered crop recommendations based on soil conditions
✅ **Data Transparency** - Blockchain-verified audit trail for agricultural data
✅ **Farmer Support** - Natural language AI chatbot for agricultural advice
✅ **Compliance** - Immutable records for certification & traceability

---

## 🎯 Key Features

### 🤖 AI-Powered Analysis
- **Soil Health Scoring** (0-100 scale)
- **Crop Recommendations** - Predicts best crops for current conditions
- **Anomaly Detection** - Identifies unusual soil patterns
- **LLM WITH FACT** - Gemini AI responds only based on real database data (no hallucination)
- **Natural Language Chat** - Vietnamese language support with fallback rule-based AI

### ⛓️ Blockchain Integration
- **Immutable Records** - All sensor data hashed and anchored on Zeroscan
- **Daily Insights** - Aggregated AI analysis stored on-chain
- **Duplicate Prevention** - Prevents duplicate blockchain transactions
- **Public Verification** - Data verifiable via Zeroscan explorer

### 🔐 Multi-Method Authentication
- **Passkey (WebAuthn)** - Biometric/PIN authentication on device
- **PIN-Based** - Traditional PIN authentication with bcrypt hashing
- **Zalo Integration** - Link Zalo account for notifications

### 📊 Real-Time Dashboard
- **Live Sensor Data** - 11 parameters updated in real-time
- **24-Hour Trends** - Historical data visualization
- **AI Insights History** - Daily analysis records with blockchain status
- **Crop Management** - Track planted crops and harvest dates
- **Responsive Design** - Works on desktop, tablet, and mobile

---

## 🏗️ System Architecture

```
IoT Sensors (ESP8266/ESP32)
    ↓ POST 11 parameters
Flask API (unified_backend.py:8080)
    ├─ Data Ingest
    ├─ Authentication
    ├─ AI Chat (LLM WITH FACT)
    └─ Daily Analysis
    ↓
PostgreSQL (36.50.134.107:6000)
    ├─ sensor_readings
    ├─ daily_insights
    ├─ users
    └─ ai_recommendations
    ↓
Node.js Bridge (server.js:3000)
    ↓ Blockchain callback
Smart Contract (SoilDataStore.sol)
    ↓ Zeroscan blockchain
Frontend (Next.js:3001)
    ├─ Dashboard
    ├─ AI Chat Modal
    └─ Blockchain Verification
```

---

## 📊 11 Sensor Parameters

**Soil (8):** Temperature, Moisture, Conductivity, pH, N, P, K, Salinity
**Air (3):** Temperature, Humidity, Rain Status

---

## 💻 Technology Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Python (Flask, FastAPI), Node.js (Express) |
| **Frontend** | Next.js 15.1.2, React 19, TypeScript, Tailwind CSS |
| **Database** | PostgreSQL 12+ |
| **AI/ML** | TensorFlow, Scikit-learn, Google Gemini |
| **Blockchain** | Solidity 0.8.20, Ethers.js, Zeroscan |
| **Auth** | WebAuthn (Passkey), bcrypt, JWT |

---

## 🚀 Installation

### Prerequisites
- Node.js 18+, npm
- Python 3.10+
- PostgreSQL 12+
- Git

### Clone & Install

```bash
git clone https://github.com/WAGTeam/Pione_AIBlockchainIoT-WAGTeam.git
cd Pione_AIBlockchainIoT-WAGTeam

# Install all dependencies
npm install
pip install -r requirements.txt
cd ai_service && pip install -r requirements.txt && cd ..
cd Dapp/frontend && npm install && cd ../..
```

---

## ⚙️ Configuration

### 1. Environment Variables (.env)

```env
# Database
PGHOST=your_database_host
PGPORT=5432
PGDATABASE=your_database_name
PGUSER=your_db_user
PGPASSWORD=your_secure_password

# Blockchain
RPC_URL=https://rpc.zeroscan.org
PRIVATE_KEY=0xyour_private_key_here
CONTRACT_ADDRESS=0xyour_contract_address

# AI Services
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL_NAME=gemini-2.5-pro

# Services
NODE_BRIDGE_URL=http://127.0.0.1:3000/bridgePending
```

### 2. Database Setup

```bash
psql -h $PGHOST -U $PGUSER -d postgres -c "CREATE DATABASE $PGDATABASE;"
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -f db.sql
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -f migrations/*.sql
```

---

## 🏃 Running Services

### Unified Start (Recommended)

```bash
chmod +x START_UNIFIED.sh
./START_UNIFIED.sh
```

Starts all services:
- Backend API (Port 8080)
- Blockchain Bridge (Port 3000)
- AI Service (Port 8000)
- Frontend (Port 3001)

### Manual Start

```bash
# Terminal 1: Backend
python unified_backend.py

# Terminal 2: Blockchain Bridge
node server.js

# Terminal 3: AI Service
cd ai_service && python main.py

# Terminal 4: Frontend
cd Dapp/frontend && npm run dev
```

### Verify Services

```bash
curl http://localhost:8080/api/latest
curl http://localhost:8000/api/ai/health
curl http://localhost:3000/status
open http://localhost:3001
```

---

## 📡 API Documentation

### Data Ingest
**POST** `/api/data` - Receive sensor data

```bash
curl -X POST http://localhost:8080/api/data \
  -H "Content-Type: application/json" \
  -d '{
    "soil_temperature_c": 24.5,
    "soil_moisture_pct": 45.2,
    "conductivity_us_cm": 1250,
    "ph_value": 6.8,
    "nitrogen_mg_kg": 45,
    "phosphorus_mg_kg": 30,
    "potassium_mg_kg": 180,
    "salt_mg_l": 850,
    "air_temperature_c": 27.1,
    "air_humidity_pct": 65.0,
    "is_raining": false
  }'
```

### AI Chat
**POST** `/api/ai/chat` - AI chatbot (LLM WITH FACT mode)

```bash
curl -X POST http://localhost:8080/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Nhiệt độ + NPK ổn không?"}'
```

### Daily Analysis
**POST** `/api/ai/analyze-daily-insights` - Daily analysis + DB save + blockchain push

```bash
curl -X POST http://localhost:8080/api/ai/analyze-daily-insights \
  -H "Content-Type: application/json" \
  -d '{"date": "2025-11-10"}'
```

### Dashboard
**GET** `/api/dashboard/overview` - Statistics overview

```bash
curl http://localhost:8080/api/dashboard/overview
```

---

## 🧪 Testing

```bash
# Test data ingest
curl -X POST http://localhost:8080/api/data \
  -H "Content-Type: application/json" \
  -d '{"soil_temperature_c": 24.5, ...}'

# Test AI chat
curl -X POST http://localhost:8080/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Bón phân gì?"}'

# Check blockchain
curl http://localhost:3000/api/getPending
```

---

## 📦 Deployment

### Docker

```bash
docker-compose build
docker-compose up -d
docker-compose logs -f
```

### Production Checklist

- [ ] Strong database passwords
- [ ] HTTPS/SSL certificates
- [ ] Secure environment variables
- [ ] Database backups enabled
- [ ] Firewall rules configured
- [ ] Monitoring & alerting setup
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Log aggregation setup
- [ ] Disaster recovery tested

---

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

MIT License - see LICENSE file for details

---

## 📞 Support

**WAG Team - Pione AI-Blockchain-IoT Project**

- 📧 Email: support@pione.io
- 🌐 Website: https://pione.io
- 🐙 GitHub: https://github.com/WAGTeam

---

**Version:** 2.0.0 | **Last Updated:** November 2025
