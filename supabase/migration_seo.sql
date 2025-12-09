-- Add SEO and Features columns to properties table
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS meta_title text,
ADD COLUMN IF NOT EXISTS meta_description text,
ADD COLUMN IF NOT EXISTS focus_keyword text,
ADD COLUMN IF NOT EXISTS features text[];

-- Create storage bucket for property images if it doesn't exist
-- Note: This might need to be run in the Supabase Dashboard Storage section if SQL creation is restricted
INSERT INTO storage.buckets (id, name, public) 
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to property-images
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'property-images' );

-- Allow authenticated agents to upload images
CREATE POLICY "Agents can upload images" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'property-images' AND auth.role() = 'authenticated' );

-- Allow agents to update/delete their own images
CREATE POLICY "Agents can update own images" 
ON storage.objects FOR UPDATE 
USING ( bucket_id = 'property-images' AND auth.uid() = owner );

CREATE POLICY "Agents can delete own images" 
ON storage.objects FOR DELETE 
USING ( bucket_id = 'property-images' AND auth.uid() = owner );
