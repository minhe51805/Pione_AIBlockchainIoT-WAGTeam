# ✅ RULE-BASED RECOMMENDATIONS - HOÀN THÀNH!

**Ngày hoàn thành:** 2025-10-28  
**Tính năng:** Khuyến nghị hành động dựa trên AI + Rule-based Engine

---

## 🎯 TÓM TẮT

Đã hoàn thành **RULE-BASED RECOMMENDATION ENGINE** với logic thông minh:
- ✅ Crop-specific recommendations (Rice, Coffee, Maize, Cotton, etc.)
- ✅ Multi-factor analysis (xem nhiều parameters cùng lúc)
- ✅ Priority-based scoring (CRITICAL/HIGH/MEDIUM/LOW)
- ✅ Actionable insights với số cụ thể (không emoji)
- ✅ Lưu DB + Blockchain + Hiển thị DApp

---

## 📋 FILES ĐÃ SỬA (7 FILES)

### **1. `ai_service/inference.py`** ✅
- Thêm 250+ lines logic recommendations
- Crop-specific requirements cho 4+ crops (rice, coffee, maize, cotton, default)
- Function `generate_recommendations()` với 10 rule categories:
  1. **Soil Moisture** - Critical priority
  2. **pH Issues** - Affects nutrient absorption
  3. **Nitrogen (N)** - NPK-N deficiency
  4. **Phosphorus (P)** - NPK-P deficiency
  5. **Potassium (K)** - NPK-K deficiency
  6. **Soil Temperature** - For sensitive crops
  7. **Soil Health Rating** - Overall assessment
  8. **Anomaly Detection** - Sensor issues
  9. **Salinity (EC/Salt)** - Salt problems
  10. **All Good** - Maintenance mode

**Example logic:**
```python
# Coffee-specific moisture check
if crop == "coffee":
    if moisture < 55:  # Min: 55%, Max: 75%
        return {
            "priority": "HIGH",
            "message": f"Độ ẩm đất thấp ({moisture}%). Cây coffee cần 55-75%. Tưới 30-40mm trong 2-3 ngày."
        }

# pH + Nutrient interaction
if ph < 5.5 and nitrogen < 40:
    return {
        "priority": "CRITICAL",
        "message": f"pH thấp ({ph}) làm giảm hấp thu N. Bổ sung vôi bột 400-500kg/ha TRƯỚC KHI bón phân."
    }
```

---

### **2. `ai_service/schemas.py`** ✅
- Thêm `class Recommendation(BaseModel)`:
  ```python
  class Recommendation(BaseModel):
      priority: str  # CRITICAL, HIGH, MEDIUM, LOW
      message: str
  ```
- Update `AIAnalysisResponse`:
  ```python
  recommendations: List[Recommendation] = []
  ```

---

### **3. `migrations/005_add_recommendations.sql`** ✅
- Thêm column `recommendations TEXT` vào table `daily_insights`
- Lưu dạng JSON array: `[{"priority":"HIGH","message":"..."}]`

---

### **4. `ai_service/daily_aggregator.py`** ✅
- Update INSERT query để include `recommendations`
- Convert recommendations to JSON:
  ```python
  recommendations_json = json.dumps([
      {"priority": rec.priority, "message": rec.message}
      for rec in ai_result.recommendations
  ], ensure_ascii=False)
  ```
- Update `push_to_blockchain()` payload to include recommendations

---

### **5. `contracts/SoilDataStore.sol`** ✅
- Update `struct DailyInsight`:
  ```solidity
  struct DailyInsight {
      uint256 dateTimestamp;
      uint256 sampleCount;
      string recommendedCrop;
      uint256 confidence;
      uint256 soilHealthScore;
      uint8 healthRating;
      bool isAnomalyDetected;
      string recommendations;  // ⬅️ NEW: JSON string
      address reporter;
  }
  ```
- Update `storeDailyInsight()` function signature:
  ```solidity
  function storeDailyInsight(
      ...,
      string memory _recommendations  // ⬅️ NEW parameter
  )
  ```

---

### **6. `server.js`** ✅
- Update `POST /api/pushDailyInsight`:
  ```javascript
  const recommendationsJson = JSON.stringify(recommendations || []);
  
  const tx = await contract.storeDailyInsight(
      ...,
      recommendationsJson  // ⬅️ NEW
  );
  ```
