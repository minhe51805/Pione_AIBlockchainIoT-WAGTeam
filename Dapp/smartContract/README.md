# 🔗 AquaMind Smart Contract

Solidity smart contract for storing soil sensor data and daily AI insights on PioneZero blockchain.

## 📦 Contract: `AquaMindData.sol`

### Features:
- ✅ Store sensor readings (14 parameters)
- ✅ Store daily AI insights (9 parameters)
- ✅ Query data by ID or date
- ✅ Immutable on-chain storage

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
# Copy example to .env
cp env.example .env

# Edit .env with your private key
```

### 3. Compile Contract
```bash
npx hardhat compile
```

### 4. Deploy to PioneZero
```bash
npm run deploy
```

---

## 📝 Contract Structure

### **Structs:**

#### `SensorReading`
```solidity
struct SensorReading {
    uint256 id;
    string measuredAtVN;
    uint16 soilTemperatureC;      // × 100
    uint16 soilMoisturePct;        // × 100
    uint32 conductivity;           // × 10
    uint16 phValue;                // × 100
    uint16 nitrogen;
    uint16 phosphorus;
    uint16 potassium;
    uint16 salt;
    uint16 airTemperatureC;        // × 100
    uint16 airHumidityPct;         // × 100
    bool isRaining;
    bytes32 dataHash;
}
```

#### `DailyInsight`
```solidity
struct DailyInsight {
    uint256 id;
    string date;                   // YYYY-MM-DD
    string recommendedCrop;
    uint8 confidence;              // 0-100
    uint16 soilHealthScore;        // 0-100 (× 10)
    uint8 healthRating;            // 0=POOR, 1=FAIR, 2=GOOD, 3=EXCELLENT
    bool hasAnomaly;
    string recommendations;        // JSON string
    bytes32 recordHash;
}
```

---

## 🔧 Functions

### Write Functions:
```solidity
storeSensorReading(...)     // Store IoT sensor data
storeDailyInsight(...)      // Store daily AI analysis
```

### Read Functions:
```solidity
getSensorReading(uint256 _id)              // Get sensor data by ID
getSensorReadingCount()                    // Total sensor readings
getDailyInsightByDate(string _date)        // Get insight by date
getDailyInsightCount()                     // Total daily insights
```

---

## 📊 Events

```solidity
event SensorReadingStored(uint256 indexed id, string measuredAtVN, bytes32 dataHash);
event DailyInsightStored(uint256 indexed id, string date, string recommendedCrop, ...);
```

---

## 🌐 Deployment

### Deployed on PioneZero:
- **Network:** PioneZero (Chain ID: 4242)
- **RPC:** `https://rpc.zeroscan.org`
- **Explorer:** `https://zeroscan.org`
- **Contract Address:** `0x7b583EafBB3cea27a8DC525c85E6a173173Ee5E0`

---

## 🧪 Testing

```bash
# Run Hardhat tests (if available)
npm test

# Or interact via Hardhat console
npx hardhat console --network pionezero
```

---

## 📚 Integration

This contract is used by:
- **Node.js Bridge** (`server.js`) - Push data from backend
- **Next.js DApp** (`Dapp/frontend`) - Read data for dashboard
- **AI Service** (`ai_service/daily_aggregator.py`) - Push daily insights

---

**Developed by WAG Team 🌱**

