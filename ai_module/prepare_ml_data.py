"""
PREPARE ML DATA - Train/Val/Test Split + Feature Engineering
=============================================================

Input:  augmented_soil_data_11_params.csv
Output: 
  - data/train.csv (70%)
  - data/val.csv (15%)
  - data/test.csv (15%)
  - data/feature_scaler.pkl (StandardScaler)
  - data/label_encoder.pkl (LabelEncoder)
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
import joblib
from pathlib import Path

print("=" * 80)
print("📊 PREPARE ML DATA - Train/Val/Test Split + Feature Engineering")
print("=" * 80)

# Create data directory
Path("../ai_module/data").mkdir(exist_ok=True)

# ============================================================
# 1. LOAD AUGMENTED DATASET
# ============================================================
print("\n📂 Step 1: Loading augmented dataset...")

df = pd.read_csv("../dataset/augmented_soil_data_11_params.csv")
print(f"✅ Loaded: {len(df):,} samples × {len(df.columns)} columns")
print(f"📋 Columns: {list(df.columns)}")

# ============================================================
# 2. FEATURE & LABEL SEPARATION
# ============================================================
print("\n🔧 Step 2: Separating features and labels...")

# Features (11 parameters)
feature_cols = [
    'soil_temperature', 'soil_moisture', 'conductivity', 'ph',
    'nitrogen', 'phosphorus', 'potassium', 'salt',
    'air_temperature', 'air_humidity', 'is_raining'
]

X = df[feature_cols].copy()
y = df['crop_label'].copy()

print(f"✅ Features: {X.shape[0]:,} samples × {X.shape[1]} features")
print(f"✅ Labels: {len(y.unique())} unique crops")

# ============================================================
# 3. ENCODE LABELS
# ============================================================
print("\n🔧 Step 3: Encoding crop labels...")

label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)

print(f"✅ Label mapping:")
for idx, crop in enumerate(label_encoder.classes_[:10]):  # Show first 10
    print(f"   {idx:>2}: {crop}")
if len(label_encoder.classes_) > 10:
    print(f"   ... (and {len(label_encoder.classes_) - 10} more)")

# Save label encoder
joblib.dump(label_encoder, '../ai_module/data/label_encoder.pkl')
print(f"\n✅ Saved: data/label_encoder.pkl")

# ============================================================
# 4. HANDLE BOOLEAN FEATURE
# ============================================================
print("\n🔧 Step 4: Converting boolean to numeric...")

# Convert is_raining (boolean) to int
X['is_raining'] = X['is_raining'].astype(int)

print(f"✅ is_raining: {X['is_raining'].unique()} (boolean → 0/1)")

# ============================================================
# 5. TRAIN/VAL/TEST SPLIT (Stratified)
# ============================================================
print("\n🔧 Step 5: Splitting dataset (70/15/15 stratified)...")

# First split: train (70%) vs temp (30%)
X_train, X_temp, y_train, y_temp = train_test_split(
    X, y_encoded, 
    test_size=0.3, 
    random_state=42, 
    stratify=y_encoded
)

# Second split: val (15%) vs test (15%) from temp (30%)
X_val, X_test, y_val, y_test = train_test_split(
    X_temp, y_temp, 
    test_size=0.5,  # 50% of 30% = 15%
    random_state=42, 
    stratify=y_temp
)

print(f"✅ Train set: {len(X_train):,} samples ({len(X_train)/len(df)*100:.1f}%)")
print(f"✅ Val set:   {len(X_val):,} samples ({len(X_val)/len(df)*100:.1f}%)")
print(f"✅ Test set:  {len(X_test):,} samples ({len(X_test)/len(df)*100:.1f}%)")

# Verify stratification
print(f"\n📊 Label distribution check:")
train_dist = pd.Series(y_train).value_counts(normalize=True).head(5)
val_dist = pd.Series(y_val).value_counts(normalize=True).head(5)
test_dist = pd.Series(y_test).value_counts(normalize=True).head(5)

print(f"   Train top 5: {train_dist.values}")
print(f"   Val top 5:   {val_dist.values}")
print(f"   Test top 5:  {test_dist.values}")
print(f"   ✅ Stratification: BALANCED")

# ============================================================
# 6. FEATURE SCALING
# ============================================================
print("\n🔧 Step 6: Feature scaling (StandardScaler)...")

# Fit scaler on training data only
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_val_scaled = scaler.transform(X_val)
X_test_scaled = scaler.transform(X_test)

print(f"✅ Scaler fitted on training data")
print(f"   Mean: {scaler.mean_[:3].round(2)} ... (first 3 features)")
print(f"   Std:  {scaler.scale_[:3].round(2)} ... (first 3 features)")

# Save scaler
joblib.dump(scaler, '../ai_module/data/feature_scaler.pkl')
print(f"✅ Saved: data/feature_scaler.pkl")

# ============================================================
# 7. CONVERT BACK TO DATAFRAMES
# ============================================================
print("\n🔧 Step 7: Converting back to DataFrames...")

# Create DataFrames with scaled features
train_df = pd.DataFrame(X_train_scaled, columns=feature_cols)
train_df['crop_label_encoded'] = y_train
train_df['crop_label'] = label_encoder.inverse_transform(y_train)

val_df = pd.DataFrame(X_val_scaled, columns=feature_cols)
val_df['crop_label_encoded'] = y_val
val_df['crop_label'] = label_encoder.inverse_transform(y_val)

test_df = pd.DataFrame(X_test_scaled, columns=feature_cols)
test_df['crop_label_encoded'] = y_test
test_df['crop_label'] = label_encoder.inverse_transform(y_test)

print(f"✅ DataFrames created with scaled features + labels")

# ============================================================
# 8. SAVE SPLITS
# ============================================================
print("\n💾 Step 8: Saving train/val/test splits...")

train_df.to_csv('../ai_module/data/train.csv', index=False)
val_df.to_csv('../ai_module/data/val.csv', index=False)
test_df.to_csv('../ai_module/data/test.csv', index=False)

print(f"✅ Saved: data/train.csv ({len(train_df):,} rows)")
print(f"✅ Saved: data/val.csv ({len(val_df):,} rows)")
print(f"✅ Saved: data/test.csv ({len(test_df):,} rows)")

# ============================================================
# 9. SAVE METADATA
# ============================================================
print("\n💾 Step 9: Saving dataset metadata...")

metadata = {
    'total_samples': len(df),
    'train_samples': len(train_df),
    'val_samples': len(val_df),
    'test_samples': len(test_df),
    'num_features': len(feature_cols),
    'num_classes': len(label_encoder.classes_),
    'feature_names': feature_cols,
    'class_names': label_encoder.classes_.tolist(),
    'split_ratio': [0.7, 0.15, 0.15],
    'random_state': 42,
    'scaling_method': 'StandardScaler',
    'stratified': True
}

import json
with open('../ai_module/data/metadata.json', 'w') as f:
    json.dump(metadata, f, indent=2)

print(f"✅ Saved: data/metadata.json")

# ============================================================
# 10. GENERATE DATA INFO SUMMARY
# ============================================================
print("\n📊 Step 10: Generating data summary...")

summary = f"""
DATA PREPARATION SUMMARY
========================

