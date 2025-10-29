# BACKEND INTEGRATION PLAN
## Update server.js + daily_aggregator.py for new contract

### Current Architecture:
```
IoT Data → Flask (app_ingest.py) → PostgreSQL
                                      ↓
                           AI Service (FastAPI)
                                      ↓
                    server.js (Node.js Bridge) → Blockchain
```

### Changes Needed:

#### 1. Update server.js

**A. New Contract ABI**
```javascript
// Before
const contractABI = require('./SoilDataStoreABI.json');

// After
const contractABI = require('./Dapp/smartContract/artifacts/contracts/AquaMindData.sol/AquaMindData.json');
```

**B. Update pushDailyInsight endpoint**
```javascript
// Match new contract signature
app.post('/api/pushDailyInsight', async (req, res) => {
  const {
    id,                    // NEW
    dateTimestamp,         // RENAME
    sampleCount,           // RENAME
    recommendedCrop,       // RENAME
    confidence,            // NEW
    soilHealthScore,
    healthRating,
    isAnomalyDetected,     // NEW
    recommendations,       // NEW (JSON string)
    // Sensor averages
    soilTemperatureAvg,
    soilMoistureAvg,
    // ... all 10 params
  } = req.body;

  const tx = await contract.storeDailyInsight(
    id,
    dateTimestamp,
    sampleCount,
    recommendedCrop,
    confidence,
    soilHealthScore,
    healthRating,
    isAnomalyDetected,
    recommendations,
    // sensor averages...
  );

  await tx.wait();
  res.json({ success: true, txHash: tx.hash });
});
```

**C. Update getDailyInsights endpoint**
```javascript
// Parse new struct format
app.get('/api/getDailyInsights', async (req, res) => {
  const count = await contract.totalDailyInsights();
  const insights = [];

  for (let i = 0; i < count; i++) {
    const id = await contract.dailyInsightIds(i);
    const insight = await contract.getDailyInsight(id);
    
    insights.push({
      id: insight.id.toNumber(),
      dateTimestamp: insight.dateTimestamp.toNumber(),
      recommendedCrop: insight.recommendedCrop,
      soilHealthScore: insight.soilHealthScore.toNumber() / 10,
      healthRating: insight.healthRating,
      recommendations: JSON.parse(insight.recommendations), // Parse JSON
      // ... other fields
    });
  }

  res.json({ success: true, data: insights });
});
```

#### 2. Update daily_aggregator.py

**A. Update push_to_blockchain function**
```python
def push_to_blockchain(daily_insight_data, daily_insight_id):
    """Push daily insight to blockchain via Node.js bridge"""
    
    # Prepare payload for new contract
    payload = {
        "id": daily_insight_id,
        "dateTimestamp": int(daily_insight_data['date_vn'].timestamp()),
        "sampleCount": daily_insight_data['total_readings'],
        "recommendedCrop": daily_insight_data['recommended_crop'],
        "confidence": int(daily_insight_data['confidence'] * 100),
        "soilHealthScore": int(daily_insight_data['soil_health_score'] * 10),
        "healthRating": daily_insight_data['soil_health_rating'],
        "isAnomalyDetected": daily_insight_data['is_anomaly_detected'],
        "recommendations": json.dumps(daily_insight_data['recommendations']),
        # Sensor averages (×10 for decimals)
        "soilTemperatureAvg": int(daily_insight_data['soil_temp_avg'] * 10),
        "soilMoistureAvg": int(daily_insight_data['soil_moisture_avg'] * 10),
        "conductivityAvg": int(daily_insight_data['ec_avg'] * 10),
        "phAvg": int(daily_insight_data['ph_avg'] * 10),
        "nitrogenAvg": int(daily_insight_data['n_avg']),
        "phosphorusAvg": int(daily_insight_data['p_avg']),
        "potassiumAvg": int(daily_insight_data['k_avg']),
        "saltAvg": int(daily_insight_data['salt_avg']),
        "airTemperatureAvg": int(daily_insight_data['air_temp_avg'] * 10),
        "airHumidityAvg": int(daily_insight_data['air_humidity_avg'] * 10),
    }
    
    response = requests.post(
        f"{BRIDGE_URL}/api/pushDailyInsight",
        json=payload,
        timeout=30
    )
    
    return response.json()
```

#### 3. Update .env files

**A. server.js (.env)**
```env
# Update contract address
CONTRACT_ADDRESS=0x...NEW_ADDRESS...
# Keep others same
WALLET_PRIVATE_KEY=...
RPC_URL=https://rpc-testnet.pione.network
```

**B. Dapp/frontend (.env.local)**
```env
NEXT_PUBLIC_PROJECT_ID=...reown projectId...
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...NEW_ADDRESS...
NEXT_PUBLIC_RPC_URL=https://rpc-testnet.pione.network
NEXT_PUBLIC_FLASK_API=http://localhost:5000
NEXT_PUBLIC_AI_API=http://localhost:8000
```

**C. ai_service (config.env)**
```env
# Keep same
DATABASE_HOST=...
BRIDGE_URL=http://localhost:3000
```

### Testing Checklist:

1. **Contract Deployment:**
   ```bash
   cd Dapp/smartContract
   npx hardhat compile
   npx hardhat run scripts/deploy.js --network pioneZero
   # Copy new address to all .env files
   ```

2. **Server.js Update:**
   ```bash
   # Update CONTRACT_ADDRESS in .env
   # Restart Node.js bridge
   node server.js
   ```

3. **Test Pipeline:**
   ```bash
   # Trigger from DApp or Postman
   POST http://localhost:8000/api/ai/analyze-daily
   
   # Verify blockchain
   GET http://localhost:3000/api/getLatestDailyInsight
   ```

4. **Frontend Test:**
   ```bash
   cd Dapp/frontend
   npm run dev
   # Open http://localhost:3000
   # Connect wallet
   # Click "Analyze" and "Trigger Pipeline"
   ```

### Migration Timeline:

- **Phase 1 (Cleanup):** 30 mins
- **Phase 2 (Contract):** 1 hour
- **Phase 3 (Frontend):** 2 hours
- **Phase 4 (Backend):** 30 mins
- **Testing & Debug:** 1 hour

**TOTAL: ~5 hours**

