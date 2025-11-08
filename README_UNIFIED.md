# 🌾 PIONE AGROTWIN - UNIFIED ARCHITECTURE

## 🎯 MỤC TIÊU: Chỉ chạy 2 PORT thay vì 5 PORT

### ❌ **TRƯỚC ĐÂY** (5 ports - phức tạp):
- Port **5000**: Flask API (Data Ingest + Auth + Dashboard)
- Port **3000**: Node.js Blockchain Bridge
- Port **8000**: FastAPI AI Service
- Port **3001**: Next.js Frontend
- Port **6000**: PostgreSQL (database)

👉 **Phải mở 4 ports ra ngoài** (5000, 3000, 8000, 3001)

---

### ✅ **SAU KHI UNIFIED** (2 ports - đơn giản):
- Port **3000**: **Gateway chính** (external) - Tất cả requests đi qua đây
- Port **8080**: **Backend service** (internal) - Flask + FastAPI gộp lại

👉 **Chỉ cần mở 1 port ra ngoài: 3000**

---

## 📁 KIẾN TRÚC MỚI

```
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL (Port 3000)                      │
│                  gateway.js (Node.js)                        │
│                                                              │
│  • Blockchain Bridge (ethers.js)                            │
│  • API Proxy → Backend (port 8080)                          │
│  • Serve Frontend (Next.js static)                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    Proxy /api/* requests
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    INTERNAL (Port 8080)                      │
│              unified_backend.py (Python)                     │
│                                                              │
│  • Flask: Data Ingest + Auth + Dashboard                    │
│  • FastAPI: AI Analysis (4 models)                          │
│  • Mount FastAPI vào Flask với DispatcherMiddleware         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 CÁCH SỬ DỤNG

### **1. Cài đặt dependencies:**

```bash
# Node.js dependencies (gateway)
npm install

# Python dependencies (backend)
pip install -r requirements.txt
pip install fastapi uvicorn werkzeug

