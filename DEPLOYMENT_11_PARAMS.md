# 🚀 HƯỚNG DẪN NÂNG CẤP HỆ THỐNG LÊN 11 THÔNG SỐ

## 📋 TỔNG QUAN THAY ĐỔI

Hệ thống được nâng cấp từ **8 thông số** lên **11 thông số** để phù hợp với IoT device mới:

### **Thông số cũ (8):**
- `temperature`, `humidity`, `conductivity`, `ph`, `nitrogen`, `phosphorus`, `potassium`, `salt`

### **Thông số mới (11):**
**Soil (8 thông số):**
1. `temperature` → **Soil Temperature** (°C)
2. `humidity` → **Soil Moisture** (%)
3. `conductivity` → Electrical Conductivity (µS/cm)
4. `ph` → pH
5. `nitrogen` → Nitrogen (mg/kg)
6. `phosphorus` → Phosphorus (mg/kg)
7. `potassium` → Potassium (mg/kg)
8. `salt` → Salinity (mg/L)

**Air/Weather (3 thông số mới):**
9. `air_temperature` → **Air Temperature** (°C)
10. `air_humidity` → **Air Humidity** (%)
11. `is_raining` → Rain Status (boolean: true/false)

---

## ⚠️ LƯU Ý QUAN TRỌNG

1. **BREAKING CHANGE**: Không tương thích ngược với IoT device cũ
2. **DATA LOSS**: Migration sẽ XÓA TOÀN BỘ data cũ trong DB
3. **NEW CONTRACT**: Phải deploy contract mới (struct thay đổi)
4. **FIELD MAPPING**:
   - IoT field `temperature` = **Soil Temperature** (KHÔNG phải Air!)
   - IoT field `humidity` = **Soil Moisture** (KHÔNG phải Air!)

---

## 📝 THỨ TỰ THỰC HIỆN

### **BƯỚC 1: Backup dữ liệu cũ (nếu cần)**

```sql
-- Backup table (optional)
CREATE TABLE sensor_readings_backup AS 
SELECT * FROM sensor_readings;
```

---

### **BƯỚC 2: Chạy migration SQL**

```bash
# Connect to PostgreSQL
psql -h 36.50.134.107 -p 6000 -U admin -d db_iot_sensor

# Chạy migration
\i migrations/003_upgrade_to_11_parameters.sql

# Kiểm tra schema mới
\d sensor_readings
```

**Expected output:**
```
                      Table "public.sensor_readings"
        Column         |            Type             | Nullable |
-----------------------+-----------------------------+----------+
 id                    | bigint                      | not null |
 measured_at_vn        | timestamp without time zone | not null |
 soil_temperature_c    | real                        | not null |
 soil_moisture_pct     | real                        | not null |
 conductivity_us_cm    | integer                     | not null |
 ph_value              | real                        | not null |
 nitrogen_mg_kg        | integer                     | not null |
 phosphorus_mg_kg      | integer                     | not null |
 potassium_mg_kg       | integer                     | not null |
 salt_mg_l             | integer                     | not null |
 air_temperature_c     | real                        | not null |
 air_humidity_pct      | real                        | not null |
 is_raining            | boolean                     | not null |
 onchain_status        | text                        | not null |
 onchain_tx_hash       | text                        |          |
 ...
```

---

### **BƯỚC 3: Compile & Deploy Smart Contract mới**

```bash
# Compile contract
npx hardhat compile

# Deploy lên Zeroscan (PZO network)
npx hardhat run scripts/deploy.js --network pzo
```

**Lưu CONTRACT_ADDRESS mới** (ví dụ: `0xABC123...`)

---

### **BƯỚC 4: Cập nhật file .env**

```bash
# Sửa CONTRACT_ADDRESS
CONTRACT_ADDRESS=0x[ĐỊA_CHỈ_CONTRACT_MỚI]

# Giữ nguyên các biến khác
RPC_URL=https://rpc.zeroscan.org
PRIVATE_KEY=0x...
PGHOST=36.50.134.107
PGPORT=6000
PGDATABASE=db_iot_sensor
PGUSER=admin
PGPASSWORD=admin123
NODE_BRIDGE_URL=http://127.0.0.1:3000/bridgePending
```

---

### **BƯỚC 5: Restart services**

#### **A. Restart Flask (máy chạy IoT ingestor)**

```bash
# Stop Flask hiện tại (Ctrl+C)

# Restart với code mới
python app_ingest.py
```

**Expected log:**
```
* Running on http://0.0.0.0:5000
```

#### **B. Restart Node.js (máy chạy blockchain bridge)**

```bash
# Stop Node.js hiện tại (Ctrl+C)

# Restart với code mới
node server.js
```

**Expected log:**
```
🔗 CONTRACT_ADDRESS: 0x[ĐỊA_CHỈ_MỚI]
API server running at http://localhost:3000
```

---

## 🧪 TESTING

### **Test 1: Flask nhận đúng 11 thông số**

```bash
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
    "is_raining": true,
    "timestamp": "2025-10-27T10:30:00Z"
  }'
```

