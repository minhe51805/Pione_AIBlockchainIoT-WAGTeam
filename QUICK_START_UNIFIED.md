# ⚡ QUICK START - UNIFIED ARCHITECTURE

## 🎯 Chỉ 3 bước để chạy toàn bộ hệ thống!

---

## 📋 BƯỚC 1: Cài đặt dependencies (chỉ 1 lần)

```bash
# 1.1. Cài Node.js dependencies
npm install

# 1.2. Cài Python dependencies
pip install -r requirements.txt
pip install fastapi uvicorn werkzeug

# 1.3. Cài AI Service dependencies
cd ai_service
pip install -r requirements.txt
cd ..

# 1.4. Build Frontend (static export)
cd Dapp/frontend
npm install
npm run build
cd ../..
```

**⏱️ Thời gian**: ~5-10 phút (tùy tốc độ mạng)

---

## 🚀 BƯỚC 2: Chạy hệ thống

```bash
./START_UNIFIED.sh
```

**Chờ ~15 giây** để tất cả services khởi động.

---

## ✅ BƯỚC 3: Truy cập hệ thống

### **🌐 Mở trình duyệt:**
```
http://localhost:3000
```

### **📱 Hoặc qua IP external:**
```
http://163.61.183.90:3000
```

---

## 🎉 XEM THÀNH QUẢ!

### **1. Trang chủ / Login:**
- http://localhost:3000/

### **2. Dashboard (sau khi đăng nhập):**
- http://localhost:3000/dashboard

### **3. Test API:**

```bash
# Test Data Ingest
curl http://localhost:3000/api/latest

# Test AI Service
curl http://localhost:3000/api/ai/health

# Test Blockchain
curl http://localhost:3000/getData
```

---

## 🛑 DỪNG HỆ THỐNG

```bash
./STOP_UNIFIED.sh
```

---

## 📊 KIỂM TRA STATUS

```bash
./STATUS_UNIFIED.sh
```

Kết quả mong đợi:
```
✅ Unified Gateway (External)
   PID: 12345
   Port: 3000
   Status: 🟢 LISTENING

✅ Unified Backend (Internal)
   PID: 12346
   Port: 8080
   Status: 🟢 LISTENING

📊 Summary: 2/2 services running
```

---

## 📝 XEM LOGS

```bash
# Gateway logs (blockchain + API proxy)
tail -f logs/unified_gateway.log

# Backend logs (Flask + FastAPI + AI)
tail -f logs/unified_backend.log
```

---

## 🐛 TROUBLESHOOTING

### **Vấn đề 1: Frontend không hiển thị**
```bash
# Rebuild frontend
cd Dapp/frontend && npm run build && cd ../..
./STOP_UNIFIED.sh && ./START_UNIFIED.sh
```

### **Vấn đề 2: Port 3000 đã được sử dụng**
```bash
# Tìm process đang dùng port 3000
sudo lsof -i :3000

# Hoặc kill process
sudo kill -9 $(lsof -t -i:3000)

# Sau đó start lại
./START_UNIFIED.sh
```

### **Vấn đề 3: AI models không load**
```bash
# Check logs
tail -f logs/unified_backend.log | grep "model"

# Verify models exist
ls -la ai_module/models/
```

### **Vấn đề 4: Database connection failed**
```bash
# Test database connection
psql -h 36.50.134.107 -p 6000 -U admin -d db_iot_sensor

# Check .env file
cat .env | grep PG
```

---

## 🔥 TEST FULL FLOW (IoT → AI → Blockchain)

### **1. Gửi data từ IoT (hoặc test bằng curl):**

```bash
curl -X POST http://localhost:3000/api/data \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": 24.5,
    "humidity": 45.2,
    "conductivity": 1250,
    "ph": 6.8,
    "nitrogen": 45,
    "phosphorus": 30,
    "potassium": 180,
    "salt": 850,
    "air_temperature": 27.1,
    "air_humidity": 65.0,
    "is_raining": false,
    "timestamp": "2025-11-06T10:30:00Z"
  }'
```

### **2. Kiểm tra data đã được lưu:**

```bash
curl http://localhost:3000/api/latest
```

### **3. Phân tích AI:**

```bash
curl -X POST http://localhost:3000/api/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{
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
    "is_raining": false,
    "mode": "discovery"
  }'
```

### **4. Kiểm tra data trên blockchain:**

```bash
curl http://localhost:3000/getData
```

---

## 📍 PORTS SUMMARY

| Service | Port | Access | Description |
|---------|------|--------|-------------|
| **Gateway** | **3000** | **External** | **Main entry point** - Tất cả requests qua đây |
| Backend | 8080 | Internal | Flask + FastAPI - Không expose ra ngoài |
| Database | 6000 | External | PostgreSQL - Cần mở nếu access từ xa |

**👉 Chỉ cần mở port 3000 trong firewall!**

---

## 🎓 NEXT STEPS

1. ✅ Hệ thống đã chạy → Test các tính năng
2. ✅ Cấu hình firewall: `sudo ufw allow 3000/tcp`
3. ✅ Deploy frontend build: Đã có sẵn tại `Dapp/frontend/out/`
4. ✅ Setup domain: Trỏ domain về IP:3000
5. ✅ SSL/HTTPS: Dùng Nginx reverse proxy + Let's Encrypt

---

## 🔗 LINKS QUAN TRỌNG

- **Frontend**: http://localhost:3000/
- **API Docs**: README_UNIFIED.md
- **Full Architecture**: README.md
- **Blockchain Explorer**: https://zeroscan.org

---

## 💡 TIPS

### **Tự động start khi server reboot:**

```bash
# Tạo systemd service
sudo nano /etc/systemd/system/pione-agrotwin.service
```

Nội dung:
```ini
[Unit]
Description=Pione AgroTwin Unified Service
After=network.target postgresql.service

[Service]
Type=forking
User=root
WorkingDirectory=/root/Pione_AIBlockchainIoT-WAGTeam
ExecStart=/root/Pione_AIBlockchainIoT-WAGTeam/START_UNIFIED.sh
ExecStop=/root/Pione_AIBlockchainIoT-WAGTeam/STOP_UNIFIED.sh
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Enable:
```bash
sudo systemctl daemon-reload
sudo systemctl enable pione-agrotwin.service
sudo systemctl start pione-agrotwin.service
```

---

**✨ Chúc bạn sử dụng thành công! 🌾**

**Developed by WAG Team 🌱**

