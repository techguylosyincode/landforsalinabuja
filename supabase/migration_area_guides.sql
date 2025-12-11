-- Add new columns for Advanced Area Guides
alter table districts 
add column if not exists infrastructure_rating jsonb default '{}'::jsonb,
add column if not exists title_type_common text,
add column if not exists avg_price_history jsonb default '[]'::jsonb,
add column if not exists pros text[] default '{}',
add column if not exists cons text[] default '{}',
add column if not exists landmarks text[] default '{}';

-- Example of infrastructure_rating structure:
-- {
--   "roads": "Good",
--   "electricity": "Average",
--   "water": "Poor"
-- }

-- Example of avg_price_history structure:
-- [
--   {"year": 2023, "price": 50000000},
--   {"year": 2024, "price": 65000000}
-- ]
