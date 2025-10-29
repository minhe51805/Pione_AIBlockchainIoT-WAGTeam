# 📊 DATABASE SCHEMA - AI MODULE

**Date:** 2025-10-27  
**Migration:** 004_add_ai_tables.sql

---

## 🎯 MỤC TIÊU

Hỗ trợ workflow:

```
IoT → PostgreSQL → Blockchain (sensor data)
         ↓
    AI Analysis
         ↓
PostgreSQL → Blockchain (AI results + daily report)
```

---

## 📋 TỔNG QUAN 5 TABLES

| # | Table | Mục đích | Liên kết Blockchain |
|---|-------|----------|---------------------|
| 1 | `sensor_readings` | Lưu raw data từ IoT (mỗi 15 phút) | ✅ Yes |
| 2 | `ai_analysis` | Lưu kết quả AI real-time | ✅ Yes (optional) |
| 3 | `daily_insights` | Báo cáo tổng hợp cuối ngày | ✅ Yes (primary) |
| 4 | `ai_recommendations` | Chi tiết khuyến nghị | ❌ No (linked to daily) |
| 5 | `blockchain_logs` | Lịch sử transactions | 📝 Metadata only |

---

## 🔗 RELATIONSHIPS

```
sensor_readings (1) ←--→ (N) ai_analysis
                    ↓
daily_insights (1) ←--→ (N) sensor_readings (by date)
                    ↓
daily_insights (1) ←--→ (N) ai_recommendations
                    ↓
blockchain_logs ←--- All tables (tracking)
```

---

## 📊 TABLE 1: `sensor_readings` (Existing)

**Mục đích:** Lưu raw data từ IoT sensor (96 readings/day)

**Updated Columns:**
```sql
-- Existing columns (11 params + metadata)
soil_temperature_c, soil_moisture_pct, conductivity_us_cm, ph_value,
nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l,
air_temperature_c, air_humidity_pct, is_raining

-- NEW columns (added by migration)
ai_analyzed BOOLEAN         -- Đã chạy AI chưa?
daily_insight_id INTEGER    -- Link to daily report
```

**Blockchain:** ✅ Raw sensor data → Smart Contract `storeData()`

---

## 📊 TABLE 2: `ai_analysis` (NEW)

**Mục đích:** Lưu KẾT QUẢ AI analysis cho mỗi sensor reading

**Use cases:**
- User click "Phân tích ngay" → INSERT 1 record
- Auto-analysis (scheduled) → INSERT nhiều records
- Historical analysis → Query past results

**Key Columns:**

| Column | Type | Purpose | Example |
|--------|------|---------|---------|
| `sensor_reading_id` | INTEGER | Link to sensor data | 12345 |
| `analysis_type` | VARCHAR | Loại phân tích | 'on-demand', 'auto-daily' |
| `analysis_mode` | VARCHAR | Mode phân tích | 'discovery', 'validation' |
| `user_crop` | VARCHAR | Cây đang trồng | 'coffee', NULL |
| `crop_recommendation` | JSONB | AI recommendation | `{best_crop: 'rice', confidence: 0.92, ...}` |
| `crop_validation` | JSONB | Validation results | `{suitability_score: 78.5, ...}` |
| `soil_health` | JSONB | Soil health score | `{overall_score: 78.5, rating: 'GOOD', ...}` |
| `anomaly_detection` | JSONB | Anomaly alerts | `{is_anomaly: true, alerts: [...]}` |
| `onchain_status` | VARCHAR | Blockchain status | 'confirmed' |

**JSONB Examples:**

```json
// crop_recommendation (Discovery mode)
{
  "best_crop": "rice",
  "confidence": 0.92,
  "alternatives": [
    {"crop": "rice", "probability": 0.92},
    {"crop": "maize", "probability": 0.05}
  ],
  "reasoning": {
    "strengths": ["High moisture ideal for rice"],
    "considerations": ["Potassium slightly low"]
  }
}

// crop_validation (Validation mode)
{
  "crop": "coffee",
  "suitability_score": 78.5,
  "verdict": "GOOD",
  "parameter_analysis": {
    "ph": {"current": 6.8, "ideal": [6.0, 7.0], "status": "OPTIMAL"},
    "potassium": {"current": 180, "ideal": [200, 250], "status": "BELOW_OPTIMAL"}
  },
  "recommendations": [
    {"priority": "HIGH", "action": "Add K fertilizer", "details": "..."}
  ]
}
```

