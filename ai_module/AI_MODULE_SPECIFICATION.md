# 🤖 AI MODULE - COMPLETE SPECIFICATION

**Project:** Pione AI-Blockchain-IoT (WAG Team)  
**Version:** 2.0 (Updated with Temporal Analysis)  
**Date:** 2025-10-27

---

## 🎯 MỤC TIÊU TỔNG QUAN

Xây dựng AI Module phân tích dữ liệu IoT sensor (11 thông số) để:

1. **Gợi ý cây trồng phù hợp** (Crop Recommendation)
2. **Đánh giá sức khỏe đất** (Soil Health Scoring)
3. **Phát hiện bất thường** (Anomaly Detection)
4. **Xác thực cây đang trồng** (Crop Validation)
5. **Phân tích xu hướng theo thời gian** (Temporal Analysis) ← **MỚI**
6. **Báo cáo tự động theo ngày** (Daily Reports) ← **MỚI**
7. **Phân tích theo yêu cầu** (On-demand Analysis) ← **MỚI**

---

## 📊 INPUT DATA

### **11 Thông Số IoT:**

| # | Parameter | Unit | Range | Frequency |
|---|-----------|------|-------|-----------|
| 1 | soil_temperature | °C | -10 to 45 | 15 mins |
| 2 | soil_moisture | % | 0 to 100 | 15 mins |
| 3 | conductivity | µS/cm | 0 to 5000 | 15 mins |
| 4 | ph | - | 0 to 14 | 15 mins |
| 5 | nitrogen | mg/kg | 0 to 200 | 15 mins |
| 6 | phosphorus | mg/kg | 0 to 200 | 15 mins |
| 7 | potassium | mg/kg | 0 to 300 | 15 mins |
| 8 | salt | mg/L | 0 to 3000 | 15 mins |
| 9 | air_temperature | °C | -20 to 50 | 15 mins |
| 10 | air_humidity | % | 0 to 100 | 15 mins |
| 11 | is_raining | boolean | 0 or 1 | 15 mins |

**Data Flow:**
```
IoT Device → Flask API → PostgreSQL → Node.js → Blockchain
                              ↓
                         AI Analysis
```

---

## 🧠 AI MODELS

### **Model 1: Multi-class Crop Classifier**

**Purpose:** Recommend best crop for current soil conditions

**Type:** Random Forest / Neural Network  
**Input:** 11 parameters (single reading)  
**Output:** 22 crop probabilities

```python
Input:  [22.3, 45.2, 850, 6.8, 45, 30, 180, 600, 25.1, 70.0, 1]
Output: {
  "rice": 0.92,
  "maize": 0.05,
  "coffee": 0.02,
  ...
}
```

**Training Data:** 2,200 samples (7 real + 4 synthetic params)  
**Validation Accuracy Target:** >85%

---

### **Model 2: Crop-Specific Validators (22 models)**

**Purpose:** Assess soil suitability for a SPECIFIC crop user is growing

**Type:** 22 separate regression models (one per crop)  
**Input:** 11 parameters  
**Output:** Suitability score (0-100)

```python
# Example: Coffee Validator
CoffeeValidator.predict([22.3, 45.2, 850, 6.8, ...])
→ Output: 78.5 (means 78.5% suitable for coffee)
```

**Why 22 models?**
- Each crop has different ideal ranges
- Coffee: pH 6.0-7.0, K: 200-250
- Rice: pH 5.5-7.0, K: 150-200
- → Need specialized models

**Training Strategy:**
- Binary labels: 1 if sample is from crop X, 0 otherwise
- Regression on suitability score

---

### **Model 3: Soil Health Scorer**

**Purpose:** Overall soil quality assessment (independent of crop)

**Type:** Regression model  
**Input:** 11 parameters  
**Output:** Soil health score (0-100)

```python
Input:  [22.3, 45.2, 850, 6.8, 45, 30, 180, 600, 25.1, 70.0, 1]
Output: 78.5

Breakdown:
- Nutrient balance (NPK): 85/100
- pH level: 90/100
- Moisture adequacy: 75/100
- Salinity risk: 60/100
- Overall: 78.5/100
```

