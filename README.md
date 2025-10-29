# 🌱 Pione AI-Blockchain-IoT (WAG Team)

## 📊 Hệ thống IoT → Database → Blockchain cho Nông nghiệp Thông minh

### **Tính năng chính:**
- ✅ Thu thập **11 thông số** từ cảm biến đất & khí tượng
- ✅ Lưu trữ bất biến trên blockchain **Zeroscan**
- ✅ Pipeline tự động: IoT → DB → Blockchain
- ✅ Sẵn sàng cho AI analysis & recommendations

---

## 🔧 Kiến trúc hệ thống

```
IoT Device (ESP8266/ESP32)
   │ POST 11 thông số
   ↓
Flask API (app_ingest.py) - Port 5000
   │ Validate & lưu PostgreSQL
   │ Callback Node.js bridge
   ↓
PostgreSQL (36.50.134.107:6000)
   │ Queue pending records
   ↓
Node.js Bridge (server.js) - Port 3000
   │ Claim & đẩy lên blockchain
   ↓
Smart Contract (SoilDataStore.sol)
   │ Lưu vĩnh viễn trên Zeroscan
   └─→ https://zeroscan.org
```

---

## 📦 11 Thông số thu thập

### **Soil Indicators (8):**
1. Soil Temperature (°C)
2. Soil Moisture (%)
3. Electrical Conductivity (µS/cm)
4. pH
5. Nitrogen (mg/kg)
6. Phosphorus (mg/kg)
7. Potassium (mg/kg)
8. Salinity (mg/L)

### **Air/Weather Indicators (3):**
9. Air Temperature (°C)
10. Air Humidity (%)
11. Rain Status (boolean)

---

## 🚀 Quick Start

### **1. Cài đặt dependencies:**

```bash
# Node.js
npm install

# Python (Flask)
pip install flask flask-cors psycopg2-binary python-dotenv
```

### **2. Cấu hình `.env`:**

```env
RPC_URL=https://rpc.zeroscan.org
PRIVATE_KEY=0x...
CONTRACT_ADDRESS=0x55313657185bd745917a7eD22fe9B827fC1AAC48
PGHOST=36.50.134.107
PGPORT=6000
PGDATABASE=db_iot_sensor
PGUSER=admin
PGPASSWORD=admin123
NODE_BRIDGE_URL=http://127.0.0.1:3000/bridgePending
```

### **3. Chạy services:**

```bash
# Terminal 1: Flask API
python app_ingest.py

# Terminal 2: Node.js Bridge
node server.js
```

---

## 📚 Tài liệu

- **[DEPLOYMENT_11_PARAMS.md](./DEPLOYMENT_11_PARAMS.md)** - Hướng dẫn deployment đầy đủ
- **[migrations/003_upgrade_to_11_parameters.sql](./migrations/003_upgrade_to_11_parameters.sql)** - Database migration script
- **[test_11_params.json](./test_11_params.json)** - Test cases mẫu

---

## 🧪 Testing

```bash
# Test Flask endpoint
curl -X POST http://36.50.134.107:5000/api/data \
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
    "is_raining": false,
    "timestamp": "2025-10-27T10:30:00Z"
  }'

# Kiểm tra data trên blockchain
curl http://localhost:3000/getData
```

---

## 📞 Support

WAG Team - Pione AI-Blockchain-IoT Project
