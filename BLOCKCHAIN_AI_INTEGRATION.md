# 🔗 BLOCKCHAIN AI INTEGRATION

## ✅ SMART CONTRACT UPDATED

**File:** `contracts/SoilDataStore.sol`

### **Changes:**
1. ✅ Added `DailyInsight` struct
2. ✅ Added `storeDailyInsight()` function
3. ✅ Added 4 query functions for daily insights
4. ✅ Added duplicate prevention (mapping)
5. ✅ Added event `DailyInsightStored`

---

## 📊 **DAILY INSIGHT STRUCTURE**

```solidity
struct DailyInsight {
    uint256 dateTimestamp;      // Date (YYYY-MM-DD 00:00:00)
    uint256 sampleCount;        // Number of readings
    string recommendedCrop;     // AI crop (e.g., "coffee")
    uint256 confidence;         // × 100 (98.5% → 9850)
    uint256 soilHealthScore;    // × 10 (88.3 → 883)
    uint8 healthRating;         // 0-3 (POOR/FAIR/GOOD/EXCELLENT)
    bool isAnomalyDetected;     // Anomaly flag
    address reporter;
}
```

### **Scaling:**
- **Confidence:** `× 100` (98.5% → 9850)
- **Soil Health:** `× 10` (88.3 → 883)
- **Health Rating:** 
  - 0 = POOR
  - 1 = FAIR  
  - 2 = GOOD
  - 3 = EXCELLENT

---

## 🔧 **NEW FUNCTIONS**

### 1. **storeDailyInsight()**
Store daily aggregated AI insight (1 record per day)

```solidity
function storeDailyInsight(
    uint256 _dateTimestamp,     // Unix timestamp for date
    uint256 _sampleCount,       // Number of readings
    string memory _recommendedCrop,
    uint256 _confidence,        // × 100
    uint256 _soilHealthScore,   // × 10
    uint8 _healthRating,        // 0-3
    bool _isAnomalyDetected
) public
```

**Protection:** Prevents duplicate dates via `dailyInsightExists` mapping

---

### 2. **getDailyInsightCount()**
Get total count of daily insights

```solidity
function getDailyInsightCount() public view returns (uint256)
```

---

### 3. **getDailyInsight(id)**
Get daily insight by ID

```solidity
function getDailyInsight(uint256 id) public view returns (DailyInsight memory)
```

---

### 4. **getDailyInsightsByDateRange()**
Query daily insights by date range

```solidity
function getDailyInsightsByDateRange(
    uint256 startDate,
    uint256 endDate
) public view returns (DailyInsight[] memory)
```

---

### 5. **getLatestDailyInsight()**
Get most recent daily insight

```solidity
function getLatestDailyInsight() public view returns (DailyInsight memory)
```

---

## 🚀 **DEPLOYMENT STEPS**

### **Step 1: Compile Contract**
```bash
npx hardhat compile
```

**Expected:** Compilation successful

---

### **Step 2: Deploy New Contract**
```bash
npx hardhat run scripts/deploy.js --network pzo
```

**Expected:** 
```
Deployed SoilDataStore to: 0x...
```

**⚠️ IMPORTANT:** Copy new contract address!

---

### **Step 3: Update .env**
```bash
# Old contract (raw data only)
# CONTRACT_ADDRESS=0x55313657185bd745917a7eD22fe9B827fC1AAC48

# New contract (raw data + daily insights)
CONTRACT_ADDRESS=0x<NEW_ADDRESS_HERE>
```

---

### **Step 4: Update server.js**

Add new endpoint for daily insights:

```javascript
// POST /api/pushDailyInsight
app.post("/api/pushDailyInsight", async (req, res) => {
    const {
        date,                // "2025-10-27"
        sampleCount,         // 48
        recommendedCrop,     // "coffee"
        confidence,          // 0.985
        soilHealthScore,     // 88.3
        healthRating,        // "EXCELLENT"
        isAnomalyDetected    // false
    } = req.body;
    
    // Convert date to Unix timestamp (00:00:00 VN time)
    const dateTimestamp = Math.floor(new Date(date + "T00:00:00+07:00").getTime() / 1000);
    
    // Scale values
    const confidenceScaled = Math.round(confidence * 10000);  // 98.5% → 9850
    const healthScoreScaled = Math.round(soilHealthScore * 10);  // 88.3 → 883
    
    // Convert rating to number
    const ratingMap = { "POOR": 0, "FAIR": 1, "GOOD": 2, "EXCELLENT": 3 };
    const healthRatingNum = ratingMap[healthRating] || 0;
    
    // Call smart contract
    const tx = await contract.storeDailyInsight(
        dateTimestamp,
        sampleCount,
        recommendedCrop,
        confidenceScaled,
        healthScoreScaled,
        healthRatingNum,
        isAnomalyDetected
    );
    
    await tx.wait();
    res.json({ txHash: tx.hash });
});
```

