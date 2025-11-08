"""
UNIFIED BACKEND - PORT 8080 (INTERNAL)

Gộp 3 services:
1. Flask Data Ingest API
2. Flask Auth API
3. FastAPI AI Service

Chạy dưới 1 process duy nhất
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv
import logging
import sys

# FastAPI imports
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware as FastAPICORS
from fastapi.responses import JSONResponse
import uvicorn
from threading import Thread
import time

# Google Gemini AI (install: pip install google-generativeai tenacity)
try:
    import google.generativeai as genai
    from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    print("⚠️  google-generativeai not installed")

# AI Service imports
sys.path.append(os.path.join(os.path.dirname(__file__), 'ai_service'))
from ai_service.schemas import SoilDataInput, AIAnalysisResponse, HealthCheckResponse, DailyAggregateInput, DailyAnalysisResponse
from ai_service.models_loader import get_model_registry
from ai_service.inference import analyze_soil, analyze_aggregated_data
from ai_service.daily_aggregator import aggregate_daily_data, save_daily_insight, push_to_blockchain

# Auth imports
from auth_routes import auth_bp
from dashboard_routes import dashboard_bp

# Load environment
load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============================================================
# GEMINI AI CONFIGURATION
# ============================================================
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', 'AIzaSyAeE5mtJWbCa9JiL-rxB78c4HU7Bx7yOvM')
GEMINI_MODEL_NAME = 'gemini-2.5-pro'

if GEMINI_AVAILABLE and GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        gemini_model = genai.GenerativeModel(GEMINI_MODEL_NAME)
        logger.info(f"✅ Gemini AI initialized: {GEMINI_MODEL_NAME}")
    except Exception as e:
        logger.error(f"❌ Failed to initialize Gemini: {e}")
        gemini_model = None
else:
    gemini_model = None
    if not GEMINI_AVAILABLE:
        logger.warning("⚠️  Gemini SDK not installed - using rule-based AI")
    elif not GEMINI_API_KEY:
        logger.warning("⚠️  GEMINI_API_KEY not set - using rule-based AI")

# Retry decorator for Gemini API calls
@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type(Exception),
    reraise=True
)
def call_gemini_with_retry(prompt: str) -> str:
    """Call Gemini API with exponential backoff retry"""
    if not gemini_model:
        raise Exception("Gemini model not initialized")
    
    response = gemini_model.generate_content(prompt)
    return response.text

# ============================================================
# FLASK APP (Data Ingest + Auth + Dashboard)
# ============================================================

flask_app = Flask(__name__)
CORS(flask_app)

# Register blueprints
flask_app.register_blueprint(auth_bp)
flask_app.register_blueprint(dashboard_bp)

# Database helper
def get_db_conn():
    dsn = os.getenv("DATABASE_URL")
    if dsn:
        return psycopg2.connect(dsn)
    return psycopg2.connect(
        host=os.getenv("PGHOST", "36.50.134.107"),
        port=int(os.getenv("PGPORT", "6000")),
        dbname=os.getenv("PGDATABASE", "db_iot_sensor"),
        user=os.getenv("PGUSER", "admin"),
        password=os.getenv("PGPASSWORD", "admin123"),
    )

def normalize_measured_at_vn(payload: dict) -> str | None:
    created_at = payload.get("created_at")
    if isinstance(created_at, str) and len(created_at) >= 19:
        return created_at[:19]

    ts = payload.get("timestamp")
    if ts is None:
        vn = datetime.now(timezone.utc) + timedelta(hours=7)
        return vn.strftime("%Y-%m-%d %H:%M:%S")

    if isinstance(ts, (int, float)):
        dt_utc = datetime.fromtimestamp(ts, tz=timezone.utc)
        vn = dt_utc + timedelta(hours=7)
        return vn.strftime("%Y-%m-%d %H:%M:%S")

    if isinstance(ts, str):
        try:
            dt = datetime.strptime(ts, "%a, %d %b %Y %H:%M:%S GMT").replace(tzinfo=timezone.utc)
            vn = dt + timedelta(hours=7)
            return vn.strftime("%Y-%m-%d %H:%M:%S")
        except Exception:
            pass
        if len(ts) >= 19 and ts[4] == '-' and ts[7] == '-' and ts[13] == ':' and ts[16] == ':':
            return ts[:19]

    return None


# ====== FLASK ROUTES ======

@flask_app.route("/api/data", methods=["GET"])
def data_info():
    """GET /api/data - Show API information"""
    return jsonify({
        "service": "IoT Data Ingest API",
        "version": "2.0 (Unified)",
        "status": "running",
        "endpoint": "/api/data",
        "method": "POST",
        "description": "Endpoint for ESP8266/ESP32 to send sensor data",
        "required_fields": [
            "temperature", "humidity", "conductivity", "ph",
            "nitrogen", "phosphorus", "potassium", "salt",
            "air_temperature", "air_humidity", "is_raining"
        ],
        "example": {
            "temperature": 25.5,
            "humidity": 60.0,
            "conductivity": 500,
            "ph": 6.5,
            "nitrogen": 50,
            "phosphorus": 30,
            "potassium": 40,
            "salt": 100,
            "air_temperature": 28.0,
            "air_humidity": 65.0,
            "is_raining": False
        }
    })

@flask_app.route("/api/data", methods=["POST"])
def receive_data():
    try:
        data = request.get_json(silent=True) or {}
        
        soil_temperature = data.get("temperature")
        soil_moisture = data.get("humidity")
        conductivity = data.get("conductivity")
        ph = data.get("ph")
        nitrogen = data.get("nitrogen")
        phosphorus = data.get("phosphorus")
        potassium = data.get("potassium")
        salt = data.get("salt")
        air_temperature = data.get("air_temperature")
        air_humidity = data.get("air_humidity")
        is_raining = data.get("is_raining")
        
        required_fields = {
            "soil_temperature": soil_temperature,
            "soil_moisture": soil_moisture,
            "conductivity": conductivity,
            "ph": ph,
            "nitrogen": nitrogen,
            "phosphorus": phosphorus,
            "potassium": potassium,
            "salt": salt,
            "air_temperature": air_temperature,
            "air_humidity": air_humidity,
            "is_raining": is_raining
        }
        
        missing = [k for k, v in required_fields.items() if v is None]
        if missing:
            return jsonify({
                "status": "error", 
                "message": f"Missing required fields: {', '.join(missing)}"
            }), 400
        
        if isinstance(is_raining, bool):
            is_raining_bool = is_raining
        elif isinstance(is_raining, str):
            is_raining_bool = is_raining.lower() == "true"
        else:
            is_raining_bool = bool(is_raining)

        measured_at_vn = normalize_measured_at_vn(data)
        if not measured_at_vn:
            return jsonify({"status": "error", "message": "Invalid timestamp/created_at"}), 400

        with get_db_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO sensor_readings (
                        measured_at_vn,
                        soil_temperature_c, soil_moisture_pct,
                        conductivity_us_cm, ph_value,
                        nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l,
                        air_temperature_c, air_humidity_pct, is_raining
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (measured_at_vn) DO NOTHING
                    """,
                    (
                        measured_at_vn,
                        float(soil_temperature),
                        float(soil_moisture),
                        int(conductivity),
                        float(ph),
                        int(nitrogen),
                        int(phosphorus),
                        int(potassium),
                        int(salt),
                        float(air_temperature),
                        float(air_humidity),
                        is_raining_bool
                    ),
                )
                conn.commit()

        # Callback blockchain bridge via internal endpoint
        bridge_url = "http://localhost:3000/bridgePending"
        bridge_result = None
        try:
            import urllib.request
            import json
            req = urllib.request.Request(
                bridge_url,
                data=json.dumps({"limit": 1}).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            # Increased timeout to 30s for blockchain confirmation
            with urllib.request.urlopen(req, timeout=30) as resp:
                bridge_result = {"status": resp.status, "confirmed": True}
        except Exception as e:
            bridge_result = {"error": str(e), "confirmed": False}

        return jsonify({
            "status": "success",
            "measured_at_vn": measured_at_vn,
            "bridge": bridge_result,
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@flask_app.route("/api/latest", methods=["GET"])
def api_latest():
    try:
        with get_db_conn() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    """
                    SELECT id,
                           soil_temperature_c as soil_temperature,
                           soil_moisture_pct as soil_moisture,
                           conductivity_us_cm as conductivity,
                           ph_value as ph,
                           nitrogen_mg_kg as nitrogen,
                           phosphorus_mg_kg as phosphorus,
                           potassium_mg_kg as potassium,
                           salt_mg_l as salt,
                           air_temperature_c as air_temperature,
                           air_humidity_pct as air_humidity,
                           is_raining,
                           measured_at_vn, created_at_vn, onchain_status
                    FROM sensor_readings
                    ORDER BY id DESC
                    LIMIT 1
                    """
                )
                row = cur.fetchone()
                if not row:
                    return jsonify({"message": "no data"}), 200
                row["status"] = row.get("onchain_status") or "pending"
                row["created_at"] = row.get("created_at_vn")
                row["timestamp"] = row.get("measured_at_vn")
                return jsonify(row), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@flask_app.route("/api/history", methods=["GET"])
def api_history():
    try:
        limit = min(int(request.args.get("limit", 100)), 1000)
        with get_db_conn() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    """
                    SELECT id,
                           soil_temperature_c as soil_temperature,
                           soil_moisture_pct as soil_moisture,
                           conductivity_us_cm as conductivity,
                           ph_value as ph,
                           nitrogen_mg_kg as nitrogen,
                           phosphorus_mg_kg as phosphorus,
                           potassium_mg_kg as potassium,
                           salt_mg_l as salt,
                           air_temperature_c as air_temperature,
                           air_humidity_pct as air_humidity,
                           is_raining,
                           measured_at_vn as timestamp,
                           onchain_status as status,
                           created_at_vn as created_at
                    FROM sensor_readings
                    ORDER BY id DESC
                    LIMIT %s
                    """,
                    (limit,),
                )
                rows = cur.fetchall()
                return jsonify({"count": len(rows), "data": rows}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@flask_app.route("/api/health", methods=["GET"])
def flask_health():
    return jsonify({
        "service": "Flask API",
        "status": "ok",
        "timestamp": datetime.now().isoformat()
    }), 200


# ============================================================
# DASHBOARD ROUTES
# ============================================================

@flask_app.route("/api/dashboard/overview", methods=["GET"])
def dashboard_overview():
    """Dashboard overview statistics for last 30 days"""
    try:
        with get_db_conn() as conn:
            with conn.cursor() as cur:
                # Daily insights stats
                cur.execute("""
                    SELECT 
                        AVG(soil_health_score) as avg_health,
                        COUNT(id) as total_insights,
                        COUNT(CASE WHEN blockchain_status = 'confirmed' THEN 1 END) as verified_count,
                        COUNT(CASE WHEN has_anomaly = TRUE THEN 1 END) as anomaly_count
                    FROM daily_insights
                    WHERE date_vn >= CURRENT_DATE - INTERVAL '30 days'
                """)
                insights_row = cur.fetchone()
                
                # Total IoT records
                cur.execute("""
                    SELECT COUNT(*) as total_iot
                    FROM sensor_readings
                    WHERE measured_at_vn >= NOW() - INTERVAL '30 days'
                """)
                iot_row = cur.fetchone()
                
                stats = {
                    "avg_soil_health": round(float(insights_row[0] or 0), 1),
                    "total_iot_records": int(iot_row[0] or 0),
                    "verified_daily_insights": int(insights_row[2] or 0),
                    "total_daily_insights": int(insights_row[1] or 0),
                    "anomalies_detected": int(insights_row[3] or 0),
                    "last_updated": datetime.now(timezone.utc).isoformat() + 'Z'
                }
                
                return jsonify({
                    "success": True,
                    "stats": stats,
                    "period": "last_30_days"
                }), 200
    except Exception as e:
        print(f"❌ Dashboard overview error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@flask_app.route("/api/dashboard/realtime-iot", methods=["GET"])
def dashboard_realtime_iot():
    """Latest IoT sensor reading + 24h trend"""
    try:
        hours = int(request.args.get('hours', 24))
        
        with get_db_conn() as conn:
            with conn.cursor() as cur:
                # Latest sensor reading (ORDER BY created_at_vn DESC to get real IoT data by insert time)
                cur.execute("""
                    SELECT 
                        measured_at_vn, soil_temperature_c, soil_moisture_pct,
                        ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg,
                        salt_mg_l, air_temperature_c, air_humidity_pct, is_raining,
                        onchain_status, conductivity_us_cm
                    FROM sensor_readings
                    ORDER BY created_at_vn DESC
                    LIMIT 1
                """)
                latest_row = cur.fetchone()
                
                if not latest_row:
                    return jsonify({"success": False, "error": "No sensor data available"}), 404
                
                latest = {
                    "measured_at": latest_row[0].strftime('%Y-%m-%d %H:%M:%S') if latest_row[0] else None,
                    "soil_temperature_c": float(latest_row[1]) if latest_row[1] is not None else 0,
                    "soil_moisture_pct": float(latest_row[2]) if latest_row[2] is not None else 0,
                    "ph_value": float(latest_row[3]) if latest_row[3] is not None else 0,
                    "nitrogen_mg_kg": float(latest_row[4]) if latest_row[4] is not None else 0,
                    "phosphorus_mg_kg": float(latest_row[5]) if latest_row[5] is not None else 0,
                    "potassium_mg_kg": float(latest_row[6]) if latest_row[6] is not None else 0,
                    "salt_mg_l": float(latest_row[7]) if latest_row[7] is not None else 0,
                    "air_temperature_c": float(latest_row[8]) if latest_row[8] is not None else 0,
                    "air_humidity_pct": float(latest_row[9]) if latest_row[9] is not None else 0,
                    "is_raining": bool(latest_row[10]),
                    "onchain_status": latest_row[11],
                    "conductivity_us_cm": float(latest_row[12]) if latest_row[12] is not None else 0
                }
                
                # Hourly trend
                cur.execute("""
                    SELECT 
                        DATE_TRUNC('hour', measured_at_vn) as hour,
                        AVG(soil_temperature_c), AVG(soil_moisture_pct), AVG(ph_value),
                        AVG(nitrogen_mg_kg), AVG(phosphorus_mg_kg), AVG(potassium_mg_kg)
                    FROM sensor_readings
                    WHERE measured_at_vn >= NOW() - INTERVAL '%s hours'
                    GROUP BY hour
                    ORDER BY hour ASC
                """ % hours)
                
                trend_24h = []
                for row in cur.fetchall():
                    trend_24h.append({
                        "time": row[0].strftime('%Y-%m-%d %H:%M') if row[0] else None,
                        "temp": round(float(row[1] or 0), 1),
                        "moisture": round(float(row[2] or 0), 1),
                        "ph": round(float(row[3] or 0), 1),
                        "nitrogen": round(float(row[4] or 0), 1),
                        "phosphorus": round(float(row[5] or 0), 1),
                        "potassium": round(float(row[6] or 0), 1)
                    })
                
                return jsonify({
                    "success": True,
                    "latest": latest,
                    "trend_24h": trend_24h,
                    "hours": hours
                }), 200
    except Exception as e:
        print(f"❌ Realtime IoT error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@flask_app.route("/api/dashboard/ai-history", methods=["GET"])
def dashboard_ai_history():
    """Daily AI insights for last N days"""
    try:
        days = int(request.args.get('days', 30))
        
        with get_db_conn() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT 
                        id, date_vn, recommended_crop, crop_confidence,
                        soil_health_score, soil_health_rating, has_anomaly,
                        blockchain_status, blockchain_tx_hash, blockchain_pushed_at,
                        recommendations_json, total_readings, created_at
                    FROM daily_insights
                    WHERE date_vn >= CURRENT_DATE - INTERVAL '%s days'
                    ORDER BY date_vn DESC
                """ % days)
                
                insights = []
                for row in cur.fetchall():
                    insights.append({
                        "id": row[0],
                        "date": row[1].strftime('%Y-%m-%d') if row[1] else None,
                        "recommended_crop": row[2],
                        "confidence": int(row[3] or 0),
                        "soil_health_score": int(row[4] or 0),
                        "health_rating": row[5],
                        "is_anomaly_detected": bool(row[6]),
                        "blockchain_status": row[7],
                        "blockchain_tx_hash": row[8],
                        "blockchain_pushed_at": row[9].strftime('%Y-%m-%d %H:%M:%S') if row[9] else None,
                        "recommendations": row[10],
                        "sample_count": int(row[11] or 0),
                        "created_at": row[12].strftime('%Y-%m-%d %H:%M:%S') if row[12] else None
                    })
                
                return jsonify({
                    "success": True,
                    "insights": insights,
                    "total": len(insights),
                    "days": days
                }), 200
    except Exception as e:
        print(f"❌ AI history error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================================
# ZALO INTEGRATION
# ============================================================

@flask_app.route("/api/auth/zalo/link-account", methods=["POST"])
def link_zalo_account():
    """
    Link Zalo ID with user account using verification token
    
    This endpoint is called after user:
    1. Receives Zalo message with linking link (created by n8n)
    2. Clicks the link and signs in to web
    3. Confirms on web to complete linking
    
    Request body:
    {
        "token": "abc123xyz...",  # Token from zalo_link_sessions table
        "user_id": 1              # Currently logged-in user ID (from auth)
    }
    
    Response:
    {
        "success": true,
        "message": "Tài khoản Zalo đã được liên kết thành công!",
        "zalo_id": "123456789",
        "user_id": 1,
        "full_name": "Nguyen Van A"
    }
    """
    try:
        data = request.get_json(silent=True) or {}
        token = data.get('token')
        user_id = data.get('user_id')
        
        if not token or not user_id:
            return jsonify({
                'success': False,
                'error': 'Missing required fields: token, user_id'
            }), 400
        
        conn = get_db_conn()
        cur = conn.cursor()
        
        try:
            # 1. Verify token exists and get zalo_id from it
            cur.execute("""
                SELECT id, expires_at, is_used, zalo_id
                FROM zalo_link_sessions
                WHERE token = %s
            """, (token,))
            
            session_row = cur.fetchone()
            
            if not session_row:
                cur.close()
                conn.close()
                return jsonify({
                    'success': False,
                    'error': 'Token không hợp lệ hoặc không tồn tại'
                }), 404
            
            session_id, expires_at, is_used, zalo_id = session_row
            
            # Check if token already used
            if is_used:
                cur.close()
                conn.close()
                return jsonify({
                    'success': False,
                    'error': 'Token đã được sử dụng rồi'
                }), 400
            
            # Check if token expired (comparing UTC times with timezone)
            from datetime import datetime as dt
            now_utc = dt.now(timezone.utc)
            if now_utc > expires_at:
                cur.close()
                conn.close()
                return jsonify({
                    'success': False,
                    'error': 'Token đã hết hạn (5 phút). Vui lòng yêu cầu liên kết lại.'
                }), 400
            
            # 2. Check if this zalo_chat_id is already linked to another user
            cur.execute("""
                SELECT id FROM users WHERE zalo_chat_id = %s AND id != %s
            """, (zalo_id, user_id))
            
            existing = cur.fetchone()
            if existing:
                cur.close()
                conn.close()
                return jsonify({
                    'success': False,
                    'error': 'Zalo ID này đã được liên kết với tài khoản khác'
                }), 409
            
            # 3. Update user with zalo_chat_id
            cur.execute("""
                UPDATE users
                SET zalo_chat_id = %s,
                    updated_at_vn = NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh'
                WHERE id = %s
                RETURNING id, full_name, zalo_chat_id
            """, (zalo_id, user_id))
            
            result = cur.fetchone()
            
            if not result:
                cur.close()
                conn.close()
                return jsonify({
                    'success': False,
                    'error': 'User không tồn tại'
                }), 404
            
            user_id_returned, full_name, zalo_chat_id_linked = result
            
            # 4. Mark session token as used and link to user
            cur.execute("""
                UPDATE zalo_link_sessions
                SET is_used = TRUE,
                    user_id = %s
                WHERE id = %s
            """, (user_id, session_id))
            
            conn.commit()
            
            logger.info(f"✅ Zalo account linked!")
            logger.info(f"   User: {full_name} (ID: {user_id_returned})")
            logger.info(f"   Zalo ID: {zalo_chat_id_linked}")
            
            return jsonify({
                'success': True,
                'message': 'Tài khoản Zalo đã được liên kết thành công!',
                'zalo_id': zalo_chat_id_linked,
                'user_id': user_id_returned,
                'full_name': full_name
            }), 200
            
        finally:
            cur.close()
            conn.close()
        
    except Exception as e:
        logger.error(f"❌ Link Zalo error: {e}", exc_info=True)
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# ============================================================
# AI CHAT & ANALYSIS
# ============================================================

@flask_app.route("/api/ai/chat", methods=["POST"])
def flask_ai_chat():
    """
    AI Chat endpoint - READS DATABASE REAL-TIME for latest sensor data
    """
    try:
        data = request.get_json(silent=True) or {}
        message = data.get('message', '')
        
        # QUERY DATABASE FOR REAL-TIME DATA
        logger.info(f"💬 AI Chat request: {message[:50]}...")
        try:
            with get_db_conn() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("""
                        SELECT 
                            soil_temperature_c as soil_temperature,
                            soil_moisture_pct as soil_moisture,
                            ph_value as ph,
                            nitrogen_mg_kg as nitrogen,
                            phosphorus_mg_kg as phosphorus,
                            potassium_mg_kg as potassium,
                            air_humidity_pct as air_humidity,
                            air_temperature_c as air_temperature,
                            salt_mg_l as salt,
                            measured_at_vn
                        FROM sensor_readings 
                        ORDER BY measured_at_vn DESC 
                        LIMIT 1
                    """)
                    latest = cur.fetchone()
                    
                    if not latest:
                        logger.warning("⚠️ No sensor data found in database")
                        return jsonify({"error": "Không có dữ liệu cảm biến"}), 404
                    
                    # Extract real-time values from database
                    temp = float(latest['soil_temperature'] or 0)
                    moisture = float(latest['soil_moisture'] or 0)
                    ph = float(latest['ph'] or 0)
                    nitrogen = int(latest['nitrogen'] or 0)
                    phosphorus = int(latest['phosphorus'] or 0)
                    potassium = int(latest['potassium'] or 0)
                    humidity = float(latest['air_humidity'] or 0)
                    
                    logger.info(f"📊 Real-time data from DB: temp={temp}°C, moisture={moisture}%, pH={ph}, NPK=({nitrogen},{phosphorus},{potassium})")
                    
        except Exception as db_error:
            logger.error(f"❌ Database error: {db_error}")
            return jsonify({"error": "Lỗi đọc database"}), 500
        
        # ============================================================
        # TRY GEMINI AI FIRST (with retry logic)
        # ============================================================
        if gemini_model:
            try:
                logger.info("🤖 Using Gemini AI for response...")
                
                # Build comprehensive prompt for Gemini
                gemini_prompt = f"""Bạn là chuyên gia nông nghiệp thông minh, thân thiện và chuyên nghiệp. Hãy trả lời câu hỏi của người nông dân.

**Câu hỏi:** {message}

**Dữ liệu cảm biến hiện tại (REAL-TIME từ database):**
- Nhiệt độ đất: {temp}°C
- Độ ẩm đất: {moisture}%
- pH đất: {ph}
- Nitrogen (N): {nitrogen} mg/kg
- Phosphorus (P): {phosphorus} mg/kg
- Potassium (K): {potassium} mg/kg
- Độ ẩm không khí: {humidity}%

**Hướng dẫn trả lời:**
1. Gọi người dùng là "bác" (thân thiện, kiểu nông dân Việt Nam)
2. Phân tích CỤ THỂ dựa trên dữ liệu THỰC TẾ trên
3. So sánh với ngưỡng tối ưu:
   - Nhiệt độ đất: 20-30°C
   - Độ ẩm đất: 40-70%
   - pH: 6.0-7.5
   - NPK: N≥40, P≥30, K≥150 mg/kg
4. Đưa ra lời khuyên HÀNH ĐỘNG cụ thể (bón phân gì, bao nhiêu kg/sào)
5. Nếu hỏi về cây trồng → đề xuất 2-3 loại cây PHÙ HỢP với điều kiện hiện tại
6. Dùng emoji phù hợp (✅ ⚠️ 🌡️ 💧 🌱 🍅 🥬 🌶️)
7. TRẢ LỜI NGẮN GỌN, DỄ HIỂU (không quá 200 từ)

Hãy trả lời:"""

                # Call Gemini with retry
                gemini_response = call_gemini_with_retry(gemini_prompt)
                logger.info(f"✅ Gemini response received ({len(gemini_response)} chars)")
                
                return jsonify({"response": gemini_response}), 200
                
            except Exception as gemini_error:
                logger.error(f"⚠️  Gemini API failed: {gemini_error}")
                logger.info("🔄 Falling back to rule-based AI...")
                # Continue to rule-based fallback below
        
        # ============================================================
        # FALLBACK: RULE-BASED AI (if Gemini not available or failed)
        # ============================================================
        logger.info("📋 Using rule-based AI for response...")
        
        # Detect question type - MORE INTELLIGENT
        is_crop_recommendation = any(word in message.lower() for word in [
            'trồng', 'cây', 'gieo', 'crop', 'plant', 'loại cây', 'loại công', 
            'phù hợp', 'nên trồng', 'thích hợp', 'suitable'
        ])
        
        # Detect if user asking about combination/comparison (e.g., "nhiệt độ + NPK")
        is_combination_question = any(phrase in message.lower() for phrase in [
            'với', 'cùng', 'thì', 'ổn không', 'ổn ko', 'được không', 'được ko',
            'có tốt', 'có ổn', 'như vậy', 'như thế', 'thế này'
        ]) and (
            ('nhiệt độ' in message.lower() or 'temperature' in message.lower()) or
            ('npk' in message.lower()) or
            ('ph' in message.lower()) or
            ('độ ẩm' in message.lower())
        )
        
        is_general_chat = any(word in message.lower() for word in [
            'vườn', 'tổng quan', 'tình hình', 'thế nào', 'như nào', 'overview'
        ]) and not any(word in message for word in ['Nhiệt độ', 'Độ ẩm', 'pH', 'NPK'])
        
        # Detect which metric is being analyzed from message
        metric_focused = None
        if 'Nhiệt độ đất' in message or 'temperature' in message.lower():
            metric_focused = 'temperature'
        elif 'Độ ẩm đất' in message or 'moisture' in message.lower():
            metric_focused = 'moisture'
        elif 'pH' in message or 'ph' in message.lower():
            metric_focused = 'ph'
        elif 'Nitrogen' in message or 'nitrogen' in message.lower() or 'NPK' in message:
            metric_focused = 'nitrogen'
        elif 'Phosphorus' in message or 'phosphorus' in message.lower():
            metric_focused = 'phosphorus'
        elif 'Potassium' in message or 'potassium' in message.lower() or 'Kali' in message:
            metric_focused = 'potassium'
        elif 'Độ ẩm không khí' in message or 'humidity' in message.lower():
            metric_focused = 'humidity'
        
        # Build response based on focused metric
        response = ""
        
        # PRIORITY 1: Combination questions (e.g., "nhiệt độ + NPK ổn không?")
        if is_combination_question and not metric_focused:
            response = "Để cháu phân tích điều kiện tổng hợp cho bác nhé!\n\n"
            
            # Comprehensive analysis
            temp_status = "✅ tốt" if 20 <= temp <= 30 else "⚠️ cần điều chỉnh"
            ph_status = "✅ lý tưởng" if 6.0 <= ph <= 7.5 else "⚠️ cần điều chỉnh"
            moisture_status = "✅ tốt" if 40 <= moisture <= 70 else "⚠️ cần điều chỉnh"
            npk_status = "✅ đầy đủ" if (nitrogen >= 40 and phosphorus >= 30 and potassium >= 150) else "⚠️ thiếu"
            
            response += f"**📊 Tổng quan điều kiện:**\n"
            response += f"- Nhiệt độ đất: **{temp}°C** ({temp_status})\n"
            response += f"- pH đất: **{ph}** ({ph_status})\n"
            response += f"- Độ ẩm đất: **{moisture}%** ({moisture_status})\n"
            response += f"- NPK: N={nitrogen}, P={phosphorus}, K={potassium} ({npk_status})\n\n"
            
            # Overall assessment
            good_count = sum([
                20 <= temp <= 30,
                6.0 <= ph <= 7.5,
                40 <= moisture <= 70,
                nitrogen >= 40 and phosphorus >= 30 and potassium >= 150
            ])
            
            if good_count == 4:
                response += "**🌟 ĐÁNH GIÁ: ĐẤT CỰC KỲ PHÙ HỢP!**\n\n"
                response += "Với điều kiện như này, bác có thể trồng:\n"
                response += "- 🍅 **Cà chua**: NPK và nhiệt độ lý tưởng, thu hoạch cao\n"
                response += "- 🥒 **Dưa leo, dưa chuột**: Kali cao, quả to ngọt\n"
                response += "- 🌶️ **Ớt**: Điều kiện hoàn hảo, ra trái liên tục\n"
                response += "- 🥬 **Rau xanh**: Sinh trưởng nhanh, chất lượng tốt\n\n"
                response += "💡 **Lời khuyên:** Tiếp tục duy trì điều kiện này, định kỳ bón phân bổ sung và tưới đều. Bác sẽ có vụ mùa bội thu đó!"
            elif good_count >= 2:
                response += "**✅ ĐÁNH GIÁ: ĐẤT PHÙ HỢP**\n\n"
                issues = []
                if not (20 <= temp <= 30):
                    if temp < 20:
                        issues.append(f"- Nhiệt độ **{temp}°C** hơi thấp → Che phủ, tưới nước ấm vào trưa")
                    else:
                        issues.append(f"- Nhiệt độ **{temp}°C** hơi cao → Che bóng mát, tưới sáng sớm/chiều mát")
                
                if not (6.0 <= ph <= 7.5):
                    if ph < 6.0:
                        issues.append(f"- pH **{ph}** quá chua → Rải vôi bột 200-300kg/ha")
                    else:
                        issues.append(f"- pH **{ph}** quá kiềm → Bón phân lưu huỳnh, phân chuồng")
                
                if not (40 <= moisture <= 70):
                    if moisture < 40:
                        issues.append(f"- Độ ẩm **{moisture}%** khô → Tưới nước ngay, phủ rơm rạ giữ ẩm")
                    else:
                        issues.append(f"- Độ ẩm **{moisture}%** quá cao → Giảm tưới, kiểm tra thoát nước")
                
                if not (nitrogen >= 40 and phosphorus >= 30 and potassium >= 150):
                    npk_advice = []
                    if nitrogen < 40:
                        npk_advice.append(f"Nitrogen {nitrogen} mg/kg (thiếu) → Urê 46%: 10-15 kg/sào")
                    if phosphorus < 30:
                        npk_advice.append(f"Phosphorus {phosphorus} mg/kg (thiếu) → Lân super 16%: 15-20 kg/sào")
                    if potassium < 150:
                        npk_advice.append(f"Potassium {potassium} mg/kg (thiếu) → Kali clorua 60%: 5-10 kg/sào")
                    issues.append("- NPK thiếu → Bón phân:\n  " + "\n  ".join(npk_advice))
                
                if issues:
                    response += "**⚠️ Cần điều chỉnh:**\n" + "\n".join(issues) + "\n\n"
                
                response += "**🌱 Cây trồng phù hợp hiện tại:**\n"
                response += "- 🥬 Rau ăn lá (cải, xà lách): Ít cần NPK, sinh trưởng nhanh\n"
                response += "- 🫘 Đậu các loại: Tự bổ sung đạm, chịu được điều kiện khó\n\n"
                response += "💡 **Lời khuyên:** Sau khi điều chỉnh các yếu tố trên, bác có thể trồng nhiều loại cây có giá trị kinh tế cao hơn!"
            else:
                response += "**⚠️ ĐÁNH GIÁ: ĐẤT CẦN CẢI THIỆN**\n\n"
                response += "Điều kiện hiện tại chưa lý tưởng, bác nên:\n\n"
                response += "**🔧 Các bước cải thiện:**\n"
                if not (20 <= temp <= 30):
                    response += f"1. Điều chỉnh nhiệt độ (hiện {temp}°C)\n"
                if not (6.0 <= ph <= 7.5):
                    response += f"2. Điều chỉnh pH (hiện {ph})\n"
                if not (40 <= moisture <= 70):
                    response += f"3. Điều chỉnh độ ẩm (hiện {moisture}%)\n"
                if not (nitrogen >= 40 and phosphorus >= 30 and potassium >= 150):
                    response += f"4. Bổ sung NPK (hiện N={nitrogen}, P={phosphorus}, K={potassium})\n"
                
                response += "\n💡 **Lời khuyên:** Bác nên cải thiện đất trước khi trồng cây có giá trị cao. Hiện tại có thể trồng cây họ đậu (đỗ xanh, đậu phộng) để cải tạo đất và bổ sung đạm tự nhiên!"
        
        # If specific metric is focused, only analyze that
        elif metric_focused:
            if metric_focused == 'temperature' and temp > 0:
                response = f"**Nhiệt độ đất: {temp}°C**\n\n"
                if temp < 15:
                    response += f"⚠️ Nhiệt độ **{temp}°C** quá thấp đó bác! Cây có thể ngừng phát triển. Bác nên:\n"
                    response += "- Che phủ bằng nilon hoặc lưới bóng râm\n"
                    response += "- Tưới nước vào buổi trưa khi trời ấm\n"
                    response += "- Tránh tưới nước lạnh vào sáng sớm\n\n"
                    response += "Nhiệt độ lý tưởng cho cây trồng là **20-30°C** đó bác!"
                elif temp < 20:
                    response += f"Nhiệt độ **{temp}°C** hơi thấp đó bác, cây phát triển chậm hơn bình thường.\n\n"
                    response += "Bác có thể tưới nước vào buổi trưa để giữ ấm cho đất, hoặc che phủ để giữ nhiệt độ ổn định hơn nhé!"
                elif temp > 35:
                    response += f"🔥 Nhiệt độ **{temp}°C** quá cao đó bác! Cây dễ bị héo và stress nhiệt. Bác cần:\n"
                    response += "- Tưới nước sáng sớm và chiều mát\n"
                    response += "- Che bóng mát bằng lưới 50-70%\n"
                    response += "- Phun sương nhẹ lên lá vào trưa\n\n"
                    response += "Nhiệt độ tốt nhất là **20-30°C** đó bác!"
                elif temp > 30:
                    response += f"Nhiệt độ **{temp}°C** hơi cao đó bác. Cây có thể bị stress nếu kéo dài.\n\n"
                    response += "Bác nên tưới nước đều đặn và xem xét che bớt nắng vào buổi trưa để cây khỏe mạnh hơn!"
                else:
                    response += f"✅ Nhiệt độ **{temp}°C** rất lý tưởng đó bác! Đây là nhiệt độ tốt nhất cho cây phát triển.\n\n"
                    response += "Cây đang ở trong điều kiện nhiệt độ hoàn hảo, tiếp tục duy trì như vậy nhé bác!"
                    
            elif metric_focused == 'moisture' and moisture > 0:
                response = f"**Độ ẩm đất: {moisture}%**\n\n"
                if moisture < 20:
                    response += f"⚠️ Độ ẩm **{moisture}%** quá khô đó bác! Cây đang thiếu nước nghiêm trọng. Bác cần:\n"
                    response += "- Tưới nước ngay lập tức\n"
                    response += "- Tưới từ từ để đất hấp thụ tốt\n"
                    response += "- Phủ rơm rạ giữ ẩm\n\n"
                    response += "Độ ẩm lý tưởng là **40-70%** đó bác!"
                elif moisture < 30:
                    response += f"Độ ẩm **{moisture}%** hơi khô đó bác. Cây cần được tưới thêm nước.\n\n"
                    response += "Bác nên tưới đều đặn, đặc biệt vào mùa khô, để cây phát triển tốt nhé!"
                elif moisture > 85:
                    response += f"⚠️ Độ ẩm **{moisture}%** quá cao đó bác! Nguy cơ úng rễ và nấm bệnh. Bác cần:\n"
                    response += "- Ngừng tưới tạm thời\n"
                    response += "- Kiểm tra hệ thống thoát nước\n"
                    response += "- Xới đất nhẹ để thoáng khí\n\n"
                    response += "Độ ẩm tốt nhất là **40-70%** đó bác!"
                elif moisture > 75:
                    response += f"Độ ẩm **{moisture}%** hơi cao đó bác. Cây có thể bị úng nước.\n\n"
                    response += "Bác nên giảm lượng tưới và kiểm tra thoát nước để tránh úng rễ nhé!"
                else:
                    response += f"✅ Độ ẩm **{moisture}%** rất tốt đó bác! Cây đang được cung cấp nước đầy đủ.\n\n"
                    response += "Tiếp tục duy trì độ ẩm này, cây sẽ phát triển khỏe mạnh!"
                    
            elif metric_focused == 'ph' and ph > 0:
                response = f"**pH đất: {ph}**\n\n"
                if ph < 5.5:
                    response += f"⚠️ pH **{ph}** quá chua đó bác! Đất chua làm cây hấp thụ dinh dưỡng kém. Bác cần:\n"
                    response += "- Rải vôi bột 200-300kg/ha\n"
                    response += "- Trộn đều vào đất\n"
                    response += "- Đợi 2-3 tuần mới trồng cây\n\n"
                    response += "pH lý tưởng là **6.0-7.5** đó bác!"
                elif ph < 6.0:
                    response += f"pH **{ph}** hơi chua đó bác. Cây có thể hấp thụ dinh dưỡng không tốt.\n\n"
                    response += "Bác nên rải vôi bột nhẹ để tăng pH lên khoảng 6.5-7.0 cho tối ưu nhé!"
                elif ph > 8.0:
                    response += f"⚠️ pH **{ph}** quá kiềm đó bác! Đất kiềm cũng gây khó hấp thụ dinh dưỡng. Bác cần:\n"
                    response += "- Bón phân lưu huỳnh\n"
                    response += "- Bón phân chuồng ủ hoai\n"
                    response += "- Tránh dùng vôi\n\n"
                    response += "pH tốt nhất là **6.0-7.5** đó bác!"
                elif ph > 7.5:
                    response += f"pH **{ph}** hơi kiềm đó bác. Cây có thể thiếu sắt và kẽm.\n\n"
                    response += "Bác có thể bón phân lưu huỳnh để giảm pH xuống một chút nhé!"
                else:
                    response += f"✅ pH **{ph}** rất lý tưởng đó bác! Đây là mức pH tốt nhất cho cây trồng.\n\n"
                    response += "Cây đang hấp thụ dinh dưỡng tối ưu, tiếp tục duy trì nhé bác!"
                    
            elif metric_focused in ['nitrogen', 'phosphorus', 'potassium'] or 'NPK' in message:
                response = f"**Chỉ số NPK: N={nitrogen}, P={phosphorus}, K={potassium}**\n\n"
                issues = []
                
                if nitrogen < 30:
                    issues.append(f"⚠️ **Nitrogen {nitrogen} mg/kg** - Quá thấp! Cây sẽ lá vàng, phát triển kém.")
                elif nitrogen < 40:
                    issues.append(f"**Nitrogen {nitrogen} mg/kg** - Hơi thấp, cây cần thêm đạm.")
                else:
                    issues.append(f"✅ **Nitrogen {nitrogen} mg/kg** - Tốt!")
                    
                if phosphorus < 20:
                    issues.append(f"⚠️ **Phosphorus {phosphorus} mg/kg** - Quá thấp! Rễ phát triển kém, khó ra hoa.")
                elif phosphorus < 30:
                    issues.append(f"**Phosphorus {phosphorus} mg/kg** - Hơi thấp, cây cần thêm lân.")
                else:
                    issues.append(f"✅ **Phosphorus {phosphorus} mg/kg** - Tốt!")
                    
                if potassium < 100:
                    issues.append(f"⚠️ **Potassium {potassium} mg/kg** - Quá thấp! Cây kém chống chịu sâu bệnh.")
                elif potassium < 150:
                    issues.append(f"**Potassium {potassium} mg/kg** - Hơi thấp, cây cần thêm kali.")
                else:
                    issues.append(f"✅ **Potassium {potassium} mg/kg** - Tốt!")
                
                response += "\n".join(issues) + "\n\n"
                
                if nitrogen < 40 or phosphorus < 30 or potassium < 150:
                    response += "**Khuyến nghị bón phân:**\n"
                    if nitrogen < 40:
                        response += "- Đạm urê 46%: 10-15 kg/sào\n"
                    if phosphorus < 30:
                        response += "- Lân super 16%: 15-20 kg/sào\n"
                    if potassium < 150:
                        response += "- Kali clorua 60%: 5-10 kg/sào\n"
                    response += "\nBón cách gốc 10-15cm, sau đó tưới nước nhé bác!"
                else:
                    response += "Chỉ số NPK rất tốt! Cây đang được dinh dưỡng đầy đủ, tiếp tục duy trì nhé bác!"
                    
            elif metric_focused == 'humidity' and humidity > 0:
                response = f"**Độ ẩm không khí: {humidity}%**\n\n"
                if humidity > 90:
                    response += f"⚠️ Độ ẩm **{humidity}%** quá cao đó bác! Nguy cơ nấm bệnh rất lớn. Bác cần:\n"
                    response += "- Tỉa bớt lá dày đặc\n"
                    response += "- Tăng khoảng cách cây\n"
                    response += "- Phun thuốc phòng nấm\n\n"
                    response += "Độ ẩm tốt là **60-80%** đó bác!"
                elif humidity > 85:
                    response += f"Độ ẩm **{humidity}%** hơi cao đó bác. Dễ sinh nấm bệnh.\n\n"
                    response += "Bác nên tỉa bớt lá và thông thoáng vườn để giảm độ ẩm nhé!"
                elif humidity < 40:
                    response += f"Độ ẩm **{humidity}%** hơi khô đó bác. Cây có thể mất nước qua lá.\n\n"
                    response += "Bác có thể phun sương nhẹ hoặc tưới đều để tăng độ ẩm không khí!"
                else:
                    response += f"✅ Độ ẩm **{humidity}%** rất tốt đó bác! Cây đang ở điều kiện lý tưởng.\n\n"
                    response += "Tiếp tục duy trì, cây sẽ phát triển khỏe mạnh!"
        elif is_crop_recommendation:
            # Crop recommendation based on current conditions
            response = "Dựa vào điều kiện đất của bác, cháu xin tư vấn một số loại cây phù hợp:\n\n"
            
            suitable_crops = []
            reasons = []
            
            # Analyze conditions for crop recommendation
            temp_suitable = 20 <= temp <= 30
            moisture_suitable = 40 <= moisture <= 70
            ph_suitable = 6.0 <= ph <= 7.5
            npk_good = nitrogen >= 40 and phosphorus >= 30 and potassium >= 150
            
            if temp_suitable and ph_suitable:
                if npk_good:
                    suitable_crops.append("🍅 **Cà chua**")
                    reasons.append("- Nhiệt độ, pH và NPK đều lý tưởng")
                    reasons.append("- Cần tưới đều, độ ẩm 50-70%")
                    reasons.append("- Thu hoạch sau 90-120 ngày")
                    
                    suitable_crops.append("🥬 **Rau xanh (xà lách, cải)**")
                    reasons.append("- Điều kiện đất rất phù hợp")
                    reasons.append("- Sinh trưởng nhanh 30-45 ngày")
                    reasons.append("- Cần ít công chăm sóc")
                else:
                    suitable_crops.append("🥬 **Rau ăn lá (cải, xà lách)**")
                    reasons.append("- Ít cần NPK, phù hợp với đất hiện tại")
                    reasons.append("- Sinh trưởng nhanh 30-45 ngày")
                    
                if potassium >= 150:
                    suitable_crops.append("🥒 **Dưa leo, dưa chuột**")
                    reasons.append("- Kali cao giúp quả to, ngọt")
                    reasons.append("- Nhiệt độ và pH thích hợp")
                    reasons.append("- Thu hoạch sau 50-60 ngày")
            
            if ph >= 6.5 and nitrogen >= 40:
                suitable_crops.append("🌶️ **Ớt, tiêu**")
                reasons.append("- pH hơi cao phù hợp với ớt")
                reasons.append("- Nitrogen đủ cho lá xanh tốt")
                reasons.append("- Thu hoạch nhiều đợt")
            
            if temp >= 25 and moisture >= 50:
                suitable_crops.append("🫘 **Đậu các loại**")
                reasons.append("- Nhiệt ẩm cao phù hợp")
                reasons.append("- Tự bổ sung đạm cho đất")
                reasons.append("- Thu hoạch sau 60-70 ngày")
            
            if suitable_crops:
                response += f"**✅ Top {len(suitable_crops)} cây trồng phù hợp:**\n\n"
                for i, crop in enumerate(suitable_crops[:3], 1):  # Top 3
                    response += f"{i}. {crop}\n"
                
                response += f"\n**📊 Điều kiện hiện tại:**\n"
                response += f"- Nhiệt độ: **{temp}°C** {'✅' if temp_suitable else '⚠️'}\n"
                response += f"- pH: **{ph}** {'✅' if ph_suitable else '⚠️'}\n"
                response += f"- NPK: N={nitrogen}, P={phosphorus}, K={potassium} {'✅' if npk_good else '⚠️'}\n\n"
                
                response += "**💡 Lưu ý:**\n"
                response += "- Trồng vào đầu mùa mưa hoặc đầu mùa khô\n"
                response += "- Chuẩn bị đất kỹ trước khi gieo trồng\n"
                response += "- Bón phân bổ sung theo từng giai đoạn\n\n"
                response += "Bác có thể hỏi thêm về cách trồng từng loại cây nhé! 🌾"
            else:
                response += "Với điều kiện hiện tại, bác nên:\n"
                if not temp_suitable:
                    response += "- Điều chỉnh nhiệt độ (đang {temp}°C)\n"
                if not ph_suitable:
                    response += "- Điều chỉnh pH (đang {ph})\n"
                if not npk_good:
                    response += "- Bón thêm phân NPK\n"
                response += "\nSau khi điều chỉnh, bác có thể trồng nhiều loại cây hơn đó!"
                
        elif is_general_chat:
            # General chat response - natural conversation
            response = "Để cháu xem tình hình vườn nhà bác nhé!\n\n"
            
            issues = []
            good_points = []
            
            if 20 <= temp <= 30:
                good_points.append(f"✅ Nhiệt độ **{temp}°C** rất lý tưởng")
            elif temp > 0:
                issues.append(f"⚠️ Nhiệt độ **{temp}°C** cần chú ý")
            
            if 40 <= moisture <= 70:
                good_points.append(f"✅ Độ ẩm đất **{moisture}%** tốt")
            elif moisture > 0:
                issues.append(f"⚠️ Độ ẩm **{moisture}%** cần điều chỉnh")
            
            if 6.0 <= ph <= 7.5:
                good_points.append(f"✅ pH **{ph}** lý tưởng")
            elif ph > 0:
                issues.append(f"⚠️ pH **{ph}** cần điều chỉnh")
            
            if nitrogen >= 40 and phosphorus >= 30 and potassium >= 150:
                good_points.append(f"✅ NPK đầy đủ (N={nitrogen}, P={phosphorus}, K={potassium})")
            else:
                issues.append(f"⚠️ NPK cần bổ sung (N={nitrogen}, P={phosphorus}, K={potassium})")
            
            if good_points:
                response += "**Điểm tốt:**\n" + "\n".join(good_points) + "\n\n"
            
            if issues:
                response += "**Cần lưu ý:**\n" + "\n".join(issues) + "\n\n"
            
            if len(good_points) >= 3:
                response += "Nhìn chung vườn bác đang rất khỏe! Tiếp tục duy trì như vậy nhé. "
                response += "Bác có thể hỏi cháu về cây trồng phù hợp hoặc cách chăm sóc cụ thể! 🌾"
            elif len(issues) >= 2:
                response += "Vườn bác cần điều chỉnh một chút. Bác click vào từng chỉ số để cháu tư vấn chi tiết nhé!"
            else:
                response += "Vườn bác khá ổn rồi đó! Click vào từng chỉ số để xem phân tích chi tiết nhé bác! 🌾"
        
        else:
            # General analysis if no specific metric detected
            response = "Chào bác nông dân! Để cháu xem tổng quan vườn nhà mình nhé.\n\n"
            
            if temp > 0:
                status = "tốt" if 20 <= temp <= 30 else "cần chú ý"
                response += f"🌡️ Nhiệt độ đất: **{temp}°C** ({status})\n"
            
            if moisture > 0:
                status = "tốt" if 40 <= moisture <= 70 else "cần điều chỉnh"
                response += f"💧 Độ ẩm đất: **{moisture}%** ({status})\n"
            
            if ph > 0:
                status = "lý tưởng" if 6.0 <= ph <= 7.5 else "cần điều chỉnh"
                response += f"⚗️ pH: **{ph}** ({status})\n"
            
            response += f"🌱 NPK: N={nitrogen}, P={phosphorus}, K={potassium}\n\n"
            response += "Bác có thể:\n"
            response += "- Click vào từng chỉ số để xem phân tích chi tiết\n"
            response += "- Hỏi cháu về cây trồng phù hợp\n"
            response += "- Hỏi cháu về cách chăm sóc cụ thể 🌾"
        
        return jsonify({"response": response}), 200
        
    except Exception as e:
        logger.error(f"❌ AI chat error: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500


@flask_app.route("/api/ai/analyze", methods=["POST"])
def flask_ai_analyze():
    """
    Flask wrapper for AI analysis - analyze single data point or aggregated data
    """
    try:
        data = request.get_json(silent=True) or {}
        
        # Validate required fields
        required = ['soil_temperature', 'soil_moisture', 'conductivity', 'ph', 
                   'nitrogen', 'phosphorus', 'potassium', 'salt',
                   'air_temperature', 'air_humidity', 'is_raining']
        
        missing = [f for f in required if f not in data]
        if missing:
            return jsonify({"detail": f"Missing fields: {', '.join(missing)}"}), 400
        
        # ✅ CALL ML MODELS DIRECTLY using analyze_soil() function
        from ai_service.schemas import SoilDataInput
        
        # Create input object
        soil_input = SoilDataInput(
            soil_temperature=float(data['soil_temperature']),
            soil_moisture=float(data['soil_moisture']),
            ph=float(data['ph']),
            conductivity=int(data['conductivity']),
            nitrogen=int(data['nitrogen']),
            phosphorus=int(data['phosphorus']),
            potassium=int(data['potassium']),
            salt=int(data['salt']),
            air_temperature=float(data['air_temperature']),
            air_humidity=float(data['air_humidity']),
            is_raining=bool(data['is_raining']),
            mode=data.get('mode', 'discovery'),
            selected_crop=data.get('selected_crop')
        )
        
        # Load models if not loaded
        models = get_model_registry()
        if not models.validate_loaded():
            logger.info("🔄 Loading ML models...")
            models.load_all()
        
        # Call ML inference
        result = analyze_soil(soil_input, models)
        
        # Convert to dict for JSON response
        return jsonify(result.dict()), 200
        
    except Exception as e:
        logger.error(f"❌ AI analyze error: {e}", exc_info=True)
        return jsonify({"detail": str(e)}), 500


@flask_app.route("/api/ai/analyze-daily", methods=["POST"])
def flask_analyze_daily():
    """
    Flask wrapper for AI daily analysis - simplified version calling /api/analyze-date
    """
    try:
        data = request.get_json(silent=True) or {}
        date_str = data.get("date")
        
        if not date_str:
            return jsonify({"detail": "date is required (YYYY-MM-DD)"}), 400
        
        # Call the existing /api/analyze-date endpoint internally
        # This returns the same data structure
        return analyze_date()
        
    except Exception as e:
        logger.error(f"❌ Daily aggregation error: {e}", exc_info=True)
        return jsonify({"detail": str(e)}), 500


@flask_app.route("/api/analyze-date", methods=["POST"])
def analyze_date():
    """
    Analyze soil data for a specific date - aggregates daily readings and calls AI
    
    Request: {"date": "2025-10-27"}
    Response: {
        "status": "success",
        "date": "2025-10-27",
        "sample_count": 48,
        "aggregated_data": {...},
        "ai_analysis": {...}
    }
    """
    try:
        data = request.get_json(silent=True) or {}
        date_str = data.get("date")
        
        if not date_str:
            return jsonify({"status": "error", "message": "date is required (YYYY-MM-DD)"}), 400
        
        # Validate date format
        try:
            datetime.strptime(date_str, "%Y-%m-%d")
        except ValueError:
            return jsonify({"status": "error", "message": "Invalid date format. Use YYYY-MM-DD"}), 400
        
        # Query DB: HYBRID aggregation (AVG + MEDIAN + MAJORITY)
        with get_db_conn() as conn:
            with conn.cursor() as cur:
                query = """
                SELECT
                    COUNT(*) as sample_count,
                    MIN(measured_at_vn) as first_reading,
                    MAX(measured_at_vn) as last_reading,
                    
                    AVG(soil_temperature_c) as soil_temperature,
                    AVG(soil_moisture_pct) as soil_moisture,
                    AVG(ph_value) as ph,
                    AVG(nitrogen_mg_kg) as nitrogen,
                    AVG(phosphorus_mg_kg) as phosphorus,
                    AVG(potassium_mg_kg) as potassium,
                    AVG(air_temperature_c) as air_temperature,
                    AVG(air_humidity_pct) as air_humidity,
                    
                    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY conductivity_us_cm) as conductivity,
                    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY salt_mg_l) as salt,
                    
                    (SUM(CASE WHEN is_raining THEN 1 ELSE 0 END)::float / COUNT(*)) > 0.5 as is_raining,
                    
                    MIN(soil_temperature_c) as min_soil_temp,
                    MAX(soil_temperature_c) as max_soil_temp,
                    MIN(soil_moisture_pct) as min_moisture,
                    MAX(soil_moisture_pct) as max_moisture,
                    STDDEV(soil_moisture_pct) as moisture_variance
                    
                FROM sensor_readings
                WHERE DATE(measured_at_vn AT TIME ZONE 'Asia/Ho_Chi_Minh') = %s
                """
                
                cur.execute(query, (date_str,))
                result = cur.fetchone()
                
                if not result or result[0] == 0:
                    return jsonify({
                        "status": "error",
                        "message": f"No sensor data found for date {date_str}"
                    }), 404
                
                # Prepare aggregated data
                aggregated_data = {
                    "sample_count": int(result[0]),
                    "time_range": {
                        "first": result[1].strftime('%Y-%m-%d %H:%M:%S') if result[1] else None,
                        "last": result[2].strftime('%Y-%m-%d %H:%M:%S') if result[2] else None
                    },
                    "averages": {
                        "soil_temperature": float(result[3]) if result[3] is not None else 0,
                        "soil_moisture": float(result[4]) if result[4] is not None else 0,
                        "ph": float(result[5]) if result[5] is not None else 0,
                        "nitrogen": float(result[6]) if result[6] is not None else 0,
                        "phosphorus": float(result[7]) if result[7] is not None else 0,
                        "potassium": float(result[8]) if result[8] is not None else 0,
                        "air_temperature": float(result[9]) if result[9] is not None else 0,
                        "air_humidity": float(result[10]) if result[10] is not None else 0,
                        "conductivity": float(result[11]) if result[11] is not None else 0,
                        "salt": float(result[12]) if result[12] is not None else 0,
                        "is_raining": bool(result[13])
                    },
                    "ranges": {
                        "soil_temp_min": float(result[14]) if result[14] is not None else 0,
                        "soil_temp_max": float(result[15]) if result[15] is not None else 0,
                        "moisture_min": float(result[16]) if result[16] is not None else 0,
                        "moisture_max": float(result[17]) if result[17] is not None else 0,
                        "moisture_variance": float(result[18]) if result[18] is not None else 0
                    }
                }
        
        # Call Flask AI analysis endpoint (WITH ML MODELS)
        ai_service_url = "http://localhost:8080/api/ai/analyze"
        
        ai_payload = {
            "soil_temperature": aggregated_data['averages']['soil_temperature'],
            "soil_moisture": aggregated_data['averages']['soil_moisture'],
            "conductivity": int(aggregated_data['averages']['conductivity']),
            "ph": aggregated_data['averages']['ph'],
            "nitrogen": int(aggregated_data['averages']['nitrogen']),
            "phosphorus": int(aggregated_data['averages']['phosphorus']),
            "potassium": int(aggregated_data['averages']['potassium']),
            "salt": int(aggregated_data['averages']['salt']),
            "air_temperature": aggregated_data['averages']['air_temperature'],
            "air_humidity": aggregated_data['averages']['air_humidity'],
            "is_raining": aggregated_data['averages']['is_raining'],
            "mode": "discovery"
        }
        
        ai_result = None
        try:
            import urllib.request
            import json as json_lib
            
            req = urllib.request.Request(
                ai_service_url,
                data=json_lib.dumps(ai_payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            
            with urllib.request.urlopen(req, timeout=15) as resp:
                ai_result = json_lib.loads(resp.read().decode("utf-8"))
                
        except Exception as e:
            # AI service error - still return data but mark AI as failed
            ai_result = {
                "error": str(e),
                "status": "AI service unavailable"
            }
        
        # 💾 SAVE TO daily_insights TABLE (simplified version for Flask)
        record_id = None
        try:
            if ai_result and isinstance(ai_result, dict):
                logger.info(f"💾 Saving daily insight to database...")
                
                with get_db_conn() as conn:
                    with conn.cursor() as cur:
                        # Simplified INSERT (only basic fields, no ML predictions)
                        insert_query = """
                        INSERT INTO daily_insights (
                            date_vn, total_readings,
                            soil_temperature_avg, soil_moisture_avg, conductivity_avg, ph_avg,
                            nitrogen_avg, phosphorus_avg, potassium_avg, salt_avg,
                            air_temperature_avg, air_humidity_avg, is_raining_majority,
                            recommended_crop, crop_confidence, 
                            soil_health_score, soil_health_rating,
                            has_anomaly, anomaly_score,
                            summary_status, summary_text,
                            ai_analysis_json, recommendations_json
                        )
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        RETURNING id
                        """
                        
                        # Extract values from dict-based ai_result
                        crop_rec = ai_result.get('crop_recommendation', {})
                        soil_health = ai_result.get('soil_health', {})
                        anomaly = ai_result.get('anomaly_detection', {})
                        
                        recommended_crop = crop_rec.get('best_crop', 'Unknown')
                        crop_confidence = crop_rec.get('confidence', 0)
                        soil_score = soil_health.get('score', 0)
                        soil_rating = soil_health.get('rating', 'Unknown')
                        has_anomaly = anomaly.get('is_anomaly', False)
                        anomaly_score = anomaly.get('score', 0)
                        
                        # Determine summary status
                        if has_anomaly:
                            summary_status = "ALERT"
                        elif soil_score >= 80:
                            summary_status = "EXCELLENT"
                        elif soil_score >= 60:
                            summary_status = "GOOD"
                        else:
                            summary_status = "NEEDS_ATTENTION"
                        
                        summary_text = f"Soil Health: {soil_rating} ({soil_score:.1f}/100). Recommended crop: {recommended_crop}. {'ANOMALY DETECTED!' if has_anomaly else 'Normal conditions.'}"
                        
                        # Generate recommendations JSON
                        recommendations = []
                        if has_anomaly:
                            recommendations.append({
                                "priority": "HIGH",
                                "message": f"⚠️ Phát hiện bất thường trong dữ liệu đất (score: {anomaly_score:.1f}). Kiểm tra ngay!"
                            })
                        
                        if soil_score < 50:
                            recommendations.append({
                                "priority": "HIGH",
                                "message": f"🌱 Chất lượng đất kém ({soil_rating}). Cần cải tạo đất và bón phân."
                            })
                        elif soil_score < 70:
                            recommendations.append({
                                "priority": "MEDIUM",
                                "message": f"🌿 Chất lượng đất trung bình. Bón phân bổ sung NPK định kỳ."
                            })
                        else:
                            recommendations.append({
                                "priority": "LOW",
                                "message": f"✅ Chất lượng đất tốt! Duy trì chế độ chăm sóc hiện tại."
                            })
                        
                        if recommended_crop != 'Unknown':
                            recommendations.append({
                                "priority": "INFO",
                                "message": f"🌾 Gợi ý cây trồng phù hợp: {recommended_crop} (độ tin cậy: {crop_confidence}%)"
                            })
                        
                        import json
                        recommendations_json = json.dumps(recommendations, ensure_ascii=False)
                        
                        cur.execute(insert_query, (
                            date_str,
                            aggregated_data['sample_count'],
                            aggregated_data['averages']['soil_temperature'],
                            aggregated_data['averages']['soil_moisture'],
                            aggregated_data['averages']['conductivity'],
                            aggregated_data['averages']['ph'],
                            aggregated_data['averages']['nitrogen'],
                            aggregated_data['averages']['phosphorus'],
                            aggregated_data['averages']['potassium'],
                            aggregated_data['averages']['salt'],
                            aggregated_data['averages']['air_temperature'],
                            aggregated_data['averages']['air_humidity'],
                            aggregated_data['averages']['is_raining'],
                            recommended_crop,
                            crop_confidence,
                            soil_score,
                            soil_rating,
                            has_anomaly,
                            anomaly_score,
                            summary_status,
                            summary_text,
                            json.dumps(ai_result, ensure_ascii=False),
                            recommendations_json
                        ))
                        
                        result = cur.fetchone()
                        record_id = result[0] if result else None
                        conn.commit()
                        
                logger.info(f"✅ Saved to daily_insights (ID: {record_id})")
        except Exception as save_error:
            logger.error(f"⚠️ Failed to save daily insight: {save_error}", exc_info=True)
            # Continue even if save fails
        
        return jsonify({
            "status": "success",
            "date": date_str,
            "aggregated_data": aggregated_data,
            "ai_analysis": ai_result,
            "saved_to_db": record_id is not None,
            "record_id": record_id
        }), 200
        
    except Exception as e:
        print(f"❌ Analyze-date error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


@flask_app.route("/api/ai/analyze-display-only", methods=["POST"])
def analyze_display_only():
    """
    Nút "Analyze Daily": CHỈ HIỂN THỊ, KHÔNG LƯU DB
    
    Request: {"date": "2025-10-27"}
    Response: same as /api/analyze-date but without saving
    """
    try:
        data = request.get_json(silent=True) or {}
        date_str = data.get("date")
        
        if not date_str:
            return jsonify({"status": "error", "message": "date is required (YYYY-MM-DD)"}), 400
        
        # Query + aggregate data (same as /api/analyze-date)
        with get_db_conn() as conn:
            with conn.cursor() as cur:
                query = """
                SELECT
                    COUNT(*) as sample_count,
                    MIN(measured_at_vn) as first_reading,
                    MAX(measured_at_vn) as last_reading,
                    AVG(soil_temperature_c) as soil_temperature,
                    AVG(soil_moisture_pct) as soil_moisture,
                    AVG(ph_value) as ph,
                    AVG(nitrogen_mg_kg) as nitrogen,
                    AVG(phosphorus_mg_kg) as phosphorus,
                    AVG(potassium_mg_kg) as potassium,
                    AVG(air_temperature_c) as air_temperature,
                    AVG(air_humidity_pct) as air_humidity,
                    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY conductivity_us_cm) as conductivity,
                    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY salt_mg_l) as salt,
                    (SUM(CASE WHEN is_raining THEN 1 ELSE 0 END)::float / COUNT(*)) > 0.5 as is_raining
                FROM sensor_readings
                WHERE DATE(measured_at_vn AT TIME ZONE 'Asia/Ho_Chi_Minh') = %s
                """
                
                cur.execute(query, (date_str,))
                result = cur.fetchone()
                
                if not result or result[0] == 0:
                    return jsonify({
                        "status": "error",
                        "message": f"No sensor data found for date {date_str}"
                    }), 404
                
                aggregated_data = {
                    "sample_count": int(result[0]),
                    "time_range": {
                        "first": result[1].strftime('%Y-%m-%d %H:%M:%S') if result[1] else None,
                        "last": result[2].strftime('%Y-%m-%d %H:%M:%S') if result[2] else None
                    },
                    "averages": {
                        "soil_temperature": float(result[3]) if result[3] is not None else 0,
                        "soil_moisture": float(result[4]) if result[4] is not None else 0,
                        "ph": float(result[5]) if result[5] is not None else 0,
                        "nitrogen": float(result[6]) if result[6] is not None else 0,
                        "phosphorus": float(result[7]) if result[7] is not None else 0,
                        "potassium": float(result[8]) if result[8] is not None else 0,
                        "air_temperature": float(result[9]) if result[9] is not None else 0,
                        "air_humidity": float(result[10]) if result[10] is not None else 0,
                        "conductivity": float(result[11]) if result[11] is not None else 0,
                        "salt": float(result[12]) if result[12] is not None else 0,
                        "is_raining": bool(result[13])
                    }
                }
        
        # Call Flask AI analysis endpoint (WITH ML MODELS)
        ai_service_url = "http://localhost:8080/api/ai/analyze"
        ai_payload = {
            "soil_temperature": aggregated_data['averages']['soil_temperature'],
            "soil_moisture": aggregated_data['averages']['soil_moisture'],
            "conductivity": int(aggregated_data['averages']['conductivity']),
            "ph": aggregated_data['averages']['ph'],
            "nitrogen": int(aggregated_data['averages']['nitrogen']),
            "phosphorus": int(aggregated_data['averages']['phosphorus']),
            "potassium": int(aggregated_data['averages']['potassium']),
            "salt": int(aggregated_data['averages']['salt']),
            "air_temperature": aggregated_data['averages']['air_temperature'],
            "air_humidity": aggregated_data['averages']['air_humidity'],
            "is_raining": aggregated_data['averages']['is_raining'],
            "mode": "discovery"
        }
        
        ai_result = None
        try:
            import urllib.request
            import json as json_lib
            
            req = urllib.request.Request(
                ai_service_url,
                data=json_lib.dumps(ai_payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            
            with urllib.request.urlopen(req, timeout=15) as resp:
                ai_result = json_lib.loads(resp.read().decode("utf-8"))
                
        except Exception as e:
            ai_result = {"error": str(e), "status": "AI service unavailable"}
        
        # ✅ KHÔNG LƯU DB - CHỈ HIỂN THỊ
        logger.info(f"📊 Display-only analysis for {date_str} (not saved)")
        
        return jsonify({
            "status": "success",
            "date": date_str,
            "aggregated_data": aggregated_data,
            "ai_analysis": ai_result,
            "saved_to_db": False,
            "display_only": True
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Display-only analysis error: {e}", exc_info=True)
        return jsonify({"status": "error", "message": str(e)}), 500


@flask_app.route("/api/ai/analyze-and-save", methods=["POST"])
def analyze_and_save():
    """
    Nút "Analyze": PHÂN TÍCH MẪU MỚI NHẤT + LƯU VÀO ai_analysis + PUSH BLOCKCHAIN
    
    Request: {} (no params needed - always uses latest sample)
    Response: analysis result + DB record ID + blockchain TX
    """
    try:
        # Get LATEST sensor reading (not aggregated, just the newest sample)
        with get_db_conn() as conn:
            with conn.cursor() as cur:
                query = """
                SELECT
                    id,
                    measured_at_vn,
                    soil_temperature_c,
                    soil_moisture_pct,
                    ph_value,
                    nitrogen_mg_kg,
                    phosphorus_mg_kg,
                    potassium_mg_kg,
                    air_temperature_c,
                    air_humidity_pct,
                    conductivity_us_cm,
                    salt_mg_l,
                    is_raining
                FROM sensor_readings
                ORDER BY created_at_vn DESC
                LIMIT 1
                """
                
                cur.execute(query)
                result = cur.fetchone()
                
                if not result:
                    return jsonify({
                        "status": "error",
                        "message": "No sensor data available"
                    }), 404
                
                sensor_reading_id = result[0]
                measured_at = result[1]
                
                latest_data = {
                    "sample_count": 1,
                    "measured_at": measured_at.strftime('%Y-%m-%d %H:%M:%S') if measured_at else None,
                    "soil_temperature": float(result[2]) if result[2] is not None else 0,
                    "soil_moisture": float(result[3]) if result[3] is not None else 0,
                    "ph": float(result[4]) if result[4] is not None else 0,
                    "nitrogen": float(result[5]) if result[5] is not None else 0,
                    "phosphorus": float(result[6]) if result[6] is not None else 0,
                    "potassium": float(result[7]) if result[7] is not None else 0,
                    "air_temperature": float(result[8]) if result[8] is not None else 0,
                    "air_humidity": float(result[9]) if result[9] is not None else 0,
                    "conductivity": float(result[10]) if result[10] is not None else 0,
                    "salt": float(result[11]) if result[11] is not None else 0,
                    "is_raining": bool(result[12])
                }
        
        # Call Flask AI analysis endpoint (WITH ML MODELS)
        ai_service_url = "http://localhost:8080/api/ai/analyze"
        ai_payload = {
            "soil_temperature": latest_data['soil_temperature'],
            "soil_moisture": latest_data['soil_moisture'],
            "conductivity": int(latest_data['conductivity']),
            "ph": latest_data['ph'],
            "nitrogen": int(latest_data['nitrogen']),
            "phosphorus": int(latest_data['phosphorus']),
            "potassium": int(latest_data['potassium']),
            "salt": int(latest_data['salt']),
            "air_temperature": latest_data['air_temperature'],
            "air_humidity": latest_data['air_humidity'],
            "is_raining": latest_data['is_raining'],
            "mode": "discovery"
        }
        
        ai_result = None
        try:
            import urllib.request
            import json as json_lib
            
            req = urllib.request.Request(
                ai_service_url,
                data=json_lib.dumps(ai_payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            
            with urllib.request.urlopen(req, timeout=15) as resp:
                ai_result = json_lib.loads(resp.read().decode("utf-8"))
                
        except Exception as e:
            ai_result = {"error": str(e), "status": "AI service unavailable"}
        
        # 💾 SAVE TO ai_analysis TABLE
        record_id = None
        blockchain_tx = None
        try:
            if ai_result and isinstance(ai_result, dict):
                logger.info(f"💾 Saving AI analysis to ai_analysis table...")
                
                with get_db_conn() as conn:
                    with conn.cursor() as cur:
                        insert_query = """
                        INSERT INTO ai_analysis (
                            sensor_reading_id,
                            analysis_type,
                            analysis_mode,
                            analyzed_at_vn,
                            crop_recommendation,
                            soil_health,
                            anomaly_detection,
                            model_version,
                            confidence_avg,
                            onchain_status
                        )
                        VALUES (%s, %s, %s, NOW(), %s, %s, %s, %s, %s, %s)
                        RETURNING id
                        """
                        
                        crop_rec = ai_result.get('crop_recommendation', {})
                        soil_health_data = ai_result.get('soil_health', {})
                        anomaly = ai_result.get('anomaly_detection', {})
                        
                        import json as json_module
                        
                        cur.execute(insert_query, (
                            sensor_reading_id,                          # sensor_reading_id (LINK TO LATEST SAMPLE)
                            'realtime',                                 # analysis_type (changed from 'daily')
                            'discovery',                                # analysis_mode
                            json_module.dumps(crop_rec),               # crop_recommendation
                            json_module.dumps(soil_health_data),       # soil_health
                            json_module.dumps(anomaly),                # anomaly_detection
                            'v1.0',                                    # model_version
                            crop_rec.get('confidence', 0),             # confidence_avg
                            'pending'                                   # onchain_status
                        ))
                        
                        result = cur.fetchone()
                        record_id = result[0] if result else None
                        conn.commit()
                        
                logger.info(f"✅ Saved to ai_analysis (ID: {record_id})")
                
                # 🔗 PUSH TO BLOCKCHAIN
                try:
                    logger.info(f"⛓️  Pushing to blockchain...")
                    # TODO: Call blockchain service
                    blockchain_tx = "0x" + "0" * 64  # Placeholder
                    logger.info(f"✅ Blockchain TX: {blockchain_tx}")
                except Exception as bc_error:
                    logger.error(f"⚠️ Blockchain push failed: {bc_error}")
                    blockchain_tx = None
                
        except Exception as save_error:
            logger.error(f"⚠️ Failed to save AI analysis: {save_error}", exc_info=True)
        
        return jsonify({
            "status": "success",
            "data_type": "latest_sample",
            "measured_at": latest_data['measured_at'],
            "sensor_reading_id": sensor_reading_id,
            "data": latest_data,
            "ai_analysis": ai_result,
            "saved_to_db": record_id is not None,
            "record_id": record_id,
            "blockchain_tx": blockchain_tx
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Analyze-and-save error: {e}", exc_info=True)
        return jsonify({"status": "error", "message": str(e)}), 500


# ============================================================
# FASTAPI APP (AI Service)
# ============================================================

fastapi_app = FastAPI(
    title="Pione AI Service (Embedded)",
    description="AI Analysis Service for Soil Data",
    version="1.0.0"
)

fastapi_app.add_middleware(
    FastAPICORS,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

START_TIME = time.time()

@fastapi_app.get("/ai/", tags=["Root"])
async def ai_root():
    return {
        "service": "Pione AI Service (Embedded)",
        "version": "1.0.0",
        "status": "running"
    }


@fastapi_app.get("/ai/health", response_model=HealthCheckResponse, tags=["Health"])
async def ai_health_check():
    models = get_model_registry()
    
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


@fastapi_app.post("/analyze", response_model=AIAnalysisResponse, tags=["Analysis"])
async def analyze_soil_data(data: SoilDataInput):
    try:
        models = get_model_registry()
        
        if not models.validate_loaded():
            try:
                logger.info("🔄 Lazy loading models (first request)...")
                models.load_all()
                logger.info("✅ Models loaded successfully!")
            except Exception as e:
                logger.error(f"❌ Failed to load models: {e}")
                raise HTTPException(status_code=503, detail=f"Models not loaded: {str(e)}")
        
        if data.mode == "validation":
            if not data.selected_crop:
                raise HTTPException(status_code=400, detail="selected_crop is required for validation mode")
            
            available_crops = models.get_crop_names()
            if data.selected_crop not in available_crops:
                raise HTTPException(status_code=400, detail=f"Invalid crop '{data.selected_crop}'. Available: {available_crops}")
        
        logger.info(f"\n📨 Received analysis request (mode: {data.mode})")
        result = analyze_soil(data, models)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Analysis error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@fastapi_app.post("/analyze-daily", response_model=DailyAnalysisResponse, tags=["Daily Aggregation"])
async def analyze_daily(request: DailyAggregateInput):
    try:
        models = get_model_registry()
        
        if not models.validate_loaded():
            try:
                logger.info("🔄 Lazy loading models (first request)...")
                models.load_all()
                logger.info("✅ Models loaded successfully!")
            except Exception as e:
                logger.error(f"❌ Failed to load models: {e}")
                raise HTTPException(status_code=503, detail=f"Models not loaded: {str(e)}")
        
        logger.info(f"\n📅 Daily aggregation request for date: {request.date}")
        
        aggregated_data = aggregate_daily_data(request.date)
        
        if not aggregated_data:
            raise HTTPException(status_code=404, detail=f"No sensor data found for date {request.date}")
        
        logger.info(f"   ✅ Aggregated {aggregated_data['sample_count']} samples")
        
        ai_result = analyze_aggregated_data(aggregated_data['features'], models)
        
        record_id = save_daily_insight(request.date, aggregated_data, ai_result)
        
        logger.info(f"   ✅ Saved to daily_insights (ID: {record_id})")
        
        blockchain_success, tx_hash, blockchain_status = push_to_blockchain(
            daily_insight_id=record_id,
            date=request.date,
            ai_result=ai_result,
            sample_count=aggregated_data['sample_count']
        )
        
        if blockchain_success:
            logger.info(f"   ✅ Pushed to blockchain successfully (TX: {tx_hash})")
        else:
            logger.warning(f"   ⚠️ Blockchain push failed (status: {blockchain_status})")
        
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


# ============================================================
# USE FLASK AS MAIN APP (FastAPI mounting disabled - using Flask wrappers instead)
# ============================================================

from werkzeug.serving import run_simple

# Use Flask app directly - no FastAPI mounting
# All AI logic called via internal inference functions
application = flask_app


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":
    PORT = int(os.getenv("BACKEND_PORT", "8080"))
    HOST = os.getenv("BACKEND_HOST", "0.0.0.0")
    
    logger.info('\n╔════════════════════════════════════════════════════════════╗')
    logger.info('║                                                            ║')
    logger.info('║        🤖 UNIFIED BACKEND - Flask + FastAPI 🤖             ║')
    logger.info('║                                                            ║')
    logger.info('╚════════════════════════════════════════════════════════════╝')
    logger.info(f'\n✅ Backend running on: http://{HOST}:{PORT}')
    logger.info(f'\n📍 Endpoints:')
    logger.info(f'   📥 Data Ingest:       http://localhost:{PORT}/api/data')
    logger.info(f'   📊 Latest:            http://localhost:{PORT}/api/latest')
    logger.info(f'   📜 History:           http://localhost:{PORT}/api/history')
    logger.info(f'   👤 Auth:              http://localhost:{PORT}/api/auth/*')
    logger.info(f'   📈 Dashboard:         http://localhost:{PORT}/api/dashboard/*')
    logger.info(f'   💬 AI Chat:           http://localhost:{PORT}/api/ai/chat')
    logger.info(f'   🤖 AI Analyze:        http://localhost:{PORT}/api/ai/analyze')
    logger.info(f'   📅 AI Daily:          http://localhost:{PORT}/api/ai/analyze-daily')
    logger.info(f'   ❤️  Health:            http://localhost:{PORT}/api/health')
    logger.info('\n')
    
    # Run with Werkzeug (development) or use Gunicorn (production)
    run_simple(HOST, PORT, application, use_reloader=False, use_debugger=False, threaded=True)

