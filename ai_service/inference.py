"""
AI Inference Logic
Functions to analyze soil data using 4 trained models
"""

import numpy as np
import pandas as pd
from typing import Dict, Any, List
import logging
from datetime import datetime
import time

from schemas import (
    SoilDataInput,
    AIAnalysisResponse,
    CropRecommendation,
    SoilHealth,
    CropValidation,
    AnomalyDetection,
    Recommendation
)
from models_loader import ModelRegistry

logger = logging.getLogger(__name__)


# Feature names (must match training data order)
FEATURE_NAMES = [
    'soil_temperature',
    'soil_moisture',
    'conductivity',
    'ph',
    'nitrogen',
    'phosphorus',
    'potassium',
    'salt',
    'air_temperature',
    'air_humidity',
    'is_raining'
]


def preprocess_soil_data(data: SoilDataInput, models: ModelRegistry) -> np.ndarray:
    """
    Convert input data to scaled numpy array
    
    Args:
        data: SoilDataInput pydantic model
        models: ModelRegistry with loaded scaler
    
    Returns:
        Scaled feature array (1, 11)
    """
    # Extract 11 features in correct order
    features = [
        data.soil_temperature,
        data.soil_moisture,
        data.conductivity,
        data.ph,
        data.nitrogen,
        data.phosphorus,
        data.potassium,
        data.salt,
        data.air_temperature,
        data.air_humidity,
        1.0 if data.is_raining else 0.0  # Convert bool to float
    ]
    
    # Convert to numpy array
    X = np.array([features])
    
    # Scale features
    X_scaled = models.feature_scaler.transform(X)
    
    return X_scaled


def recommend_crop(X_scaled: np.ndarray, models: ModelRegistry) -> CropRecommendation:
    """
    Model 1: Crop Recommendation (Multi-class classification)
    
    Args:
        X_scaled: Scaled features (1, 11)
        models: ModelRegistry
    
    Returns:
        CropRecommendation with best crop and top 3
    """
    # Predict
    y_pred = models.crop_classifier.predict(X_scaled)[0]
    y_proba = models.crop_classifier.predict_proba(X_scaled)[0]
    
    # Get crop names
    crop_names = models.label_encoder.classes_
    
    # Best crop
    best_crop = crop_names[y_pred]
    confidence = float(y_proba[y_pred])
    
    # Top 3 crops
    top_3_indices = np.argsort(y_proba)[-3:][::-1]
    top_3 = [
        {
            "crop": crop_names[idx],
            "probability": float(y_proba[idx])
        }
        for idx in top_3_indices
    ]
    
    return CropRecommendation(
        best_crop=best_crop,
        confidence=confidence,
        top_3=top_3
    )


def score_soil_health(X_scaled: np.ndarray, models: ModelRegistry) -> SoilHealth:
    """
    Model 2: Soil Health Scorer (Regression 0-100)
    
    Args:
        X_scaled: Scaled features (1, 11)
        models: ModelRegistry
    
    Returns:
        SoilHealth with score and rating
    """
    # Predict
    score = models.soil_health_scorer.predict(X_scaled)[0]
    score = float(np.clip(score, 0, 100))  # Ensure 0-100 range
    
    # Classify rating
    if score >= 85:
        rating = "EXCELLENT"
    elif score >= 70:
        rating = "GOOD"
    elif score >= 55:
        rating = "FAIR"
    else:
        rating = "POOR"
    
    return SoilHealth(
        overall_score=round(score, 2),
        rating=rating
    )


def validate_crop(X_scaled: np.ndarray, crop_name: str, models: ModelRegistry) -> CropValidation:
    """
    Model 3: Crop Validation (Crop-specific suitability)
    
    Args:
        X_scaled: Scaled features (1, 11)
        crop_name: Name of crop to validate
        models: ModelRegistry
    
    Returns:
        CropValidation with suitability score
    """
    # Check if crop exists
    available_crops = list(models.crop_validators.keys())
    if crop_name not in available_crops:
        raise ValueError(f"Crop '{crop_name}' not found. Available crops: {available_crops}")
    
    # Get validator for this crop
    validator = models.crop_validators[crop_name]
    
    # Predict suitability score
    score = validator.predict(X_scaled)[0]
    score = float(np.clip(score, 0, 100))
    
    # Classify verdict
    if score >= 85:
        verdict = "EXCELLENT"
    elif score >= 70:
        verdict = "GOOD"
    elif score >= 55:
        verdict = "FAIR"
    else:
        verdict = "POOR"
    
    return CropValidation(
        crop=crop_name,
        suitability_score=round(score, 2),
        verdict=verdict
    )


