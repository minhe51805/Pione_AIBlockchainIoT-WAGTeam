-- Migration 005: Add recommendations column to daily_insights table
-- Date: 2025-10-28
-- Purpose: Store actionable recommendations from rule-based engine

-- Add recommendations column (TEXT to store JSON array)
ALTER TABLE daily_insights 
ADD COLUMN IF NOT EXISTS recommendations TEXT;

-- Add comment
COMMENT ON COLUMN daily_insights.recommendations IS 'JSON array of actionable recommendations with priority and message';

-- Verify
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'daily_insights' 
AND column_name = 'recommendations';

