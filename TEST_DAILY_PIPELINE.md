# 🧪 TEST DAILY INSIGHT PIPELINE

**Mục tiêu:** Test toàn bộ luồng từ IoT → AI → DB → Blockchain

---

## 📋 **PRE-REQUISITES**

### ✅ **Check Services Running:**

| Service | Port | Check Command |
|---------|------|---------------|
| PostgreSQL | 6000 | `psql -h 36.50.134.107 -p 6000 -U admin -d db_iot_sensor -c "SELECT 1"` |
| Flask (IoT Ingest) | 5000 | `curl http://localhost:5000/api/latest` |
| AI Service | 8000 | `curl http://localhost:8000/api/ai/health` |
| Node.js Bridge | 3000 | `curl http://localhost:3000/health` |

**Start services nếu chưa chạy:**
```bash
# Terminal 1
python app_ingest.py

# Terminal 2
cd ai_service && python main.py

# Terminal 3
node server.js
```

---

## 🧪 **STEP 1: INSERT TEST DATA**

### **1.1 Run SQL Insert:**
```bash
# Option A: Python script
python -c "
import psycopg2
conn = psycopg2.connect(
    host='36.50.134.107',
    port=6000,
    dbname='db_iot_sensor',
    user='admin',
    password='admin123'
)
cur = conn.cursor()
with open('test_insert_sample_data.sql', 'r') as f:
    cur.execute(f.read())
conn.commit()
print('✅ Sample data inserted!')
cur.close()
conn.close()
"

# Option B: Manual check (if data already exists)
curl http://localhost:5000/api/latest
```

**Expected:** 15 readings for date `2025-10-27`

---

## 🧪 **STEP 2: TRIGGER DAILY ANALYSIS**

### **2.1 Manual Trigger (via Flask):**

```bash
curl -X POST http://localhost:5000/api/analyze-date \
  -H "Content-Type: application/json" \
  -d '{"date":"2025-10-27"}'
```

**Expected Response:**
```json
{
  "status": "success",
  "date": "2025-10-27",
  "aggregated_data": {
    "sample_count": 15,
    "soil_temperature": 25.0,
    "soil_moisture": 68.0,
    "ph": 6.1,
    "conductivity": 1.8,
    "nitrogen": 43,
    "phosphorus": 31,
    "potassium": 207,
    "salt": 0.75
  },
  "ai_analysis": {
    "crop_recommendation": {
      "crop": "coffee",
      "confidence": 98.5,
      "alternatives": [...]
    },
    "soil_health": {
      "score": 88.3,
      "rating": "EXCELLENT"
    },
    "anomaly_detection": {
      "is_anomaly": false
    },
    "selected_crop_validation": {...},
    "recommendations": [
      {
        "priority": "HIGH",
        "message": "Đất khô, cần tưới nước"
      }
    ]
  }
}
```

### **2.2 Check Database:**
```bash
# Python query
python -c "
import psycopg2
conn = psycopg2.connect(
    host='36.50.134.107',
    port=6000,
    dbname='db_iot_sensor',
    user='admin',
    password='admin123'
)
cur = conn.cursor()
cur.execute(\"\"\"
    SELECT 
        analysis_date,
        recommended_crop,
        crop_confidence,
        soil_health_score,
        health_rating,
        is_anomaly_detected,
        LEFT(recommendations, 100) as rec_preview
    FROM daily_insights
    WHERE analysis_date = '2025-10-27'
\"\"\")
result = cur.fetchone()
if result:
    print('✅ Daily insight saved to DB!')
    print(f'Date: {result[0]}')
    print(f'Crop: {result[1]} ({result[2]}%)')
    print(f'Health: {result[3]}/100 ({result[4]})')
    print(f'Anomaly: {result[5]}')
    print(f'Recommendations: {result[6]}...')
else:
    print('❌ No data found!')
cur.close()
conn.close()
"
```

**Expected:**
```
✅ Daily insight saved to DB!
Date: 2025-10-27
Crop: coffee (98.5%)
Health: 88.3/100 (EXCELLENT)
Anomaly: False
Recommendations: [{"priority":"HIGH","message":"..."}]...
```