**Scoring Formula:**
```python
health_score = weighted_average([
  npk_balance * 0.3,
  ph_status * 0.2,
  moisture * 0.2,
  salinity * 0.15,
  organic_matter * 0.15
])
```

---

### **Model 4: Anomaly Detector**

**Purpose:** Detect abnormal sensor readings

**Type:** Isolation Forest / Autoencoder  
**Input:** 11 parameters + historical data  
**Output:** Anomaly flag + anomalous features

```python
Input:  [22.3, 45.2, 2500, 6.8, ...]  # EC = 2500 (abnormally high)
Output: {
  "is_anomaly": true,
  "anomaly_score": 0.85,
  "anomalous_features": ["conductivity", "salt"]
}
```

**Use Cases:**
- Sensor malfunction detection
- Sudden soil contamination
- Irrigation system failure

---

### **Model 5: Temporal Trend Analyzer** ← **MỚI**

**Purpose:** Analyze trends over time (daily, weekly, monthly)

**Type:** Time series analysis + Statistical methods  
**Input:** Aggregated historical data (multiple readings)  
**Output:** Trends, predictions, alerts

```python
Input:  7 days of readings (96 readings/day × 7 = 672 readings)
Output: {
  "trends": {
    "ph": "stable",          # pH không đổi
    "nitrogen": "decreasing", # N đang giảm
    "moisture": "increasing"  # Độ ẩm tăng
  },
  "predictions": {
    "nitrogen_depleted_in": "14 days"  # N sẽ cạn trong 14 ngày
  },
  "alerts": [
    "⚠️ Nitrogen declining - Add fertilizer within 2 weeks"
  ]
}
```

**Methods:**
- Moving averages (7-day, 30-day)
- Linear regression for trend detection
- ARIMA for forecasting

---

## 🔧 CHỨC NĂNG CHI TIẾT

### **CHỨC NĂNG 1: CROP RECOMMENDATION** (Discovery Mode)

**Khi nào dùng:** Nông dân chưa trồng gì, muốn biết nên trồng cây gì

**API Endpoint:** `POST /api/analyze`

**Request:**
```json
{
  "mode": "discovery",
  "sensor_data": {
    "soil_temperature": 22.3,
    "soil_moisture": 45.2,
    "conductivity": 850,
    "ph": 6.8,
    "nitrogen": 45,
    "phosphorus": 30,
    "potassium": 180,
    "salt": 600,
    "air_temperature": 25.1,
    "air_humidity": 70.0,
    "is_raining": true
  },
  "selected_crop": null
}
```

**Response:**
```json
{
  "mode": "discovery",
  "recommendation": {
    "best_crop": "rice",
    "confidence": 0.92,
    
    "reasoning": {
      "strengths": [
        "High soil moisture (45.2%) ideal for rice",
        "pH (6.8) within rice's preferred range (5.5-7.0)",
        "Adequate nitrogen (45 mg/kg) for rice growth"
      ],
      "considerations": [
        "Potassium slightly low - consider K fertilizer"
      ]
    },
    
    "top_alternatives": [
      {
        "crop": "rice",
        "probability": 0.92,
        "suitability_score": 92.0
      },
      {
        "crop": "maize",
        "probability": 0.05,
        "suitability_score": 67.5
      },
      {
        "crop": "cotton",
        "probability": 0.02,
        "suitability_score": 54.2
      }
    ]
  },
  
  "soil_health": {...},
  "anomaly_detection": {...},
  "timestamp": "2025-10-27T12:00:00Z"
}
```

---

### **CHỨC NĂNG 2: CROP VALIDATION** (Validation Mode)

**Khi nào dùng:** Nông dân đã trồng coffee, muốn biết đất có phù hợp không

**API Endpoint:** `POST /api/analyze`

**Request:**
```json
{
  "mode": "validation",
  "sensor_data": {...},
  "selected_crop": "coffee"
}
```

