# 🤖 PIONE AI SERVICE

FastAPI service serving 4 trained AI models for soil analysis.

---

## 📊 **MODELS (26 files loaded)**

1. **Crop Classifier** - RandomForestClassifier (22 crops)
2. **Soil Health Scorer** - RandomForestRegressor (0-100 score)
3. **Crop Validators** - 22 × RandomForestRegressor (crop-specific)
4. **Anomaly Detector** - IsolationForest (outlier detection)

Plus:
- Feature Scaler (StandardScaler)
- Label Encoder (22 crop names)

---

## 🚀 **QUICK START**

### 1. Install Dependencies
```bash
cd ai_service
pip install -r requirements.txt
```

### 2. Setup Environment
```bash
# Copy example env
cp config.env.example .env

# Edit .env with your DB credentials
```

### 3. Run Service
```bash
python main.py

# Or with uvicorn directly:
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Test
```bash
# Health check
curl http://localhost:8000/api/ai/health

# Test analysis
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

---

## 📡 **API ENDPOINTS**

### **1. Main Analysis**
```
POST /api/ai/analyze
```

**Request Body:**
```json
{
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
  "mode": "discovery",         // or "validation"
  "selected_crop": "coffee"    // required if mode=validation
}
```

**Response:**
```json
{
  "mode": "discovery",
  "crop_recommendation": {
    "best_crop": "coffee",
    "confidence": 0.98,
    "top_3": [...]
  },
  "soil_health": {
    "overall_score": 88.3,
    "rating": "EXCELLENT"
  },
  "crop_validation": null,
  "anomaly_detection": {
    "is_anomaly": false,
    "anomaly_score": -0.0234,
    "status": "✅ NORMAL"
  },
  "timestamp": "2025-10-27T20:00:00",
  "processing_time_ms": 45.23
}
```

---

### **2. Daily Aggregation**
```
POST /api/ai/analyze-daily
```

**Request Body:**
```json
{
  "date": "2025-10-27"
}
```

**Response:**
```json
{
  "date": "2025-10-27",
  "aggregated_data": {
    "sample_count": 48,
    "features": {...},
    "metadata": {...}
  },
  "ai_analysis": {...},
  "saved_to_db": true,
  "record_id": 123
}
```

**Use case:** Called by n8n at 20:00 daily

---

### **3. Health Check**
```
GET /api/ai/health
```

**Response:**
```json
{
  "status": "healthy",
  "models_loaded": 26,
  "model_names": [
    "crop_classifier",
    "soil_health_scorer",
    "anomaly_detector",
    "crop_validators (22)"
  ],
  "uptime_seconds": 3600.5
}
```

---

### **4. Models Info**
```
GET /api/ai/models/info
```

**Response:**
```json
{
  "status": "ok",
  "model_info": {
    "models_loaded": true,
    "total_models": 26,
    "crop_validators_count": 22,
    "available_crops": ["apple", "banana", ...]
  }
}
```

---

## 🔧 **ARCHITECTURE**

```
ai_service/
├── main.py                  # FastAPI app (4 endpoints)
├── models_loader.py         # Load 26 .pkl files
├── inference.py             # AI logic (4 models)
├── daily_aggregator.py      # Daily aggregation & DB save
├── schemas.py               # Pydantic models
├── requirements.txt         # Dependencies
├── config.env.example       # Config template
└── README.md                # This file

Symlinks to:
├── ../ai_module/models/                 # 26 model files
├── ../ai_module/data/feature_scaler.pkl
└── ../ai_module/data/label_encoder.pkl
```

---

## 📊 **WORKFLOW**

### **On-demand Analysis:**
```
User clicks "Analyze" 
    ↓
Frontend → Flask: POST /api/analyze-latest
    ↓
Flask queries latest sensor_readings
    ↓
Flask → AI Service: POST /api/ai/analyze
    ↓
AI Service: Run 4 models
    ↓
Return result → Display to user
```

### **Daily Aggregation (20:00):**
```
n8n Schedule Trigger (20:00)
    ↓
n8n → AI Service: POST /api/ai/analyze-daily
    ↓
AI Service:
  1. Query DB (aggregate today's data)
  2. Run AI analysis
  3. Save to daily_insights table
  4. Return result
    ↓
n8n: Format message
    ↓
n8n: Send to Zalo webhook
```

---

## ⚙️ **CONFIGURATION**

### Environment Variables (.env)
```env
# Database
PGHOST=36.50.134.107
PGPORT=6000
PGDATABASE=db_iot_sensor
PGUSER=admin
PGPASSWORD=admin123

# Service
AI_SERVICE_PORT=8000
AI_SERVICE_HOST=0.0.0.0

# Models Path
MODELS_PATH=../ai_module/models
SCALER_PATH=../ai_module/data/feature_scaler.pkl
ENCODER_PATH=../ai_module/data/label_encoder.pkl
```

---

## 🧪 **TESTING**

### Test Script
```python
import requests

# Test health
response = requests.get("http://localhost:8000/api/ai/health")
print(response.json())

# Test analysis
data = {
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
    "is_raining": False,
    "mode": "discovery"
}

response = requests.post("http://localhost:8000/api/ai/analyze", json=data)
print(response.json())
```

---

## 📈 **PERFORMANCE**

- **Model loading:** ~5-10 seconds (once at startup)
- **Inference time:** ~30-50ms per request
- **Memory usage:** ~500MB (26 models loaded)
- **Concurrent requests:** Supports async via FastAPI

---

## 🐛 **TROUBLESHOOTING**

### Issue: "Models not loaded"
```bash
# Check models exist
ls -l ../ai_module/models/*.pkl

# Check symlinks (if using)
ls -l models/
```

### Issue: "Database connection failed"
```bash
# Test DB connection
psql -h 36.50.134.107 -p 6000 -U admin -d db_iot_sensor
```

### Issue: Port 8000 already in use
```bash
# Change port in .env
AI_SERVICE_PORT=8001

# Or kill process
lsof -ti:8000 | xargs kill -9
```

---

## 🚀 **DEPLOYMENT**

### Development
```bash
python main.py  # Auto-reload enabled
```

### Production
```bash
# With uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4

# With gunicorn (better for production)
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Docker (future)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 📝 **NEXT STEPS**

1. ✅ AI Service running
2. ⏳ Integrate with Flask (on-demand endpoint)
3. ⏳ Setup n8n workflow (daily + Zalo)
4. ⏳ Test end-to-end
5. ⏳ Deploy to production

---

**WAG Team - Pione AI-Blockchain-IoT**

