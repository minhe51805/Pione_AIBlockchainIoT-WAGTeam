import requests
import json
from datetime import datetime

# URL endpoint của server (localhost)
SERVER_URL = "http://localhost:5000/api/data"

# Dữ liệu mẫu giống format từ ESP32
def create_test_data():
    """Tạo dữ liệu test giống ESP32"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    return {
        "temperature": 28.5,
        "humidity": 46,
        "soil": 100,
        "timestamp": timestamp,
        "status": "OK"
    }

def send_single_post():
    """Gửi một POST request duy nhất để test"""
    try:
        sample_data = create_test_data()
        headers = {
            'Content-Type': 'application/json'
        }
        
        send_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print("="*60)
        print(f"TEST: Sending data to MySQL server at {send_time}")
        print("="*60)
        print(f"URL: {SERVER_URL}")
        print(f"Data: {json.dumps(sample_data, indent=2)}")
        print("-"*60)
        
        response = requests.post(SERVER_URL, json=sample_data, headers=headers, timeout=10)
        
        print(f"\nResponse Status: {response.status_code}")
        print(f"Response Body: {response.text}")
        print("="*60)
        
        if response.status_code == 200:
            result = response.json()
            success_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            if result.get("db_saved"):
                print(f"[OK] Data sent and saved to MySQL successfully at {success_time}!")
            else:
                print(f"[WARNING] Data sent but NOT saved to MySQL at {success_time}!")
        else:
            error_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            print(f"[ERROR] Failed to send data at {error_time}")
            
    except requests.exceptions.ConnectionError:
        print("[ERROR] Cannot connect to server!")
        print("Make sure server is running: python app_mysql.py")
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] Request failed: {e}")

def test_server():
    """Test xem server có chạy không"""
    try:
        print("\n[TEST] Checking server status...")
        response = requests.get("http://localhost:5000/test", timeout=5)
        if response.status_code == 200:
            print("[OK] Server is running!")
            data = response.json()
            print(f"Database: {data.get('database', 'unknown')}")
            return True
        else:
            print("[ERROR] Server returned error")
            return False
    except:
        print("[ERROR] Server is not running!")
        print("Please start server: python app_mysql.py")
        return False

if __name__ == "__main__":
    print("\n" + "="*60)
    print("IoT Gateway - Single POST Test")
    print("="*60)
    
    # Kiểm tra server trước
    if test_server():
        print()
        send_single_post()
    else:
        print("\nPlease start the server first!")
    
    print()