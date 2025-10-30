-- Migration 008: Create users table with multi-method authentication
-- Date: 2025-10-30
-- Purpose: Support both Passkey (biometric) and PIN-based authentication

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    
    -- Basic Information
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(255),
    
    -- Passkey Authentication (optional - for biometric)
    passkey_credential_id TEXT UNIQUE,
    passkey_public_key TEXT,
    passkey_counter INTEGER DEFAULT 0,
    passkey_transports TEXT[],
    passkey_created_at_vn TIMESTAMP,
    passkey_last_used_at_vn TIMESTAMP,
    
    -- PIN Authentication (optional - for simple auth)
    pin_hash VARCHAR(255),  -- bcrypt hash of PIN
    
    -- Blockchain Wallet
    wallet_address VARCHAR(42) UNIQUE,
    wallet_created_at_vn TIMESTAMP,
    
    -- Farm Information
    farm_name VARCHAR(255),
    farm_location_lat DECIMAL(10, 8),
    farm_location_lon DECIMAL(11, 8),
    farm_area_hectares DECIMAL(10, 2),
    current_crop VARCHAR(50),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps (Vietnam timezone)
    created_at_vn TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh'),
    updated_at_vn TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh'),
    last_login_at_vn TIMESTAMP,
    
    -- Constraints
    CONSTRAINT check_has_auth_method CHECK (
        passkey_credential_id IS NOT NULL OR pin_hash IS NOT NULL
    ),
    CONSTRAINT check_phone_format CHECK (phone ~ '^\+?[0-9]{10,15}$')
);

-- Indexes for performance
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_passkey_credential ON users(passkey_credential_id) WHERE passkey_credential_id IS NOT NULL;
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_users_created_at ON users(created_at_vn DESC);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = TRUE;

-- Comments
COMMENT ON TABLE users IS 'Users table with support for both Passkey and PIN authentication';
COMMENT ON COLUMN users.passkey_credential_id IS 'WebAuthn credential ID for biometric authentication';
COMMENT ON COLUMN users.pin_hash IS 'Bcrypt hash of 4-6 digit PIN for simple authentication';
COMMENT ON COLUMN users.wallet_address IS 'Ethereum-format blockchain wallet address';
COMMENT ON COLUMN users.current_crop IS 'Current crop being grown (coffee, rice, maize, etc.)';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Migration 008 completed: Created users table with multi-method authentication';
END $$;