**Expected response:**
```json
{
  "status": "success",
  "measured_at_vn": "2025-10-27 17:30:00",
  "bridge": {"status": 200}
}
```

---

### **Test 2: Kiểm tra DB**

```sql
SELECT 
  id,
  soil_temperature_c,
  soil_moisture_pct,
  air_temperature_c,
  air_humidity_pct,
  is_raining,
  onchain_status
FROM sensor_readings
ORDER BY id DESC
LIMIT 5;
```

**Expected:**
- Row mới có đủ 11 trường
- `onchain_status` = `confirmed` (sau vài giây)

---

### **Test 3: Kiểm tra blockchain**

```bash
# PowerShell
(Invoke-RestMethod http://localhost:3000/getData) | ConvertTo-Json -Depth 6

# Hoặc Bash/Linux
curl http://localhost:3000/getData | jq
```

**Expected response:**
```json
[
  {
    "id": 0,
    "measuredAtVN": "2025-10-27 17:30:00",
    "soilTemperature": 24.5,
    "soilMoisture": 45.2,
    "conductivity": 1250,
    "phValue": 6.8,
    "nitrogen": 45,
    "phosphorus": 30,
    "potassium": 180,
    "salt": 850,
    "airTemperature": 27.1,
    "airHumidity": 65.0,
    "isRaining": true,
    "reporter": "0x..."
  }
]
```

---

### **Test 4: Test từ IoT device thật**

Đảm bảo IoT device gửi đúng payload:

```json
{
  "temperature": 24.5,           // Soil temp
  "humidity": 45.2,              // Soil moisture
  "conductivity": 1250,
  "ph": 6.8,
  "nitrogen": 45,
  "phosphorus": 30,
  "potassium": 180,
  "salt": 850,
  "air_temperature": 27.1,       // Air temp
  "air_humidity": 65.0,          // Air humidity
  "is_raining": true,            // Boolean
  "timestamp": "..."
}
```

---

## ✅ CHECKLIST DEPLOYMENT

- [ ] **Backup data cũ** (nếu cần)
- [ ] **Chạy migration SQL** (`003_upgrade_to_11_parameters.sql`)
- [ ] **Compile contract** (`npx hardhat compile`)
- [ ] **Deploy contract mới** (`npx hardhat run scripts/deploy.js --network pzo`)
- [ ] **Cập nhật `.env`** với `CONTRACT_ADDRESS` mới
- [ ] **Restart Flask** (app_ingest.py)
- [ ] **Restart Node.js** (server.js)
- [ ] **Test POST /api/data** với 11 thông số
- [ ] **Kiểm tra DB** có data mới
- [ ] **Kiểm tra blockchain** (`/getData`)
- [ ] **Test với IoT device thật**

---

## 🐛 TROUBLESHOOTING

### **Lỗi: "Missing required fields"**

**Nguyên nhân:** Payload thiếu 1 trong 11 thông số

**Giải pháp:** Kiểm tra IoT device có gửi đủ các field:
- `temperature`, `humidity`, `conductivity`, `ph`
- `nitrogen`, `phosphorus`, `potassium`, `salt`
- `air_temperature`, `air_humidity`, `is_raining`

---

### **Lỗi: "column does not exist"**

**Nguyên nhân:** Migration chưa chạy hoặc chạy lỗi

**Giải pháp:**
```sql
-- Kiểm tra cột có tồn tại không
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'sensor_readings';
```

Nếu thiếu cột, chạy lại migration.

---

### **Lỗi: "invalid contract code"**

**Nguyên nhân:** Dùng contract address cũ (8 thông số)

**Giải pháp:**
1. Deploy contract mới
2. Cập nhật `.env` với address mới
3. Restart Node.js

---

### **Data không lên blockchain**

**Debug steps:**
```bash
# 1. Kiểm tra log Node.js
# Có thấy "🔗 CONTRACT_ADDRESS: 0x..." không?

# 2. Kiểm tra DB
SELECT * FROM sensor_readings WHERE onchain_status = 'pending';

# 3. Test manual bridge
curl -X POST http://localhost:3000/bridgePending \
  -H "Content-Type: application/json" \
  -d '{"limit": 1}'

# 4. Kiểm tra log lỗi
SELECT id, last_error FROM sensor_readings WHERE onchain_status = 'failed';
```

---

## 📊 MONITORING

### **Kiểm tra pipeline health:**

```bash
# 1. Flask health
curl http://36.50.134.107:5000/api/latest

# 2. DB pending count
echo "SELECT COUNT(*) FROM sensor_readings WHERE onchain_status='pending';" | \
  psql -h 36.50.134.107 -p 6000 -U admin -d db_iot_sensor

# 3. Blockchain record count
curl http://localhost:3000/getData | jq 'length'
```

---

## 🎯 NEXT STEPS

Sau khi deployment thành công:

1. ✅ **Monitor 24h** để đảm bảo ổn định
2. ✅ **Cập nhật documentation** cho team
3. ✅ **Thông báo cho người quản lý IoT device** về payload mới
4. 🚀 **Bắt đầu triển khai AI module** (sử dụng 11 thông số này)

---

**Liên hệ hỗ trợ:** [Thông tin contact của bạn]