**Response:**
```json
{
  "mode": "validation",
  "selected_crop": "coffee",
  
  "crop_validation": {
    "suitability_score": 78.5,
    "verdict": "GOOD",
    "confidence": 0.89,
    
    "parameter_analysis": {
      "ph": {
        "current": 6.8,
        "ideal_range": [6.0, 7.0],
        "status": "OPTIMAL",
        "score": 95
      },
      "nitrogen": {
        "current": 45,
        "ideal_range": [40, 60],
        "status": "OPTIMAL",
        "score": 92
      },
      "potassium": {
        "current": 180,
        "ideal_range": [200, 250],
        "status": "BELOW_OPTIMAL",
        "score": 65,
        "deficit": -20
      },
      "salinity": {
        "current": 600,
        "critical_threshold": 800,
        "status": "MONITOR",
        "score": 70
      }
    },
    
    "recommendations": [
      {
        "priority": "HIGH",
        "category": "fertilizer",
        "action": "Increase potassium fertilizer",
        "details": "Add K2O to raise K from 180 to 220 mg/kg",
        "quantity": "40 kg K2O per hectare",
        "timing": "Before rainy season"
      },
      {
        "priority": "MEDIUM",
        "category": "monitoring",
        "action": "Monitor salinity levels",
        "details": "Salt approaching coffee tolerance limit",
        "frequency": "Bi-weekly checks"
      }
    ],
    
    "comparison_to_ideal": {
      "your_soil": {"ph": 6.8, "N": 45, "P": 30, "K": 180},
      "ideal_for_coffee": {"ph": "6.0-7.0", "N": "40-60", "P": "25-35", "K": "200-250"},
      "gaps": ["Potassium: -20 to -70 mg/kg"]
    },
    
    "alternatives": [
      {
        "crop": "banana",
        "suitability_score": 85.2,
        "reason": "Better K utilization, same pH preference"
      }
    ]
  },
  
  "soil_health": {...},
  "anomaly_detection": {...}
}
```

---

### **CHỨC NĂNG 3: SOIL HEALTH SCORING**

**Khi nào dùng:** Đánh giá tổng thể chất lượng đất (không phụ thuộc cây trồng)

**Included in:** All API responses

**Response:**
```json
{
  "soil_health": {
    "overall_score": 78.5,
    "rating": "GOOD",
    
    "breakdown": {
      "nutrient_balance": {
        "score": 85,
        "npk_ratio": "1.5:1.0:6.0",
        "status": "Balanced but K dominant"
      },
      "ph_level": {
        "score": 90,
        "value": 6.8,
        "classification": "Neutral (optimal)"
      },
      "moisture_adequacy": {
        "score": 75,
        "value": 45.2,
        "status": "Adequate"
      },
      "salinity_risk": {
        "score": 60,
        "value": 600,
        "status": "Monitor required"
      },
      "organic_matter_estimate": {
        "score": 70,
        "estimated_from_ec": "Medium",
        "note": "Based on conductivity correlation"
      }
    },
    
    "issues": [
      "⚠️ Salinity approaching concern level",
      "✅ pH optimal for most crops",
      "✅ NPK balanced"
    ],
    
    "general_recommendations": [
      "Monitor salt accumulation",
      "Maintain current pH levels",
      "Consider organic amendments"
    ]
  }
}
```

---

### **CHỨC NĂNG 4: ANOMALY DETECTION**

**Khi nào dùng:** Phát hiện sensor lỗi hoặc thay đổi đột ngột

**Included in:** All API responses

**Response:**
```json
{
  "anomaly_detection": {
    "is_anomaly": true,
    "anomaly_score": 0.85,
    "severity": "HIGH",
    
    "anomalous_features": [
      {
        "feature": "conductivity",
        "current_value": 2500,
        "expected_range": [400, 1500],
        "deviation": "+166%",
        "severity": "HIGH"
      },
      {
        "feature": "salt",
        "current_value": 1800,
        "expected_range": [200, 1000],
        "deviation": "+180%",
        "severity": "HIGH"
      }
    },
    
    "possible_causes": [
      "Sensor malfunction (check EC probe)",
      "Soil contamination (salt water intrusion?)",
      "Over-fertilization",
      "Irrigation water quality issue"
    ],
    
    "immediate_actions": [
      "Verify sensor calibration",
      "Test irrigation water salinity",
      "Flush soil with clean water if contamination confirmed",
      "Stop fertilizer application until resolved"
    ]
  }
}
```