def detect_anomaly(X_scaled: np.ndarray, models: ModelRegistry) -> AnomalyDetection:
    """
    Model 4: Anomaly Detection (Isolation Forest)
    
    Args:
        X_scaled: Scaled features (1, 11)
        models: ModelRegistry
    
    Returns:
        AnomalyDetection with is_anomaly flag
    """
    # Predict (-1 = anomaly, 1 = normal)
    y_pred = models.anomaly_detector.predict(X_scaled)[0]
    is_anomaly = (y_pred == -1)
    
    # Get anomaly score
    anomaly_score = models.anomaly_detector.score_samples(X_scaled)[0]
    
    # Status string
    status = "🚨 ANOMALY" if is_anomaly else "✅ NORMAL"
    
    return AnomalyDetection(
        is_anomaly=bool(is_anomaly),
        anomaly_score=round(float(anomaly_score), 6),
        status=status
    )


def analyze_soil(data: SoilDataInput, models: ModelRegistry) -> AIAnalysisResponse:
    """
    Main analysis function - runs all 4 models
    
    Args:
        data: SoilDataInput from API
        models: ModelRegistry with loaded models
    
    Returns:
        AIAnalysisResponse with complete analysis
    """
    start_time = time.time()
    
    logger.info(f"🔍 Starting AI analysis (mode: {data.mode})...")
    
    # 1. Preprocess
    X_scaled = preprocess_soil_data(data, models)
    logger.info(f"   ✅ Data preprocessed: {X_scaled.shape}")
    
    # 2. Model 1: Crop Recommendation
    crop_rec = recommend_crop(X_scaled, models)
    logger.info(f"   ✅ Crop recommendation: {crop_rec.best_crop} ({crop_rec.confidence:.2f})")
    
    # 3. Model 2: Soil Health
    soil_health = score_soil_health(X_scaled, models)
    logger.info(f"   ✅ Soil health: {soil_health.overall_score}/100 ({soil_health.rating})")
    
    # 4. Model 3: Crop Validation (only if validation mode)
    crop_val = None
    if data.mode == "validation" and data.selected_crop:
        try:
            crop_val = validate_crop(X_scaled, data.selected_crop, models)
            logger.info(f"   ✅ Crop validation ({data.selected_crop}): {crop_val.suitability_score}/100 ({crop_val.verdict})")
        except ValueError as e:
            logger.warning(f"   ⚠️  Crop validation failed: {e}")
    
    # 5. Model 4: Anomaly Detection
    anomaly = detect_anomaly(X_scaled, models)
    logger.info(f"   ✅ Anomaly detection: {anomaly.status}")
    
    # 6. Generate actionable recommendations (rule-based)
    features_dict = {
        'soil_temperature': data.soil_temperature,
        'soil_moisture': data.soil_moisture,
        'conductivity': data.conductivity,
        'ph': data.ph,
        'nitrogen': data.nitrogen,
        'phosphorus': data.phosphorus,
        'potassium': data.potassium,
        'salt': data.salt,
        'air_temperature': data.air_temperature,
        'air_humidity': data.air_humidity,
        'is_raining': data.is_raining
    }
    
    # Temporarily create response without recommendations to pass to generator
    temp_response = AIAnalysisResponse(
        mode=data.mode,
        crop_recommendation=crop_rec,
        soil_health=soil_health,
        crop_validation=crop_val,
        anomaly_detection=anomaly,
        recommendations=[],
        timestamp=datetime.now().isoformat(),
        processing_time_ms=0
    )
    
    recommendations_list = generate_recommendations(features_dict, temp_response)
    recommendations = [Recommendation(**rec) for rec in recommendations_list]
    
    logger.info(f"   ✅ Generated {len(recommendations)} recommendations")
    
    # Calculate processing time
    processing_time = (time.time() - start_time) * 1000  # ms
    
    logger.info(f"✅ Analysis complete in {processing_time:.2f}ms")
    
    # Return response with recommendations
    return AIAnalysisResponse(
        mode=data.mode,
        crop_recommendation=crop_rec,
        soil_health=soil_health,
        crop_validation=crop_val,
        anomaly_detection=anomaly,
        recommendations=recommendations,
        timestamp=datetime.now().isoformat(),
        processing_time_ms=round(processing_time, 2)
    )