---

### **Step 5: Update AI Service**

Modify `daily_aggregator.py` to call blockchain after saving DB:

```python
def save_daily_insight(date, aggregated_data, ai_result):
    # ... existing DB save code ...
    
    # NEW: Push to blockchain
    try:
        import urllib.request
        import json
        
        blockchain_url = os.getenv("BLOCKCHAIN_BRIDGE_URL", "http://localhost:3000/api/pushDailyInsight")
        
        payload = {
            "date": date,
            "sampleCount": aggregated_data['sample_count'],
            "recommendedCrop": ai_result.crop_recommendation.best_crop,
            "confidence": ai_result.crop_recommendation.confidence,
            "soilHealthScore": ai_result.soil_health.overall_score,
            "healthRating": ai_result.soil_health.rating,
            "isAnomalyDetected": ai_result.anomaly_detection.is_anomaly
        }
        
        req = urllib.request.Request(
            blockchain_url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        
        with urllib.request.urlopen(req, timeout=30) as resp:
            blockchain_result = json.loads(resp.read().decode("utf-8"))
            logger.info(f"   ✅ Pushed to blockchain: {blockchain_result.get('txHash')}")
            
    except Exception as e:
        logger.warning(f"   ⚠️  Blockchain push failed: {e}")
        # Continue even if blockchain fails
    
    return record_id
```

---

### **Step 6: Restart Services**

```bash
# Terminal 1: Node.js bridge
node server.js

# Terminal 2: AI Service  
cd ai_service
python main.py
```

---

## 🧪 **TESTING**

### **Test 1: Manual Push to Blockchain**

```bash
curl -X POST http://localhost:3000/api/pushDailyInsight \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-10-27",
    "sampleCount": 48,
    "recommendedCrop": "coffee",
    "confidence": 0.985,
    "soilHealthScore": 88.3,
    "healthRating": "EXCELLENT",
    "isAnomalyDetected": false
  }'
```

**Expected:**
```json
{
  "txHash": "0x..."
}
```

---

### **Test 2: Query Daily Insights**

```bash
curl http://localhost:3000/api/getDailyInsights
```

**Expected:**
```json
[
  {
    "id": 0,
    "date": "2025-10-27",
    "sampleCount": 48,
    "recommendedCrop": "coffee",
    "confidence": 98.5,
    "soilHealthScore": 88.3,
    "healthRating": "EXCELLENT",
    "isAnomalyDetected": false,
    "reporter": "0x..."
  }
]
```

---

### **Test 3: End-to-End (Daily Aggregation)**

```bash
# Trigger daily aggregation
curl -X POST http://localhost:8000/api/ai/analyze-daily \
  -H "Content-Type: application/json" \
  -d '{"date":"2025-10-27"}'
```

**Flow:**
1. ✅ AI Service aggregates data
2. ✅ AI runs 4 models
3. ✅ Saves to `daily_insights` table (PostgreSQL)
4. ✅ Pushes to blockchain (via Node.js bridge)
5. ✅ Returns result

---

## 📊 **DATA SEPARATION**

### **2 Types of Blockchain Data:**

#### **1. Raw IoT Data** (storeData)
- Per-reading basis
- 11 sensor parameters
- High frequency (many per day)
- Immutable sensor records

#### **2. Daily AI Insights** (storeDailyInsight)
- 1 record per day
- AI analysis results
- Aggregated summary
- **Knowledge Graph building block**

---

## 🎯 **BENEFITS**

✅ **Separate concerns:** Raw data vs AI insights  
✅ **Gas efficient:** 1 tx/day for insights vs many for raw data  
✅ **Historical analysis:** Query insights by date range  
✅ **Knowledge Graph:** Build long-term dataset  
✅ **Duplicate prevention:** No duplicate dates  
✅ **Queryable:** Multiple query functions  

---

## 📝 **DEPLOYMENT CHECKLIST**

- [ ] Compile contract: `npx hardhat compile`
- [ ] Deploy contract: `npx hardhat run scripts/deploy.js --network pzo`
- [ ] Copy new contract address
- [ ] Update `.env` with new address
- [ ] Update `server.js` (add endpoint)
- [ ] Update `daily_aggregator.py` (push to blockchain)
- [ ] Restart Node.js bridge
- [ ] Restart AI service
- [ ] Test manual push
- [ ] Test query functions
- [ ] Test end-to-end flow

---

## 🚀 **NEXT STEPS**

1. ⏳ Deploy updated contract
2. ⏳ Update Node.js bridge
3. ⏳ Update AI service
4. ⏳ Test daily aggregation → Blockchain
5. ⏳ Verify on Zeroscan explorer

---

**Ready to deploy! Let me know when to continue with Node.js updates.** 🚀

