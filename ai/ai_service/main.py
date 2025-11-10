"""
AI Service - FastAPI Application
Main entry point for AI analysis service
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
import time
from datetime import datetime
from dotenv import load_dotenv
import os

from schemas import (
    SoilDataInput,
    AIAnalysisResponse,
    HealthCheckResponse,
    DailyAggregateInput,
    DailyAnalysisResponse
)
from models_loader import get_model_registry, ModelRegistry
from inference import analyze_soil, analyze_aggregated_data
from daily_aggregator import aggregate_daily_data, save_daily_insight, push_to_blockchain

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Track startup time for uptime
START_TIME = time.time()

# Lifespan event handler
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler (replaces deprecated on_event)"""
    # Startup
    logger.info("=" * 80)
    logger.info("🚀 STARTING AI SERVICE...")
    logger.info("=" * 80)
    
    try:
        # Just initialize registry, don't load all models yet
        models = get_model_registry()
        logger.info("✅ Model registry initialized (models will load on first request)")
        
        logger.info("\n✅ AI Service ready to accept requests!")
        logger.info(f"   Listening on: http://{os.getenv('AI_SERVICE_HOST', '0.0.0.0')}:{os.getenv('AI_SERVICE_PORT', 8000)}")
        logger.info("=" * 80 + "\n")
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down AI Service...")

# Create FastAPI app with lifespan
app = FastAPI(
    title="Pione AI Service",
    description="AI Analysis Service for Soil Data (4 Models)",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "service": "Pione AI Service",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "analyze": "POST /api/ai/analyze",
            "analyze_daily": "POST /api/ai/analyze-daily",
            "health": "GET /api/ai/health",
            "models_info": "GET /api/ai/models/info"
        }
    }


@app.get("/api/ai/health", response_model=HealthCheckResponse, tags=["Health"])
async def health_check():
    """
    Health check endpoint
    Returns status and loaded models info
    """
    models = get_model_registry()
    
    # Try to load models if not loaded yet (lazy loading)
    if not models.validate_loaded():
        try:
            logger.info("🔄 Lazy loading models on first health check...")
            models.load_all()
        except Exception as e:
            logger.error(f"❌ Failed to load models: {e}")
    
    uptime = time.time() - START_TIME
    
    return HealthCheckResponse(
        status="healthy" if models.validate_loaded() else "unhealthy",
        models_loaded=26 if models.validate_loaded() else 0,
        model_names=[
            "crop_classifier",
            "soil_health_scorer",
            "anomaly_detector",
            f"crop_validators ({len(models.crop_validators)})"
        ],
        uptime_seconds=round(uptime, 2)
    )


@app.get("/api/ai/models/info", tags=["Models"])
async def get_models_info():
    """
    Get detailed information about loaded models
    """
    models = get_model_registry()
    model_info = models.get_model_info()
    
    return {
        "status": "ok",
        "model_info": model_info,
        "available_crops": models.get_crop_names() if model_info["label_encoder"] else []
    }


@app.post("/api/ai/analyze", response_model=AIAnalysisResponse, tags=["Analysis"])
async def analyze_soil_data(data: SoilDataInput):
    """
    Main AI analysis endpoint
    
    Analyzes soil data using 4 models:
    1. Crop Classifier - Recommend best crop
    2. Soil Health Scorer - Score soil quality (0-100)
    3. Crop Validator - Validate specific crop (if mode=validation)
    4. Anomaly Detector - Detect outliers
    
    Args:
        data: SoilDataInput with 11 sensor parameters
    
    Returns:
        AIAnalysisResponse with complete analysis
    """
    try:
        models = get_model_registry()
        
        # Lazy load models if not loaded yet
        if not models.validate_loaded():
            try:
                logger.info("🔄 Lazy loading models (first request)...")
                models.load_all()
                logger.info("✅ Models loaded successfully!")
            except Exception as e:
                logger.error(f"❌ Failed to load models: {e}")
                raise HTTPException(
                    status_code=503,
                    detail=f"Models not loaded: {str(e)}"
                )
        
        # Validate crop name if validation mode
        if data.mode == "validation":
            if not data.selected_crop:
                raise HTTPException(
                    status_code=400,
                    detail="selected_crop is required for validation mode"
                )
            
            available_crops = models.get_crop_names()
            if data.selected_crop not in available_crops:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid crop '{data.selected_crop}'. Available: {available_crops}"
                )
        
        # Run analysis
        logger.info(f"\n📨 Received analysis request (mode: {data.mode})")
        result = analyze_soil(data, models)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Analysis error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ai/analyze-daily", response_model=DailyAnalysisResponse, tags=["Daily Aggregation"])
async def analyze_daily(request: DailyAggregateInput):
    """
    Analyze daily aggregated data
    
    1. Query DB for data on specified date
    2. Aggregate (AVG) 11 parameters
    3. Run AI analysis
    4. Save to daily_insights table
    5. Return result (for n8n to send to Zalo)
    
    Args:
        request: DailyAggregateInput with date
    
    Returns:
        DailyAnalysisResponse with aggregated data and AI analysis
    """
    try:
        models = get_model_registry()
        
        # Lazy load models if not loaded yet
        if not models.validate_loaded():
            try:
                logger.info("🔄 Lazy loading models (first request)...")
                models.load_all()
                logger.info("✅ Models loaded successfully!")
            except Exception as e:
                logger.error(f"❌ Failed to load models: {e}")
                raise HTTPException(
                    status_code=503,
                    detail=f"Models not loaded: {str(e)}"
                )
        
        logger.info(f"\n📅 Daily aggregation request for date: {request.date}")
        
        # 1. Aggregate data from DB
        aggregated_data = aggregate_daily_data(request.date)
        
        if not aggregated_data:
            raise HTTPException(
                status_code=404,
                detail=f"No sensor data found for date {request.date}"
            )
        
        logger.info(f"   ✅ Aggregated {aggregated_data['sample_count']} samples")
        
        # 2. Run AI analysis on aggregated data
        ai_result = analyze_aggregated_data(aggregated_data['features'], models)
        
        # 3. Save to daily_insights table
        record_id = save_daily_insight(request.date, aggregated_data, ai_result)
        
        logger.info(f"   ✅ Saved to daily_insights (ID: {record_id})")
        
        # 4. Push to blockchain (async, don't block response)
        blockchain_success, tx_hash, blockchain_status = push_to_blockchain(
            daily_insight_id=record_id,
            date=request.date,
            ai_result=ai_result,
            sample_count=aggregated_data['sample_count']
        )
        
        if blockchain_success:
            logger.info(f"   ✅ Pushed to blockchain successfully (TX: {tx_hash})")
        else:
            logger.warning(f"   ⚠️ Blockchain push failed (status: {blockchain_status}, but DB saved)")
        
        return DailyAnalysisResponse(
            date=request.date,
            aggregated_data=aggregated_data,
            ai_analysis=ai_result,
            saved_to_db=True,
            record_id=record_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Daily aggregation error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "error": str(exc)}
    )


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("AI_SERVICE_PORT", 8000))
    host = os.getenv("AI_SERVICE_HOST", "0.0.0.0")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True,  # Auto-reload in development
        log_level="info"
    )