---

### **CHỨC NĂNG 5: DAILY AGGREGATION & REPORT** ← **MỚI**

**Khi nào dùng:** Tự động cuối mỗi ngày (23:59) hoặc theo yêu cầu

**API Endpoint:** `POST /api/daily-report`

**Request:**
```json
{
  "date": "2025-10-27",
  "user_crop": "coffee"  // Optional
}
```

**Process:**
```
1. Query PostgreSQL: Lấy tất cả readings trong ngày (96 readings)
2. Aggregate statistics: mean, min, max, std per parameter
3. Run AI analysis on aggregated data
4. Compare with previous days
5. Generate trends
6. Store report in DB + Blockchain
```

**Response:**
```json
{
  "report_type": "daily",
  "date": "2025-10-27",
  "user_crop": "coffee",
  "total_readings": 96,
  
  "daily_statistics": {
    "soil_temperature": {
      "mean": 22.3,
      "min": 20.1,
      "max": 24.5,
      "std": 1.2,
      "trend_vs_yesterday": "+0.5°C",
      "status": "stable"
    },
    "soil_moisture": {
      "mean": 45.2,
      "min": 42.0,
      "max": 48.5,
      "std": 2.1,
      "trend_vs_yesterday": "+2.3%",
      "status": "increasing"
    },
    "nitrogen": {
      "mean": 45,
      "min": 44,
      "max": 46,
      "std": 0.8,
      "trend_vs_yesterday": "-1 mg/kg",
      "status": "slowly_decreasing"
    }
    // ... all 11 parameters
  },
  
  "daily_crop_validation": {
    "crop": "coffee",
    "avg_suitability_score": 78.5,
    "trend_vs_yesterday": "+2.3 points",
    "verdict": "IMPROVING"
  },
  
  "daily_soil_health": {
    "avg_score": 78.5,
    "trend_vs_yesterday": "+1.2 points",
    "rating": "GOOD"
  },
  
  "daily_anomalies": {
    "count": 2,
    "incidents": [
      {
        "time": "2025-10-27T14:30:00Z",
        "feature": "conductivity",
        "spike": 2500,
        "resolved": true
      }
    ]
  },
  
  "trends_7_days": {
    "nitrogen": {
      "direction": "decreasing",
      "rate": "-0.5 mg/kg per day",
      "forecast": "Will reach critical (30 mg/kg) in 30 days",
      "alert": "⚠️ Add nitrogen fertilizer within 3 weeks"
    },
    "ph": {
      "direction": "stable",
      "rate": "±0.02 per day",
      "status": "✅ Optimal range maintained"
    }
  },
  
  "summary": {
    "overall_status": "GOOD",
    "key_insights": [
      "✅ Soil conditions remain favorable for coffee",
      "⚠️ Nitrogen declining - fertilization needed soon",
      "✅ Moisture levels increasing due to rain"
    ],
    "priority_actions": [
      {
        "priority": 1,
        "action": "Plan nitrogen fertilizer application",
        "deadline": "Within 21 days"
      }
    ]
  },
  
  "weather_summary": {
    "avg_air_temp": 25.1,
    "avg_humidity": 70.0,
    "rain_hours": 8,
    "rain_percentage": "33%"
  },
  
  "timestamp": "2025-10-27T23:59:00Z",
  "report_id": "daily_20251027_coffee"
}
```

**Storage:**
- Save to PostgreSQL: `daily_insights` table
- Save to Blockchain: Hash of report + key metrics
- Retrieve later: `/api/reports?date=2025-10-27`

---

### **CHỨC NĂNG 6: ON-DEMAND ANALYSIS** ← **MỚI**

**Khi nào dùng:** Người dùng mở DApp, click "Phân tích đất ngay"

**API Endpoint:** `POST /api/analyze-now`

**Request:**
```json
{
  "analysis_type": "current",     // "current" or "period"
  "user_crop": "coffee",
  "period": null                   // null for current, or {"start": "2025-10-20", "end": "2025-10-27"}
}
```

**Scenario 1: Current Analysis**
```json
{
  "analysis_type": "current",
  "user_crop": "coffee"
}
```

