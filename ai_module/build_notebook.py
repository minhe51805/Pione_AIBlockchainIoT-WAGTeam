"""
Build complete soil_training.ipynb with all cells
"""

import json

notebook = {
    "cells": [],
    "metadata": {
        "kernelspec": {
            "display_name": "Python 3",
            "language": "python",
            "name": "python3"
        },
        "language_info": {
            "codemirror_mode": {"name": "ipython", "version": 3},
            "file_extension": ".py",
            "mimetype": "text/x-python",
            "name": "python",
            "nbconvert_exporter": "python",
            "pygments_lexer": "ipython3",
            "version": "3.12.0"
        }
    },
    "nbformat": 4,
    "nbformat_minor": 2
}

def md(text):
    """Add markdown cell"""
    notebook["cells"].append({
        "cell_type": "markdown",
        "metadata": {},
        "source": [line + "\n" for line in text.split("\n")]
    })

def code(text):
    """Add code cell"""
    notebook["cells"].append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [line + "\n" for line in text.split("\n")]
    })

# Header
md("""# 🤖 SOIL AI MODELS TRAINING

**Project:** Pione AI-Blockchain-IoT (WAG Team)  
**Date:** 2025-10-27  
**Purpose:** Train 4 AI models cho soil analysis

---

## 📋 MODELS TO TRAIN

1. **Crop Classifier** - Recommend best crop (22 classes)
2. **Soil Health Scorer** - Score soil health (0-100)
3. **Crop Validators** - Validate specific crop (22 models)
4. **Anomaly Detector** - Detect abnormal readings

---

## 📊 DATA

- **Train:** 1,540 samples (70%)
- **Val:** 330 samples (15%)
- **Test:** 330 samples (15%)
- **Features:** 11 parameters
- **Labels:** 22 crops

---

## 🎯 SUCCESS CRITERIA

- Crop Classifier accuracy: >85%
- Soil Health Scorer MAE: <5 points
- Anomaly Detector precision: >90%""")

# CELL 1
md("""---

## 📦 CELL 1: Import Libraries

**Nhiệm vụ:**
- Import tất cả thư viện cần thiết
- Setup matplotlib style
- Ignore warnings""")

code("""# ============================================================
# CELL 1: IMPORT LIBRARIES
# ============================================================

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
import json
import warnings
from pathlib import Path

# Scikit-learn
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor, IsolationForest
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report,
    mean_absolute_error, mean_squared_error, r2_score
)
from sklearn.model_selection import cross_val_score

# Plotting style
sns.set_style("whitegrid")
plt.rcParams['figure.figsize'] = (12, 8)
plt.rcParams['font.size'] = 10
warnings.filterwarnings('ignore')

print("✅ Libraries imported successfully!")
print(f"   • pandas: {pd.__version__}")
print(f"   • numpy: {np.__version__}")
print(f"   • scikit-learn available")""")

# CELL 2
md("""---

## 📂 CELL 2: Load Data

**Nhiệm vụ:**
- Load train/val/test datasets
- Load metadata
- Verify data shapes""")

code("""# ============================================================
# CELL 2: LOAD DATA
# ============================================================

print("📂 Loading datasets...")

# Load splits
train_df = pd.read_csv('data/train.csv')
val_df = pd.read_csv('data/val.csv')
test_df = pd.read_csv('data/test.csv')

print(f"✅ Train: {train_df.shape}")
print(f"✅ Val:   {val_df.shape}")
print(f"✅ Test:  {test_df.shape}")

# Load metadata
with open('data/metadata.json', 'r') as f:
    metadata = json.load(f)

print(f"\\n📋 Metadata:")
print(f"   • Total samples: {metadata['total_samples']:,}")
print(f"   • Features: {metadata['num_features']}")
print(f"   • Classes: {metadata['num_classes']}")

# Feature names
feature_names = metadata['feature_names']
class_names = metadata['class_names']

print(f"\\n✅ Data loaded successfully!")""")

# CELL 3
md("""---

## 🔧 CELL 3: Prepare Data

**Nhiệm vụ:**
- Separate features (X) and labels (y)
- Verify no missing values
- Check label distribution""")

