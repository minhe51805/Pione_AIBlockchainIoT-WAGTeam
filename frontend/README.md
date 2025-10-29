# 🌱 PIONE SOIL ANALYSIS DAPP

Simple web dashboard to test AI soil analysis.

---

## 🚀 QUICK START

### 1. Start Backend Services

**Terminal 1: Flask API**
```bash
python app_ingest.py
# Listening on http://localhost:5000
```

**Terminal 2: AI Service**
```bash
cd ai_service
python main.py
# Listening on http://localhost:8000
```

### 2. Open DApp

**Option A: Direct File (Simple)**
```bash
# Just open in browser
cd frontend
start index.html  # Windows
open index.html   # Mac
xdg-open index.html  # Linux
```

**Option B: Python HTTP Server (Better for CORS)**
```bash
cd frontend
python -m http.server 3000
# Open http://localhost:3000
```

---

## 📋 HOW TO USE

1. **Open Dashboard** in browser
2. **Select Date** (date with IoT data)
3. **Click "Analyze"** button
4. **View Results:**
   - Daily data summary (aggregated from all readings)
   - AI analysis (crop recommendation, soil health, anomaly)
   - Chart visualization

---

## 🎯 FEATURES

### ✅ Implemented:
- **Date picker** - Select any date with data
- **HYBRID aggregation** - AVG + MEDIAN + MAJORITY
- **AI analysis** - 4 models (Crop, Health, Anomaly)
- **Chart.js visualization** - Bar chart of sensor data
- **Responsive design** - Bootstrap 5
- **Error handling** - User-friendly messages

### 📊 Displays:
- **Sample count** (number of readings)
- **Time range** (first to last reading)
- **Average sensor values** (11 parameters)
- **AI crop recommendation** (with confidence %)
- **Soil health score** (0-100 with rating)
- **Anomaly detection** (alert if detected)
- **Top 3 suitable crops** (bar chart)

---

## 🔧 CONFIGURATION

### API Endpoint
Edit `app.js` line 7:
```javascript
const API_BASE_URL = 'http://localhost:5000';  // Change if needed
```

### Default Date
Edit `app.js` line 13-14 to change default date:
```javascript
const today = new Date().toISOString().split('T')[0];
document.getElementById('dateInput').value = today;
```

---

## 📊 DATA FLOW

```
User selects date
    ↓
Click "Analyze" button
    ↓
JavaScript → Flask: POST /api/analyze-date
    ↓
Flask queries PostgreSQL (HYBRID aggregation)
    ↓
Flask → AI Service: POST /api/ai/analyze
    ↓
AI runs 4 models
    ↓
Results → Flask → JavaScript
    ↓
Display on Dashboard
```

---

## 🎨 UI COMPONENTS

### 1. Header
- Title + subtitle
- Gradient background

### 2. Date Selection Card
- Date input
- "Analyze" button

### 3. Daily Summary Card
- Sample count, time range, date
- 11 sensor values (cards)
- Chart.js bar chart

### 4. AI Analysis Card
- Crop recommendation (with top 3)
- Soil health score + rating
- Anomaly alert

---

## 🐛 TROUBLESHOOTING

### Issue: "Failed to analyze data"
**Solutions:**
1. Check Flask running: `curl http://localhost:5000/api/latest`
2. Check AI Service: `curl http://localhost:8000/api/ai/health`
3. Select date with actual data in DB

### Issue: CORS Error
**Solution:** Use Python HTTP server instead of opening file directly:
```bash
cd frontend
python -m http.server 3000
```

### Issue: No data for selected date
**Solution:** 
- Check sensor_readings table has data for that date
- Try yesterday or a recent date

### Issue: Chart not showing
**Solution:**
- Open browser console (F12)
- Check for JavaScript errors
- Verify Chart.js loaded

---

## 📝 FILES

```
frontend/
├── index.html       # Main HTML page
├── app.js           # JavaScript logic
└── README.md        # This file
```

**Total:** 3 files, ~500 lines of code

---

## 🚀 NEXT STEPS

### For Production:
1. ✅ Add authentication
2. ✅ Date range picker (7 days, 30 days)
3. ✅ Compare dates
4. ✅ Export to PDF
5. ✅ Blockchain integration (show on-chain data)
6. ✅ Real-time updates (WebSocket)

### For Testing:
1. ✅ Test with different dates
2. ✅ Test with no data
3. ✅ Test AI service down
4. ✅ Test on mobile

---

## 📞 QUICK REFERENCE

| Action | Command |
|--------|---------|
| Start Flask | `python app_ingest.py` |
| Start AI | `cd ai_service && python main.py` |
| Start DApp | `cd frontend && python -m http.server 3000` |
| Test Backend | `curl -X POST http://localhost:5000/api/analyze-date -H "Content-Type: application/json" -d '{"date":"2025-10-27"}'` |
| Open DApp | http://localhost:3000 |

---

**WAG Team - Pione AI-Blockchain-IoT**  
**DApp v1.0.0 - Ready to Test** ✅

