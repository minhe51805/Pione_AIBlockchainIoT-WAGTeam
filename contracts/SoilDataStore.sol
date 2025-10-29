// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SoilDataStore {
    // Lưu dữ liệu cảm biến đất + khí tượng (11 trường)
    // Quy ước scaling:
    // - measuredAtVN: Unix epoch seconds (VN time)
    // - soilTemperature: Soil temp °C × 10 (24.5°C → 245)
    // - soilMoisture: Soil moisture % × 10 (45.2% → 452)
    // - conductivity: EC µS/cm (1250)
    // - phValue: pH × 10 (6.8 → 68)
    // - nitrogen: N mg/kg (45)
    // - phosphorus: P mg/kg (30)
    // - potassium: K mg/kg (180)
    // - salt: Salinity mg/L (850)
    // - airTemperature: Air temp °C × 10 (27.1°C → 271)
    // - airHumidity: Air humidity % × 10 (65.0% → 650)
    // - isRaining: 0 = không mưa, 1 = đang mưa
    struct SoilData {
        uint256 measuredAtVN;
        // SOIL PARAMETERS (8)
        uint256 soilTemperature;
        uint256 soilMoisture;
        uint256 conductivity;
        uint256 phValue;
        uint256 nitrogen;
        uint256 phosphorus;
        uint256 potassium;
        uint256 salt;
        // AIR/WEATHER PARAMETERS (3)
        uint256 airTemperature;
        uint256 airHumidity;
        uint256 isRaining;
        address reporter;
    }

    SoilData[] public records;

    // ============================================================
    // DAILY AI INSIGHTS (Aggregated daily analysis)
    // ============================================================
    
    // Quy ước scaling cho AI insights:
    // - dateTimestamp: Unix epoch cho YYYY-MM-DD 00:00:00 VN time
    // - sampleCount: Số lượng readings trong ngày
    // - recommendedCrop: String tên cây trồng (e.g., "coffee")
    // - confidence: Confidence % × 100 (98.5% → 9850)
    // - soilHealthScore: Score × 10 (88.3 → 883)
    // - healthRating: 0=POOR, 1=FAIR, 2=GOOD, 3=EXCELLENT
    // - isAnomalyDetected: 0=false, 1=true
    // - recommendations: JSON string of actionable recommendations
    struct DailyInsight {
        uint256 dateTimestamp;      // Date (YYYY-MM-DD 00:00:00)
        uint256 sampleCount;        // Number of readings that day
        string recommendedCrop;     // AI crop recommendation
        uint256 confidence;         // Confidence × 100
        uint256 soilHealthScore;    // Score × 10 (0-1000)
        uint8 healthRating;         // 0-3 (POOR to EXCELLENT)
        bool isAnomalyDetected;     // Anomaly flag
        string recommendations;     // JSON: [{"priority":"HIGH","message":"..."}]
        address reporter;
    }
    
    DailyInsight[] public dailyInsights;
    
    // Mapping để check duplicate dates
    mapping(uint256 => bool) public dailyInsightExists;

    event DataStored(
        uint256 indexed id,
        uint256 measuredAtVN,
        uint256 soilTemperature,
        uint256 soilMoisture,
        uint256 conductivity,
        uint256 phValue,
        uint256 nitrogen,
        uint256 phosphorus,
        uint256 potassium,
        uint256 salt,
        uint256 airTemperature,
        uint256 airHumidity,
        uint256 isRaining,
        address reporter
    );

    // Ghi dữ liệu từ DB (đã chuẩn hóa)
    function storeData(
        uint256 _measuredAtVN,
        uint256 _soilTemperature,
        uint256 _soilMoisture,
        uint256 _conductivity,
        uint256 _phValue,
        uint256 _nitrogen,
        uint256 _phosphorus,
        uint256 _potassium,
        uint256 _salt,
        uint256 _airTemperature,
        uint256 _airHumidity,
        uint256 _isRaining
    ) public {
        records.push(
            SoilData({
                measuredAtVN: _measuredAtVN,
                soilTemperature: _soilTemperature,
                soilMoisture: _soilMoisture,
                conductivity: _conductivity,
                phValue: _phValue,
                nitrogen: _nitrogen,
                phosphorus: _phosphorus,
                potassium: _potassium,
                salt: _salt,
                airTemperature: _airTemperature,
                airHumidity: _airHumidity,
                isRaining: _isRaining,
                reporter: msg.sender
            })
        );

        emit DataStored(
            records.length - 1,
            _measuredAtVN,
            _soilTemperature,
            _soilMoisture,
            _conductivity,
            _phValue,
            _nitrogen,
            _phosphorus,
            _potassium,
            _salt,
            _airTemperature,
            _airHumidity,
            _isRaining,
            msg.sender
        );
    }

    // ============================================================
    // DAILY INSIGHTS FUNCTIONS
    // ============================================================
    
    event DailyInsightStored(
        uint256 indexed id,
        uint256 indexed dateTimestamp,
        string recommendedCrop,
        uint256 soilHealthScore,
        bool isAnomalyDetected,
        address reporter
    );
    
    /**
     * @dev Store daily aggregated AI insight
     * @param _dateTimestamp Unix timestamp for date (YYYY-MM-DD 00:00:00 VN time)
     * @param _sampleCount Number of readings that day
     * @param _recommendedCrop AI recommended crop name
     * @param _confidence Confidence × 100 (98.5% → 9850)
     * @param _soilHealthScore Soil health score × 10 (88.3 → 883)
     * @param _healthRating 0=POOR, 1=FAIR, 2=GOOD, 3=EXCELLENT
     * @param _isAnomalyDetected Whether anomaly was detected
     * @param _recommendations JSON string of recommendations
     */
    function storeDailyInsight(
        uint256 _dateTimestamp,
        uint256 _sampleCount,
        string memory _recommendedCrop,
        uint256 _confidence,
        uint256 _soilHealthScore,
        uint8 _healthRating,
        bool _isAnomalyDetected,
        string memory _recommendations
    ) public {
        require(_healthRating <= 3, "Invalid health rating");
        require(!dailyInsightExists[_dateTimestamp], "Daily insight for this date already exists");
        
        dailyInsights.push(
            DailyInsight({
                dateTimestamp: _dateTimestamp,
                sampleCount: _sampleCount,
                recommendedCrop: _recommendedCrop,
                confidence: _confidence,
                soilHealthScore: _soilHealthScore,
                healthRating: _healthRating,
                isAnomalyDetected: _isAnomalyDetected,
                recommendations: _recommendations,
                reporter: msg.sender
            })
        );
        
        dailyInsightExists[_dateTimestamp] = true;
        
        emit DailyInsightStored(
            dailyInsights.length - 1,
            _dateTimestamp,
            _recommendedCrop,
            _soilHealthScore,
            _isAnomalyDetected,
            msg.sender
        );
    }
    
    /**
     * @dev Get total count of daily insights
     */
    function getDailyInsightCount() public view returns (uint256) {
        return dailyInsights.length;
    }
    
    /**
     * @dev Get daily insight by ID
     */
    function getDailyInsight(uint256 id) public view returns (DailyInsight memory) {
        require(id < dailyInsights.length, "Invalid ID");
        return dailyInsights[id];
    }
    
    /**
     * @dev Get daily insights by date range
     * @param startDate Unix timestamp for start date
     * @param endDate Unix timestamp for end date
     */
    function getDailyInsightsByDateRange(
        uint256 startDate,
        uint256 endDate
    ) public view returns (DailyInsight[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < dailyInsights.length; i++) {
            if (
                dailyInsights[i].dateTimestamp >= startDate &&
                dailyInsights[i].dateTimestamp <= endDate
            ) {
                count++;
            }
        }
        
        DailyInsight[] memory result = new DailyInsight[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < dailyInsights.length; i++) {
            if (
                dailyInsights[i].dateTimestamp >= startDate &&
                dailyInsights[i].dateTimestamp <= endDate
            ) {
                result[idx] = dailyInsights[i];
                idx++;
            }
        }
        return result;
    }
    
    /**
     * @dev Get latest daily insight
     */
    function getLatestDailyInsight() public view returns (DailyInsight memory) {
        require(dailyInsights.length > 0, "No daily insights available");
        return dailyInsights[dailyInsights.length - 1];
    }

    // ============================================================
    // RAW DATA FUNCTIONS (existing)
    // ============================================================
    
    // Total count
    function getCount() public view returns (uint256) {
        return records.length;
    }

    // Get record by ID
    function getRecord(uint256 id) public view returns (SoilData memory) {
        require(id < records.length, "Invalid ID");
        return records[id];
    }

    // Query by time range (lọc theo measuredAtVN)
    function getRecordsByTimeRange(
        uint256 startTime,
        uint256 endTime
    ) public view returns (SoilData[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < records.length; i++) {
            if (
                records[i].measuredAtVN >= startTime &&
                records[i].measuredAtVN <= endTime
            ) {
                count++;
            }
        }

        SoilData[] memory result = new SoilData[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < records.length; i++) {
            if (
                records[i].measuredAtVN >= startTime &&
                records[i].measuredAtVN <= endTime
            ) {
                result[idx] = records[i];
                idx++;
            }
        }
        return result;
    }
}
