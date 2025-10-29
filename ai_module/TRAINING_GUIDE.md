# 🤖 SOIL AI TRAINING GUIDE

## 📋 Overview

Notebook `soil_training.ipynb` training **4 AI models** cho hệ thống phân tích đất:

1. **Crop Classifier** - Recommend cây trồng tốt nhất (22 classes)
2. **Soil Health Scorer** - Đánh giá sức khỏe đất (0-100)
3. **Crop Validators** - Xác thực cây trồng cụ thể (22 models)
4. **Anomaly Detector** - Phát hiện bất thường trong sensor data

---

## 🎯 Success Criteria

| Model | Metric | Target | Purpose |
|-------|--------|--------|---------|
| Crop Classifier | Accuracy | >85% | Recommend best crop |
| Soil Health Scorer | MAE | <5 points | Score soil quality |
| Crop Validators | Trained | 22 models | Validate specific crop |
| Anomaly Detector | Contamination | 5% | Detect outliers |

---

## 📦 Prerequisites

### 1. Data Ready
```bash
✅ ai_module/data/train.csv          (1,540 samples)
✅ ai_module/data/val.csv            (330 samples)
✅ ai_module/data/test.csv           (330 samples)
✅ ai_module/data/metadata.json
```

### 2. Python Packages
```bash
pip install pandas numpy scikit-learn matplotlib seaborn joblib
```

---

## 🚀 How to Run

### Option 1: VS Code (Recommended)
```bash
1. Open VS Code
2. Install "Jupyter" extension
3. File → Open File → soil_training.ipynb
4. Select Python kernel
5. Run All Cells (Ctrl+Shift+P → "Run All")
```

### Option 2: Jupyter Notebook
```bash
cd ai_module
jupyter notebook
# Open soil_training.ipynb in browser
# Click "Run All"
```

### Option 3: Convert to Python script
```bash
cd ai_module
jupyter nbconvert --to script soil_training.ipynb
python soil_training.py
```

---

## 📊 Notebook Structure (29 cells)

### **Header (Cell 0)**
- Overview & success criteria

### **Setup (Cells 1-3)**
- **Cell 1:** Import libraries
- **Cell 2:** Load data
- **Cell 3:** Prepare features & labels

### **Model 1: Crop Classifier (Cells 4-6)**
- **Cell 4:** Train RandomForestClassifier (22 classes)
- **Cell 5:** Feature importance analysis
- **Cell 6:** Confusion matrix

### **Model 2: Soil Health Scorer (Cells 7-8)**
- **Cell 7:** Train RandomForestRegressor (0-100 score)
- **Cell 8:** Prediction vs actual visualization

### **Model 3: Crop Validators (Cells 9-10)**
- **Cell 9:** Train 22 separate models (1 per crop)
- **Cell 10:** Test validators with sample

### **Model 4: Anomaly Detector (Cells 11-12)**
- **Cell 11:** Train Isolation Forest
- **Cell 12:** Anomaly score distribution

### **Final (Cells 13-14)**
- **Cell 13:** Training summary & save metadata
- **Cell 14:** Complete pipeline test with JSON output

---

## 📁 Output Files

After training, you'll have:

```
ai_module/models/
├── crop_classifier.pkl                        # Model 1 (Random Forest)
├── soil_health_scorer.pkl                     # Model 2 (Regressor)
├── anomaly_detector.pkl                       # Model 4 (Isolation Forest)
├── training_summary.json                      # Metrics summary
├── feature_importance_crop_classifier.png     # Visualization
├── confusion_matrix_crop_classifier.png       # Visualization
├── soil_health_scorer_predictions.png         # Visualization
├── crop_validator_test_example.png            # Visualization
├── anomaly_detector_distribution.png          # Visualization
└── crop_validators/                           # Model 3 (22 files)
    ├── rice_validator.pkl
    ├── coffee_validator.pkl
    ├── ...
    └── model_list.json
```

---

## 🔍 Expected Results

