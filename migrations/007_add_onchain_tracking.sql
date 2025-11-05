-- Migration 007: Add blockchain tracking to daily_insights
-- Date: 2025-10-29
-- Purpose: Track blockchain push status for daily insights

-- Add onchain tracking columns
ALTER TABLE daily_insights 
ADD COLUMN blockchain_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN blockchain_tx_hash VARCHAR(66),
ADD COLUMN blockchain_pushed_at TIMESTAMP;

-- Add index for quick queries
CREATE INDEX idx_daily_insights_blockchain_status ON daily_insights(blockchain_status);

-- Comments
COMMENT ON COLUMN daily_insights.blockchain_status IS 'Blockchain push status: pending, confirmed, failed';
COMMENT ON COLUMN daily_insights.blockchain_tx_hash IS 'Transaction hash on blockchain';
COMMENT ON COLUMN daily_insights.blockchain_pushed_at IS 'Timestamp when pushed to blockchain';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Migration 007 completed: Added blockchain tracking to daily_insights';
END $$;