- Update `GET /api/getDailyInsights` & `GET /api/getLatestDailyInsight`:
  ```javascript
  let recommendations = [];
  try {
      recommendations = JSON.parse(r.recommendations || "[]");
  } catch (e) {
      console.warn("Failed to parse recommendations");
  }
  
  insights.push({
      ...,
      recommendations: recommendations  // ⬅️ NEW
  });
  ```

---

### **7. `frontend/index.html` + `frontend/app.js`** ✅

**HTML:**
- Thêm section "Khuyến nghị hành động":
  ```html
  <div id="recommendationsSection">
      <h5>Khuyến nghị hành động</h5>
      <div id="recommendationsList"></div>
  </div>
  ```
- CSS cho priority badges (CRITICAL/HIGH/MEDIUM/LOW)

**JavaScript:**
```javascript
if (analysis.recommendations && analysis.recommendations.length > 0) {
    const recsHtml = analysis.recommendations.map(rec => {
        return `
            <div class="recommendation-item ${rec.priority}">
                <span class="priority-badge ${rec.priority}">${rec.priority}</span>
                <span>${rec.message}</span>
            </div>
        `;
    }).join('');
    
    recommendationsList.innerHTML = recsHtml;
    recommendationsSection.style.display = 'block';
}
```

---

## 📊 OUTPUT MẪU

### **AI Analysis Response:**
```json
{
  "crop_recommendation": {
    "best_crop": "coffee",
    "confidence": 0.985
  },
  "soil_health": {
    "overall_score": 65.3,
    "rating": "FAIR"
  },
  "recommendations": [
    {
      "priority": "HIGH",
      "message": "Độ ẩm đất thấp (45.2%). Cây coffee cần 55-75%. Tưới 30-40mm trong 2-3 ngày."
    },
    {
      "priority": "CRITICAL",
      "message": "pH thấp (5.2) làm giảm hấp thu dinh dưỡng. Bổ sung vôi bột 400-500kg/ha TRƯỚC KHI bón phân. Chờ 2 tuần sau đó bón phân."
    },
    {
      "priority": "HIGH",
      "message": "Thiếu Nitrogen (22 mg/kg). Cây coffee cần 35-80 mg/kg. Bón Urê 150-200kg/ha."
    },
    {
      "priority": "MEDIUM",
      "message": "Chất lượng đất trung bình (65.3/100). Bổ sung phân hữu cơ 2-3 tấn/ha, cải thiện cấu trúc đất."
    }
  ]
}
```

### **Database (daily_insights):**
```sql
SELECT date_vn, ai_crop_recommendation, recommendations 
FROM daily_insights 
WHERE date_vn = '2025-10-27';

-- Result:
date_vn     | ai_crop_recommendation | recommendations
------------|------------------------|----------------
2025-10-27  | coffee                 | [{"priority":"HIGH","message":"Độ ẩm đất thấp..."},...]
```

### **Blockchain:**
```javascript
// GET /api/getLatestDailyInsight
{
  "date": "2025-10-27 07:00:00",
  "recommendedCrop": "coffee",
  "soilHealthScore": 65.3,
  "recommendations": [
    {"priority":"HIGH","message":"Độ ẩm đất thấp..."},
    {"priority":"CRITICAL","message":"pH thấp..."}
  ]
}
```

### **Frontend DApp:**
```
┌─────────────────────────────────────┐
│ 💡 Khuyến nghị hành động            │
├─────────────────────────────────────┤
│ [CRITICAL] pH thấp (5.2) làm giảm   │
│            hấp thu dinh dưỡng...    │
│                                     │
│ [HIGH]     Độ ẩm đất thấp (45.2%)...│
│                                     │
│ [HIGH]     Thiếu Nitrogen (22 mg/kg)│
│                                     │
│ [MEDIUM]   Chất lượng đất trung bình│
└─────────────────────────────────────┘
```

---

## 🚀 DEPLOYMENT STEPS

### **Step 1: Run DB Migration**
```bash
psql -h 36.50.134.107 -p 6000 -U admin -d db_iot_sensor -f migrations/005_add_recommendations.sql
```

### **Step 2: Deploy Smart Contract**
```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network pzo

# Update .env
CONTRACT_ADDRESS=0x<NEW_ADDRESS>
```

