"""
Pydantic schemas for AI Service API
Request/Response models
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime


class SoilDataInput(BaseModel):
    """
    Input schema for soil sensor data (11 parameters)
    Matches the format from Flask API
    """
    # SOIL PARAMETERS (8)
    soil_temperature: float = Field(..., description="Soil temperature in °C", ge=-50, le=100)
    soil_moisture: float = Field(..., description="Soil moisture in %", ge=0, le=100)
    conductivity: int = Field(..., description="Electrical conductivity in µS/cm", ge=0, le=5000)
    ph: float = Field(..., description="pH value", ge=0, le=14)
    nitrogen: int = Field(..., description="Nitrogen content in mg/kg", ge=0, le=500)
    phosphorus: int = Field(..., description="Phosphorus content in mg/kg", ge=0, le=500)
    potassium: int = Field(..., description="Potassium content in mg/kg", ge=0, le=500)
    salt: int = Field(..., description="Salinity in mg/L", ge=0, le=5000)
    
    # AIR/WEATHER PARAMETERS (3)
    air_temperature: float = Field(..., description="Air temperature in °C", ge=-50, le=100)
    air_humidity: float = Field(..., description="Air humidity in %", ge=0, le=100)
    is_raining: bool = Field(..., description="Rain status")
    
    # OPTIONAL: For validation mode
    selected_crop: Optional[str] = Field(None, description="Crop to validate (validation mode only)")
    mode: str = Field("discovery", description="Analysis mode: 'discovery' or 'validation'")
    
    @validator('mode')
    def validate_mode(cls, v):
        if v not in ['discovery', 'validation']:
            raise ValueError('mode must be "discovery" or "validation"')
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "soil_temperature": 24.5,
                "soil_moisture": 45.2,
                "conductivity": 1250,
                "ph": 6.8,
                "nitrogen": 45,
                "phosphorus": 30,
                "potassium": 180,
                "salt": 850,
                "air_temperature": 27.1,
                "air_humidity": 65.0,
                "is_raining": False,
                "selected_crop": "coffee",
                "mode": "validation"
            }
        }


class CropRecommendation(BaseModel):
    """Crop recommendation from Model 1"""
    best_crop: str
    confidence: float
    top_3: List[dict]  # [{"crop": str, "probability": float}, ...]


class SoilHealth(BaseModel):
    """Soil health score from Model 2"""
    overall_score: float
    rating: str  # EXCELLENT, GOOD, FAIR, POOR


class CropValidation(BaseModel):
    """Crop validation from Model 3"""
    crop: str
    suitability_score: float
    verdict: str  # EXCELLENT, GOOD, FAIR, POOR


class AnomalyDetection(BaseModel):
    """Anomaly detection from Model 4"""
    is_anomaly: bool
    anomaly_score: float
    status: str  # "✅ NORMAL" or "🚨 ANOMALY"


class Recommendation(BaseModel):
    """Single actionable recommendation"""
    priority: str  # CRITICAL, HIGH, MEDIUM, LOW
    message: str


class AIAnalysisResponse(BaseModel):
    """
    Complete AI analysis response
    Includes results from all 4 models + actionable recommendations
    """
    mode: str  # "discovery" or "validation"
    
    # Model 1: Crop Recommendation (always)
    crop_recommendation: CropRecommendation
    
    # Model 2: Soil Health (always)
    soil_health: SoilHealth
    
    # Model 3: Crop Validation (only if mode=validation)
    crop_validation: Optional[CropValidation] = None
    
    # Model 4: Anomaly Detection (always)
    anomaly_detection: AnomalyDetection
    
    # NEW: Actionable Recommendations (rule-based engine)
    recommendations: List[Recommendation] = []
    
    # Metadata
    timestamp: str
    processing_time_ms: float
    
    class Config:
        json_schema_extra = {
            "example": {
                "mode": "validation",
                "crop_recommendation": {
                    "best_crop": "coffee",
                    "confidence": 0.98,
                    "top_3": [
                        {"crop": "coffee", "probability": 0.98},
                        {"crop": "tea", "probability": 0.01},
                        {"crop": "rubber", "probability": 0.005}
                    ]
                },
                "soil_health": {
                    "overall_score": 88.3,
                    "rating": "EXCELLENT"
                },
                "crop_validation": {
                    "crop": "coffee",
                    "suitability_score": 92.5,
                    "verdict": "EXCELLENT"
                },
                "anomaly_detection": {
                    "is_anomaly": False,
                    "anomaly_score": -0.0234,
                    "status": "✅ NORMAL"
                },
                "recommendations": [
                    {
                        "priority": "HIGH",
                        "message": "Độ ẩm đất thấp (45.2%). Cây coffee cần 55-75%. Tưới 30-40mm trong 2-3 ngày."
                    },
                    {
                        "priority": "MEDIUM",
                        "message": "pH hơi thấp (6.1). Cây coffee cần pH 5.5-6.5. Bổ sung vôi bột 200-300kg/ha."
                    }
                ],
                "timestamp": "2025-10-27T20:00:00+07:00",
                "processing_time_ms": 45.23
            }
        }


class HealthCheckResponse(BaseModel):
    """Health check response"""
    status: str
    models_loaded: int
    model_names: List[str]
    uptime_seconds: float


class DailyAggregateInput(BaseModel):
    """Input for daily aggregation analysis"""
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    
    @validator('date')
    def validate_date(cls, v):
        try:
            datetime.strptime(v, '%Y-%m-%d')
        except ValueError:
            raise ValueError('date must be in YYYY-MM-DD format')
        return v


class DailyAnalysisResponse(BaseModel):
    """Response for daily aggregation analysis"""
    date: str
    aggregated_data: dict
    ai_analysis: AIAnalysisResponse
    saved_to_db: bool
    record_id: Optional[int] = None

