# ✅ TRAINING NOTEBOOK COMPLETE!

**Date:** 2025-10-27  
**Status:** ✅ READY TO RUN  
**File:** `ai_module/soil_training.ipynb`

---

## 📊 Notebook Overview

### 🎯 Purpose
Training notebook for **4 AI models** trong Pione AI-Blockchain-IoT system:

1. **Crop Classifier** - Multi-class classification (22 crops)
2. **Soil Health Scorer** - Regression (0-100 score)
3. **Crop Validators** - 22 binary regressors (crop-specific)
4. **Anomaly Detector** - Isolation Forest outlier detection

---

## 📋 Notebook Structure

### Total Cells: **29** (14 markdown + 15 code)

```
┌─────────────────────────────────────────────────────────┐
│ HEADER (Cell 0)                                         │
│   • Project overview                                    │
│   • Success criteria                                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ SETUP (Cells 1-3)                                       │
│   • Cell 1: Import libraries                            │
│   • Cell 2: Load train/val/test data                    │
│   • Cell 3: Prepare features & labels                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ MODEL 1: Crop Classifier (Cells 4-6)                   │
│   • Cell 4: Train RandomForestClassifier                │
│       - 200 trees, max_depth=20                         │
│       - Target: >85% accuracy                           │
│   • Cell 5: Feature importance analysis                 │
│       - Visualize top 11 features                       │
│   • Cell 6: Confusion matrix                            │
│       - Per-class accuracy                              │
│       - Best/worst crops                                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ MODEL 2: Soil Health Scorer (Cells 7-8)                │
│   • Cell 7: Train RandomForestRegressor                 │
│       - 200 trees, max_depth=15                         │
│       - Target: MAE < 5 points                          │
│   • Cell 8: Prediction vs actual plot                   │
│       - Error distribution                              │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ MODEL 3: Crop Validators (Cells 9-10)                  │
│   • Cell 9: Train 22 separate models                    │
│       - 1 model per crop                                │
│       - 100 trees each, max_depth=10                    │
│       - Predict suitability score (0-100)               │
│   • Cell 10: Test validators                            │
│       - Test all 22 on 1 sample                         │
│       - Rank crops by suitability                       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ MODEL 4: Anomaly Detector (Cells 11-12)                │
│   • Cell 11: Train Isolation Forest                     │
│       - 100 trees, contamination=5%                     │
│       - Detect outliers in sensor readings              │
│   • Cell 12: Anomaly score distribution                 │
│       - Visualize normal vs anomaly                     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ FINAL (Cells 13-14)                                     │
│   • Cell 13: Training summary                           │
│       - Model inventory                                 │
│       - Performance metrics                             │
│       - Save metadata JSON                              │
│   • Cell 14: Complete pipeline test                     │
│       - Test all 4 models on 1 sample                   │
│       - Generate final JSON output                      │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Expected Performance

| Model | Metric | Expected | Target |
|-------|--------|----------|--------|
| **Crop Classifier** | Accuracy | 95-99% | >85% ✅ |
| **Soil Health Scorer** | MAE | 2-4 points | <5 ✅ |
| **Crop Validators (×22)** | Avg MAE | 5-10 points | - ✅ |
| **Anomaly Detector** | Detected | ~5% of test | 5% ✅ |

---

## 📁 Output Files

After running notebook, these files will be created:

```
ai_module/models/
├── crop_classifier.pkl                        (Model 1)
├── soil_health_scorer.pkl                     (Model 2)
├── anomaly_detector.pkl                       (Model 4)
├── training_summary.json                      (Metadata)
├── feature_importance_crop_classifier.png
├── confusion_matrix_crop_classifier.png
├── soil_health_scorer_predictions.png
├── crop_validator_test_example.png
├── anomaly_detector_distribution.png
└── crop_validators/                           (Model 3)
    ├── rice_validator.pkl
    ├── maize_validator.pkl
    ├── chickpea_validator.pkl
    ├── kidneybeans_validator.pkl
    ├── pigeonpeas_validator.pkl
    ├── mothbeans_validator.pkl
    ├── mungbean_validator.pkl
    ├── blackgram_validator.pkl
    ├── lentil_validator.pkl
    ├── pomegranate_validator.pkl
    ├── banana_validator.pkl
    ├── mango_validator.pkl
    ├── grapes_validator.pkl
    ├── watermelon_validator.pkl
    ├── muskmelon_validator.pkl
    ├── apple_validator.pkl
    ├── orange_validator.pkl
    ├── papaya_validator.pkl
    ├── coconut_validator.pkl
    ├── cotton_validator.pkl
    ├── jute_validator.pkl
    ├── coffee_validator.pkl
    └── model_list.json