### **Step 3: Restart Services**
```bash
# Terminal 1: Node.js Bridge
node server.js

# Terminal 2: AI Service
cd ai_service
python main.py

# Terminal 3: Flask (optional)
python app_ingest.py
```

### **Step 4: Test**
```bash
# POST request
curl -X POST http://localhost:8000/api/ai/analyze-daily \
  -H "Content-Type: application/json" \
  -d '{"date": "2025-10-27"}'

# Check DB
psql -c "SELECT recommendations FROM daily_insights WHERE date_vn='2025-10-27';"

# Check Blockchain
curl http://localhost:3000/api/getLatestDailyInsight
```

---

## 🎯 KEY FEATURES

### **1. Crop-Specific Logic**
- Mỗi loại cây có requirements riêng:
  - **Coffee:** moisture 55-75%, pH 5.5-6.5, temp 18-28°C
  - **Rice:** moisture 70-90%, pH 5.5-7.0 (flooded conditions)
  - **Maize:** moisture 60-80%, pH 5.8-7.0 (high N)
  - **Cotton:** moisture 50-70%, pH 6.0-7.5 (alkaline tolerant)

### **2. Multi-Factor Analysis**
- Không chỉ nhìn 1 parameter:
  - pH thấp + Nitrogen thấp → "Bổ sung vôi TRƯỚC, sau 2 tuần bón phân"
  - pH OK + Nitrogen thấp → "Bón Urê ngay"

### **3. Priority Scoring**
- **CRITICAL:** Nguy hiểm, cần xử lý trong 24h
- **HIGH:** Quan trọng, cần xử lý trong 2-3 ngày
- **MEDIUM:** Cải thiện, xử lý trong 1 tuần
- **LOW:** Theo dõi, maintenance

### **4. Numeric Recommendations**
- Không chung chung, có số cụ thể:
  - "Tưới 30-40mm trong 2-3 ngày"
  - "Bón Urê 150-200kg/ha"
  - "Bổ sung vôi bột 400-500kg/ha"

### **5. Interaction Effects**
- Hiểu mối quan hệ giữa parameters:
  - pH ảnh hưởng N/P absorption
  - EC cao ảnh hưởng water uptake
  - Temperature ảnh hưởng nutrient availability

---

## 📝 EXAMPLE SCENARIOS

### **Scenario 1: Đất khô, thiếu nước**
```
Input: moisture=30%, crop=coffee

Output:
  priority: CRITICAL
  message: "Độ ẩm đất rất thấp (30.0%). Coffee needs consistent moisture but good drainage. Tưới ngay 40-50mm trong 24 giờ."
```

### **Scenario 2: pH thấp + thiếu N**
```
Input: ph=5.0, nitrogen=20, crop=coffee

Output:
  priority: CRITICAL
  message: "pH rất thấp (5.0) làm giảm hấp thu dinh dưỡng. Bổ sung vôi bột 400-500kg/ha TRƯỚC KHI bón phân. Chờ 2 tuần sau đó bón phân."
```

### **Scenario 3: Mọi thứ OK**
```
Input: All parameters in optimal range

Output:
  priority: LOW
  message: "Điều kiện đất tốt cho cây coffee. Duy trì chế độ chăm sóc hiện tại, theo dõi định kỳ."
```

---

## ✅ CHECKLIST

- [x] Thêm recommendation logic (inference.py)
- [x] Update schema (schemas.py)
- [x] Create DB migration (005_add_recommendations.sql)
- [x] Update daily_aggregator.py
- [x] Update Smart Contract (SoilDataStore.sol)
- [x] Update server.js
- [x] Update frontend (index.html + app.js)
- [ ] Run migration
- [ ] Deploy contract
- [ ] Restart services
- [ ] Test end-to-end

---

## 🎉 **RULE-BASED ENGINE READY!**

**Điểm mạnh:**
- ✅ Thông minh hơn IF-THEN đơn giản
- ✅ Crop-specific, multi-factor, priority-based
- ✅ Có số cụ thể, actionable
- ✅ Lưu DB + Blockchain + DApp
- ✅ Không cần emoji (professional)
- ✅ Không cần LLM API (tiết kiệm)

**Tiếp theo:**
- Phase 2: Tích hợp LLM (optional) để polish recommendations
- n8n workflow cho daily aggregation
- Blockchain export feature

**SẴN SÀNG TEST!** 🚀