### Model 1: Crop Classifier
```
✅ Test Accuracy: 95-99%
   • Precision: ~0.98
   • Recall: ~0.98
   • F1-score: ~0.98
```

### Model 2: Soil Health Scorer
```
✅ Test MAE: 2-4 points
   • RMSE: 3-5
   • R²: 0.85-0.95
```

### Model 3: Crop Validators
```
✅ 22 models trained
   • Average Val MAE: 5-10 points
   • Each model: ~100 trees
```

### Model 4: Anomaly Detector
```
✅ Contamination: 5%
   • Detected anomalies: ~16-17 samples (5% of 330 test)
   • Score range: -0.5 to 0.0
```

---

## ⚙️ Model Hyperparameters

### Crop Classifier
```python
RandomForestClassifier(
    n_estimators=200,
    max_depth=20,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1
)
```

### Soil Health Scorer
```python
RandomForestRegressor(
    n_estimators=200,
    max_depth=15,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1
)
```

### Crop Validators (×22)
```python
RandomForestRegressor(
    n_estimators=100,
    max_depth=10,
    min_samples_split=5,
    random_state=42,
    n_jobs=-1
)
```

### Anomaly Detector
```python
IsolationForest(
    n_estimators=100,
    contamination=0.05,
    max_samples='auto',
    random_state=42,
    n_jobs=-1
)
```

---

## 🧪 Testing Pipeline (Cell 14)

Final cell generates complete AI output in JSON format:

```json
{
  "mode": "validation",
  "selected_crop": "coffee",
  
  "crop_recommendation": {
    "best_crop": "coffee",
    "confidence": 0.98,
    "top_3": [
      {"crop": "coffee", "probability": 0.98},
      {"crop": "tea", "probability": 0.01},
      {"crop": "rubber", "probability": 0.005}
    ]
  },
  
  "crop_validation": {
    "crop": "coffee",
    "suitability_score": 92.5,
    "verdict": "EXCELLENT"
  },
  
  "soil_health": {
    "overall_score": 88.3,
    "rating": "EXCELLENT"
  },
  
  "anomaly_detection": {
    "is_anomaly": false,
    "anomaly_score": -0.0234,
    "status": "✅ NORMAL"
  }
}
```

---

## ⏱️ Training Time

On typical laptop (4 cores, 8GB RAM):

| Model | Time | Details |
|-------|------|---------|
| Crop Classifier | ~30s | 200 trees, 22 classes |
| Soil Health Scorer | ~25s | 200 trees, regression |
| Crop Validators | ~2-3 min | 22 models × 100 trees each |
| Anomaly Detector | ~10s | 100 trees, unsupervised |
| **TOTAL** | **~4-5 min** | End-to-end training |

---

## 🐛 Troubleshooting

### Issue 1: "FileNotFoundError: data/train.csv"
```bash
# Run data preparation first
cd ai_module
python prepare_ml_data.py
```

### Issue 2: "MemoryError" during training
```python
# Reduce n_estimators in notebook cells:
n_estimators=100  # instead of 200
```

### Issue 3: Jupyter kernel not found
```bash
# Install ipykernel
pip install ipykernel
python -m ipykernel install --user
```

### Issue 4: Plots not showing
```python
# Add at top of notebook:
%matplotlib inline
```

---

## 🚀 Next Steps

After training completion:

1. ✅ **Verify models:**
   ```bash
   ls -lh models/*.pkl
   ```

2. ✅ **Check metrics:**
   ```bash
   cat models/training_summary.json
   ```

3. ⏳ **Deploy API:**
   - Create FastAPI service
   - Load trained models
   - Serve predictions

4. ⏳ **Integrate with pipeline:**
   - Connect to Flask ingestion
   - Trigger AI analysis
   - Store results in DB

---

## 📞 Support

- **File:** `ai_module/soil_training.ipynb`
- **Dataset:** `dataset/augmented_soil_data_11_params.csv`
- **Docs:** `ai_module/AI_MODULE_SPECIFICATION.md`

**WAG Team - Pione AI-Blockchain-IoT**

