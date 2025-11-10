# 🔧 Technical Details & API Documentation

## API Endpoints

### Data Ingest API

#### `POST /api/data` - Receive Sensor Data
**Purpose:** IoT devices send 11 sensor parameters
```json
{
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
  "timestamp": "2025-10-27T10:30:00Z"
}
```
**Response:** `{status: "success", measured_at_vn: "...", bridge: {...}}`

#### `GET /api/latest` - Latest Reading
**Response:** Latest sensor reading with all 11 parameters + blockchain status

#### `GET /api/history?limit=100` - Historical Data
**Response:** Array of sensor readings (max 1000)

---

## Authentication API

### Passkey Registration
**Endpoint:** `POST /api/auth/register-passkey`
```json
{
  "full_name": "Nguyen Van A",
  "phone": "0912345678",
  "email": "optional@email.com",
  "farm_name": "Nong trai Van A",
  "farm_location_lat": 10.762622,
  "farm_location_lon": 106.660172,
  "farm_area_hectares": 2.5,
  "current_crop": "coffee",
  "passkey_credential_id": "ABC123...",
  "passkey_public_key": "MII...",
  "passkey_transports": ["internal", "hybrid"]
}
```
**Returns:** `{success: true, user_id: 1, wallet_address: "0x..."}`

### Passkey Login
**Endpoint:** `POST /api/auth/login-passkey`
```json
{
  "phone": "0912345678",
  "passkey_credential_id": "ABC123...",
  "passkey_assertion": "..."
}
```

### PIN Authentication
**Endpoint:** `POST /api/auth/login-pin`
```json
{
  "phone": "0912345678",
  "pin_hash": "bcrypt_hash"
}
```

### Zalo Account Linking
**Endpoint:** `POST /api/auth/zalo/link-account`
```json
{
  "token": "abc123xyz...",
  "user_id": 1
}
```

---

## AI Chat API

### `POST /api/ai/chat` - AI Analysis
**Request:**
```json
{
  "message": "Nhiệt độ + NPK ổn không?"
}
```
**Response:** AI analysis using Gemini or rule-based fallback

**Features:**
- Real-time database queries
- Gemini AI with retry logic (3 attempts)
- Rule-based fallback if Gemini unavailable
- Vietnamese language support
- Crop recommendations based on conditions

---

## Dashboard API

### `GET /api/dashboard/overview` - Statistics
**Response:**
```json
{
  "success": true,
  "stats": {
    "avg_soil_health": 85.5,
    "total_iot_records": 1250,
    "verified_daily_insights": 30,
    "total_daily_insights": 30,
    "anomalies_detected": 2
  },
  "period": "last_30_days"
}
```

### `GET /api/dashboard/realtime-iot?hours=24` - Real-time Data
**Response:** Latest reading + 24-hour trend

### `GET /api/dashboard/ai-history?days=30` - AI Insights
**Response:** Daily AI insights for last N days

---

## Database Schema

### `sensor_readings` Table
```sql
- id (PK)
- measured_at_vn (timestamp)
- soil_temperature_c, soil_moisture_pct
- conductivity_us_cm, ph_value
- nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg
- salt_mg_l
- air_temperature_c, air_humidity_pct
- is_raining (boolean)
- onchain_status (pending/confirmed)
- created_at_vn (timestamp)
```

### `daily_insights` Table
```sql
- id (PK)
- date_vn (date)
- recommended_crop (string)
- crop_confidence (0-100)
- soil_health_score (0-100)
- soil_health_rating (POOR/FAIR/GOOD/EXCELLENT)
- has_anomaly (boolean)
- blockchain_status (pending/confirmed)
- blockchain_tx_hash (string)
- recommendations_json (JSON)
- total_readings (int)
```

### `users` Table
```sql
- id (PK)
- phone (unique)
- full_name, email
- farm_name, farm_location_lat, farm_location_lon
- farm_area_hectares, current_crop
- passkey_credential_id, passkey_public_key
- pin_hash (bcrypt)
- wallet_address (deterministic from credential)
- zalo_chat_id (optional)
- created_at_vn, updated_at_vn
```

---

## Smart Contract Functions

### Store Sensor Reading
```solidity
storeSensorReading(
  uint256 _id,
  uint256 _measuredAtVN,
  uint256 _soilTemperature,    // °C × 10
  uint256 _soilMoisture,       // % × 10
  uint256 _conductivity,
  uint256 _phValue,            // × 10
  uint256 _nitrogen,
  uint256 _phosphorus,
  uint256 _potassium,
  uint256 _salt,
  uint256 _airTemperature,     // °C × 10
  uint256 _airHumidity,        // % × 10
  bool _isRaining,
  bytes32 _dataHash
)
```

### Store Daily Insight
```solidity
storeDailyInsight(
  uint256 _id,
  uint256 _dateTimestamp,
  uint256 _sampleCount,
  string memory _recommendedCrop,
  uint256 _confidence,         // % × 100
  uint256 _soilHealthScore,    // × 10
  uint8 _healthRating,         // 0-3
  bool _isAnomalyDetected,
  string memory _recommendations,
  bytes32 _recordHash
)
```

---

## AI Service Architecture

### Models (4 ML Models)
1. **Crop Recommendation** - Predicts best crop
2. **Soil Health** - Scores soil condition (0-100)
3. **Anomaly Detection** - Identifies unusual patterns
4. **Nutrient Analysis** - NPK recommendations

### Inference Pipeline
1. Receive sensor data
2. Normalize values
3. Run through 4 models
4. Aggregate results
5. Generate recommendations

### Daily Aggregation
- Collects all readings for a day
- Runs AI analysis
- Generates daily insight
- Pushes to blockchain
- Stores in database

---

## Authentication Flow

### Passkey (WebAuthn)
1. User registers with biometric/PIN
2. Credential ID + public key stored
3. On login: challenge-response verification
4. Deterministic wallet generated from credential

### PIN-based
1. User sets PIN (bcrypt hashed)
2. On login: hash provided PIN
3. Compare with stored hash

### Zalo Integration
1. n8n sends Zalo message with link
2. User clicks link → web sign-in
3. User confirms linking
4. Token validated (5-min expiry)
5. Zalo ID linked to user account

---

## Blockchain Flow

### Data Pipeline
1. IoT device → `/api/data`
2. Flask validates & stores in PostgreSQL
3. Callback to Node.js bridge
4. Bridge claims pending record
5. Hashes data
6. Calls smart contract
7. Transaction confirmed on Zeroscan
8. Status updated to "confirmed"

### Verification
- Data hash stored on-chain
- Can verify data integrity
- Public blockchain explorer
- Immutable audit trail

---

## Error Handling

### Gemini AI Fallback
- Retry 3 times with exponential backoff
- If fails: use rule-based AI
- Rule-based: threshold-based analysis
- Always returns valid response

### Database Errors
- Connection pooling
- Automatic reconnect
- Transaction rollback on error
- Detailed error logging

### Blockchain Errors
- Retry mechanism
- Gas estimation
- Timeout handling (30s)
- Status tracking in DB

