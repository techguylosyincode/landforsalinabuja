-- Add payment tracking fields to profiles table
ALTER TABLE profiles ADD COLUMN payment_required BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN payment_completed_at TIMESTAMPTZ;

-- Grandfather existing users (set payment_required = false for users who already existed)
-- This ensures existing free users can keep using the platform
UPDATE profiles
SET payment_required = false,
    payment_completed_at = created_at
WHERE created_at < NOW()
  AND email_verified = true;

-- Make subscription_tier nullable to allow NULL for unpaid users
ALTER TABLE profiles ALTER COLUMN subscription_tier DROP DEFAULT;
