"""
Dashboard Routes - API endpoints for realtime dashboard
Provides overview stats, realtime IoT data, and AI history
"""

from flask import Blueprint, jsonify, request
import psycopg2
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv('.env')

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

# Database connection helper
def get_db_connection():
    return psycopg2.connect(
        host=os.getenv('PGHOST'),
        port=os.getenv('PGPORT'),
        database=os.getenv('PGDATABASE'),
        user=os.getenv('PGUSER'),
        password=os.getenv('PGPASSWORD')
    )


@dashboard_bp.route('/overview', methods=['GET'])
def get_overview():
    """
    GET /api/dashboard/overview
    
    Returns overview statistics for last 30 days:
    - Average soil health score
    - Total IoT records
    - Verified daily insights count
    - Anomalies detected
    
    Returns:
    {
      "stats": {
        "avg_soil_health": 78.5,
        "total_iot_records": 12450,
        "verified_daily_insights": 28,
        "total_daily_insights": 30,
        "anomalies_detected": 2,
        "last_updated": "2025-10-29T16:30:00Z"
      },
      "period": "last_30_days"
    }
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Query 1: Daily insights stats
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
        
        # Query 2: Total IoT records
        cur.execute("""
            SELECT COUNT(*) as total_iot
            FROM sensor_readings
            WHERE measured_at_vn >= NOW() - INTERVAL '30 days'
        """)
        
        iot_row = cur.fetchone()
        
        cur.close()
        conn.close()
        
        # Build response
        stats = {
            "avg_soil_health": round(float(insights_row[0] or 0), 1),
            "total_iot_records": int(iot_row[0] or 0),
            "verified_daily_insights": int(insights_row[2] or 0),
            "total_daily_insights": int(insights_row[1] or 0),
            "anomalies_detected": int(insights_row[3] or 0),
            "last_updated": datetime.utcnow().isoformat() + 'Z'
        }
        
        return jsonify({
            "success": True,
            "stats": stats,
            "period": "last_30_days"
        }), 200
        
    except Exception as e:
        print(f"❌ Overview error: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@dashboard_bp.route('/realtime-iot', methods=['GET'])
def get_realtime_iot():
    """
    GET /api/dashboard/realtime-iot?hours=24
    
    Returns latest IoT sensor reading + 24h trend
    
    Query params:
    - hours: Number of hours to look back (default: 24)
    
    Returns:
    {
      "latest": {
        "measured_at": "2025-10-29 16:30:00",
        "soil_temperature_c": 24.5,
        "soil_moisture_pct": 45.2,
        "ph_value": 6.8,
        "nitrogen_mg_kg": 45,
        "phosphorus_mg_kg": 30,
        "potassium_mg_kg": 180,
        "salt_mg_l": 850,
        "air_temperature_c": 27.1,
        "air_humidity_pct": 65,
        "is_raining": true,
        "onchain_status": "confirmed"
      },
      "trend_24h": [
        {"time": "2025-10-29 00:00", "temp": 22.1, "moisture": 43.5, "ph": 6.7},
        ...
      ]
    }
    """
    try:
        hours = int(request.args.get('hours', 24))
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Query 1: Latest sensor reading
        cur.execute("""
            SELECT 
                measured_at_vn,
                soil_temperature_c,
                soil_moisture_pct,
                ph_value,
                nitrogen_mg_kg,
                phosphorus_mg_kg,
                potassium_mg_kg,
                salt_mg_l,
                air_temperature_c,
                air_humidity_pct,
                is_raining,
                onchain_status,
                conductivity_us_cm
            FROM sensor_readings
            ORDER BY measured_at_vn DESC
            LIMIT 1
        """)
        
        latest_row = cur.fetchone()
        
        if not latest_row:
            cur.close()
            conn.close()
            return jsonify({
                "success": False,
                "error": "No sensor data available"
            }), 404
        
        # Build latest object
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
        
        # Query 2: Hourly trend for last N hours
        cur.execute("""
            SELECT 
                DATE_TRUNC('hour', measured_at_vn) as hour,
                AVG(soil_temperature_c) as avg_temp,
                AVG(soil_moisture_pct) as avg_moisture,
                AVG(ph_value) as avg_ph,
                AVG(nitrogen_mg_kg) as avg_n,
                AVG(phosphorus_mg_kg) as avg_p,
                AVG(potassium_mg_kg) as avg_k
            FROM sensor_readings
            WHERE measured_at_vn >= NOW() - INTERVAL '%s hours'
            GROUP BY hour
            ORDER BY hour ASC
        """, (hours,))
        
        trend_rows = cur.fetchall()
        
        # Build trend array
        trend_24h = []
        for row in trend_rows:
            trend_24h.append({
                "time": row[0].strftime('%Y-%m-%d %H:%M') if row[0] else None,
                "temp": round(float(row[1] or 0), 1),
                "moisture": round(float(row[2] or 0), 1),
                "ph": round(float(row[3] or 0), 1),
                "nitrogen": round(float(row[4] or 0), 1),
                "phosphorus": round(float(row[5] or 0), 1),
                "potassium": round(float(row[6] or 0), 1)
            })
        
        cur.close()
        conn.close()
        
        return jsonify({
            "success": True,
            "latest": latest,
            "trend_24h": trend_24h,
            "hours": hours
        }), 200
        
    except Exception as e:
        print(f"❌ Realtime IoT error: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@dashboard_bp.route('/ai-history', methods=['GET'])
def get_ai_history():
    """
    GET /api/dashboard/ai-history?days=30
    
    Returns daily AI insights for last N days
    
    Query params:
    - days: Number of days to look back (default: 30)
    
    Returns:
    {
      "insights": [
        {
          "id": 2,
          "date": "2025-10-28",
          "recommended_crop": "coffee",
          "confidence": 95,
          "soil_health_score": 78,
          "health_rating": "GOOD",
          "is_anomaly_detected": false,
          "blockchain_status": "confirmed",
          "blockchain_tx_hash": "0x1234...5678",
          "blockchain_pushed_at": "2025-10-28 20:15:00",
          "recommendations": [...]
        },
        ...
      ],
      "total": 30
    }
    """
    try:
        days = int(request.args.get('days', 30))
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Query: Get daily insights with all relevant fields
        cur.execute("""
            SELECT 
                id,
                date_vn,
                recommended_crop,
                crop_confidence,
                soil_health_score,
                soil_health_rating,
                has_anomaly,
                blockchain_status,
                blockchain_tx_hash,
                blockchain_pushed_at,
                recommendations_json,
                total_readings,
                created_at
            FROM daily_insights
            WHERE date_vn >= CURRENT_DATE - INTERVAL '%s days'
            ORDER BY date_vn DESC
        """, (days,))
        
        rows = cur.fetchall()
        
        # Build insights array
        insights = []
        for row in rows:
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
                "recommendations": row[10],  # JSON string
                "sample_count": int(row[11] or 0),
                "created_at": row[12].strftime('%Y-%m-%d %H:%M:%S') if row[12] else None
            })
        
        cur.close()
        conn.close()
        
        return jsonify({
            "success": True,
            "insights": insights,
            "total": len(insights),
            "days": days
        }), 200
        
    except Exception as e:
        print(f"❌ AI history error: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@dashboard_bp.route('/soil-trend', methods=['GET'])
def get_soil_trend():
    """
    GET /api/dashboard/soil-trend?days=30
    
    Returns soil health score trend for charting
    
    Query params:
    - days: Number of days to look back (default: 30)
    
    Returns:
    {
      "trend": [
        {"date": "2025-10-01", "score": 75, "rating": "GOOD"},
        {"date": "2025-10-02", "score": 76, "rating": "GOOD"},
        ...
      ],
      "days": 30
    }
    """
    try:
        days = int(request.args.get('days', 30))
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Query: Get soil health trend
        cur.execute("""
            SELECT 
                date_vn,
                soil_health_score,
                soil_health_rating
            FROM daily_insights
            WHERE date_vn >= CURRENT_DATE - INTERVAL '%s days'
            ORDER BY date_vn ASC
        """, (days,))
        
        rows = cur.fetchall()
        
        # Build trend array
        trend = []
        for row in rows:
            trend.append({
                "date": row[0].strftime('%Y-%m-%d') if row[0] else None,
                "score": int(row[1] or 0),
                "rating": row[2]
            })
        
        cur.close()
        conn.close()
        
        return jsonify({
            "success": True,
            "trend": trend,
            "days": days
        }), 200
        
    except Exception as e:
        print(f"❌ Soil trend error: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

