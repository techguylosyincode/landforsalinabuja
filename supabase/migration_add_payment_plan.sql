-- Add payment_plan column to properties table
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS payment_plan BOOLEAN DEFAULT false;

-- Update existing records based on features (optional but helpful)
UPDATE properties 
SET payment_plan = true 
WHERE features::text ILIKE '%payment plan%' 
   OR features::text ILIKE '%installment%';
