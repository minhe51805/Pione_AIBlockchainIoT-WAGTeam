-- Migration 009: Add pin_hash column to existing users table
-- Date: 2025-10-30
-- Purpose: Add PIN authentication support to existing users

-- Add pin_hash column if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'pin_hash'
    ) THEN
        ALTER TABLE users ADD COLUMN pin_hash VARCHAR(255);
        RAISE NOTICE '✅ Added pin_hash column to users table';
    ELSE
        RAISE NOTICE 'ℹ️ pin_hash column already exists';
    END IF;
END $$;

-- Add comment
COMMENT ON COLUMN users.pin_hash IS 'Bcrypt hash of 4-6 digit PIN for simple authentication';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Migration 009 completed: PIN authentication support added';
END $$;