**Blockchain:** Optional (có thể lưu hoặc không, ưu tiên daily_insights)

---

## 📊 TABLE 3: `daily_insights` (UPDATED)

**Mục đích:** Tổng hợp CUỐI NGÀY (23:59)

**Workflow:**
```
1. Query 96 sensor_readings của ngày hôm đó
2. Calculate statistics (avg, min, max, std)
3. Run AI analysis on aggregated data
4. Generate summary_text (ngắn gọn)
5. Generate key_insights (3-5 điểm)
6. Generate priority_actions (1-3 actions)
7. INSERT vào daily_insights
8. Push lên Blockchain
```

**Key Columns:**

### **A. Sensor Statistics (Aggregated)**

| Column | Type | Purpose | Example |
|--------|------|---------|---------|
| `date_vn` | DATE | Ngày báo cáo | '2025-10-27' |
| `total_readings` | INTEGER | Số lần đo | 96 |
| `soil_temp_avg` | REAL | Nhiệt độ TB | 22.3 |
| `nitrogen_avg` | REAL | N trung bình | 45.0 |
| `rain_hours` | INTEGER | Số giờ mưa | 8 |

### **B. AI Analysis Results**

| Column | Type | Purpose | Example |
|--------|------|---------|---------|
| `avg_suitability_score` | REAL | Độ phù hợp TB | 78.5 |
| `avg_soil_health_score` | REAL | Sức khỏe đất TB | 79.2 |
| `anomaly_count` | INTEGER | Số lần bất thường | 2 |

### **C. SUMMARY (Tóm tắt ngắn)** ← **BẠN YÊU CẦU**

| Column | Type | Purpose | Example |
|--------|------|---------|---------|
| `summary_status` | VARCHAR | Trạng thái tổng quát | 'GOOD' |
| `summary_text` | TEXT | Tóm tắt 1-2 câu | "Đất tốt. Cần tưới nước và bón phân K." |
| `key_insights` | JSONB | 3-5 điểm chính | `["✅ Đất phù hợp cà phê", "⚠️ Cần K"]` |
| `priority_actions` | JSONB | 1-3 hành động | `[{priority: 1, action: "Bón K"}]` |

**JSONB Examples:**

```json
// key_insights
[
  "✅ Đất phù hợp với cà phê (78.5/100)",
  "⚠️ Kali thấp hơn mức lý tưởng (thiếu 40 mg/kg)",
  "✅ pH ổn định trong khoảng tối ưu (6.8)",
  "🌧️ Độ ẩm tăng do mưa (8 giờ trong ngày)"
]

// priority_actions
[
  {
    "priority": 1,
    "action": "Bón phân kali",
    "details": "Thêm 40 kg K2O/hecta",
    "deadline": "Within 21 days",
    "deadline_days": 21
  },
  {
    "priority": 2,
    "action": "Kiểm tra độ mặn",
    "details": "Đo EC 2 tuần/lần",
    "deadline": "Bi-weekly"
  }
]

// summary_text example
"Đất tốt (79.2 điểm). Phù hợp với cà phê (78.5%). Cần bón phân K trong 3 tuần. Độ ẩm tăng do mưa, tạm ngưng tưới."
```

### **D. Trends & Forecasts**

| Column | Type | Purpose |
|--------|------|---------|
| `trend_vs_yesterday` | JSONB | So sánh với hôm qua |
| `trends_7_days` | JSONB | Xu hướng 7 ngày |
| `recommendations` | JSONB | Chi tiết khuyến nghị |
| `forecast_next_7_days` | JSONB | Dự báo 7 ngày tới |

**Blockchain:** ✅ **PRIMARY** - Hash của daily report lên blockchain

---

## 📊 TABLE 4: `ai_recommendations` (NEW)

