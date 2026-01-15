-- Fix RLS policies for lookup tables to allow public reads
-- These tables are reference data and should be readable by anyone

-- Locations table
ALTER TABLE IF EXISTS locations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to locations" ON locations;
CREATE POLICY "Allow public read access to locations" ON locations
  FOR SELECT USING (true);

-- Land types table
ALTER TABLE IF EXISTS land_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to land_types" ON land_types;
CREATE POLICY "Allow public read access to land_types" ON land_types
  FOR SELECT USING (true);

-- Estates table
ALTER TABLE IF EXISTS estates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to estates" ON estates;
CREATE POLICY "Allow public read access to estates" ON estates
  FOR SELECT USING (true);
