# 🚀 Deployment & Setup Guide

## Prerequisites

- **Python 3.10+** with pip
- **Node.js 18+** with npm
- **PostgreSQL 12+** (remote or local)
- **Git** for version control
- **Hardhat** for smart contract deployment

---

## 1. Environment Setup

### Clone Repository
```bash
cd /root/Pione_AIBlockchainIoT-WAGTeam
```

### Create `.env` File
```bash
# Database Configuration
PGHOST=36.50.134.107
PGPORT=6000
PGDATABASE=db_iot_sensor
PGUSER=admin
PGPASSWORD=admin123
DATABASE_URL=postgresql://admin:admin123@36.50.134.107:6000/db_iot_sensor

# Blockchain Configuration
RPC_URL=https://rpc.zeroscan.org
PRIVATE_KEY=0x...  # Your wallet private key
CONTRACT_ADDRESS=0x55313657185bd745917a7eD22fe9B827fC1AAC48

# AI Configuration
GEMINI_API_KEY=AIzaSyAeE5mtJWbCa9JiL-rxB78c4HU7Bx7yOvM
GEMINI_MODEL_NAME=gemini-2.5-pro

# Service URLs
NODE_BRIDGE_URL=http://127.0.0.1:3000/bridgePending
AI_SERVICE_HOST=0.0.0.0
AI_SERVICE_PORT=8000

# Optional
BRIDGE_WORKER_ID=node-worker-1
```

---

## 2. Database Setup

### Create Database
```bash
psql -h 36.50.134.107 -U admin -d postgres
CREATE DATABASE db_iot_sensor;
```

### Run Migrations
```bash
# Apply all migrations in order
psql -h 36.50.134.107 -U admin -d db_iot_sensor < migrations/002_add_new_sensor_fields.sql
psql -h 36.50.134.107 -U admin -d db_iot_sensor < migrations/003_upgrade_to_11_parameters.sql
psql -h 36.50.134.107 -U admin -d db_iot_sensor < migrations/004_add_ai_tables.sql
psql -h 36.50.134.107 -U admin -d db_iot_sensor < migrations/005_add_recommendations.sql
psql -h 36.50.134.107 -U admin -d db_iot_sensor < migrations/006_simplify_daily_insights.sql
psql -h 36.50.134.107 -U admin -d db_iot_sensor < migrations/007_add_onchain_tracking.sql
psql -h 36.50.134.107 -U admin -d db_iot_sensor < migrations/008_add_users_table.sql
psql -h 36.50.134.107 -U admin -d db_iot_sensor < migrations/009_add_pin_hash_column.sql
psql -h 36.50.134.107 -U admin -d db_iot_sensor < migrations/010_fix_nullable_passkey.sql
```

---

## 3. Backend Services

### Install Python Dependencies
```bash
pip install -r requirements.txt
pip install -r ai_service/requirements.txt
```

### Install Node Dependencies
```bash
npm install
cd Dapp/backend && npm install && cd ../..
cd Dapp/frontend && npm install && cd ../..
```

### Start Unified Backend (Port 8080)
```bash
python unified_backend.py
# Logs: logs/unified_backend.log
```

### Start Node.js Bridge (Port 3000)
```bash
node server.js
# Logs: logs/unified_gateway.log
```

### Start AI Service (Port 8000)
```bash
cd ai_service
python main.py
# Logs: ai_service/logs/ai_service.log
```

---

## 4. Frontend Setup

### Configure Frontend Environment
```bash
cd Dapp/frontend
cp env.local.example .env.local
```

**Edit `.env.local`:**
```
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8000
NEXT_PUBLIC_CONTRACT_ADDRESS=0x55313657185bd745917a7eD22fe9B827fC1AAC48
NEXT_PUBLIC_RPC_URL=https://rpc.zeroscan.org
```

### Start Frontend (Port 3001)
```bash
npm run dev
# Access: http://localhost:3001
```

---

## 5. Smart Contract Deployment

### Configure Hardhat
```bash
cd Dapp/smartContract
cp env.example .env
```

**Edit `.env`:**
```
PRIVATE_KEY=0x...
RPC_URL=https://rpc.zeroscan.org
```

### Deploy Contract
```bash
npx hardhat run scripts/deploy.js --network zeroscan
```

### Update Contract Address
Update `CONTRACT_ADDRESS` in `.env` with deployed address

---

## 6. Automated Startup

### Using `START_UNIFIED.sh`
```bash
chmod +x START_UNIFIED.sh
./START_UNIFIED.sh
```

**This script:**
1. Starts unified backend (8080)
2. Starts Node.js bridge (3000)
3. Starts AI service (8000)
4. Starts frontend (3001)
5. Logs all services to `/logs`

### Check Status
```bash
./QUICK_STATUS.sh
```

---

## 7. Docker Deployment (Optional)

### Build Docker Image
```bash
docker build -f Dockerfile.data_ingest -t pione-backend .
```

### Run Container
```bash
docker run -d \
  --name pione-backend \
  -p 8080:8080 \
  -p 3000:3000 \
  -p 8000:8000 \
  --env-file .env \
  pione-backend
```

---

## 8. Monitoring & Logs

### Log Files Location
```
logs/
├── unified_backend.log      # Flask API
├── unified_gateway.log      # Node.js bridge
├── ai_service.log           # AI service
├── blockchain_bridge.log    # Blockchain events
├── data_ingest.log          # Data ingestion
└── frontend.log             # Next.js
```

### View Logs
```bash
# Real-time
tail -f logs/unified_backend.log

# Last 100 lines
tail -100 logs/unified_backend.log

# Search for errors
grep ERROR logs/*.log
```

### Process Management
```bash
# Check running processes
ps aux | grep python
ps aux | grep node

# Kill process
kill -9 <PID>

# Check port usage
lsof -i :8080
lsof -i :3000
lsof -i :8000
lsof -i :3001
```

---

## 9. Testing

### Test Data Ingestion
```bash
curl -X POST http://localhost:8080/api/data \
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
    "is_raining": false
  }'
```

### Test Latest Data
```bash
curl http://localhost:8080/api/latest
```

### Test AI Chat
```bash
curl -X POST http://localhost:8080/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Nhiệt độ + NPK ổn không?"}'
```

### Test Dashboard
```bash
curl http://localhost:8080/api/dashboard/overview
curl http://localhost:8080/api/dashboard/realtime-iot
curl http://localhost:8080/api/dashboard/ai-history
```

---

## 10. Troubleshooting

### Database Connection Error
```bash
# Test connection
psql -h 36.50.134.107 -U admin -d db_iot_sensor -c "SELECT 1"

# Check credentials in .env
cat .env | grep PG
```

### Port Already in Use
```bash
# Find process using port
lsof -i :8080

# Kill process
kill -9 <PID>
```

### Blockchain Connection Error
```bash
# Test RPC URL
curl https://rpc.zeroscan.org

# Check private key format
echo $PRIVATE_KEY
```

### AI Service Not Responding
```bash
# Check if service is running
curl http://localhost:8000/health

# Check logs
tail -f ai_service/logs/ai_service.log
```

---

## 11. Production Checklist

- [ ] Set strong database password
- [ ] Use environment variables (not hardcoded)
- [ ] Enable HTTPS/SSL
- [ ] Set up firewall rules
- [ ] Configure CORS properly
- [ ] Enable database backups
- [ ] Set up monitoring/alerts
- [ ] Use process manager (PM2, systemd)
- [ ] Configure log rotation
- [ ] Test disaster recovery

