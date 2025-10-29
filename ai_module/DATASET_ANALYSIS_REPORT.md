# 📊 DATASET ANALYSIS REPORT - AI MODULE

**Generated:** 2025-10-27  
**Project:** Pione AI-Blockchain-IoT (WAG Team)  
**Target:** Train AI model cho 11 thông số soil & weather

---

## 📋 TÓM TẮT EXECUTIVE

### ✅ Dataset Khả Dụng: Kaggle Crop Recommendation

| Metric | Value | Status |
|--------|-------|--------|
| **Total Samples** | 2,200 | ✅ Đủ để train |
| **Coverage** | 7/11 parameters (63.6%) | ⚠️ Thiếu 4 thông số |
| **Data Quality** | ⭐⭐⭐⭐ (4/5) | ✅ Excellent |
| **Missing Values** | 0 | ✅ Perfect |
| **Duplicates** | 0 | ✅ Clean |
| **Outliers** | 2-9% per column | ✅ Acceptable |
| **Labels** | 22 crop types | ✅ Balanced |

---

## 📊 CHI TIẾT DATASET

### **1. Kaggle Crop Recommendation Dataset**

**Source:** `dataset/Crop_recommendation.csv`  
**Rows:** 2,200  
**Columns:** 8 (7 features + 1 label)

#### **Columns:**

| # | Column | Type | Unit | Range | Mean | Unique Values |
|---|--------|------|------|-------|------|---------------|
| 1 | `N` | int64 | mg/kg | 0 - 140 | 50.55 | 137 |
| 2 | `P` | int64 | mg/kg | 5 - 145 | 53.36 | 117 |
| 3 | `K` | int64 | mg/kg | 5 - 205 | 48.15 | 73 |
| 4 | `temperature` | float64 | °C | 8.83 - 43.68 | 25.62 | 2200 |
| 5 | `humidity` | float64 | % | 14.26 - 99.98 | 71.48 | 2200 |
| 6 | `ph` | float64 | - | 3.50 - 9.94 | 6.47 | 2200 |
| 7 | `rainfall` | float64 | mm | 20.21 - 298.56 | 103.46 | 2200 |
| 8 | `label` | object | - | 22 crops | - | 22 |

#### **Label Distribution:**

Dataset có **22 loại cây trồng**, mỗi loại có **100 samples** (perfectly balanced):

```
rice, maize, jute, cotton, coconut, papaya, orange, apple, 
muskmelon, watermelon, grapes, mango, banana, pomegranate,
lentil, blackgram, mungbean, mothbeans, pigeonpeas, 
kidneybeans, chickpea, coffee
```

**⭐ Ưu điểm:** Balanced dataset → không cần SMOTE/oversampling

---

## 🔗 MAPPING VỚI HỆ THỐNG 11 THÔNG SỐ

### ✅ **7/11 Thông Số Có Sẵn**

| Hệ Thống (IoT) | Dataset (Kaggle) | Mapping | Notes |
|----------------|------------------|---------|-------|
| `nitrogen` | `N` | ✅ Direct | mg/kg |
| `phosphorus` | `P` | ✅ Direct | mg/kg |
| `potassium` | `K` | ✅ Direct | mg/kg |
| `ph` | `ph` | ✅ Direct | pH scale |
| `air_temperature` | `temperature` | ✅ Direct | Assume air temp |
| `air_humidity` | `humidity` | ✅ Direct | Assume air RH% |
| `is_raining` | `rainfall` | ⚠️ Convert | mm → boolean (threshold) |

### ❌ **4/11 Thông Số Thiếu**

| Hệ Thống (IoT) | Unit | Strategy |
|----------------|------|----------|
| `soil_temperature` | °C | 🔧 Synthetic: `air_temp - (2~5°C)` |
| `soil_moisture` | % | 🔧 Synthetic: `f(rainfall, humidity)` |
| `conductivity` | µS/cm | 🔧 Synthetic: `f(N+P+K, moisture)` |
| `salt` | mg/L | 🔧 Synthetic: `f(EC, moisture)` |

---

## 📈 DATA QUALITY ANALYSIS

### **1. Missing Values**
```
✅ PERFECT: 0 missing values trong toàn bộ dataset
```

### **2. Duplicates**
```
✅ CLEAN: 0 duplicate rows
```

### **3. Outliers (IQR Method)**

| Column | Outliers | Percentage | Assessment |
|--------|----------|------------|------------|
| N | 0 | 0.00% | ✅ Perfect |
| P | 138 | 6.27% | ✅ Acceptable |
| K | 200 | 9.09% | ✅ Acceptable |
| temperature | 86 | 3.91% | ✅ Good |
| humidity | 30 | 1.36% | ✅ Excellent |
| ph | 57 | 2.59% | ✅ Good |
| rainfall | 100 | 4.55% | ✅ Acceptable |

**💡 Đánh giá:** Outliers < 10% là acceptable, không cần xử lý aggressive.

### **4. Value Distribution**

#### **NPK Distribution:**
- **Nitrogen (N):** Skewed right (nhiều mẫu có N thấp)
- **Phosphorus (P):** Fairly balanced
- **Potassium (K):** Skewed right (nhiều mẫu có K thấp)

#### **Weather Distribution:**
- **Temperature:** Normal distribution (μ=25.6°C, σ=5.06°C)
- **Humidity:** Slightly left-skewed (nhiều mẫu có humidity cao)
- **Rainfall:** Right-skewed (nhiều mẫu có rainfall thấp)

#### **pH Distribution:**
- Normal distribution (μ=6.47, σ=0.77)
- Range: 3.5 - 9.94 (covers từ acidic → alkaline)

---

