# 🔍 PHÂN BIỆT: ANALYZE vs TRIGGER DAILY PIPELINE

**Date:** 2025-10-29  
**Issue:** User confused about difference between 2 buttons

---

## ❌ **VẤN ĐỀ (TRƯỚC KHI FIX):**

Cả 2 buttons đều gọi Flask `/api/analyze-date` → **GIỐNG NHAU 100%!**

---

## ✅ **SAU KHI FIX:**

### **BUTTON 1: "Analyze" (Xanh dương)**

**Mục đích:** Xem nhanh dữ liệu cho 1 ngày  
**Endpoint:** `Flask → POST /api/analyze-date`

```javascript
// frontend/app.js - Line 26
async function analyzeDate() {
    fetch('http://localhost:5000/api/analyze-date', ...)
}
```

**Luồng xử lý:**
```
[User clicks "Analyze"]
    ↓
[Flask /api/analyze-date]
    ↓
[1. Query sensor_readings table] (HYBRID aggregation)
    ↓
[2. Call AI Service /api/ai/analyze] (Discovery mode)
    ↓
[3. Return result to frontend]
    ↓
[Display results]
    ↓
❌ KHÔNG lưu DB
❌ KHÔNG push Blockchain
```

**File:** `app_ingest.py` - Line 247-397

**Đặc điểm:**
- ✅ Nhanh (2-3 giây)
- ✅ Xem tạm thời
- ✅ Không ảnh hưởng database
- ✅ Test data trước khi commit
- ❌ Không tạo "Daily Insight Record"

---

### **BUTTON 2: "Trigger Daily Pipeline" (Xanh lá)** ⭐

**Mục đích:** Chạy pipeline PRODUCTION đầy đủ  
**Endpoint:** `AI Service → POST /api/ai/analyze-daily`

```javascript
// frontend/app.js - Line 302 (FIXED!)
async function triggerDailyPipeline() {
    fetch('http://localhost:8000/api/ai/analyze-daily', ...)  // ⭐ AI SERVICE!
}
```

**Luồng xử lý:**
```
[User clicks "Trigger Daily Pipeline"]
    ↓
[AI Service /api/ai/analyze-daily]
    ↓
[1. Query sensor_readings table] (AVG aggregation)
    ↓
[2. Run AI analysis] (4 models: Crop, Health, Validator, Anomaly)
    ↓
[3. Save to daily_insights table] ✅
    ↓
[4. Push to Blockchain] ✅ (Smart Contract storeDailyInsight)
    ↓
[5. Return result]
    ↓
[Display results + Success message]
```

**File:** `ai_service/main.py` - Line 185-256

**Đặc điểm:**
- ✅ Production pipeline
- ✅ Lưu vào `daily_insights` table
- ✅ Push lên blockchain (immutable)
- ✅ Tạo "Daily Knowledge Record"
- ✅ Dành cho n8n automation (20:00 daily)
- ⚠️ Chậm hơn (5-10 giây)

---

## 📊 **SO SÁNH CHI TIẾT:**

| Feature | Analyze (Blue) | Trigger Pipeline (Green) |
|---------|----------------|--------------------------|
| **Endpoint** | Flask `/api/analyze-date` | AI Service `/api/ai/analyze-daily` |
| **Port** | 5000 | 8000 |
| **Aggregation** | HYBRID (AVG+MEDIAN) | AVG only |
| **AI Analysis** | ✅ Yes (4 models) | ✅ Yes (4 models) |
| **Save to DB** | ❌ NO | ✅ YES (`daily_insights`) |
| **Push Blockchain** | ❌ NO | ✅ YES (Smart Contract) |
| **Speed** | Fast (2-3s) | Slower (5-10s) |
| **Use case** | Quick view | Production run |
| **Called by** | User click | User click / n8n (20:00) |
| **Idempotent** | Yes (no side effects) | Yes (ON CONFLICT UPDATE) |

---

## 🔧 **CODE COMPARISON:**

### **Analyze Button:**

```javascript
// frontend/app.js - analyzeDate()
const response = await fetch('http://localhost:5000/api/analyze-date', {
    method: 'POST',
    body: JSON.stringify({ date: dateInput })
});
```

```python
# app_ingest.py - Line 247
@app.route("/api/analyze-date", methods=["POST"])
def analyze_date():
    # 1. Aggregate from sensor_readings
    # 2. Call AI Service /api/ai/analyze
    # 3. Return result
    # ❌ NO save to DB
    # ❌ NO blockchain
```

---

### **Trigger Pipeline Button:**

```javascript
// frontend/app.js - triggerDailyPipeline() (FIXED!)
const response = await fetch('http://localhost:8000/api/ai/analyze-daily', {
    method: 'POST',
    body: JSON.stringify({ date: dateInput })
});
```

