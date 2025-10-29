"""
Script phân tích datasets cho AI Module
- Kiểm tra cấu trúc, chất lượng, missing values
- So sánh với 11 thông số của hệ thống
- Đề xuất strategy merge/augment
"""

import pandas as pd
import numpy as np
import os

# ============================================================
# DANH SÁCH 11 THÔNG SỐ CỦA HỆ THỐNG
# ============================================================
REQUIRED_PARAMS = {
    # Soil Indicators (8)
    'soil_temperature': '°C',
    'soil_moisture': '%',
    'conductivity': 'µS/cm',
    'ph': '',
    'nitrogen': 'mg/kg',
    'phosphorus': 'mg/kg',
    'potassium': 'mg/kg',
    'salt': 'mg/L',
    # Air/Weather Indicators (3)
    'air_temperature': '°C',
    'air_humidity': '%',
    'is_raining': 'boolean'
}

print("=" * 80)
print("🔍 PHÂN TÍCH DATASETS CHO AI MODULE - 11 THÔNG SỐ")
print("=" * 80)

# ============================================================
# 1. KAGGLE - CROP RECOMMENDATION DATASET
# ============================================================
print("\n" + "=" * 80)
print("📊 DATASET 1: Kaggle Crop Recommendation")
print("=" * 80)

crop_file = "../dataset/Crop_recommendation.csv"

if os.path.exists(crop_file):
    df_crop = pd.read_csv(crop_file)
    
    print(f"\n✅ File loaded: {crop_file}")
    print(f"📏 Shape: {df_crop.shape[0]:,} rows × {df_crop.shape[1]} columns")
    
    print("\n📋 Columns:")
    for i, col in enumerate(df_crop.columns, 1):
        dtype = df_crop[col].dtype
        nulls = df_crop[col].isnull().sum()
        uniques = df_crop[col].nunique()
        print(f"  {i}. {col.ljust(15)} | Type: {str(dtype).ljust(10)} | Nulls: {nulls:>4} | Unique: {uniques:>4}")
    
    print("\n📊 Statistical Summary:")
    print(df_crop.describe().round(2))
    
    print("\n🏷️  Labels (Target variable):")
    if 'label' in df_crop.columns:
        label_counts = df_crop['label'].value_counts()
        print(f"  Total classes: {len(label_counts)}")
        print(f"\n  Top 10 crops:")
        for crop, count in label_counts.head(10).items():
            pct = (count / len(df_crop)) * 100
            print(f"    - {crop.ljust(15)}: {count:>4} samples ({pct:>5.2f}%)")
    
    # Mapping với 11 thông số
    print("\n🔗 MAPPING VỚI 11 THÔNG SỐ HỆ THỐNG:")
    print("-" * 80)
    
    mapping = {
        'N': ('nitrogen', '✅ Direct match'),
        'P': ('phosphorus', '✅ Direct match'),
        'K': ('potassium', '✅ Direct match'),
        'ph': ('ph', '✅ Direct match'),
        'temperature': ('air_temperature', '✅ Direct match (assume air temp)'),
        'humidity': ('air_humidity', '✅ Direct match (assume air humidity)'),
        'rainfall': ('is_raining', '⚠️  Need convert (mm → boolean)')
    }
    
    available = []
    for csv_col, (sys_param, status) in mapping.items():
        if csv_col in df_crop.columns:
            available.append(sys_param)
            print(f"  ✅ {csv_col.ljust(15)} → {sys_param.ljust(20)} {status}")
    
    missing = [p for p in REQUIRED_PARAMS if p not in available]
    print(f"\n❌ THIẾU {len(missing)}/11 thông số:")
    for param in missing:
        unit = REQUIRED_PARAMS[param]
        print(f"  - {param.ljust(20)} ({unit})")
    
    print(f"\n📈 Coverage: {len(available)}/11 = {(len(available)/11)*100:.1f}%")
    
    # Data quality checks
    print("\n🔍 DATA QUALITY CHECKS:")
    print("-" * 80)
    
    # Check for duplicates
    duplicates = df_crop.duplicated().sum()
    print(f"  • Duplicate rows: {duplicates} ({(duplicates/len(df_crop)*100):.2f}%)")
    
    # Check for missing values
    total_nulls = df_crop.isnull().sum().sum()
    print(f"  • Missing values: {total_nulls}")
    
    # Check value ranges
    print(f"\n  • Value Ranges:")
    for col in ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']:
        if col in df_crop.columns:
            min_val = df_crop[col].min()
            max_val = df_crop[col].max()
            mean_val = df_crop[col].mean()
            print(f"    - {col.ljust(15)}: [{min_val:>7.2f}, {max_val:>7.2f}] | Mean: {mean_val:>7.2f}")
    
    # Check for outliers (simple IQR method)
    print(f"\n  • Outliers (IQR method):")
    for col in ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']:
        if col in df_crop.columns:
            Q1 = df_crop[col].quantile(0.25)
            Q3 = df_crop[col].quantile(0.75)
            IQR = Q3 - Q1
            outliers = ((df_crop[col] < (Q1 - 1.5 * IQR)) | (df_crop[col] > (Q3 + 1.5 * IQR))).sum()
            outlier_pct = (outliers / len(df_crop)) * 100
            print(f"    - {col.ljust(15)}: {outliers:>4} outliers ({outlier_pct:>5.2f}%)")
    
    # Save summary
    summary = {
        'dataset': 'Kaggle_Crop_Recommendation',
        'rows': len(df_crop),
        'columns': len(df_crop.columns),
        'coverage': f"{len(available)}/11",
        'coverage_pct': round((len(available)/11)*100, 1),
        'missing_params': missing,
        'duplicates': duplicates,
        'total_nulls': total_nulls,
        'quality_score': '⭐⭐⭐⭐' if total_nulls == 0 and duplicates < 10 else '⭐⭐⭐'
    }
    