code("""# ============================================================
# CELL 3: PREPARE DATA
# ============================================================

print("🔧 Preparing data...")

# Separate features and labels
X_train = train_df[feature_names].values
y_train = train_df['crop_label_encoded'].values
y_train_crop = train_df['crop_label'].values

X_val = val_df[feature_names].values
y_val = val_df['crop_label_encoded'].values

X_test = test_df[feature_names].values
y_test = test_df['crop_label_encoded'].values
y_test_crop = test_df['crop_label'].values

print(f"✅ X_train: {X_train.shape}")
print(f"✅ y_train: {y_train.shape}")

# Check for missing values
print(f"\\n🔍 Missing values:")
print(f"   • X_train: {np.isnan(X_train).sum()}")
print(f"   • X_val:   {np.isnan(X_val).sum()}")
print(f"   • X_test:  {np.isnan(X_test).sum()}")

# Label distribution
unique, counts = np.unique(y_train, return_counts=True)
print(f"\\n📊 Label distribution (train):")
print(f"   • Min: {counts.min()}, Max: {counts.max()}, Mean: {counts.mean():.1f}")
print(f"   • Balanced: {'✅ Yes' if counts.max() - counts.min() <= 5 else '❌ No'}")

print(f"\\n✅ Data preparation complete!")""")

# CELL 4
md("""---

## 🌾 CELL 4: Model 1 - Crop Classifier (Multi-class)

**Nhiệm vụ:**
- Train Random Forest Classifier
- 22 classes (crops)
- Hyperparameters: n_estimators=200, max_depth=20
- Target: >85% accuracy""")

code("""# ============================================================
# CELL 4: MODEL 1 - CROP CLASSIFIER
# ============================================================

print("=" * 80)
print("🌾 TRAINING MODEL 1: CROP CLASSIFIER (22 classes)")
print("=" * 80)

# Create model
crop_classifier = RandomForestClassifier(
    n_estimators=200,
    max_depth=20,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1,
    verbose=1
)

# Train
print("\\n🚀 Training...")
crop_classifier.fit(X_train, y_train)
print("✅ Training complete!")

# Predictions
y_train_pred = crop_classifier.predict(X_train)
y_val_pred = crop_classifier.predict(X_val)
y_test_pred = crop_classifier.predict(X_test)

# Evaluate
train_acc = accuracy_score(y_train, y_train_pred)
val_acc = accuracy_score(y_val, y_val_pred)
test_acc = accuracy_score(y_test, y_test_pred)

print(f"\\n📊 ACCURACY:")
print(f"   • Train: {train_acc:.4f} ({train_acc*100:.2f}%)")
print(f"   • Val:   {val_acc:.4f} ({val_acc*100:.2f}%)")
print(f"   • Test:  {test_acc:.4f} ({test_acc*100:.2f}%)")

# Success check
if test_acc >= 0.85:
    print(f"\\n✅ SUCCESS: Test accuracy {test_acc*100:.2f}% >= 85%")
else:
    print(f"\\n⚠️  WARNING: Test accuracy {test_acc*100:.2f}% < 85%")

# Detailed metrics
print(f"\\n📋 Detailed Metrics (Test set):")
print(f"   • Precision (macro): {precision_score(y_test, y_test_pred, average='macro'):.4f}")
print(f"   • Recall (macro):    {recall_score(y_test, y_test_pred, average='macro'):.4f}")
print(f"   • F1-score (macro):  {f1_score(y_test, y_test_pred, average='macro'):.4f}")

# Save model
Path('models').mkdir(exist_ok=True)
joblib.dump(crop_classifier, 'models/crop_classifier.pkl')
print(f"\\n💾 Model saved: models/crop_classifier.pkl")""")

# Save notebook
with open('soil_training.ipynb', 'w', encoding='utf-8') as f:
    json.dump(notebook, f, indent=1, ensure_ascii=False)

print("✅ Notebook created: soil_training.ipynb")
print(f"   • Total cells: {len(notebook['cells'])}")

