-- Migration 006: Simplify daily_insights schema
-- Date: 2025-10-29
-- Purpose: Remove unused columns, keep only essential data

-- Drop existing table
DROP TABLE IF EXISTS daily_insights CASCADE;

-- Create simplified table
CREATE TABLE daily_insights (
    id SERIAL PRIMARY KEY,
    
    -- Date (unique constraint)
    date_vn DATE NOT NULL UNIQUE,
    
    -- Sample metadata
    total_readings INTEGER NOT NULL,
    
    -- Aggregated sensor data (11 params)
    soil_temperature_avg NUMERIC(5,2),
    soil_moisture_avg NUMERIC(5,2),
    conductivity_avg NUMERIC(7,2),
    ph_avg NUMERIC(4,2),
    nitrogen_avg INTEGER,
    phosphorus_avg INTEGER,
    potassium_avg INTEGER,
    salt_avg INTEGER,
    air_temperature_avg NUMERIC(5,2),
    air_humidity_avg NUMERIC(5,2),
    is_raining_majority BOOLEAN,
    
    -- AI Analysis Results
    recommended_crop VARCHAR(50),
    crop_confidence NUMERIC(5,4),
    soil_health_score NUMERIC(5,2),
    soil_health_rating VARCHAR(20),
    has_anomaly BOOLEAN DEFAULT FALSE,
    anomaly_score NUMERIC(10,6),
    
    -- Summary
    summary_status VARCHAR(50) NOT NULL,
    summary_text TEXT,
    
    -- Full AI result (JSON)
    ai_analysis_json JSONB,
    
    -- Actionable recommendations (JSON)
    recommendations_json JSONB,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_daily_insights_date ON daily_insights(date_vn);
CREATE INDEX idx_daily_insights_created ON daily_insights(created_at);
CREATE INDEX idx_daily_insights_summary_status ON daily_insights(summary_status);

-- Comments
COMMENT ON TABLE daily_insights IS 'Daily aggregated soil data with AI analysis (Simplified Schema)';
COMMENT ON COLUMN daily_insights.date_vn IS 'Date of analysis (Vietnam timezone)';
COMMENT ON COLUMN daily_insights.total_readings IS 'Number of sensor readings aggregated';
COMMENT ON COLUMN daily_insights.summary_status IS 'Status: ALERT, EXCELLENT, GOOD, NEEDS_ATTENTION';
COMMENT ON COLUMN daily_insights.ai_analysis_json IS 'Full AI analysis result as JSON';
COMMENT ON COLUMN daily_insights.recommendations_json IS 'Actionable recommendations as JSON array';

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_daily_insights_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_daily_insights_updated_at
    BEFORE UPDATE ON daily_insights
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_insights_updated_at();

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Migration 006 completed: daily_insights simplified to 29 columns';
END $$;

