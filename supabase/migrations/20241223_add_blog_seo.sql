-- Add SEO and content fields to blog_posts table
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS excerpt text,
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS category text DEFAULT 'Guide',
ADD COLUMN IF NOT EXISTS meta_title text,
ADD COLUMN IF NOT EXISTS meta_description text,
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Add views column to properties if not exists (for Phase 7 prep)
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS views integer DEFAULT 0;