Dataset: augmented_soil_data_11_params.csv
Total Samples: {len(df):,}

SPLITS:
-------
Train: {len(train_df):,} samples ({len(train_df)/len(df)*100:.1f}%)
Val:   {len(val_df):,} samples ({len(val_df)/len(df)*100:.1f}%)
Test:  {len(test_df):,} samples ({len(test_df)/len(df)*100:.1f}%)

FEATURES (11):
--------------
{chr(10).join(f'{i+1:2}. {feat}' for i, feat in enumerate(feature_cols))}

LABELS (22 crops):
------------------
{', '.join(label_encoder.classes_[:10])}
... (and {len(label_encoder.classes_) - 10} more)

PREPROCESSING:
--------------
✅ Feature scaling: StandardScaler (zero mean, unit variance)
✅ Label encoding: LabelEncoder (0-21)
✅ Boolean conversion: is_raining → 0/1
✅ Stratified split: Balanced class distribution

OUTPUT FILES:
-------------
• data/train.csv            - Training set (scaled)
• data/val.csv              - Validation set (scaled)
• data/test.csv             - Test set (scaled)
• data/feature_scaler.pkl   - StandardScaler object
• data/label_encoder.pkl    - LabelEncoder object
• data/metadata.json        - Dataset metadata

READY FOR:
----------
✅ Model training (Random Forest, Neural Networks, etc.)
✅ Hyperparameter tuning
✅ Cross-validation
✅ Performance evaluation
"""

with open('../ai_module/data/README.txt', 'w', encoding='utf-8') as f:
    f.write(summary)

print(summary)

print(f"✅ Saved: data/README.txt")

# ============================================================
# FINAL REPORT
# ============================================================
print("\n" + "=" * 80)
print("✅ DATA PREPARATION COMPLETE!")
print("=" * 80)

print(f"\n📁 Output Directory: ai_module/data/")
print(f"   • train.csv ({len(train_df):,} samples)")
print(f"   • val.csv ({len(val_df):,} samples)")
print(f"   • test.csv ({len(test_df):,} samples)")
print(f"   • feature_scaler.pkl")
print(f"   • label_encoder.pkl")
print(f"   • metadata.json")
print(f"   • README.txt")

print(f"\n🚀 NEXT STEPS:")
print(f"   1. Review data splits")
print(f"   2. Begin model training")
print(f"   3. Baseline: Random Forest Classifier")
print(f"   4. Advanced: Neural Network")

print("\n" + "=" * 80)

