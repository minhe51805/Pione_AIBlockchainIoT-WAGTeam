# CONTRACT MIGRATION PLAN
## Chuyển từ SoilDataStore.sol → AquaMindData.sol (Updated)

### Changes Needed:

#### 1. DailyInsight Struct
```solidity
// OLD (SoilDataStore.sol)
struct DailyInsight {
    uint256 dateTimestamp;
    uint256 sampleCount;
    string recommendedCrop;
    uint256 confidence;        // × 100
    uint256 soilHealthScore;   // × 10
    uint8 healthRating;        // 0-3 enum
    bool isAnomalyDetected;
    string recommendations;    // JSON string
    address reporter;
}

// NEW (AquaMindData.sol - TO UPDATE)
struct DailyInsight {
    uint256 id;                // NEW: DB reference
    uint256 dateTimestamp;     // RENAME from dateVN
    uint256 sampleCount;       // RENAME from totalReadings
    string recommendedCrop;    // RENAME from userCrop
    uint256 confidence;        // NEW: × 100
    uint256 soilHealthScore;   // KEEP: × 10
    string healthRating;       // CHANGE type from uint8
    bool isAnomalyDetected;    // NEW
    string recommendations;    // NEW: JSON string
    
    // Sensor averages (keep these)
    uint256 soilTemperatureAvg;
    uint256 soilMoistureAvg;
    uint256 conductivityAvg;
    uint256 phAvg;
    uint256 nitrogenAvg;
    uint256 phosphorusAvg;
    uint256 potassiumAvg;
    uint256 saltAvg;
    uint256 airTemperatureAvg;
    uint256 airHumidityAvg;
    
    bytes32 recordHash;
    address reporter;
    uint256 recordedAt;
}
```

#### 2. storeDailyInsight Function
```solidity
// Update signature to match server.js calls
function storeDailyInsight(
    uint256 _dateTimestamp,
    uint256 _sampleCount,
    string memory _recommendedCrop,
    uint256 _confidence,
    uint256 _soilHealthScore,
    string memory _healthRating,
    bool _isAnomalyDetected,
    string memory _recommendations
) external returns (bool)
```

#### 3. Query Functions
```solidity
// Keep these useful functions from AquaMindData:
- getDailyInsight(id)
- getDailyInsightByDate(timestamp)
- getLatestDailyInsights(count)
- getSensorReading(id)
- getLatestSensorReadings(count)
```

### Migration Steps:

1. **Update contract** (Dapp/smartContract/contracts/AquaMindData.sol)
2. **Compile:** `npx hardhat compile`
3. **Deploy:** `npx hardhat run scripts/deploy.js --network pioneZero`
4. **Update .env:** New CONTRACT_ADDRESS
5. **Update server.js:** New ABI + address
6. **Update frontend:** New ABI in abiAquaMind.ts
7. **Test:** Run full pipeline

### Breaking Changes:

- ❌ Old SoilDataStore data will NOT migrate (new contract)
- ✅ Database keeps working (no changes)
- ✅ API keeps working (server.js update only)
- ⚠️ Must update contract address everywhere