def analyze_aggregated_data(aggregated_features: Dict[str, float], models: ModelRegistry) -> AIAnalysisResponse:
    """
    Analyze daily aggregated data
    
    Args:
        aggregated_features: Dict with 11 aggregated parameters (avg values)
        models: ModelRegistry
    
    Returns:
        AIAnalysisResponse
    """
    # Convert aggregated data to SoilDataInput format
    data = SoilDataInput(
        soil_temperature=aggregated_features['soil_temperature'],
        soil_moisture=aggregated_features['soil_moisture'],
        conductivity=int(aggregated_features['conductivity']),
        ph=aggregated_features['ph'],
        nitrogen=int(aggregated_features['nitrogen']),
        phosphorus=int(aggregated_features['phosphorus']),
        potassium=int(aggregated_features['potassium']),
        salt=int(aggregated_features['salt']),
        air_temperature=aggregated_features['air_temperature'],
        air_humidity=aggregated_features['air_humidity'],
        is_raining=aggregated_features.get('is_raining', False),  # Or majority vote
        mode="discovery"  # Daily reports are always discovery mode
    )
    
    return analyze_soil(data, models)


# ==============================================================================
# RECOMMENDATION ENGINE - Rule-based Advanced
# ==============================================================================

# Optimal ranges for different crops (based on agricultural research)
CROP_REQUIREMENTS = {
    "rice": {
        "soil_moisture": (70, 90, "Rice requires flooded conditions during vegetative stage"),
        "ph": (5.5, 7.0, "Rice prefers slightly acidic to neutral soil"),
        "nitrogen": (40, 100, "High N requirement for grain development"),
        "phosphorus": (20, 50, "Moderate P for root development"),
        "potassium": (150, 300, "High K for disease resistance"),
    },
    "coffee": {
        "soil_moisture": (55, 75, "Coffee needs consistent moisture but good drainage"),
        "ph": (5.5, 6.5, "Coffee thrives in slightly acidic soil"),
        "nitrogen": (35, 80, "Moderate N for leaf and berry development"),
        "phosphorus": (25, 60, "P important for flowering and fruiting"),
        "potassium": (180, 350, "High K for bean quality"),
        "soil_temperature": (18, 28, "Coffee requires moderate soil temperature"),
    },
    "maize": {
        "soil_moisture": (60, 80, "Maize needs adequate moisture during tasseling"),
        "ph": (5.8, 7.0, "Maize prefers slightly acidic to neutral soil"),
        "nitrogen": (50, 120, "Very high N requirement for biomass"),
        "phosphorus": (30, 70, "High P for root and kernel development"),
        "potassium": (200, 400, "High K for stalk strength"),
    },
    "cotton": {
        "soil_moisture": (50, 70, "Cotton prefers moderate moisture"),
        "ph": (6.0, 7.5, "Cotton tolerates slightly alkaline soil"),
        "nitrogen": (40, 90, "Moderate N for fiber quality"),
        "phosphorus": (25, 60, "Moderate P for flowering"),
        "potassium": (180, 350, "High K for boll development"),
    },
    # Default for crops not specified
    "default": {
        "soil_moisture": (55, 75, "Most crops need moderate moisture"),
        "ph": (6.0, 7.0, "Most crops prefer neutral pH"),
        "nitrogen": (40, 80, "Standard N requirement"),
        "phosphorus": (25, 60, "Standard P requirement"),
        "potassium": (180, 300, "Standard K requirement"),
    }
}


