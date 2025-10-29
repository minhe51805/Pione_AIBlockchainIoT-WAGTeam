# 🚀 QUICK START - AI SERVICE

## ⚡ 3 COMMANDS TO START

```bash
# 1. Install (once)
cd ai_service
pip install -r requirements.txt

# 2. Run service
python main.py

# 3. Test (in another terminal)
python test_service.py
```

---

## 📋 EXPECTED OUTPUT

### When service starts:
```
🚀 STARTING AI SERVICE...
📦 Loading feature scaler...
   ✅ Feature scaler loaded
📦 Loading label encoder...
   ✅ Label encoder loaded (22 classes)
📦 Loading crop classifier...
   ✅ Crop classifier loaded
📦 Loading soil health scorer...
   ✅ Soil health scorer loaded
📦 Loading anomaly detector...
   ✅ Anomaly detector loaded
📦 Loading crop validators...
   ✅ Loaded 22/22 validators...

✅ ALL MODELS LOADED SUCCESSFULLY!
   TOTAL: 26 files loaded into memory

✅ AI Service ready to accept requests!
   Listening on: http://0.0.0.0:8000
```

### When test runs:
```
🧪 AI SERVICE TEST SUITE

🏥 Testing Health Check...
✅ Status: healthy
✅ Models loaded: 26
✅ Uptime: 12.34s

🔍 Testing Discovery Mode Analysis...
✅ Recommended Crop: coffee (98.0% confidence)
✅ Soil Health: 88.3/100 (EXCELLENT)
✅ Anomaly: ✅ NORMAL
✅ Processing time: 45.23ms

📊 TEST SUMMARY
   ✅ PASS: Health Check
   ✅ PASS: Models Info
   ✅ PASS: Discovery Mode
   ✅ PASS: Validation Mode
   ✅ PASS: Daily Aggregation

   Total: 5/5 tests passed (100.0%)

🎉 ALL TESTS PASSED!
```

---

## 🔧 IF SOMETHING FAILS

### Issue: "ModuleNotFoundError"
```bash
# Install dependencies
pip install -r requirements.txt
```

### Issue: "FileNotFoundError: models not found"
```bash
# Check models exist
ls -l ../ai_module/models/*.pkl

# If not, train models first
cd ../ai_module
# Open soil_training.ipynb and run all cells
```

### Issue: "Database connection failed"
```bash
# Check .env file
cat .env

# Test DB connection
python -c "import psycopg2; psycopg2.connect(host='36.50.134.107', port=6000, dbname='db_iot_sensor', user='admin', password='admin123'); print('✅ DB OK')"
```

### Issue: Port 8000 in use
```bash
# Change port
# Edit main.py or .env: AI_SERVICE_PORT=8001
```

---

## 📞 QUICK TESTS

### Test 1: Health check
```bash
curl http://localhost:8000/api/ai/health
```

### Test 2: Analyze soil
```bash
curl -X POST http://localhost:8000/api/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "soil_temperature": 24.5,
    "soil_moisture": 45.2,
    "conductivity": 1250,
    "ph": 6.8,
    "nitrogen": 45,
    "phosphorus": 30,
    "potassium": 180,
    "salt": 850,
    "air_temperature": 27.1,
    "air_humidity": 65.0,
    "is_raining": false,
    "mode": "discovery"
  }'
```

### Test 3: Daily aggregation
```bash
curl -X POST http://localhost:8000/api/ai/analyze-daily \
  -H "Content-Type: application/json" \
  -d '{"date": "2025-10-27"}'
```

---

## ✅ SUCCESS CRITERIA

✅ Service starts without errors  
✅ All 26 models loaded  
✅ All 5 tests pass  
✅ Health check returns "healthy"  
✅ Analysis completes in <100ms  

**→ If all ✅ → Ready for integration!**

---

## 📚 FULL DOCS

- **README:** `ai_service/README.md`
- **Deployment:** `AI_SERVICE_DEPLOYED.md`
- **Test:** `ai_service/test_service.py`

---

**Nếu tất cả OK → Tiếp tục với Flask integration!**

