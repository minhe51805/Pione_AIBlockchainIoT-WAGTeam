-- Migration 010: Fix passkey columns to allow NULL
-- Date: 2025-10-30
-- Purpose: Allow users to register with PIN only (without Passkey)

-- Remove NOT NULL constraint from passkey_credential_id
ALTER TABLE users ALTER COLUMN passkey_credential_id DROP NOT NULL;

-- Remove NOT NULL constraint from passkey_public_key
ALTER TABLE users ALTER COLUMN passkey_public_key DROP NOT NULL;

-- Remove NOT NULL constraint from phone (make it optional)
ALTER TABLE users ALTER COLUMN phone DROP NOT NULL;

-- Make email optional too
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- Add CHECK constraint to ensure at least one auth method
-- First drop the old constraint if exists
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_has_auth_method;

-- Add new constraint
ALTER TABLE users ADD CONSTRAINT check_has_auth_method 
CHECK (passkey_credential_id IS NOT NULL OR pin_hash IS NOT NULL);

-- Add CHECK constraint to ensure at least email or phone exists
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_has_contact;
ALTER TABLE users ADD CONSTRAINT check_has_contact 
CHECK (email IS NOT NULL OR phone IS NOT NULL);

-- Comments
COMMENT ON COLUMN users.passkey_credential_id IS 'WebAuthn credential ID for biometric auth (optional if using PIN)';
COMMENT ON COLUMN users.passkey_public_key IS 'WebAuthn public key for biometric auth (optional if using PIN)';
COMMENT ON COLUMN users.pin_hash IS 'Bcrypt hash of PIN for simple auth (optional if using Passkey)';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Migration 010 completed: Fixed nullable constraints for multi-method auth';
END $$;

