from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, timezone, timedelta


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
        temperature = data.get("temperature")
        humidity = data.get("humidity")
        soil = data.get("soil")
        if temperature is None or humidity is None or soil is None:
            return jsonify({"status": "error", "message": "Missing temperature/humidity/soil"}), 400

        measured_at_vn = normalize_measured_at_vn(data)
        if not measured_at_vn:
            return jsonify({"status": "error", "message": "Invalid timestamp/created_at"}), 400

        with get_db_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO sensor_readings (measured_at_vn, temperature_c, humidity_pct, moisture_pct)
                    VALUES (%s, %s, %s, %s)
                    ON CONFLICT (measured_at_vn) DO NOTHING
                    """,
                    (measured_at_vn, float(temperature), int(humidity), int(soil)),
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
                with urllib.request.urlopen(req, timeout=3) as resp:
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
                    SELECT id, temperature_c as temperature, humidity_pct as humidity, moisture_pct as soil,
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
                    SELECT id, temperature_c as temperature, humidity_pct as humidity, moisture_pct as soil,
                           measured_at_vn as timestamp, onchain_status as status, created_at_vn as created_at
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


if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=True)


