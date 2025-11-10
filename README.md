<div align="center">

# 🌱 **GAIA.VN**

### **Global Agro Intelligence Architecture – Vietnam**

#### AI • Blockchain • IoT • Smart Agriculture Platform

![Version](https://img.shields.io/badge/Version-1.0.0-2ecc71.svg)
![License](https://img.shields.io/badge/License-MIT-27ae60.svg)
![Node](https://img.shields.io/badge/Node-%3E%3D18-3498db.svg)
![Python](https://img.shields.io/badge/Python-%3E%3D3.8-9b59b6.svg)

GAIA.VN là nền tảng nông nghiệp thông minh tích hợp IoT, AI và Blockchain,  
xây dựng hệ sinh thái dữ liệu nông nghiệp **minh bạch – chính xác – thời gian thực** cho Việt Nam.

Hệ thống kết nối **ESP32 + cảm biến môi trường 7-trong-1**, pipeline AI và Smart Contract trên **Zero Network**,  
tạo nên một kiến trúc dữ liệu nông nghiệp thống nhất, phục vụ dự báo – phân tích – truy xuất nguồn gốc.

</div>

---

## 🔧 Kiến trúc hệ thống

## 📋 Mục lục

```

- [Giới thiệu](#-giới-thiệu)IoT Device (ESP8266/ESP32)

- [Tính năng chính](#-tính-năng-chính)   │ POST 11 thông số

- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)   ↓

- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)Flask API (app_ingest.py) - Port 5000

- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)   │ Validate & lưu PostgreSQL

- [Hướng dẫn cài đặt](#-hướng-dẫn-cài-đặt)   │ Callback Node.js bridge

- [Cấu hình](#-cấu-hình)   ↓

- [Hướng dẫn sử dụng](#-hướng-dẫn-sử-dụng)PostgreSQL (36.50.134.107:6000)

- [API Documentation](#-api-documentation)   │ Queue pending records

- [Smart Contract](#-smart-contract)   ↓

- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)Node.js Bridge (server.js) - Port 3000

- [Đóng góp](#-đóng-góp)   │ Claim & đẩy lên blockchain

- [License](#-license)   ↓

- [Liên hệ](#-liên-hệ)Smart Contract (SoilDataStore.sol)

   │ Lưu vĩnh viễn trên Zeroscan

---   └─→ https://zeroscan.org

```

## 🎯 Giới thiệu

---

**GAIA.VN** là một hệ thống giám sát nông nghiệp thông minh toàn diện, kết hợp công nghệ IoT, AI và Blockchain để cung cấp giải pháp quản lý đất đai và cây trồng hiệu quả cho nông dân.

## 📦 11 Thông số thu thập

### Vấn đề giải quyết:

- 🌾 Quản lý chất lượng đất chưa khoa học### **Soil Indicators (8):**

- 💧 Tưới tiêu không tối ưu, lãng phí nước1. Soil Temperature (°C)

- 🌡️ Thiếu dữ liệu thời tiết thời gian thực2. Soil Moisture (%)

- 🔬 Không có khuyến nghị khoa học về bón phân3. Electrical Conductivity (µS/cm)

- 🔒 Dữ liệu nông nghiệp thiếu tính minh bạch và bảo mật4. pH

5. Nitrogen (mg/kg)

### Giải pháp:6. Phosphorus (mg/kg)

- ✅ Thu thập 11 thông số đất và khí tượng tự động7. Potassium (mg/kg)

- ✅ Phân tích AI cho khuyến nghị cây trồng phù hợp8. Salinity (mg/L)

- ✅ Lưu trữ dữ liệu bất biến trên blockchain

- ✅ Dashboard trực quan với biểu đồ và cảnh báo### **Air/Weather Indicators (3):**

- ✅ Xác thực passkey an toàn9. Air Temperature (°C)

10. Air Humidity (%)

---11. Rain Status (boolean)

## 🚀 Tính năng chính---

### 🌐 IoT Data Collection## 🚀 Quick Start

- **11 thông số cảm biến**:

  - 🌡️ Nhiệt độ đất (Soil Temperature)### **1. Cài đặt dependencies:**

  - 💧 Độ ẩm đất (Soil Moisture)

  - ⚡ Độ dẫn điện (EC - Electrical Conductivity)```bash

  - 🧪 Độ pH (pH Value)# Node.js

  - 🟦 Nitơ (Nitrogen - N)npm install

  - 🟨 Lân (Phosphorus - P)

  - 🟥 Kali (Potassium - K)# Python (Flask)

  - 🧂 Độ mặn (Salinity)pip install flask flask-cors psycopg2-binary python-dotenv

  - 🌡️ Nhiệt độ không khí (Air Temperature)```

  - 💨 Độ ẩm không khí (Air Humidity)

  - 🌧️ Trạng thái mưa (Rain Status)### **2. Cấu hình `.env`:**

- **Thu thập dữ liệu tự động** từ ESP8266/ESP32```env

- **Lưu trữ PostgreSQL** với timestamp chính xácRPC_URL=https://rpc.zeroscan.org

- **Callback tự động** đến blockchain bridgePRIVATE_KEY=0x...

CONTRACT_ADDRESS=0x55313657185bd745917a7eD22fe9B827fC1AAC48

### 🤖 AI-Powered AnalyticsPGHOST=36.50.134.107

- **Crop Recommendation**: Khuyến nghị cây trồng phù hợp dựa trên điều kiện đấtPGPORT=6000

- **Soil Health Analysis**: Phân tích sức khỏe đất theo thang điểmPGDATABASE=db_iot_sensor

- **Anomaly Detection**: Phát hiện bất thường trong dữ liệuPGUSER=admin

- **Daily Insights**: Tổng hợp phân tích hàng ngày tự độngPGPASSWORD=admin123

- **Models**: Random Forest, XGBoost, Isolation ForestNODE_BRIDGE_URL=http://127.0.0.1:3000/bridgePending

````

### ⛓️ Blockchain Integration

- **Smart Contract**: SoilDataStore.sol trên Zero Network### **3. Chạy services:**

- **Immutable Storage**: Lưu trữ dữ liệu cảm biến và AI insights

- **Data Verification**: Sử dụng hash để xác minh tính toàn vẹn```bash

- **Transparent**: Truy xuất nguồn gốc dữ liệu công khai# Terminal 1: Flask API

python app_ingest.py

### 🎨 Modern Web DApp

- **Next.js 15** với TypeScript# Terminal 2: Node.js Bridge

- **Passkey Authentication** (WebAuthn) - đăng nhập không cần mật khẩunode server.js

- **WalletConnect** integration```

- **Responsive UI** với Tailwind CSS

- **Real-time Charts** với Chart.js---

- **AI Chat Assistant** powered by Gemini

## 📚 Tài liệu

---

- **[DEPLOYMENT_11_PARAMS.md](./DEPLOYMENT_11_PARAMS.md)** - Hướng dẫn deployment đầy đủ

## 🏗️ Kiến trúc hệ thống- **[migrations/003_upgrade_to_11_parameters.sql](./migrations/003_upgrade_to_11_parameters.sql)** - Database migration script

- **[test_11_params.json](./test_11_params.json)** - Test cases mẫu

````

┌─────────────────────────────────────────────────────────────────────────┐---

│ GAIA.VN ARCHITECTURE │

└─────────────────────────────────────────────────────────────────────────┘## 🧪 Testing

┌──────────────────┐```bash

│ IoT Devices │# Test Flask endpoint

│ ESP8266/ESP32 │curl -X POST http://36.50.134.107:5000/api/data \

│ + 7-in-1 Sensor │ -H "Content-Type: application/json" \

└────────┬─────────┘ -d '{

         │ HTTP POST (11 params)    "temperature": 24.5,

         │    "humidity": 45.2,

         ▼    "conductivity": 1250,

┌─────────────────────────────────────────────────────────────────────────┐ "ph": 6.8,

│ DATA INGESTION LAYER │ "nitrogen": 45,

├─────────────────────────────────────────────────────────────────────────┤ "phosphorus": 30,

│ Flask API (Port 5000) │ "potassium": 180,

│ - app_ingest.py: Validate & store sensor data │ "salt": 850,

│ - auth_routes.py: User authentication (bcrypt) │ "air_temperature": 27.1,

│ - dashboard_routes.py: Data queries │ "air_humidity": 65.0,

└────────┬────────────────────────────────────────────────────────────────┘ "is_raining": false,

         │    "timestamp": "2025-10-27T10:30:00Z"

         ▼  }'

┌─────────────────────────────────────────────────────────────────────────┐

│ DATABASE LAYER │# Kiểm tra data trên blockchain

├─────────────────────────────────────────────────────────────────────────┤curl http://localhost:3000/getData

│ PostgreSQL Database │```

│ - sensor_data: Raw sensor readings │

│ - daily_insights: AI aggregated analysis │---

│ - recommendations: AI recommendations │

│ - users: User management with passkey │## 📞 Support

└────┬───────────────────────────────────────┬────────────────────────────┘

     │                                       │GAIA.VN Team - Global Agro Intelligence Architecture

     │ Callback                              │ Query

     ▼                                       ▼

┌─────────────────────────────┐ ┌──────────────────────────────────────┐
│ BLOCKCHAIN BRIDGE │ │ AI SERVICE LAYER │
│ Node.js + ethers.js │ │ FastAPI (Port 8000) │
│ (Port 3000) │ │ - inference.py: Real-time ML │
│ │ │ - daily_aggregator.py: Batch job │
│ - Claim pending records │ │ - models_loader.py: ML models │
│ - Push to smart contract │ │ │
│ - Track onchain status │ │ Models: │
└────────┬────────────────────┘ │ - Crop Recommendation (RF) │
│ │ - Soil Health (XGB) │
▼ │ - Anomaly Detection (IF) │
┌─────────────────────────────┐ └──────────────────────────────────────┘
│ BLOCKCHAIN LAYER │
│ Zero Network │
│ Chain ID: 5080 │ ┌──────────────────────────┐
│ │ │ BACKEND API │
│ SoilDataStore.sol │◄───────────│ Node.js Express │
│ - storeSensorReading() │ │ (Port 4000) │
│ - storeDailyInsight() │ │ - User management │
│ - getRecordsByTimeRange() │ │ - Session handling │
│ - getDailyInsightCount() │ └──────────▲───────────────┘
└──────────────────────────────┘ │
│
┌──────────┴───────────────┐
│ FRONTEND DAPP │
│ Next.js 15 + TS │
│ (Port 3001) │
│ │
│ - Dashboard │
│ - Charts & Analytics │
│ - AI Chat Assistant │
│ - Passkey Auth │
│ - WalletConnect │
└──────────────────────────┘

```

### Data Flow

```

┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ IoT │───▶│ Flask │───▶│PostgreSQL│───▶│ Bridge │───▶│Blockchain│
│ Device │ │ API │ │ DB │ │ Node.js │ │ Zero │
└──────────┘ └──────────┘ └────┬─────┘ └──────────┘ └──────────┘
│
│
▼
┌──────────┐
│ AI │
│ Service │
└────┬─────┘
│
▼
┌──────────┐
│ Daily │
│ Insights │
└────┬─────┘
│
▼
┌──────────┐
│Blockchain│
│ Storage │
└──────────┘

````

---

## 🛠️ Công nghệ sử dụng

### Backend
- **Python 3.8+**
  - Flask 2.3.3 - Data ingestion API
  - FastAPI 0.104.1 - AI service
  - scikit-learn 1.3.2 - Machine Learning
  - psycopg2 - PostgreSQL driver

- **Node.js 18+**
  - Express 5.1.0 - Backend API
  - ethers.js 6.13.0 - Blockchain interaction
  - pg 8.12.0 - PostgreSQL driver

### Frontend
- **Next.js 15.1.2** - React framework
- **TypeScript 5** - Type safety
- **Tailwind CSS 3.4** - Styling
- **Chart.js 4.5** - Data visualization
- **@simplewebauthn/browser** - Passkey authentication
- **Gemini AI** - Chatbot assistant

### Blockchain
- **Solidity 0.8.20** - Smart contract language
- **Hardhat 2.26.3** - Development environment
- **Zero Network** - Blockchain platform (Chain ID: 5080)

### Database
- **PostgreSQL 13+** - Primary database

### IoT
- **ESP8266/ESP32** - Microcontroller
- **7-in-1 Soil Sensor** - Data collection

---

## 💻 Yêu cầu hệ thống

### Phần cứng
- **ESP8266/ESP32** với 7-in-1 soil sensor
- **Server** (VPS/Cloud):
  - RAM: 4GB+
  - CPU: 2 cores+
  - Storage: 20GB+
  - OS: Ubuntu 20.04+ / Windows 10+

### Phần mềm
- **Node.js** >= 18.0.0
- **Python** >= 3.8
- **PostgreSQL** >= 13
- **Git**
- **npm** hoặc **yarn**
- **pip** (Python package manager)

---

## 📥 Hướng dẫn cài đặt

### 1. Clone repository

```bash
git clone https://github.com/minhe51805/Pione_AIBlockchainIoT-WAGTeam.git
cd Pione_AIBlockchainIoT-WAGTeam
````

### 2. Cài đặt Database

```bash
# Khởi tạo PostgreSQL database
psql -U postgres

# Tạo database
CREATE DATABASE db_iot_sensor;

# Import schema
psql -U postgres -d db_iot_sensor < db.sql

# Chạy migrations
psql -U postgres -d db_iot_sensor < migrations/008_add_users_table.sql
psql -U postgres -d db_iot_sensor < migrations/009_add_pin_hash_column.sql
psql -U postgres -d db_iot_sensor < migrations/010_fix_nullable_passkey.sql
```

### 3. Cài đặt Backend Services

#### a. Flask Data Ingestion API

```bash
# Cài đặt Python dependencies
pip install -r requirements.txt

# Tạo .env file
cp .env.example .env

# Chỉnh sửa .env với thông tin database của bạn
# PGHOST=localhost
# PGPORT=5432
# PGDATABASE=db_iot_sensor
# PGUSER=postgres
# PGPASSWORD=your_password
```

#### b. AI Service (FastAPI)

```bash
cd ai/ai_service

# Cài đặt dependencies
pip install -r requirements.txt

# Tạo config.env
cp config.env.example config.env

# Chỉnh sửa config với thông tin database
```

#### c. Blockchain Bridge (Node.js)

```bash
# Cài đặt dependencies
npm install

# Tạo .env với private key và contract address
# RPC_URL=https://rpc.zeroscan.org
# PRIVATE_KEY=0x...
# CONTRACT_ADDRESS=0x...
```

#### d. Backend API (Express)

```bash
cd Dapp/backend

# Cài đặt dependencies
npm install

# Tạo .env
cp .env.example .env

# Chỉnh sửa database connection
```

### 4. Cài đặt Frontend DApp

```bash
cd Dapp/frontend

# Cài đặt dependencies
npm install

# Tạo .env.local
cp env.local.example .env.local

# Chỉnh sửa environment variables
# NEXT_PUBLIC_API_URL=http://localhost:4000
# NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
# NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

### 5. Deploy Smart Contract (Nếu cần)

```bash
cd blockchain

# Cài đặt Hardhat dependencies
npm install

# Compile contract
npx hardhat compile

# Deploy to Zero Network
npx hardhat run scripts/deploy.js --network zero
```

---

## ⚙️ Cấu hình

### Environment Variables

#### Root `.env`

```env
# Database
PGHOST=localhost
PGPORT=5432
PGDATABASE=db_iot_sensor
PGUSER=postgres
PGPASSWORD=your_password

# Blockchain Bridge
NODE_BRIDGE_URL=http://127.0.0.1:3000/bridgePending
```

#### `blockchain/.env` (hoặc root cho bridge)

```env
RPC_URL=https://rpc.zeroscan.org
PRIVATE_KEY=0x1234567890abcdef...
CONTRACT_ADDRESS=0x55313657185bd745917a7eD22fe9B827fC1AAC48
```

#### `ai/ai_service/config.env`

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=db_iot_sensor
DB_USER=postgres
DB_PASSWORD=your_password
```

#### `Dapp/backend/.env`

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=db_iot_sensor
DB_USER=postgres
DB_PASSWORD=your_password
PORT=4000
```

#### `Dapp/frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSy...
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=513950...
NEXT_PUBLIC_CONTRACT_ADDRESS=0x55313657185bd745917a7eD22fe9B827fC1AAC48
NEXT_PUBLIC_RPC_URL=https://rpc.zeroscan.org
NEXT_PUBLIC_CHAIN_ID=5080
```

---

## 🎮 Hướng dẫn sử dụng

### Khởi động hệ thống

#### 1. Khởi động Flask API (Data Ingestion)

```bash
python app_ingest.py
# Running on http://localhost:5000
```

#### 2. Khởi động Blockchain Bridge

```bash
node server.js
# Server running on port 3000
```

#### 3. Khởi động AI Service

```bash
cd ai/ai_service
uvicorn main:app --reload --port 8000
# Running on http://localhost:8000
```

#### 4. Khởi động Backend API

```bash
cd Dapp/backend
npm start
# Server running on port 4000
```

#### 5. Khởi động Frontend DApp

```bash
cd Dapp/frontend
npm run dev
# Running on http://localhost:3001
```

### Gửi dữ liệu từ ESP8266/ESP32

```cpp
// Arduino code snippet
#include <ESP8266HTTPClient.h>

String serverUrl = "http://your-server-ip:5000/api/data";

void sendSensorData() {
  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");

  String payload = "{\"temperature\":" + String(soilTemp) +
                   ",\"humidity\":" + String(soilMoisture) +
                   ",\"conductivity\":" + String(ec) +
                   ",\"ph\":" + String(ph) +
                   ",\"nitrogen\":" + String(n) +
                   ",\"phosphorus\":" + String(p) +
                   ",\"potassium\":" + String(k) +
                   ",\"salt\":" + String(salinity) +
                   ",\"air_temperature\":" + String(airTemp) +
                   ",\"air_humidity\":" + String(airHumidity) +
                   ",\"is_raining\":" + String(isRaining) +
                   ",\"timestamp\":\"" + getTimestamp() + "\"}";

  int httpCode = http.POST(payload);
  http.end();
}
```

### Truy cập Dashboard

1. Mở browser: `http://localhost:3001`
2. Đăng ký tài khoản với **Passkey** (không cần mật khẩu)
3. Xem dashboard với biểu đồ và phân tích
4. Chat với AI assistant về dữ liệu nông nghiệp

---

## 📡 API Documentation

### Flask Data Ingestion API (Port 5000)

#### POST `/api/data` - Gửi dữ liệu cảm biến

```json
{
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
  "is_raining": false,
  "timestamp": "2025-11-10T10:30:00Z"
}
```

**Response:**

```json
{
  "success": true,
  "id": 123,
  "message": "Data stored successfully"
}
```

#### GET `/api/dashboard/latest` - Lấy dữ liệu mới nhất

**Response:**

```json
{
  "id": 123,
  "temperature": 24.5,
  "humidity": 45.2,
  "measured_at": "2025-11-10T10:30:00Z",
  ...
}
```

### AI Service API (Port 8000)

#### POST `/predict/crop` - Dự đoán cây trồng phù hợp

```json
{
  "N": 45,
  "P": 30,
  "K": 180,
  "temperature": 27.1,
  "humidity": 65.0,
  "ph": 6.8,
  "rainfall": 0
}
```

**Response:**

```json
{
  "crop": "coffee",
  "confidence": 0.985,
  "alternatives": ["rice", "banana"]
}
```

#### POST `/predict/soil-health` - Phân tích sức khỏe đất

**Response:**

```json
{
  "score": 88.3,
  "rating": "GOOD",
  "factors": {
    "ph_status": "optimal",
    "nutrients_balance": "good",
    "moisture_level": "adequate"
  }
}
```

### Blockchain Bridge API (Port 3000)

#### GET `/getData` - Lấy dữ liệu từ blockchain

**Response:**

```json
{
  "count": 1234,
  "latest": {
    "id": 123,
    "soilTemperature": 245,
    "soilMoisture": 452,
    "dataHash": "0x...",
    "reporter": "0x..."
  }
}
```

#### POST `/bridgePending` - Push dữ liệu pending lên blockchain

**Response:**

```json
{
  "success": true,
  "pushed": 5,
  "txHash": "0x..."
}
```

### Backend API (Port 4000)

#### POST `/api/auth/register` - Đăng ký người dùng

```json
{
  "username": "farmer01",
  "email": "farmer@example.com",
  "passkey_credential": {...}
}
```

#### GET `/api/users/:id` - Lấy thông tin user

**Response:**

```json
{
  "id": 1,
  "username": "farmer01",
  "email": "farmer@example.com",
  "created_at": "2025-11-10T10:00:00Z"
}
```

---

## 🔗 Smart Contract

### SoilDataStore.sol

Deployed on **Zero Network** (Chain ID: 5080)

**Contract Address:** `0x55313657185bd745917a7eD22fe9B827fC1AAC48`

**Explorer:** https://zeroscan.org/address/0x55313657185bd745917a7eD22fe9B827fC1AAC48

### Main Functions

#### Store Sensor Reading

```solidity
function storeSensorReading(
    uint256 _id,
    uint256 _measuredAtVN,
    uint256 _soilTemperature,  // × 10
    uint256 _soilMoisture,     // × 10
    uint256 _conductivity,
    uint256 _phValue,          // × 10
    uint256 _nitrogen,
    uint256 _phosphorus,
    uint256 _potassium,
    uint256 _salt,
    uint256 _airTemperature,   // × 10
    uint256 _airHumidity,      // × 10
    bool _isRaining,
    bytes32 _dataHash
) public
```

#### Store Daily AI Insight

```solidity
function storeDailyInsight(
    uint256 _id,
    uint256 _dateTimestamp,
    uint256 _sampleCount,
    string memory _recommendedCrop,
    uint256 _confidence,       // × 100
    uint256 _soilHealthScore,  // × 10
    uint8 _healthRating,       // 0-3
    bool _isAnomalyDetected,
    string memory _recommendations,
    bytes32 _recordHash
) public
```

#### Query Functions

```solidity
function getCount() public view returns (uint256)
function getRecord(uint256 id) public view returns (SoilData memory)
function getRecordsByTimeRange(uint256 start, uint256 end) public view returns (SoilData[] memory)
function getDailyInsightCount() public view returns (uint256)
function getLatestDailyInsight() public view returns (DailyInsight memory)
```

---

## 📂 Cấu trúc thư mục

```
Pione_AIBlockchainIoT-WAGTeam/
│
├── ai/                          # AI Module
│   ├── ai_module/              # Training pipeline
│   │   ├── prepare_ml_data.py  # Data preparation
│   │   ├── retrain_models.py   # Model training
│   │   ├── soil_training.ipynb # Jupyter notebook
│   │   ├── data/               # Training datasets
│   │   └── models/             # Saved ML models
│   │
│   ├── ai_service/             # AI Inference Service (FastAPI)
│   │   ├── main.py             # FastAPI app
│   │   ├── inference.py        # Prediction endpoints
│   │   ├── models_loader.py    # Load ML models
│   │   ├── daily_aggregator.py # Daily batch processing
│   │   ├── schemas.py          # Pydantic models
│   │   ├── config.env.example
│   │   └── requirements.txt
│   │
│   └── dataset/                # Raw datasets
│       ├── Crop_recommendation.csv
│       └── augmented_soil_data_11_params.csv
│
├── blockchain/                  # Blockchain Module
│   ├── contracts/
│   │   └── SoilDataStore.sol   # Smart contract
│   ├── scripts/
│   │   └── deploy.js           # Deployment script
│   ├── hardhat.config.cjs      # Hardhat configuration
│   └── artifacts/              # Compiled contracts
│
├── Dapp/                        # Decentralized Application
│   ├── frontend/               # Next.js Frontend
│   │   ├── src/
│   │   │   ├── app/            # App router
│   │   │   ├── components/     # React components
│   │   │   ├── context/        # Context providers
│   │   │   ├── lib/            # Utilities
│   │   │   └── services/       # API services
│   │   ├── package.json
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   └── env.local.example
│   │
│   └── backend/                # Node.js Backend API
│       ├── routes/
│       │   └── auth.js         # Authentication routes
│       ├── server.js           # Express server
│       ├── db.js               # Database connection
│       ├── package.json
│       └── .env.example
│
├── migrations/                  # Database migrations
│   ├── 008_add_users_table.sql
│   ├── 009_add_pin_hash_column.sql
│   └── 010_fix_nullable_passkey.sql
│
├── app_ingest.py               # Flask data ingestion API
├── auth_routes.py              # Authentication routes
├── dashboard_routes.py         # Dashboard data routes
├── server.js                   # Blockchain bridge (Node.js)
├── esp8266_LTMMT.ino          # Arduino IoT code
├── db.sql                      # Database schema
├── requirements.txt            # Python dependencies (root)
├── package.json                # Node.js dependencies (root)
├── .gitignore
├── .env.example
└── README.md
```

---

## 🧪 Testing

### Test Data Ingestion

```bash
curl -X POST http://localhost:5000/api/data \
  -H "Content-Type: application/json" \
  -d @test_data.json
```

### Test AI Prediction

```bash
curl -X POST http://localhost:8000/predict/crop \
  -H "Content-Type: application/json" \
  -d '{
    "N": 45, "P": 30, "K": 180,
    "temperature": 27.1, "humidity": 65.0,
    "ph": 6.8, "rainfall": 0
  }'
```

### Test Blockchain Query

```bash
curl http://localhost:3000/getData
```

### Run Unit Tests

```bash
# Python tests
pytest tests/

# JavaScript tests
npm test
```

---

## 🔐 Bảo mật

### Passkey Authentication

- Sử dụng **WebAuthn** standard
- Không cần mật khẩu
- Xác thực sinh trắc học (vân tay, Face ID)
- Chống phishing và replay attacks

### Blockchain Security

- Dữ liệu **immutable** trên blockchain
- Hash verification để đảm bảo tính toàn vẹn
- Public ledger cho tính minh bạch

### Best Practices

- ⚠️ **KHÔNG COMMIT** file `.env` lên Git
- 🔑 Sử dụng `.env.example` làm template
- 🔄 Thay đổi private key sau khi test
- 🔒 Regenerate tất cả API keys trước production

---

## 🚨 Troubleshooting

### Database Connection Error

```bash
# Kiểm tra PostgreSQL service
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Port Already in Use

```bash
# Find process using port
lsof -i :5000  # hoặc port khác

# Kill process
kill -9 <PID>
```

### Smart Contract Deployment Failed

```bash
# Kiểm tra balance ví
# Đảm bảo có đủ gas fee trên Zero Network

# Verify RPC endpoint
curl https://rpc.zeroscan.org
```

---

## 🤝 Đóng góp

Chúng tôi hoan nghênh mọi đóng góp! Để contribute:

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

### Coding Standards

- Python: Follow PEP 8
- JavaScript/TypeScript: Follow ESLint config
- Commit messages: Conventional Commits format

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📞 Liên hệ

**GAIA.VN Team** - Global Agro Intelligence Architecture – Vietnam

- 📧 Email: contact@gaia.vn
- 🌐 Website: https://gaia.vn
- 📱 GitHub: [@minhe51805](https://github.com/minhe51805)

**Project Link:** [https://github.com/minhe51805/Pione_AIBlockchainIoT-WAGTeam](https://github.com/minhe51805/Pione_AIBlockchainIoT-WAGTeam)

---

## 🙏 Acknowledgments

- [Zero Network](https://zeroscan.org) - Blockchain platform
- [Hardhat](https://hardhat.org) - Ethereum development environment
- [Next.js](https://nextjs.org) - React framework
- [FastAPI](https://fastapi.tiangolo.com) - Python web framework
- [scikit-learn](https://scikit-learn.org) - Machine learning library
- [Gemini AI](https://ai.google.dev) - AI chat assistant

---

<div align="center">

**Made with ❤️ by GAIA.VN Team**

⭐ Star us on GitHub nếu project này hữu ích!

</div>