```

**Total:** 27 model files + 5 visualizations + 2 metadata files

---

## 🚀 How to Run

### Option 1: VS Code (Recommended)
```bash
1. Open VS Code
2. Install "Jupyter" extension
3. Open: ai_module/soil_training.ipynb
4. Select Python kernel
5. Run All Cells (Ctrl+Alt+Enter)
```

### Option 2: Jupyter
```bash
cd ai_module
jupyter notebook soil_training.ipynb
# Click "Run All" in browser
```

### Option 3: Command Line
```bash
cd ai_module
pip install jupyter nbconvert
jupyter nbconvert --to notebook --execute soil_training.ipynb
```

---

## ⏱️ Training Time

On typical laptop (4 cores, 8GB RAM):

- **Cell 1-3** (Setup): ~5 seconds
- **Cell 4-6** (Crop Classifier): ~30 seconds
- **Cell 7-8** (Soil Health): ~25 seconds
- **Cell 9-10** (Crop Validators): **~2-3 minutes** ⚠️
- **Cell 11-12** (Anomaly): ~10 seconds
- **Cell 13-14** (Summary): ~5 seconds

**TOTAL:** ~4-5 minutes ⏱️

---

## 🔍 Key Features

### ✅ Cell 1: Import Libraries
- pandas, numpy, scikit-learn
- matplotlib, seaborn for visualization
- joblib for model saving

### ✅ Cell 2: Load Data
- train.csv (1,540 samples)
- val.csv (330 samples)
- test.csv (330 samples)
- metadata.json (feature names, class names)

### ✅ Cell 3: Prepare Data
- Separate X (features) and y (labels)
- Verify no missing values
- Check label distribution (balanced)

### ✅ Cell 4: Crop Classifier
- RandomForestClassifier(n_estimators=200)
- Train on 11 features
- Predict 22 crop classes
- Evaluate accuracy, precision, recall, F1

### ✅ Cell 5: Feature Importance
- Extract feature_importances_
- Identify top 5 most important parameters
- Visualize horizontal bar chart

### ✅ Cell 6: Confusion Matrix
- Heatmap for top 10 crops
- Per-class accuracy
- Identify best/worst crops

### ✅ Cell 7: Soil Health Scorer
- Generate synthetic health scores (0-100)
- RandomForestRegressor(n_estimators=200)
- Evaluate MAE, RMSE, R²

### ✅ Cell 8: Health Score Visualization
- Scatter plot: predicted vs actual
- Histogram: error distribution
- Check MAE < 5 threshold

### ✅ Cell 9: Crop Validators
- Loop through 22 crops
- Train 1 RandomForestRegressor per crop
- Save to models/crop_validators/
- Print Val MAE for each

### ✅ Cell 10: Test Validators
- Load all 22 validators
- Predict suitability for 1 sample
- Rank crops by score
- Visualize top 10

### ✅ Cell 11: Anomaly Detector
- IsolationForest(contamination=0.05)
- Fit on training data
- Predict anomalies on test set
- Count anomalies (~5% expected)

### ✅ Cell 12: Anomaly Visualization
- Histogram: anomaly score distribution
- Scatter: normal vs anomaly samples
- Show 5% threshold line

### ✅ Cell 13: Training Summary
- Create models_summary dict
- Print performance for all 4 models
- Save to training_summary.json
- List all output files

### ✅ Cell 14: Final Pipeline Test
- Pick random test sample
- Run all 4 models
- Generate complete JSON output
- Show final results

---

## 📤 Final JSON Output Format

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

## 🔧 Code Quality

### ✅ Best Practices
- Clear comments for each section
- Consistent naming conventions
- Error handling where needed
- Progress printing (training status)
- Visualization for every model
- Model saving after training

### ✅ Reproducibility
- Fixed random_state=42 everywhere
- Documented hyperparameters
- Save metadata.json
- Version control friendly

### ✅ Performance
- n_jobs=-1 (use all CPU cores)
- Efficient sklearn implementations
- Vectorized operations
- No unnecessary loops

---

## 🚀 Next Steps

### Immediate:
1. ✅ **Run notebook** - Execute all cells
2. ✅ **Verify models** - Check models/ directory
3. ✅ **Review metrics** - Open training_summary.json

### Next Phase:
4. ⏳ **Deploy API** - Create FastAPI service
5. ⏳ **Load models** - Serve predictions via API
6. ⏳ **Integrate pipeline** - Connect to Flask/Node.js
7. ⏳ **Test end-to-end** - IoT → DB → AI → Blockchain

---

## 📞 Support Files

- **Notebook:** `ai_module/soil_training.ipynb`
- **Guide:** `ai_module/TRAINING_GUIDE.md`
- **Dataset:** `dataset/augmented_soil_data_11_params.csv`
- **Data prep:** `ai_module/data/` (train/val/test splits)
- **Spec:** `ai_module/AI_MODULE_SPECIFICATION.md`

---

## ✅ Checklist

- [x] Notebook created (29 cells)
- [x] All models defined (4 models)
- [x] Clear comments and documentation
- [x] Visualizations for each model (5 plots)
- [x] Training summary cell
- [x] Final pipeline test cell
- [x] JSON output format
- [x] Ready to run
- [ ] Execute notebook
- [ ] Verify model performance
- [ ] Deploy API service

---

## 🎉 Summary

**Notebook:** ✅ COMPLETE (29 cells)  
**Models:** 4 (Classifier + Regressor + 22 Validators + Anomaly)  
**Training time:** ~4-5 minutes  
**Output files:** 34 files (models + plots + metadata)  
**Status:** 🚀 READY TO RUN

**WAG Team - Pione AI-Blockchain-IoT Project**

