-- Migration: Fix Verification Schema
-- Purpose: Add missing verification columns to profiles table that are referenced in app code
-- Safe to run multiple times (idempotent)

-- Add verification columns if they don't exist
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS verification_status TEXT CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')) DEFAULT 'unverified',
ADD COLUMN IF NOT EXISTS verification_reason TEXT,
ADD COLUMN IF NOT EXISTS verification_submitted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS cac_number TEXT,
ADD COLUMN IF NOT EXISTS id_type TEXT CHECK (id_type IN ('nin', 'passport', 'drivers_license', 'other')),
ADD COLUMN IF NOT EXISTS id_number TEXT,
ADD COLUMN IF NOT EXISTS proof_files TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Backfill existing records: sync verification_status with is_verified
UPDATE profiles
SET verification_status = CASE
    WHEN is_verified = true THEN 'verified'
    ELSE 'unverified'
END
WHERE verification_status IS NULL;

-- Create agent-verifications storage bucket for verification documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('agent-verifications', 'agent-verifications', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Storage policies for agent-verifications bucket
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage'
          AND tablename = 'objects'
          AND policyname = 'Admins can view agent verifications'
    ) THEN
        CREATE POLICY "Admins can view agent verifications"
            ON storage.objects FOR SELECT
            USING (
                bucket_id = 'agent-verifications'
                AND EXISTS (
                    SELECT 1 FROM public.profiles p
                    WHERE p.id = auth.uid() AND p.role = 'admin'
                )
            );
    END IF;
END;
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage'
          AND tablename = 'objects'
          AND policyname = 'Agents can upload verification documents'
    ) THEN
        CREATE POLICY "Agents can upload verification documents"
            ON storage.objects FOR INSERT
            WITH CHECK (
                bucket_id = 'agent-verifications'
                AND auth.role() = 'authenticated'
            );
    END IF;
END;
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage'
          AND tablename = 'objects'
          AND policyname = 'Agents can manage own verification documents'
    ) THEN
        CREATE POLICY "Agents can manage own verification documents"
            ON storage.objects FOR UPDATE
            USING (
                bucket_id = 'agent-verifications'
                AND auth.uid() = owner
            );
    END IF;
END;
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage'
          AND tablename = 'objects'
          AND policyname = 'Agents can delete own verification documents'
    ) THEN
        CREATE POLICY "Agents can delete own verification documents"
            ON storage.objects FOR DELETE
            USING (
                bucket_id = 'agent-verifications'
                AND auth.uid() = owner
            );
    END IF;
END;
$$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status
ON profiles(verification_status)
WHERE verification_status IN ('pending', 'verified');

CREATE INDEX IF NOT EXISTS idx_profiles_verified
ON profiles(is_verified, verification_status);
