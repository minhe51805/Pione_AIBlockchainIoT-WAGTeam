"""
Daily Aggregation Logic
Query DB, aggregate sensor data, and save AI insights
"""

import psycopg2
from psycopg2.extras import RealDictCursor
import os
from typing import Dict, Optional
import logging
import json
from datetime import datetime
import requests
from dotenv import load_dotenv

from schemas import AIAnalysisResponse

# Load environment variables
load_dotenv('config.env')

logger = logging.getLogger(__name__)


def get_db_conn():
    """Get PostgreSQL connection"""
    return psycopg2.connect(
        host=os.getenv("PGHOST", "localhost"),
        port=int(os.getenv("PGPORT", 5432)),
        dbname=os.getenv("PGDATABASE", "db_iot_sensor"),
        user=os.getenv("PGUSER", "admin"),
        password=os.getenv("PGPASSWORD", "admin123"),
    )


def aggregate_daily_data(date: str) -> Optional[Dict]:
    """
    Aggregate sensor data for a specific date
    
    Args:
        date: Date string in YYYY-MM-DD format
    
    Returns:
        Dict with aggregated features and metadata
        None if no data found
    """
    logger.info(f"📊 Aggregating data for {date}...")
    
    conn = get_db_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Query: Aggregate all 11 parameters for the date
            query = """SELECT COUNT(*) as sample_count, AVG(soil_temperature_c) as soil_temperature, AVG(soil_moisture_pct) as soil_moisture, AVG(conductivity_us_cm) as conductivity, AVG(ph_value) as ph, AVG(nitrogen_mg_kg) as nitrogen, AVG(phosphorus_mg_kg) as phosphorus, AVG(potassium_mg_kg) as potassium, AVG(salt_mg_l) as salt, AVG(air_temperature_c) as air_temperature, AVG(air_humidity_pct) as air_humidity, (SUM(CASE WHEN is_raining THEN 1 ELSE 0 END)::float / COUNT(*)) > 0.5 as is_raining, MIN(soil_temperature_c) as min_soil_temp, MAX(soil_temperature_c) as max_soil_temp, MIN(soil_moisture_pct) as min_moisture, MAX(soil_moisture_pct) as max_moisture FROM sensor_readings WHERE DATE(measured_at_vn) = %s"""
            
            cur.execute(query, (date,))
            result = cur.fetchone()
            
            if not result or result['sample_count'] == 0:
                logger.warning(f"   ⚠️  No data found for {date}")
                return None
            
            # Prepare aggregated features
            aggregated = {
                'date': date,
                'sample_count': result['sample_count'],
                'features': {
                    'soil_temperature': float(result['soil_temperature']),
                    'soil_moisture': float(result['soil_moisture']),
                    'conductivity': float(result['conductivity']),
                    'ph': float(result['ph']),
                    'nitrogen': float(result['nitrogen']),
                    'phosphorus': float(result['phosphorus']),
                    'potassium': float(result['potassium']),
                    'salt': float(result['salt']),
                    'air_temperature': float(result['air_temperature']),
                    'air_humidity': float(result['air_humidity']),
                    'is_raining': bool(result['is_raining'])
                },
                'metadata': {
                    'min_soil_temp': float(result['min_soil_temp']),
                    'max_soil_temp': float(result['max_soil_temp']),
                    'min_moisture': float(result['min_moisture']),
                    'max_moisture': float(result['max_moisture'])
                }
            }
            
            logger.info(f"   ✅ Aggregated {result['sample_count']} samples")
            return aggregated
            
    except Exception as e:
        logger.error(f"❌ Error aggregating data: {e}")
        raise
    finally:
        conn.close()


