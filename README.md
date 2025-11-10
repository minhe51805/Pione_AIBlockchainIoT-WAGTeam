# 🌱 AgroTwin - AI-Powered Blockchain IoT for Smart Agriculture# 🌱 AgroTwin - AI-Powered Blockchain IoT for Smart Agriculture<<<<<<< HEAD



<div align="center"># Pione_AIBlockchainIoT-WAGTeam



![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)<div align="center">Pione_AIBlockchainIoT-WAGTeam links an ESP32 and 7-in-1 soil sensor to a backend that cleans and standardizes data, then splits: (1) curated datasets train ML models for irrigation, nutrition, and health forecasts; (2) the same records are hashed and anchored on Pione’s blockchain. APIs and a dashboard deliver live metrics and provenance checks v2.

![License](https://img.shields.io/badge/license-MIT-green.svg)

![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)=======

![Python](https://img.shields.io/badge/python-%3E%3D3.8-blue.svg)

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)# 🌱 Pione AI-Blockchain-IoT (WAG Team)

**Hệ thống giám sát nông nghiệp thông minh kết hợp IoT, AI và Blockchain**

![License](https://img.shields.io/badge/license-MIT-green.svg)

[Tính năng](#-tính-năng-chính) • [Kiến trúc](#-kiến-trúc-hệ-thống) • [Cài đặt](#-hướng-dẫn-cài-đặt) • [Sử dụng](#-hướng-dẫn-sử-dụng) • [API](#-api-documentation)

![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)## 📊 Hệ thống IoT → Database → Blockchain cho Nông nghiệp Thông minh

</div>

![Python](https://img.shields.io/badge/python-%3E%3D3.8-blue.svg)

---

### **Tính năng chính:**

## 📋 Mục lục

**Hệ thống giám sát nông nghiệp thông minh kết hợp IoT, AI và Blockchain**- ✅ Thu thập **11 thông số** từ cảm biến đất & khí tượng

- [Giới thiệu](#-giới-thiệu)

- [Tính năng chính](#-tính-năng-chính)- ✅ Lưu trữ bất biến trên blockchain **Zeroscan**

- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)

- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)[Tính năng](#-tính-năng-chính) • [Kiến trúc](#-kiến-trúc-hệ-thống) • [Cài đặt](#-hướng-dẫn-cài-đặt) • [Sử dụng](#-hướng-dẫn-sử-dụng) • [API](#-api-documentation)- ✅ Pipeline tự động: IoT → DB → Blockchain

- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)

- [Hướng dẫn cài đặt](#-hướng-dẫn-cài-đặt)- ✅ Sẵn sàng cho AI analysis & recommendations

- [Cấu hình](#-cấu-hình)

- [Hướng dẫn sử dụng](#-hướng-dẫn-sử-dụng)</div>

- [API Documentation](#-api-documentation)

- [Smart Contract](#-smart-contract)---

- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)

- [Đóng góp](#-đóng-góp)---

- [License](#-license)

- [Liên hệ](#-liên-hệ)## 🔧 Kiến trúc hệ thống



---## 📋 Mục lục



## 🎯 Giới thiệu```



**AgroTwin** là một hệ thống giám sát nông nghiệp thông minh toàn diện, kết hợp công nghệ IoT, AI và Blockchain để cung cấp giải pháp quản lý đất đai và cây trồng hiệu quả cho nông dân.- [Giới thiệu](#-giới-thiệu)IoT Device (ESP8266/ESP32)



### Vấn đề giải quyết:- [Tính năng chính](#-tính-năng-chính)   │ POST 11 thông số

- 🌾 Quản lý chất lượng đất chưa khoa học

- 💧 Tưới tiêu không tối ưu, lãng phí nước- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)   ↓

- 🌡️ Thiếu dữ liệu thời tiết thời gian thực

- 🔬 Không có khuyến nghị khoa học về bón phân- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)Flask API (app_ingest.py) - Port 5000

- 🔒 Dữ liệu nông nghiệp thiếu tính minh bạch và bảo mật

- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)   │ Validate & lưu PostgreSQL

### Giải pháp:

- ✅ Thu thập 11 thông số đất và khí tượng tự động- [Hướng dẫn cài đặt](#-hướng-dẫn-cài-đặt)   │ Callback Node.js bridge

- ✅ Phân tích AI cho khuyến nghị cây trồng phù hợp

- ✅ Lưu trữ dữ liệu bất biến trên blockchain- [Cấu hình](#-cấu-hình)   ↓

- ✅ Dashboard trực quan với biểu đồ và cảnh báo

- ✅ Xác thực passkey an toàn- [Hướng dẫn sử dụng](#-hướng-dẫn-sử-dụng)PostgreSQL (36.50.134.107:6000)



---- [API Documentation](#-api-documentation)   │ Queue pending records



## 🚀 Tính năng chính- [Smart Contract](#-smart-contract)   ↓



### 🌐 IoT Data Collection- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)Node.js Bridge (server.js) - Port 3000

- **11 thông số cảm biến**:

  - 🌡️ Nhiệt độ đất (Soil Temperature)- [Đóng góp](#-đóng-góp)   │ Claim & đẩy lên blockchain

  - 💧 Độ ẩm đất (Soil Moisture)

  - ⚡ Độ dẫn điện (EC - Electrical Conductivity)- [License](#-license)   ↓

  - 🧪 Độ pH (pH Value)

  - 🟦 Nitơ (Nitrogen - N)- [Liên hệ](#-liên-hệ)Smart Contract (SoilDataStore.sol)

  - 🟨 Lân (Phosphorus - P)

  - 🟥 Kali (Potassium - K)   │ Lưu vĩnh viễn trên Zeroscan

  - 🧂 Độ mặn (Salinity)

  - 🌡️ Nhiệt độ không khí (Air Temperature)---   └─→ https://zeroscan.org

  - 💨 Độ ẩm không khí (Air Humidity)

  - 🌧️ Trạng thái mưa (Rain Status)```



- **Thu thập dữ liệu tự động** từ ESP8266/ESP32## 🎯 Giới thiệu

- **Lưu trữ PostgreSQL** với timestamp chính xác

- **Callback tự động** đến blockchain bridge---



### 🤖 AI-Powered Analytics**AgroTwin** là một hệ thống giám sát nông nghiệp thông minh toàn diện, kết hợp công nghệ IoT, AI và Blockchain để cung cấp giải pháp quản lý đất đai và cây trồng hiệu quả cho nông dân.

- **Crop Recommendation**: Khuyến nghị cây trồng phù hợp dựa trên điều kiện đất

- **Soil Health Analysis**: Phân tích sức khỏe đất theo thang điểm## 📦 11 Thông số thu thập

- **Anomaly Detection**: Phát hiện bất thường trong dữ liệu

- **Daily Insights**: Tổng hợp phân tích hàng ngày tự động### Vấn đề giải quyết:

- **Models**: Random Forest, XGBoost, Isolation Forest

- 🌾 Quản lý chất lượng đất chưa khoa học### **Soil Indicators (8):**

### ⛓️ Blockchain Integration

- **Smart Contract**: SoilDataStore.sol trên Zero Network- 💧 Tưới tiêu không tối ưu, lãng phí nước1. Soil Temperature (°C)

- **Immutable Storage**: Lưu trữ dữ liệu cảm biến và AI insights

- **Data Verification**: Sử dụng hash để xác minh tính toàn vẹn- 🌡️ Thiếu dữ liệu thời tiết thời gian thực2. Soil Moisture (%)

- **Transparent**: Truy xuất nguồn gốc dữ liệu công khai

- 🔬 Không có khuyến nghị khoa học về bón phân3. Electrical Conductivity (µS/cm)

### 🎨 Modern Web DApp

- **Next.js 15** với TypeScript- 🔒 Dữ liệu nông nghiệp thiếu tính minh bạch và bảo mật4. pH

- **Passkey Authentication** (WebAuthn) - đăng nhập không cần mật khẩu

- **WalletConnect** integration5. Nitrogen (mg/kg)

- **Responsive UI** với Tailwind CSS

- **Real-time Charts** với Chart.js### Giải pháp:6. Phosphorus (mg/kg)

- **AI Chat Assistant** powered by Gemini

- ✅ Thu thập 11 thông số đất và khí tượng tự động7. Potassium (mg/kg)

---

- ✅ Phân tích AI cho khuyến nghị cây trồng phù hợp8. Salinity (mg/L)

## 🏗️ Kiến trúc hệ thống

- ✅ Lưu trữ dữ liệu bất biến trên blockchain

```

┌─────────────────────────────────────────────────────────────────────────┐- ✅ Dashboard trực quan với biểu đồ và cảnh báo### **Air/Weather Indicators (3):**

│                         AGROTWIN ARCHITECTURE                            │

└─────────────────────────────────────────────────────────────────────────┘- ✅ Xác thực passkey an toàn9. Air Temperature (°C)



┌──────────────────┐10. Air Humidity (%)

│   IoT Devices    │

│  ESP8266/ESP32   │---11. Rain Status (boolean)

│  + 7-in-1 Sensor │

└────────┬─────────┘## 🚀 Tính năng chính---

         │ HTTP POST (11 params)

         │### 🌐 IoT Data Collection## 🚀 Quick Start

         ▼

┌─────────────────────────────────────────────────────────────────────────┐- **11 thông số cảm biến**:

│                            DATA INGESTION LAYER                          │

├─────────────────────────────────────────────────────────────────────────┤  - 🌡️ Nhiệt độ đất (Soil Temperature)### **1. Cài đặt dependencies:**

│  Flask API (Port 5000)                                                   │

│  - app_ingest.py: Validate & store sensor data                          │  - 💧 Độ ẩm đất (Soil Moisture)

│  - auth_routes.py: User authentication (bcrypt)                         │

│  - dashboard_routes.py: Data queries                                     │  - ⚡ Độ dẫn điện (EC - Electrical Conductivity)```bash

└────────┬────────────────────────────────────────────────────────────────┘

         │  - 🧪 Độ pH (pH Value)# Node.js

         ▼

┌─────────────────────────────────────────────────────────────────────────┐  - 🟦 Nitơ (Nitrogen - N)npm install

│                          DATABASE LAYER                                  │

├─────────────────────────────────────────────────────────────────────────┤  - 🟨 Lân (Phosphorus - P)

│  PostgreSQL Database                                                     │

│  - sensor_data: Raw sensor readings                                     │  - 🟥 Kali (Potassium - K)# Python (Flask)

│  - daily_insights: AI aggregated analysis                               │

│  - recommendations: AI recommendations                                   │  - 🧂 Độ mặn (Salinity)pip install flask flask-cors psycopg2-binary python-dotenv

│  - users: User management with passkey                                   │

└────┬───────────────────────────────────────┬────────────────────────────┘  - 🌡️ Nhiệt độ không khí (Air Temperature)```

     │                                       │

     │ Callback                              │ Query  - 💨 Độ ẩm không khí (Air Humidity)

     ▼                                       ▼

┌─────────────────────────────┐   ┌──────────────────────────────────────┐  - 🌧️ Trạng thái mưa (Rain Status)### **2. Cấu hình `.env`:**

│   BLOCKCHAIN BRIDGE          │   │        AI SERVICE LAYER               │

│   Node.js + ethers.js        │   │   FastAPI (Port 8000)                │- **Thu thập dữ liệu tự động** từ ESP8266/ESP32```env

│   (Port 3000)                │   │   - inference.py: Real-time ML       │

│                              │   │   - daily_aggregator.py: Batch job   │- **Lưu trữ PostgreSQL** với timestamp chính xácRPC_URL=https://rpc.zeroscan.org

│   - Claim pending records    │   │   - models_loader.py: ML models      │

│   - Push to smart contract   │   │                                      │- **Callback tự động** đến blockchain bridgePRIVATE_KEY=0x...

│   - Track onchain status     │   │   Models:                            │

└────────┬────────────────────┘   │   - Crop Recommendation (RF)         │CONTRACT_ADDRESS=0x55313657185bd745917a7eD22fe9B827fC1AAC48

         │                         │   - Soil Health (XGB)                │

         ▼                         │   - Anomaly Detection (IF)           │### 🤖 AI-Powered AnalyticsPGHOST=36.50.134.107

┌─────────────────────────────┐   └──────────────────────────────────────┘

│   BLOCKCHAIN LAYER           │- **Crop Recommendation**: Khuyến nghị cây trồng phù hợp dựa trên điều kiện đấtPGPORT=6000

│   Zero Network               │

│   Chain ID: 5080             │            ┌──────────────────────────┐- **Soil Health Analysis**: Phân tích sức khỏe đất theo thang điểmPGDATABASE=db_iot_sensor

│                              │            │   BACKEND API            │

│   SoilDataStore.sol          │◄───────────│   Node.js Express        │- **Anomaly Detection**: Phát hiện bất thường trong dữ liệuPGUSER=admin

│   - storeSensorReading()     │            │   (Port 4000)            │

│   - storeDailyInsight()      │            │   - User management      │- **Daily Insights**: Tổng hợp phân tích hàng ngày tự độngPGPASSWORD=admin123

│   - getRecordsByTimeRange()  │            │   - Session handling     │

│   - getDailyInsightCount()   │            └──────────▲───────────────┘- **Models**: Random Forest, XGBoost, Isolation ForestNODE_BRIDGE_URL=http://127.0.0.1:3000/bridgePending

└──────────────────────────────┘                       │

                                                       │````

                                            ┌──────────┴───────────────┐

                                            │   FRONTEND DAPP          │### ⛓️ Blockchain Integration

                                            │   Next.js 15 + TS        │

                                            │   (Port 3001)            │- **Smart Contract**: SoilDataStore.sol trên Zero Network### **3. Chạy services:**

                                            │                          │

                                            │   - Dashboard            │- **Immutable Storage**: Lưu trữ dữ liệu cảm biến và AI insights

                                            │   - Charts & Analytics   │

                                            │   - AI Chat Assistant    │- **Data Verification**: Sử dụng hash để xác minh tính toàn vẹn```bash

                                            │   - Passkey Auth         │

                                            │   - WalletConnect        │- **Transparent**: Truy xuất nguồn gốc dữ liệu công khai# Terminal 1: Flask API

                                            └──────────────────────────┘

```python app_ingest.py



### Data Flow### 🎨 Modern Web DApp



```- **Next.js 15** với TypeScript# Terminal 2: Node.js Bridge

┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐

│   IoT    │───▶│  Flask   │───▶│PostgreSQL│───▶│  Bridge  │───▶│Blockchain│- **Passkey Authentication** (WebAuthn) - đăng nhập không cần mật khẩunode server.js

│  Device  │    │   API    │    │    DB    │    │ Node.js  │    │  Zero    │

└──────────┘    └──────────┘    └────┬─────┘    └──────────┘    └──────────┘- **WalletConnect** integration```

                                     │

                                     │- **Responsive UI** với Tailwind CSS

                                     ▼

                              ┌──────────┐- **Real-time Charts** với Chart.js---

                              │    AI    │

                              │  Service │- **AI Chat Assistant** powered by Gemini

                              └────┬─────┘

                                   │## 📚 Tài liệu

                                   ▼

                              ┌──────────┐---

                              │  Daily   │

                              │ Insights │- **[DEPLOYMENT_11_PARAMS.md](./DEPLOYMENT_11_PARAMS.md)** - Hướng dẫn deployment đầy đủ

                              └────┬─────┘

                                   │## 🏗️ Kiến trúc hệ thống- **[migrations/003_upgrade_to_11_parameters.sql](./migrations/003_upgrade_to_11_parameters.sql)** - Database migration script

                                   ▼

                              ┌──────────┐- **[test_11_params.json](./test_11_params.json)** - Test cases mẫu

                              │Blockchain│

                              │  Storage │````

                              └──────────┘

```┌─────────────────────────────────────────────────────────────────────────┐---



---│ AGROTWIN ARCHITECTURE │



## 🛠️ Công nghệ sử dụng└─────────────────────────────────────────────────────────────────────────┘## 🧪 Testing



### Backend┌──────────────────┐```bash

- **Python 3.8+**

  - Flask 2.3.3 - Data ingestion API│ IoT Devices │# Test Flask endpoint

  - FastAPI 0.104.1 - AI service

  - scikit-learn 1.3.2 - Machine Learning│ ESP8266/ESP32 │curl -X POST http://36.50.134.107:5000/api/data \

  - psycopg2 - PostgreSQL driver

  │ + 7-in-1 Sensor │ -H "Content-Type: application/json" \

- **Node.js 18+**

  - Express 5.1.0 - Backend API└────────┬─────────┘ -d '{

  - ethers.js 6.13.0 - Blockchain interaction

  - pg 8.12.0 - PostgreSQL driver         │ HTTP POST (11 params)    "temperature": 24.5,



### Frontend         │    "humidity": 45.2,

- **Next.js 15.1.2** - React framework

- **TypeScript 5** - Type safety         ▼    "conductivity": 1250,

- **Tailwind CSS 3.4** - Styling

- **Chart.js 4.5** - Data visualization┌─────────────────────────────────────────────────────────────────────────┐ "ph": 6.8,

- **@simplewebauthn/browser** - Passkey authentication

- **Gemini AI** - Chatbot assistant│ DATA INGESTION LAYER │ "nitrogen": 45,



### Blockchain├─────────────────────────────────────────────────────────────────────────┤ "phosphorus": 30,

- **Solidity 0.8.20** - Smart contract language

- **Hardhat 2.26.3** - Development environment│ Flask API (Port 5000) │ "potassium": 180,

- **Zero Network** - Blockchain platform (Chain ID: 5080)

│ - app_ingest.py: Validate & store sensor data │ "salt": 850,

### Database

- **PostgreSQL 13+** - Primary database│ - auth_routes.py: User authentication (bcrypt) │ "air_temperature": 27.1,



### IoT│ - dashboard_routes.py: Data queries │ "air_humidity": 65.0,

- **ESP8266/ESP32** - Microcontroller

- **7-in-1 Soil Sensor** - Data collection└────────┬────────────────────────────────────────────────────────────────┘ "is_raining": false,



---         │    "timestamp": "2025-10-27T10:30:00Z"



## 💻 Yêu cầu hệ thống         ▼  }'



### Phần cứng┌─────────────────────────────────────────────────────────────────────────┐

- **ESP8266/ESP32** với 7-in-1 soil sensor

- **Server** (VPS/Cloud):│ DATABASE LAYER │# Kiểm tra data trên blockchain

  - RAM: 4GB+

  - CPU: 2 cores+├─────────────────────────────────────────────────────────────────────────┤curl http://localhost:3000/getData

  - Storage: 20GB+

  - OS: Ubuntu 20.04+ / Windows 10+│ PostgreSQL Database │```



### Phần mềm│ - sensor_data: Raw sensor readings │

- **Node.js** >= 18.0.0

- **Python** >= 3.8│ - daily_insights: AI aggregated analysis │---

- **PostgreSQL** >= 13

- **Git**│ - recommendations: AI recommendations │

- **npm** hoặc **yarn**

- **pip** (Python package manager)│ - users: User management with passkey │## 📞 Support



---└────┬───────────────────────────────────────┬────────────────────────────┘



## 📥 Hướng dẫn cài đặt     │                                       │WAG Team - Pione AI-Blockchain-IoT Project



### 1. Clone repository     │ Callback                              │ Query>>>>>>> origin/newapp



```bash     ▼                                       ▼

git clone https://github.com/minhe51805/Pione_AIBlockchainIoT-WAGTeam.git

cd Pione_AIBlockchainIoT-WAGTeam┌─────────────────────────────┐ ┌──────────────────────────────────────┐

```│ BLOCKCHAIN BRIDGE │ │ AI SERVICE LAYER │

│ Node.js + ethers.js │ │ FastAPI (Port 8000) │

### 2. Cài đặt Database│ (Port 3000) │ │ - inference.py: Real-time ML │

│ │ │ - daily_aggregator.py: Batch job │

```bash│ - Claim pending records │ │ - models_loader.py: ML models │

# Khởi tạo PostgreSQL database│ - Push to smart contract │ │ │

psql -U postgres│ - Track onchain status │ │ Models: │

└────────┬────────────────────┘ │ - Crop Recommendation (RF) │

# Tạo database│ │ - Soil Health (XGB) │

CREATE DATABASE db_iot_sensor;▼ │ - Anomaly Detection (IF) │

┌─────────────────────────────┐ └──────────────────────────────────────┘

# Import schema│ BLOCKCHAIN LAYER │

psql -U postgres -d db_iot_sensor < db.sql│ Zero Network │

│ Chain ID: 5080 │ ┌──────────────────────────┐

# Chạy migrations│ │ │ BACKEND API │

psql -U postgres -d db_iot_sensor < migrations/008_add_users_table.sql│ SoilDataStore.sol │◄───────────│ Node.js Express │

psql -U postgres -d db_iot_sensor < migrations/009_add_pin_hash_column.sql│ - storeSensorReading() │ │ (Port 4000) │

psql -U postgres -d db_iot_sensor < migrations/010_fix_nullable_passkey.sql│ - storeDailyInsight() │ │ - User management │

```│ - getRecordsByTimeRange() │ │ - Session handling │

│ - getDailyInsightCount() │ └──────────▲───────────────┘

### 3. Cài đặt Backend Services└──────────────────────────────┘ │

│

#### a. Flask Data Ingestion API┌──────────┴───────────────┐

│ FRONTEND DAPP │

```bash│ Next.js 15 + TS │

# Cài đặt Python dependencies│ (Port 3001) │

pip install -r requirements.txt│ │

│ - Dashboard │

# Tạo .env file│ - Charts & Analytics │

cp .env.example .env│ - AI Chat Assistant │

│ - Passkey Auth │

# Chỉnh sửa .env với thông tin database của bạn│ - WalletConnect │

# PGHOST=localhost└──────────────────────────┘

# PGPORT=5432

# PGDATABASE=db_iot_sensor```

# PGUSER=postgres

# PGPASSWORD=your_password### Data Flow

```

```

#### b. AI Service (FastAPI)

┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐

```bash│ IoT │───▶│ Flask │───▶│PostgreSQL│───▶│ Bridge │───▶│Blockchain│

cd ai/ai_service│ Device │ │ API │ │ DB │ │ Node.js │ │ Zero │

└──────────┘ └──────────┘ └────┬─────┘ └──────────┘ └──────────┘

# Cài đặt dependencies│

pip install -r requirements.txt│

▼

# Tạo config.env┌──────────┐

cp config.env.example config.env│ AI │

│ Service │

# Chỉnh sửa config với thông tin database└────┬─────┘

```│

▼

#### c. Blockchain Bridge (Node.js)┌──────────┐

│ Daily │

```bash│ Insights │

# Cài đặt dependencies└────┬─────┘

npm install│

▼

# Tạo .env với private key và contract address┌──────────┐

# RPC_URL=https://rpc.zeroscan.org│Blockchain│

# PRIVATE_KEY=0x...│ Storage │

# CONTRACT_ADDRESS=0x...└──────────┘

```

````

#### d. Backend API (Express)

---

```bash

cd Dapp/backend## 🛠️ Công nghệ sử dụng



# Cài đặt dependencies### Backend

npm install- **Python 3.8+**

  - Flask 2.3.3 - Data ingestion API

# Tạo .env  - FastAPI 0.104.1 - AI service

cp .env.example .env  - scikit-learn 1.3.2 - Machine Learning

  - psycopg2 - PostgreSQL driver

# Chỉnh sửa database connection

```- **Node.js 18+**

  - Express 5.1.0 - Backend API

### 4. Cài đặt Frontend DApp  - ethers.js 6.13.0 - Blockchain interaction

  - pg 8.12.0 - PostgreSQL driver

```bash

cd Dapp/frontend### Frontend

- **Next.js 15.1.2** - React framework

# Cài đặt dependencies- **TypeScript 5** - Type safety

npm install- **Tailwind CSS 3.4** - Styling

- **Chart.js 4.5** - Data visualization

# Tạo .env.local- **@simplewebauthn/browser** - Passkey authentication

cp env.local.example .env.local- **Gemini AI** - Chatbot assistant



# Chỉnh sửa environment variables### Blockchain

# NEXT_PUBLIC_API_URL=http://localhost:4000- **Solidity 0.8.20** - Smart contract language

# NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key- **Hardhat 2.26.3** - Development environment

# NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id- **Zero Network** - Blockchain platform (Chain ID: 5080)

```

### Database

### 5. Deploy Smart Contract (Nếu cần)- **PostgreSQL 13+** - Primary database



```bash### IoT

cd blockchain- **ESP8266/ESP32** - Microcontroller

- **7-in-1 Soil Sensor** - Data collection

# Cài đặt Hardhat dependencies

npm install---



# Compile contract## 💻 Yêu cầu hệ thống

npx hardhat compile

### Phần cứng

# Deploy to Zero Network- **ESP8266/ESP32** với 7-in-1 soil sensor

npx hardhat run scripts/deploy.js --network zero- **Server** (VPS/Cloud):

```  - RAM: 4GB+

  - CPU: 2 cores+

---  - Storage: 20GB+

  - OS: Ubuntu 20.04+ / Windows 10+

## ⚙️ Cấu hình

### Phần mềm

### Environment Variables- **Node.js** >= 18.0.0

- **Python** >= 3.8

#### Root `.env`- **PostgreSQL** >= 13

```env- **Git**

# Database- **npm** hoặc **yarn**

PGHOST=localhost- **pip** (Python package manager)

PGPORT=5432

PGDATABASE=db_iot_sensor---

PGUSER=postgres

PGPASSWORD=your_password## 📥 Hướng dẫn cài đặt



# Blockchain Bridge### 1. Clone repository

NODE_BRIDGE_URL=http://127.0.0.1:3000/bridgePending

``````bash

git clone https://github.com/minhe51805/Pione_AIBlockchainIoT-WAGTeam.git

#### `blockchain/.env` (hoặc root cho bridge)cd Pione_AIBlockchainIoT-WAGTeam

```env````

RPC_URL=https://rpc.zeroscan.org

PRIVATE_KEY=0x1234567890abcdef...### 2. Cài đặt Database

CONTRACT_ADDRESS=0x55313657185bd745917a7eD22fe9B827fC1AAC48

``````bash

# Khởi tạo PostgreSQL database

#### `ai/ai_service/config.env`psql -U postgres

```env

DB_HOST=localhost# Tạo database

DB_PORT=5432CREATE DATABASE db_iot_sensor;

DB_NAME=db_iot_sensor

DB_USER=postgres# Import schema

DB_PASSWORD=your_passwordpsql -U postgres -d db_iot_sensor < db.sql

```

# Chạy migrations

#### `Dapp/backend/.env`psql -U postgres -d db_iot_sensor < migrations/008_add_users_table.sql

```envpsql -U postgres -d db_iot_sensor < migrations/009_add_pin_hash_column.sql

DB_HOST=localhostpsql -U postgres -d db_iot_sensor < migrations/010_fix_nullable_passkey.sql

DB_PORT=5432```

DB_NAME=db_iot_sensor

DB_USER=postgres### 3. Cài đặt Backend Services

DB_PASSWORD=your_password

PORT=4000#### a. Flask Data Ingestion API

```

```bash

#### `Dapp/frontend/.env.local`# Cài đặt Python dependencies

```envpip install -r requirements.txt

NEXT_PUBLIC_API_URL=http://localhost:4000

NEXT_PUBLIC_GEMINI_API_KEY=AIzaSy...# Tạo .env file

NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=513950...cp .env.example .env

NEXT_PUBLIC_CONTRACT_ADDRESS=0x55313657185bd745917a7eD22fe9B827fC1AAC48

NEXT_PUBLIC_RPC_URL=https://rpc.zeroscan.org# Chỉnh sửa .env với thông tin database của bạn

NEXT_PUBLIC_CHAIN_ID=5080# PGHOST=localhost

```# PGPORT=5432

# PGDATABASE=db_iot_sensor

---# PGUSER=postgres

# PGPASSWORD=your_password

## 🎮 Hướng dẫn sử dụng```



### Khởi động hệ thống#### b. AI Service (FastAPI)



#### 1. Khởi động Flask API (Data Ingestion)```bash

```bashcd ai/ai_service

python app_ingest.py

# Running on http://localhost:5000# Cài đặt dependencies

```pip install -r requirements.txt



#### 2. Khởi động Blockchain Bridge# Tạo config.env

```bashcp config.env.example config.env

node server.js

# Server running on port 3000# Chỉnh sửa config với thông tin database

``````



#### 3. Khởi động AI Service#### c. Blockchain Bridge (Node.js)

```bash

cd ai/ai_service```bash

uvicorn main:app --reload --port 8000# Cài đặt dependencies

# Running on http://localhost:8000npm install

```

# Tạo .env với private key và contract address

#### 4. Khởi động Backend API# RPC_URL=https://rpc.zeroscan.org

```bash# PRIVATE_KEY=0x...

cd Dapp/backend# CONTRACT_ADDRESS=0x...

npm start```

# Server running on port 4000

```#### d. Backend API (Express)



#### 5. Khởi động Frontend DApp```bash

```bashcd Dapp/backend

cd Dapp/frontend

npm run dev# Cài đặt dependencies

# Running on http://localhost:3001npm install

```

# Tạo .env

### Gửi dữ liệu từ ESP8266/ESP32cp .env.example .env



```cpp# Chỉnh sửa database connection

// Arduino code snippet```

#include <ESP8266HTTPClient.h>

### 4. Cài đặt Frontend DApp

String serverUrl = "http://your-server-ip:5000/api/data";

```bash

void sendSensorData() {cd Dapp/frontend

  HTTPClient http;

  http.begin(serverUrl);# Cài đặt dependencies

  http.addHeader("Content-Type", "application/json");npm install

  

  String payload = "{\"temperature\":" + String(soilTemp) + # Tạo .env.local

                   ",\"humidity\":" + String(soilMoisture) +cp env.local.example .env.local

                   ",\"conductivity\":" + String(ec) +

                   ",\"ph\":" + String(ph) +# Chỉnh sửa environment variables

                   ",\"nitrogen\":" + String(n) +# NEXT_PUBLIC_API_URL=http://localhost:4000

                   ",\"phosphorus\":" + String(p) +# NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key

                   ",\"potassium\":" + String(k) +# NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

                   ",\"salt\":" + String(salinity) +```

                   ",\"air_temperature\":" + String(airTemp) +

                   ",\"air_humidity\":" + String(airHumidity) +### 5. Deploy Smart Contract (Nếu cần)

                   ",\"is_raining\":" + String(isRaining) +

                   ",\"timestamp\":\"" + getTimestamp() + "\"}";```bash

  cd blockchain

  int httpCode = http.POST(payload);

  http.end();# Cài đặt Hardhat dependencies

}npm install

```

# Compile contract

### Truy cập Dashboardnpx hardhat compile



1. Mở browser: `http://localhost:3001`# Deploy to Zero Network

2. Đăng ký tài khoản với **Passkey** (không cần mật khẩu)npx hardhat run scripts/deploy.js --network zero

3. Xem dashboard với biểu đồ và phân tích```

4. Chat với AI assistant về dữ liệu nông nghiệp

---

---

## ⚙️ Cấu hình

## 📡 API Documentation

### Environment Variables

### Flask Data Ingestion API (Port 5000)

#### Root `.env`

#### POST `/api/data` - Gửi dữ liệu cảm biến

```json```env

{# Database

  "temperature": 24.5,PGHOST=localhost

  "humidity": 45.2,PGPORT=5432

  "conductivity": 1250,PGDATABASE=db_iot_sensor

  "ph": 6.8,PGUSER=postgres

  "nitrogen": 45,PGPASSWORD=your_password

  "phosphorus": 30,

  "potassium": 180,# Blockchain Bridge

  "salt": 850,NODE_BRIDGE_URL=http://127.0.0.1:3000/bridgePending

  "air_temperature": 27.1,```

  "air_humidity": 65.0,

  "is_raining": false,#### `blockchain/.env` (hoặc root cho bridge)

  "timestamp": "2025-11-10T10:30:00Z"

}```env

```RPC_URL=https://rpc.zeroscan.org

PRIVATE_KEY=0x1234567890abcdef...

**Response:**CONTRACT_ADDRESS=0x55313657185bd745917a7eD22fe9B827fC1AAC48

```json```

{

  "success": true,#### `ai/ai_service/config.env`

  "id": 123,

  "message": "Data stored successfully"```env

}DB_HOST=localhost

```DB_PORT=5432

DB_NAME=db_iot_sensor

#### GET `/api/dashboard/latest` - Lấy dữ liệu mới nhấtDB_USER=postgres

**Response:**DB_PASSWORD=your_password

```json```

{

  "id": 123,#### `Dapp/backend/.env`

  "temperature": 24.5,

  "humidity": 45.2,```env

  "measured_at": "2025-11-10T10:30:00Z",DB_HOST=localhost

  ...DB_PORT=5432

}DB_NAME=db_iot_sensor

```DB_USER=postgres

DB_PASSWORD=your_password

### AI Service API (Port 8000)PORT=4000

```

#### POST `/predict/crop` - Dự đoán cây trồng phù hợp

```json#### `Dapp/frontend/.env.local`

{

  "N": 45,```env

  "P": 30,NEXT_PUBLIC_API_URL=http://localhost:4000

  "K": 180,NEXT_PUBLIC_GEMINI_API_KEY=AIzaSy...

  "temperature": 27.1,NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=513950...

  "humidity": 65.0,NEXT_PUBLIC_CONTRACT_ADDRESS=0x55313657185bd745917a7eD22fe9B827fC1AAC48

  "ph": 6.8,NEXT_PUBLIC_RPC_URL=https://rpc.zeroscan.org

  "rainfall": 0NEXT_PUBLIC_CHAIN_ID=5080

}```

```

---

**Response:**

```json## 🎮 Hướng dẫn sử dụng

{

  "crop": "coffee",### Khởi động hệ thống

  "confidence": 0.985,

  "alternatives": ["rice", "banana"]#### 1. Khởi động Flask API (Data Ingestion)

}

``````bash

python app_ingest.py

#### POST `/predict/soil-health` - Phân tích sức khỏe đất# Running on http://localhost:5000

**Response:**```

```json

{#### 2. Khởi động Blockchain Bridge

  "score": 88.3,

  "rating": "GOOD",```bash

  "factors": {node server.js

    "ph_status": "optimal",# Server running on port 3000

    "nutrients_balance": "good",```

    "moisture_level": "adequate"

  }#### 3. Khởi động AI Service

}

``````bash

cd ai/ai_service

### Blockchain Bridge API (Port 3000)uvicorn main:app --reload --port 8000

# Running on http://localhost:8000

#### GET `/getData` - Lấy dữ liệu từ blockchain```

**Response:**

```json#### 4. Khởi động Backend API

{

  "count": 1234,```bash

  "latest": {cd Dapp/backend

    "id": 123,npm start

    "soilTemperature": 245,# Server running on port 4000

    "soilMoisture": 452,```

    "dataHash": "0x...",

    "reporter": "0x..."#### 5. Khởi động Frontend DApp

  }

}```bash

```cd Dapp/frontend

npm run dev

#### POST `/bridgePending` - Push dữ liệu pending lên blockchain# Running on http://localhost:3001

**Response:**```

```json

{### Gửi dữ liệu từ ESP8266/ESP32

  "success": true,

  "pushed": 5,```cpp

  "txHash": "0x..."// Arduino code snippet

}#include <ESP8266HTTPClient.h>

```

String serverUrl = "http://your-server-ip:5000/api/data";

### Backend API (Port 4000)

void sendSensorData() {

#### POST `/api/auth/register` - Đăng ký người dùng  HTTPClient http;

```json  http.begin(serverUrl);

{  http.addHeader("Content-Type", "application/json");

  "username": "farmer01",

  "email": "farmer@example.com",  String payload = "{\"temperature\":" + String(soilTemp) +

  "passkey_credential": {...}                   ",\"humidity\":" + String(soilMoisture) +

}                   ",\"conductivity\":" + String(ec) +

```                   ",\"ph\":" + String(ph) +

                   ",\"nitrogen\":" + String(n) +

#### GET `/api/users/:id` - Lấy thông tin user                   ",\"phosphorus\":" + String(p) +

**Response:**                   ",\"potassium\":" + String(k) +

```json                   ",\"salt\":" + String(salinity) +

{                   ",\"air_temperature\":" + String(airTemp) +

  "id": 1,                   ",\"air_humidity\":" + String(airHumidity) +

  "username": "farmer01",                   ",\"is_raining\":" + String(isRaining) +

  "email": "farmer@example.com",                   ",\"timestamp\":\"" + getTimestamp() + "\"}";

  "created_at": "2025-11-10T10:00:00Z"

}  int httpCode = http.POST(payload);

```  http.end();

}

---```



## 🔗 Smart Contract### Truy cập Dashboard



### SoilDataStore.sol1. Mở browser: `http://localhost:3001`

2. Đăng ký tài khoản với **Passkey** (không cần mật khẩu)

Deployed on **Zero Network** (Chain ID: 5080)3. Xem dashboard với biểu đồ và phân tích

4. Chat với AI assistant về dữ liệu nông nghiệp

**Contract Address:** `0x55313657185bd745917a7eD22fe9B827fC1AAC48`

---

**Explorer:** https://zeroscan.org/address/0x55313657185bd745917a7eD22fe9B827fC1AAC48

## 📡 API Documentation

### Main Functions

### Flask Data Ingestion API (Port 5000)

#### Store Sensor Reading

```solidity#### POST `/api/data` - Gửi dữ liệu cảm biến

function storeSensorReading(

    uint256 _id,```json

    uint256 _measuredAtVN,{

    uint256 _soilTemperature,  // × 10  "temperature": 24.5,

    uint256 _soilMoisture,     // × 10  "humidity": 45.2,

    uint256 _conductivity,  "conductivity": 1250,

    uint256 _phValue,          // × 10  "ph": 6.8,

    uint256 _nitrogen,  "nitrogen": 45,

    uint256 _phosphorus,  "phosphorus": 30,

    uint256 _potassium,  "potassium": 180,

    uint256 _salt,  "salt": 850,

    uint256 _airTemperature,   // × 10  "air_temperature": 27.1,

    uint256 _airHumidity,      // × 10  "air_humidity": 65.0,

    bool _isRaining,  "is_raining": false,

    bytes32 _dataHash  "timestamp": "2025-11-10T10:30:00Z"

) public}

``````



#### Store Daily AI Insight**Response:**

```solidity

function storeDailyInsight(```json

    uint256 _id,{

    uint256 _dateTimestamp,  "success": true,

    uint256 _sampleCount,  "id": 123,

    string memory _recommendedCrop,  "message": "Data stored successfully"

    uint256 _confidence,       // × 100}

    uint256 _soilHealthScore,  // × 10```

    uint8 _healthRating,       // 0-3

    bool _isAnomalyDetected,#### GET `/api/dashboard/latest` - Lấy dữ liệu mới nhất

    string memory _recommendations,

    bytes32 _recordHash**Response:**

) public

``````json

{

#### Query Functions  "id": 123,

```solidity  "temperature": 24.5,

function getCount() public view returns (uint256)  "humidity": 45.2,

function getRecord(uint256 id) public view returns (SoilData memory)  "measured_at": "2025-11-10T10:30:00Z",

function getRecordsByTimeRange(uint256 start, uint256 end) public view returns (SoilData[] memory)  ...

function getDailyInsightCount() public view returns (uint256)}

function getLatestDailyInsight() public view returns (DailyInsight memory)```

```

### AI Service API (Port 8000)

---

#### POST `/predict/crop` - Dự đoán cây trồng phù hợp

## 📂 Cấu trúc thư mục

```json

```{

Pione_AIBlockchainIoT-WAGTeam/  "N": 45,

│  "P": 30,

├── ai/                          # AI Module  "K": 180,

│   ├── ai_module/              # Training pipeline  "temperature": 27.1,

│   │   ├── prepare_ml_data.py  # Data preparation  "humidity": 65.0,

│   │   ├── retrain_models.py   # Model training  "ph": 6.8,

│   │   ├── soil_training.ipynb # Jupyter notebook  "rainfall": 0

│   │   ├── data/               # Training datasets}

│   │   └── models/             # Saved ML models```

│   │

│   ├── ai_service/             # AI Inference Service (FastAPI)**Response:**

│   │   ├── main.py             # FastAPI app

│   │   ├── inference.py        # Prediction endpoints```json

│   │   ├── models_loader.py    # Load ML models{

│   │   ├── daily_aggregator.py # Daily batch processing  "crop": "coffee",

│   │   ├── schemas.py          # Pydantic models  "confidence": 0.985,

│   │   ├── config.env.example  "alternatives": ["rice", "banana"]

│   │   └── requirements.txt}

│   │```

│   └── dataset/                # Raw datasets

│       ├── Crop_recommendation.csv#### POST `/predict/soil-health` - Phân tích sức khỏe đất

│       └── augmented_soil_data_11_params.csv

│**Response:**

├── blockchain/                  # Blockchain Module

│   ├── contracts/```json

│   │   └── SoilDataStore.sol   # Smart contract{

│   ├── scripts/  "score": 88.3,

│   │   └── deploy.js           # Deployment script  "rating": "GOOD",

│   ├── hardhat.config.cjs      # Hardhat configuration  "factors": {

│   └── artifacts/              # Compiled contracts    "ph_status": "optimal",

│    "nutrients_balance": "good",

├── Dapp/                        # Decentralized Application    "moisture_level": "adequate"

│   ├── frontend/               # Next.js Frontend  }

│   │   ├── src/}

│   │   │   ├── app/            # App router```

│   │   │   ├── components/     # React components

│   │   │   ├── context/        # Context providers### Blockchain Bridge API (Port 3000)

│   │   │   ├── lib/            # Utilities

│   │   │   └── services/       # API services#### GET `/getData` - Lấy dữ liệu từ blockchain

│   │   ├── package.json

│   │   ├── next.config.ts**Response:**

│   │   ├── tailwind.config.ts

│   │   └── env.local.example```json

│   │{

│   └── backend/                # Node.js Backend API  "count": 1234,

│       ├── routes/  "latest": {

│       │   └── auth.js         # Authentication routes    "id": 123,

│       ├── server.js           # Express server    "soilTemperature": 245,

│       ├── db.js               # Database connection    "soilMoisture": 452,

│       ├── package.json    "dataHash": "0x...",

│       └── .env.example    "reporter": "0x..."

│  }

├── migrations/                  # Database migrations}

│   ├── 008_add_users_table.sql```

│   ├── 009_add_pin_hash_column.sql

│   └── 010_fix_nullable_passkey.sql#### POST `/bridgePending` - Push dữ liệu pending lên blockchain

│

├── app_ingest.py               # Flask data ingestion API**Response:**

├── auth_routes.py              # Authentication routes

├── dashboard_routes.py         # Dashboard data routes```json

├── server.js                   # Blockchain bridge (Node.js){

├── esp8266_LTMMT.ino          # Arduino IoT code  "success": true,

├── db.sql                      # Database schema  "pushed": 5,

├── requirements.txt            # Python dependencies (root)  "txHash": "0x..."

├── package.json                # Node.js dependencies (root)}

├── .gitignore```

├── .env.example

└── README.md### Backend API (Port 4000)

```

#### POST `/api/auth/register` - Đăng ký người dùng

---

```json

## 🧪 Testing{

  "username": "farmer01",

### Test Data Ingestion  "email": "farmer@example.com",

```bash  "passkey_credential": {...}

curl -X POST http://localhost:5000/api/data \}

  -H "Content-Type: application/json" \```

  -d @test_data.json

```#### GET `/api/users/:id` - Lấy thông tin user



### Test AI Prediction**Response:**

```bash

curl -X POST http://localhost:8000/predict/crop \```json

  -H "Content-Type: application/json" \{

  -d '{  "id": 1,

    "N": 45, "P": 30, "K": 180,  "username": "farmer01",

    "temperature": 27.1, "humidity": 65.0,  "email": "farmer@example.com",

    "ph": 6.8, "rainfall": 0  "created_at": "2025-11-10T10:00:00Z"

  }'}

``````



### Test Blockchain Query---

```bash

curl http://localhost:3000/getData## 🔗 Smart Contract

```

### SoilDataStore.sol

### Run Unit Tests

```bashDeployed on **Zero Network** (Chain ID: 5080)

# Python tests

pytest tests/**Contract Address:** `0x55313657185bd745917a7eD22fe9B827fC1AAC48`



# JavaScript tests**Explorer:** https://zeroscan.org/address/0x55313657185bd745917a7eD22fe9B827fC1AAC48

npm test

```### Main Functions



---#### Store Sensor Reading



## 🔐 Bảo mật```solidity

function storeSensorReading(

### Passkey Authentication    uint256 _id,

- Sử dụng **WebAuthn** standard    uint256 _measuredAtVN,

- Không cần mật khẩu    uint256 _soilTemperature,  // × 10

- Xác thực sinh trắc học (vân tay, Face ID)    uint256 _soilMoisture,     // × 10

- Chống phishing và replay attacks    uint256 _conductivity,

    uint256 _phValue,          // × 10

### Blockchain Security    uint256 _nitrogen,

- Dữ liệu **immutable** trên blockchain    uint256 _phosphorus,

- Hash verification để đảm bảo tính toàn vẹn    uint256 _potassium,

- Public ledger cho tính minh bạch    uint256 _salt,

    uint256 _airTemperature,   // × 10

### Best Practices    uint256 _airHumidity,      // × 10

- ⚠️ **KHÔNG COMMIT** file `.env` lên Git    bool _isRaining,

- 🔑 Sử dụng `.env.example` làm template    bytes32 _dataHash

- 🔄 Thay đổi private key sau khi test) public

- 🔒 Regenerate tất cả API keys trước production```



---#### Store Daily AI Insight



## 🚨 Troubleshooting```solidity

function storeDailyInsight(

### Database Connection Error    uint256 _id,

```bash    uint256 _dateTimestamp,

# Kiểm tra PostgreSQL service    uint256 _sampleCount,

sudo systemctl status postgresql    string memory _recommendedCrop,

    uint256 _confidence,       // × 100

# Restart PostgreSQL    uint256 _soilHealthScore,  // × 10

sudo systemctl restart postgresql    uint8 _healthRating,       // 0-3

```    bool _isAnomalyDetected,

    string memory _recommendations,

### Port Already in Use    bytes32 _recordHash

```bash) public

# Find process using port```

lsof -i :5000  # hoặc port khác

#### Query Functions

# Kill process

kill -9 <PID>```solidity

```function getCount() public view returns (uint256)

function getRecord(uint256 id) public view returns (SoilData memory)

### Smart Contract Deployment Failedfunction getRecordsByTimeRange(uint256 start, uint256 end) public view returns (SoilData[] memory)

```bashfunction getDailyInsightCount() public view returns (uint256)

# Kiểm tra balance vífunction getLatestDailyInsight() public view returns (DailyInsight memory)

# Đảm bảo có đủ gas fee trên Zero Network```



# Verify RPC endpoint---

curl https://rpc.zeroscan.org

```## 📂 Cấu trúc thư mục



---```

Pione_AIBlockchainIoT-WAGTeam/

## 🤝 Đóng góp│

├── ai/                          # AI Module

Chúng tôi hoan nghênh mọi đóng góp! Để contribute:│   ├── ai_module/              # Training pipeline

│   │   ├── prepare_ml_data.py  # Data preparation

1. Fork repository│   │   ├── retrain_models.py   # Model training

2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)│   │   ├── soil_training.ipynb # Jupyter notebook

3. Commit changes (`git commit -m 'Add some AmazingFeature'`)│   │   ├── data/               # Training datasets

4. Push to branch (`git push origin feature/AmazingFeature`)│   │   └── models/             # Saved ML models

5. Tạo Pull Request│   │

│   ├── ai_service/             # AI Inference Service (FastAPI)

### Coding Standards│   │   ├── main.py             # FastAPI app

- Python: Follow PEP 8│   │   ├── inference.py        # Prediction endpoints

- JavaScript/TypeScript: Follow ESLint config│   │   ├── models_loader.py    # Load ML models

- Commit messages: Conventional Commits format│   │   ├── daily_aggregator.py # Daily batch processing

│   │   ├── schemas.py          # Pydantic models

---│   │   ├── config.env.example

│   │   └── requirements.txt

## 📜 License│   │

│   └── dataset/                # Raw datasets

Distributed under the MIT License. See `LICENSE` for more information.│       ├── Crop_recommendation.csv

│       └── augmented_soil_data_11_params.csv

---│

├── blockchain/                  # Blockchain Module

## 📞 Liên hệ│   ├── contracts/

│   │   └── SoilDataStore.sol   # Smart contract

**WAG Team** - Pione AI-Blockchain-IoT Project│   ├── scripts/

│   │   └── deploy.js           # Deployment script

- 📧 Email: contact@wagteam.com│   ├── hardhat.config.cjs      # Hardhat configuration

- 🌐 Website: https://agrotwin.wagteam.com│   └── artifacts/              # Compiled contracts

- 📱 GitHub: [@minhe51805](https://github.com/minhe51805)│

├── Dapp/                        # Decentralized Application

**Project Link:** [https://github.com/minhe51805/Pione_AIBlockchainIoT-WAGTeam](https://github.com/minhe51805/Pione_AIBlockchainIoT-WAGTeam)│   ├── frontend/               # Next.js Frontend

│   │   ├── src/

---│   │   │   ├── app/            # App router

│   │   │   ├── components/     # React components

## 🙏 Acknowledgments│   │   │   ├── context/        # Context providers

│   │   │   ├── lib/            # Utilities

- [Zero Network](https://zeroscan.org) - Blockchain platform│   │   │   └── services/       # API services

- [Hardhat](https://hardhat.org) - Ethereum development environment│   │   ├── package.json

- [Next.js](https://nextjs.org) - React framework│   │   ├── next.config.ts

- [FastAPI](https://fastapi.tiangolo.com) - Python web framework│   │   ├── tailwind.config.ts

- [scikit-learn](https://scikit-learn.org) - Machine learning library│   │   └── env.local.example

- [Gemini AI](https://ai.google.dev) - AI chat assistant│   │

│   └── backend/                # Node.js Backend API

---│       ├── routes/

│       │   └── auth.js         # Authentication routes

<div align="center">│       ├── server.js           # Express server

│       ├── db.js               # Database connection

**Made with ❤️ by WAG Team**│       ├── package.json

│       └── .env.example

⭐ Star us on GitHub nếu project này hữu ích!│

├── migrations/                  # Database migrations

</div>│   ├── 008_add_users_table.sql

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

**WAG Team** - Pione AI-Blockchain-IoT Project

- 📧 Email: contact@wagteam.com
- 🌐 Website: https://agrotwin.wagteam.com
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

**Made with ❤️ by WAG Team**

⭐ Star us on GitHub nếu project này hữu ích!

</div>
