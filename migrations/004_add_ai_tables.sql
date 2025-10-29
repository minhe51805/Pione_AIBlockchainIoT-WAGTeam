-- ============================================================
-- MIGRATION 004: ADD AI MODULE TABLES
-- ============================================================
-- Purpose: Support AI analysis, daily reports, blockchain integration
-- Date: 2025-10-27
-- ============================================================

-- ============================================================
-- TABLE 1: ai_analysis (Real-time AI Analysis)
-- ============================================================
-- Lưu KẾT QUẢ AI cho mỗi lần phân tích (on-demand hoặc tự động)

CREATE TABLE IF NOT EXISTS ai_analysis (
    id SERIAL PRIMARY KEY,
    
    -- Reference to sensor reading
    sensor_reading_id INTEGER REFERENCES sensor_readings(id) ON DELETE CASCADE,
    
    -- Analysis metadata
    analysis_type VARCHAR(50) NOT NULL,  -- 'on-demand', 'auto-daily', 'manual'
    analysis_mode VARCHAR(50) NOT NULL,  -- 'discovery', 'validation'
    analyzed_at_vn TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- User context
    user_crop VARCHAR(50),  -- NULL if discovery mode, e.g., 'coffee' if validation
    
    -- AI Results (JSONB for flexibility)
    crop_recommendation JSONB,  -- {best_crop, confidence, alternatives, reasoning}
    crop_validation JSONB,      -- {suitability_score, verdict, parameter_analysis, recommendations}
    soil_health JSONB,           -- {overall_score, rating, breakdown, issues}
    anomaly_detection JSONB,     -- {is_anomaly, anomalous_features, alerts}
    
    -- Performance metrics
    model_version VARCHAR(20) DEFAULT '1.0',
    confidence_avg REAL,
    processing_time_ms INTEGER,
    
    -- Blockchain integration
    onchain_status VARCHAR(20) DEFAULT 'pending',  -- 'pending', 'sent', 'confirmed', 'failed'
    onchain_tx_hash VARCHAR(66),
    
    -- Timestamps
    created_at_vn TIMESTAMPTZ DEFAULT NOW(),
    updated_at_vn TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_ai_analysis_sensor_reading ON ai_analysis(sensor_reading_id);
CREATE INDEX idx_ai_analysis_analyzed_at ON ai_analysis(analyzed_at_vn DESC);
CREATE INDEX idx_ai_analysis_user_crop ON ai_analysis(user_crop);
CREATE INDEX idx_ai_analysis_onchain_status ON ai_analysis(onchain_status);

-- Comments
COMMENT ON TABLE ai_analysis IS 'Lưu kết quả AI analysis cho mỗi sensor reading (real-time hoặc on-demand)';
COMMENT ON COLUMN ai_analysis.analysis_type IS 'on-demand (user click), auto-daily (scheduled), manual';
COMMENT ON COLUMN ai_analysis.analysis_mode IS 'discovery (recommend crop) hoặc validation (validate existing crop)';
COMMENT ON COLUMN ai_analysis.user_crop IS 'Cây đang trồng (NULL nếu discovery mode)';

-- ============================================================
-- TABLE 2: daily_insights (KNOWLEDGE RECORD - 1 RECORD/DAY)
-- ============================================================
-- MỤC TIÊU: Tạo "Soil Knowledge Graph" - Mỗi ngày = 1 data point tri thức
-- Sau 5-10 năm = hàng nghìn records → AI học từ data thực tế Việt Nam
-- ============================================================

-- Drop existing table if needed
DROP TABLE IF EXISTS daily_insights CASCADE;

CREATE TABLE daily_insights (
    id SERIAL PRIMARY KEY,
    
    -- ============================================================
    -- DATE & CROP CONTEXT (Knowledge ID)
    -- ============================================================
    date_vn DATE NOT NULL UNIQUE,
    user_crop VARCHAR(50),              -- Cây đang trồng: 'coffee', 'rice', etc.
    location_lat REAL,                  -- GPS location (optional, for future)
    location_lon REAL,
    
    -- ============================================================
    -- DAILY AVERAGE SENSOR DATA (1 giá trị/ngày/thông số)
    -- ============================================================
    -- Đây là TRI THỨC: "Ngày X, đất có thông số Y, Z, ..."
    
    total_readings INTEGER NOT NULL DEFAULT 0,
    
    -- Soil parameters (daily average)
    soil_temperature_avg REAL NOT NULL,     -- °C
    soil_moisture_avg REAL NOT NULL,        -- %
    conductivity_avg REAL NOT NULL,         -- µS/cm (EC)
    ph_avg REAL NOT NULL,                   -- pH
    nitrogen_avg REAL NOT NULL,             -- mg/kg
    phosphorus_avg REAL NOT NULL,           -- mg/kg
    potassium_avg REAL NOT NULL,            -- mg/kg
    salt_avg REAL NOT NULL,                 -- mg/L
    
    -- Weather parameters (daily average)
    air_temperature_avg REAL NOT NULL,      -- °C
    air_humidity_avg REAL NOT NULL,         -- %
    rain_hours INTEGER DEFAULT 0,           -- Số giờ mưa
    rain_percentage REAL,                   -- % thời gian mưa
    
    -- ============================================================
    -- AI EVALUATION (Đánh giá của AI cho ngày này)
    -- ============================================================
    -- Đây là NHÃN (label) cho machine learning sau này
    
    -- Crop suitability
    crop_suitability_score REAL,            -- 0-100: Độ phù hợp với cây đang trồng
    crop_suitability_rating VARCHAR(20),    -- 'EXCELLENT', 'GOOD', 'FAIR', 'POOR'
    
    -- Soil health  
    soil_health_score REAL NOT NULL,        -- 0-100: Điểm sức khỏe đất
    soil_health_rating VARCHAR(20) NOT NULL, -- 'EXCELLENT', 'GOOD', 'FAIR', 'POOR'
    
    -- NPK balance
    npk_balance_score REAL,                 -- 0-100: Độ cân bằng NPK
    npk_status VARCHAR(20),                 -- 'balanced', 'n_deficient', 'p_deficient', 'k_deficient'
    
    -- Anomaly flag
    has_anomaly BOOLEAN DEFAULT FALSE,
    anomaly_type VARCHAR(50),               -- 'salinity_spike', 'nutrient_drop', etc.
    
    -- ============================================================
    -- SUMMARY FOR USER (Human-readable)
    -- ============================================================
    
    summary_status VARCHAR(20) NOT NULL,    -- Overall: 'EXCELLENT', 'GOOD', 'FAIR', 'POOR'
    summary_text TEXT NOT NULL,             -- "Đất tốt. Cần tưới nước và bón phân K."
    
    key_insights JSONB,                     -- Top 3-5 insights
    priority_actions JSONB,                 -- Top 1-3 actions needed
    
    -- ============================================================
    -- KNOWLEDGE VALUE (Metadata for ML)
    -- ============================================================
    -- Giúp query & filter data sau này
    
    season VARCHAR(20),                     -- 'spring', 'summer', 'fall', 'winter'
    month_of_year INTEGER,                  -- 1-12
    day_of_week INTEGER,                    -- 1-7 (Monday=1)
    
    data_quality_score REAL,                -- 0-1: Chất lượng data (% readings valid)
    confidence_score REAL,                  -- 0-1: AI confidence trong đánh giá
    
    -- ============================================================
    -- BLOCKCHAIN - IMMUTABLE STORAGE
    -- ============================================================
    -- Hash của record này → lưu lên blockchain
    
    record_hash VARCHAR(66),                -- keccak256(toàn bộ record)
    onchain_status VARCHAR(20) DEFAULT 'pending',
    onchain_tx_hash VARCHAR(66),
    onchain_block_number BIGINT,
    confirmed_at_vn TIMESTAMPTZ,
    
    -- ============================================================
    -- METADATA
    -- ============================================================
    
    created_at_vn TIMESTAMPTZ DEFAULT NOW(),
    updated_at_vn TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for querying knowledge base
CREATE INDEX idx_daily_insights_date_desc ON daily_insights(date_vn DESC);
CREATE INDEX idx_daily_insights_user_crop ON daily_insights(user_crop);
CREATE INDEX idx_daily_insights_soil_health ON daily_insights(soil_health_rating);
CREATE INDEX idx_daily_insights_season ON daily_insights(season);
CREATE INDEX idx_daily_insights_onchain_status ON daily_insights(onchain_status);

-- Composite indexes for ML queries
CREATE INDEX idx_daily_insights_crop_health ON daily_insights(user_crop, soil_health_score);
CREATE INDEX idx_daily_insights_crop_season ON daily_insights(user_crop, season);

-- Comments
COMMENT ON TABLE daily_insights IS 'KNOWLEDGE BASE: Mỗi record = 1 ngày tri thức về đất. Sau 5-10 năm = dataset quý giá cho AI học.';
COMMENT ON COLUMN daily_insights.soil_temperature_avg IS 'Trung bình nhiệt độ đất trong ngày (°C)';
COMMENT ON COLUMN daily_insights.crop_suitability_score IS 'Độ phù hợp đất với cây đang trồng (0-100)';
COMMENT ON COLUMN daily_insights.soil_health_score IS 'Điểm sức khỏe đất tổng thể (0-100)';
COMMENT ON COLUMN daily_insights.record_hash IS 'Hash của record để lưu blockchain - đảm bảo immutability';
COMMENT ON COLUMN daily_insights.data_quality_score IS 'Tỷ lệ readings hợp lệ trong ngày (0-1)';

-- ============================================================
-- TABLE 3: ai_recommendations (Detailed Recommendations)
-- ============================================================
-- Lưu CHI TIẾT khuyến nghị từ AI (có thể link với daily_insights hoặc ai_analysis)

CREATE TABLE IF NOT EXISTS ai_recommendations (
    id SERIAL PRIMARY KEY,
    
    -- Links
    daily_insight_id INTEGER REFERENCES daily_insights(id) ON DELETE CASCADE,
    ai_analysis_id INTEGER REFERENCES ai_analysis(id) ON DELETE CASCADE,
    
    -- Recommendation details
    recommendation_type VARCHAR(50) NOT NULL,  -- 'fertilizer', 'irrigation', 'pest_control', 'general'
    priority VARCHAR(20) NOT NULL,             -- 'HIGH', 'MEDIUM', 'LOW'
    
    -- Content
    action TEXT NOT NULL,                      -- "Bón phân kali"
    details TEXT,                              -- "Thêm 40 kg K2O/hecta"
    reasoning TEXT,                            -- "Kali thấp hơn mức lý tưởng cho cà phê"
    
    -- Quantitative (if applicable)
    current_value REAL,                        -- 180 (K hiện tại)
    target_value REAL,                         -- 220 (K mục tiêu)
    deficit REAL,                              -- -40 (thiếu 40)
    unit VARCHAR(20),                          -- 'mg/kg'
    
    -- Timing
    deadline_days INTEGER,                     -- 21 (cần làm trong 21 ngày)
    created_at_vn TIMESTAMPTZ DEFAULT NOW(),
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'pending',      -- 'pending', 'in_progress', 'completed', 'ignored'
    completed_at_vn TIMESTAMPTZ,
    
    -- User feedback
    user_feedback JSONB                        -- {helpful: true, comment: "Đã làm rồi"}
);

-- Indexes
CREATE INDEX idx_ai_recommendations_daily ON ai_recommendations(daily_insight_id);
CREATE INDEX idx_ai_recommendations_priority ON ai_recommendations(priority);
CREATE INDEX idx_ai_recommendations_status ON ai_recommendations(status);

-- Comments
COMMENT ON TABLE ai_recommendations IS 'Chi tiết khuyến nghị từ AI (fertilizer, irrigation, etc.)';
COMMENT ON COLUMN ai_recommendations.deadline_days IS 'Số ngày cần thực hiện (NULL = không khẩn cấp)';

-- ============================================================
-- TABLE 4: blockchain_logs (IMMUTABLE TRANSACTION HISTORY)
-- ============================================================
-- Track TẤT CẢ data lên blockchain - đảm bảo truy xuất nguồn gốc
--
-- MỤC TIÊU: Minh bạch hóa toàn bộ data flow
-- - Sensor data → Blockchain (real-time)
-- - Daily knowledge → Blockchain (end of day)
-- - Ai có thể verify data nguồn gốc từ blockchain
-- ============================================================

CREATE TABLE IF NOT EXISTS blockchain_logs (
    id SERIAL PRIMARY KEY,
    
    -- ============================================================
    -- DATA IDENTIFICATION
    -- ============================================================
    data_type VARCHAR(50) NOT NULL,    -- 'sensor_reading' hoặc 'daily_insight'
    data_id INTEGER NOT NULL,          -- ID của record (sensor_readings.id hoặc daily_insights.id)
    data_date DATE,                    -- Ngày của data (for easy query)
    
    -- ============================================================
    -- TRANSACTION DETAILS
    -- ============================================================
    tx_hash VARCHAR(66) NOT NULL UNIQUE,
    block_number BIGINT,
    contract_address VARCHAR(42) DEFAULT '0x55313657185bd745917a7eD22fe9B827fC1AAC48',
    contract_function VARCHAR(50),     -- 'storeData', 'storeDailyInsight'
    
    -- ============================================================
    -- BLOCKCHAIN STATUS
    -- ============================================================
    status VARCHAR(20) NOT NULL DEFAULT 'pending',  -- 'pending', 'confirmed', 'failed'
    
    -- Gas & Cost (for analytics)
    gas_used BIGINT,
    gas_price BIGINT,
    transaction_fee NUMERIC(30, 18),   -- In ZERO token
    
    -- ============================================================
    -- DATA HASH (Immutability proof)
    -- ============================================================
    data_hash VARCHAR(66),             -- keccak256 của data gốc
    
    -- For daily_insights: Hash của toàn bộ knowledge record
    -- For sensor_readings: Hash của 11 parameters
    
    -- ============================================================
    -- TIMESTAMPS
    -- ============================================================
    sent_at_vn TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    confirmed_at_vn TIMESTAMPTZ,
    
    -- ============================================================
    -- ERROR HANDLING
    -- ============================================================
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    last_retry_at_vn TIMESTAMPTZ,
    
    -- ============================================================
    -- METADATA
    -- ============================================================
    created_at_vn TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookup
CREATE INDEX idx_blockchain_logs_data_type_id ON blockchain_logs(data_type, data_id);
CREATE INDEX idx_blockchain_logs_data_date ON blockchain_logs(data_date DESC);
CREATE INDEX idx_blockchain_logs_tx_hash ON blockchain_logs(tx_hash);
CREATE INDEX idx_blockchain_logs_status ON blockchain_logs(status);
CREATE INDEX idx_blockchain_logs_sent_at ON blockchain_logs(sent_at_vn DESC);

-- Composite index for querying by type + date
CREATE INDEX idx_blockchain_logs_type_date ON blockchain_logs(data_type, data_date DESC);

-- Comments
COMMENT ON TABLE blockchain_logs IS 'Lịch sử IMMUTABLE: Tất cả data lên blockchain. Đảm bảo truy xuất nguồn gốc.';
COMMENT ON COLUMN blockchain_logs.data_type IS 'sensor_reading (real-time) hoặc daily_insight (daily knowledge)';
COMMENT ON COLUMN blockchain_logs.data_hash IS 'Hash của data để verify tính toàn vẹn';
COMMENT ON COLUMN blockchain_logs.contract_function IS 'Smart contract function called';

-- ============================================================
-- sensor_readings TABLE - KHÔNG THAY ĐỔI
-- ============================================================
-- Theo yêu cầu: Giữ nguyên sensor_readings, không thêm column

-- ============================================================
-- VIEWS (Helper views for common queries)
-- ============================================================

-- View: Latest AI analysis per sensor reading
CREATE OR REPLACE VIEW v_latest_ai_analysis AS
SELECT DISTINCT ON (sensor_reading_id)
    sensor_reading_id,
    analysis_type,
    analysis_mode,
    user_crop,
    crop_recommendation,
    crop_validation,
    soil_health,
    anomaly_detection,
    analyzed_at_vn
FROM ai_analysis
ORDER BY sensor_reading_id, analyzed_at_vn DESC;

-- View: Daily insights with summary
CREATE OR REPLACE VIEW v_daily_summary AS
SELECT 
    date_vn,
    user_crop,
    summary_status,
    summary_text,
    soil_health_score,
    crop_suitability_score,
    has_anomaly,
    onchain_status,
    onchain_tx_hash
FROM daily_insights
ORDER BY date_vn DESC;

-- View: Pending blockchain transactions
CREATE OR REPLACE VIEW v_pending_blockchain AS
SELECT 
    data_type,
    data_id,
    tx_hash,
    sent_at_vn,
    retry_count,
    error_message
FROM blockchain_logs
WHERE status = 'pending'
ORDER BY sent_at_vn ASC;

-- ============================================================
-- FUNCTIONS (Helper functions)
-- ============================================================

-- Function: Get daily statistics for a specific date
CREATE OR REPLACE FUNCTION get_daily_stats(target_date DATE)
RETURNS TABLE (
    param VARCHAR,
    avg_value REAL,
    min_value REAL,
    max_value REAL,
    std_value REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'soil_temperature'::VARCHAR,
        AVG(soil_temperature_c)::REAL,
        MIN(soil_temperature_c)::REAL,
        MAX(soil_temperature_c)::REAL,
        STDDEV(soil_temperature_c)::REAL
    FROM sensor_readings
    WHERE measured_at_vn::DATE = target_date
    
    UNION ALL
    
    SELECT 
        'nitrogen'::VARCHAR,
        AVG(nitrogen_mg_kg)::REAL,
        MIN(nitrogen_mg_kg)::REAL,
        MAX(nitrogen_mg_kg)::REAL,
        STDDEV(nitrogen_mg_kg)::REAL
    FROM sensor_readings
    WHERE measured_at_vn::DATE = target_date;
    
    -- Add more parameters as needed...
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TRIGGERS (Auto-update timestamps)
-- ============================================================

-- Trigger: Update updated_at_vn on change
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at_vn = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ai_analysis_updated_at
    BEFORE UPDATE ON ai_analysis
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_insights_updated_at
    BEFORE UPDATE ON daily_insights
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- GRANT PERMISSIONS (if needed)
-- ============================================================

-- Grant to application user (adjust username as needed)
-- GRANT ALL PRIVILEGES ON TABLE ai_analysis TO your_app_user;
-- GRANT ALL PRIVILEGES ON TABLE daily_insights TO your_app_user;
-- GRANT ALL PRIVILEGES ON TABLE ai_recommendations TO your_app_user;
-- GRANT ALL PRIVILEGES ON TABLE blockchain_logs TO your_app_user;

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================

-- Verify tables
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN ('sensor_readings', 'ai_analysis', 'daily_insights', 'ai_recommendations', 'blockchain_logs')
ORDER BY table_name;

-- Output success message
DO $$ 
BEGIN 
    RAISE NOTICE '✅ Migration 004 completed successfully!';
    RAISE NOTICE '📊 Tables created: ai_analysis, daily_insights (updated), ai_recommendations, blockchain_logs';
    RAISE NOTICE '🔍 Views created: v_latest_ai_analysis, v_daily_summary, v_pending_blockchain';
    RAISE NOTICE '⚡ Functions created: get_daily_stats()';
END $$;

