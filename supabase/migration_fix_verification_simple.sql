-- Migration: Fix Verification Schema (Simplified)
-- Run this with correct permissions in Supabase

-- Add verification columns if they don't exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified',
ADD COLUMN IF NOT EXISTS verification_reason TEXT,
ADD COLUMN IF NOT EXISTS verification_submitted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cac_number TEXT,
ADD COLUMN IF NOT EXISTS id_type TEXT,
ADD COLUMN IF NOT EXISTS id_number TEXT,
ADD COLUMN IF NOT EXISTS proof_files TEXT[];

-- Backfill existing records
UPDATE public.profiles
SET verification_status = CASE
    WHEN is_verified = true THEN 'verified'
    ELSE 'unverified'
END
WHERE verification_status IS NULL;

-- Add CHECK constraint separately
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_verification_status_check
CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected'));

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_id_type_check
CHECK (id_type IN ('nin', 'passport', 'drivers_license', 'other'));

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status
ON public.profiles(verification_status)
WHERE verification_status IN ('pending', 'verified');

CREATE INDEX IF NOT EXISTS idx_profiles_verified
ON public.profiles(is_verified, verification_status);
