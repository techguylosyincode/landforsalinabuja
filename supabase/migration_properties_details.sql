-- Add detailed fields to properties table
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS bedrooms numeric,
ADD COLUMN IF NOT EXISTS bathrooms numeric,
ADD COLUMN IF NOT EXISTS garages numeric,
ADD COLUMN IF NOT EXISTS features JSONB,
ADD COLUMN IF NOT EXISTS payment_plans JSONB;