**Mục đích:** Lưu CHI TIẾT từng khuyến nghị

**Why separate table?**
- `daily_insights` lưu tổng hợp
- `ai_recommendations` lưu chi tiết + track status

**Key Columns:**

| Column | Type | Purpose | Example |
|--------|------|---------|---------|
| `daily_insight_id` | INTEGER | Link to daily report | 15 |
| `recommendation_type` | VARCHAR | Loại | 'fertilizer', 'irrigation' |
| `priority` | VARCHAR | Độ ưu tiên | 'HIGH', 'MEDIUM', 'LOW' |
| `action` | TEXT | Hành động | "Bón phân kali" |
| `details` | TEXT | Chi tiết | "40 kg K2O/hecta" |
| `reasoning` | TEXT | Lý do | "K thấp hơn lý tưởng" |
| `current_value` | REAL | Giá trị hiện tại | 180 |
| `target_value` | REAL | Mục tiêu | 220 |
| `deadline_days` | INTEGER | Deadline (ngày) | 21 |
| `status` | VARCHAR | Trạng thái | 'pending', 'completed' |

**Use cases:**
- Nông dân hoàn thành action → UPDATE status = 'completed'
- Track compliance
- Historical analysis

**Blockchain:** ❌ No (linked to daily_insights)

---

## 📊 TABLE 5: `blockchain_logs` (NEW)

**Mục đích:** Track TẤT CẢ transactions lên blockchain

**Why needed?**
- Monitor blockchain activity
- Debug failed transactions
- Calculate gas costs
- Audit trail

**Key Columns:**

| Column | Type | Purpose | Example |
|--------|------|---------|---------|
| `data_type` | VARCHAR | Loại data | 'sensor_reading', 'daily_insight' |
| `data_id` | INTEGER | ID của record | 12345 |
| `tx_hash` | VARCHAR | Transaction hash | '0xabc123...' |
| `status` | VARCHAR | Trạng thái | 'confirmed', 'pending', 'failed' |
| `gas_used` | BIGINT | Gas sử dụng | 50000 |
| `transaction_fee` | NUMERIC | Chi phí (ZERO) | 0.001 |

**Blockchain:** 📝 Metadata only (không push data này lên chain)

---

## 🔄 DATA FLOW (Updated)

### **Flow 1: Real-time IoT Data**

```
1. IoT Sensor (15 mins)
   ↓
2. Flask API (/api/data)
   ↓
3. INSERT sensor_readings (ai_analyzed = FALSE)
   ↓
4. Node.js Bridge
   ↓
5. Blockchain: storeData()
   ↓
6. UPDATE sensor_readings (onchain_status = 'confirmed')
   ↓
7. INSERT blockchain_logs
```

### **Flow 2: Daily Report Generation**

```
1. Cron Job (23:59 daily)
   ↓
2. Query: SELECT * FROM sensor_readings WHERE date = TODAY (96 rows)
   ↓
3. Calculate statistics (avg, min, max, std)
   ↓
4. Run AI Analysis:
   - Aggregate sensor data
   - Calculate suitability score
   - Calculate soil health score
   - Detect anomalies
   - Generate summary_text
   - Generate key_insights
   - Generate priority_actions
   ↓
5. INSERT daily_insights
   ↓
6. INSERT ai_recommendations (for each recommendation)
   ↓
7. Push to Blockchain:
   - Hash of daily_insights
   - Key metrics
   ↓
8. UPDATE daily_insights (onchain_tx_hash)
   ↓
9. INSERT blockchain_logs
```

### **Flow 3: On-demand Analysis**

```
1. User clicks "Phân tích ngay" in DApp
   ↓
2. POST /api/analyze-now
   ↓
3. Query: Latest sensor_reading
   ↓
4. Run AI models
   ↓
5. INSERT ai_analysis
   ↓
6. Return JSON response to DApp
   ↓
7. (Optional) Push to Blockchain
```

---

## 🎯 BLOCKCHAIN STRATEGY

### **Quyết định: Data nào lên blockchain?**

