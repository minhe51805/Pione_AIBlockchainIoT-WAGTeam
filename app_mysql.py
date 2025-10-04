from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import traceback
from datetime import datetime
import psycopg2
from psycopg2 import pool, Error
from db_config import DB_CONFIG, POOL_CONFIG

app = Flask(__name__)
CORS(app)

# Tạo connection pool để tối ưu performance
try:
    connection_pool = psycopg2.pool.SimpleConnectionPool(
        1, POOL_CONFIG['pool_size'],
        **DB_CONFIG
    )
    print("[OK] PostgreSQL Connection Pool created successfully")
except Error as e:
    print(f"[ERROR] Error creating connection pool: {e}")
    connection_pool = None

latest_data = {
    "temperature": None,
    "humidity": None,
    "soil": None,
    "status": "Waiting for data...",
    "timestamp": None,
    "last_received": None,
    "total_received": 0
}

def get_db_connection():
    """Lấy connection từ pool"""
    try:
        if connection_pool:
            return connection_pool.getconn()
        else:
            # Fallback: tạo connection trực tiếp nếu pool fail
            return psycopg2.connect(**DB_CONFIG)
    except Error as e:
        print(f"[ERROR] Error getting database connection: {e}")
        return None

def insert_sensor_data(temperature, humidity, soil, timestamp, status):
    """Lưu dữ liệu sensor vào PostgreSQL"""
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        if not connection:
            return False
            
        cursor = connection.cursor()
        
        # Sử dụng bảng sensor_readings theo cấu trúc PostgreSQL
        query = """
        INSERT INTO sensor_readings (temperature_c, humidity_pct, moisture_pct, measured_at_vn)
        VALUES (%s, %s, %s, %s)
        """
        
        cursor.execute(query, (temperature, humidity, soil, timestamp))
        connection.commit()
        
        print(f"[OK] Data saved to PostgreSQL")
        return True
        
    except Error as e:
        print(f"[ERROR] PostgreSQL Error: {e}")
        if connection:
            connection.rollback()
        return False
        
    finally:
        if cursor:
            cursor.close()
        if connection:
            if connection_pool:
                connection_pool.putconn(connection)
            else:
                connection.close()

def get_latest_from_db():
    """Lấy dữ liệu mới nhất từ database"""
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        if not connection:
            return None
            
        cursor = connection.cursor()
        
        query = """
        SELECT temperature_c, humidity_pct, moisture_pct, measured_at_vn, created_at_vn, onchain_status
        FROM sensor_readings
        ORDER BY id DESC
        LIMIT 1
        """
        
        cursor.execute(query)
        result = cursor.fetchone()
        
        if result:
            return {
                'temperature': result[0],
                'humidity': result[1], 
                'soil': result[2],
                'timestamp': result[3],
                'created_at': result[4],
                'status': result[5] if result[5] else 'pending'
            }
        return None
        
    except Error as e:
        print(f"[ERROR] PostgreSQL Error: {e}")
        return None
        
    finally:
        if cursor:
            cursor.close()
        if connection:
            if connection_pool:
                connection_pool.putconn(connection)
            else:
                connection.close()

def get_history_data(limit=100):
    """Lấy lịch sử dữ liệu"""
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        if not connection:
            return []
            
        cursor = connection.cursor()
        
        query = """
        SELECT id, temperature_c, humidity_pct, moisture_pct, measured_at_vn, onchain_status, created_at_vn
        FROM sensor_readings
        ORDER BY id DESC
        LIMIT %s
        """
        
        cursor.execute(query, (limit,))
        results = cursor.fetchall()
        
        # Convert results to list of dictionaries
        history = []
        for row in results:
            history.append({
                'id': row[0],
                'temperature': row[1],
                'humidity': row[2],
                'soil': row[3],
                'timestamp': row[4].strftime('%Y-%m-%d %H:%M:%S') if row[4] else None,
                'status': row[5] if row[5] else 'pending',
                'created_at': row[6].strftime('%Y-%m-%d %H:%M:%S') if row[6] else None
            })
        
        return history
        
    except Error as e:
        print(f"[ERROR] PostgreSQL Error: {e}")
        return []
        
    finally:
        if cursor:
            cursor.close()
        if connection:
            if connection_pool:
                connection_pool.putconn(connection)
            else:
                connection.close()