**Process:**
1. Query latest reading from DB (last 15 mins)
2. Run all 4 models (Recommend, Validate, Health, Anomaly)
3. Return instant analysis

**Response:** Same as Mode 2 (Crop Validation)

---

**Scenario 2: Period Analysis**
```json
{
  "analysis_type": "period",
  "user_crop": "coffee",
  "period": {
    "start": "2025-10-20",
    "end": "2025-10-27"
  }
}
```

**Process:**
1. Query all readings in period (7 days × 96 = 672 readings)
2. Aggregate statistics
3. Trend analysis
4. Compare with previous period

**Response:**
```json
{
  "analysis_type": "period",
  "period": "2025-10-20 to 2025-10-27",
  "total_readings": 672,
  "user_crop": "coffee",
  
  "period_statistics": {
    // Same as daily_statistics but for 7 days
  },
  
  "trends": {
    "nitrogen": {
      "start_value": 48,
      "end_value": 45,
      "change": -3,
      "percent_change": -6.25,
      "direction": "decreasing",
      "forecast_30_days": 39,
      "alert": "⚠️ Nitrogen declining"
    }
  },
  
  "crop_suitability_trend": {
    "scores": [78, 78, 79, 78, 77, 78, 79],  // Daily scores
    "avg": 78.1,
    "trend": "stable",
    "verdict": "Soil remains suitable for coffee"
  },
  
  "recommendations": [
    "Address nitrogen decline",
    "Monitor moisture (increasing trend)",
    "Maintain current pH management"
  ]
}
```

---

### **CHỨC NĂNG 7: WEEKLY/MONTHLY REPORTS** ← **MỚI**

**Khi nào dùng:** Tự động hàng tuần (Sunday 23:59) hoặc cuối tháng

**API Endpoint:** `POST /api/period-report`

**Request:**
```json
{
  "report_type": "weekly",  // or "monthly"
  "week": "2025-W43",       // ISO week
  "user_crop": "coffee"
}
```

**Response:**
```json
{
  "report_type": "weekly",
  "period": "2025-10-20 to 2025-10-27",
  "user_crop": "coffee",
  "total_readings": 672,
  
  "weekly_summary": {
    "avg_suitability_score": 78.5,
    "avg_soil_health": 79.2,
    "anomaly_count": 5,
    "rain_days": 3
  },
  
  "parameter_trends": {
    // Trends for all 11 parameters over the week
  },
  
  "key_events": [
    {
      "date": "2025-10-23",
      "event": "Heavy rain",
      "impact": "Moisture spiked to 65%, then normalized"
    },
    {
      "date": "2025-10-25",
      "event": "EC anomaly",
      "impact": "Sensor recalibrated"
    }
  ],
  
  "week_over_week_comparison": {
    "suitability_score": "+1.5 points",
    "nitrogen": "-3 mg/kg",
    "ph": "stable"
  },
  
  "recommendations_for_next_week": [
    "Apply nitrogen fertilizer (10 kg N per hectare)",
    "Monitor post-fertilization EC levels",
    "Continue current irrigation schedule"
  ],
  
  "forecast_next_week": {
    "nitrogen": "If no action: 42 mg/kg (approaching low)",
    "moisture": "Expected stable (45-50%)",
    "suitability": "Will decline to 75 if N not addressed"
  }
}
```

---

## 🔄 WORKFLOW TỔNG HỢP

### **Real-time Flow:**
```
IoT Sensor (15 mins)
  ↓
Flask API (/api/data)
  ↓
PostgreSQL (sensor_readings)
  ↓
Node.js Bridge
  ↓
Blockchain (immutable storage)
  
  ↓ (parallel)
  
AI Analysis (on-demand or scheduled)
  ↓
Analysis Results → PostgreSQL (ai_insights)
  ↓
DApp displays to user
```

### **Daily Report Flow:**
```
Cron Job (23:59 daily)
  ↓
Query PostgreSQL (96 readings của ngày)
  ↓
AI Aggregation + Trend Analysis
  ↓
Generate Daily Report
  ↓
Store: PostgreSQL (daily_insights) + Blockchain (hash)
  ↓
Notify user (optional)
```

