# 🚀 QUICK START - DAPP TEST

## ⚡ 3 TERMINALS TO RUN

### Terminal 1: Flask
```bash
python app_ingest.py
```
**Wait for:** `Running on http://0.0.0.0:5000`

---

### Terminal 2: AI Service  
```bash
cd ai_service
python main.py
```
**Wait for:** `AI Service ready to accept requests!`

---

### Terminal 3: DApp
```bash
cd frontend
python -m http.server 3000
```
**Open:** http://localhost:3000

---

## 📝 HOW TO USE

1. **Open browser:** http://localhost:3000
2. **Select date:** Click date picker (choose a recent date with data)
3. **Click "Analyze"** button
4. **Wait 2-3 seconds** (loading spinner)
5. **View results:**
   - Daily summary (48 readings, sensor values)
   - AI analysis (coffee, 88.3/100, excellent)
   - Chart visualization

---

## ✅ EXPECTED RESULT

### If successful:
```
📊 DAILY DATA SUMMARY
  ✅ 48 Readings
  ✅ Soil Temp: 24.5°C
  ✅ Moisture: 45.2%
  ✅ pH: 6.8
  ✅ NPK: 45-30-180

🤖 AI ANALYSIS
  ✅ Recommended: COFFEE (98%)
  ✅ Soil Health: 88.3/100 (EXCELLENT)
  ✅ Anomaly: ✅ NORMAL
```

---

## ❌ IF ERROR

### "No sensor data found"
**→ Select a different date** (try yesterday or 2-3 days ago)

### "Failed to analyze data"
**→ Check:**
1. Flask running? `curl http://localhost:5000/api/latest`
2. AI Service running? `curl http://localhost:8000/api/ai/health`

### Chart not showing
**→ Open browser console (F12), check for errors**

---

## 🎯 QUICK TESTS

### Test 1: Backend only
```bash
curl -X POST http://localhost:5000/api/analyze-date \
  -H "Content-Type: application/json" \
  -d '{"date":"2025-10-27"}'
```
Should return JSON with aggregated_data and ai_analysis

### Test 2: AI Service only
```bash
curl http://localhost:8000/api/ai/health
```
Should return `{"status": "healthy", "models_loaded": 26}`

### Test 3: Full stack
Open http://localhost:3000 and click Analyze

---

## 📚 DOCS

- **DApp Guide:** `frontend/README.md`
- **Complete Summary:** `DAPP_COMPLETE.md`
- **AI Service:** `ai_service/README.md`

---

**If all 3 services running + DApp opens → SUCCESS! 🎉**