# AI Service dependencies
cd ai_service
pip install -r requirements.txt
cd ..
```

### **2. Build Frontend (chỉ cần làm 1 lần):**

```bash
cd Dapp/frontend
npm install
npm run build
cd ../..
```

Sau khi build, frontend sẽ được export thành static files tại `Dapp/frontend/out/`

### **3. Chạy hệ thống (1 lệnh duy nhất):**

```bash
chmod +x START_UNIFIED.sh
./START_UNIFIED.sh
```

Script sẽ tự động:
- ✅ Kiểm tra và dừng services cũ (nếu có)
- ✅ Build frontend (nếu chưa build)
- ✅ Khởi động Backend (port 8080 - internal)
- ✅ Khởi động Gateway (port 3000 - external)

### **4. Kiểm tra status:**

```bash
chmod +x STATUS_UNIFIED.sh
./STATUS_UNIFIED.sh
```

### **5. Dừng hệ thống:**

```bash
chmod +x STOP_UNIFIED.sh
./STOP_UNIFIED.sh
```

---

## 🌐 TRUY CẬP HỆ THỐNG

### **Chỉ cần nhớ 1 URL duy nhất: http://localhost:3000**

Tất cả các tính năng đều qua port 3000:

#### **🌐 Frontend:**
- http://localhost:3000/
- http://localhost:3000/auth/login
- http://localhost:3000/auth/register
- http://localhost:3000/dashboard

#### **📥 Data Ingest API:**
- POST http://localhost:3000/api/data
- GET http://localhost:3000/api/latest
- GET http://localhost:3000/api/history

#### **👤 Auth API:**
- POST http://localhost:3000/api/auth/register-passkey
- POST http://localhost:3000/api/auth/login-passkey
- POST http://localhost:3000/api/auth/register-pin
- POST http://localhost:3000/api/auth/login-pin

#### **📊 Dashboard API:**
- GET http://localhost:3000/api/dashboard/overview
- GET http://localhost:3000/api/dashboard/realtime-iot
- GET http://localhost:3000/api/dashboard/ai-history

#### **🤖 AI API:**
- POST http://localhost:3000/api/ai/analyze
- POST http://localhost:3000/api/ai/analyze-daily
- GET http://localhost:3000/api/ai/health

#### **⛓️ Blockchain API:**
- POST http://localhost:3000/bridgePending
- GET http://localhost:3000/getData
- GET http://localhost:3000/getDataRange

---

## 📝 FILES MỚI

### **1. gateway.js** - Unified Gateway (Port 3000)
- Gộp blockchain bridge + API proxy + frontend serving
- Proxy tất cả `/api/*` requests → backend (port 8080)
- Serve Next.js static build từ `Dapp/frontend/out/`

### **2. unified_backend.py** - Unified Backend (Port 8080)
- Gộp Flask + FastAPI vào 1 process
- Mount FastAPI tại `/api/ai` vào Flask app
- Chạy với Werkzeug DispatcherMiddleware

### **3. START_UNIFIED.sh** - Khởi động script
- Auto-stop old services
- Auto-build frontend nếu chưa có
- Start 2 services theo đúng thứ tự

### **4. STOP_UNIFIED.sh** - Dừng script
- Dừng tất cả services (cũ + mới)
- Clean up PID files

### **5. STATUS_UNIFIED.sh** - Kiểm tra status
- Hiển thị trạng thái 2 services
- Show PID, memory, port listening

---

## 🔧 CẤU HÌNH FIREWALL

### **Chỉ cần mở 1 port:**

```bash
# UFW (Ubuntu/Debian)
sudo ufw allow 3000/tcp
sudo ufw reload

# Firewalld (CentOS/RHEL)
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload

# Iptables
sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
sudo iptables-save
```

### **Port nội bộ (KHÔNG cần mở ra ngoài):**
- Port 8080: Chỉ backend service, gateway proxy tới

---

## 📊 SO SÁNH TRƯỚC/SAU

| Tiêu chí | Trước (Old) | Sau (Unified) |
|----------|-------------|---------------|
| **Số services** | 5 services | 2 services |
| **Ports cần mở** | 4 ports (3000, 5000, 8000, 3001) | 1 port (3000) |
| **Scripts** | START.sh, STOP_NEW.sh | START_UNIFIED.sh, STOP_UNIFIED.sh |
| **Frontend** | Dev server (npm run dev) | Static build (pre-built) |
| **Complexity** | Cao (nhiều services độc lập) | Thấp (2 services tích hợp) |
| **Memory** | ~800MB (5 processes) | ~500MB (2 processes) |
| **Latency** | Cao (nhiều hops) | Thấp (1 gateway) |

---

## 🐛 TROUBLESHOOTING

### **1. Frontend không hiển thị:**
```bash
# Rebuild frontend
cd Dapp/frontend
rm -rf .next out
npm run build
cd ../..

# Restart gateway
./STOP_UNIFIED.sh
./START_UNIFIED.sh
```

### **2. Backend không response:**
```bash
# Check logs
tail -f logs/unified_backend.log

# Check if port 8080 is listening
netstat -tuln | grep 8080

# Restart backend
./STOP_UNIFIED.sh
./START_UNIFIED.sh
```

### **3. Blockchain transaction failed:**
```bash
# Check logs
tail -f logs/unified_gateway.log

# Check contract address
cat .env | grep CONTRACT_ADDRESS

# Check RPC connection
curl https://rpc.zeroscan.org
```

### **4. AI Service không hoạt động:**
```bash
# Check if models are loaded
curl http://localhost:3000/api/ai/health

# Check backend logs
tail -f logs/unified_backend.log | grep "AI"
```

---

## 🔄 MIGRATION TỪ OLD → UNIFIED

### **Bước 1: Dừng hệ thống cũ**
```bash
./STOP_NEW.sh
```

### **Bước 2: Cài dependencies mới**
```bash
npm install  # Thêm http-proxy-middleware
pip install werkzeug  # Cho DispatcherMiddleware
```

### **Bước 3: Build frontend**
```bash
cd Dapp/frontend
npm run build
cd ../..
```

### **Bước 4: Chạy unified**
```bash
./START_UNIFIED.sh
```

### **Bước 5: Test endpoints**
```bash
# Test frontend
curl http://localhost:3000/

# Test API
curl http://localhost:3000/api/latest

# Test AI
curl http://localhost:3000/api/ai/health
```

---

## ✅ LỢI ÍCH

### **1. Đơn giản hơn:**
- Chỉ nhớ 1 URL: http://localhost:3000
- Chỉ mở 1 port ra ngoài
- Ít services hơn để quản lý

### **2. Hiệu suất tốt hơn:**
- Giảm overhead (ít processes)
- Giảm memory usage
- Giảm network latency (ít hops)

### **3. Deployment dễ hơn:**
- Docker: 2 containers thay vì 5
- Kubernetes: 2 pods thay vì 5
- Firewall: Chỉ mở 1 port

### **4. Bảo mật tốt hơn:**
- Backend (8080) không expose ra ngoài
- Frontend static (không thể inject code)
- Tất cả requests qua 1 gateway (dễ monitor)

---

## 🎓 KẾT LUẬN

**Unified architecture** giúp hệ thống:
- ✅ **Đơn giản hơn**: 2 services thay vì 5
- ✅ **Dễ deploy hơn**: Chỉ mở 1 port
- ✅ **Hiệu suất cao hơn**: Ít overhead
- ✅ **Bảo mật tốt hơn**: Backend không expose

**Khuyến nghị**: Dùng **unified architecture** cho production deployment.

---

**Developed by WAG Team 🌱**