```python
# ai_service/main.py - Line 185
@app.post("/api/ai/analyze-daily")
async def analyze_daily(request: DailyAggregateInput):
    # 1. Aggregate from sensor_readings
    aggregated_data = aggregate_daily_data(request.date)
    
    # 2. Run AI analysis
    ai_result = analyze_aggregated_data(aggregated_data['features'], models)
    
    # 3. ✅ Save to daily_insights
    record_id = save_daily_insight(request.date, aggregated_data, ai_result)
    
    # 4. ✅ Push to blockchain
    blockchain_success = push_to_blockchain(date, ai_result, sample_count)
    
    return result
```

---

## 🎯 **USE CASES:**

### **Khi nào dùng "Analyze"?**

1. ✅ Xem nhanh dữ liệu ngày hôm nay
2. ✅ Test xem AI đánh giá như thế nào
3. ✅ So sánh nhiều ngày khác nhau
4. ✅ Không muốn lưu vào DB/Blockchain

**Ví dụ:**
```
"Tôi muốn xem đất ngày hôm qua thế nào?"
→ Click "Analyze" → Xem kết quả → Đóng
```

---

### **Khi nào dùng "Trigger Pipeline"?**

1. ✅ Muốn lưu kết quả vào database
2. ✅ Muốn push lên blockchain (immutable record)
3. ✅ Tạo "Daily Knowledge Record" cho AI học
4. ✅ Manual trigger cho ngày cụ thể (vì n8n chưa chạy)
5. ✅ Test production pipeline trước khi deploy n8n

**Ví dụ:**
```
"Tôi muốn tạo Daily Report cho ngày 2025-10-27"
→ Click "Trigger Pipeline" → Chờ 5-10s → ✅ Saved + Blockchain
```

---

## 🚨 **LƯU Ý:**

### **⚠️ Trigger Pipeline có side effects:**

1. **Database:** Creates/Updates record in `daily_insights`
2. **Blockchain:** Pushes `DailyInsight` to Smart Contract
3. **Duplicate prevention:** Smart Contract prevents duplicate dates

**Nếu trigger 2 lần cùng 1 date:**
- ✅ Database: UPDATE existing record (ON CONFLICT)
- ❌ Blockchain: Error (duplicate date not allowed)

**Solution:** Use different dates for testing, or redeploy contract

---

## 📝 **DAILY INSIGHTS TABLE:**

Khi click "Trigger Pipeline", data được lưu vào bảng này:

```sql
CREATE TABLE daily_insights (
    id SERIAL PRIMARY KEY,
    date_vn DATE UNIQUE NOT NULL,
    sample_count INTEGER,
    
    -- Aggregated sensor data (11 params)
    avg_soil_temperature_c NUMERIC(5,2),
    avg_soil_moisture_pct NUMERIC(5,2),
    avg_conductivity_us_cm NUMERIC(7,2),
    avg_ph_value NUMERIC(4,2),
    avg_nitrogen_mg_kg INTEGER,
    avg_phosphorus_mg_kg INTEGER,
    avg_potassium_mg_kg INTEGER,
    avg_salt_mg_l INTEGER,
    avg_air_temperature_c NUMERIC(5,2),
    avg_air_humidity_pct NUMERIC(5,2),
    is_raining_majority BOOLEAN,
    
    -- AI analysis results
    ai_crop_recommendation VARCHAR(50),
    ai_recommendation_confidence NUMERIC(5,4),
    ai_soil_health_score NUMERIC(5,2),
    ai_soil_health_rating VARCHAR(20),
    ai_is_anomaly_detected BOOLEAN,
    
    -- Full AI result (JSON)
    ai_analysis_summary JSONB,
    
    -- Actionable recommendations (JSON)
    recommendations TEXT,
    
    created_at_vn TIMESTAMP DEFAULT NOW(),
    updated_at_vn TIMESTAMP DEFAULT NOW()
);
```

**Đây là "Knowledge Graph" atoms** → Dùng để AI học trong tương lai!

---

## 🎯 **TÓM TẮT:**

### **"Analyze" = Temporary View** 👀
- Quick
- No database
- No blockchain
- For viewing only

### **"Trigger Pipeline" = Production Run** 🚀
- Complete pipeline
- Save to database ✅
- Push to blockchain ✅
- Create knowledge record

---

## ✅ **ĐÃ FIX:**

**File:** `frontend/app.js`  
**Line:** 302-389

**Change:**
```javascript
// BEFORE (WRONG):
fetch('http://localhost:5000/api/analyze-date', ...)  // Flask

// AFTER (CORRECT):
fetch('http://localhost:8000/api/ai/analyze-daily', ...)  // AI Service
```

---

## 🧪 **TEST NGAY:**

1. Start services (Flask + AI + Node.js + DApp)
2. Open http://localhost:3000
3. Select date: 2025-10-27
4. Click **"Analyze"** (blue) → Xem nhanh (no save)
5. Click **"Trigger Pipeline"** (green) → Full pipeline (save + blockchain)
6. Verify DB: `SELECT * FROM daily_insights WHERE date_vn='2025-10-27'`
7. Verify Blockchain: `curl http://localhost:3000/api/getLatestDailyInsight`

---

## 🎉 **READY!**

Bây giờ 2 buttons đã **KHÁC NHAU HOÀN TOÀN**! 🚀