def save_daily_insight(date: str, aggregated_data: Dict, ai_result: AIAnalysisResponse) -> int:
    """
    Save daily insight to database
    
    Args:
        date: Date string (YYYY-MM-DD)
        aggregated_data: Aggregated sensor data
        ai_result: AIAnalysisResponse from AI analysis
    
    Returns:
        ID of inserted record
    """
    logger.info(f"💾 Saving daily insight to DB...")
    
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            # Insert into daily_insights table (simplified schema - 26 columns)
            insert_query = """INSERT INTO daily_insights (date_vn, total_readings, soil_temperature_avg, soil_moisture_avg, conductivity_avg, ph_avg, nitrogen_avg, phosphorus_avg, potassium_avg, salt_avg, air_temperature_avg, air_humidity_avg, is_raining_majority, recommended_crop, crop_confidence, soil_health_score, soil_health_rating, has_anomaly, anomaly_score, summary_status, summary_text, ai_analysis_json, recommendations_json) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) ON CONFLICT (date_vn) DO UPDATE SET total_readings = EXCLUDED.total_readings, soil_temperature_avg = EXCLUDED.soil_temperature_avg, soil_moisture_avg = EXCLUDED.soil_moisture_avg, conductivity_avg = EXCLUDED.conductivity_avg, ph_avg = EXCLUDED.ph_avg, nitrogen_avg = EXCLUDED.nitrogen_avg, phosphorus_avg = EXCLUDED.phosphorus_avg, potassium_avg = EXCLUDED.potassium_avg, salt_avg = EXCLUDED.salt_avg, air_temperature_avg = EXCLUDED.air_temperature_avg, air_humidity_avg = EXCLUDED.air_humidity_avg, is_raining_majority = EXCLUDED.is_raining_majority, recommended_crop = EXCLUDED.recommended_crop, crop_confidence = EXCLUDED.crop_confidence, soil_health_score = EXCLUDED.soil_health_score, soil_health_rating = EXCLUDED.soil_health_rating, has_anomaly = EXCLUDED.has_anomaly, anomaly_score = EXCLUDED.anomaly_score, summary_status = EXCLUDED.summary_status, summary_text = EXCLUDED.summary_text, ai_analysis_json = EXCLUDED.ai_analysis_json, recommendations_json = EXCLUDED.recommendations_json, updated_at = NOW() RETURNING id"""
            
            # Prepare AI analysis summary JSON
            ai_summary = {
                "crop_recommendation": {
                    "best_crop": ai_result.crop_recommendation.best_crop,
                    "confidence": ai_result.crop_recommendation.confidence,
                    "top_3": ai_result.crop_recommendation.top_3
                },
                "soil_health": {
                    "score": ai_result.soil_health.overall_score,
                    "rating": ai_result.soil_health.rating
                },
                "anomaly_detection": {
                    "is_anomaly": ai_result.anomaly_detection.is_anomaly,
                    "score": ai_result.anomaly_detection.anomaly_score,
                    "status": ai_result.anomaly_detection.status
                },
                "timestamp": ai_result.timestamp,
                "processing_time_ms": ai_result.processing_time_ms
            }
            
            # Prepare recommendations JSON (list of dicts)
            recommendations_json = json.dumps([
                {
                    "priority": rec.priority,
                    "message": rec.message
                }
                for rec in ai_result.recommendations
            ], ensure_ascii=False)
            
            # Summary status and text
            if ai_result.anomaly_detection.is_anomaly:
                summary_status = "ALERT"
            elif ai_result.soil_health.overall_score >= 80:
                summary_status = "EXCELLENT"
            elif ai_result.soil_health.overall_score >= 60:
                summary_status = "GOOD"
            else:
                summary_status = "NEEDS_ATTENTION"
            
            summary_text = f"Soil Health: {ai_result.soil_health.rating} ({ai_result.soil_health.overall_score:.1f}/100). Recommended crop: {ai_result.crop_recommendation.best_crop}. {'ANOMALY DETECTED!' if ai_result.anomaly_detection.is_anomaly else 'Normal conditions.'}"
            
            cur.execute(insert_query, (
                date,
                aggregated_data['sample_count'],
                aggregated_data['features']['soil_temperature'],
                aggregated_data['features']['soil_moisture'],
                aggregated_data['features']['conductivity'],
                aggregated_data['features']['ph'],
                aggregated_data['features']['nitrogen'],
                aggregated_data['features']['phosphorus'],
                aggregated_data['features']['potassium'],
                aggregated_data['features']['salt'],
                aggregated_data['features']['air_temperature'],
                aggregated_data['features']['air_humidity'],
                aggregated_data['features']['is_raining'],
                ai_result.crop_recommendation.best_crop,
                ai_result.crop_recommendation.confidence,
                ai_result.soil_health.overall_score,
                ai_result.soil_health.rating,
                ai_result.anomaly_detection.is_anomaly,
                ai_result.anomaly_detection.anomaly_score,
                summary_status,
                summary_text,
                json.dumps(ai_summary),
                recommendations_json
            ))
            
            record_id = cur.fetchone()[0]
            conn.commit()
            
            logger.info(f"   ✅ Saved daily insight (ID: {record_id})")
            return record_id
            
    except Exception as e:
        conn.rollback()
        logger.error(f"❌ Error saving daily insight: {e}")
        raise
    finally:
        conn.close()


