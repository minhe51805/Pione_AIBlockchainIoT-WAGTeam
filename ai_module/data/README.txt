
DATA PREPARATION SUMMARY
========================

Dataset: augmented_soil_data_11_params.csv
Total Samples: 2,200

SPLITS:
-------
Train: 1,540 samples (70.0%)
Val:   330 samples (15.0%)
Test:  330 samples (15.0%)

FEATURES (11):
--------------
 1. soil_temperature
 2. soil_moisture
 3. conductivity
 4. ph
 5. nitrogen
 6. phosphorus
 7. potassium
 8. salt
 9. air_temperature
10. air_humidity
11. is_raining

LABELS (22 crops):
------------------
apple, banana, blackgram, chickpea, coconut, coffee, cotton, grapes, jute, kidneybeans
... (and 12 more)

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