## 🎯 CHIẾN LƯỢC AUGMENTATION

### **OPTION 1: Synthetic Generation (RECOMMENDED)** ⭐⭐⭐⭐⭐

**Timeline:** 1-2 tuần  
**Complexity:** Medium  
**Quality:** Good (80-85%)

#### **Step 1: Generate Soil Temperature**

```python
soil_temp = air_temp - offset
where:
  offset = 2°C (shallow soil, dry)
         = 5°C (deep soil, wet)
  offset = f(moisture, season, depth)
```

**Formula:**
```python
soil_temp = temperature - (2 + moisture/100 * 3) + noise
noise ~ N(0, 1)
```

#### **Step 2: Generate Soil Moisture**

```python
moisture = base_moisture + rainfall_effect + humidity_effect
where:
  base_moisture = 30% (average)
  rainfall_effect = min(rainfall/10, 40)  # cap at 40%
  humidity_effect = (humidity - 50) / 10
```

**Formula:**
```python
soil_moisture = 30 + min(rainfall/10, 40) + (humidity-50)/10
soil_moisture = clip(soil_moisture, 10, 90)
```

#### **Step 3: Generate Electrical Conductivity (EC)**

EC tăng khi:
- NPK cao (nhiều ions)
- Moisture cao (ions di chuyển dễ hơn)

```python
EC = base + NPK_effect + moisture_effect
where:
  base = 100 µS/cm
  NPK_effect = (N + P + K) * 3
  moisture_effect = soil_moisture * 8
```

**Formula:**
```python
conductivity = 100 + (N + P + K) * 3 + soil_moisture * 8
conductivity = conductivity + noise  # noise ~ N(0, 50)
```

#### **Step 4: Generate Salinity**

Salt correlate với EC (TDS conversion):

```python
salt = EC * 0.64  # typical TDS conversion factor
salt = salt + noise  # noise ~ N(0, 20)
```

#### **Step 5: Convert Rainfall to Boolean**

```python
is_raining = True if rainfall > threshold else False
threshold = median(rainfall) ≈ 95 mm
```

**Strategy:**
- 50% samples → `is_raining = True`
- 50% samples → `is_raining = False`

---

### **OPTION 2: Download UCI Soil Dataset** ⭐⭐⭐

**Timeline:** 2-3 tuần  
**Complexity:** High (merge complexity)  
**Quality:** Excellent (90-95%)

**Pros:**
- Real EC, Soil Moisture, Soil Temperature data
- Research-grade quality

**Cons:**
- Cần merge với Kaggle dataset (complex)
- Khác scale, khác region
- Cần domain expertise để map correctly

---

### **OPTION 3: Hybrid (Synthetic + Transfer Learning)** ⭐⭐⭐⭐⭐

**Timeline:** 3-4 tuần  
**Complexity:** Medium-High  
**Quality:** Best (95%+)

**Workflow:**
```
1. Week 1: Generate synthetic dataset (Option 1)
2. Week 2: Train baseline models
3. Week 3: Collect 200-500 real samples từ IoT
4. Week 4: Fine-tune models với real data (transfer learning)
```

**⭐ Khuyến nghị:** Đây là approach tốt nhất cho production system!

---

## 📊 EXPECTED AUGMENTED DATASET

### **After Augmentation:**

| Column | Original | Augmented | Source |
|--------|----------|-----------|--------|
| nitrogen | ✅ | ✅ | Kaggle |
| phosphorus | ✅ | ✅ | Kaggle |
| potassium | ✅ | ✅ | Kaggle |
| ph | ✅ | ✅ | Kaggle |
| air_temperature | ✅ | ✅ | Kaggle |
| air_humidity | ✅ | ✅ | Kaggle |
| rainfall (mm) | ✅ | - | Kaggle (will drop) |
| is_raining | - | ✅ | Synthetic (from rainfall) |
| soil_temperature | - | ✅ | Synthetic |
| soil_moisture | - | ✅ | Synthetic |
| conductivity | - | ✅ | Synthetic |
| salt | - | ✅ | Synthetic |

**Final:** 2,200 rows × 11 features + 1 label (crop)

---

## 🚀 NEXT STEPS

### **Phase 1: Data Preparation (Week 1)**
- [x] Analyze existing dataset
- [ ] Implement augmentation script
- [ ] Validate synthetic data
- [ ] Split train/val/test (70/15/15)
- [ ] Feature scaling & normalization

### **Phase 2: Model Development (Week 2)**
- [ ] Baseline model (Random Forest)
- [ ] Deep learning model (Neural Network)
- [ ] Soil health scoring model
- [ ] Anomaly detection model

### **Phase 3: Training & Evaluation (Week 3)**
- [ ] Train models
- [ ] Hyperparameter tuning
- [ ] Cross-validation
- [ ] Performance metrics

### **Phase 4: Deployment (Week 4)**
- [ ] Model serving API (FastAPI)
- [ ] Integration với blockchain pipeline
- [ ] Real-time prediction endpoint
- [ ] Monitoring & logging

---

## ❓ DECISION REQUIRED

**Bạn muốn chọn chiến lược nào?**

1. ⚡ **OPTION 1 - Synthetic Only** (Fastest, 1-2 weeks)
2. 🔬 **OPTION 2 - UCI Merge** (Best quality, 2-3 weeks)
3. 🚀 **OPTION 3 - Hybrid** (Production-ready, 3-4 weeks) ⭐ **RECOMMENDED**

**Sau khi chọn, tôi sẽ:**
- Implement augmentation script
- Generate 11-parameter dataset
- Begin model training pipeline

---

**Report generated by:** AI Module Development Team  
**Contact:** WAG Team - Pione Project