# Route nhận dữ liệu từ ESP32/ESP8266
@app.route("/api/data", methods=["POST"])
def receive_data():
    data = request.get_json()
    if not data:
        return jsonify({"status": "error", "message": "No data received"}), 400

    temperature = data.get("temperature")
    humidity = data.get("humidity")
    soil = data.get("soil")
    timestamp = data.get("timestamp", datetime.now().isoformat())
    status = data.get("status", "OK")

    # Validate data
    if temperature is None or humidity is None or soil is None:
        return jsonify({
            "status": "error", 
            "message": "Missing required fields: temperature, humidity, or soil"
        }), 400

    # Cập nhật latest_data trong memory
    latest_data["temperature"] = temperature
    latest_data["humidity"] = humidity
    latest_data["soil"] = soil
    latest_data["timestamp"] = timestamp
    latest_data["status"] = status
    latest_data["last_received"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    latest_data["total_received"] += 1

    # Lưu vào MySQL
    success = insert_sensor_data(temperature, humidity, soil, timestamp, status)
    
    # In ra thời gian nhận được data
    received_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{received_time}] Temp: {temperature}C | Humi: {humidity}% | Soil: {soil}% | ESP Time: {timestamp} | DB: {'OK' if success else 'FAIL'}")

    # Trả về cho ESP biết server đã nhận
    return jsonify({
        "status": "success", 
        "message": "Data received and saved",
        "db_saved": success
    }), 200

# Route trả về dữ liệu mới nhất cho UI
@app.route("/api/latest", methods=["GET"])
def api_latest():
    try:
        # Lấy từ database để đảm bảo data chính xác
        db_data = get_latest_from_db()
        
        if db_data:
            response_data = {
                "temperature": db_data["temperature"],
                "humidity": db_data["humidity"],
                "soil": db_data["soil"],
                "timestamp": db_data["timestamp"],  # Thời gian từ ESP
                "status": db_data["status"],
                "created_at": db_data["created_at"].strftime('%Y-%m-%d %H:%M:%S') if db_data.get("created_at") else None,  # Thời gian server nhận
                "total_received": latest_data["total_received"]
            }
        else:
            # Fallback to memory data (khi chưa có database hoặc chưa có data)
            response_data = {
                "temperature": latest_data.get("temperature"),
                "humidity": latest_data.get("humidity"),
                "soil": latest_data.get("soil"),
                "timestamp": latest_data.get("timestamp"),  # Thời gian từ ESP
                "status": latest_data.get("status", "Waiting for data..."),
                "created_at": latest_data.get("last_received"),  # Thời gian server nhận
                "total_received": latest_data.get("total_received", 0)
            }
        
        return jsonify(response_data), 200
        
    except Exception as e:
        print(f"[ERROR] Error in api_latest: {e}")
        print(traceback.format_exc())
        return jsonify({"error": "Internal server error", "message": str(e)}), 500

# Route lấy lịch sử dữ liệu
@app.route("/api/history", methods=["GET"])
def api_history():
    try:
        # Lấy parameter limit từ query string (mặc định 100)
        limit = request.args.get('limit', 100, type=int)
        limit = min(limit, 1000)  # Giới hạn tối đa 1000 records
        
        history = get_history_data(limit)
        
        return jsonify({
            "status": "success",
            "count": len(history),
            "data": history
        }), 200
        
    except Exception as e:
        print(f"[ERROR] Error in api_history: {e}")
        print(traceback.format_exc())
        return jsonify({"error": "Internal server error", "message": str(e)}), 500

# Route thống kê
@app.route("/api/stats", methods=["GET"])
def api_stats():
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Database connection failed"}), 500
            
        cursor = connection.cursor(dictionary=True)
        
        # Lấy thống kê tổng quan
        query = """
        SELECT 
            COUNT(*) as total_records,
            AVG(temperature) as avg_temp,
            MIN(temperature) as min_temp,
            MAX(temperature) as max_temp,
            AVG(humidity) as avg_humidity,
            MIN(humidity) as min_humidity,
            MAX(humidity) as max_humidity,
            AVG(soil) as avg_soil,
            MIN(soil) as min_soil,
            MAX(soil) as max_soil,
            MIN(created_at) as first_record,
            MAX(created_at) as last_record
        FROM sensor_data
        """
        
        cursor.execute(query)
        stats = cursor.fetchone()
        
        # Convert datetime to string
        if stats.get('first_record'):
            stats['first_record'] = stats['first_record'].strftime('%Y-%m-%d %H:%M:%S')
        if stats.get('last_record'):
            stats['last_record'] = stats['last_record'].strftime('%Y-%m-%d %H:%M:%S')
        
        return jsonify({
            "status": "success",
            "stats": stats
        }), 200
        
    except Error as e:
        print(f"[ERROR] MySQL Error: {e}")
        return jsonify({"error": "Database error", "message": str(e)}), 500
        
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

# Route UI
@app.route("/", methods=["GET"])
def home():
    return render_template("index.html")

# Route test
@app.route("/test", methods=["GET"])
def test():
    db_status = "connected" if connection_pool else "disconnected"
    return jsonify({
        "message": "Test successful",
        "database": db_status,
        "latest_data": latest_data
    })

if __name__ == "__main__":
    print("="*60)
    print("Starting Flask server with MySQL...")
    print("="*60)
    print("Dashboard: http://localhost:5000")
    print("API Latest: http://localhost:5000/api/latest")
    print("API History: http://localhost:5000/api/history?limit=100")
    print("API Stats: http://localhost:5000/api/stats")
    print("Test: http://localhost:5000/test")
    print("="*60)
    app.run(host="0.0.0.0", port=5000, debug=True)

