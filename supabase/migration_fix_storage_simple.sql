-- Migration: Fix Storage Policies (Simplified)
-- Drop conflicting policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Agents can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Agents can update own images" ON storage.objects;
DROP POLICY IF EXISTS "Agents can delete own images" ON storage.objects;

-- Create property-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY IF NOT EXISTS "Property images are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-images');

CREATE POLICY IF NOT EXISTS "Authenticated can upload property images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'property-images'
    AND auth.role() = 'authenticated'
);

CREATE POLICY IF NOT EXISTS "Authenticated can delete own property images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'property-images'
    AND auth.role() = 'authenticated'
);