def generate_recommendations(
    features: Dict[str, float],
    ai_result: AIAnalysisResponse
) -> List[Dict[str, Any]]:
    """
    Generate actionable recommendations based on soil conditions and AI analysis
    
    Args:
        features: Raw sensor values (11 parameters)
        ai_result: AI analysis result (crop, health, anomaly)
    
    Returns:
        List of recommendations with priority and message
        Format: [{"priority": "CRITICAL|HIGH|MEDIUM|LOW", "message": "..."}]
    """
    recommendations = []
    crop = ai_result.crop_recommendation.best_crop
    
    # Get crop-specific requirements
    crop_req = CROP_REQUIREMENTS.get(crop, CROP_REQUIREMENTS["default"])
    
    # ==============================================================================
    # 1. CRITICAL - Soil Moisture (most urgent)
    # ==============================================================================
    moisture = features['soil_moisture']
    if crop in crop_req and 'soil_moisture' in crop_req:
        min_m, max_m, reason = crop_req['soil_moisture']
        
        if moisture < min_m - 15:  # Very low
            recommendations.append({
                "priority": "CRITICAL",
                "message": f"Độ ẩm đất rất thấp ({moisture:.1f}%). {reason}. Tưới ngay 40-50mm trong 24 giờ."
            })
        elif moisture < min_m:  # Low
            recommendations.append({
                "priority": "HIGH",
                "message": f"Độ ẩm đất thấp ({moisture:.1f}%). Cây {crop} cần {min_m}-{max_m}%. Tưới 30-40mm trong 2-3 ngày."
            })
        elif moisture > max_m + 10:  # Very high
            recommendations.append({
                "priority": "HIGH",
                "message": f"Độ ẩm đất cao ({moisture:.1f}%). Nguy cơ úng rễ. Kiểm tra hệ thống thoát nước, tạm ngưng tưới."
            })
        elif moisture > max_m:  # Slightly high
            recommendations.append({
                "priority": "MEDIUM",
                "message": f"Độ ẩm đất hơi cao ({moisture:.1f}%). Giảm tưới xuống 50%, theo dõi thoát nước."
            })
    
    # ==============================================================================
    # 2. pH Issues (affects nutrient absorption)
    # ==============================================================================
    ph = features['ph']
    nitrogen = features['nitrogen']
    phosphorus = features['phosphorus']
    
    if crop in crop_req and 'ph' in crop_req:
        min_ph, max_ph, reason = crop_req['ph']
        
        if ph < min_ph - 0.5:  # Very acidic
            # Check if nutrients are also low (pH affects absorption)
            if nitrogen < 40 or phosphorus < 30:
                recommendations.append({
                    "priority": "CRITICAL",
                    "message": f"pH rất thấp ({ph:.1f}) làm giảm hấp thu dinh dưỡng. Bổ sung vôi bột 400-500kg/ha TRƯỚC KHI bón phân. Chờ 2 tuần sau đó bón phân."
                })
            else:
                recommendations.append({
                    "priority": "HIGH",
                    "message": f"pH thấp ({ph:.1f}). {reason}. Bổ sung vôi bột 300-400kg/ha, theo dõi pH sau 3-4 tuần."
                })
        elif ph < min_ph:
            recommendations.append({
                "priority": "MEDIUM",
                "message": f"pH hơi thấp ({ph:.1f}). Cây {crop} cần pH {min_ph}-{max_ph}. Bổ sung vôi bột 200-300kg/ha."
            })
        elif ph > max_ph + 0.5:  # Very alkaline
            recommendations.append({
                "priority": "HIGH",
                "message": f"pH cao ({ph:.1f}). Bổ sung lưu huỳnh 150-200kg/ha để giảm pH, hoặc phân chua (Amoni Sulfat)."
            })
        elif ph > max_ph:
            recommendations.append({
                "priority": "MEDIUM",
                "message": f"pH hơi cao ({ph:.1f}). Sử dụng phân chua (Urê, Amoni Sulfat) để điều chỉnh dần."
            })
    
    # ==============================================================================
    # 3. Nitrogen (NPK - N)
    # ==============================================================================
    if crop in crop_req and 'nitrogen' in crop_req:
        min_n, max_n, reason = crop_req['nitrogen']
        
        if nitrogen < min_n - 15:  # Severe deficiency
            recommendations.append({
                "priority": "CRITICAL",
                "message": f"Thiếu Nitrogen nghiêm trọng ({nitrogen:.0f} mg/kg). {reason}. Bón Urê 250-300kg/ha chia 2 lần (7 ngày/lần)."
            })
        elif nitrogen < min_n:
            recommendations.append({
                "priority": "HIGH",
                "message": f"Thiếu Nitrogen ({nitrogen:.0f} mg/kg). Cây {crop} cần {min_n}-{max_n} mg/kg. Bón Urê 150-200kg/ha."
            })
        elif nitrogen > max_n:
            recommendations.append({
                "priority": "LOW",
                "message": f"Nitrogen cao ({nitrogen:.0f} mg/kg). Ngưng bón đạm, tập trung bón P và K để cân bằng."
            })
    
    # ==============================================================================
    # 4. Phosphorus (NPK - P)
    # ==============================================================================
    if crop in crop_req and 'phosphorus' in crop_req:
        min_p, max_p, reason = crop_req['phosphorus']
        
        if phosphorus < min_p - 10:
            recommendations.append({
                "priority": "HIGH",
                "message": f"Thiếu Phosphorus ({phosphorus:.0f} mg/kg). {reason}. Bón Super Lân 200-250kg/ha."
            })
        elif phosphorus < min_p:
            recommendations.append({
                "priority": "MEDIUM",
                "message": f"Thiếu Phosphorus ({phosphorus:.0f} mg/kg). Bón Super Lân 150kg/ha hoặc DAP 100kg/ha."
            })
    
    # ==============================================================================
    # 5. Potassium (NPK - K)
    # ==============================================================================
    if crop in crop_req and 'potassium' in crop_req:
        min_k, max_k, reason = crop_req['potassium']
        
        if potassium < min_k - 50:
            recommendations.append({
                "priority": "HIGH",
                "message": f"Thiếu Kali ({potassium:.0f} mg/kg). {reason}. Bón KCl 150-200kg/ha."
            })
        elif potassium < min_k:
            recommendations.append({
                "priority": "MEDIUM",
                "message": f"Thiếu Kali ({potassium:.0f} mg/kg). Bón KCl 100-150kg/ha hoặc K2SO4 80kg/ha."
            })
    
    # ==============================================================================
    # 6. Soil Temperature (for temperature-sensitive crops)
    # ==============================================================================
    if crop in crop_req and 'soil_temperature' in crop_req:
        soil_temp = features['soil_temperature']
        min_t, max_t, reason = crop_req['soil_temperature']
        
        if soil_temp < min_t:
            recommendations.append({
                "priority": "MEDIUM",
                "message": f"Nhiệt độ đất thấp ({soil_temp:.1f}°C). {reason}. Sử dụng mulch (phủ rơm) để giữ nhiệt."
            })
        elif soil_temp > max_t:
            recommendations.append({
                "priority": "MEDIUM",
                "message": f"Nhiệt độ đất cao ({soil_temp:.1f}°C). Tưới sáng sớm/chiều mát, phủ rơm để giảm nhiệt."
            })
    
    # ==============================================================================
    # 7. Soil Health Rating
    # ==============================================================================
    health_score = ai_result.soil_health.overall_score
    health_rating = ai_result.soil_health.rating
    
    if health_rating == "POOR":
        recommendations.append({
            "priority": "HIGH",
            "message": f"Chất lượng đất kém ({health_score:.1f}/100). Cải tạo đất bằng phân hữu cơ 3-5 tấn/ha, luân canh cây họ đậu."
        })
    elif health_rating == "FAIR":
        recommendations.append({
            "priority": "MEDIUM",
            "message": f"Chất lượng đất trung bình ({health_score:.1f}/100). Bổ sung phân hữu cơ 2-3 tấn/ha, cải thiện cấu trúc đất."
        })
    
    # ==============================================================================
    # 8. Anomaly Detection
    # ==============================================================================
    if ai_result.anomaly_detection.is_anomaly:
        recommendations.append({
            "priority": "HIGH",
            "message": f"Phát hiện bất thường trong dữ liệu cảm biến (score: {ai_result.anomaly_detection.anomaly_score:.3f}). Kiểm tra lại cảm biến và điều kiện đất."
        })
    
    # ==============================================================================
    # 9. Electrical Conductivity / Salt (Salinity issues)
    # ==============================================================================
    ec = features['conductivity']
    salt = features['salt']
    
    if ec > 2.5 or salt > 1.2:  # High salinity
        recommendations.append({
            "priority": "HIGH",
            "message": f"Độ mặn cao (EC: {ec:.1f} mS/cm, Salt: {salt:.1f} mg/kg). Tưới rửa mặn 100-150mm, cải thiện thoát nước."
        })
    elif ec > 2.0 or salt > 1.0:
        recommendations.append({
            "priority": "MEDIUM",
            "message": f"Độ mặn hơi cao (EC: {ec:.1f} mS/cm). Tưới nhẹ thường xuyên để rửa mặn."
        })
    
    # ==============================================================================
    # 10. All Good - Maintenance Mode
    # ==============================================================================
    if not recommendations:
        recommendations.append({
            "priority": "LOW",
            "message": f"Điều kiện đất tốt cho cây {crop}. Duy trì chế độ chăm sóc hiện tại, theo dõi định kỳ."
        })
    
    return recommendations

