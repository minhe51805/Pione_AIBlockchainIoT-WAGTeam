# ✅ MANUAL PIPELINE TEST - READY!

**Date:** 2025-10-29

---

## 🎉 **HOÀN THÀNH!**

Bạn có thể test **MANUAL PIPELINE** ngay bây giờ thông qua DApp!

---

## 🚀 **QUICK START (3 PHÚT)**

### **Step 1: Start Services (3 terminals)**

```bash
# Terminal 1: Flask
python app_ingest.py

# Terminal 2: AI Service
cd ai_service
python main.py

# Terminal 3: Node.js Bridge
node server.js

# Terminal 4: DApp
cd frontend
python -m http.server 3000
```

---

### **Step 2: Open DApp**

**URL:** http://localhost:3000

---

### **Step 3: Insert Test Data (if needed)**

```bash
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
print('✅ 15 sample readings inserted for 2025-10-27')
cur.close()
conn.close()
"
```

---

### **Step 4: Trigger Pipeline!**

1. Select date: **2025-10-27**
2. Click **"Trigger Daily Pipeline"** (green button)
3. Confirm dialog
4. Wait 5-10 seconds
5. See success message! ✅

---

## 📊 **2 BUTTONS IN DAPP**

| Button | Color | Function | Saves to DB? | Push Blockchain? |
|--------|-------|----------|--------------|------------------|
| **Analyze** | Blue | Quick view | ❌ No | ❌ No |
| **Trigger Daily Pipeline** | Green | Full pipeline | ✅ Yes | ✅ Yes |

---

## 🎯 **WHAT HAPPENS WHEN YOU CLICK "TRIGGER"**

```
[You click button]
   ↓
[Confirmation dialog]
   ↓
[Loading: "Running full pipeline..."]
   ↓
[Flask aggregates IoT data] (HYBRID: AVG + MEDIAN)
   ↓
[AI Service runs 4 models]
   ├─ Crop Recommendation
   ├─ Soil Health Score
   ├─ Anomaly Detection
   └─ Rule-based Recommendations
   ↓
[Save to PostgreSQL] (daily_insights table)
   ↓
[Push to Blockchain] (Smart Contract)
   ↓
[Success message + Results displayed]
```

**Total time:** 5-10 seconds

---

## ✅ **SUCCESS MESSAGE**

```
✅ Pipeline Executed Successfully!

Date: 2025-10-27
• Data aggregated (15 readings)
• AI analysis completed
• Saved to database (daily_insights)
• Pushed to blockchain

Check blockchain explorer or query API to verify transaction
```

---

## 🔍 **VERIFY RESULTS**

### **A. Check Database:**
```bash
python -c "
import psycopg2
conn = psycopg2.connect(host='36.50.134.107', port=6000, dbname='db_iot_sensor', user='admin', password='admin123')
cur = conn.cursor()
cur.execute(\"SELECT analysis_date, recommended_crop, soil_health_score FROM daily_insights WHERE analysis_date='2025-10-27'\")
print('DB:', cur.fetchone())
"
```

**Expected:** `('2025-10-27', 'coffee', 88.3)`

---

### **B. Check Blockchain:**
```bash
curl http://localhost:3000/api/getLatestDailyInsight
```

**Expected:** JSON with `recommendedCrop: "coffee"`, `soilHealthScore: 88.3`

---

## 📋 **DOCUMENTS CREATED**

1. **`TRIGGER_BUTTON_ADDED.md`** - Detailed documentation
2. **`TEST_DAILY_PIPELINE.md`** - Full test guide (4 steps)
3. **`MANUAL_TEST_READY.md`** - This file (quick start)

---

## ⚠️ **IMPORTANT NOTES**

### **1. Blockchain Duplicate Prevention**
Smart Contract không cho phép duplicate dates:
```solidity
require(!dailyInsightExists[_dateTimestamp], "Date already exists");
```

**Solution:** 
- Use different dates for multiple tests
- Or redeploy contract

---

### **2. Check Services Before Testing**
```bash
# Quick health checks
curl http://localhost:5000/api/latest
curl http://localhost:8000/api/ai/health
curl http://localhost:3000/health
```

All should return success!

---

## 🎯 **NEXT STEP: AUTOMATION**

Sau khi test manual thành công → Implement automation (n8n):

```
[n8n Cron: Every day at 20:00]
   ↓
[HTTP Request: POST /api/analyze-date]
   ↓
[Pipeline runs automatically]
   ↓
[Send result to Zalo]
```

**Want to set up n8n now?** 

---

## 🧪 **QUICK TEST CHECKLIST**

Before triggering pipeline:

- [ ] Flask service running (port 5000)
- [ ] AI service running (port 8000)
- [ ] Node.js bridge running (port 3000)
- [ ] DApp opened (http://localhost:3000)
- [ ] Test data exists for selected date
- [ ] Smart Contract deployed (check .env)

After triggering:

- [ ] Success message displayed
- [ ] Results shown (crop, health, recommendations)
- [ ] Database record created (query to verify)
- [ ] Blockchain record created (API query)

---

## 🎉 **READY TO GO!**

Open http://localhost:3000 và click **"Trigger Daily Pipeline"**! 🚀

Nếu có lỗi, check:
1. All 4 services running?
2. Test data exists?
3. .env configured correctly?
4. Check terminal logs for errors

---

## 📞 **NEED HELP?**

Check these files:
- `TEST_DAILY_PIPELINE.md` - Full test guide
- `TRIGGER_BUTTON_ADDED.md` - Button documentation
- `QUICK_START_DAPP.md` - DApp setup guide
- `RECOMMENDATIONS_COMPLETE.md` - Latest implementation

