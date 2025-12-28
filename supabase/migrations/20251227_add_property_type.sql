-- Add type column to properties table
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS type text CHECK (type IN ('residential', 'commercial', 'mixed', 'industrial', 'land', 'other')) DEFAULT 'residential';

-- Update existing records to default to residential
UPDATE properties SET type = 'residential' WHERE type IS NULL;
