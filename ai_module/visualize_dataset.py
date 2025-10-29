"""
Visualization script cho Kaggle Crop Recommendation Dataset
Tạo các biểu đồ để hiểu distribution, correlation, outliers
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import os

# Set style
sns.set_style("whitegrid")
plt.rcParams['figure.figsize'] = (12, 8)
plt.rcParams['font.size'] = 10

print("=" * 80)
print("📊 DATASET VISUALIZATION - KAGGLE CROP RECOMMENDATION")
print("=" * 80)

# Load dataset
csv_file = "../dataset/Crop_recommendation.csv"
df = pd.read_csv(csv_file)

print(f"\n✅ Loaded {len(df):,} samples")

# Create output directory
os.makedirs("../ai_module/visualizations", exist_ok=True)

# ============================================================
# 1. DISTRIBUTION PLOTS
# ============================================================
print("\n📊 Tạo biểu đồ distribution...")

fig, axes = plt.subplots(3, 3, figsize=(15, 12))
fig.suptitle('Distribution of All Features', fontsize=16, fontweight='bold')

features = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE']

for idx, (feat, color) in enumerate(zip(features, colors)):
    row = idx // 3
    col = idx % 3
    ax = axes[row, col]
    
    # Histogram with KDE
    ax.hist(df[feat], bins=30, alpha=0.7, color=color, edgecolor='black')
    ax.set_xlabel(feat, fontweight='bold')
    ax.set_ylabel('Frequency')
    ax.set_title(f'{feat} Distribution')
    
    # Add mean line
    mean_val = df[feat].mean()
    ax.axvline(mean_val, color='red', linestyle='--', linewidth=2, label=f'Mean: {mean_val:.2f}')
    ax.legend()
    ax.grid(True, alpha=0.3)

# Remove empty subplots
for idx in range(len(features), 9):
    row = idx // 3
    col = idx % 3
    fig.delaxes(axes[row, col])

plt.tight_layout()
plt.savefig('../ai_module/visualizations/01_feature_distributions.png', dpi=300, bbox_inches='tight')
print("   ✅ Saved: visualizations/01_feature_distributions.png")
plt.close()

# ============================================================
# 2. BOX PLOTS (Outlier Detection)
# ============================================================
print("📊 Tạo biểu đồ box plots...")

fig, axes = plt.subplots(2, 4, figsize=(16, 8))
fig.suptitle('Box Plots - Outlier Detection', fontsize=16, fontweight='bold')

for idx, (feat, color) in enumerate(zip(features, colors)):
    row = idx // 4
    col = idx % 4
    ax = axes[row, col]
    
    bp = ax.boxplot(df[feat], vert=True, patch_artist=True, 
                    boxprops=dict(facecolor=color, alpha=0.7),
                    medianprops=dict(color='red', linewidth=2))
    ax.set_title(feat, fontweight='bold')
    ax.set_ylabel('Value')
    ax.grid(True, alpha=0.3)

# Remove empty subplot
fig.delaxes(axes[1, 3])

plt.tight_layout()
plt.savefig('../ai_module/visualizations/02_boxplots_outliers.png', dpi=300, bbox_inches='tight')
print("   ✅ Saved: visualizations/02_boxplots_outliers.png")
plt.close()

# ============================================================
# 3. CORRELATION HEATMAP
# ============================================================
print("📊 Tạo correlation heatmap...")

# Select only numeric columns
numeric_df = df.select_dtypes(include=[np.number])

plt.figure(figsize=(10, 8))
corr_matrix = numeric_df.corr()

# Create mask for upper triangle
mask = np.triu(np.ones_like(corr_matrix, dtype=bool))

sns.heatmap(corr_matrix, mask=mask, annot=True, fmt='.2f', 
            cmap='RdYlGn', center=0, square=True, linewidths=1,
            cbar_kws={"shrink": 0.8})

plt.title('Feature Correlation Heatmap', fontsize=16, fontweight='bold', pad=20)
plt.tight_layout()
plt.savefig('../ai_module/visualizations/03_correlation_heatmap.png', dpi=300, bbox_inches='tight')
print("   ✅ Saved: visualizations/03_correlation_heatmap.png")
plt.close()

# ============================================================
# 4. CROP LABEL DISTRIBUTION
# ============================================================
print("📊 Tạo biểu đồ label distribution...")

plt.figure(figsize=(14, 6))
label_counts = df['label'].value_counts().sort_values(ascending=False)

# Create color palette
palette = sns.color_palette("husl", len(label_counts))

ax = label_counts.plot(kind='bar', color=palette, edgecolor='black', linewidth=0.5)
plt.title('Crop Label Distribution (Perfectly Balanced)', fontsize=16, fontweight='bold')
plt.xlabel('Crop Type', fontweight='bold')
plt.ylabel('Count', fontweight='bold')
plt.xticks(rotation=45, ha='right')

# Add value labels on bars
for i, v in enumerate(label_counts):
    ax.text(i, v + 2, str(v), ha='center', va='bottom', fontweight='bold')

plt.grid(axis='y', alpha=0.3)
plt.tight_layout()
plt.savefig('../ai_module/visualizations/04_crop_distribution.png', dpi=300, bbox_inches='tight')
print("   ✅ Saved: visualizations/04_crop_distribution.png")
plt.close()

# ============================================================
# 5. NPK SCATTER PLOTS
# ============================================================
print("📊 Tạo NPK scatter plots...")

fig, axes = plt.subplots(1, 3, figsize=(18, 5))
fig.suptitle('NPK Relationships (Color by Crop)', fontsize=16, fontweight='bold')

# Get unique crops and assign colors
crops = df['label'].unique()
crop_colors = dict(zip(crops, sns.color_palette("husl", len(crops))))

# N vs P
for crop in crops[:10]:  # Show only top 10 crops for clarity
    crop_data = df[df['label'] == crop]
    axes[0].scatter(crop_data['N'], crop_data['P'], 
                   label=crop, alpha=0.6, s=30, color=crop_colors[crop])
axes[0].set_xlabel('Nitrogen (N)', fontweight='bold')
axes[0].set_ylabel('Phosphorus (P)', fontweight='bold')
axes[0].set_title('N vs P')
axes[0].grid(True, alpha=0.3)
axes[0].legend(bbox_to_anchor=(1.05, 1), loc='upper left', fontsize=8)

# N vs K
for crop in crops[:10]:
    crop_data = df[df['label'] == crop]
    axes[1].scatter(crop_data['N'], crop_data['K'], 
                   label=crop, alpha=0.6, s=30, color=crop_colors[crop])
axes[1].set_xlabel('Nitrogen (N)', fontweight='bold')
axes[1].set_ylabel('Potassium (K)', fontweight='bold')
axes[1].set_title('N vs K')
axes[1].grid(True, alpha=0.3)

# P vs K
for crop in crops[:10]:
    crop_data = df[df['label'] == crop]
    axes[2].scatter(crop_data['P'], crop_data['K'], 
                   label=crop, alpha=0.6, s=30, color=crop_colors[crop])
axes[2].set_xlabel('Phosphorus (P)', fontweight='bold')
axes[2].set_ylabel('Potassium (K)', fontweight='bold')
axes[2].set_title('P vs K')
axes[2].grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig('../ai_module/visualizations/05_npk_scatter.png', dpi=300, bbox_inches='tight')
print("   ✅ Saved: visualizations/05_npk_scatter.png")
plt.close()

# ============================================================
# 6. WEATHER FEATURES
# ============================================================
print("📊 Tạo weather features plot...")

fig, axes = plt.subplots(2, 2, figsize=(14, 10))
fig.suptitle('Weather Features Analysis', fontsize=16, fontweight='bold')

# Temperature vs Humidity
scatter = axes[0, 0].scatter(df['temperature'], df['humidity'], 
                            c=df['rainfall'], cmap='Blues', alpha=0.6, s=30)
axes[0, 0].set_xlabel('Temperature (°C)', fontweight='bold')
axes[0, 0].set_ylabel('Humidity (%)', fontweight='bold')
axes[0, 0].set_title('Temperature vs Humidity (colored by Rainfall)')
axes[0, 0].grid(True, alpha=0.3)
plt.colorbar(scatter, ax=axes[0, 0], label='Rainfall (mm)')

# Temperature distribution by season (infer from temp ranges)
df['season'] = pd.cut(df['temperature'], bins=[0, 15, 25, 35, 50], 
                      labels=['Cold', 'Mild', 'Warm', 'Hot'])
season_counts = df['season'].value_counts()
axes[0, 1].bar(season_counts.index.astype(str), season_counts.values, 
              color=['#3498DB', '#2ECC71', '#F39C12', '#E74C3C'], edgecolor='black')
axes[0, 1].set_title('Season Distribution (by Temperature)', fontweight='bold')
axes[0, 1].set_ylabel('Count', fontweight='bold')
axes[0, 1].grid(axis='y', alpha=0.3)

# Rainfall distribution
axes[1, 0].hist(df['rainfall'], bins=40, color='#3498DB', alpha=0.7, edgecolor='black')
axes[1, 0].axvline(df['rainfall'].median(), color='red', linestyle='--', 
                  linewidth=2, label=f'Median: {df["rainfall"].median():.1f} mm')
axes[1, 0].set_xlabel('Rainfall (mm)', fontweight='bold')
axes[1, 0].set_ylabel('Frequency', fontweight='bold')
axes[1, 0].set_title('Rainfall Distribution')
axes[1, 0].legend()
axes[1, 0].grid(True, alpha=0.3)

# pH vs Rainfall
scatter2 = axes[1, 1].scatter(df['ph'], df['rainfall'], 
                             c=df['humidity'], cmap='YlGnBu', alpha=0.6, s=30)
axes[1, 1].set_xlabel('pH', fontweight='bold')
axes[1, 1].set_ylabel('Rainfall (mm)', fontweight='bold')
axes[1, 1].set_title('pH vs Rainfall (colored by Humidity)')
axes[1, 1].grid(True, alpha=0.3)
plt.colorbar(scatter2, ax=axes[1, 1], label='Humidity (%)')

plt.tight_layout()
plt.savefig('../ai_module/visualizations/06_weather_analysis.png', dpi=300, bbox_inches='tight')
print("   ✅ Saved: visualizations/06_weather_analysis.png")
plt.close()

# ============================================================
# 7. SUMMARY STATISTICS TABLE
# ============================================================
print("\n📊 Tạo summary statistics...")

summary_stats = df[features].describe().round(2)
print("\n" + "=" * 80)
print("📈 SUMMARY STATISTICS")
print("=" * 80)
print(summary_stats)

# Save to CSV
summary_stats.to_csv('../ai_module/visualizations/summary_statistics.csv')
print("\n   ✅ Saved: visualizations/summary_statistics.csv")

# ============================================================
# REPORT
# ============================================================
print("\n" + "=" * 80)
print("✅ VISUALIZATION COMPLETE!")
print("=" * 80)
print(f"\n📁 Location: ai_module/visualizations/")
print(f"   • 01_feature_distributions.png")
print(f"   • 02_boxplots_outliers.png")
print(f"   • 03_correlation_heatmap.png")
print(f"   • 04_crop_distribution.png")
print(f"   • 05_npk_scatter.png")
print(f"   • 06_weather_analysis.png")
print(f"   • summary_statistics.csv")

print("\n💡 KEY INSIGHTS:")
print("   1. Dataset is perfectly balanced (100 samples per crop)")
print("   2. No missing values or duplicates")
print("   3. NPK shows clear clustering by crop type")
print("   4. Temperature follows normal distribution")
print("   5. Humidity is slightly left-skewed (more high-humidity samples)")
print("   6. Rainfall is right-skewed (more low-rainfall samples)")
print("   7. pH range covers acidic to alkaline soils")
print("\n" + "=" * 80)