| Data Type | Push to Blockchain? | Frequency | Reason |
|-----------|---------------------|-----------|--------|
| `sensor_readings` | ✅ Yes | Every 15 mins | Raw data immutability |
| `daily_insights` | ✅ Yes | Daily (23:59) | Daily summary + hash |
| `ai_analysis` | ⚠️ Optional | On-demand | Can be heavy, optional |
| `ai_recommendations` | ❌ No | - | Linked to daily_insights |
| `blockchain_logs` | ❌ No | - | Metadata only |

### **Blockchain Data Structure:**

**Sensor Reading (current):**
```solidity
storeData(
  measuredAtVN,
  soilTemperature, soilMoisture, conductivity, ph,
  nitrogen, phosphorus, potassium, salt,
  airTemperature, airHumidity, isRaining
)
```

**Daily Insight (NEW - cần thêm function):**
```solidity
storeDailyInsight(
  dateVN,                    // Unix timestamp của ngày
  avgSoilHealthScore,        // uint256 (78.5 → 785)
  avgSuitabilityScore,       // uint256 (78.5 → 785)
  summaryHash,               // keccak256(summary_text)
  keyInsightsHash,           // keccak256(JSON.stringify(key_insights))
  anomalyCount,              // uint256
  reportHash                 // keccak256(entire daily_insights JSON)
)
```

---

## 📊 QUERY EXAMPLES

### **Query 1: Latest AI Analysis**

```sql
SELECT 
  sr.measured_at_vn,
  sr.soil_temperature_c,
  sr.nitrogen_mg_kg,
  aa.crop_validation->>'suitability_score' as suitability,
  aa.soil_health->>'overall_score' as health_score
FROM sensor_readings sr
LEFT JOIN ai_analysis aa ON sr.id = aa.sensor_reading_id
WHERE sr.measured_at_vn >= NOW() - INTERVAL '1 day'
ORDER BY sr.measured_at_vn DESC;
```

### **Query 2: Daily Reports (Last 7 days)**

```sql
SELECT 
  date_vn,
  summary_status,
  summary_text,
  avg_soil_health_score,
  avg_suitability_score,
  onchain_tx_hash
FROM daily_insights
WHERE date_vn >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY date_vn DESC;
```

### **Query 3: Pending Actions**

```sql
SELECT 
  di.date_vn,
  rec.priority,
  rec.action,
  rec.deadline_days,
  rec.status
FROM ai_recommendations rec
JOIN daily_insights di ON rec.daily_insight_id = di.id
WHERE rec.status = 'pending'
  AND di.date_vn >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY rec.priority ASC, rec.deadline_days ASC;
```

### **Query 4: Blockchain Transaction Status**

```sql
SELECT 
  data_type,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
  SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
FROM blockchain_logs
WHERE sent_at_vn >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY data_type;
```

---

## ✅ MIGRATION CHECKLIST

### **Before Running Migration:**
- [ ] Backup existing `daily_insights` table (if has data)
- [ ] Review column names match your naming convention
- [ ] Adjust permissions/user grants if needed

### **Run Migration:**
```bash
# Via psql
psql -h 36.50.134.107 -p 6000 -U admin -d db_iot_sensor -f migrations/004_add_ai_tables.sql

# Or via Python
python run_migration.py migrations/004_add_ai_tables.sql
```

### **After Migration:**
- [ ] Verify tables created: `SELECT * FROM information_schema.tables WHERE table_name LIKE '%ai%' OR table_name = 'blockchain_logs';`
- [ ] Test insert: `INSERT INTO daily_insights (date_vn, summary_text) VALUES (CURRENT_DATE, 'Test');`
- [ ] Update Node.js to use new schema
- [ ] Update Flask to use new schema
- [ ] Update AI module to write to new tables

---

## 🚀 NEXT STEPS

1. **Run migration** (004_add_ai_tables.sql)
2. **Update Smart Contract** (add `storeDailyInsight` function)
3. **Update Node.js bridge** (write to new tables)
4. **Implement AI analysis** (write results to `ai_analysis`, `daily_insights`)
5. **Test end-to-end** (IoT → DB → AI → Blockchain)

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-27  
**Author:** WAG Team - Pione AI-Blockchain-IoT