def push_to_blockchain(
    date: str,
    ai_result: AIAnalysisResponse,
    sample_count: int
) -> tuple[bool, str, str]:
    """
    Push daily AI insight to blockchain via Node.js bridge
    
    Args:
        date: Date string (YYYY-MM-DD)
        ai_result: AI analysis result
        sample_count: Number of samples aggregated
    
    Returns:
        Tuple: (success: bool, tx_hash: str, status: str)
    """
    try:
        # Get Node.js bridge URL from env (default: localhost:3000)
        bridge_url = os.getenv("BRIDGE_URL", "http://localhost:3000")
        endpoint = f"{bridge_url}/api/pushDailyInsight"
        
        # Prepare payload
        payload = {
            "date": date,
            "sampleCount": sample_count,
            "recommendedCrop": ai_result.crop_recommendation.best_crop,
            "confidence": ai_result.crop_recommendation.confidence,
            "soilHealthScore": ai_result.soil_health.overall_score,
            "healthRating": ai_result.soil_health.rating,
            "isAnomalyDetected": ai_result.anomaly_detection.is_anomaly,
            "recommendations": [
                {
                    "priority": rec.priority,
                    "message": rec.message
                }
                for rec in ai_result.recommendations
            ]
        }
        
        logger.info(f"\n🔗 Pushing to blockchain: {endpoint}")
        logger.info(f"   📦 Payload: {json.dumps(payload, indent=2)}")
        
        # Send POST request
        response = requests.post(
            endpoint,
            json=payload,
            timeout=30  # 30 seconds timeout for blockchain transaction
        )
        
        response.raise_for_status()  # Raise error for 4xx/5xx
        
        result = response.json()
        tx_hash = result.get('txHash', '')
        
        logger.info(f"   ✅ Blockchain push successful!")
        logger.info(f"      • TX Hash: {tx_hash}")
        logger.info(f"      • Block: {result.get('blockNumber')}")
        
        # Update database with blockchain status
        update_blockchain_status(date, 'confirmed', tx_hash)
        
        return (True, tx_hash, 'confirmed')
        
    except requests.exceptions.Timeout:
        logger.error("❌ Blockchain push timeout (30s)")
        update_blockchain_status(date, 'failed', None)
        return (False, '', 'failed')
        
    except requests.exceptions.RequestException as e:
        logger.error(f"❌ Blockchain push failed: {e}")
        if hasattr(e.response, 'text'):
            logger.error(f"   Response: {e.response.text}")
        update_blockchain_status(date, 'failed', None)
        return (False, '', 'failed')
        
    except Exception as e:
        logger.error(f"❌ Unexpected error pushing to blockchain: {e}")
        update_blockchain_status(date, 'failed', None)
        return (False, '', 'failed')


def update_blockchain_status(date: str, status: str, tx_hash: str = None):
    """
    Update blockchain status in daily_insights table
    
    Args:
        date: Date string (YYYY-MM-DD)
        status: Status (confirmed/failed)
        tx_hash: Transaction hash (optional)
    """
    try:
        conn = get_db_conn()
        with conn.cursor() as cur:
            if tx_hash:
                cur.execute("""
                    UPDATE daily_insights 
                    SET blockchain_status = %s, 
                        blockchain_tx_hash = %s,
                        blockchain_pushed_at = NOW()
                    WHERE date_vn = %s
                """, (status, tx_hash, date))
            else:
                cur.execute("""
                    UPDATE daily_insights 
                    SET blockchain_status = %s,
                        blockchain_pushed_at = NOW()
                    WHERE date_vn = %s
                """, (status, date))
            conn.commit()
        conn.close()
        logger.info(f"   ✅ Updated blockchain_status: {status}")
    except Exception as e:
        logger.error(f"   ⚠️  Failed to update blockchain_status: {e}")

