from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv

# Load .env file
load_dotenv()


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
    # Ưu tiên created_at dạng 'YYYY-MM-DD HH:MM:SS'
    created_at = payload.get("created_at")
    if isinstance(created_at, str) and len(created_at) >= 19:
        return created_at[:19]

    ts = payload.get("timestamp")
    if ts is None:
        # fallback: now VN
        vn = datetime.now(timezone.utc) + timedelta(hours=7)
        return vn.strftime("%Y-%m-%d %H:%M:%S")

    if isinstance(ts, (int, float)):
        dt_utc = datetime.fromtimestamp(ts, tz=timezone.utc)
        vn = dt_utc + timedelta(hours=7)
        return vn.strftime("%Y-%m-%d %H:%M:%S")

    if isinstance(ts, str):
        # Thử parse RFC1123/GMT của ESP: 'Sun, 05 Oct 2025 01:34:01 GMT'
        try:
            dt = datetime.strptime(ts, "%a, %d %b %Y %H:%M:%S GMT").replace(tzinfo=timezone.utc)
            vn = dt + timedelta(hours=7)
            return vn.strftime("%Y-%m-%d %H:%M:%S")
        except Exception:
            pass
        # Nếu ts đã là 'YYYY-MM-DD HH:MM:SS' thì giữ nguyên
        if len(ts) >= 19 and ts[4] == '-' and ts[7] == '-' and ts[13] == ':' and ts[16] == ':':
            return ts[:19]

    return None


app = Flask(__name__)
CORS(app)


@app.route("/api/data", methods=["POST"])
def receive_data():
    try:
        data = request.get_json(silent=True) or {}
        
        # SOIL PARAMETERS (8 thông số)
        # Lưu ý: IoT field "temperature" = Soil Temperature
        #        IoT field "humidity" = Soil Moisture/Humidity
        soil_temperature = data.get("temperature")
        soil_moisture = data.get("humidity")
        conductivity = data.get("conductivity")
        ph = data.get("ph")
        nitrogen = data.get("nitrogen")
        phosphorus = data.get("phosphorus")
        potassium = data.get("potassium")
        salt = data.get("salt")
        
        # AIR/WEATHER PARAMETERS (3 thông số)
        air_temperature = data.get("air_temperature")
        air_humidity = data.get("air_humidity")
        is_raining = data.get("is_raining")
        
        # Validate required fields (tất cả 11 thông số)
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
        
        # Convert boolean (is_raining có thể là bool hoặc string "true"/"false")
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

        # Tùy chọn: callback Node bridge
        bridge_url = os.getenv("NODE_BRIDGE_URL")  # vd: http://localhost:3000/bridgePending
        bridge_result = None
        if bridge_url:
            try:
                import urllib.request
                import json
                req = urllib.request.Request(
                    bridge_url,
                    data=json.dumps({"limit": 1}).encode("utf-8"),
                    headers={"Content-Type": "application/json"},
                    method="POST",
                )
                with urllib.request.urlopen(req, timeout=30) as resp:
                    bridge_result = {"status": resp.status}
            except Exception as e:
                bridge_result = {"error": str(e)}

        return jsonify({
            "status": "success",
            "measured_at_vn": measured_at_vn,
            "bridge": bridge_result,
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/latest", methods=["GET"])
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


@app.route("/api/history", methods=["GET"])
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


@app.route("/api/analyze-date", methods=["POST"])
def analyze_date():
    """
    Analyze soil data for a specific date
    
    Request: {"date": "2025-10-27"}
    
    Response: {
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
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                query = """
                SELECT
                    COUNT(*) as sample_count,
                    MIN(measured_at_vn) as first_reading,
                    MAX(measured_at_vn) as last_reading,
                    
                    -- AVERAGE for most params
                    AVG(soil_temperature_c) as soil_temperature,
                    AVG(soil_moisture_pct) as soil_moisture,
                    AVG(ph_value) as ph,
                    AVG(nitrogen_mg_kg) as nitrogen,
                    AVG(phosphorus_mg_kg) as phosphorus,
                    AVG(potassium_mg_kg) as potassium,
                    AVG(air_temperature_c) as air_temperature,
                    AVG(air_humidity_pct) as air_humidity,
                    
                    -- MEDIAN for sensor-prone params
                    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY conductivity_us_cm) as conductivity,
                    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY salt_mg_l) as salt,
                    
                    -- MAJORITY VOTE for boolean
                    (SUM(CASE WHEN is_raining THEN 1 ELSE 0 END)::float / COUNT(*)) > 0.5 as is_raining,
                    
                    -- MIN/MAX for context
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
                
                if not result or result['sample_count'] == 0:
                    return jsonify({
                        "status": "error",
                        "message": f"No sensor data found for date {date_str}"
                    }), 404
                
                # Prepare aggregated data
                aggregated_data = {
                    "sample_count": result['sample_count'],
                    "time_range": {
                        "first": str(result['first_reading']),
                        "last": str(result['last_reading'])
                    },
                    "averages": {
                        "soil_temperature": float(result['soil_temperature']),
                        "soil_moisture": float(result['soil_moisture']),
                        "conductivity": float(result['conductivity']),
                        "ph": float(result['ph']),
                        "nitrogen": float(result['nitrogen']),
                        "phosphorus": float(result['phosphorus']),
                        "potassium": float(result['potassium']),
                        "salt": float(result['salt']),
                        "air_temperature": float(result['air_temperature']),
                        "air_humidity": float(result['air_humidity']),
                        "is_raining": bool(result['is_raining'])
                    },
                    "ranges": {
                        "soil_temp_min": float(result['min_soil_temp']),
                        "soil_temp_max": float(result['max_soil_temp']),
                        "moisture_min": float(result['min_moisture']),
                        "moisture_max": float(result['max_moisture']),
                        "moisture_variance": float(result['moisture_variance']) if result['moisture_variance'] else 0
                    }
                }
        
        # Call AI Service
        ai_service_url = os.getenv("AI_SERVICE_URL", "http://localhost:8000/api/ai/analyze")
        
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
            
            with urllib.request.urlopen(req, timeout=10) as resp:
                ai_result = json_lib.loads(resp.read().decode("utf-8"))
                
        except Exception as e:
            # AI service error - still return data but mark AI as failed
            ai_result = {
                "error": str(e),
                "status": "AI service unavailable"
            }
        
        return jsonify({
            "status": "success",
            "date": date_str,
            "aggregated_data": aggregated_data,
            "ai_analysis": ai_result
        }), 200
        
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=True)


