// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AgroTwinData
 * @dev Smart contract để lưu trữ và xác thực dữ liệu IoT nông nghiệp
 * @notice Lưu trữ: Sensor Readings, AI Analysis, Daily Insights
 * @notice Tương thích với database schema: sensor_readings, ai_analysis, daily_insights
 */
contract AgroTwinData {
    // ==================== STRUCTS ====================
    
    /**
     * @dev Sensor Reading Record - Dữ liệu cảm biến real-time
     * Tương thích với bảng sensor_readings
     */
    struct SensorReading {
        uint256 id;                      // ID từ database
        uint256 measuredAtVN;            // Unix timestamp (measured_at_vn)
        uint256 soilTemperatureC;        // soil_temperature_c * 10 (27.1°C => 271)
        uint256 soilMoisturePct;         // soil_moisture_pct * 10 (45.5% => 455)
        uint256 conductivity;            // conductivity_us_cm (µS/cm)
        uint256 phValue;                 // ph_value * 10 (6.5 => 65)
        uint256 nitrogen;                // nitrogen_mg_kg (mg/kg)
        uint256 phosphorus;              // phosphorus_mg_kg (mg/kg)
        uint256 potassium;               // potassium_mg_kg (mg/kg)
        uint256 salt;                    // salt_mg_l (mg/L)
        uint256 airTemperatureC;         // air_temperature_c * 10
        uint256 airHumidityPct;          // air_humidity_pct * 10
        bool isRaining;                  // is_raining
        bytes32 dataHash;                // Hash để verify tính toàn vẹn
        address reporter;                // Địa chỉ ghi dữ liệu
        uint256 recordedAt;              // Thời điểm ghi lên blockchain
    }

    /**
     * @dev Daily Insight Record - Tri thức tổng hợp theo ngày
     * Aligned with SoilDataStore.sol for compatibility
     * @notice Simplified struct focusing on AI analysis results
     */
    struct DailyInsight {
        uint256 id;                      // ID từ database
        uint256 dateTimestamp;           // Unix timestamp for date (YYYY-MM-DD 00:00:00)
        uint256 sampleCount;             // Number of readings that day
        string recommendedCrop;          // AI crop recommendation
        uint256 confidence;              // Confidence × 100 (98.5% → 9850)
        uint256 soilHealthScore;         // Score × 10 (0-1000)
        uint8 healthRating;              // 0=POOR, 1=FAIR, 2=GOOD, 3=EXCELLENT
        bool isAnomalyDetected;          // Anomaly flag
        string recommendations;          // JSON: [{"priority":"HIGH","message":"..."}]
        bytes32 recordHash;              // Hash của record
        address reporter;
        uint256 recordedAt;              // Blockchain timestamp
    }

    /**
     * @dev AI Analysis Record - Kết quả phân tích AI
     * Tương thích với bảng ai_analysis
     */
    struct AIAnalysis {
        uint256 id;                      // ID từ database
        uint256 sensorReadingId;         // Liên kết với sensor_reading
        string analysisType;             // on-demand/auto-daily/manual
        string analysisMode;             // discovery/validation
        string userCrop;                 // Cây trồng (nếu có)
        uint256 analyzedAtVN;            // Unix timestamp
        uint256 confidenceAvg;           // * 100 (0.85 => 85)
        uint256 processingTimeMs;        // Thời gian xử lý (ms)
        bytes32 dataHash;                // Hash kết quả AI
        address reporter;
        uint256 recordedAt;
    }

    /**
     * @dev Blockchain Log Entry
     */
    struct BlockchainLog {
        string dataType;                 // sensor_reading/daily_insight/ai_analysis
        uint256 dataId;                  // ID của data
        bytes32 dataHash;                // Hash của data
        uint256 timestamp;               // Thời điểm ghi
        address uploader;                // Người upload
    }
    
    
    // ==================== STORAGE ====================
    
    // Mappings cho sensor readings
    mapping(uint256 => SensorReading) public sensorReadings;
    mapping(bytes32 => bool) public sensorHashExists;
    uint256[] public sensorReadingIds;
    
    // Mappings cho daily insights
    mapping(uint256 => DailyInsight) public dailyInsights;
    mapping(uint256 => bool) public dateExists; // dateTimestamp => exists
    uint256[] public dailyInsightIds;
    
    // Mappings cho AI analysis
    mapping(uint256 => AIAnalysis) public aiAnalyses;
    uint256[] public aiAnalysisIds;
    
    // Blockchain logs
    BlockchainLog[] public blockchainLogs;
    
    // Admin
    address public admin;
    
    // Counters
    uint256 public totalSensorReadings;
    uint256 public totalDailyInsights;
    uint256 public totalAIAnalyses;
    
    
    // ==================== EVENTS ====================
    
    event SensorReadingStored(
        uint256 indexed id,
        uint256 indexed measuredAtVN,
        bytes32 dataHash,
        address indexed reporter
    );
    
    event DailyInsightStored(
        uint256 indexed id,
        uint256 indexed dateTimestamp,
        string recommendedCrop,
        uint256 soilHealthScore,
        bool isAnomalyDetected,
        bytes32 recordHash,
        address indexed reporter
    );
    
    event AIAnalysisStored(
        uint256 indexed id,
        uint256 indexed sensorReadingId,
        string analysisType,
        bytes32 dataHash,
        address indexed reporter
    );
    
    event DataVerified(
        string dataType,
        uint256 dataId,
        bytes32 dataHash,
        bool exists
    );
    
    // ==================== MODIFIERS ====================
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    
    // ==================== CONSTRUCTOR ====================
    
    constructor() {
        admin = msg.sender;
    }
    
    // ==================== SENSOR READING FUNCTIONS ====================
    
    /**
     * @dev Ghi dữ liệu cảm biến lên blockchain
     * @notice Được gọi từ backend sau khi lưu vào database
     */
    function storeSensorReading(
        uint256 _id,
        uint256 _measuredAtVN,
        uint256 _soilTemperatureC,
        uint256 _soilMoisturePct,
        uint256 _conductivity,
        uint256 _phValue,
        uint256 _nitrogen,
        uint256 _phosphorus,
        uint256 _potassium,
        uint256 _salt,
        uint256 _airTemperatureC,
        uint256 _airHumidityPct,
        bool _isRaining,
        bytes32 _dataHash
    ) external returns (bool) {
        require(!sensorHashExists[_dataHash], "Data already recorded");
        require(_id > 0, "Invalid ID");
        
        sensorReadings[_id] = SensorReading({
            id: _id,
            measuredAtVN: _measuredAtVN,
            soilTemperatureC: _soilTemperatureC,
            soilMoisturePct: _soilMoisturePct,
            conductivity: _conductivity,
            phValue: _phValue,
            nitrogen: _nitrogen,
            phosphorus: _phosphorus,
            potassium: _potassium,
            salt: _salt,
            airTemperatureC: _airTemperatureC,
            airHumidityPct: _airHumidityPct,
            isRaining: _isRaining,
            dataHash: _dataHash,
            reporter: msg.sender,
            recordedAt: block.timestamp
        });
        
        sensorHashExists[_dataHash] = true;
        sensorReadingIds.push(_id);
        totalSensorReadings++;
        
        blockchainLogs.push(BlockchainLog({
            dataType: "sensor_reading",
            dataId: _id,
            dataHash: _dataHash,
            timestamp: block.timestamp,
            uploader: msg.sender
        }));
        
        emit SensorReadingStored(_id, _measuredAtVN, _dataHash, msg.sender);
        
        return true;
    }
    
    /**
     * @dev Lấy thông tin sensor reading theo ID
     */
    function getSensorReading(uint256 _id) external view returns (SensorReading memory) {
        require(sensorReadings[_id].id != 0, "Record not found");
        return sensorReadings[_id];
    }
    
    /**
     * @dev Verify sensor reading bằng hash
     */
    function verifySensorReading(bytes32 _dataHash) external returns (bool) {
        bool exists = sensorHashExists[_dataHash];
        
        emit DataVerified("sensor_reading", 0, _dataHash, exists);
        
        return exists;
    }
    
    /**
     * @dev Lấy sensor readings theo khoảng thời gian
     */
    function getSensorReadingsByTimeRange(
        uint256 _startTime,
        uint256 _endTime
    ) external view returns (uint256[] memory) {
        uint256 count = 0;
        
        for (uint256 i = 0; i < sensorReadingIds.length; i++) {
            uint256 recordId = sensorReadingIds[i];
            if (sensorReadings[recordId].measuredAtVN >= _startTime &&
                sensorReadings[recordId].measuredAtVN <= _endTime) {
                count++;
            }
        }
        
        uint256[] memory result = new uint256[](count);
        uint256 idx = 0;
        
        for (uint256 i = 0; i < sensorReadingIds.length; i++) {
            uint256 recordId = sensorReadingIds[i];
            if (sensorReadings[recordId].measuredAtVN >= _startTime &&
                sensorReadings[recordId].measuredAtVN <= _endTime) {
                result[idx] = recordId;
                idx++;
            }
        }
        
        return result;
    }
    
    /**
     * @dev Lấy N sensor readings gần nhất
     */
    function getLatestSensorReadings(uint256 _count) external view returns (uint256[] memory) {
        uint256 length = sensorReadingIds.length;
        if (_count > length) {
            _count = length;
        }
        
        uint256[] memory result = new uint256[](_count);
        for (uint256 i = 0; i < _count; i++) {
            result[i] = sensorReadingIds[length - 1 - i];
        }
        
        return result;
    }
    
    
    // ==================== DAILY INSIGHT FUNCTIONS ====================
    
    /**
     * @dev Ghi daily insight lên blockchain
     * @notice Aligned with SoilDataStore schema
     */
    function storeDailyInsight(
        uint256 _id,
        uint256 _dateTimestamp,
        uint256 _sampleCount,
        string memory _recommendedCrop,
        uint256 _confidence,
        uint256 _soilHealthScore,
        uint8 _healthRating,
        bool _isAnomalyDetected,
        string memory _recommendations,
        bytes32 _recordHash
    ) external returns (bool) {
        require(_id > 0, "Invalid ID");
        require(_healthRating <= 3, "Invalid health rating (0-3)");
        require(!dateExists[_dateTimestamp], "Data for this date already exists");
        
        dailyInsights[_id] = DailyInsight({
            id: _id,
            dateTimestamp: _dateTimestamp,
            sampleCount: _sampleCount,
            recommendedCrop: _recommendedCrop,
            confidence: _confidence,
            soilHealthScore: _soilHealthScore,
            healthRating: _healthRating,
            isAnomalyDetected: _isAnomalyDetected,
            recommendations: _recommendations,
            recordHash: _recordHash,
            reporter: msg.sender,
            recordedAt: block.timestamp
        });
        
        dateExists[_dateTimestamp] = true;
        dailyInsightIds.push(_id);
        totalDailyInsights++;
        
        blockchainLogs.push(BlockchainLog({
            dataType: "daily_insight",
            dataId: _id,
            dataHash: _recordHash,
            timestamp: block.timestamp,
            uploader: msg.sender
        }));
        
        emit DailyInsightStored(
            _id,
            _dateTimestamp,
            _recommendedCrop,
            _soilHealthScore,
            _isAnomalyDetected,
            _recordHash,
            msg.sender
        );
        
        return true;
    }
    
    /**
     * @dev Lấy daily insight theo ID
     */
    function getDailyInsight(uint256 _id) external view returns (DailyInsight memory) {
        require(dailyInsights[_id].id != 0, "Record not found");
        return dailyInsights[_id];
    }
    
    /**
     * @dev Lấy daily insight theo date
     */
    function getDailyInsightByDate(uint256 _dateTimestamp) external view returns (DailyInsight memory) {
        require(dateExists[_dateTimestamp], "No data for this date");
        
        for (uint256 i = 0; i < dailyInsightIds.length; i++) {
            uint256 insightId = dailyInsightIds[i];
            if (dailyInsights[insightId].dateTimestamp == _dateTimestamp) {
                return dailyInsights[insightId];
            }
        }
        
        revert("Date not found");
    }
    
    /**
     * @dev Lấy N daily insights gần nhất
     */
    function getLatestDailyInsights(uint256 _count) external view returns (uint256[] memory) {
        uint256 length = dailyInsightIds.length;
        if (_count > length) {
            _count = length;
        }
        
        uint256[] memory result = new uint256[](_count);
        for (uint256 i = 0; i < _count; i++) {
            result[i] = dailyInsightIds[length - 1 - i];
        }
        
        return result;
    }
    
    
    // ==================== AI ANALYSIS FUNCTIONS ====================
    
    /**
     * @dev Ghi AI analysis lên blockchain
     */
    function storeAIAnalysis(
        uint256 _id,
        uint256 _sensorReadingId,
        string memory _analysisType,
        string memory _analysisMode,
        string memory _userCrop,
        uint256 _analyzedAtVN,
        uint256 _confidenceAvg,
        uint256 _processingTimeMs,
        bytes32 _dataHash
    ) external returns (bool) {
        require(_id > 0, "Invalid ID");
        require(sensorReadings[_sensorReadingId].id != 0, "Sensor reading not found");
        
        aiAnalyses[_id] = AIAnalysis({
            id: _id,
            sensorReadingId: _sensorReadingId,
            analysisType: _analysisType,
            analysisMode: _analysisMode,
            userCrop: _userCrop,
            analyzedAtVN: _analyzedAtVN,
            confidenceAvg: _confidenceAvg,
            processingTimeMs: _processingTimeMs,
            dataHash: _dataHash,
            reporter: msg.sender,
            recordedAt: block.timestamp
        });
        
        aiAnalysisIds.push(_id);
        totalAIAnalyses++;
        
        blockchainLogs.push(BlockchainLog({
            dataType: "ai_analysis",
            dataId: _id,
            dataHash: _dataHash,
            timestamp: block.timestamp,
            uploader: msg.sender
        }));
        
        emit AIAnalysisStored(_id, _sensorReadingId, _analysisType, _dataHash, msg.sender);
        
        return true;
    }
    
    /**
     * @dev Lấy AI analysis theo ID
     */
    function getAIAnalysis(uint256 _id) external view returns (AIAnalysis memory) {
        require(aiAnalyses[_id].id != 0, "Record not found");
        return aiAnalyses[_id];
    }
    
    /**
     * @dev Lấy AI analyses theo sensor reading ID
     */
    function getAIAnalysesBySensorReading(uint256 _sensorReadingId) external view returns (uint256[] memory) {
        uint256 count = 0;
        
        for (uint256 i = 0; i < aiAnalysisIds.length; i++) {
            if (aiAnalyses[aiAnalysisIds[i]].sensorReadingId == _sensorReadingId) {
                count++;
            }
        }
        
        uint256[] memory result = new uint256[](count);
        uint256 idx = 0;
        
        for (uint256 i = 0; i < aiAnalysisIds.length; i++) {
            if (aiAnalyses[aiAnalysisIds[i]].sensorReadingId == _sensorReadingId) {
                result[idx] = aiAnalysisIds[i];
                idx++;
            }
        }
        
        return result;
    }
    
    /**
     * @dev Lấy N AI analyses gần nhất
     */
    function getLatestAIAnalyses(uint256 _count) external view returns (uint256[] memory) {
        uint256 length = aiAnalysisIds.length;
        if (_count > length) {
            _count = length;
        }
        
        uint256[] memory result = new uint256[](_count);
        for (uint256 i = 0; i < _count; i++) {
            result[i] = aiAnalysisIds[length - 1 - i];
        }
        
        return result;
    }
    
    
    // ==================== QUERY FUNCTIONS ====================
    
    /**
     * @dev Lấy tổng số blockchain logs
     */
    function getTotalLogs() external view returns (uint256) {
        return blockchainLogs.length;
    }
    
    /**
     * @dev Lấy blockchain logs theo khoảng thời gian
     */
    function getLogsByTimeRange(
        uint256 _startTime,
        uint256 _endTime
    ) external view returns (BlockchainLog[] memory) {
        uint256 count = 0;
        
        for (uint256 i = 0; i < blockchainLogs.length; i++) {
            if (blockchainLogs[i].timestamp >= _startTime &&
                blockchainLogs[i].timestamp <= _endTime) {
                count++;
            }
        }
        
        BlockchainLog[] memory result = new BlockchainLog[](count);
        uint256 idx = 0;
        
        for (uint256 i = 0; i < blockchainLogs.length; i++) {
            if (blockchainLogs[i].timestamp >= _startTime &&
                blockchainLogs[i].timestamp <= _endTime) {
                result[idx] = blockchainLogs[i];
                idx++;
            }
        }
        
        return result;
    }
    
    /**
     * @dev Lấy N logs gần nhất
     */
    function getLatestLogs(uint256 _count) external view returns (BlockchainLog[] memory) {
        uint256 length = blockchainLogs.length;
        if (_count > length) {
            _count = length;
        }
        
        BlockchainLog[] memory result = new BlockchainLog[](_count);
        for (uint256 i = 0; i < _count; i++) {
            result[i] = blockchainLogs[length - 1 - i];
        }
        
        return result;
    }
    
    
    // ==================== ADMIN FUNCTIONS ====================
    
    /**
     * @dev Chuyển quyền admin
     */
    function transferAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "Invalid address");
        admin = _newAdmin;
    }
}
 
