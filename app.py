from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import traceback

app = Flask(__name__)
CORS(app)  # Cho phép CORS để truy cập từ domain khác

latest_data = {
    "temperature": None,
    "humidity": None,
    "soil": None,
    "status": "Waiting for data..."
}

# Route nhận dữ liệu từ ESP8266
@app.route("/api/data", methods=["POST"])
def receive_data():
    data = request.get_json()  # ESP gửi JSON
    if not data:
        return jsonify({"status": "error", "message": "No data received"}), 400

    temperature = data.get("temperature")
    humidity = data.get("humidity")
    soil = data.get("soil")

    latest_data["temperature"] = temperature
    latest_data["humidity"] = humidity
    latest_data["soil"] = soil
    latest_data["status"] = "Data received from ESP8266"

    print(f"[ESP8266] Temp: {temperature} °C | Humi: {humidity} % | Soil: {soil} %")

    # Trả về cho ESP biết server đã nhận
    return jsonify({"status": "success", "message": "Data received"}), 200

# Route trả về dữ liệu mới nhất cho UI
@app.route("/api/latest", methods=["GET"])
def api_latest():
    try:
        print(f"[API] Returning latest data: {latest_data}")
        response = jsonify(latest_data)
        response.headers['Content-Type'] = 'application/json'
        return response
    except Exception as e:
        print(f"[ERROR] Error in api_latest: {e}")
        print(traceback.format_exc())
        return jsonify({"error": "Internal server error", "message": str(e)}), 500

# Route UI
@app.route("/", methods=["GET"])
def home():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