else:
    print(f"❌ File not found: {crop_file}")
    summary = None

# ============================================================
# 2. UCI - RAISIN DATASET (KIỂM TRA XEM CÓ PHẢI SOIL DATA KHÔNG)
# ============================================================
print("\n\n" + "=" * 80)
print("📊 DATASET 2: Raisin Dataset (UCI)")
print("=" * 80)

raisin_file = "../dataset/Raisin_Dataset/Raisin_Dataset.txt"

if os.path.exists(raisin_file):
    print(f"\n⚠️  File found: {raisin_file}")
    print("\n⚠️  PHÂN TÍCH: Dataset này là về phân loại nho khô (Raisin classification)")
    print("   → KHÔNG LIÊN QUAN đến soil/agriculture sensor data")
    print("   → Columns: Area, MajorAxisLength, MinorAxisLength, etc. (image features)")
    print("\n❌ KHÔNG SỬ DỤNG CHO AI MODULE NÀY")
    print("\n💡 Đề xuất: Xóa thư mục 'dataset/Raisin_Dataset' để tránh nhầm lẫn")
    
else:
    print(f"❌ File not found: {raisin_file}")

# ============================================================
# 3. TÓM TẮT & KHUYẾN NGHỊ
# ============================================================
print("\n\n" + "=" * 80)
print("📊 TÓM TẮT & KHUYẾN NGHỊ")
print("=" * 80)

if summary:
    print(f"\n✅ DATASET KHẢ DỤNG: Kaggle Crop Recommendation")
    print(f"   • Số mẫu: {summary['rows']:,} rows")
    print(f"   • Coverage: {summary['coverage']} ({summary['coverage_pct']}%)")
    print(f"   • Chất lượng: {summary['quality_score']}")
    print(f"   • Duplicates: {summary['duplicates']}")
    print(f"   • Missing values: {summary['total_nulls']}")
    
    print(f"\n❌ THIẾU {len(summary['missing_params'])} THÔNG SỐ:")
    for param in summary['missing_params']:
        print(f"   • {param}")
    
    print("\n" + "=" * 80)
    print("🎯 CHIẾN LƯỢC ĐỀ XUẤT")
    print("=" * 80)
    
    print("\n📌 OPTION 1: Augmentation với Domain Knowledge (RECOMMENDED)")
    print("-" * 80)
    print("  Từ 7 thông số có sẵn, generate 4 thông số thiếu:")
    print()
    print("  1. soil_moisture ← f(rainfall, humidity, soil_type)")
    print("     • Nếu rainfall > 100mm → moisture = 60-80%")
    print("     • Nếu rainfall < 50mm  → moisture = 20-40%")
    print("     • Trung gian: interpolate")
    print()
    print("  2. soil_temperature ← air_temperature - offset")
    print("     • Soil temp thường thấp hơn air temp 2-5°C")
    print("     • Offset = f(moisture, season)")
    print()
    print("  3. conductivity (EC) ← f(N, P, K, moisture)")
    print("     • EC tăng khi NPK cao")
    print("     • EC = 100 + (N+P+K)*5 + moisture*10 (simplified)")
    print("     • Add Gaussian noise để realistic")
    print()
    print("  4. salt ← f(EC, moisture)")
    print("     • Salt correlate với EC")
    print("     • Salt = EC * 0.64 (typical conversion)")
    print()
    print("  ✅ Ưu điểm: Nhanh, có thể implement ngay")
    print("  ⚠️  Nhược điểm: Synthetic data, cần validate với expert")
    
    print("\n📌 OPTION 2: Tìm thêm UCI Soil Dataset")
    print("-" * 80)
    print("  Download UCI Soil Dataset thực sự (không phải Raisin):")
    print("  • archive.ics.uci.edu/dataset/850/soil")
    print("  • Có thể cung cấp: EC, Soil Moisture, Soil Temperature")
    print("  • Merge với Kaggle dataset bằng clustering/matching")
    print()
    print("  ✅ Ưu điểm: Real data, accurate")
    print("  ⚠️  Nhược điểm: Cần effort để merge (khác format, scale)")
    
    print("\n📌 OPTION 3: Kết hợp Real Data từ DB của bạn")
    print("-" * 80)
    print("  • Dùng Kaggle làm base (2,200 samples)")
    print("  • Augment synthetic để có 11 fields")
    print("  • Fine-tune model với real data từ PostgreSQL")
    print("  • Transfer learning approach")
    print()
    print("  ✅ Ưu điểm: Model fit với data thực của bạn")
    print("  ⚠️  Nhược điểm: Cần ít nhất 200-500 real samples")

print("\n" + "=" * 80)
print("❓ BẠN MUỐN THỰC HIỆN OPTION NÀO?")
print("=" * 80)
print("  1. Option 1 - Augmentation (Fastest, có thể làm ngay)")
print("  2. Option 2 - Download UCI Soil Dataset thật")
print("  3. Option 3 - Đợi thu thập real data từ IoT")
print("  4. Hybrid - Option 1 + Option 3 (train synthetic → fine-tune real)")
print()
print("💡 Khuyến nghị: BẮT ĐẦU VỚI OPTION 1 hoặc HYBRID")
print("=" * 80)

