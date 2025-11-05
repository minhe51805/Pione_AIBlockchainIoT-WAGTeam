"""
Prepare ML data - Split dataset into train/val/test sets
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
import joblib
import json
from pathlib import Path

# Paths
DATA_DIR = Path(__file__).parent / 'data'
DATA_DIR.mkdir(exist_ok=True)

DATASET_PATH = Path(__file__).parent.parent / 'dataset' / 'augmented_soil_data_11_params.csv'

print("=" * 80)
print("📊 PREPARING ML DATA")
print("=" * 80)

# Load dataset
print(f"\n📂 Loading dataset from: {DATASET_PATH}")
df = pd.read_csv(DATASET_PATH)
print(f"   ✅ Loaded {len(df)} rows")

# Separate features and labels
X = df.drop('crop_label', axis=1)
y = df['crop_label']

print(f"\n🎯 Features: {list(X.columns)}")
print(f"🏷️  Labels: {y.nunique()} unique crops")
print(f"   {list(y.unique())}")

# Encode labels
print("\n🔢 Encoding labels...")
label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)
print(f"   ✅ Encoded {len(label_encoder.classes_)} classes")

# Split: 70% train, 15% val, 15% test
print("\n✂️  Splitting data (70/15/15)...")
X_train, X_temp, y_train, y_temp = train_test_split(
    X, y_encoded, test_size=0.3, random_state=42, stratify=y_encoded
)
X_val, X_test, y_val, y_test = train_test_split(
    X_temp, y_temp, test_size=0.5, random_state=42, stratify=y_temp
)

print(f"   ✅ Train: {len(X_train)} samples")
print(f"   ✅ Val:   {len(X_val)} samples")
print(f"   ✅ Test:  {len(X_test)} samples")

# Scale features
print("\n📏 Scaling features...")
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_val_scaled = scaler.transform(X_val)
X_test_scaled = scaler.transform(X_test)
print("   ✅ Features scaled")

# Save datasets
print("\n💾 Saving datasets...")
train_df = pd.DataFrame(X_train_scaled, columns=X.columns)
train_df['label'] = y_train
train_df.to_csv(DATA_DIR / 'train.csv', index=False)

val_df = pd.DataFrame(X_val_scaled, columns=X.columns)
val_df['label'] = y_val
val_df.to_csv(DATA_DIR / 'val.csv', index=False)

test_df = pd.DataFrame(X_test_scaled, columns=X.columns)
test_df['label'] = y_test
test_df.to_csv(DATA_DIR / 'test.csv', index=False)

print(f"   ✅ Saved: {DATA_DIR / 'train.csv'}")
print(f"   ✅ Saved: {DATA_DIR / 'val.csv'}")
print(f"   ✅ Saved: {DATA_DIR / 'test.csv'}")

# Save scaler and encoder
print("\n💾 Saving scaler and encoder...")
joblib.dump(scaler, DATA_DIR / 'feature_scaler.pkl')
joblib.dump(label_encoder, DATA_DIR / 'label_encoder.pkl')
print(f"   ✅ Saved: {DATA_DIR / 'feature_scaler.pkl'}")
print(f"   ✅ Saved: {DATA_DIR / 'label_encoder.pkl'}")

# Save metadata
metadata = {
    'total_samples': len(df),
    'train_samples': len(X_train),
    'val_samples': len(X_val),
    'test_samples': len(X_test),
    'num_features': len(X.columns),
    'num_classes': len(label_encoder.classes_),
    'feature_names': list(X.columns),
    'class_names': list(label_encoder.classes_),
}

with open(DATA_DIR / 'metadata.json', 'w', encoding='utf-8') as f:
    json.dump(metadata, f, indent=2, ensure_ascii=False)

print(f"   ✅ Saved: {DATA_DIR / 'metadata.json'}")

print("\n" + "=" * 80)
print("✅ DATA PREPARATION COMPLETE!")
print("=" * 80)
print(f"\nNext step: Run soil_training.ipynb to train models")

