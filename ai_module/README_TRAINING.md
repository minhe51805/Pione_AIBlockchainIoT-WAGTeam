# 🎯 QUICK START - AI MODEL TRAINING

## ✅ Notebook: `soil_training.ipynb`

**Status:** ✅ READY TO RUN  
**Total Cells:** 29 (14 code + 15 markdown)  
**Training Time:** ~4-5 minutes  
**Output:** 4 AI models + 5 visualizations

---

## 🚀 3 STEPS TO RUN

### 1. Open Notebook
```bash
# Option A: VS Code (recommended)
- Open VS Code
- Install "Jupyter" extension
- File → Open → soil_training.ipynb
- Select Python kernel

# Option B: Jupyter
cd ai_module
jupyter notebook soil_training.ipynb
```

### 2. Run All Cells
```bash
# VS Code: Ctrl+Alt+Enter hoặc "Run All"
# Jupyter: Cell → Run All
```

### 3. Verify Output
```bash
# Check models created
ls models/

# Should see:
✅ crop_classifier.pkl
✅ soil_health_scorer.pkl
✅ anomaly_detector.pkl
✅ crop_validators/ (22 files)
✅ training_summary.json
```

---

## 📊 What Gets Trained?

| # | Model | Type | Purpose | Output |
|---|-------|------|---------|--------|
| 1 | **Crop Classifier** | RandomForest (22 classes) | Recommend best crop | crop_classifier.pkl |
| 2 | **Soil Health Scorer** | RandomForest Regressor | Score soil (0-100) | soil_health_scorer.pkl |
| 3 | **Crop Validators** | 22 × RandomForest Regressor | Validate specific crop | crop_validators/*.pkl |
| 4 | **Anomaly Detector** | Isolation Forest | Detect outliers | anomaly_detector.pkl |

---

## 🎯 Expected Performance

- **Crop Classifier:** 95-99% accuracy ✅
- **Soil Health:** MAE < 5 points ✅
- **Crop Validators:** 22 models trained ✅
- **Anomaly Detector:** ~5% detected ✅

---

## 📁 Notebook Structure

```
CELL 0:  📋 Overview & Success Criteria
CELL 1:  📦 Import Libraries
CELL 2:  📂 Load Data (train/val/test)
CELL 3:  🔧 Prepare Features & Labels
───────────────────────────────────────
CELL 4:  🌾 Train Crop Classifier
CELL 5:  📊 Feature Importance
CELL 6:  🎯 Confusion Matrix
───────────────────────────────────────
CELL 7:  🌱 Train Soil Health Scorer
CELL 8:  📈 Prediction vs Actual
───────────────────────────────────────
CELL 9:  ☕ Train 22 Crop Validators
CELL 10: 🧪 Test Validators
───────────────────────────────────────
CELL 11: 🚨 Train Anomaly Detector
CELL 12: 📊 Anomaly Distribution
───────────────────────────────────────
CELL 13: 📋 Training Summary
CELL 14: 🧪 Final Pipeline Test
```

---

## ⏱️ Timeline

| Step | Time | Description |
|------|------|-------------|
| Cells 1-3 | 5s | Setup & load data |
| Cells 4-6 | 30s | Crop classifier |
| Cells 7-8 | 25s | Soil health scorer |
| **Cells 9-10** | **2-3 min** | **22 crop validators** ⚠️ |
| Cells 11-12 | 10s | Anomaly detector |
| Cells 13-14 | 5s | Summary & test |
| **TOTAL** | **~4-5 min** | ✅ |

---

## 📤 Final Output (Cell 14)

Notebook sẽ tạo JSON output như này:

```json
{
  "mode": "validation",
  "selected_crop": "coffee",
  
  "crop_recommendation": {
    "best_crop": "coffee",
    "confidence": 0.98,
    "top_3": [...]
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
    "status": "✅ NORMAL"
  }
}
```

---

## 🐛 Troubleshooting

### "FileNotFoundError: data/train.csv"
```bash
# Run data preparation first
python prepare_ml_data.py
```

### "MemoryError"
```python
# Reduce trees in notebook:
n_estimators=100  # instead of 200
```

### Jupyter kernel not found
```bash
pip install ipykernel
python -m ipykernel install --user
```

---

## 📚 Documentation

- **Full Guide:** `TRAINING_GUIDE.md` (detailed)
- **Completion Report:** `TRAINING_COMPLETE.md` (summary)
- **AI Spec:** `AI_MODULE_SPECIFICATION.md` (architecture)

---

## 🚀 After Training

### Verify Models
```bash
# Check files created
ls -lh models/*.pkl

# View metrics
cat models/training_summary.json

# See visualizations
open models/*.png
```

### Next Steps
1. ✅ Models trained
2. ⏳ Deploy FastAPI service
3. ⏳ Integrate with blockchain pipeline
4. ⏳ Test end-to-end

---

## 📞 Quick Reference

| File | Purpose |
|------|---------|
| `soil_training.ipynb` | **Main training notebook** ⭐ |
| `data/train.csv` | Training set (1,540 samples) |
| `data/val.csv` | Validation set (330 samples) |
| `data/test.csv` | Test set (330 samples) |
| `models/*.pkl` | Trained models (output) |
| `TRAINING_GUIDE.md` | Detailed guide |

---

**✅ Everything ready! Just open notebook and Run All!**

**WAG Team - Pione AI-Blockchain-IoT**