### **On-demand Flow:**
```
User opens DApp → Click "Phân tích đất ngay"
  ↓
POST /api/analyze-now
  ↓
Query latest reading (or period)
  ↓
Run AI models
  ↓
Return instant analysis
  ↓
Display in DApp
```

---

## 📁 DATABASE SCHEMA (Updated)

### **Table: `sensor_readings`** (existing)
```sql
CREATE TABLE sensor_readings (
  id SERIAL PRIMARY KEY,
  measured_at_vn TIMESTAMPTZ NOT NULL,
  soil_temperature_c REAL,
  soil_moisture_pct REAL,
  conductivity_us_cm INT,
  ph_value NUMERIC(3,1),
  nitrogen_mg_kg INT,
  phosphorus_mg_kg INT,
  potassium_mg_kg INT,
  salt_mg_l INT,
  air_temperature_c REAL,
  air_humidity_pct REAL,
  is_raining BOOLEAN,
  onchain_status VARCHAR(20),
  created_at_vn TIMESTAMPTZ DEFAULT NOW()
);
```

### **Table: `ai_insights` (NEW)**
```sql
CREATE TABLE ai_insights (
  id SERIAL PRIMARY KEY,
  analysis_type VARCHAR(50),  -- 'on-demand', 'daily', 'weekly'
  analyzed_at_vn TIMESTAMPTZ NOT NULL,
  user_crop VARCHAR(50),
  
  -- Results
  crop_recommendation JSONB,
  crop_validation JSONB,
  soil_health JSONB,
  anomaly_detection JSONB,
  
  -- Metadata
  readings_count INT,
  confidence_avg REAL,
  created_at_vn TIMESTAMPTZ DEFAULT NOW()
);
```

### **Table: `daily_insights` (NEW)**
```sql
CREATE TABLE daily_insights (
  id SERIAL PRIMARY KEY,
  date_vn DATE NOT NULL UNIQUE,
  user_crop VARCHAR(50),
  
  -- Aggregated statistics
  daily_statistics JSONB,
  trends_7_days JSONB,
  
  -- Analysis results
  avg_suitability_score REAL,
  avg_soil_health_score REAL,
  anomaly_count INT,
  
  -- Report
  summary JSONB,
  recommendations JSONB,
  
  -- Blockchain
  onchain_report_hash VARCHAR(66),
  onchain_status VARCHAR(20),
  
  created_at_vn TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_daily_insights_date ON daily_insights(date_vn DESC);
```

---

## 🚀 IMPLEMENTATION ROADMAP

### **Phase 1: Core AI Models** (Week 1) - 🔄 IN PROGRESS
- [x] Data preparation (train/val/test split)
- [ ] Train Model 1: Multi-class Classifier (22 crops)
- [ ] Train Model 2: 22 Crop Validators
- [ ] Train Model 3: Soil Health Scorer
- [ ] Train Model 4: Anomaly Detector
- [ ] Model evaluation & validation

**Deliverables:**
- 25+ trained models (.pkl files)
- Model performance reports
- Feature importance analysis

---

### **Phase 2: Basic API** (Week 2)
- [ ] FastAPI setup
- [ ] Endpoint: `/api/analyze` (Discovery & Validation modes)
- [ ] Load models & scalers
- [ ] JSON output formatting
- [ ] Error handling
- [ ] API documentation (Swagger)

**Deliverables:**
- Working FastAPI service
- Postman collection
- API documentation

---

### **Phase 3: Temporal Analysis** (Week 3) ← **MỚI**
- [ ] Train Model 5: Temporal Trend Analyzer
- [ ] Endpoint: `/api/daily-report`
- [ ] Endpoint: `/api/analyze-now` (on-demand)
- [ ] Endpoint: `/api/period-report` (weekly/monthly)
- [ ] Database schema migration (ai_insights, daily_insights)
- [ ] Cron job setup (daily reports at 23:59)

**Deliverables:**
- Temporal analysis models
- Daily/weekly/monthly report endpoints
- Automated report generation

---