---

## 🧪 **STEP 3: VERIFY BLOCKCHAIN**

### **3.1 Check Latest Insight:**
```bash
curl http://localhost:3000/api/getLatestDailyInsight
```

**Expected Response:**
```json
{
  "id": 0,
  "date": "2025-10-27",
  "sampleCount": 15,
  "recommendedCrop": "coffee",
  "confidence": 98.5,
  "soilHealthScore": 88.3,
  "healthRating": "EXCELLENT",
  "isAnomalyDetected": false,
  "recommendations": [
    {
      "priority": "HIGH",
      "message": "Đất khô, cần tưới nước"
    }
  ],
  "reporter": "0x..."
}
```

### **3.2 Check All Insights:**
```bash
curl http://localhost:3000/api/getDailyInsights
```

**Expected:** Array of daily insights (at least 1 entry)

---

## 🧪 **STEP 4: TEST DAPP**

### **4.1 Open DApp:**
```bash
cd frontend
python -m http.server 3000
```

**Open:** http://localhost:3000

### **4.2 Manual Test (Quick View):**
1. ✅ Select date: `2025-10-27`
2. ✅ Click **"Analyze"** button (blue)
3. ✅ Wait 2-3 seconds
4. ✅ Should see:
   - Daily summary (15 readings)
   - AI analysis (coffee, 88.3/100)
   - Chart visualization
   - **Recommendations section** (with priority badges)

**Note:** This only views data, does NOT save to DB/Blockchain

---

### **4.3 Manual Test (Full Pipeline):** ⭐

1. ✅ Select date: `2025-10-27`
2. ✅ Click **"Trigger Daily Pipeline"** button (green) 🚀
3. ✅ Confirm dialog
4. ✅ Wait 5-10 seconds (custom loading message)
5. ✅ Should see:
   - Success message: "Pipeline Executed Successfully!"
   - 4 checkmarks (Aggregate → AI → DB → Blockchain)
   - All results displayed
6. ✅ Verify in database and blockchain (see Step 2.2 and 3.1)

**This runs the FULL pipeline:** Aggregate → AI → DB → Blockchain

---

## ✅ **SUCCESS CRITERIA**

| Step | Check | Status |
|------|-------|--------|
| 1 | Sample data inserted | ⬜ |
| 2 | API returns AI analysis | ⬜ |
| 3 | DB has daily_insights record | ⬜ |
| 4 | Blockchain has DailyInsight | ⬜ |
| 5 | DApp displays correctly | ⬜ |
| 6 | Recommendations visible | ⬜ |

---

## 🎯 **NEXT: AUTOMATION**

Sau khi test manual thành công, implement automation:

### **Option A: n8n (RECOMMENDED)** ⭐
- Visual workflow builder
- Easy scheduling (daily 20:00)
- Zalo integration built-in
- Can run on Windows/Linux

### **Option B: Cron (Linux only)**
- Simple bash script
- Cron job: `0 20 * * *`
- Less flexible

### **Option C: Python APScheduler**
- In-process scheduler
- Cross-platform
- No external dependencies

**Which one do you want?**

---

## 📝 **POSTMAN COLLECTION**

File: `Pione_AI_Daily_Test.postman_collection.json`

Import vào Postman để test nhanh các endpoint!

---

## ❓ **TROUBLESHOOTING**

### **"No sensor data found"**
→ Check: `SELECT COUNT(*) FROM sensor_readings WHERE DATE(measured_at_vn) = '2025-10-27'`

### **"AI Service not responding"**
→ Check: `curl http://localhost:8000/api/ai/health`

### **"Blockchain push failed"**
→ Check: `.env` has correct `BRIDGE_URL` and `CONTRACT_ADDRESS`

### **"Duplicate date error"**
→ Blockchain already has this date. Try a different date or redeploy contract.

---

## 🚀 **READY TO TEST!**

Run Step 1 → Step 4 để verify toàn bộ pipeline!

