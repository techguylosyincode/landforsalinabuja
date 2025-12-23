-- Migration: Fix Storage Policies for Property Images
-- Purpose: Consolidate conflicting policies and ensure property-images bucket works correctly
-- Safe to run multiple times (idempotent)

-- Drop conflicting policies from migration_seo.sql
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Agents can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Agents can update own images" ON storage.objects;
DROP POLICY IF EXISTS "Agents can delete own images" ON storage.objects;

-- Create property-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create clean, uniquely-named policies for property-images
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage'
          AND tablename = 'objects'
          AND policyname = 'Property images are publicly readable'
    ) THEN
        CREATE POLICY "Property images are publicly readable"
            ON storage.objects FOR SELECT
            USING (bucket_id = 'property-images');
    END IF;
END;
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage'
          AND tablename = 'objects'
          AND policyname = 'Authenticated can manage property images'
    ) THEN
        CREATE POLICY "Authenticated can manage property images"
            ON storage.objects FOR ALL
            USING (
                bucket_id = 'property-images'
                AND auth.role() = 'authenticated'
            )
            WITH CHECK (
                bucket_id = 'property-images'
                AND auth.role() = 'authenticated'
            );
    END IF;
END;
$$;