### **Phase 4: Integration** (Week 4)
- [ ] Connect AI API ← → Node.js bridge
- [ ] Connect AI API ← → PostgreSQL (direct queries)
- [ ] Store AI results on blockchain (hashes)
- [ ] DApp integration (display analysis results)
- [ ] Real-time analysis on new IoT data

**Deliverables:**
- Full pipeline: IoT → DB → AI → Blockchain → DApp
- Real-time predictions
- Historical analysis

---

### **Phase 5: LLM Enhancement** (Week 5) - OPTIONAL
- [ ] Integrate GPT-4/Claude for Vietnamese reports
- [ ] Natural language summaries
- [ ] Conversational interface ("Tại sao K thấp?")
- [ ] Actionable advice generation

**Deliverables:**
- Vietnamese language reports
- Chatbot interface (optional)

---

### **Phase 6: Fine-tuning** (Week 6+)
- [ ] Collect 200-500 real IoT samples
- [ ] Compare synthetic vs real distributions
- [ ] Fine-tune models with transfer learning
- [ ] A/B testing
- [ ] Production deployment

---

## 📊 API ENDPOINTS SUMMARY

| Endpoint | Method | Purpose | Mode |
|----------|--------|---------|------|
| `/api/analyze` | POST | Real-time analysis | Discovery/Validation |
| `/api/analyze-now` | POST | On-demand analysis | Current/Period |
| `/api/daily-report` | POST | Daily aggregated report | Auto/Manual |
| `/api/period-report` | POST | Weekly/monthly report | Auto/Manual |
| `/api/reports` | GET | Retrieve historical reports | Query |
| `/api/trends` | GET | Get parameter trends | Query |
| `/health` | GET | API health check | Monitoring |

---

## 💾 OUTPUT FORMATS

### **All responses include:**
```json
{
  "status": "success",
  "timestamp": "2025-10-27T12:00:00Z",
  "mode": "validation",
  "user_crop": "coffee",
  
  // Core analysis
  "crop_recommendation": {...},      // if mode=discovery
  "crop_validation": {...},          // if mode=validation
  "soil_health": {...},              // always
  "anomaly_detection": {...},        // always
  
  // Temporal (if applicable)
  "trends": {...},                   // if period analysis
  "forecast": {...},                 // if requested
  
  // Metadata
  "metadata": {
    "model_version": "1.0",
    "confidence_threshold": 0.7,
    "readings_used": 1
  }
}
```

---

## ✅ SUCCESS METRICS

### **Model Performance:**
- Crop Classifier accuracy: >85%
- Crop Validator MAE: <10 points
- Soil Health Scorer MAE: <5 points
- Anomaly Detector precision: >90%

### **API Performance:**
- Response time: <500ms (single reading)
- Response time: <3s (daily aggregation)
- Uptime: >99%

### **Business Metrics:**
- Daily report generation: 100% success rate
- Prediction accuracy (vs real outcomes): Monitor & improve
- User satisfaction: Collect feedback

---

## 🎯 DELIVERABLES SUMMARY

### **Week 1:**
- ✅ Dataset prepared (2,200 samples, 11 params)
- ✅ Train/val/test splits
- [ ] 25+ trained AI models

### **Week 2:**
- [ ] FastAPI service
- [ ] Basic endpoints (analyze)

### **Week 3:**
- [ ] Temporal analysis models
- [ ] Daily/weekly/monthly reports
- [ ] On-demand analysis

### **Week 4:**
- [ ] Full integration (IoT → AI → Blockchain)
- [ ] DApp displays AI results

### **Week 5+:**
- [ ] LLM integration (optional)
- [ ] Fine-tuning with real data

---

## 📞 CONTACT & NOTES

**Team:** WAG Team - Pione AI-Blockchain-IoT  
**Document Version:** 2.0  
**Last Updated:** 2025-10-27

**Key Decisions:**
1. ✅ Use 22 crops (all from Kaggle)
2. ✅ Implement 2 modes: Discovery + Validation
3. ✅ Add temporal analysis (daily/weekly/monthly)
4. ✅ On-demand analysis for DApp users
5. ✅ Detailed JSON output (for LLM later)

**Next Update:** After Phase 1 completion (AI models trained)

---

**END OF SPECIFICATION**

