-- Add rich content fields to districts table
ALTER TABLE districts 
ADD COLUMN IF NOT EXISTS market_analysis JSONB,
ADD COLUMN IF NOT EXISTS why_invest TEXT[],
ADD COLUMN IF NOT EXISTS infrastructure TEXT[],
ADD COLUMN IF NOT EXISTS faqs JSONB;

-- Ensure slug exists (using name as slug for now if not present, but name is unique so we can use it)
-- We might want a dedicated slug column if names have spaces, but current names are like 'guzape', 'wuse-ii'.
-- Let's add a slug column just in case to be safe and consistent with other tables.
ALTER TABLE districts 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Policy to allow anyone to read districts (already exists but good to confirm)
-- create policy "Districts are viewable by everyone" on districts for select using (true);
